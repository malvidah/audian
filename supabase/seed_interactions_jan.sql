-- Seed file: January 2026 Wild Elite Mentions (Instagram + X)
-- Extracted from screenshots on 2026-01-20
-- All interactions are "mention" type, dated approx 2026-01-15

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
-- INSTAGRAM WILD ELITE MENTIONS — January 2026
-- ============================================================================

-- 1. Marek Zmyslowski (@marekchinedu) — 99.5K followers → INFLUENTIAL
INSERT INTO handles (name, bio, zone, handle_instagram, followers_instagram, verified_instagram)
VALUES (
  'Marek Zmyslowski',
  'Conscious Capitalist. Author "Chasing Black Unicorns". Born & Made. Founder: Jumia Travel, SunRoof, Private.',
  'INFLUENTIAL',
  'marekchinedu',
  99500,
  true
)
ON CONFLICT (name) DO UPDATE SET
  bio = EXCLUDED.bio,
  zone = EXCLUDED.zone,
  handle_instagram = EXCLUDED.handle_instagram,
  followers_instagram = EXCLUDED.followers_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'mention', 'Wild elite mention on Instagram', '2026-01-15', now()
FROM handles WHERE name = 'Marek Zmyslowski';

-- 2. Blindboy Boatclub (@blindboyboatclub) — 736K followers → ELITE
INSERT INTO handles (name, bio, zone, handle_instagram, followers_instagram, verified_instagram)
VALUES (
  'Blindboy Boatclub',
  'The Blindboy Podcast. Author, Podcast, Documentary Maker, Eireanach Award winner, RTS, BAFTA longlist.',
  'ELITE',
  'blindboyboatclub',
  736000,
  true
)
ON CONFLICT (name) DO UPDATE SET
  bio = EXCLUDED.bio,
  zone = EXCLUDED.zone,
  handle_instagram = EXCLUDED.handle_instagram,
  followers_instagram = EXCLUDED.followers_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'mention', 'Wild elite mention on Instagram', '2026-01-15', now()
FROM handles WHERE name = 'Blindboy Boatclub';

-- 3. Rohan Browning (@rohanbrowning) — 55.4K followers → INFLUENTIAL
INSERT INTO handles (name, bio, zone, handle_instagram, followers_instagram, verified_instagram)
VALUES (
  'Rohan Browning',
  'Australian sprinter. @aurorarunning @trueprotein links.app/rohanbrowning',
  'INFLUENTIAL',
  'rohanbrowning',
  55400,
  true
)
ON CONFLICT (name) DO UPDATE SET
  bio = EXCLUDED.bio,
  zone = EXCLUDED.zone,
  handle_instagram = EXCLUDED.handle_instagram,
  followers_instagram = EXCLUDED.followers_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'mention', 'Wild elite mention on Instagram', '2026-01-15', now()
FROM handles WHERE name = 'Rohan Browning';

-- 4. Dr. Robyne Hanley-Dafoe (@dr_robynehd) — 133K followers → ELITE
INSERT INTO handles (name, bio, zone, handle_instagram, followers_instagram, verified_instagram)
VALUES (
  'Dr. Robyne Hanley-Dafoe',
  'PRE-ORDER I''M HERE SO! Award-winning Author, Speaker, Scholar. Resiliency & Wellness Expert.',
  'ELITE',
  'dr_robynehd',
  133000,
  true
)
ON CONFLICT (name) DO UPDATE SET
  bio = EXCLUDED.bio,
  zone = EXCLUDED.zone,
  handle_instagram = EXCLUDED.handle_instagram,
  followers_instagram = EXCLUDED.followers_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'mention', 'Wild elite mention on Instagram', '2026-01-15', now()
FROM handles WHERE name = 'Dr. Robyne Hanley-Dafoe';

-- 5. Katherine Langford (@katherinelangford) — 40.1M followers → ELITE
INSERT INTO handles (name, bio, zone, handle_instagram, followers_instagram, verified_instagram)
VALUES (
  'Katherine Langford',
  'happy you''re here',
  'ELITE',
  'katherinelangford',
  40100000,
  true
)
ON CONFLICT (name) DO UPDATE SET
  bio = EXCLUDED.bio,
  zone = EXCLUDED.zone,
  handle_instagram = EXCLUDED.handle_instagram,
  followers_instagram = EXCLUDED.followers_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'mention', 'Wild elite mention on Instagram', '2026-01-15', now()
FROM handles WHERE name = 'Katherine Langford';

