-- Saved audience insight reports
-- Run this once in the Supabase SQL editor

create table if not exists audience_insights_saved (
  id          uuid        default gen_random_uuid() primary key,
  date_from   text,
  date_to     text,
  platforms   text        not null default '',   -- sorted comma-separated, e.g. "instagram,x"
  comment_count integer,
  insights    jsonb       not null,
  created_at  timestamptz default now()
);

create index if not exists idx_audience_insights_saved_filters
  on audience_insights_saved(date_from, date_to, platforms);
