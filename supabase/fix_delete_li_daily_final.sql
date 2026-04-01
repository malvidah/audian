-- Clean up old LinkedIn daily aggregate posts created by the CSV import flow.
-- The correct LinkedIn data now comes from Buffer export seed files.
BEGIN;
DELETE FROM posts WHERE post_id LIKE 'li_daily_%';
DELETE FROM posts WHERE platform = 'linkedin' AND source = 'csv_import';
DELETE FROM posts WHERE platform = 'linkedin' AND post_type = 'daily_aggregate';
COMMIT;
