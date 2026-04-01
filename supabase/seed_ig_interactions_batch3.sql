-- Seed file: Instagram interactions batch 3
-- Extracted from notification screenshots taken 2026-03-31
-- Covers Jan 13-17, 2026 (relative timestamps) and Mar 20-21, 2026 (explicit dates)
-- All verified (blue checkmark) accounts on @bigthinkers

BEGIN;

-- ============================================================================
-- JANUARY 17, 2026 (3d relative)
-- ============================================================================

-- 1. drleovalentin — follow from reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('drleovalentin', 'drleovalentin', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-17', now()
FROM handles WHERE name = 'drleovalentin'
ON CONFLICT DO NOTHING;

-- 2. timwasher — follow from reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('timwasher', 'timwasher', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-17', now()
FROM handles WHERE name = 'timwasher'
ON CONFLICT DO NOTHING;

-- 3. stefandiez — follow from reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('stefandiez', 'stefandiez', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-17', now()
FROM handles WHERE name = 'stefandiez'
ON CONFLICT DO NOTHING;

-- 4. lilyetcie — liked post
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('lilyetcie', 'lilyetcie', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your post', '2026-01-17', now()
FROM handles WHERE name = 'lilyetcie'
ON CONFLICT DO NOTHING;

-- 5. michemoffatt — liked reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('michemoffatt', 'michemoffatt', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your reel', '2026-01-17', now()
FROM handles WHERE name = 'michemoffatt'
ON CONFLICT DO NOTHING;

-- 6. francescapsychology — comment (deduplicated: one record for all her repeated sent/messaged comments)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('francescapsychology', 'francescapsychology', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'comment', 'sent! / messaged you! (repeated promotional comments across multiple posts)', '2026-01-17', now()
FROM handles WHERE name = 'francescapsychology'
ON CONFLICT DO NOTHING;

-- 7. drdeepikachopra — follow
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('drdeepikachopra', 'drdeepikachopra', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-01-17', now()
FROM handles WHERE name = 'drdeepikachopra'
ON CONFLICT DO NOTHING;

-- 8. feladurotoye — follow from reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('feladurotoye', 'feladurotoye', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-17', now()
FROM handles WHERE name = 'feladurotoye'
ON CONFLICT DO NOTHING;

-- 9. jenniferfogel — follow from reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('jenniferfogel', 'jenniferfogel', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-17', now()
FROM handles WHERE name = 'jenniferfogel'
ON CONFLICT DO NOTHING;

-- 10. rainyharp — follow from reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('rainyharp', 'rainyharp', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-17', now()
FROM handles WHERE name = 'rainyharp'
ON CONFLICT DO NOTHING;

-- 11. jabette_wishfuldoings — follow from ad
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('jabette_wishfuldoings', 'jabette_wishfuldoings', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your ad', '2026-01-17', now()
FROM handles WHERE name = 'jabette_wishfuldoings'
ON CONFLICT DO NOTHING;

-- 12. alignedhorizonstherapy — comment
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('alignedhorizonstherapy', 'alignedhorizonstherapy', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'comment', 'I feel like I''m "meditating" when I read a book I enjoy and you can feel the change in the brain state versus a book I don''t like and I don''t enter that true focused state', '2026-01-17', now()
FROM handles WHERE name = 'alignedhorizonstherapy'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- JANUARY 16, 2026 (4d relative)
-- ============================================================================

-- 13. neuroscienceof — follow
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('neuroscienceof', 'neuroscienceof', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-01-16', now()
FROM handles WHERE name = 'neuroscienceof'
ON CONFLICT DO NOTHING;

-- 14. neuroscienceof — liked post (same person, different action)
INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your post', '2026-01-16', now()
FROM handles WHERE name = 'neuroscienceof'
ON CONFLICT DO NOTHING;

-- 15. fitneuroblog — follow
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('fitneuroblog', 'fitneuroblog', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-01-16', now()
FROM handles WHERE name = 'fitneuroblog'
ON CONFLICT DO NOTHING;

-- 16. fairyonthewall — follow from reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('fairyonthewall', 'fairyonthewall', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-16', now()
FROM handles WHERE name = 'fairyonthewall'
ON CONFLICT DO NOTHING;

-- 17. ivandorschner — comment
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('ivandorschner', 'ivandorschner', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'comment', 'Boy Scouts was a very rewarding experience for me, though every troop is "run..." (more)', '2026-01-16', now()
FROM handles WHERE name = 'ivandorschner'
ON CONFLICT DO NOTHING;

-- 18. alecamposimagen — follow from reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('alecamposimagen', 'alecamposimagen', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-16', now()
FROM handles WHERE name = 'alecamposimagen'
ON CONFLICT DO NOTHING;

-- 19. alexandrakirsch — follow
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('alexandrakirsch', 'alexandrakirsch', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-01-16', now()
FROM handles WHERE name = 'alexandrakirsch'
ON CONFLICT DO NOTHING;

-- 20. tiagogarcia77 — liked reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('tiagogarcia77', 'tiagogarcia77', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your reel', '2026-01-16', now()
FROM handles WHERE name = 'tiagogarcia77'
ON CONFLICT DO NOTHING;

-- 21. seeyouonmars_ — reposted reel (with jaime.franco.587606 and priyadarshi.b)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('seeyouonmars_', 'seeyouonmars_', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'repost', 'reposted your reel (with jaime.franco.587606 and priyadarshi.b)', '2026-01-16', now()
FROM handles WHERE name = 'seeyouonmars_'
ON CONFLICT DO NOTHING;

-- 22. seeyouonmars_ — also followed
INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-01-16', now()
FROM handles WHERE name = 'seeyouonmars_'
ON CONFLICT DO NOTHING;

-- 23. futureofskincare — follow from reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('futureofskincare', 'futureofskincare', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-16', now()
FROM handles WHERE name = 'futureofskincare'
ON CONFLICT DO NOTHING;

-- 24. pneumatic_movement — follow from reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('pneumatic_movement', 'pneumatic_movement', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-16', now()
FROM handles WHERE name = 'pneumatic_movement'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- JANUARY 15, 2026 (5d relative)
-- ============================================================================

-- 25. jakejudy93 — comment
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('jakejudy93', 'jakejudy93', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'comment', 'Not enough money', '2026-01-15', now()
FROM handles WHERE name = 'jakejudy93'
ON CONFLICT DO NOTHING;

-- 26. loztradez — liked reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('loztradez', 'loztradez', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your reel', '2026-01-15', now()
FROM handles WHERE name = 'loztradez'
ON CONFLICT DO NOTHING;

-- 27. davidepstein — comment
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('davidepstein', 'davidepstein', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'comment', 'Yes Alex in BigThink!', '2026-01-15', now()
FROM handles WHERE name = 'davidepstein'
ON CONFLICT DO NOTHING;

-- 28. teonkelley — follow from reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('teonkelley', 'teonkelley', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-15', now()
FROM handles WHERE name = 'teonkelley'
ON CONFLICT DO NOTHING;

-- 29. romeoahujap — follow
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('romeoahujap', 'romeoahujap', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-01-15', now()
FROM handles WHERE name = 'romeoahujap'
ON CONFLICT DO NOTHING;

-- 30. tammahwatts — follow from ad
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('tammahwatts', 'tammahwatts', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your ad', '2026-01-15', now()
FROM handles WHERE name = 'tammahwatts'
ON CONFLICT DO NOTHING;

-- 31. ipno38 — follow
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('ipno38', 'ipno38', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-01-15', now()
FROM handles WHERE name = 'ipno38'
ON CONFLICT DO NOTHING;

-- 32. maythesciencebewithyou — liked post
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('maythesciencebewithyou', 'maythesciencebewithyou', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your post', '2026-01-15', now()
FROM handles WHERE name = 'maythesciencebewithyou'
ON CONFLICT DO NOTHING;

-- 33. shakasenghor — comment
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('shakasenghor', 'shakasenghor', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'comment', 'I need one of these', '2026-01-15', now()
FROM handles WHERE name = 'shakasenghor'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- JANUARY 14, 2026 (6d relative)
-- ============================================================================

-- 34. thisandthat — collaboration invite
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('thisandthat', 'thisandthat', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'collaboration', 'invited you to collaborate on a post', '2026-01-14', now()
FROM handles WHERE name = 'thisandthat'
ON CONFLICT DO NOTHING;

-- 35. thewellnestescape — reposted reel (with keepthefunkk)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('thewellnestescape', 'thewellnestescape', false)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'repost', 'reposted your reel (with keepthefunkk)', '2026-01-14', now()
FROM handles WHERE name = 'thewellnestescape'
ON CONFLICT DO NOTHING;

-- 36. neuranne — collaboration accepted
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('neuranne', 'neuranne', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'collaboration', 'accepted your invitation to be a collaborator on your post', '2026-01-14', now()
FROM handles WHERE name = 'neuranne'
ON CONFLICT DO NOTHING;

-- 37. emilia.montiglio — follow
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('emilia.montiglio', 'emilia.montiglio', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-01-14', now()
FROM handles WHERE name = 'emilia.montiglio'
ON CONFLICT DO NOTHING;

-- 38. kalisa_augustine — liked reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('kalisa_augustine', 'kalisa_augustine', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your reel', '2026-01-14', now()
FROM handles WHERE name = 'kalisa_augustine'
ON CONFLICT DO NOTHING;

-- 39. montereybayaquarium — comment
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('montereybayaquarium', 'montereybayaquarium', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'comment', 'Rated: 10/10 Incredibly nifty', '2026-01-14', now()
FROM handles WHERE name = 'montereybayaquarium'
ON CONFLICT DO NOTHING;

-- 40. miraaas — follow
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('miraaas', 'miraaas', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-01-14', now()
FROM handles WHERE name = 'miraaas'
ON CONFLICT DO NOTHING;

-- 41. jesitaai — comment (partially visible)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('jesitaai', 'jesitaai', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'comment', 'commented with heart emoji', '2026-01-14', now()
FROM handles WHERE name = 'jesitaai'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- JANUARY 13, 2026 (1w relative)
-- ============================================================================

-- 42. resonacoaching — follow from reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('resonacoaching', 'resonacoaching', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-13', now()
FROM handles WHERE name = 'resonacoaching'
ON CONFLICT DO NOTHING;

-- 43. sindhu.biswal — follow
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('sindhu.biswal', 'sindhu.biswal', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-01-13', now()
FROM handles WHERE name = 'sindhu.biswal'
ON CONFLICT DO NOTHING;

-- 44. albert_tsimal — reposted reel (with drrachelbarr)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('albert_tsimal', 'albert_tsimal', false)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'repost', 'reposted your reel (with drrachelbarr)', '2026-01-13', now()
FROM handles WHERE name = 'albert_tsimal'
ON CONFLICT DO NOTHING;

-- 45. drrachelbarr — reposted reel (listed with albert_tsimal)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('drrachelbarr', 'drrachelbarr', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'repost', 'reposted your reel', '2026-01-13', now()
FROM handles WHERE name = 'drrachelbarr'
ON CONFLICT DO NOTHING;

-- 46. drrachelbarr — liked story (same person, different action)
INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your story', '2026-01-13', now()
FROM handles WHERE name = 'drrachelbarr'
ON CONFLICT DO NOTHING;

-- 47. soberfitrach — follow
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('soberfitrach', 'soberfitrach', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-01-13', now()
FROM handles WHERE name = 'soberfitrach'
ON CONFLICT DO NOTHING;

-- 48. mijangos — reposted reel (with haydihaydee)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('mijangos', 'mijangos', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'repost', 'reposted your reel (with haydihaydee)', '2026-01-13', now()
FROM handles WHERE name = 'mijangos'
ON CONFLICT DO NOTHING;

-- 49. aeterion.ltd — follow
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('aeterion.ltd', 'aeterion.ltd', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-01-13', now()
FROM handles WHERE name = 'aeterion.ltd'
ON CONFLICT DO NOTHING;

-- 50. nicwestaway — follow from reel
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('nicwestaway', 'nicwestaway', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-01-13', now()
FROM handles WHERE name = 'nicwestaway'
ON CONFLICT DO NOTHING;

-- 51. doctorluisfeliperivera — follow
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('doctorluisfeliperivera', 'doctorluisfeliperivera', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-01-13', now()
FROM handles WHERE name = 'doctorluisfeliperivera'
ON CONFLICT DO NOTHING;

-- 52. derflowcoach — comment
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('derflowcoach', 'derflowcoach', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'comment', 'It''s a false dichotomy fallacy in how this is presented here... (more)', '2026-01-13', now()
FROM handles WHERE name = 'derflowcoach'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- MARCH 20-21, 2026 (explicit dates)
-- ============================================================================

-- 53. maxkrueger__ — follow (Mar 21)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('maxkrueger__', 'maxkrueger__', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-03-21', now()
FROM handles WHERE name = 'maxkrueger__'
ON CONFLICT DO NOTHING;

-- 54. goodfood_fellas — follow from reel (Mar 21)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('goodfood_fellas', 'goodfood_fellas', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-03-21', now()
FROM handles WHERE name = 'goodfood_fellas'
ON CONFLICT DO NOTHING;

-- 55. sodremat — follow from reel (Mar 20)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('sodremat', 'sodremat', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-03-20', now()
FROM handles WHERE name = 'sodremat'
ON CONFLICT DO NOTHING;

-- 56. noahyeh — follow (Mar 20)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('noahyeh', 'noahyeh', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-03-20', now()
FROM handles WHERE name = 'noahyeh'
ON CONFLICT DO NOTHING;

-- 57. juniorfaboxer — follow (Mar 20)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('juniorfaboxer', 'juniorfaboxer', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-03-20', now()
FROM handles WHERE name = 'juniorfaboxer'
ON CONFLICT DO NOTHING;

-- 58. shannon_klingman_md — liked reel (Mar 20)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('shannon_klingman_md', 'shannon_klingman_md', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your reel', '2026-03-20', now()
FROM handles WHERE name = 'shannon_klingman_md'
ON CONFLICT DO NOTHING;

-- 59. theanavisuals — reposted reel (Mar 20)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('theanavisuals', 'theanavisuals', false)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'repost', 'reposted your reel', '2026-03-20', now()
FROM handles WHERE name = 'theanavisuals'
ON CONFLICT DO NOTHING;

-- 60. kiaranirghin — follow (Mar 20)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('kiaranirghin', 'kiaranirghin', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you', '2026-03-20', now()
FROM handles WHERE name = 'kiaranirghin'
ON CONFLICT DO NOTHING;

-- 61. lou_lou_7lw — comment (Mar 20)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('lou_lou_7lw', 'lou_lou_7lw', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'comment', 'I don''t care what he earns: I have a base expectation he has agency and an investment in his... (more)', '2026-03-20', now()
FROM handles WHERE name = 'lou_lou_7lw'
ON CONFLICT DO NOTHING;

-- 62. infinite_nocturnes — comment (Mar 20)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('infinite_nocturnes', 'infinite_nocturnes', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'comment', 'Interesting, I agree. And hope young men will find balanced, healthy and... (more)', '2026-03-20', now()
FROM handles WHERE name = 'infinite_nocturnes'
ON CONFLICT DO NOTHING;

-- 63. athenamusic — liked reel (Mar 20)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('athenamusic', 'athenamusic', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'like', 'liked your reel', '2026-03-20', now()
FROM handles WHERE name = 'athenamusic'
ON CONFLICT DO NOTHING;

-- 64. andregraziano — follow from reel (Mar 20)
INSERT INTO handles (name, handle_instagram, verified_instagram)
VALUES ('andregraziano', 'andregraziano', true)
ON CONFLICT (name) DO UPDATE SET
  handle_instagram = EXCLUDED.handle_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'follow', 'started following you from your reel', '2026-03-20', now()
FROM handles WHERE name = 'andregraziano'
ON CONFLICT DO NOTHING;

COMMIT;
