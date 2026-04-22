import crypto from "crypto";
import { supabase } from "./supabase";

export function buildCacheKey(params: any): string {
  const keyData = {
    address: params.address.trim().toLowerCase(),
    start_date: params.start_date,
    end_date: params.end_date,
    budget: params.budget,
    currency: params.currency,
    group_size: params.group_size,
    vibe: [...(params.vibe || [])].sort(),
    pace: params.pace,
    dietary: [...(params.dietary || [])].sort(),
    must_see: (params.must_see || "").trim().toLowerCase(),
    hidden_gems_slider: params.hidden_gems_slider ?? 50,
  };
  return crypto.createHash("sha256").update(JSON.stringify(keyData)).digest("hex");
}

export async function getCachedItinerary(cacheKey: string) {
  const { data } = await supabase
    .from("itineraries")
    .select("id, itinerary_json, hero_image_url, hero_image_credit")
    .eq("cache_key", cacheKey)
    .single();
  return data || null;
}
