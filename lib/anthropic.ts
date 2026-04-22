import Anthropic from "@anthropic-ai/sdk";
import { dateRange, hiddenGemsLabel } from "./helpers";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
    pace === "Packed"
      ? "2-3 activities per time block"
      : pace === "Balanced"
      ? "1-2 activities per time block"
      : "1 activity per time block, leisurely";

  const system = `You are an expert travel planner with deep local knowledge of destinations worldwide.
You create highly personalized, vivid, and practical day-by-day travel itineraries.
Your recommendations are specific (real place names), geographically logical (stops clustered by area),
and adapted to the traveler's exact preferences. You always respond with valid JSON only — no prose outside the JSON.`;

  const user = `Create a complete ${numDays}-day travel itinerary for the following trip.

ACCOMMODATION (geographic anchor for all distances):
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

NEARBY VENUES (use these as inspiration — you may suggest others too):
${venuesText}

OUTPUT FORMAT:
Return a single JSON object with this exact structure (no markdown, no prose outside JSON):

{
  "destination_summary": "2-3 sentence evocative description of the destination",
  "total_budget_estimate": {
    "amount": <number>,
    "currency": "${currency}",
    "breakdown": "brief text breakdown across categories"
  },
  "days": [
    {
      "date": "YYYY-MM-DD",
      "day_number": 1,
      "theme": "One evocative theme title for the day",
      "weather_note": "One sentence about the day's weather and any relevant advice",
      "daily_budget": {
        "food": <number in ${currency}>,
        "activities": <number in ${currency}>,
        "transport": <number in ${currency}>,
        "total": <number in ${currency}>
      },
      "morning": {
        "time_range": "e.g. 8:00 AM – 12:00 PM",
        "activities": [
          {
            "name": "Place or activity name",
            "type": "restaurant | attraction | neighborhood | activity",
            "description": "2-3 sentence vivid description",
            "why_youll_love_this": "One specific, personal reason tailored to the trip vibe",
            "approx_cost_per_person": <number in ${currency}>,
            "distance_from_accommodation": "e.g. 1.2 km",
            "travel_time_from_accommodation": "e.g. 15 min walk",
            "affiliate_category": "restaurant | attraction | null",
            "signature_dish": "Name of signature dish if restaurant, else null",
            "indoor_alternative": "Alternative if rainy, or null if indoor already",
            "lat": <latitude number or null>,
            "lon": <longitude number or null>
          }
        ]
      },
      "afternoon": { "time_range": "...", "activities": [ { <same structure> } ] },
      "evening": { "time_range": "...", "activities": [ { <same structure> } ] },
      "spontaneous_hour": {
        "neighborhood": "Neighborhood name",
        "suggestion": "1-2 sentences on what to do with no fixed plan"
      },
      "iconic_food_moment": {
        "name": "Restaurant or food stall name",
        "dish": "The exact signature dish to order",
        "why": "One sentence on why this dish defines the destination"
      }
    }
  ]
}

RULES:
- Every activity must be a real, named place (not generic)
- Cluster stops geographically so travel between them is minimal
- For rainy days (rain probability > 30%), include indoor_alternative for all outdoor activities
- Pace '${pace}': ${paceRule}
- Keep costs realistic for ${geo.city}
- Each day must have exactly one spontaneous_hour and one iconic_food_moment
- The iconic_food_moment should feature a dish unique or famous to ${geo.city}
- Include lat/lon coordinates for activities whenever you know them`;

  return { system, user };
}

export async function generateItinerary(params: any, geo: any, weatherText: string, venuesText: string) {
  const { system, user } = buildPrompt(params, geo, weatherText, venuesText);

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 8192,
    system,
    messages: [{ role: "user", content: user }],
  });

  let raw = (message.content[0] as any).text.trim();
  if (raw.startsWith("```")) {
    raw = raw.split("```")[1];
    if (raw.startsWith("json")) raw = raw.slice(4);
    raw = raw.trim();
  }
  return JSON.parse(raw);
}
