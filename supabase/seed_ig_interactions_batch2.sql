-- Seed file: Instagram Interactions Batch 2 — January 17-19, 2026
-- Extracted from 6 notification screenshots on 2026-03-31
-- Timestamps relative to Jan 20: 1d = Jan 19, 2d = Jan 18, 3d = Jan 17
-- Account: @bigthinkers

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
-- SCREENSHOT 1 — 1d interactions (Jan 19, 2026)
-- ============================================================================

-- 1. manuelabenaim (verified) — liked your post
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('manuelabenaim', 'manuelabenaim', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your post', '2026-01-19', now()
FROM handles WHERE name = 'manuelabenaim'
ON CONFLICT DO NOTHING;

-- 2. cristianmitrea01 (verified) — reposted your reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('cristianmitrea01', 'cristianmitrea01', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'repost', 'reposted your reel', '2026-01-19', now()
FROM handles WHERE name = 'cristianmitrea01'
ON CONFLICT DO NOTHING;

-- 3. chlemart (verified) — started following you from your reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('chlemart', 'chlemart', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-19', now()
FROM handles WHERE name = 'chlemart'
ON CONFLICT DO NOTHING;

-- 4. mangolanguages (verified) — started following you
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('mangolanguages', 'mangolanguages', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-01-19', now()
FROM handles WHERE name = 'mangolanguages'
ON CONFLICT DO NOTHING;

-- 5. francescapsychology (verified) — commented: messaged you!
-- (Appears multiple times with same comment — deduped to one comment record)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('francescapsychology', 'francescapsychology', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'comment', 'messaged you!', '2026-01-19', now()
FROM handles WHERE name = 'francescapsychology'
ON CONFLICT DO NOTHING;

-- 6. underground.mama (verified) — started following you from your reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('underground.mama', 'underground.mama', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-19', now()
FROM handles WHERE name = 'underground.mama'
ON CONFLICT DO NOTHING;

-- 7. tecnoetica (not verified) — reposted your reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('tecnoetica', 'tecnoetica', false)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'repost', 'reposted your reel', '2026-01-19', now()
FROM handles WHERE name = 'tecnoetica'
ON CONFLICT DO NOTHING;

-- 8. kalisa_augustine (verified) — started following you from your reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('kalisa_augustine', 'kalisa_augustine', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-19', now()
FROM handles WHERE name = 'kalisa_augustine'
ON CONFLICT DO NOTHING;

-- 9. pamgonegreenofficial (verified) — liked your reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('pamgonegreenofficial', 'pamgonegreenofficial', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your reel', '2026-01-19', now()
FROM handles WHERE name = 'pamgonegreenofficial'
ON CONFLICT DO NOTHING;

-- 10. thestylearchivist (verified) — liked your reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('thestylearchivist', 'thestylearchivist', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your reel', '2026-01-19', now()
FROM handles WHERE name = 'thestylearchivist'
ON CONFLICT DO NOTHING;

-- 11. dannylsc_9 (verified) — started following you from your reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('dannylsc_9', 'dannylsc_9', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-19', now()
FROM handles WHERE name = 'dannylsc_9'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SCREENSHOT 2 — 1d interactions (Jan 19, 2026) continued
-- ============================================================================

-- 12. abookishseason (verified) — started following you
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('abookishseason', 'abookishseason', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-01-19', now()
FROM handles WHERE name = 'abookishseason'
ON CONFLICT DO NOTHING;

-- 13. danydigiacomo (verified) — started following you from your reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('danydigiacomo', 'danydigiacomo', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-19', now()
FROM handles WHERE name = 'danydigiacomo'
ON CONFLICT DO NOTHING;

-- (francescapsychology comment "messaged you!" 1d — already recorded above, skipping duplicate)

-- 14. kirstinwhiteweddings (verified) — started following you from your reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('kirstinwhiteweddings', 'kirstinwhiteweddings', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-19', now()
FROM handles WHERE name = 'kirstinwhiteweddings'
ON CONFLICT DO NOTHING;

-- 15. w_matt_tinch_esq (verified) — started following you from your reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('w_matt_tinch_esq', 'w_matt_tinch_esq', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-19', now()
FROM handles WHERE name = 'w_matt_tinch_esq'
ON CONFLICT DO NOTHING;

-- 16. goddessofslots (verified) — commented: Agreed
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('goddessofslots', 'goddessofslots', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'comment', 'Agreed', '2026-01-19', now()
FROM handles WHERE name = 'goddessofslots'
ON CONFLICT DO NOTHING;

-- 17. instachrisjg (verified) — started following you from your reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('instachrisjg', 'instachrisjg', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-19', now()
FROM handles WHERE name = 'instachrisjg'
ON CONFLICT DO NOTHING;

-- 18. faerneth (verified) — started following you
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('faerneth', 'faerneth', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-01-19', now()
FROM handles WHERE name = 'faerneth'
ON CONFLICT DO NOTHING;

-- 19. jodi.duval (verified) — started following you from your reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('jodi.duval', 'jodi.duval', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-19', now()
FROM handles WHERE name = 'jodi.duval'
ON CONFLICT DO NOTHING;

-- 20. zidancode (verified) — started following you
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('zidancode', 'zidancode', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-01-19', now()
FROM handles WHERE name = 'zidancode'
ON CONFLICT DO NOTHING;

-- 21. its.zarstxr (not verified) — reposted your post
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('its.zarstxr', 'its.zarstxr', false)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'repost', 'reposted your post', '2026-01-19', now()
FROM handles WHERE name = 'its.zarstxr'
ON CONFLICT DO NOTHING;

-- (francescapsychology comment "sent!" 1d — deduped, already have comment record)

-- 22. sandeep_and_words (verified) — liked your post
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('sandeep_and_words', 'sandeep_and_words', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your post', '2026-01-19', now()
FROM handles WHERE name = 'sandeep_and_words'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SCREENSHOT 3 — 1d interactions (Jan 19) continued + 2d (Jan 18)
-- ============================================================================

-- (sandeep_and_words liked your reel 1d — same person, different content but same type "like", deduped)
-- Actually this is a second like on a different piece of content. We record both.
INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your reel', '2026-01-19', now()
FROM handles WHERE name = 'sandeep_and_words'
ON CONFLICT DO NOTHING;

-- 23. huseinalireza (verified) — started following you from your reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('huseinalireza', 'huseinalireza', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-19', now()
FROM handles WHERE name = 'huseinalireza'
ON CONFLICT DO NOTHING;

-- 24. prabhakar_mehra (verified) — started following you
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('prabhakar_mehra', 'prabhakar_mehra', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-01-19', now()
FROM handles WHERE name = 'prabhakar_mehra'
ON CONFLICT DO NOTHING;

-- 25. spencer_dentonator_ (verified) — started following you from your reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('spencer_dentonator_', 'spencer_dentonator_', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-19', now()
FROM handles WHERE name = 'spencer_dentonator_'
ON CONFLICT DO NOTHING;

-- 26. _olwtsn (verified) — started following you from your reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('_olwtsn', '_olwtsn', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-19', now()
FROM handles WHERE name = '_olwtsn'
ON CONFLICT DO NOTHING;

-- 27. marleen_mathews (verified) — started following you from your reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('marleen_mathews', 'marleen_mathews', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-19', now()
FROM handles WHERE name = 'marleen_mathews'
ON CONFLICT DO NOTHING;

-- (francescapsychology comment "sent!" 1d under "Last 7 days" — already deduped above)

-- 28. __cameroncooper (verified) — liked your post
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('__cameroncooper', '__cameroncooper', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your post', '2026-01-19', now()
FROM handles WHERE name = '__cameroncooper'
ON CONFLICT DO NOTHING;

-- 29. wsemx (verified) — started following you from your reel (2d = Jan 18)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('wsemx', 'wsemx', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-18', now()
FROM handles WHERE name = 'wsemx'
ON CONFLICT DO NOTHING;

-- 30. juanarre (verified) — started following you from your reel (2d = Jan 18)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('juanarre', 'juanarre', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-18', now()
FROM handles WHERE name = 'juanarre'
ON CONFLICT DO NOTHING;

-- 31. tyas_tamariska (verified) — started following you (2d = Jan 18)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('tyas_tamariska', 'tyas_tamariska', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-01-18', now()
FROM handles WHERE name = 'tyas_tamariska'
ON CONFLICT DO NOTHING;

-- 32. chrstphr_dtschlr and zoz8f — reposted your reel (2d = Jan 18)
-- This is a grouped notification for two users
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('chrstphr_dtschlr', 'chrstphr_dtschlr', false)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'repost', 'reposted your reel', '2026-01-18', now()
FROM handles WHERE name = 'chrstphr_dtschlr'
ON CONFLICT DO NOTHING;

INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('zoz8f', 'zoz8f', false)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'repost', 'reposted your reel', '2026-01-18', now()
FROM handles WHERE name = 'zoz8f'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SCREENSHOT 4 — 2d interactions (Jan 18, 2026)
-- ============================================================================

-- (francescapsychology comment "messaged you!" 2d — already deduped above)

-- 33. aphroditebooks (verified) — started following you (2d = Jan 18)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('aphroditebooks', 'aphroditebooks', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-01-18', now()
FROM handles WHERE name = 'aphroditebooks'
ON CONFLICT DO NOTHING;

-- (francescapsychology comment "sent!" 2d — already deduped above)

-- 34. alexbellini_alone (verified) — liked your post (2d = Jan 18)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('alexbellini_alone', 'alexbellini_alone', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your post', '2026-01-18', now()
FROM handles WHERE name = 'alexbellini_alone'
ON CONFLICT DO NOTHING;

-- 35. michelle_inspiredlife.co (verified) — started following you from your reel (2d = Jan 18)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('michelle_inspiredlife.co', 'michelle_inspiredlife.co', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-18', now()
FROM handles WHERE name = 'michelle_inspiredlife.co'
ON CONFLICT DO NOTHING;

-- 36. narumfitness (verified) — commented: Damn (2d = Jan 18)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('narumfitness', 'narumfitness', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'comment', 'Damn 👏', '2026-01-18', now()
FROM handles WHERE name = 'narumfitness'
ON CONFLICT DO NOTHING;

-- 37. opentalk__ (verified) — liked your post (2d = Jan 18)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('opentalk__', 'opentalk__', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your post', '2026-01-18', now()
FROM handles WHERE name = 'opentalk__'
ON CONFLICT DO NOTHING;

-- 38. stephanievonbismarck (verified) — started following you from your reel (2d = Jan 18)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('stephanievonbismarck', 'stephanievonbismarck', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-18', now()
FROM handles WHERE name = 'stephanievonbismarck'
ON CONFLICT DO NOTHING;

-- 39. cameronpl (verified) — started following you from your reel (2d = Jan 18)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('cameronpl', 'cameronpl', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-18', now()
FROM handles WHERE name = 'cameronpl'
ON CONFLICT DO NOTHING;

-- 40. raresburnete_ (verified) — started following you (2d = Jan 18)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('raresburnete_', 'raresburnete_', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-01-18', now()
FROM handles WHERE name = 'raresburnete_'
ON CONFLICT DO NOTHING;

-- 41. sohrabkhandelwal (verified) — started following you from your reel (2d = Jan 18)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('sohrabkhandelwal', 'sohrabkhandelwal', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-18', now()
FROM handles WHERE name = 'sohrabkhandelwal'
ON CONFLICT DO NOTHING;

-- 42. donaldmiller (verified) — started following you from your reel (2d = Jan 18)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('donaldmiller', 'donaldmiller', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-18', now()
FROM handles WHERE name = 'donaldmiller'
ON CONFLICT DO NOTHING;

-- 43. drgriffinmcmath (verified) — started following you (2d = Jan 18)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('drgriffinmcmath', 'drgriffinmcmath', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-01-18', now()
FROM handles WHERE name = 'drgriffinmcmath'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SCREENSHOT 5 — 2d interactions (Jan 18, 2026) continued
-- ============================================================================

-- (drgriffinmcmath started following you 2d — already recorded above)

-- 44. todd_here (verified) — started following you (2d = Jan 18)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('todd_here', 'todd_here', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-01-18', now()
FROM handles WHERE name = 'todd_here'
ON CONFLICT DO NOTHING;

-- 45. rodrigo.francisco (verified) — started following you from your reel (2d = Jan 18)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('rodrigo.francisco', 'rodrigo.francisco', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-18', now()
FROM handles WHERE name = 'rodrigo.francisco'
ON CONFLICT DO NOTHING;

-- 46. felixenglishteacher (verified) — liked your reel (2d = Jan 18)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('felixenglishteacher', 'felixenglishteacher', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your reel', '2026-01-18', now()
FROM handles WHERE name = 'felixenglishteacher'
ON CONFLICT DO NOTHING;

-- 47. bettinarust (verified) — started following you from your reel (2d = Jan 18)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('bettinarust', 'bettinarust', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-18', now()
FROM handles WHERE name = 'bettinarust'
ON CONFLICT DO NOTHING;

-- (francescapsychology comment "messaged you!" 2d — already deduped)
-- (francescapsychology comment "messaged you!" 2d — already deduped)

-- 48. lizwhite2021 (verified) — started following you from your reel (2d = Jan 18)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('lizwhite2021', 'lizwhite2021', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-18', now()
FROM handles WHERE name = 'lizwhite2021'
ON CONFLICT DO NOTHING;

-- 49. jafarli.me (verified) — started following you from your reel (2d = Jan 18)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('jafarli.me', 'jafarli.me', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-18', now()
FROM handles WHERE name = 'jafarli.me'
ON CONFLICT DO NOTHING;

-- 50. lifespan (verified) — started following you from your reel (2d = Jan 18)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('lifespan', 'lifespan', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-18', now()
FROM handles WHERE name = 'lifespan'
ON CONFLICT DO NOTHING;

-- 51. mit.o.syzyfie (verified) — started following you from your reel (2d = Jan 18)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('mit.o.syzyfie', 'mit.o.syzyfie', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-18', now()
FROM handles WHERE name = 'mit.o.syzyfie'
ON CONFLICT DO NOTHING;

-- 52. charles_gavin (verified) — started following you from your reel (2d = Jan 18)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('charles_gavin', 'charles_gavin', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-18', now()
FROM handles WHERE name = 'charles_gavin'
ON CONFLICT DO NOTHING;

-- 53. caveman_kv (verified) — started following you from your reel (2d = Jan 18)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('caveman_kv', 'caveman_kv', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-18', now()
FROM handles WHERE name = 'caveman_kv'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SCREENSHOT 6 — 3d interactions (Jan 17, 2026)
-- ============================================================================

-- 54. salmanmassood (verified) — started following you from your reel (3d = Jan 17)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('salmanmassood', 'salmanmassood', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-17', now()
FROM handles WHERE name = 'salmanmassood'
ON CONFLICT DO NOTHING;

-- 55. _anibesa_ (verified) — started following you from your reel (3d = Jan 17)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('_anibesa_', '_anibesa_', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-17', now()
FROM handles WHERE name = '_anibesa_'
ON CONFLICT DO NOTHING;

-- 56. marissafeinberg (verified) — started following you from your reel (3d = Jan 17)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('marissafeinberg', 'marissafeinberg', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-17', now()
FROM handles WHERE name = 'marissafeinberg'
ON CONFLICT DO NOTHING;

-- 57. nico.molaschi (verified) — started following you from your reel (3d = Jan 17)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('nico.molaschi', 'nico.molaschi', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-17', now()
FROM handles WHERE name = 'nico.molaschi'
ON CONFLICT DO NOTHING;

-- 58. keithjardine205 (verified) — started following you from your reel (3d = Jan 17)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('keithjardine205', 'keithjardine205', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-17', now()
FROM handles WHERE name = 'keithjardine205'
ON CONFLICT DO NOTHING;

-- 59. brianventh (verified) — started following you from your reel (3d = Jan 17)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('brianventh', 'brianventh', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-17', now()
FROM handles WHERE name = 'brianventh'
ON CONFLICT DO NOTHING;

-- (francescapsychology comment "messaged you!" 3d — already deduped)

-- 60. remarkablereaders6 (not verified) — started following you (3d = Jan 17)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('remarkablereaders6', 'remarkablereaders6', false)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-01-17', now()
FROM handles WHERE name = 'remarkablereaders6'
ON CONFLICT DO NOTHING;

-- 61. oliviaaac93 (not verified) — started following you from your reel (3d = Jan 17)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('oliviaaac93', 'oliviaaac93', false)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-17', now()
FROM handles WHERE name = 'oliviaaac93'
ON CONFLICT DO NOTHING;

-- 62. clemencybh (verified) — started following you (3d = Jan 17)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('clemencybh', 'clemencybh', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-01-17', now()
FROM handles WHERE name = 'clemencybh'
ON CONFLICT DO NOTHING;

-- (francescapsychology comment "messaged you!" 3d — already deduped)
-- (francescapsychology comment "sent!" 3d — already deduped)

-- 63. drleovalentin (verified) — started following you (3d = Jan 17)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('drleovalentin', 'drleovalentin', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-01-17', now()
FROM handles WHERE name = 'drleovalentin'
ON CONFLICT DO NOTHING;

COMMIT;