-- 6. Kathryn Paige Harden (@kathrynpaigeharden) — 152 followers → SIGNAL
INSERT INTO handles (name, bio, zone, handle_instagram, followers_instagram, verified_instagram)
VALUES (
  'Kathryn Paige Harden',
  'Author, ORIGINAL SIN (1/28). I study how DNA shapes behavior & what it means for our politics & institutions. UT Prof & counseling-as-an-individual.',
  'SIGNAL',
  'kathrynpaigeharden',
  152,
  false
)
ON CONFLICT (name) DO UPDATE SET
  bio = EXCLUDED.bio,
  zone = EXCLUDED.zone,
  handle_instagram = EXCLUDED.handle_instagram,
  followers_instagram = EXCLUDED.followers_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'mention', 'Wild elite mention on Instagram', '2026-01-15', now()
FROM handles WHERE name = 'Kathryn Paige Harden';

-- 7. Sue Monk Kidd (@suemonkkidd) — 44K followers → INFLUENTIAL
INSERT INTO handles (name, bio, zone, handle_instagram, followers_instagram, verified_instagram)
VALUES (
  'Sue Monk Kidd',
  'Author of Writing Creativity and Soul, The Book of Longings, The Secret Life of Bees, The Invention of Wings, The Mermaid Chair.',
  'INFLUENTIAL',
  'suemonkkidd',
  44000,
  true
)
ON CONFLICT (name) DO UPDATE SET
  bio = EXCLUDED.bio,
  zone = EXCLUDED.zone,
  handle_instagram = EXCLUDED.handle_instagram,
  followers_instagram = EXCLUDED.followers_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'mention', 'Wild elite mention on Instagram', '2026-01-15', now()
FROM handles WHERE name = 'Sue Monk Kidd';

-- 8. Wajahat S. Khan (@wajskhan) — 72.5K followers → INFLUENTIAL
INSERT INTO handles (name, bio, zone, handle_instagram, followers_instagram, verified_instagram)
VALUES (
  'Wajahat S. Khan',
  'Life''s too short and I''m too tall. #Writer #Filthian #Oddly. Pakistani journalist. Education: Columbia University, University of Michigan.',
  'INFLUENTIAL',
  'wajskhan',
  72500,
  true
)
ON CONFLICT (name) DO UPDATE SET
  bio = EXCLUDED.bio,
  zone = EXCLUDED.zone,
  handle_instagram = EXCLUDED.handle_instagram,
  followers_instagram = EXCLUDED.followers_instagram,
  verified_instagram = EXCLUDED.verified_instagram;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'instagram', 'mention', 'Wild elite mention on Instagram', '2026-01-15', now()
FROM handles WHERE name = 'Wajahat S. Khan';


-- ============================================================================
-- X (TWITTER) WILD ELITE MENTIONS — January 2026
-- ============================================================================

-- 9. Stuart Hameroff (@StuartHameroff) — 20.4K followers → INFLUENTIAL
INSERT INTO handles (name, bio, zone, handle_x, followers_x, verified_x)
VALUES (
  'Stuart Hameroff',
  'I am an Anesthesiologist, retired. The Science of Consciousness conferences at The University of Arizona.',
  'INFLUENTIAL',
  'StuartHameroff',
  20400,
  true
)
ON CONFLICT (name) DO UPDATE SET
  bio = EXCLUDED.bio,
  zone = EXCLUDED.zone,
  handle_x = EXCLUDED.handle_x,
  followers_x = EXCLUDED.followers_x,
  verified_x = EXCLUDED.verified_x;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'x', 'mention', 'Wild elite mention on X', '2026-01-15', now()
FROM handles WHERE name = 'Stuart Hameroff';

-- 10. Fatih Guner (@fatloguner) — 49K followers → INFLUENTIAL
INSERT INTO handles (name, bio, zone, handle_x, followers_x, verified_x)
VALUES (
  'Fatih Guner',
  'Founder of the most prominent indie hacker community in Turkey. @komunitecom. Presenter & Producer @acikinanch.',
  'INFLUENTIAL',
  'fatihguner',
  49000,
  false
)
ON CONFLICT (name) DO UPDATE SET
  bio = EXCLUDED.bio,
  zone = EXCLUDED.zone,
  handle_x = EXCLUDED.handle_x,
  followers_x = EXCLUDED.followers_x,
  verified_x = EXCLUDED.verified_x;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'x', 'mention', 'Wild elite mention on X', '2026-01-15', now()
FROM handles WHERE name = 'Fatih Guner';

