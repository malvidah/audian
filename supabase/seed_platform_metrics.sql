-- ─── Platform Metrics Seed — March 31, 2026 ──────────────────────────────────
-- Run this in the Supabase SQL editor AFTER running schema.sql.
-- Sources: YouTube Studio, X Analytics, LinkedIn Analytics screenshots.
--
-- Each INSERT is guarded to avoid duplicates (no unique constraint exists on
-- platform + snapshot_at, so we use a WHERE NOT EXISTS check).
-- ─────────────────────────────────────────────────────────────────────────────

BEGIN;

-- ── YouTube — March 31, 2026 ────────────────────────────────────────────────
-- Source: YouTube Studio channel analytics (last 28 days)
-- Subscribers: 8,648,307 (+77,274 in 28d)
-- Views: 11.6M | Watch time: 1.6M hrs | Revenue: $71,517.65
INSERT INTO platform_metrics (
  platform, snapshot_at, followers, total_views, impressions,
  likes, shares, comments_count, videos, raw
)
SELECT
  'youtube',
  '2026-03-31T00:00:00Z',
  8648307,
  11600000,
  11600000,
  NULL,
  NULL,
  NULL,
  '[
    {"title": "Modern physics is forcing us to rethink e...", "views": 204900},
    {"title": "1177 BC: The vanishing of the first globa...", "views": 65400},
    {"title": "Quantum entanglement and the illusion...", "views": 46700}
  ]'::jsonb,
  '{"watch_time_hours": 1600000, "revenue": 71517.65, "subscriber_gain_28d": 77274}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM platform_metrics
  WHERE platform = 'youtube' AND snapshot_at::date = '2026-03-31'
);

-- ── X (Twitter) — March 31, 2026 ────────────────────────────────────────────
-- Source: X Analytics dashboard (last 28 days)
-- Followers: 193,600 (8,500 verified)
-- Impressions: 4.4M | Engagements: 153.8K (3.4% rate)
INSERT INTO platform_metrics (
  platform, snapshot_at, followers, total_views, impressions,
  likes, shares, comments_count, raw
)
SELECT
  'x',
  '2026-03-31T00:00:00Z',
  193600,
  NULL,
  4400000,
  37600,
  8300,
  1400,
  '{
    "verified_followers": 8500,
    "engagements": 153800,
    "engagement_rate": 3.4,
    "profile_visits": 16100,
    "reposts": 8300,
    "bookmarks": 29900,
    "shares": 6300
  }'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM platform_metrics
  WHERE platform = 'x' AND snapshot_at::date = '2026-03-31'
);

-- ── LinkedIn — March 31, 2026 ───────────────────────────────────────────────
-- Source: LinkedIn Analytics (Mar 1–30, 2026)
-- Followers: 46,781 (+339 in 30d, down 32.6% vs prior period)
INSERT INTO platform_metrics (
  platform, snapshot_at, followers, total_views, impressions,
  likes, shares, comments_count, raw
)
SELECT
  'linkedin',
  '2026-03-31T00:00:00Z',
  46781,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"new_followers_30d": 339, "follower_growth_pct": -32.6}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM platform_metrics
  WHERE platform = 'linkedin' AND snapshot_at::date = '2026-03-31'
);

COMMIT;
