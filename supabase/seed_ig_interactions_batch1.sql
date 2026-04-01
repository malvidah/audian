-- Seed file: Instagram notification interactions for @bigthinkers
-- Extracted from 6 screenshots taken 2026-03-31 (~21:52)
-- Relative timestamps converted to absolute dates based on Mar 31, 2026

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
-- SCREENSHOT 1 — Today (Mar 31, 2026)
-- ============================================================================

-- 1. jansen_ongko — liked your photo (4m ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('jansen_ongko', 'jansen_ongko', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your photo', '2026-03-31', now()
FROM handles WHERE name = 'jansen_ongko'
ON CONFLICT DO NOTHING;

-- 2. adityaroykapur — liked your reel (26m ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('adityaroykapur', 'adityaroykapur', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your reel', '2026-03-31', now()
FROM handles WHERE name = 'adityaroykapur'
ON CONFLICT DO NOTHING;

-- 3. adityaroykapur — started following you from your reel (28m ago)
INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-03-31', now()
FROM handles WHERE name = 'adityaroykapur'
ON CONFLICT DO NOTHING;

-- 4. antoniopilot.br — liked your post (28m ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('antoniopilot.br', 'antoniopilot.br', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your post', '2026-03-31', now()
FROM handles WHERE name = 'antoniopilot.br'
ON CONFLICT DO NOTHING;

-- 5. htet.arkar.kyaw_ — started following you from your reel (46m ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('htet.arkar.kyaw_', 'htet.arkar.kyaw_', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-03-31', now()
FROM handles WHERE name = 'htet.arkar.kyaw_'
ON CONFLICT DO NOTHING;

-- 6. tout.irie — liked your photo (50m ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('tout.irie', 'tout.irie', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your photo', '2026-03-31', now()
FROM handles WHERE name = 'tout.irie'
ON CONFLICT DO NOTHING;

-- 7. nilishaferrao — started following you from your reel (54m ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('nilishaferrao', 'nilishaferrao', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-03-31', now()
FROM handles WHERE name = 'nilishaferrao'
ON CONFLICT DO NOTHING;

-- 8. jer.harding — liked your photo (1h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('jer.harding', 'jer.harding', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your photo', '2026-03-31', now()
FROM handles WHERE name = 'jer.harding'
ON CONFLICT DO NOTHING;

-- 9. brace_carlos — liked your reel (2h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('brace_carlos', 'brace_carlos', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your reel', '2026-03-31', now()
FROM handles WHERE name = 'brace_carlos'
ON CONFLICT DO NOTHING;

-- 10. sallymousa — started following you from your reel (2h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('sallymousa', 'sallymousa', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-03-31', now()
FROM handles WHERE name = 'sallymousa'
ON CONFLICT DO NOTHING;

-- 11. mallikarjunp_ — liked your reel (3h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('mallikarjunp_', 'mallikarjunp_', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your reel', '2026-03-31', now()
FROM handles WHERE name = 'mallikarjunp_'
ON CONFLICT DO NOTHING;

-- 12. pompovinnie — started following you (3h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('pompovinnie', 'pompovinnie', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-03-31', now()
FROM handles WHERE name = 'pompovinnie'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SCREENSHOT 2 — Today (Mar 31, 2026) continued
-- ============================================================================

-- 13. roryclewlow — commented (4h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('roryclewlow', 'roryclewlow', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'comment', 'I will say, this makes a lot of sense to me', '2026-03-31', now()
FROM handles WHERE name = 'roryclewlow'
ON CONFLICT DO NOTHING;

-- 14. dorytothegulf — liked your reel (4h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('dorytothegulf', 'dorytothegulf', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your reel', '2026-03-31', now()
FROM handles WHERE name = 'dorytothegulf'
ON CONFLICT DO NOTHING;

-- 15. daysleeperisaband — liked your reel (4h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('daysleeperisaband', 'daysleeperisaband', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your reel', '2026-03-31', now()
FROM handles WHERE name = 'daysleeperisaband'
ON CONFLICT DO NOTHING;

-- 16. _hollyfinch — liked your reel (5h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('_hollyfinch', '_hollyfinch', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your reel', '2026-03-31', now()
FROM handles WHERE name = '_hollyfinch'
ON CONFLICT DO NOTHING;

-- 17. luxurywatchmedia — liked your reel (5h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('luxurywatchmedia', 'luxurywatchmedia', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your reel', '2026-03-31', now()
FROM handles WHERE name = 'luxurywatchmedia'
ON CONFLICT DO NOTHING;

-- 18. drtanyajudge — liked your reel (5h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('drtanyajudge', 'drtanyajudge', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your reel', '2026-03-31', now()
FROM handles WHERE name = 'drtanyajudge'
ON CONFLICT DO NOTHING;

-- 19. drtanyajudge — started following you from your reel (5h ago)
INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-03-31', now()
FROM handles WHERE name = 'drtanyajudge'
ON CONFLICT DO NOTHING;

-- 20. afternoon_photo_walks, mr.brain.turn and others — reposted your post (6h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('afternoon_photo_walks', 'afternoon_photo_walks', false)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'repost', 'reposted your post (with mr.brain.turn and others)', '2026-03-31', now()
FROM handles WHERE name = 'afternoon_photo_walks'
ON CONFLICT DO NOTHING;

-- 21. synfaring — liked your post (7h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('synfaring', 'synfaring', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your post', '2026-03-31', now()
FROM handles WHERE name = 'synfaring'
ON CONFLICT DO NOTHING;

-- 22. alejandralagunes_ — liked your reel (8h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('alejandralagunes_', 'alejandralagunes_', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your reel', '2026-03-31', now()
FROM handles WHERE name = 'alejandralagunes_'
ON CONFLICT DO NOTHING;

-- 23. wavenik — started following you from your reel (10h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('wavenik', 'wavenik', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-03-31', now()
FROM handles WHERE name = 'wavenik'
ON CONFLICT DO NOTHING;

-- 24. jorge_unap — liked your reel (10h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('jorge_unap', 'jorge_unap', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your reel', '2026-03-31', now()
FROM handles WHERE name = 'jorge_unap'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SCREENSHOT 3 — 10h-16h ago (still Mar 31)
-- ============================================================================

-- 25. opentalk___ — liked your post (10h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('opentalk___', 'opentalk___', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your post', '2026-03-31', now()
FROM handles WHERE name = 'opentalk___'
ON CONFLICT DO NOTHING;

-- 26. opentalk___ — liked your reel (10h ago)
INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your reel', '2026-03-31', now()
FROM handles WHERE name = 'opentalk___'
ON CONFLICT DO NOTHING;

-- 27. joshdursley — started following you from your reel (10h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('joshdursley', 'joshdursley', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-03-31', now()
FROM handles WHERE name = 'joshdursley'
ON CONFLICT DO NOTHING;

-- 28. danilomontero1 — started following you from your reel (11h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('danilomontero1', 'danilomontero1', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-03-31', now()
FROM handles WHERE name = 'danilomontero1'
ON CONFLICT DO NOTHING;

-- 29. moethursdaylove — started following you from your reel (11h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('moethursdaylove', 'moethursdaylove', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-03-31', now()
FROM handles WHERE name = 'moethursdaylove'
ON CONFLICT DO NOTHING;

-- 30. iza_lifeizadance_ — started following you (12h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('iza_lifeizadance_', 'iza_lifeizadance_', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-03-31', now()
FROM handles WHERE name = 'iza_lifeizadance_'
ON CONFLICT DO NOTHING;

-- 31. paulprinvil — started following you (12h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('paulprinvil', 'paulprinvil', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-03-31', now()
FROM handles WHERE name = 'paulprinvil'
ON CONFLICT DO NOTHING;

-- 32. gajabkiduniyaa — started following you from your reel (12h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('gajabkiduniyaa', 'gajabkiduniyaa', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-03-31', now()
FROM handles WHERE name = 'gajabkiduniyaa'
ON CONFLICT DO NOTHING;

-- 33. arkodatto — started following you (13h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('arkodatto', 'arkodatto', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-03-31', now()
FROM handles WHERE name = 'arkodatto'
ON CONFLICT DO NOTHING;

-- 34. zuloagamaytorenaabogados — started following you from your reel (14h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('zuloagamaytorenaabogados', 'zuloagamaytorenaabogados', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-03-31', now()
FROM handles WHERE name = 'zuloagamaytorenaabogados'
ON CONFLICT DO NOTHING;

-- 35. christianclarck_ — started following you from your reel (14h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('christianclarck_', 'christianclarck_', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-03-31', now()
FROM handles WHERE name = 'christianclarck_'
ON CONFLICT DO NOTHING;

-- 36. francescapsychology — commented "sent!" (16h ago) — deduplicated, one record only
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('francescapsychology', 'francescapsychology', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'comment', 'sent! / messaged you! (repeated across multiple posts)', '2026-03-31', now()
FROM handles WHERE name = 'francescapsychology'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SCREENSHOT 4 — 17h-22h ago (Mar 30-31)
-- ============================================================================

-- 37. bernardteocp — started following you from your reel (17h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('bernardteocp', 'bernardteocp', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-03-31', now()
FROM handles WHERE name = 'bernardteocp'
ON CONFLICT DO NOTHING;

-- 38. hasanbinkaram — started following you from your reel (19h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('hasanbinkaram', 'hasanbinkaram', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-03-31', now()
FROM handles WHERE name = 'hasanbinkaram'
ON CONFLICT DO NOTHING;

-- 39. blue.lotus_academy — started following you (20h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('blue.lotus_academy', 'blue.lotus_academy', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-03-30', now()
FROM handles WHERE name = 'blue.lotus_academy'
ON CONFLICT DO NOTHING;

-- 40. assel851 — liked your post (20h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('assel851', 'assel851', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your post', '2026-03-30', now()
FROM handles WHERE name = 'assel851'
ON CONFLICT DO NOTHING;

-- 41. the_black_el_chapo — liked your reel (21h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('the_black_el_chapo', 'the_black_el_chapo', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your reel', '2026-03-30', now()
FROM handles WHERE name = 'the_black_el_chapo'
ON CONFLICT DO NOTHING;

-- 42. asdfthales — started following you (21h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('asdfthales', 'asdfthales', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-03-30', now()
FROM handles WHERE name = 'asdfthales'
ON CONFLICT DO NOTHING;

-- 43. anyadwinov — started following you (22h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('anyadwinov', 'anyadwinov', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-03-30', now()
FROM handles WHERE name = 'anyadwinov'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SCREENSHOT 5 — Yesterday section (Mar 30, 2026) — 23h to 1d
-- ============================================================================

-- 44. dorytothegulf — started following you from your reel (23h ago)
INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-03-30', now()
FROM handles WHERE name = 'dorytothegulf'
ON CONFLICT DO NOTHING;

-- 45. nabilelmassry_ — reposted your reel (23h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('nabilelmassry_', 'nabilelmassry_', false)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'repost', 'reposted your reel', '2026-03-30', now()
FROM handles WHERE name = 'nabilelmassry_'
ON CONFLICT DO NOTHING;

-- 46. the_black_el_chapo — started following you from your reel (23h ago)
INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-03-30', now()
FROM handles WHERE name = 'the_black_el_chapo'
ON CONFLICT DO NOTHING;

-- 47. bodmodinc — started following you (23h ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('bodmodinc', 'bodmodinc', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-03-30', now()
FROM handles WHERE name = 'bodmodinc'
ON CONFLICT DO NOTHING;

-- 48. matthewstrothercenter, srirahayu_adiningsih and marc.singh_ — reposted your post (1d ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('matthewstrothercenter', 'matthewstrothercenter', false)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'repost', 'reposted your post (with srirahayu_adiningsih and marc.singh_)', '2026-03-30', now()
FROM handles WHERE name = 'matthewstrothercenter'
ON CONFLICT DO NOTHING;

-- 49. drairthoncorreia — liked your reel (1d ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('drairthoncorreia', 'drairthoncorreia', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your reel', '2026-03-30', now()
FROM handles WHERE name = 'drairthoncorreia'
ON CONFLICT DO NOTHING;

-- 50. harleyvanderson — started following you from your ad (1d ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('harleyvanderson', 'harleyvanderson', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your ad', '2026-03-30', now()
FROM handles WHERE name = 'harleyvanderson'
ON CONFLICT DO NOTHING;

-- 51. abishek_joseph — started following you from your reel (1d ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('abishek_joseph', 'abishek_joseph', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-03-30', now()
FROM handles WHERE name = 'abishek_joseph'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SCREENSHOT 6 — 1d ago continued (Mar 30, 2026)
-- ============================================================================

-- 52. bernardobivo — started following you from your reel (1d ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('bernardobivo', 'bernardobivo', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-03-30', now()
FROM handles WHERE name = 'bernardobivo'
ON CONFLICT DO NOTHING;

-- 53. baskalkorkis — started following you from your reel (1d ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('baskalkorkis', 'baskalkorkis', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-03-30', now()
FROM handles WHERE name = 'baskalkorkis'
ON CONFLICT DO NOTHING;

-- 54. lindseyalexandriaa — liked your reel (1d ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('lindseyalexandriaa', 'lindseyalexandriaa', false)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your reel', '2026-03-30', now()
FROM handles WHERE name = 'lindseyalexandriaa'
ON CONFLICT DO NOTHING;

-- 55. tuttutonylawrence and highbrow_apartments — reposted your reel (1d ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('tuttutonylawrence', 'tuttutonylawrence', false)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'repost', 'reposted your reel (with highbrow_apartments)', '2026-03-30', now()
FROM handles WHERE name = 'tuttutonylawrence'
ON CONFLICT DO NOTHING;

-- 56. drceliovictal — started following you from your reel (1d ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('drceliovictal', 'drceliovictal', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-03-30', now()
FROM handles WHERE name = 'drceliovictal'
ON CONFLICT DO NOTHING;

-- 57. javierechaiz — commented (1d ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('javierechaiz', 'javierechaiz', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'comment', '@ivornworrell God of the Gaps... Google that', '2026-03-30', now()
FROM handles WHERE name = 'javierechaiz'
ON CONFLICT DO NOTHING;

-- 58. lou_lou_7lw — commented (1d ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('lou_lou_7lw', 'lou_lou_7lw', false)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'comment', 'I don''t want a man who "earns" I want a man who wants to earn for himself and his family.', '2026-03-30', now()
FROM handles WHERE name = 'lou_lou_7lw'
ON CONFLICT DO NOTHING;

-- 59. pasquale.dcn — started following you from your reel (1d ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('pasquale.dcn', 'pasquale.dcn', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-03-30', now()
FROM handles WHERE name = 'pasquale.dcn'
ON CONFLICT DO NOTHING;

-- 60. manuelabenaim — liked your post (1d ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('manuelabenaim', 'manuelabenaim', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your post', '2026-03-30', now()
FROM handles WHERE name = 'manuelabenaim'
ON CONFLICT DO NOTHING;

-- 61. cristianmitrea01 — reposted your reel (1d ago)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('cristianmitrea01', 'cristianmitrea01', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'repost', 'reposted your reel', '2026-03-30', now()
FROM handles WHERE name = 'cristianmitrea01'
ON CONFLICT DO NOTHING;

COMMIT;