-- 11. Adam Thierer (@AdamThierer) — 11.4K followers → INFLUENTIAL
INSERT INTO handles (name, bio, zone, handle_x, followers_x, verified_x)
VALUES (
  'Adam Thierer',
  'Innovation policy analyst at @RSI. Author of Permissionless Innovation (2016) & Evasive Entrepreneurs (2020).',
  'INFLUENTIAL',
  'AdamThierer',
  11400,
  true
)
ON CONFLICT (name) DO UPDATE SET
  bio = EXCLUDED.bio,
  zone = EXCLUDED.zone,
  handle_x = EXCLUDED.handle_x,
  followers_x = EXCLUDED.followers_x,
  verified_x = EXCLUDED.verified_x;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'x', 'mention', 'Wild elite mention on X', '2026-01-15', now()
FROM handles WHERE name = 'Adam Thierer';

-- 12. Barbara Anna Zielonka — 14.4K followers → INFLUENTIAL
INSERT INTO handles (name, bio, zone, handle_x, followers_x, verified_x)
VALUES (
  'Barbara Anna Zielonka',
  'Learner/global educator/TOP 10. GITSyeducator/SLU.',
  'INFLUENTIAL',
  'barbarazielonka',
  14400,
  false
)
ON CONFLICT (name) DO UPDATE SET
  bio = EXCLUDED.bio,
  zone = EXCLUDED.zone,
  handle_x = EXCLUDED.handle_x,
  followers_x = EXCLUDED.followers_x,
  verified_x = EXCLUDED.verified_x;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'x', 'mention', 'Wild elite mention on X', '2026-01-15', now()
FROM handles WHERE name = 'Barbara Anna Zielonka';

-- 13. Garry Golden — ~6K followers → SIGNAL
INSERT INTO handles (name, bio, zone, handle_x, followers_x, verified_x)
VALUES (
  'Garry Golden',
  'Futurist w/ real clients. Founder - Creative Learning Space. artstechnologies.nyc.',
  'SIGNAL',
  'garrygolden',
  6000,
  false
)
ON CONFLICT (name) DO UPDATE SET
  bio = EXCLUDED.bio,
  zone = EXCLUDED.zone,
  handle_x = EXCLUDED.handle_x,
  followers_x = EXCLUDED.followers_x,
  verified_x = EXCLUDED.verified_x;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'x', 'mention', 'Wild elite mention on X', '2026-01-15', now()
FROM handles WHERE name = 'Garry Golden';

-- 14. Antoine B Cooke, PhD — ~6,934 followers → SIGNAL
INSERT INTO handles (name, bio, zone, handle_x, followers_x, verified_x)
VALUES (
  'Antoine B Cooke, PhD',
  'Associate Professor, Dept. Genomics, LLC. I Rethinking Genomics.',
  'SIGNAL',
  'antoinebcooke',
  6934,
  false
)
ON CONFLICT (name) DO UPDATE SET
  bio = EXCLUDED.bio,
  zone = EXCLUDED.zone,
  handle_x = EXCLUDED.handle_x,
  followers_x = EXCLUDED.followers_x,
  verified_x = EXCLUDED.verified_x;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'x', 'mention', 'Wild elite mention on X', '2026-01-15', now()
FROM handles WHERE name = 'Antoine B Cooke, PhD';

-- 15. Barry Ritholtz (@ritholtz) — 124.4K followers → ELITE
INSERT INTO handles (name, bio, zone, handle_x, followers_x, verified_x)
VALUES (
  'Barry Ritholtz',
  'Chairman/CIO of RWM. Masters-in-Business podcast/radio host. Director of Cognitive Dissonance.',
  'ELITE',
  'ritholtz',
  124400,
  true
)
ON CONFLICT (name) DO UPDATE SET
  bio = EXCLUDED.bio,
  zone = EXCLUDED.zone,
  handle_x = EXCLUDED.handle_x,
  followers_x = EXCLUDED.followers_x,
  verified_x = EXCLUDED.verified_x;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'x', 'mention', 'Wild elite mention on X', '2026-01-15', now()
FROM handles WHERE name = 'Barry Ritholtz';

-- 16. Chris Mattmann — 18.2K followers → INFLUENTIAL
INSERT INTO handles (name, bio, zone, handle_x, followers_x, verified_x)
VALUES (
  'Chris Mattmann',
  'Chief Data & AI Officer @ucla. @sparlingrb Interests. Opinions all my own.',
  'INFLUENTIAL',
  'chrismattmann',
  18200,
  true
)
ON CONFLICT (name) DO UPDATE SET
  bio = EXCLUDED.bio,
  zone = EXCLUDED.zone,
  handle_x = EXCLUDED.handle_x,
  followers_x = EXCLUDED.followers_x,
  verified_x = EXCLUDED.verified_x;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'x', 'mention', 'Wild elite mention on X', '2026-01-15', now()
