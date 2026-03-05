-- Run this in Supabase SQL editor

create table if not exists platform_connections (
  id uuid default gen_random_uuid() primary key,
  platform text unique not null,
  channel_id text,
  channel_name text,
  channel_thumbnail text,
  subscriber_count bigint,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  connected_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists platform_metrics (
  id uuid default gen_random_uuid() primary key,
  platform text not null,
  snapshot_at timestamptz default now(),
  followers bigint,
  total_views bigint,
  video_count int,
  impressions bigint,
  reach bigint,
  likes bigint,
  shares bigint,
  saves bigint,
  comments_count bigint,
  videos jsonb,
  raw jsonb
);

create table if not exists platform_comments (
  id uuid default gen_random_uuid() primary key,
  platform text not null,
  video_id text,
  video_title text,
  post_id text,
  author_name text,
  author_handle text,
  author_channel_url text,
  author_followers bigint,
  content text not null,
  likes bigint default 0,
  reply_count int default 0,
  quality_tag text, -- THOUGHTFUL, ENGAGED, SPAM
  zone text, -- GOLD, CORE, WATCH
  published_at timestamptz,
  synced_at timestamptz default now(),
  unique(platform, author_name, content)
);

create table if not exists platform_interactions (
  id uuid default gen_random_uuid() primary key,
  platform text not null,
  handle text,
  name text,
  followers bigint,
  bio text,
  avatar_url text,
  verified boolean default false,
  interaction_type text, -- quote, share, comment, reply, mention
  content text,
  post_url text,
  influence_score int,
  audience_score int,
  zone text, -- GOLD, CORE, WATCH
  interacted_at timestamptz,
  synced_at timestamptz default now()
);