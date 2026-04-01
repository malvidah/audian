BEGIN;
-- Remove @ prefix from author_handle in youtube comments
UPDATE platform_comments
SET author_handle = REPLACE(author_handle, '@', '')
WHERE platform = 'youtube' AND author_handle LIKE '@%';
COMMIT;
