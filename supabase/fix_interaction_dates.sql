-- Fix interaction dates for Instagram batch records (verified mentions screenshots)
--
-- The 3 seed files (seed_interactions_batch_*.sql) inserted ~190 interaction records
-- with dates calculated as if the screenshots were taken on 2026-01-20, but they were
-- actually taken on 2026-03-31. This migration corrects those dates.
--
-- The original seed_interactions_jan.sql also used '2026-01-15' and '2026-01-14' for
-- 21 elite mention records -- those are intentionally correct and must NOT be updated.
-- We distinguish batch records by excluding content = 'Wild elite mention on Instagram'
-- and content = 'Wild elite mention on X'.

BEGIN;

-- '2026-01-20' -> '2026-03-31' (was "Today" / hours ago)
UPDATE interactions
SET interacted_at = '2026-03-31'
WHERE interacted_at = '2026-01-20'
  AND platform = 'instagram'
  AND content NOT IN ('Wild elite mention on Instagram', 'Wild elite mention on X');

-- '2026-01-19' -> '2026-03-30' (was "Yesterday" / 1d ago)
UPDATE interactions
SET interacted_at = '2026-03-30'
WHERE interacted_at = '2026-01-19'
  AND platform = 'instagram'
  AND content NOT IN ('Wild elite mention on Instagram', 'Wild elite mention on X');

-- '2026-01-18' -> '2026-03-29' (was 2d ago)
UPDATE interactions
SET interacted_at = '2026-03-29'
WHERE interacted_at = '2026-01-18'
  AND platform = 'instagram'
  AND content NOT IN ('Wild elite mention on Instagram', 'Wild elite mention on X');

-- '2026-01-17' -> '2026-03-28' (was 3d ago)
UPDATE interactions
SET interacted_at = '2026-03-28'
WHERE interacted_at = '2026-01-17'
  AND platform = 'instagram'
  AND content NOT IN ('Wild elite mention on Instagram', 'Wild elite mention on X');

-- '2026-01-16' -> '2026-03-27' (was 4d ago)
UPDATE interactions
SET interacted_at = '2026-03-27'
WHERE interacted_at = '2026-01-16'
  AND platform = 'instagram'
  AND content NOT IN ('Wild elite mention on Instagram', 'Wild elite mention on X');

-- '2026-01-15' -> '2026-03-26' (was 5d ago)
-- NOTE: excludes the original 21 elite mention records from seed_interactions_jan.sql
UPDATE interactions
SET interacted_at = '2026-03-26'
WHERE interacted_at = '2026-01-15'
  AND platform = 'instagram'
  AND content NOT IN ('Wild elite mention on Instagram', 'Wild elite mention on X');

-- '2026-01-14' -> '2026-03-25' (was 6d ago)
-- NOTE: excludes the original 8 Instagram elite mentions from seed_interactions_jan.sql
UPDATE interactions
SET interacted_at = '2026-03-25'
WHERE interacted_at = '2026-01-14'
  AND platform = 'instagram'
  AND content NOT IN ('Wild elite mention on Instagram', 'Wild elite mention on X');

-- '2026-01-13' -> '2026-03-24' (was 1w ago)
UPDATE interactions
SET interacted_at = '2026-03-24'
WHERE interacted_at = '2026-01-13'
  AND platform = 'instagram'
  AND content NOT IN ('Wild elite mention on Instagram', 'Wild elite mention on X');

COMMIT;

-- Verify: count interactions by corrected date to confirm rows were updated
SELECT interacted_at, COUNT(*) as record_count
FROM interactions
WHERE platform = 'instagram'
  AND interacted_at BETWEEN '2026-03-24' AND '2026-03-31'
GROUP BY interacted_at
ORDER BY interacted_at;
