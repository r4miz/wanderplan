import Groq from "groq-sdk";
import { dateRange, hiddenGemsLabel } from "./helpers";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function buildPrompt(params: any, geo: any, weatherText: string, venuesText: string) {
  const days = dateRange(params.start_date, params.end_date);
  const numDays = days.length;
  const vibeStr = (params.vibe || ["Balanced"]).join(", ");
  const dietaryStr = (params.dietary || []).join(", ") || "none";
  const gemsLabel = hiddenGemsLabel(params.hidden_gems_slider ?? 50);
  const { currency, budget, group_size, pace } = params;
  const mustSee = (params.must_see || "").trim();
  const daysList = days.map((d, i) => `Day ${i + 1}: ${d}`).join(", ");
  const paceRule = pace === "Packed" ? "2-3 activities/block" : pace === "Balanced" ? "1-2 activities/block" : "1 activity/block";

  const system = `You are an expert travel planner. Respond with valid JSON only — no markdown, no code fences, raw JSON object only.`;

  const user = `Create a ${numDays}-day itinerary for: ${geo.city}, ${geo.country}
Accommodation: ${params.address} (${geo.lat}, ${geo.lon})
Dates: ${daysList}
Budget: ${currency} ${budget} for ${group_size} people | Pace: ${pace} (${paceRule}) | Vibe: ${vibeStr} | Dietary: ${dietaryStr} | Style: ${gemsLabel}${mustSee ? ` | Must-see: ${mustSee}` : ""}
Weather: ${weatherText}
Nearby: ${venuesText}

Return this exact JSON structure:
{"destination_summary":"string","days":[{"date":"YYYY-MM-DD","day_number":1,"theme":"string","weather_note":"string","daily_budget":{"food":0,"activities":0,"transport":0,"total":0},"morning":{"time_range":"string","activities":[{"name":"string","type":"restaurant|attraction|activity","description":"string","why_youll_love_this":"string","approx_cost_per_person":0,"distance_from_accommodation":"string","travel_time_from_accommodation":"string","affiliate_category":"restaurant|attraction|null","signature_dish":"string|null","indoor_alternative":"string|null","lat":0,"lon":0}]},"afternoon":{"time_range":"string","activities":[]},"evening":{"time_range":"string","activities":[]},"spontaneous_hour":{"neighborhood":"string","suggestion":"string"},"iconic_food_moment":{"name":"string","dish":"string","why":"string"}}]}

Rules: real place names only, cluster stops geographically, costs realistic for ${geo.city}, each day needs spontaneous_hour and iconic_food_moment, include lat/lon when known.`;

  return { system, user };
}

export async function generateItinerary(params: any, geo: any, weatherText: string, venuesText: string) {
  const { system, user } = buildPrompt(params, geo, weatherText, venuesText);

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.7,
    max_tokens: 8000,
  });

  let raw = completion.choices[0].message.content?.trim() || "";

  if (raw.startsWith("```")) {
    raw = raw.split("```")[1];
    if (raw.startsWith("json")) raw = raw.slice(4);
    raw = raw.trim();
  }

  return JSON.parse(raw);
}