FROM handles WHERE name = 'Chris Mattmann';

-- 17. Refik Anadol (@refikinanadol) — 1.37M followers → ELITE
INSERT INTO handles (name, bio, zone, handle_x, followers_x, verified_x)
VALUES (
  'Refik Anadol',
  'Media Artist & Director at RAS. Embedding media arts into architecture with real data and machine intelligence for public art.',
  'ELITE',
  'refikinanadol',
  1377000,
  true
)
ON CONFLICT (name) DO UPDATE SET
  bio = EXCLUDED.bio,
  zone = EXCLUDED.zone,
  handle_x = EXCLUDED.handle_x,
  followers_x = EXCLUDED.followers_x,
  verified_x = EXCLUDED.verified_x;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'x', 'mention', 'Wild elite mention on X', '2026-01-15', now()
FROM handles WHERE name = 'Refik Anadol';

-- 18. Tony Sobrado (@TonySobrado) — 41.5K followers → INFLUENTIAL
INSERT INTO handles (name, bio, zone, handle_x, followers_x, verified_x)
VALUES (
  'Tony Sobrado',
  'Social Scientist, Essayist and Editorial Consultant on philosophy and science, as well as Contributing Editor at the Montreal Review.',
  'INFLUENTIAL',
  'TonySobrado',
  41500,
  false
)
ON CONFLICT (name) DO UPDATE SET
  bio = EXCLUDED.bio,
  zone = EXCLUDED.zone,
  handle_x = EXCLUDED.handle_x,
  followers_x = EXCLUDED.followers_x,
  verified_x = EXCLUDED.verified_x;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'x', 'mention', 'Wild elite mention on X', '2026-01-15', now()
FROM handles WHERE name = 'Tony Sobrado';

-- 19. Gerard Sans | Axiom (@geabordsans) — 35.9K followers → INFLUENTIAL
INSERT INTO handles (name, bio, zone, handle_x, followers_x, verified_x)
VALUES (
  'Gerard Sans',
  'Founder Axiom. Forging skills for the new era of AI. GDE in AI, Cloud & Angular. Building London''s tech & art brand. Speaker/MC.',
  'INFLUENTIAL',
  'geabordsans',
  35900,
  true
)
ON CONFLICT (name) DO UPDATE SET
  bio = EXCLUDED.bio,
  zone = EXCLUDED.zone,
  handle_x = EXCLUDED.handle_x,
  followers_x = EXCLUDED.followers_x,
  verified_x = EXCLUDED.verified_x;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'x', 'mention', 'Wild elite mention on X', '2026-01-15', now()
FROM handles WHERE name = 'Gerard Sans';

-- 20. Gaston Gribet — 32.2K followers → INFLUENTIAL
INSERT INTO handles (name, bio, zone, handle_x, followers_x, verified_x)
VALUES (
  'Gaston Gribet',
  'Physicist - New York University. (Opinions are my own). Ph.D. in Physics, Ph.D. in Philosophy.',
  'INFLUENTIAL',
  'gastongribet',
  32200,
  false
)
ON CONFLICT (name) DO UPDATE SET
  bio = EXCLUDED.bio,
  zone = EXCLUDED.zone,
  handle_x = EXCLUDED.handle_x,
  followers_x = EXCLUDED.followers_x,
  verified_x = EXCLUDED.verified_x;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'x', 'mention', 'Wild elite mention on X', '2026-01-15', now()
FROM handles WHERE name = 'Gaston Gribet';

-- 21. Scott Barry Kaufman (@sbkaufman) — 110.8K followers → ELITE
INSERT INTO handles (name, bio, zone, handle_x, followers_x, verified_x)
VALUES (
  'Scott Barry Kaufman',
  'Scientist | Professor at Columbia | Center for Human Potential | The Psychology Podcast.',
  'ELITE',
  'sbkaufman',
  110800,
  true
)
ON CONFLICT (name) DO UPDATE SET
  bio = EXCLUDED.bio,
  zone = EXCLUDED.zone,
  handle_x = EXCLUDED.handle_x,
  followers_x = EXCLUDED.followers_x,
  verified_x = EXCLUDED.verified_x;

INSERT INTO interactions (handle_id, platform, interaction_type, content, interacted_at, synced_at)
SELECT id, 'x', 'mention', 'Wild elite mention on X', '2026-01-15', now()
FROM handles WHERE name = 'Scott Barry Kaufman';

COMMIT;
