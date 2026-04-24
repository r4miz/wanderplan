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
  const daysList = days.map((d, i) => `  Day ${i + 1}: ${d}`).join("\n");
  const mustSeeBlock = mustSee ? `\nMust-see / must-do requests: ${mustSee}` : "";
  const paceRule =
    pace === "Packed" ? "2-3 activities per time block"
    : pace === "Balanced" ? "1-2 activities per time block"
    : "1 activity per time block, leisurely";

  const system = `You are an expert travel planner with deep local knowledge of destinations worldwide.
You create highly personalized, vivid, and practical day-by-day travel itineraries.
Your recommendations are specific (real place names), geographically logical, and adapted to the traveler's exact preferences.
You always respond with valid JSON only — no markdown code fences, no prose outside the JSON object.`;

  const user = `Create a complete ${numDays}-day travel itinerary for the following trip.

ACCOMMODATION:
  Address: ${params.address}
  City: ${geo.city}, ${geo.country}
  Coordinates: ${geo.lat}, ${geo.lon}

TRIP DETAILS:
  Dates:
${daysList}
  Total budget: ${currency} ${budget} for ${group_size} ${group_size === 1 ? "person" : "people"}
  Trip vibe: ${vibeStr}
  Pace: ${pace}
  Dietary restrictions: ${dietaryStr}
  Discovery style: ${gemsLabel}${mustSeeBlock}

WEATHER FORECAST:
${weatherText}

NEARBY VENUES:
${venuesText}

Return a single JSON object (no markdown, no code fences, raw JSON only):

{
  "destination_summary": "2-3 sentence evocative description",
  "total_budget_estimate": { "amount": <number>, "currency": "${currency}", "breakdown": "brief breakdown" },
  "days": [
    {
      "date": "YYYY-MM-DD",
      "day_number": 1,
      "theme": "evocative theme title",
      "weather_note": "one sentence about weather",
      "daily_budget": { "food": <number>, "activities": <number>, "transport": <number>, "total": <number> },
      "morning": {
        "time_range": "8:00 AM – 12:00 PM",
        "activities": [{
          "name": "Place name",
          "type": "restaurant | attraction | neighborhood | activity",
          "description": "2-3 sentence description",
          "why_youll_love_this": "one reason tailored to trip vibe",
          "approx_cost_per_person": <number>,
          "distance_from_accommodation": "e.g. 1.2 km",
          "travel_time_from_accommodation": "e.g. 15 min walk",
          "affiliate_category": "restaurant | attraction | null",
          "signature_dish": "dish name or null",
          "indoor_alternative": "alternative if rainy or null",
          "lat": <number or null>,
          "lon": <number or null>
        }]
      },
      "afternoon": { "time_range": "...", "activities": [{ <same structure> }] },
      "evening": { "time_range": "...", "activities": [{ <same structure> }] },
      "spontaneous_hour": { "neighborhood": "name", "suggestion": "1-2 sentences" },
      "iconic_food_moment": { "name": "restaurant name", "dish": "signature dish", "why": "one sentence" }
    }
  ]
}

RULES:
- Every activity must be a real named place
- Cluster stops geographically
- Pace '${pace}': ${paceRule}
- Keep costs realistic for ${geo.city}
- Each day must have exactly one spontaneous_hour and one iconic_food_moment
- Include lat/lon for activities when you know them`;

  return { system, user };
}

export async function generateItinerary(params: any, geo: any, weatherText: string, venuesText: string) {
  const { system, user } = buildPrompt(params, geo, weatherText, venuesText);

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.7,
    max_tokens: 32768,
  });

  let raw = completion.choices[0].message.content?.trim() || "";

  if (raw.startsWith("```")) {
    raw = raw.split("```")[1];
    if (raw.startsWith("json")) raw = raw.slice(4);
    raw = raw.trim();
  }

  return JSON.parse(raw);
}
