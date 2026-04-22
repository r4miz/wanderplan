export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { geocodeAddress } from "@/lib/geocoding";
import { getWeatherForecast, formatWeatherForPrompt } from "@/lib/weather";
import { getNearbyVenues, formatVenuesForPrompt } from "@/lib/foursquare";
import { getDestinationHero } from "@/lib/unsplash";
import { generateItinerary } from "@/lib/anthropic";
import { buildCacheKey, getCachedItinerary } from "@/lib/cache";
import { checkRateLimit, incrementRateLimit } from "@/lib/rateLimit";

function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  const required = ["address", "start_date", "end_date", "budget", "currency", "group_size", "pace"];
  const missing = required.filter(f => !data[f]);
  if (missing.length) {
    return NextResponse.json({ error: `Missing required fields: ${missing.join(", ")}` }, { status: 400 });
  }

  const params = {
    address: data.address,
    start_date: data.start_date,
    end_date: data.end_date,
    budget: parseFloat(data.budget),
    currency: data.currency,
    group_size: parseInt(data.group_size, 10),
    vibe: data.vibe || ["Balanced"],
    pace: data.pace,
    dietary: data.dietary || [],
    must_see: data.must_see || "",
    hidden_gems_slider: parseInt(data.hidden_gems_slider ?? 50, 10),
  };

  const ip = getClientIp(req);
  const { allowed, remaining } = await checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Daily generation limit reached (5 per day). Come back tomorrow!", remaining: 0 },
      { status: 429 }
    );
  }

  // Cache check
  const cacheKey = buildCacheKey(params);
  const cached = await getCachedItinerary(cacheKey);
  if (cached) {
    const { data: shareRow } = await supabase
      .from("share_links")
      .select("slug")
      .eq("itinerary_id", cached.id)
      .single();
    return NextResponse.json({
      id: cached.id,
      itinerary: cached.itinerary_json,
      hero_image_url: cached.hero_image_url,
      hero_image_credit: cached.hero_image_credit,
      cached: true,
      remaining_generations: remaining,
      share_slug: shareRow?.slug || null,
    });
  }

  // Geocode
  let geo;
  try {
    geo = await geocodeAddress(params.address);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }

  // Fetch supporting data in parallel
  const [weatherByDay, venues, hero] = await Promise.all([
    getWeatherForecast(geo.lat, geo.lon),
    getNearbyVenues(geo.lat, geo.lon),
    getDestinationHero(geo.city, geo.country),
  ]);

  const weatherText = formatWeatherForPrompt(weatherByDay);
  const venuesText = formatVenuesForPrompt(venues);

  // Generate via Claude
  let itineraryData;
  try {
    itineraryData = await generateItinerary(params, geo, weatherText, venuesText);
  } catch (e: any) {
    return NextResponse.json({ error: `Itinerary generation failed: ${e.message}` }, { status: 500 });
  }

  // Attach weather to each day
  for (const day of itineraryData.days || []) {
    day.weather = weatherByDay[day.date] || {};
  }

  // Save to Supabase
  await incrementRateLimit(ip);
  const { data: saved, error: saveError } = await supabase
    .from("itineraries")
    .insert({
      cache_key: cacheKey,
      address: params.address,
      city: geo.city,
      lat: geo.lat,
      lon: geo.lon,
      start_date: params.start_date,
      end_date: params.end_date,
      budget: params.budget,
      currency: params.currency,
      group_size: params.group_size,
      vibe: params.vibe,
      pace: params.pace,
      dietary: params.dietary,
      must_see: params.must_see,
      hidden_gems_slider: params.hidden_gems_slider,
      itinerary_json: itineraryData,
      hero_image_url: hero?.url || null,
      hero_image_credit: hero?.credit_name || null,
    })
    .select("id")
    .single();

  if (saveError) {
    return NextResponse.json({ error: "Failed to save itinerary" }, { status: 500 });
  }

  return NextResponse.json({
    id: saved.id,
    itinerary: itineraryData,
    hero_image_url: hero?.url || null,
    hero_image_credit: hero?.credit_name || null,
    cached: false,
    remaining_generations: remaining - 1,
    share_slug: null,
  });
}
