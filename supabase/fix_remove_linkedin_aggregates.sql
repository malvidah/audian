-- Remove LinkedIn daily aggregates and inflated CSV-imported LinkedIn posts
BEGIN;

-- 1. Delete LinkedIn daily aggregate rows
DELETE FROM posts
WHERE platform = 'linkedin'
  AND post_type = 'daily_aggregate';

-- 2. Delete LinkedIn posts seeded from CSV with inflated metrics
DELETE FROM posts
WHERE platform = 'linkedin'
  AND source = 'csv_import';

COMMIT;
