-- Run this in Supabase SQL editor
-- Full schema for Audian

-- ── Platform connections (OAuth tokens per platform) ──────────────────────────
create table if not exists platform_connections (
  id               uuid default gen_random_uuid() primary key,
  platform         text unique not null,
  channel_id       text,
  channel_name     text,
  channel_thumbnail text,
  subscriber_count bigint,
  access_token     text,
  refresh_token    text,
  expires_at       timestamptz,
  connected_at     timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ── Platform metrics snapshots ────────────────────────────────────────────────
create table if not exists platform_metrics (
  id             uuid default gen_random_uuid() primary key,
  platform       text not null,
  snapshot_at    timestamptz default now(),
  followers      bigint,
  total_views    bigint,
  video_count    int,
  impressions        bigint,
  reach              bigint,
  unique_reach_rate  float,   -- reach / impressions (0–1); null until insights permission granted
  likes              bigint,
  shares             bigint,
  saves              bigint,
  comments_count     bigint,
  videos             jsonb,
  raw                jsonb
);

-- ── Platform comments (YouTube/X/Instagram comments) ─────────────────────────
create table if not exists platform_comments (
  id                  uuid default gen_random_uuid() primary key,
  platform            text not null,
  video_id            text,
  video_title         text,
  post_id             text,
  author_name         text,
  author_handle       text,
  author_channel_url  text,
  author_followers    bigint,
  content             text not null,
  likes               bigint default 0,
  reply_count         int default 0,
  quality_tag         text,  -- THOUGHTFUL, ENGAGED, SPAM
  zone                text,  -- GOLD, CORE, WATCH
  published_at        timestamptz,
  synced_at           timestamptz default now(),
  unique(platform, author_name, content)
);

-- ── Platform interactions (legacy sync table) ─────────────────────────────────
create table if not exists platform_interactions (
  id               uuid default gen_random_uuid() primary key,
  platform         text not null,
  handle           text,
  name             text,
  followers        bigint,
  bio              text,
  avatar_url       text,
  verified         boolean default false,
  interaction_type text,
  content          text,
  post_url         text,
  influence_score  int,
  audience_score   int,
  zone             text,
  interacted_at    timestamptz,
  synced_at        timestamptz default now()
);

-- ── Handles (people/orgs across all platforms) ───────────────────────────────
create table if not exists handles (
  id                  uuid default gen_random_uuid() primary key,
  name                text,
  bio                 text,
  zone                text default 'SIGNAL',
  followed_by         bigint,
  avatar_url          text,
  handle_instagram    text,
  handle_x            text,
  handle_youtube      text,
  handle_linkedin     text,
  followers_instagram bigint,
  followers_x         bigint,
  followers_youtube   bigint,
  followers_linkedin  bigint,
  verified_instagram  boolean default false,
  verified_x          boolean default false,
  verified_youtube    boolean default false,
  verified_linkedin   boolean default false,
  added_at            timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ── Interactions (individual engagements linked to a handle) ──────────────────
create table if not exists interactions (
  id               uuid default gen_random_uuid() primary key,
  handle_id        uuid references handles(id) on delete cascade,
  platform         text,
  interaction_type text,
  content          text,
  screenshot_id    uuid,
  interacted_at    timestamptz,
  synced_at        timestamptz default now()
);

-- ── Screenshots (uploaded images from the import flow) ────────────────────────
create table if not exists screenshots (
  id                uuid default gen_random_uuid() primary key,
  filename          text,
  thumbnail_url     text,
  thumbnail_data    text,
  platform          text,
  interaction_count int default 0,
  parsed_at         timestamptz default now()
);

-- ── Posts (individual post tracking across all platforms) ────────────────────
create table if not exists posts (
  id            uuid default gen_random_uuid() primary key,
  platform      text not null,
  post_id       text,
  content       text,
  permalink     text,
  published_at  timestamptz,
  likes         bigint default 0,
  comments      bigint default 0,
  impressions   bigint default 0,
  shares        bigint default 0,
  saves         bigint default 0,
  views         bigint default 0,
  post_type     text default 'post',   -- 'post', 'reel', 'video', 'story', 'daily_aggregate'
  thumbnail_url text,
  source        text default 'api',    -- 'api', 'csv_import', 'manual'
  synced_at     timestamptz default now(),
  unique(platform, post_id)
);

-- ── RLS policies (run this AFTER creating tables) ─────────────────────────────
-- Audian is a single-user tool — disable RLS on all tables so the browser
-- anon client can read data. The service role key is used for all writes.

alter table platform_connections   disable row level security;
alter table platform_metrics       disable row level security;
alter table platform_comments      disable row level security;
alter table platform_interactions  disable row level security;
alter table handles                disable row level security;
alter table interactions           disable row level security;
alter table screenshots            disable row level security;
alter table posts                  disable row level security;

-- If you prefer to keep RLS on, run these policies instead:
-- alter table platform_connections enable row level security;
-- create policy "anon_read" on platform_connections for select using (true);
-- create policy "anon_read" on handles for select using (true);
-- create policy "anon_read" on interactions for select using (true);
-- create policy "anon_read" on platform_metrics for select using (true);
