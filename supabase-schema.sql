-- Run this in your Supabase SQL editor

CREATE TABLE itineraries (
  id BIGSERIAL PRIMARY KEY,
  cache_key TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  lat FLOAT,
  lon FLOAT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  budget FLOAT NOT NULL,
  currency TEXT NOT NULL,
  group_size INTEGER NOT NULL,
  vibe JSONB NOT NULL DEFAULT '[]',
  pace TEXT NOT NULL,
  dietary JSONB DEFAULT '[]',
  must_see TEXT,
  hidden_gems_slider INTEGER NOT NULL DEFAULT 50,
  itinerary_json JSONB NOT NULL,
  hero_image_url TEXT,
  hero_image_credit TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE share_links (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  itinerary_id BIGINT NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rate_limits (
  id BIGSERIAL PRIMARY KEY,
  ip_address TEXT NOT NULL,
  date TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(ip_address, date)
);

-- Function used by the rate limiter
CREATE OR REPLACE FUNCTION increment_rate_limit(p_ip TEXT, p_date TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO rate_limits (ip_address, date, count)
  VALUES (p_ip, p_date, 1)
  ON CONFLICT (ip_address, date)
  DO UPDATE SET count = rate_limits.count + 1;
END;
$$ LANGUAGE plpgsql;
