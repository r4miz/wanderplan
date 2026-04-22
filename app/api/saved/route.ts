import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("itineraries")
    .select("id, address, city, start_date, end_date, budget, currency, group_size, vibe, pace, hero_image_url, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Failed to load itineraries" }, { status: 500 });
  return NextResponse.json(data || []);
}
