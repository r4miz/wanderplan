import { supabase } from "./supabase";

const DAILY_LIMIT = 5;

export async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("rate_limits")
    .select("count")
    .eq("ip_address", ip)
    .eq("date", today)
    .single();

  const count = data?.count ?? 0;
  return { allowed: count < DAILY_LIMIT, remaining: Math.max(0, DAILY_LIMIT - count) };
}

export async function incrementRateLimit(ip: string) {
  const today = new Date().toISOString().slice(0, 10);
  await supabase.rpc("increment_rate_limit", { p_ip: ip, p_date: today });
}
