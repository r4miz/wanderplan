import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: shareRow } = await supabase
    .from("share_links")
    .select("itinerary_id")
    .eq("slug", slug)
    .single();

  if (!shareRow) return NextResponse.json({ error: "Shared itinerary not found" }, { status: 404 });

  const { data } = await supabase
    .from("itineraries")
    .select("*")
    .eq("id", shareRow.itinerary_id)
    .single();

  if (!data) return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug: itineraryId } = await params;

  // Check if itinerary exists
  const { data: existing } = await supabase
    .from("itineraries")
    .select("id")
    .eq("id", itineraryId)
    .single();

  if (!existing) return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });

  // Return existing slug if one exists
  const { data: existingShare } = await supabase
    .from("share_links")
    .select("slug")
    .eq("itinerary_id", itineraryId)
    .single();

  if (existingShare) {
    return NextResponse.json({ slug: existingShare.slug, url: `/share/${existingShare.slug}` });
  }

  const slug = crypto.randomBytes(6).toString("base64url");
  await supabase.from("share_links").insert({ slug, itinerary_id: itineraryId });
  return NextResponse.json({ slug, url: `/share/${slug}` });
}
