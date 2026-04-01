-- Seed file: Elite LinkedIn mention — Sven Nyholm
-- Professor of the Ethics of AI at LMU München
-- Post date: ~2026-03-01 (shown as "1mo" ago from ~April 1 screenshot)
-- Post: https://www.linkedin.com/feed/update/urn:li:activity:7433152847896297472/
-- 180 reactions, 7 comments, 20 reposts

BEGIN;

-- Ensure unique constraint on handles.name exists (required for ON CONFLICT)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'handles_name_key'
  ) THEN
    ALTER TABLE handles ADD CONSTRAINT handles_name_key UNIQUE (name);
  END IF;
END $$;

-- ============================================================================
-- LINKEDIN ELITE MENTION — Sven Nyholm (Professor, AI Ethics)
-- ============================================================================

INSERT INTO handles (name, bio, zone, handle_linkedin, verified_linkedin)
VALUES (
  'Sven Nyholm',
  'Professor of the Ethics of AI at LMU München. Author of The Ethics of Artificial Intelligence: A Philosophical Introduction.',
  'ELITE',
  'sven-nyholm',
  true
)
ON CONFLICT (name) DO UPDATE SET
  bio = EXCLUDED.bio,
  zone = EXCLUDED.zone,
  handle_linkedin = EXCLUDED.handle_linkedin,
  verified_linkedin = EXCLUDED.verified_linkedin;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'linkedin', 'mention',
  '"The hidden cost of letting AI make your life easier. Philosopher Sven Nyholm on reclaiming achievement from the machines." - Many thanks to Shai Tubali, Ph.D. for this great article in Big Think. The article is based on an interview w/ me about some ideas from my new book - *The Ethics of Artificial Intelligence: A Philosophical Introduction* - that will be published in March.',
  '2026-03-01', now()
FROM handles WHERE name = 'Sven Nyholm'
ON CONFLICT DO NOTHING;

COMMIT;
