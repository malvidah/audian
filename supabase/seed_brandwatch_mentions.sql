-- Seed file: Brandwatch mentions tracking data (Jan-Sep 2025)
-- Source: Brandwatch Mentions Tracking [MASTER] - BT Combined Tracker
-- Generated: 2026-04-01
-- Total interactions: 327
-- Unique handles: 100

BEGIN;

-- Add new columns if they don't exist yet
ALTER TABLE interactions ADD COLUMN IF NOT EXISTS mention_url text;
ALTER TABLE interactions ADD COLUMN IF NOT EXISTS post_url text;

-- Ensure unique constraint on handles.name
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'handles_name_key'
  ) THEN
    ALTER TABLE handles ADD CONSTRAINT handles_name_key UNIQUE (name);
  END IF;
END $$;

-- ============================================================================
-- HANDLES (100 unique people/orgs)
-- ============================================================================

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Aaron Slodov', 'ELITE', 'aphysicist', 30237)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Adam Singer', 'ELITE', 'AdamSinger', 88418)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Alex Wilhelm', 'ELITE', 'alex', 108090)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Alexandra Churchill', 'ELITE', 'churchill_alex', 46016)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Alexis Ohanian', 'ELITE', 'alexisohanian', 579341)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Andreessen Horowitz', 'ELITE', 'a16z', 832075)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Andrew Bustamente', 'ELITE', 'EverydaySpy', 37272)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Andrew Gazdecki', 'ELITE', 'agazdecki', 272217)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Andrew Mayne', 'ELITE', 'AndrewMayne', 690795)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Anil Ananthaswamy', 'ELITE', 'anilananth', 13983)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Anil Seth', 'ELITE', 'anilkseth', 56560)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Anna Gat', 'ELITE', 'TheAnnaGat', 32486)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Annaka Harris', 'ELITE', 'annakaharris', 44776)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Anne-Laure Le Cunff', 'ELITE', 'neuranne', 68694)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Annie Duke', 'ELITE', 'AnnieDuke', 99653)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Arthur Brooks', 'ELITE', 'arthurbrooks', 110486)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Atul Gawande', 'ELITE', 'Atul_Gawande', 352828)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Aytekin Tank', 'ELITE', 'aytekintank', 92776)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Barry Ritholtz', 'ELITE', 'Ritholtz', 240191)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Ben Horowitz', 'ELITE', 'bhorowitz', 686086)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Betul Kacar', 'ELITE', 'betulland', 71457)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Blake Scholl', 'ELITE', 'bscholl', 112884)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Brian Keating', 'ELITE', 'DrBrianKeating', 52898)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Brian Roemmele', 'ELITE', 'BrianRoemmele', 382344)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Carlos E Perez', 'ELITE', 'IntuitMachine', 38745)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Casey Handmer', 'ELITE', 'CJHandmer', 58977)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Cass Sunstein', 'ELITE', 'CassSunstein', 127232)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Cate Hall', 'ELITE', 'catehall', 25716)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Christian Keil', 'ELITE', 'pronounced_kyle', 37478)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Corey S Powell', 'ELITE', 'coreyspowell', 83098)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Cremieux', 'ELITE', 'cremieuxrecueil', 229555)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Dan Shipper', 'ELITE', 'danshipper', 76355)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Danielle Fong', 'ELITE', 'DanielleFong', 58240)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('David Kipping', 'ELITE', 'david_kipping', 18599)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('David Perell', 'ELITE', 'david_perell', 459061)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('David Senra', 'ELITE', 'FoundersPodcast', 164957)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('David Wallace-Wells', 'ELITE', 'dwallacewells', 94561)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Dillan DiNardo', 'ELITE', 'DillanDiNardo', 5363)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Donald Hoffman', 'ELITE', 'donalddhoffman', 48326)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Erik Brynjolfsson', 'ELITE', 'erikbryn', 211044)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Erik Hoel', 'ELITE', 'erikphoel', 21927)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Ethan Kross', 'ELITE', 'ethan_kross', 5830)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Eugenia Kuyda', 'ELITE', 'ekuyda', 7370)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Eurasia Group', 'ELITE', 'EurasiaGroup', 173136)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Garry Tan', 'ELITE', 'garrytan', 616999)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Grant Trembley', 'ELITE', 'astrogrant', 19318)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Greg Lukianoff', 'ELITE', 'glukianoff', 76402)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Guy Spier', 'ELITE', 'GSpier', 67205)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Harvard Business Review', 'ELITE', 'HarvardBiz', 5824885)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Hiten Shah', 'ELITE', 'hnshah', 266162)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Iain McGilchrist', 'ELITE', 'dr_mcgilchrist', 17352)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Ian Bremmer', 'ELITE', 'ianbremmer', 767906)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Jacob Mchangama', 'ELITE', 'JMchangama', 16499)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('James L H Bartlett', 'ELITE', 'jameslhbartlett', 81474)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Jason Crawford', 'ELITE', 'jasoncrawford', 40564)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Jason Silva', 'ELITE', 'JasonSilva', 153224)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Jim O''Shaughnessy', 'ELITE', 'jposhaughnessy', 186401)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('John Amaechi', 'ELITE', 'JohnAmaechi', 88336)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('John Hagel', 'ELITE', 'jhagel', 34370)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('John Nosta', 'ELITE', 'JohnNosta', 80954)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Jonathan N Stea', 'ELITE', 'jonathanstea', 48170)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Jono Hey', 'ELITE', 'sketchplanator', 24992)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Juliet Schor', 'ELITE', 'JulietSchor', 10004)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Katrina vanden Heuvel', 'ELITE', 'KatrinaNation', 161415)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Ken Liu', 'ELITE', 'kyliu99', 34344)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Kirk Borne', 'ELITE', 'KirkDBorne', 459087)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Kmele Foster', 'ELITE', 'kmele', 133571)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Lawrence Wright', 'ELITE', 'lawrence_wright', 42250)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Louis Anslow', 'ELITE', 'LouisAnslow', 4460)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('MIT Press', 'ELITE', 'mitpress', 74909)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Marcus du Sautoy', 'ELITE', 'MarcusduSautoy', 52180)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Matt Ridley', 'ELITE', 'mattwridley', 135402)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Michael Levin', 'ELITE', 'drmichaellevin', 54691)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Mike Duncan', 'ELITE', 'mikeduncan', 118662)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Morissa Schwartz', 'ELITE', 'MorissaSchwartz', 412741)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Muhammad Lila', 'ELITE', 'MuhammadLila', 36205)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Nait Jones', 'ELITE', 'NaithanJones', 46227)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Noah Smith', 'ELITE', 'Noahpinion', 355270)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Olga Khazan', 'ELITE', 'olgakhazan', 50259)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Pessimists Archive', 'ELITE', 'PessimistsArc', 92887)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Peter Leyden', 'ELITE', 'peteleyden', 4120)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Philip Goff', 'ELITE', 'Philip_Goff', 34172)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Richard Haier', 'ELITE', 'rjhaier', 10625)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Richard Reeves', 'ELITE', 'RichardvReeves', 35251)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Roger L Martin', 'ELITE', 'RogerLMartin', 33054)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Roon', 'ELITE', 'tszzl', 260372)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Rory Sutherland', 'ELITE', 'rorysutherland', 133232)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Sahil Bloom', 'ELITE', 'SahilBloom', 1059984)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Sally Satel', 'ELITE', 'slsatel', 7961)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Scott DIkkers', 'ELITE', 'ScottDikkers', 6829)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Scott Derrickson', 'ELITE', 'scottderrickson', 149270)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Shashank Joshi', 'ELITE', 'AskDrShashank', 32519)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Sonal Chokshi', 'ELITE', 'smc90', 37885)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Steve Hanke', 'ELITE', 'steve_hanke', 802689)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('The SETI Institute', 'ELITE', 'SETIInstitute', 702185)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Tiago Forte', 'ELITE', 'fortelabs', 142247)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Timothy Caulfield', 'ELITE', 'CaulfieldTim', 88879)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Tyler Cowen', 'ELITE', 'tylercowen', 255898)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Yuval Noah Harari', 'ELITE', 'harari_yuval', 640235)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

INSERT INTO handles (name, zone, handle_x, followers_x)
VALUES ('Zach Mercurio', 'ELITE', 'ZachMercurio', 7970)
ON CONFLICT (name) DO UPDATE SET
  zone = CASE WHEN handles.zone = 'ELITE' THEN 'ELITE' ELSE EXCLUDED.zone END,
  handle_x = COALESCE(EXCLUDED.handle_x, handles.handle_x),
  followers_x = GREATEST(COALESCE(EXCLUDED.followers_x, 0), COALESCE(handles.followers_x, 0));

-- ============================================================================
-- INTERACTIONS (327 mentions)
-- ============================================================================

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @nemocentric In the 1500s, Paracelsus said stars "have nothing to do" with our bodies... 

In the 1800s, spectroscopy disproved this, implying we are their siblings, made from identical stuff.

In the 1900s, scientists realised they are our parents: they forged us.

👉https://t.co/FJ952RpaTQ',
  'http://twitter.com/JasonSilva/statuses/1875284990663274662',
  'https://bigthink.com/the-past/how-we-discovered-were-all-made-of-star-stuff/',
  '2025-01-03'::timestamptz, now()
FROM handles h WHERE h.name = 'Jason Silva';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Were we all made from stars? https://t.co/kFHmYeJHdR',
  'http://twitter.com/jhagel/statuses/1876269015045390612',
  'https://bigthink.com/the-past/how-we-discovered-were-all-made-of-star-stuff/',
  '2025-01-06'::timestamptz, now()
FROM handles h WHERE h.name = 'John Hagel';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  '“In the year 2000, physicists gathered to compose a list of the 10 most important unsolved problems in fundamental physics…Here’s the progress we have, and haven’t, made.”

https://t.co/FRWKrUEvUX',
  'http://twitter.com/donalddhoffman/statuses/1876645983435841605',
  'https://bigthink.com/starts-with-a-bang/update-millennium-problems-physics/',
  '2025-01-07'::timestamptz, now()
FROM handles h WHERE h.name = 'Donald Hoffman';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  'My favourite research finding of the last ten years is that about 40% of ants basically do fuck all. They are there to step into the breach in the event of a crisis.',
  'http://twitter.com/rorysutherland/statuses/1876773274878607609',
  'https://bigthink.com/the-long-game/the-rory-sutherland-interview-bees-magic-and-the-folly-of-laplaces-demon/',
  '2025-01-07'::timestamptz, now()
FROM handles h WHERE h.name = 'Rory Sutherland';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@walterkirn https://t.co/zsCHPtDVWw',
  'http://twitter.com/jposhaughnessy/statuses/1877036282435510430',
  'https://bigthink.com/the-long-game/the-kevin-kelly-interview-the-power-of-radical-optimism/',
  '2025-01-08'::timestamptz, now()
FROM handles h WHERE h.name = 'Jim O''Shaughnessy';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Catchy news stories repeatedly spread bold claims like "new theory overturns cosmology," which then seem to vanish without a trace. 
Here''s a peek behind the scenes. A recent study allegedly debunked dark energy -- but it has big problems of its own.
https://t.co/xrWMjKqgaU https://t.co/YfBAgIn0Fg',
  'http://twitter.com/coreyspowell/statuses/1877170998329413997',
  'https://bigthink.com/starts-with-a-bang/lumpy-explain-dark-energy/',
  '2025-01-09'::timestamptz, now()
FROM handles h WHERE h.name = 'Corey S Powell';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink The ‘self’ and free will — two glitches within reality, explained by @annakaharris. 

Timestamps:
0:00 - Illusions as glitches
0:56 - Conscious will vs. free will
2:29 - Illusion of self
5:55 - Change blindness https://t.co/9OHtLDpPTz',
  'http://twitter.com/annakaharris/statuses/1877831220845056360',
  NULL,
  '2025-01-10'::timestamptz, now()
FROM handles h WHERE h.name = 'Annaka Harris';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink According to @RorySutherland, companies tend to over invest in short-term, fast feedback activities. 

Why? An obsession with quantification. 

Big data is not useful for predicting the far-out future. 

Slow processes, that are needed for exponential growth, are hard to measure. https://t.co/Gh9CF2ywxq',
  'http://twitter.com/rorysutherland/statuses/1879011299658813615',
  'https://bigthink.com/the-long-game/the-rory-sutherland-interview-bees-magic-and-the-folly-of-laplaces-demon/',
  '2025-01-14'::timestamptz, now()
FROM handles h WHERE h.name = 'Rory Sutherland';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink As you’re reading this, you may feel like there is a “you” in your head, making decisions and controlling everything. @annakaharris explains why this might just be an illusion. https://t.co/lY1UCB3Jdq',
  'http://twitter.com/annakaharris/statuses/1879211471445577819',
  NULL,
  '2025-01-14'::timestamptz, now()
FROM handles h WHERE h.name = 'Annaka Harris';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@cremieuxrecueil Sources:

https://t.co/nR7pkyT8O0

https://t.co/YIgjZaFYUL',
  'http://twitter.com/cremieuxrecueil/statuses/1879307073680511024',
  'https://bigthink.com/the-present/gender-stereotyped-toys/',
  '2025-01-14'::timestamptz, now()
FROM handles h WHERE h.name = 'Cremieux';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  '“The G-Zero world and America First are working together in lockstep,” says @ianbremmer.

“And that means more ungoverned spaces, more rogue actors, more geopolitical instability and more conflict.”

@BigThink #TopRisks2025
https://t.co/FsgAS0LJCA',
  'http://twitter.com/EurasiaGroup/statuses/1879604544889348489',
  'https://bigthink.com/series/the-big-think-interview/ian-bremmer-2025-risks/',
  '2025-01-15'::timestamptz, now()
FROM handles h WHERE h.name = 'Eurasia Group';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  '10 profound answers about the math behind AI

It’s knowledgeable, confident, and behaves human-like in many ways. But it’s not magic that powers AI though; it’s just math and data. My Q&A for @bigthink with @StartsWithABang 

https://t.co/dsepGHb3NA',
  'http://twitter.com/anilananth/statuses/1881876944096260134',
  'https://bigthink.com/starts-with-a-bang/10-answers-math-artificial-intelligence/',
  '2025-01-22'::timestamptz, now()
FROM handles h WHERE h.name = 'Anil Ananthaswamy';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink A new cold war between the US and China?

@IanBremmer warns of increasing conflict between the two most powerful countries in 2025. https://t.co/rzuLbvFceK',
  'http://twitter.com/ianbremmer/statuses/1882182358557937669',
  'https://bigthink.com/series/the-big-think-interview/ian-bremmer-2025-risks/',
  '2025-01-22'::timestamptz, now()
FROM handles h WHERE h.name = 'Ian Bremmer';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink What allows AI to learn? 

Ethan Siegel (@StartsWithABang) sits down with Anil Ananthaswamy (@anilananth), author of Why Machines Learn: The Elegant Math Behind Modern AI. https://t.co/qKEERoj9PG',
  'http://twitter.com/anilananth/statuses/1883971406133879014',
  'https://bigthink.com/starts-with-a-bang/10-answers-math-artificial-intelligence/',
  '2025-01-27'::timestamptz, now()
FROM handles h WHERE h.name = 'Anil Ananthaswamy';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @anilananth 10 profound answers about the math behind AI

It’s knowledgeable, confident, and behaves human-like in many ways. But it’s not magic that powers AI though; it’s just math and data. My Q&A for @bigthink with @StartsWithABang 

https://t.co/dsepGHb3NA',
  'http://twitter.com/anilananth/statuses/1884334979183960070',
  'https://bigthink.com/starts-with-a-bang/10-answers-math-artificial-intelligence/',
  '2025-01-28'::timestamptz, now()
FROM handles h WHERE h.name = 'Anil Ananthaswamy';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Hey, I just clicked on my Big Think video on The Art of War and it just hit the 1-million view mark. Cool. https://t.co/9ee0ozErgI',
  'http://twitter.com/RogerLMartin/statuses/1884361199497736639',
  'https://www.youtube.com/watch?v=g_tmTYznG3o',
  '2025-01-28'::timestamptz, now()
FROM handles h WHERE h.name = 'Roger L Martin';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@coreyspowell New findings from JWST bolster the case that a lot of the heavy elements in the universe (including most of the gold on Earth) formed during collisions between neutron stars. 

https://t.co/5mcUvDNsFp',
  'http://twitter.com/coreyspowell/statuses/1884391740192231566',
  'https://bigthink.com/starts-with-a-bang/jwst-colliding-neutron-star/',
  '2025-01-29'::timestamptz, now()
FROM handles h WHERE h.name = 'Corey S Powell';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Discover five ways AI can help your teams work smarter, collaborate better, and achieve more together.
https://t.co/3kpN9JE0Qh',
  'http://twitter.com/aytekintank/statuses/1884576653029892504',
  'https://bigthink.com/business/5-ways-ai-can-create-stronger-teams/',
  '2025-01-29'::timestamptz, now()
FROM handles h WHERE h.name = 'Aytekin Tank';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  'The CMB: The most important discovery in cosmic history

First discovered in the mid-1960s, no cosmic signal has taught us more about the Universe, or spurred more controversy, than the CMB.',
  'http://twitter.com/Ritholtz/statuses/1884822009336430693',
  'https://bigthink.com/starts-with-a-bang/cmb-discovery-cosmic-history/',
  '2025-01-30'::timestamptz, now()
FROM handles h WHERE h.name = 'Barry Ritholtz';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@MarktheSpaman @bigthink 🙏🙏',
  'http://twitter.com/jonathanstea/statuses/1884957128412246170',
  'https://bigthink.com/health/the-unsavory-history-of-the-wellness-industry/',
  '2025-01-30'::timestamptz, now()
FROM handles h WHERE h.name = 'Jonathan N Stea';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Do anesthesia-induced dreams have therapeutic potential? https://t.co/HAzb4WJaTk',
  'http://twitter.com/jhagel/statuses/1884970952657887284',
  'https://bigthink.com/neuropsych/inside-the-emerging-world-of-anesthesia-dream-therapy/',
  '2025-01-30'::timestamptz, now()
FROM handles h WHERE h.name = 'John Hagel';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@bigthink Thank you so much for sharing! 😊🙏',
  'http://twitter.com/jonathanstea/statuses/1885095584698425654',
  'https://bigthink.com/health/the-unsavory-history-of-the-wellness-industry/',
  '2025-01-30'::timestamptz, now()
FROM handles h WHERE h.name = 'Jonathan N Stea';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@coreyspowell The story of the "little red dot" galaxies shows how much we still have to learn about the universe. 

It''s also a good case study in not falling for clickbait stories about how some new discovery has "broken" science. Stay curious & keep learning.

https://t.co/TkMbJw9NeM https://t.co/0PVPGjRLCU',
  'http://twitter.com/coreyspowell/statuses/1886119159215304964',
  'https://bigthink.com/starts-with-a-bang/jwst-solves-mystery-little-red-dots/',
  '2025-02-02'::timestamptz, now()
FROM handles h WHERE h.name = 'Corey S Powell';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink What if the key to innovation, longevity, and success is inefficiency? 

@EricMarkowitz and @RorySutherland discuss what we can learn from bees, magic, and “Laplace’s demon”. https://t.co/vGJcW1CYv0',
  'http://twitter.com/rorysutherland/statuses/1887802991928868882',
  'https://bigthink.com/the-long-game/the-rory-sutherland-interview-bees-magic-and-the-folly-of-laplaces-demon/',
  '2025-02-07'::timestamptz, now()
FROM handles h WHERE h.name = 'Rory Sutherland';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Can math be beautiful? 

Mathematician and philosopher @MarcusduSautoy thinks so. He sees art and math as two sides of the same coin. https://t.co/xAT3NWwZgT',
  'http://twitter.com/MarcusduSautoy/statuses/1887825331731505170',
  NULL,
  '2025-02-07'::timestamptz, now()
FROM handles h WHERE h.name = 'Marcus du Sautoy';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Can art be explained through math?

Jonny Thomson (@philosophyminis) interviews @marcusdusautoy to explore the hidden mathematics behind why we find things beautiful. https://t.co/WPTXjFg0zG',
  'http://twitter.com/MarcusduSautoy/statuses/1887826264267854186',
  'https://bigthink.com/mini-philosophy/the-hidden-mathematics-behind-why-you-find-things-beautiful/',
  '2025-02-07'::timestamptz, now()
FROM handles h WHERE h.name = 'Marcus du Sautoy';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink @philosophyminis @MarcusduSautoy For more on formalism and the mathematics of beauty, read the full story on Big Think:

https://t.co/jvYguIOMiL',
  'http://twitter.com/MarcusduSautoy/statuses/1887826279560323531',
  'https://bigthink.com/mini-philosophy/the-hidden-mathematics-behind-why-you-find-things-beautiful/',
  '2025-02-07'::timestamptz, now()
FROM handles h WHERE h.name = 'Marcus du Sautoy';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'https://t.co/GcBu2TCFhw
A new study explores how far away an Earth-like civilization could detect Earth’s technosignatures, such as planetary radar, deep-space transmissions, and atmospheric pollution, using present-day technology. The findings reveal that while some signals,…',
  'http://twitter.com/SETIInstitute/statuses/1887976379557269917',
  'https://bigthink.com/13-8/at-what-distance-could-a-twin-earth-detect-our-signals/',
  '2025-02-07'::timestamptz, now()
FROM handles h WHERE h.name = 'The SETI Institute';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink What if we embraced all of our emotions as crucial signals, even the negative ones? 

In conversation with Psychologist and Author, Ethan Kross (@ethan_kross), @KevinRDickinson explores a new perspective on negative emotions.

“At one point, poking holes in people’s frontal… https://t.co/xtwi5JabgK',
  'http://twitter.com/ethan_kross/statuses/1888415828347146426',
  'https://bigthink.com/neuropsych/a-new-perspective-on-negative-emotions/',
  '2025-02-09'::timestamptz, now()
FROM handles h WHERE h.name = 'Ethan Kross';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@bigthink As an avid Big Think fan, this was a real treat. I hope others are as inspired by the conversation as I was!',
  'http://twitter.com/SahilBloom/statuses/1889026238532222984',
  'https://bigthink.com/thinking/the-5-types-of-wealth-why-youre-wealthier-than-you-think/',
  '2025-02-10'::timestamptz, now()
FROM handles h WHERE h.name = 'Sahil Bloom';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'What''s So Elegant About the Math of Machine Learning? I have often been asked this question, given it''s the sub-title of WHY MACHINES LEARN, including by @MLStreetTalk''s Tim Scarfe, by @StartsWithABang for @bigthink, and others.

If you have been studying machine learning for a… https://t.co/7wZoRHQPti',
  'http://twitter.com/anilananth/statuses/1889329783068320144',
  NULL,
  '2025-02-11'::timestamptz, now()
FROM handles h WHERE h.name = 'Anil Ananthaswamy';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@BeLikeWahter @MLStreetTalk @StartsWithABang @bigthink Thank you! Very nice of you to do so.',
  'http://twitter.com/anilananth/statuses/1889354634986475550',
  NULL,
  '2025-02-11'::timestamptz, now()
FROM handles h WHERE h.name = 'Anil Ananthaswamy';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @anilananth What''s So Elegant About the Math of Machine Learning? I have often been asked this question, given it''s the sub-title of WHY MACHINES LEARN, including by @MLStreetTalk''s Tim Scarfe, by @StartsWithABang for @bigthink, and others.

If you have been studying machine learning for a… https://t.co/7wZoRHQPti',
  'http://twitter.com/anilananth/statuses/1889370240641065090',
  NULL,
  '2025-02-11'::timestamptz, now()
FROM handles h WHERE h.name = 'Anil Ananthaswamy';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  '“Is the Universe we understand today truly all there is out there? It can’t be. Until we’ve discovered the last of nature’s secrets about what’s truly fundamental, we cannot allow ourselves to stop the search.” 
The truly fundamental is beyond spacetime.

https://t.co/RUppI9TUiJ',
  'http://twitter.com/donalddhoffman/statuses/1890057909855482073',
  'https://bigthink.com/starts-with-a-bang/how-small-fundamental-particles/',
  '2025-02-13'::timestamptz, now()
FROM handles h WHERE h.name = 'Donald Hoffman';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Exploring the wild & disturbing world of "scienceploitation" https://t.co/KkjWqlbJMK by @SteRoPo via @bigthink🙏cc @PenguinCanada 

"Timothy Caulfield, a leading science communicator, discusses the challenges of combatting misinformation in an age of information overload."',
  'http://twitter.com/CaulfieldTim/statuses/1890095297784865157',
  'https://bigthink.com/thinking/scienceploitation/',
  '2025-02-13'::timestamptz, now()
FROM handles h WHERE h.name = 'Timothy Caulfield';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @donalddhoffman “Is the Universe we understand today truly all there is out there? It can’t be. Until we’ve discovered the last of nature’s secrets about what’s truly fundamental, we cannot allow ourselves to stop the search.” 
The truly fundamental is beyond spacetime.

https://t.co/RUppI9TUiJ',
  'http://twitter.com/JasonSilva/statuses/1890109392923816232',
  'https://bigthink.com/starts-with-a-bang/how-small-fundamental-particles/',
  '2025-02-13'::timestamptz, now()
FROM handles h WHERE h.name = 'Jason Silva';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@dan_hayes I love Big Think. Can’t wait to do more together.',
  'http://twitter.com/SahilBloom/statuses/1890741451308376546',
  'https://bigthink.com/thinking/the-5-types-of-wealth-why-youre-wealthier-than-you-think/',
  '2025-02-15'::timestamptz, now()
FROM handles h WHERE h.name = 'Sahil Bloom';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'How small are the fundamental particles of the universe? https://t.co/2QGrY5miI6',
  'http://twitter.com/jhagel/statuses/1890773240055763315',
  'https://bigthink.com/starts-with-a-bang/how-small-fundamental-particles/',
  '2025-02-15'::timestamptz, now()
FROM handles h WHERE h.name = 'John Hagel';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'This was such a fun interview! Thank you @EricMarkowitz for having me – I’m a long-time fan of @bigthink so it’s an honor to discuss my upcoming book in your column. https://t.co/mmGAid6cDw',
  'http://twitter.com/neuranne/statuses/1891998440881578150',
  'https://bigthink.com/the-long-game/the-anne-laure-le-cunff-interview-how-to-become-the-scientist-of-your-own-life/',
  '2025-02-18'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@EricMarkowitz @bigthink Thank you so much for the thoughtful questions, Eric! I love it when an interview makes me think even deeper about ideas I’ve been exploring for a long time.',
  'http://twitter.com/neuranne/statuses/1891998990008295829',
  'https://bigthink.com/the-long-game/the-anne-laure-le-cunff-interview-how-to-become-the-scientist-of-your-own-life/',
  '2025-02-18'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @neuranne This was such a fun interview! Thank you @EricMarkowitz for having me – I’m a long-time fan of @bigthink so it’s an honor to discuss my upcoming book in your column. https://t.co/mmGAid6cDw',
  'http://twitter.com/hnshah/statuses/1892001053589012980',
  'https://bigthink.com/the-long-game/the-anne-laure-le-cunff-interview-how-to-become-the-scientist-of-your-own-life/',
  '2025-02-18'::timestamptz, now()
FROM handles h WHERE h.name = 'Hiten Shah';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@WagersScott @EricMarkowitz @bigthink Thanks so much!',
  'http://twitter.com/neuranne/statuses/1892208577151938971',
  'https://bigthink.com/the-long-game/the-anne-laure-le-cunff-interview-how-to-become-the-scientist-of-your-own-life/',
  '2025-02-19'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@pr3sc0ttt @EricMarkowitz @bigthink @BobbyHugh @seantmcvey @chandlertuttle This was a written interview but we recorded a separate video interview so stay tuned :)',
  'http://twitter.com/neuranne/statuses/1892320851338395792',
  'https://bigthink.com/the-long-game/the-anne-laure-le-cunff-interview-how-to-become-the-scientist-of-your-own-life/',
  '2025-02-19'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@labs_sen @EricMarkowitz @bigthink Here you go

https://t.co/VTLwuo9ROA',
  'http://twitter.com/neuranne/statuses/1892321051998048642',
  'https://bigthink.com/the-long-game/the-anne-laure-le-cunff-interview-how-to-become-the-scientist-of-your-own-life/',
  '2025-02-19'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink What if everyone was the scientist of their own life? 

Neuroscientist and entrepreneur Anne-Laure Le Cunff (@neuranne) challenges us to “break free from linear thinking” by embracing experimentation. https://t.co/w9oUeYeREu',
  'http://twitter.com/neuranne/statuses/1892621795657744716',
  'https://bigthink.com/the-long-game/the-anne-laure-le-cunff-interview-how-to-become-the-scientist-of-your-own-life/',
  '2025-02-20'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  '“What if medicine could harness the body’s innate healing ability with precision, using technology to direct the body to repair damaged tissues and organs, or even regenerate them entirely?” 

Mike Levin is brilliant.

https://t.co/2StfGcwA1C',
  'http://twitter.com/donalddhoffman/statuses/1893829595209568374',
  'https://bigthink.com/health/the-quest-for-a-communication-device-that-tells-cells-to-regenerate-the-body/',
  '2025-02-24'::timestamptz, now()
FROM handles h WHERE h.name = 'Donald Hoffman';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @donalddhoffman “What if medicine could harness the body’s innate healing ability with precision, using technology to direct the body to repair damaged tissues and organs, or even regenerate them entirely?” 

Mike Levin is brilliant.

https://t.co/2StfGcwA1C',
  'http://twitter.com/JasonSilva/statuses/1893932748366037258',
  'https://bigthink.com/health/the-quest-for-a-communication-device-that-tells-cells-to-regenerate-the-body/',
  '2025-02-24'::timestamptz, now()
FROM handles h WHERE h.name = 'Jason Silva';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @MacrinePhD Regenerative medicine is revolutionizing healthcare! 🧬 From stem cell therapy treating cancers to bioelectric medicine regrowing limbs, unlocking the body''s incredible healing power
https://t.co/RBYToByCbH
#RegenerativeMedicine #StemCells #BioelectricMedicine
#biohacking',
  'http://twitter.com/JasonSilva/statuses/1894385765469040806',
  'https://bigthink.com/health/the-quest-for-a-communication-device-that-tells-cells-to-regenerate-the-body/',
  '2025-02-25'::timestamptz, now()
FROM handles h WHERE h.name = 'Jason Silva';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'What if medicine could use technology to direct the body to repair damaged tissues and organs, or even regenerate them entirely? https://t.co/M5IWXrS2sc',
  'http://twitter.com/jhagel/statuses/1894387938118832367',
  'https://bigthink.com/health/the-quest-for-a-communication-device-that-tells-cells-to-regenerate-the-body/',
  '2025-02-25'::timestamptz, now()
FROM handles h WHERE h.name = 'John Hagel';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @SavageFridays What happens when we embrace "systematic curiosity"? It''s a powerful question from @neuranne. 

"Instead of following a predetermined path...you explore interesting questions through experimentation. The timelines are longer and the journey more rewarding" https://t.co/SBgHhpCb1E',
  'http://twitter.com/neuranne/statuses/1894768425160892532',
  'https://bigthink.com/the-long-game/the-anne-laure-le-cunff-interview-how-to-become-the-scientist-of-your-own-life/',
  '2025-02-26'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  'Fascinating.',
  'http://twitter.com/KatrinaNation/statuses/1894967723828060550',
  'https://bigthink.com/the-long-game/the-anne-laure-le-cunff-interview-how-to-become-the-scientist-of-your-own-life/',
  '2025-02-27'::timestamptz, now()
FROM handles h WHERE h.name = 'Katrina vanden Heuvel';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @MiaMakesMagic Another @bigthink video with @RichardvReeves this time targeting the "Friendship Recession" as some call it.

We are seeing a rapid shift in our culture due to technology and social media and its hard to keep up and adapt. https://t.co/kjsQHQTUXe',
  'http://twitter.com/RichardvReeves/statuses/1895096181400748039',
  'https://bigthink.com/series/explain-it-like-im-smart/friendship-recession/',
  '2025-02-27'::timestamptz, now()
FROM handles h WHERE h.name = 'Richard Reeves';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink What if we could harness the past as a tool for survival and adaptation? 

Dr. Betül Kaçar (@betulland) is resurrecting ancient versions of nitrogenase, the only enzyme that allows life to use nitrogen. https://t.co/tP1MStSRFv',
  'http://twitter.com/betulland/statuses/1895240760083280150',
  'https://bigthink.com/life/the-lab-resurrecting-ancient-proteins-to-unlock-lifes-secrets/',
  '2025-02-27'::timestamptz, now()
FROM handles h WHERE h.name = 'Betul Kacar';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@bigthink @TuftsUniversity @SagaMilena Thank you @bigthink and @SagaMilena !',
  'http://twitter.com/drmichaellevin/statuses/1897111319058497897',
  'https://bigthink.com/health/the-quest-for-a-communication-device-that-tells-cells-to-regenerate-the-body/',
  '2025-03-05'::timestamptz, now()
FROM handles h WHERE h.name = 'Michael Levin';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@EricMarkowitz @bigthink I love this! And our interview is still one of my favorite ones!',
  'http://twitter.com/neuranne/statuses/1897518191066091652',
  'https://bigthink.com/the-long-game/the-anne-laure-le-cunff-interview-how-to-become-the-scientist-of-your-own-life/',
  '2025-03-06'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink @betulland Read the full article from Jasna Hodžić:

https://t.co/74o4vtzuqF',
  'http://twitter.com/betulland/statuses/1897643832700809285',
  'https://bigthink.com/life/the-lab-resurrecting-ancient-proteins-to-unlock-lifes-secrets/',
  '2025-03-06'::timestamptz, now()
FROM handles h WHERE h.name = 'Betul Kacar';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Are hidden ‘scripts’ dictating your life choices? @neuranne #emotionalintelligence #lifelonglearning #psychology https://t.co/oKJhCAF86S',
  'http://twitter.com/neuranne/statuses/1898067703446819072',
  'https://bigthink.com/smart-skills/the-3-cognitive-scripts-that-subtly-rule-our-lives/',
  '2025-03-07'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'While death-bed utterances are more famous, baby’s first words have influenced us too. Linguist Michael Erard writes in praise of history’s famous first words for @bigthink: https://t.co/8fs3nzGFe2',
  'http://twitter.com/mitpress/statuses/1898128525950935522',
  'https://bigthink.com/the-past/famous-first-words/',
  '2025-03-07'::timestamptz, now()
FROM handles h WHERE h.name = 'MIT Press';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  '“Well done and trustworthy science is the essential guidepost for our chaotic information ecosystem. Without it, we are lost,” Timothy Caulfield writes in his new book, The Certainty Illusion: What You Don’t Know and Why It Matters.

From @bigthink: https://t.co/KkjWqlbJMK https://t.co/yg4KXVqKHl',
  'http://twitter.com/CaulfieldTim/statuses/1898756207256703355',
  'https://bigthink.com/thinking/scienceploitation/',
  '2025-03-09'::timestamptz, now()
FROM handles h WHERE h.name = 'Timothy Caulfield';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Who truly holds power in society – the fact-checkers or the storytellers?

From a 2024 interview with @andrewrsorkin on @bigthink available here: https://t.co/QSmWuqFeLt

#Storytelling #Power #Facts https://t.co/t6GFSUDpre',
  'http://twitter.com/harari_yuval/statuses/1899134242983956728',
  NULL,
  '2025-03-10'::timestamptz, now()
FROM handles h WHERE h.name = 'Yuval Noah Harari';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink The difference between bosses and leaders? 
Bosses gather information to make decisions.
Leaders delegate authority to those that have the information. 
@jonohey @sketchplanator https://t.co/2yN4iS9XYt',
  'http://twitter.com/sketchplanator/statuses/1899822264956145777',
  'https://bigthink.com/business/better-leadership-in-3-sketchplanations/',
  '2025-03-12'::timestamptz, now()
FROM handles h WHERE h.name = 'Jono Hey';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@bigthink @bhorowitz 👏👏',
  'http://twitter.com/a16z/statuses/1899873134263541864',
  NULL,
  '2025-03-12'::timestamptz, now()
FROM handles h WHERE h.name = 'Andreessen Horowitz';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink The best leadership advice? Quit being a coward and do the hard thing, says @bhorowitz, co-founder of @a16z.

Timestamps
0:00 - Complicated emotional challenges
1:19 - Management debt
2:42 - Wartime conditions
4:43 - Choosing courage',
  'http://twitter.com/kmele/statuses/1899875030965850270',
  NULL,
  '2025-03-12'::timestamptz, now()
FROM handles h WHERE h.name = 'Kmele Foster';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Can we change our personalities? @OlgaKhazan https://t.co/yQwRJ74szI',
  'http://twitter.com/olgakhazan/statuses/1899893556170678284',
  'https://bigthink.com/neuropsych/big-5-personality-traits-you-can-change-with-practice/',
  '2025-03-12'::timestamptz, now()
FROM handles h WHERE h.name = 'Olga Khazan';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink The best leadership advice? Quit being a coward and do the hard thing, says @bhorowitz, co-founder of @a16z.

Timestamps
0:00 - Complicated emotional challenges
1:19 - Management debt
2:42 - Wartime conditions
4:43 - Choosing courage',
  'http://twitter.com/NaithanJones/statuses/1899929172778107078',
  NULL,
  '2025-03-12'::timestamptz, now()
FROM handles h WHERE h.name = 'Nait Jones';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @divine4thletter “The Hard Thing About Hard Things, is nothing easy / And the hard thing about harder things, still nothing easy.” 

—@4thlettermusic, “Venture Capitalist (Like @bhorowitz) https://t.co/uNFE5jeUTC',
  'http://twitter.com/bhorowitz/statuses/1900084112934985798',
  NULL,
  '2025-03-13'::timestamptz, now()
FROM handles h WHERE h.name = 'Ben Horowitz';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @freethinkmedia Interview with @bhorowitz from @a16z now on our sister publication, @bigthink. https://t.co/kYMZ7HsFpk',
  'http://twitter.com/bhorowitz/statuses/1900084190575813000',
  NULL,
  '2025-03-13'::timestamptz, now()
FROM handles h WHERE h.name = 'Ben Horowitz';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Here are 3 Leadership frameworks (in sketches) that have served me again and again.

I wrote an article for @bigthink : Better Leadership in 3 Sketchplanations
https://t.co/6AnQTqTpbH 

It covers 3 of the most impactful changes in my behaviour as a leader:
- Pushing authority to information — from David Marquet
- Tapping the power of Autonomy, Mastery, and Purpose — from @DanielPink 
- Leading from any chair — from Ben Zander

Have a read. I hope you find it useful!',
  'http://twitter.com/sketchplanator/statuses/1900147895032033743',
  'https://bigthink.com/business/better-leadership-in-3-sketchplanations/',
  '2025-03-13'::timestamptz, now()
FROM handles h WHERE h.name = 'Jono Hey';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  '11 fun π facts to help celebrate #PiDay: https://t.co/RCBKt5qhRq by @bigthink
 ————
#PiDay2025 #PiDay25 #Mathematics https://t.co/lyPOa6UP0c',
  'http://twitter.com/KirkDBorne/statuses/1900565331006923081',
  'https://bigthink.com/starts-with-a-bang/pi-day/',
  '2025-03-14'::timestamptz, now()
FROM handles h WHERE h.name = 'Kirk Borne';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @EricMarkowitz "Progress happens because solutions create new problems to solve"

I thoroughly enjoyed @jasoncrawford''s latest piece in @freethinkmedia, which I featured in The Nightcrawler for @bigthink this week. 

Great weekend read. Link below. https://t.co/qQthW7LpY6',
  'http://twitter.com/jasoncrawford/statuses/1900611743937949876',
  'https://bigthink.com/business/an-investigative-approach-to-stock-investing/',
  '2025-03-14'::timestamptz, now()
FROM handles h WHERE h.name = 'Jason Crawford';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink "There are 3 subconscious mindsets that get in the way of us leading happy conscious lives." — Anne-Laure Le Cunff (@neuranne).

Once we become aware of them, we can change them. https://t.co/Lts3ELo2wG',
  'http://twitter.com/fortelabs/statuses/1900656863483404779',
  NULL,
  '2025-03-14'::timestamptz, now()
FROM handles h WHERE h.name = 'Tiago Forte';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@roddaut @bigthink @fortelabs High curiosity and high ambition is an experimental mindset!

https://t.co/cbr2ZlnUMt',
  'http://twitter.com/neuranne/statuses/1901173583394566481',
  NULL,
  '2025-03-16'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink "There are 3 subconscious mindsets that get in the way of us leading happy conscious lives." — Anne-Laure Le Cunff (@neuranne).

Once we become aware of them, we can change them. https://t.co/Lts3ELo2wG',
  'http://twitter.com/neuranne/statuses/1901173608103219496',
  NULL,
  '2025-03-16'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Great leaders don’t run from hard decisions – they run towards “pain and darkness,” for the benefit of their companies, @bhorowitz says.

He explains why: https://t.co/7W7X6jJq8A

@bigthink https://t.co/U0yXCqRAH1',
  'http://twitter.com/a16z/statuses/1901379976437420283',
  NULL,
  '2025-03-16'::timestamptz, now()
FROM handles h WHERE h.name = 'Andreessen Horowitz';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Thank you Lucy Handley @lucyhandley for asking some difficult questions in this interview for Big Think @bigthink 

For example: Where I find meaning in my life?

Part of my answer: 

We ignore the non-financial aspects of our balance sheet to our detriment.

Read it all here: https://t.co/PwxIgCiVSb',
  'http://twitter.com/GSpier/statuses/1902029722957066521',
  'https://bigthink.com/business/what-i-learned-over-lunch-with-warren-buffett/',
  '2025-03-18'::timestamptz, now()
FROM handles h WHERE h.name = 'Guy Spier';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Thank you Lucy Handley for asking me some difficult questions in this interview for Big Think 

For example: Where I find meaning in my life?

Part of my answer: we ignore the non-financial aspects of our balance sheet to our detriment.

Read it all here: https://t.co/JF4X5xoVal',
  'http://twitter.com/GSpier/statuses/1902037244686577940',
  'https://bigthink.com/business/what-i-learned-over-lunch-with-warren-buffett/',
  '2025-03-18'::timestamptz, now()
FROM handles h WHERE h.name = 'Guy Spier';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Thank you Lucy Handley for asking me some difficult questions in this interview for Big Think 

For example: Where I find meaning in my life?

Part of my answer: we ignore the non-financial aspects of our balance sheet to our detriment.

Read it all here: https://t.co/JF4X5xonkN',
  'http://twitter.com/GSpier/statuses/1902037244568907915',
  'https://bigthink.com/business/what-i-learned-over-lunch-with-warren-buffett/',
  '2025-03-18'::timestamptz, now()
FROM handles h WHERE h.name = 'Guy Spier';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'The act of self-reflection on one’s own, or in a group with the help of a significant other, is a more meaningful way to live one’s life. When you go into therapy, you’re going into a personal adventure, maybe the only adventure that counts.

https://t.co/JF4X5xonkN',
  'http://twitter.com/GSpier/statuses/1902040551727210553',
  'https://bigthink.com/business/what-i-learned-over-lunch-with-warren-buffett/',
  '2025-03-18'::timestamptz, now()
FROM handles h WHERE h.name = 'Guy Spier';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Curiosity and ambition is a powerful combo 🤺

 https://t.co/bhdLdV7qz4',
  'http://twitter.com/ekuyda/statuses/1902062571336978433',
  NULL,
  '2025-03-18'::timestamptz, now()
FROM handles h WHERE h.name = 'Eugenia Kuyda';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'AI has the potential to fragment our attention and make it even more difficult for us to be our best selves. To better deal with the deluge of information, leaders need to develop a deliberate, meaningful approach to managing the inner game of leadership. @RasmusTPP & Jacqueline Carter, authors of More Human, on @bigthink https://t.co/Y06ijAnlAp',
  'http://twitter.com/HarvardBiz/statuses/1902382093738398055',
  'https://bigthink.com/business/why-inner-stillness-is-crucial-for-leaders-in-the-age-of-ai/',
  '2025-03-19'::timestamptz, now()
FROM handles h WHERE h.name = 'Harvard Business Review';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Thank you Lucy Handley @lucyhandley for asking some difficult questions in this interview for Big Think @bigthink 

For example: where I find meaning in my life?

We ignore the non-financial aspects of our balance sheet to our detriment.

 https://t.co/QLCTYsNWb7 https://t.co/KFQqisiwEl',
  'http://twitter.com/GSpier/statuses/1902752354723938508',
  'https://bigthink.com/business/what-i-learned-over-lunch-with-warren-buffett/',
  '2025-03-20'::timestamptz, now()
FROM handles h WHERE h.name = 'Guy Spier';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink The 3 cognitive scripts that rule over your life | Full Interview with Anne-Laure Le Cunff @neuranne 

"We try to stick to routines and we try to go through very long lists of tasks, often ignoring our mental health in the process. There is a lot more to think about on a daily basis, but our brains haven''t evolved."

00:00 – Taking control of your mindset
00:16 – The experimental mindset
01:22 – What is the maximalist brain?
02:20 – How did you discover the experimental mindset?
04:29 – Why is mindset so important?
05:18 – What are the mindsets that hold us back?
07:29 – What mindset should we strive for?
08:39 – How do you cultivate an experimental mindset?
12:04 – How do you analyze the collected data?
13:43 – How have you personally employed the experimental mindset?
15:20 – What are some tiny experiments anyone can do?
16:33 – Why should we commit to curiosity?
17:29 – The illusion of certainty
19:13 – How are uncertainty and anxiety linked?
20:07 – Why did our brains evolve to fear uncertainty?
21:10 – How should we approach uncertainty instead?
22:20 – What is the linear model of success?
23:50 – How can we go from linear success to fluid experimentation?
24:36 – How can labeling emotions help manage uncertainty?
27:28 – Why do humans struggle with transitional periods?
30:04 – The 3 cognitive scripts that rule your life
30:44 – What is a cognitive script?
32:11 – What is the sequel script?
33:35 – What is the crowd pleaser script?
34:20 – What is the epic script?
36:29 – What should we do when we notice we are following a cognitive script?
38:04 – In defense of procrastination
40:38 – How can the triple check inform what we do next?
42:09 – What are magic windows?
43:02 – What is mindful productivity?
43:41 – What is mindful productivity’s most valuable resource?',
  'http://twitter.com/neuranne/statuses/1903143057475682346',
  NULL,
  '2025-03-21'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@bigthink Thank you so much for having me and for the thoughtful interview questions - I feel so lucky I got to sit in the famous Big Think interview chair!',
  'http://twitter.com/neuranne/statuses/1903143304478298245',
  NULL,
  '2025-03-21'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@MildBill29 @bigthink Thank you so much! 💛',
  'http://twitter.com/neuranne/statuses/1903144007275868334',
  NULL,
  '2025-03-21'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@AlexisCeule @bigthink Thank you Alexis!',
  'http://twitter.com/neuranne/statuses/1903158277824778552',
  NULL,
  '2025-03-21'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'The final video in my @bigthink series is out! Thanks again to the Big Think team for helping to bring so many ideas to a wider audience with their expert storytelling talents! https://t.co/OfJDGPVDKx',
  'http://twitter.com/annakaharris/statuses/1903228564096553210',
  NULL,
  '2025-03-21'::timestamptz, now()
FROM handles h WHERE h.name = 'Annaka Harris';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  '"Shieber’s “Nietzsche Thesis” posits that our true aim in conversation is self-presentation and social standing, not necessarily truth-seeking."
~@bigthink 

The “Nietzsche Thesis”: Why we don’t really care about truth https://t.co/5iasW9Kkmg',
  'http://twitter.com/jposhaughnessy/statuses/1903446657687044256',
  'https://bigthink.com/mini-philosophy/the-nietzsche-thesis/',
  '2025-03-22'::timestamptz, now()
FROM handles h WHERE h.name = 'Jim O''Shaughnessy';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @EricMarkowitz "The best way to get oriented to the apparent chaos and expanding trauma of this world-historic transition is to study the image just below this section and recognize that ''You Are Here.''"

Excellent new sweeping essay from @peteleyden in @freethinkmedia @bigthink https://t.co/FMfzmMrHn4',
  'http://twitter.com/peteleyden/statuses/1904664035280523760',
  'https://www.freethink.com/artificial-intelligence/great-progression-2025-2050',
  '2025-03-25'::timestamptz, now()
FROM handles h WHERE h.name = 'Peter Leyden';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @EricMarkowitz Lots of good stuff in The Nightcrawler this week. Read it on @bigthink 

@tomowenmorgan on building the "world wise web"
@peteleyden on technology''s "great progression"
@Kantrowitz on Apple secrecy 

Sign up in the link 

https://t.co/ezpP7p5gsT',
  'http://twitter.com/peteleyden/statuses/1905413157868417236',
  'https://bigthink.com/business/rebuilding-is-easy-rethinking-is-hard/',
  '2025-03-28'::timestamptz, now()
FROM handles h WHERE h.name = 'Peter Leyden';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'My book is featured on @bigthink. “To the lay eye, a lek is a primitive mating game. But as Ridley vividly relates in his new book, Birds, Sex & Beauty: The Extraordinary Implications of Charles Darwin’s Strangest Idea, there’s majesty and mystery in the ritual.”',
  'http://twitter.com/mattwridley/statuses/1905517477871648987',
  'https://bigthink.com/life/how-sexual-selection-shaped-birds-and-human-brains/',
  '2025-03-28'::timestamptz, now()
FROM handles h WHERE h.name = 'Matt Ridley';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@mattwridley https://t.co/BNdrouBBiV',
  'http://twitter.com/mattwridley/statuses/1905517480304402928',
  'https://bigthink.com/life/how-sexual-selection-shaped-birds-and-human-brains/',
  '2025-03-28'::timestamptz, now()
FROM handles h WHERE h.name = 'Matt Ridley';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Why the CIA asks spies to sever past relationships: @everydayspy https://t.co/8A5rDLv2Ao',
  'http://twitter.com/EverydaySpy/statuses/1907146476075282772',
  NULL,
  '2025-04-01'::timestamptz, now()
FROM handles h WHERE h.name = 'Andrew Bustamente';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@PessimistsArc https://t.co/0O0tJmRUEO',
  'http://twitter.com/PessimistsArc/statuses/1907225187688575106',
  'https://bigthink.com/pessimists-archive/germany-nuclear-power-russia-putin/',
  '2025-04-02'::timestamptz, now()
FROM handles h WHERE h.name = 'Pessimists Archive';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Playing for the team’s success, rather than your own success, is just one of the many mindset shifts required to make the leap to leader. @AdamBBryant, author of The Leap to Leader, on @bigthink https://t.co/OhSaAV9GEK',
  'http://twitter.com/HarvardBiz/statuses/1907418237886697898',
  'https://bigthink.com/business/becoming-a-leader-is-killing-your-old-self-a-good-idea/',
  '2025-04-02'::timestamptz, now()
FROM handles h WHERE h.name = 'Harvard Business Review';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @freethinkmedia World War 2 reinvented America. AI is going to do the same. @peteleyden
Read more: https://t.co/oULXdnl4zL',
  'http://twitter.com/peteleyden/statuses/1907839284268404742',
  'https://bigthink.com/the-past/america-is-going-through-its-every-80-year-reinvention/',
  '2025-04-03'::timestamptz, now()
FROM handles h WHERE h.name = 'Peter Leyden';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @EricMarkowitz In The Nightcrawler this week for @bigthink, I highlight the excellent recent essay from @aphysicist — which is especially relevant today.

"Maybe one day we''ll evolve beyond our nature; for now, there are problems to solve." https://t.co/bcwI3heHT0',
  'http://twitter.com/aphysicist/statuses/1907870705955553785',
  'https://bigthink.com/business/culture-lasts-business-is-just-a-tactic/',
  '2025-04-03'::timestamptz, now()
FROM handles h WHERE h.name = 'Aaron Slodov';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink This company is using AI to engineer new psychedelics. What they create could lead to novel therapies and better our understanding of consciousness. @DillanDiNardo @MindstateDesign https://t.co/ywFZh8I3OC',
  'http://twitter.com/DillanDiNardo/statuses/1907976993909444664',
  'https://bigthink.com/neuropsych/ai-psychedelics-mindstate/',
  '2025-04-04'::timestamptz, now()
FROM handles h WHERE h.name = 'Dillan DiNardo';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Quantum physics explained in 22 minutes @ProfBrianCox 

0:00 The subatomic world
1:23 A shift in teaching quantum mechanics
2:48 Quantum mechanics vs. classic theory
6:07 The double slit experiment 
11:31 Complex numbers
13:53 Sub-atomic vs. perceivable world
16:40 Quantum entanglement',
  'http://twitter.com/kmele/statuses/1908041810519146847',
  NULL,
  '2025-04-04'::timestamptz, now()
FROM handles h WHERE h.name = 'Kmele Foster';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'If you google Mike Duncan/Big Think there''s a nice profile+interview about me and the Martian Revolution. Would love to post the link but the asshole that runs this place has deliberately throttled posts with links cause, well, he''s an asshole https://t.co/dGJHzA26ao',
  'http://twitter.com/mikeduncan/statuses/1908226501839040642',
  'https://bigthink.com/the-future/martian-revolution/',
  '2025-04-04'::timestamptz, now()
FROM handles h WHERE h.name = 'Mike Duncan';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink This company is using AI to engineer new psychedelics. What they create could lead to novel therapies and better our understanding of consciousness. @DillanDiNardo @MindstateDesign https://t.co/ywFZh8I3OC',
  'http://twitter.com/JasonSilva/statuses/1908481545121247719',
  'https://bigthink.com/neuropsych/ai-psychedelics-mindstate/',
  '2025-04-05'::timestamptz, now()
FROM handles h WHERE h.name = 'Jason Silva';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Why more information isn''t always better @neuranne https://t.co/XnIOzWkAaP',
  'http://twitter.com/neuranne/statuses/1909215748997738757',
  NULL,
  '2025-04-07'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@bigthink Thanks so much for having me! I loved getting to dive deep into those questions.',
  'http://twitter.com/neuranne/statuses/1909215966728262041',
  NULL,
  '2025-04-07'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'My essay, "The Cinematograph and the Noematograph," is out at Big Think. It''s my attempt to work out what exactly is "AI art" and why it might be interesting to human artists and art consumers. Let me know what you think!

https://t.co/l2fiZ3rX6n',
  'http://twitter.com/kyliu99/statuses/1909655501782299072',
  'https://bigthink.com/high-culture/ken-liu-ai-art/',
  '2025-04-08'::timestamptz, now()
FROM handles h WHERE h.name = 'Ken Liu';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  '“artificial intelligence in particular may at one point become person like and have the rights of persons”
https://t.co/CNG9kdlqTd',
  'http://twitter.com/donalddhoffman/statuses/1910336218287763551',
  'https://bigthink.com/questions/will-true-ai-turn-against-us/',
  '2025-04-10'::timestamptz, now()
FROM handles h WHERE h.name = 'Donald Hoffman';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @donalddhoffman “artificial intelligence in particular may at one point become person like and have the rights of persons”
https://t.co/CNG9kdlqTd',
  'http://twitter.com/JasonSilva/statuses/1910412969265029542',
  'https://bigthink.com/questions/will-true-ai-turn-against-us/',
  '2025-04-10'::timestamptz, now()
FROM handles h WHERE h.name = 'Jason Silva';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Why uncertainty causes more stress than pain @neuranne https://t.co/foGwcnHeIv',
  'http://twitter.com/neuranne/statuses/1911117418484674802',
  NULL,
  '2025-04-12'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @KevinRDickinson Ken Liu''s essay @bigthink is well worth a read.

It''s not only an original take on AI but a lovely reminder that for creativity will evolve both art and technology in ways we can''t (yet) imagine.

A delight getting to work with you on this one, Ken! https://t.co/5Txjh8CFw5',
  'http://twitter.com/kyliu99/statuses/1911827401031495832',
  'https://bigthink.com/high-culture/ken-liu-ai-art/',
  '2025-04-14'::timestamptz, now()
FROM handles h WHERE h.name = 'Ken Liu';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Big moment: I was featured in Big Think!

We talked AI, media, and how this whole weird digital world is changing in real-time. I’m so grateful they took interest in my work—and I hope you enjoy reading it as much as I loved doing it.

Read it here: https://t.co/Rya91TZvrM',
  'http://twitter.com/MorissaSchwartz/statuses/1911834047460053441',
  'https://bigthink.com/business/the-morissa-schwartz-interview-ai-and-the-new-media-landscape/',
  '2025-04-14'::timestamptz, now()
FROM handles h WHERE h.name = 'Morissa Schwartz';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @EricMarkowitz NEW interview with @Ritholtz is up on @bigthink. 

We talk optimism, luck, continuous learning, psychology, patience, and more. 

Shoutouts to @DaveNadig @yardeni @jonathanmiller. Thx to @tomowenmorgan for intro.

"My area is investing, but at its heart, this book is about making better choices."',
  'http://twitter.com/Ritholtz/statuses/1912155830532596032',
  'https://bigthink.com/the-long-game/the-barry-ritholtz-interview-smart-is-good-smart-and-lucky-is-better/',
  '2025-04-15'::timestamptz, now()
FROM handles h WHERE h.name = 'Barry Ritholtz';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @JohnRDallasJr Know and grow with the prodigious metacognitive flow of @AdamMGrant, @nytimes, @bigthink, @ScholarshipfPhd, @thinkschoolcom, @APA, @NeuroscienceNew, @PsychToday, @JohnNosta, @antgrasso, @LindaGrass0, @HarvardBiz, @McKinsey, @mitsmr, @MindBranches, @BrookingsInst, @DrSWhitaker, @Pres_APA, @EnclaveAcademy, and other curious, humble, and generous “marathonian metathinkers about metathinking.”

Beyond this roster of rethinkers, which @X accounts do you lean toward to learn to lean away from stuck or stale thinking and lean into reinvigorating metacognition?

More of my favored #rethinkers will be thanked and listed among future posts.

“Rethinking ways we thinker-doers learn, know, and grow—that’s ignition of metacognition.” —JRDjr

Come to think of it.™

Come to think of it.™

Come to think of it.™',
  'http://twitter.com/JohnNosta/statuses/1912481317830131864',
  NULL,
  '2025-04-16'::timestamptz, now()
FROM handles h WHERE h.name = 'John Nosta';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink How can we communicate with alien life and the future? @david_kipping https://t.co/Y32zIemWjv',
  'http://twitter.com/david_kipping/statuses/1912575223699845537',
  NULL,
  '2025-04-16'::timestamptz, now()
FROM handles h WHERE h.name = 'David Kipping';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Fix your destructive mindset in 15 mins @neuranne 

0:00 Our mindsets’ influences
0:50 Linear vs. experimental
2:50 3 subconscious mindsets
4:58 The experimental mindset
6:30 Designing experiments
8:35 Habit vs. experiment https://t.co/3EFwiKYeXI',
  'http://twitter.com/neuranne/statuses/1912957572220653891',
  NULL,
  '2025-04-17'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@jposhaughnessy https://t.co/Z0zltOiS4R',
  'http://twitter.com/jposhaughnessy/statuses/1913625632254161001',
  'https://bigthink.com/mini-philosophy/chess-theory-of-mind-manipulation/',
  '2025-04-19'::timestamptz, now()
FROM handles h WHERE h.name = 'Jim O''Shaughnessy';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Why are we overwhelmed and what can we do about it? @neuranne https://t.co/XpTfGGbuec',
  'http://twitter.com/neuranne/statuses/1914055947619635573',
  NULL,
  '2025-04-20'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@vixsheikh @bigthink Exactly! 💯',
  'http://twitter.com/neuranne/statuses/1914213926033588282',
  NULL,
  '2025-04-21'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @MorissaSchwartz Big moment: I was featured in Big Think!

We talked AI, media, and how this whole weird digital world is changing in real-time. I’m so grateful they took interest in my work—and I hope you enjoy reading it as much as I loved doing it.

Read it here: https://t.co/Rya91TZvrM',
  'http://twitter.com/MorissaSchwartz/statuses/1914270405201739916',
  'https://bigthink.com/business/the-morissa-schwartz-interview-ai-and-the-new-media-landscape/',
  '2025-04-21'::timestamptz, now()
FROM handles h WHERE h.name = 'Morissa Schwartz';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'The Big Think: “Smart is good. Smart and lucky is better” https://t.co/9CtCI7G5Ya',
  'http://twitter.com/Ritholtz/statuses/1914743645905043692',
  'https://bigthink.com/the-long-game/the-barry-ritholtz-interview-smart-is-good-smart-and-lucky-is-better/',
  '2025-04-22'::timestamptz, now()
FROM handles h WHERE h.name = 'Barry Ritholtz';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink How close are we to finding alien life? @david_kipping 

00:00 Mapping the universe
01:33 Earth twins
02:55 The Fermi paradox
04:38 The Drake equation
05:37 Conditions for life
07:11 Rare Earth hypothesis
08:02 Biosignatures and technosignatures
10:54 SETI
11:55 METI
12:41 The Dark Forest hypothesis
14:16 Long-distance communication',
  'http://twitter.com/david_kipping/statuses/1915060523202392547',
  'https://bigthink.com/series/the-big-think-interview/david-kipping-extraterrestrials/',
  '2025-04-23'::timestamptz, now()
FROM handles h WHERE h.name = 'David Kipping';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink How close are we to finding alien life? @david_kipping 

00:00 Mapping the universe
01:33 Earth twins
02:55 The Fermi paradox
04:38 The Drake equation
05:37 Conditions for life
07:11 Rare Earth hypothesis
08:02 Biosignatures and technosignatures
10:54 SETI
11:55 METI
12:41 The Dark Forest hypothesis
14:16 Long-distance communication',
  'http://twitter.com/DrBrianKeating/statuses/1915171803401724182',
  'https://bigthink.com/series/the-big-think-interview/david-kipping-extraterrestrials/',
  '2025-04-23'::timestamptz, now()
FROM handles h WHERE h.name = 'Brian Keating';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Will platforms continue to offer the like button as an all-purpose tool — or will each of the button’s various functions exist in new forms? @MartinKReeves & Bob Goodson, authors of Like, share insights on @bigthink https://t.co/bZLiu3PmHk',
  'http://twitter.com/HarvardBiz/statuses/1918052814837710889',
  'https://bigthink.com/business/the-future-of-the-like-button-thumbs-up-or-thumbs-down/',
  '2025-05-01'::timestamptz, now()
FROM handles h WHERE h.name = 'Harvard Business Review';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink 3 ways to burst the “positivity delusion” @bhorowitz 
https://t.co/UFjENvAwJ3',
  'http://twitter.com/bhorowitz/statuses/1919760488302317639',
  'https://bigthink.com/business/ceo-masterclass-3-ways-to-burst-the-positivity-delusion/',
  '2025-05-06'::timestamptz, now()
FROM handles h WHERE h.name = 'Ben Horowitz';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'From “crave” packs to Valentine bookings, @Whitecastle, the world’s first fast-food hamburger chain values innovation from every level of the organization. Dave Whorton, author of Another Way, shares insights on @BigThink https://t.co/1FmzTEJVSF',
  'http://twitter.com/HarvardBiz/statuses/1920170518533042320',
  'https://bigthink.com/business/romance-at-white-castle-how-to-do-business-the-evergreen-way/',
  '2025-05-07'::timestamptz, now()
FROM handles h WHERE h.name = 'Harvard Business Review';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink How to make quick decisions under stress (like a spy) @EverydaySpy 

00:00 Resources that matter
01:05 Task saturation
04:23 The next simplest task
07:37 Your path to survival
08:33 Head trash
10:04 Managing overwhelm https://t.co/ox35xLLPKH',
  'http://twitter.com/EverydaySpy/statuses/1920486789258883427',
  'https://www.youtube.com/watch?v=h5sCj8ic1rM',
  '2025-05-08'::timestamptz, now()
FROM handles h WHERE h.name = 'Andrew Bustamente';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@ejzim I went deeper on the whys here: https://t.co/AFOkN3L3HD',
  'http://twitter.com/jasoncrawford/statuses/1921297929114993031',
  'https://bigthink.com/progress/a-new-philosophy-of-progress-jason-crawford/',
  '2025-05-10'::timestamptz, now()
FROM handles h WHERE h.name = 'Jason Crawford';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @koenfucius Our response to uncertainty is often stress, as if responding to physical danger.

Viewing the unexpected and unknown through a curiosity lens—an opportunity for discovery—helps us avoid stress and anxiety, and promotes neuroplasticity, argues @neuranne:

https://t.co/nsglcNcHXO https://t.co/25qk0Q5HTe',
  'http://twitter.com/neuranne/statuses/1922271718715842818',
  'https://bigthink.com/smart-skills/how-curiosity-rewires-your-brain-for-change/',
  '2025-05-13'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  '"The cure for boredom is curiosity. There is no cure for curiosity." 
~Dorothy Parker

https://t.co/L3aaIYBZbV',
  'http://twitter.com/jposhaughnessy/statuses/1922293587305173337',
  'https://bigthink.com/smart-skills/how-curiosity-rewires-your-brain-for-change/',
  '2025-05-13'::timestamptz, now()
FROM handles h WHERE h.name = 'Jim O''Shaughnessy';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'The brain often responds to change and uncertainty by activating the amygdala, triggering the same stress responses as physical danger. Curiosity helps reframe uncertainty as an invitation, not a threat https://t.co/RzOuiBETVY',
  'http://twitter.com/jhagel/statuses/1922301290496868684',
  'https://bigthink.com/smart-skills/how-curiosity-rewires-your-brain-for-change/',
  '2025-05-13'::timestamptz, now()
FROM handles h WHERE h.name = 'John Hagel';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink One key characteristic defines quality relationships at work: knowing that we matter to the other person @ZachMercurio #BTBusiness #Exerpt
https://t.co/oxct0cNlOx',
  'http://twitter.com/ZachMercurio/statuses/1922340399252734391',
  'https://bigthink.com/business/team-esteem-how-to-create-spirals-of-increasing-cooperation/',
  '2025-05-13'::timestamptz, now()
FROM handles h WHERE h.name = 'Zach Mercurio';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@bigthink Thank you for including this and sharing!',
  'http://twitter.com/ZachMercurio/statuses/1922340448229589347',
  'https://bigthink.com/business/team-esteem-how-to-create-spirals-of-increasing-cooperation/',
  '2025-05-13'::timestamptz, now()
FROM handles h WHERE h.name = 'Zach Mercurio';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink One key characteristic defines quality relationships at work: knowing that we matter to the other person @ZachMercurio #BTBusiness #Exerpt
https://t.co/oxct0cNlOx',
  'http://twitter.com/HarvardBiz/statuses/1922373870750695871',
  'https://bigthink.com/business/team-esteem-how-to-create-spirals-of-increasing-cooperation/',
  '2025-05-13'::timestamptz, now()
FROM handles h WHERE h.name = 'Harvard Business Review';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @EricMarkowitz I spoke with @david_perell for a public conversation in @bigthink 

He makes a smart, counterintuitive point: we''re moving from an "age of distribution" to an "age of engagement" 

Quality > Quantity 

(link below) https://t.co/9zZ4mvGqrn',
  'http://twitter.com/david_perell/statuses/1922426688060658006',
  'https://bigthink.com/the-long-game/the-david-perell-interview-how-to-resonate-in-the-age-of-engagement/',
  '2025-05-13'::timestamptz, now()
FROM handles h WHERE h.name = 'David Perell';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  'Love this!',
  'http://twitter.com/MuhammadLila/statuses/1922505943838859630',
  'https://bigthink.com/smart-skills/how-curiosity-rewires-your-brain-for-change/',
  '2025-05-14'::timestamptz, now()
FROM handles h WHERE h.name = 'Muhammad Lila';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'The illusion of Conscious AI'' - new short piece of @bigthink https://t.co/l8JTv2Deia (for the longer version, see my Behavioral & Brain Sciences target article, which is now accepting commentary proposals: https://t.co/CYt9HEAeld) 🧠',
  'http://twitter.com/anilkseth/statuses/1922697343591219458',
  'https://bigthink.com/neuropsych/the-illusion-of-conscious-ai/',
  '2025-05-14'::timestamptz, now()
FROM handles h WHERE h.name = 'Anil Seth';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Some researchers now say there’s a 15% chance AI is already conscious. Here''s why that''s probably an illusion. @anilkseth https://t.co/ayxrhHgpqp https://t.co/GLicDumSM1',
  'http://twitter.com/anilkseth/statuses/1922713312954896675',
  'https://bigthink.com/neuropsych/the-illusion-of-conscious-ai/',
  '2025-05-14'::timestamptz, now()
FROM handles h WHERE h.name = 'Anil Seth';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink The secret ingredient to great books is "cosmic realism" @paullynchwriter @philosophyminis https://t.co/bRmSMB2BUZ',
  'http://twitter.com/JasonSilva/statuses/1922716624101990488',
  'https://bigthink.com/mini-philosophy/cosmic-realism-the-secret-ingredient-to-many-of-the-greatest-books-of-all-time/',
  '2025-05-14'::timestamptz, now()
FROM handles h WHERE h.name = 'Jason Silva';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Why most people are only giving 70% @JohnAmaechi 
 
0:00 A high performance mindset
1:20 How to achieve remarkable things
2:27 A psychologist first
3:04 What do I need to do today?
3:49 The FEE model
6:24 Get dunked on
7:29 A heckler in your head',
  'http://twitter.com/JohnAmaechi/statuses/1922938188517048582',
  'https://www.youtube.com/watch?v=KYs3M_qB6hs',
  '2025-05-15'::timestamptz, now()
FROM handles h WHERE h.name = 'John Amaechi';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @DrSueSchneider @anilkseth @bigthink Very cool. I have been pushing a similar view since my 2019 book,Artificial You. Sharing my op-ed from last week: https://t.co/FYs2JofyXp',
  'http://twitter.com/anilkseth/statuses/1922959463239082128',
  'https://bigthink.com/neuropsych/the-illusion-of-conscious-ai/',
  '2025-05-15'::timestamptz, now()
FROM handles h WHERE h.name = 'Anil Seth';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @mitzideluca Curious about how embracing uncertainty can boost neuroplasticity? @neuranne''s article dives into it—worth a read! 

How curiosity rewires your brain for change https://t.co/kclx2IBCJU',
  'http://twitter.com/neuranne/statuses/1922966825014374558',
  'https://bigthink.com/smart-skills/how-curiosity-rewires-your-brain-for-change/',
  '2025-05-15'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  '“Nobody expects a computer simulation of a hurricane to generate real wind and real rain. In the same way, a computer model of the brain may only ever simulate consciousness, but never give rise to it.”

https://t.co/zSL5XBp6E7',
  'http://twitter.com/donalddhoffman/statuses/1923011820408733936',
  'https://bigthink.com/neuropsych/the-illusion-of-conscious-ai/',
  '2025-05-15'::timestamptz, now()
FROM handles h WHERE h.name = 'Donald Hoffman';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @donalddhoffman “Nobody expects a computer simulation of a hurricane to generate real wind and real rain. In the same way, a computer model of the brain may only ever simulate consciousness, but never give rise to it.”

https://t.co/zSL5XBp6E7',
  'http://twitter.com/JasonSilva/statuses/1923031653707882625',
  'https://bigthink.com/neuropsych/the-illusion-of-conscious-ai/',
  '2025-05-15'::timestamptz, now()
FROM handles h WHERE h.name = 'Jason Silva';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @gvanourek TEAM ESTEEM: How to create “spirals of increasing cooperation” - @ZachMercurio on social self-esteem The Power of #Mattering in @bigthink via @SmartBrief @SBLeaders 

Make sure people feel seen, heard, and valued.
https://t.co/RPzslZGmCL
#Leadership',
  'http://twitter.com/ZachMercurio/statuses/1923032431885426837',
  'https://bigthink.com/business/team-esteem-how-to-create-spirals-of-increasing-cooperation/',
  '2025-05-15'::timestamptz, now()
FROM handles h WHERE h.name = 'Zach Mercurio';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@JagersbergKnut @bimedotcom @bigthink Exactly ... introducing The Torment Nexus (from @AlexBlechman, via Laura Joy Pieters) https://t.co/Bw9MY3RRoA',
  'http://twitter.com/anilkseth/statuses/1923043241802232133',
  'https://bigthink.com/neuropsych/the-illusion-of-conscious-ai/',
  '2025-05-15'::timestamptz, now()
FROM handles h WHERE h.name = 'Anil Seth';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bimedotcom The illusion of conscious AI 
https://t.co/yHMaEYA0iz 
✍️ @anilkseth via @bigthink 

💡"We should not deliberately try to create artificial consciousness"
💡"We should carefully distinguish the ethical implications of AI that actually is conscious from AI that irresistibly seems to be conscious"
💡"What we need is nothing less than a satisfactory scientific understanding of consciousness itself" 

@Corix_JC @jeanyvesgonin @IngridVasiliu @mikeflache @sonu_monika @JagersbergKnut @ahier @sim010101 @maponi @EstelaMandela @Shi4Tech @BetaMoroney @CEO_Aisoma @SpirosMargaris @mvollmer1 @RamonaEid @ChuckDBrooks @FernandaKellner @YvesMulkers @LouisColumbus @PVynckier @JoannMoretti @NeiraOsci @tlloydjones @theomitsa @SusanHayes_ @TarakRindani @Nicochan33 @sminaev2015 @FrRonconi @Khulood_Almani @TysonLester @KanezaDiane @AnneLaureBEAUD2 @darioandriani @amalmerzouk @MaryRich78 @FmFrancoise @sulefati7 @pchamard @Analytics_699 @TheAIObserverX @WillyRayNick @NathaliaLeHen @jeancayeux @DanielleLargier @RLDI_Lamy @chidambara09 
#AI #Neuroscience #Consciousness #AGI',
  'http://twitter.com/anilkseth/statuses/1923111579429531695',
  'https://bigthink.com/neuropsych/the-illusion-of-conscious-ai/',
  '2025-05-15'::timestamptz, now()
FROM handles h WHERE h.name = 'Anil Seth';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @donalddhoffman “Nobody expects a computer simulation of a hurricane to generate real wind and real rain. In the same way, a computer model of the brain may only ever simulate consciousness, but never give rise to it.”

https://t.co/zSL5XBp6E7',
  'http://twitter.com/rjhaier/statuses/1923451808749396261',
  'https://bigthink.com/neuropsych/the-illusion-of-conscious-ai/',
  '2025-05-16'::timestamptz, now()
FROM handles h WHERE h.name = 'Richard Haier';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'The illusion of conscious AI - Big Think https://t.co/VkqgiXmu05',
  'http://twitter.com/JohnNosta/statuses/1923885690120519827',
  'https://bigthink.com/neuropsych/the-illusion-of-conscious-ai/',
  '2025-05-17'::timestamptz, now()
FROM handles h WHERE h.name = 'John Nosta';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @EricMarkowitz Curiosity as the principal survival skill of the modern era of accelerating change

via @neuranne 

Alongside @DaveNadig @bogumil_nyc @AnnieDuke and others for The Nightcrawler this week in @bigthink 

https://t.co/2hS4fGiRCf https://t.co/95Zq7YBkjN',
  'http://twitter.com/neuranne/statuses/1924118523711754679',
  'https://bigthink.com/business/curiosity-as-a-survival-skill-to-navigate-change/',
  '2025-05-18'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @riittaelisa When people feel like they matter, they act like they matter. 💙 @ZachMercurio 

#johtaminen #työelämä
https://t.co/GJ34I7VVaY',
  'http://twitter.com/ZachMercurio/statuses/1924544825304744362',
  'https://bigthink.com/business/team-esteem-how-to-create-spirals-of-increasing-cooperation/',
  '2025-05-19'::timestamptz, now()
FROM handles h WHERE h.name = 'Zach Mercurio';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink What does it take to achieve remarkable things? @JohnAmaechi https://t.co/SpVUtM4o5a',
  'http://twitter.com/JohnAmaechi/statuses/1924586993616404482',
  NULL,
  '2025-05-19'::timestamptz, now()
FROM handles h WHERE h.name = 'John Amaechi';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink What if faith and skepticism aren''t enemies? 

Director of "Doctor Strange", Scott Derrickson argues that both can exist as sensibilities rather than ideologies. 

https://t.co/kunYECSU87

"Mystery humbles you. It shifts your worldview. It forces you to accept that we live in a magical, enchanted world — not in a metaphorical sense, but in a deeply experiential one."

@ScottDerrickson @AdamFrank4 @TedChiang',
  'http://twitter.com/scottderrickson/statuses/1924602592602292602',
  'https://bigthink.com/13-8/scott-derrickson-on-filmmaking-and-the-faith-vs-skepticism-debate/',
  '2025-05-19'::timestamptz, now()
FROM handles h WHERE h.name = 'Scott Derrickson';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Want a Blueprints taster? Then check out this extract @bigthink https://t.co/L6WT6EL9Ay',
  'http://twitter.com/MarcusduSautoy/statuses/1925818156129427754',
  'https://bigthink.com/mini-philosophy/from-messiaen-to-radiohead-how-great-music-uses-prime-numbers/',
  '2025-05-23'::timestamptz, now()
FROM handles h WHERE h.name = 'Marcus du Sautoy';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink How great music uses prime numbers. @MarcusduSautoy @Radiohead

The use of unsynchronized rhythms and harmonies—built on primes like 17, 29, and 15—prevents any true repetition, mirroring the theme of time ending. 

Read more: https://t.co/ZYLIYoLIQi',
  'http://twitter.com/MarcusduSautoy/statuses/1925818357271412854',
  'https://bigthink.com/mini-philosophy/from-messiaen-to-radiohead-how-great-music-uses-prime-numbers/',
  '2025-05-23'::timestamptz, now()
FROM handles h WHERE h.name = 'Marcus du Sautoy';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@anilkseth 2/ My @BBSJournal target article on ''Conscious artificial intelligence and biological naturalism'' is now open for commentary proposals here: https://t.co/CYt9HEAeld A (& there''s a short distillation in @bigthink): https://t.co/l8JTv2Deia',
  'http://twitter.com/anilkseth/statuses/1927026770651287989',
  'https://bigthink.com/neuropsych/the-illusion-of-conscious-ai/',
  '2025-05-26'::timestamptz, now()
FROM handles h WHERE h.name = 'Anil Seth';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Niceness vs kindness @JohnAmaechi https://t.co/v72cv2baFF',
  'http://twitter.com/JohnAmaechi/statuses/1927245423560868191',
  NULL,
  '2025-05-27'::timestamptz, now()
FROM handles h WHERE h.name = 'John Amaechi';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @Ryan_Djokaran 3000 Written Letters, 3 Responses, 1 Yes…

@JohnAmaechi on the @bigthink is a masterful breakdown on ‘how to achieve remarkable things’. 

An NBA veteran & Psychologist, an ideal podcast guest to say the least 😂 

Highly recommend adding this one to the list 👌 https://t.co/9PLkvqZgYh',
  'http://twitter.com/JohnAmaechi/statuses/1927245851769835944',
  NULL,
  '2025-05-27'::timestamptz, now()
FROM handles h WHERE h.name = 'John Amaechi';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @JohnRDallasJr “Your niceness gets you in trouble,” a shareholder scolded me. “Your occasional sternness or anger startle and disappoint people. Your niceness sets you up for failure. Work on being kind, not nice,” he said sternly. Ouch! Listen deeply to @JohnAmaechi. Grow from “Ouch!” to “Oh!” https://t.co/7jyzvpKSSp',
  'http://twitter.com/JohnAmaechi/statuses/1927345562564661591',
  NULL,
  '2025-05-27'::timestamptz, now()
FROM handles h WHERE h.name = 'John Amaechi';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @EricMarkowitz I wrote about Leonardo Da Vinci''s obsession with water in @bigthink this week: 

"In a forgotten notebook from the late 15th century, Leonardo da Vinci sketched a series of looping eddies — swirls of water curling back on themselves. 

He was studying how fluids moved in nature. 

Rivers, blood, air. He even observed that water, when hitting an obstacle, would form vortices resembling the coils of a woman’s hair. For Leonardo, this wasn’t idle doodling. 

This was pattern recognition. This was the signature of life itself."

https://t.co/11vxYcBFrk

The video player is currently playing an ad.
Centuries before turbulence could be modeled by a computer or a physicist could explain fluid dynamics in differential equations, Leonardo saw it. Not just the movement, but the metaphor: that longevity is not about stillness. It is about motion within motion. Systems inside systems. Constant change, elegantly contained. If you want to learn how to endure in a period of rapid change, listen to a man who never stopped moving.',
  'http://twitter.com/JasonSilva/statuses/1927428466225336518',
  'https://bigthink.com/the-long-game/what-leonardos-obsession-with-water-teaches-us-about-longevity/',
  '2025-05-27'::timestamptz, now()
FROM handles h WHERE h.name = 'Jason Silva';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Leonardo da Vinci was obsessed with water.

Here''s what his obsession can teach us about longevity: 

@EricMarkowitz

https://t.co/CVyOlZIGsU',
  'http://twitter.com/JasonSilva/statuses/1927428859449704463',
  'https://bigthink.com/the-long-game/what-leonardos-obsession-with-water-teaches-us-about-longevity/',
  '2025-05-27'::timestamptz, now()
FROM handles h WHERE h.name = 'Jason Silva';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Leonardo da Vinci had a pathological curiosity and a complete disregard for disciplinary boundaries. In his obsession with water — fluid dynamics — the secret of Leonardo’s longevity becomes clear https://t.co/py7dTm8F89',
  'http://twitter.com/jhagel/statuses/1927730845554467049',
  'https://bigthink.com/the-long-game/what-leonardos-obsession-with-water-teaches-us-about-longevity/',
  '2025-05-28'::timestamptz, now()
FROM handles h WHERE h.name = 'John Hagel';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@anilkseth 9/ There is a highly distilled version of the target article in @BigThink https://t.co/l8JTv2Deia',
  'http://twitter.com/anilkseth/statuses/1929518000253648919',
  'https://bigthink.com/neuropsych/the-illusion-of-conscious-ai/',
  '2025-06-02'::timestamptz, now()
FROM handles h WHERE h.name = 'Anil Seth';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink How to build a tribe @JohnAmaechi https://t.co/UYFLAFrk8G',
  'http://twitter.com/JohnAmaechi/statuses/1929637668717318585',
  NULL,
  '2025-06-02'::timestamptz, now()
FROM handles h WHERE h.name = 'John Amaechi';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @anilananth What''s So Elegant About the Math of Machine Learning? I have often been asked this question, given it''s the sub-title of WHY MACHINES LEARN, including by @MLStreetTalk''s Tim Scarfe, by @StartsWithABang for @bigthink, and others.

If you have been studying machine learning for a long time, the elegance might not be obvious. But if you came to ML like I did--decades after having studied the relevant math for my undergrad and graduate EE degrees, and decades after having done regular software engineering--then machine learning hits you like a ton of bricks.

Who would have thought that basic ideas like vectors, matrices, matrix-vector multiplication, differential calculus, gradient descent, elementary probability and statistics -- all of which you learn in high school or at least during the first years of undergrad in STEM -- would form the basis of the extraordinary revolution that''s underfoot?

But that''s just wonder. What about elegance? Well, that''s really a subjective perspective. Again, many might disagree. But here''s a sampling of the kinds of things I found beautiful:

The Perceptron Convergence Proof: It''s just linear algebra, but the proof of why the perceptron algorithm will linearly separate two clusters of data in finite time, if such a divide exists, is a thing of beauty.

Support Vector Machines and Kernel Methods: These algorithms have been somewhat forgotten, given the success of deep neural networks, but when you encounter the formulation of SVMs, and the use of kernel methods to project data into higher dimensions -- it''s such a counter-intuitive thing to do--you can''t but be amazed. I was!

Hopfield Networks Convergence Proof: Again, just linear algebra shows you something very powerful--that these networks will settle into an energy minimum when perturbed and retrieve what amounts to a stored memory! Think about that. I can''t help wonder whether our brains are doing something similar. John Hopfield--who won the @NobelPrize in Physics',
  'http://twitter.com/anilananth/statuses/1929666644072452132',
  NULL,
  '2025-06-02'::timestamptz, now()
FROM handles h WHERE h.name = 'Anil Ananthaswamy';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Who holds more power: the fact-checkers or the storytellers?

History proves that stories, not just facts, shape societies and inspire action.

Watch the full interview from 18 October 2024: https://t.co/QSmWuqFeLt

#BigThink #Storytelling https://t.co/gzEjLZIyZG',
  'http://twitter.com/harari_yuval/statuses/1929926180796276908',
  NULL,
  '2025-06-03'::timestamptz, now()
FROM handles h WHERE h.name = 'Yuval Noah Harari';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink ⬤ @JulietSchor argues a reduced working week is part of a sane response to the impacts of AI and robotization on human labor. 

https://t.co/cGVQV1Gcif https://t.co/Y7tBlFUqiu',
  'http://twitter.com/JulietSchor/statuses/1930035777548771482',
  'https://bigthink.com/business/our-jobs-and-ai-why-the-4-day-week-should-anchor-our-work-lives/',
  '2025-06-03'::timestamptz, now()
FROM handles h WHERE h.name = 'Juliet Schor';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@david_perell There''s much more in this interview I did with @bigthink 

https://t.co/ZFGkjvPc6Y https://t.co/seNjdq9ZzK',
  'http://twitter.com/david_perell/statuses/1931010647375991201',
  'https://bigthink.com/the-long-game/the-david-perell-interview-how-to-resonate-in-the-age-of-engagement/',
  '2025-06-06'::timestamptz, now()
FROM handles h WHERE h.name = 'David Perell';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Is the CIA a cult? ft. Andrew Bustamante @EverydaySpy https://t.co/iQk77mAQdL',
  'http://twitter.com/EverydaySpy/statuses/1931053817577279563',
  NULL,
  '2025-06-06'::timestamptz, now()
FROM handles h WHERE h.name = 'Andrew Bustamente';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@anilkseth 2/ tl/dr: we need to beware of our psychological biases, consciousness is more likely a property of life than of computation, & illusions of conscious AI may be cognitively impenetrable; see this version in @bigthink https://t.co/l8JTv2Deia',
  'http://twitter.com/anilkseth/statuses/1931420707520393638',
  'https://bigthink.com/neuropsych/the-illusion-of-conscious-ai/',
  '2025-06-07'::timestamptz, now()
FROM handles h WHERE h.name = 'Anil Seth';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@riemannzeta @bigthink No. That’s a separate distinction. See the @BBSJournal paper.',
  'http://twitter.com/anilkseth/statuses/1931617159286857794',
  'https://bigthink.com/neuropsych/the-illusion-of-conscious-ai/',
  '2025-06-08'::timestamptz, now()
FROM handles h WHERE h.name = 'Anil Seth';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'The Trump administration is seeking, in part, to reduce US trade deficits through its tariff policies.

This is a flawed strategy, as the US trade deficit is ENTIRELY DETERMINED by the gap between domestic US saving & domestic US investment.

My latest in @bigthink:
https://t.co/x35rcE7A7O',
  'http://twitter.com/steve_hanke/statuses/1932618790464077941',
  'https://bigthink.com/business/the-steve-hanke-interview-writing-a-tweet-is-the-endgame-of-the-feynman-technique/',
  '2025-06-11'::timestamptz, now()
FROM handles h WHERE h.name = 'Steve Hanke';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  'This was a fun interview. My secret is that I’m always in over my head….',
  'http://twitter.com/AndrewMayne/statuses/1932841085543551040',
  'https://bigthink.com/business/the-andrew-mayne-interview-how-to-succeed-as-a-polymath/',
  '2025-06-11'::timestamptz, now()
FROM handles h WHERE h.name = 'Andrew Mayne';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Yours truly on big govt:

“The US government has become involved in all aspects of life, and truth has taken a backseat. Pres. Trump’s rhetoric on trade is just one example — nearly everything he says about trade deficits and tariffs is flat-out WRONG.”

My latest in @bigthink:

https://t.co/x35rcE72ig',
  'http://twitter.com/steve_hanke/statuses/1932981180288102764',
  'https://bigthink.com/business/the-steve-hanke-interview-writing-a-tweet-is-the-endgame-of-the-feynman-technique/',
  '2025-06-12'::timestamptz, now()
FROM handles h WHERE h.name = 'Steve Hanke';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Are we prepared for AI to become conscious? @PeterSinger 

0:00 Will we create conscious AI?
1:30 The ethical dilemma of sentient AI 
1:56 Does AI deserve rights?
2:48 How we treat sentient AI 
3:42 Experts in AI https://t.co/dZYwfHhkmJ',
  'http://twitter.com/JasonSilva/statuses/1933257538843390409',
  'https://www.youtube.com/watch?v=XLdzSij1moA',
  '2025-06-12'::timestamptz, now()
FROM handles h WHERE h.name = 'Jason Silva';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'My latest on misinformation in @bigthink:

"Hanke''s 95% rule = 95% of what you read in the press is either wrong or irrelevant... Ironically, journalists have become the arbiters of determining what is, and what isn''t, ''misinformation.'' "

https://t.co/TpyBaUN1vP',
  'http://twitter.com/steve_hanke/statuses/1933283176564060493',
  'https://bigthink.com/business/the-steve-hanke-interview-writing-a-tweet-is-the-endgame-of-the-feynman-technique/',
  '2025-06-12'::timestamptz, now()
FROM handles h WHERE h.name = 'Steve Hanke';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @KacarLab Excited to share a new Big Think + John Templeton Foundation interview featuring work from our lab: “Meet the survivors of Earth’s worst days.” @betulland unpacks how life persisted through catastrophe! @bigthink @templeton_fdn 

Watch here: https://t.co/hxYKtvmj3U',
  'http://twitter.com/betulland/statuses/1933570343521956300',
  'https://bigthink.com/the-well/earths-ancient-microbes/',
  '2025-06-13'::timestamptz, now()
FROM handles h WHERE h.name = 'Betul Kacar';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @koenfucius Without consciousness there is nothing.

But it’s still a deeply mysterious concept. Does it emerge in the neurological complexity of advanced brains? Or might it be more pervasive, like gravity—a basic property of the universe, muses @annakaharris:

https://t.co/WU5Rt8OIql https://t.co/uOgQxuqnaP',
  'http://twitter.com/annakaharris/statuses/1933924565920752012',
  'https://bigthink.com/series/the-big-think-interview/annaka-harris-defining-consciousness/',
  '2025-06-14'::timestamptz, now()
FROM handles h WHERE h.name = 'Annaka Harris';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @KacarLab Excited to share a new Big Think + John Templeton Foundation interview featuring work from our lab: “Meet the survivors of Earth’s worst days.” @betulland unpacks how life persisted through catastrophe! @bigthink @templeton_fdn 

Watch here: https://t.co/hxYKtvmj3U',
  'http://twitter.com/betulland/statuses/1934947847985868810',
  'https://bigthink.com/the-well/earths-ancient-microbes/',
  '2025-06-17'::timestamptz, now()
FROM handles h WHERE h.name = 'Betul Kacar';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink When should you quit? 

A framework for life''s toughest decisions from @AnnieDuke, a poker champion turned decision scientist. 

https://t.co/VePSdklkZG',
  'http://twitter.com/AnnieDuke/statuses/1935337941947093273',
  'https://bigthink.com/smart-skills/annie-duke-the-overlooked-science-behind-lifes-toughest-decisions/',
  '2025-06-18'::timestamptz, now()
FROM handles h WHERE h.name = 'Annie Duke';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @NatlNonprofits When to quit: A simple framework for life’s toughest decisions - @bigthink 

"We tend to judge decisions by the outcome, but... what really matters is the quality of thinking behind them."

https://t.co/6kfyPOzMqr',
  'http://twitter.com/AnnieDuke/statuses/1935340678004818288',
  'https://bigthink.com/smart-skills/annie-duke-the-overlooked-science-behind-lifes-toughest-decisions/',
  '2025-06-18'::timestamptz, now()
FROM handles h WHERE h.name = 'Annie Duke';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Why “Systems Leadership” is hard in the best possible way.
.
 https://t.co/vEN0U7QYcu',
  'http://twitter.com/jameslhbartlett/statuses/1935590590000812324',
  'https://bigthink.com/business/why-systems-leadership-is-hard-in-the-best-possible-way/',
  '2025-06-19'::timestamptz, now()
FROM handles h WHERE h.name = 'James L H Bartlett';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @AllDecisionEd Add this article to your summer reading list! 📖 Alliance co-founder @AnnieDuke spoke to Danny Kenny for @BigThink about the power of knowing when to quit, how we can teach students decision-making even during kindergarten, and so much more.
https://t.co/JPBVd35tOr https://t.co/MKCggUHtLy',
  'http://twitter.com/AnnieDuke/statuses/1936150658043846765',
  'https://bigthink.com/smart-skills/annie-duke-the-overlooked-science-behind-lifes-toughest-decisions/',
  '2025-06-20'::timestamptz, now()
FROM handles h WHERE h.name = 'Annie Duke';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  '“Otroverts” and why nonconformists often see what others can’t https://t.co/pip0TcPUvl',
  'http://twitter.com/jhagel/statuses/1937876904419467395',
  'https://bigthink.com/big-think-books/otrovert/',
  '2025-06-25'::timestamptz, now()
FROM handles h WHERE h.name = 'John Hagel';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  'When most people hear the name Kellogg, they think of breakfast ce­real. 

Corn Flakes, Rice Krispies, maybe even Eggo Waffles and Pop-Tarts. 

Misogynistically removing the clitoris as a punishment, masked as a treatment for female sexual promiscuity and masturbation, is not top of mind. 

Yet these kinds of moralizing ideas about health—embraced and perpetuated by a health authority of Kellogg’s significance—gave birth to the modern wellness industry and have become rooted in alternative medicine. 

My latest in @bigthink on the unsavory history of the wellness industry:',
  'http://twitter.com/jonathanstea/statuses/1938279442364961224',
  'https://bigthink.com/health/the-unsavory-history-of-the-wellness-industry/',
  '2025-06-26'::timestamptz, now()
FROM handles h WHERE h.name = 'Jonathan N Stea';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink How to identify an Earth-like planet ft. David Kipping @david_kipping https://t.co/JSXV3DA0Fi',
  'http://twitter.com/david_kipping/statuses/1938650434207383604',
  NULL,
  '2025-06-27'::timestamptz, now()
FROM handles h WHERE h.name = 'David Kipping';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @jonathanstea When most people hear the name Kellogg, they think of breakfast ce­real. 

Corn Flakes, Rice Krispies, maybe even Eggo Waffles and Pop-Tarts. 

Misogynistically removing the clitoris as a punishment, masked as a treatment for female sexual promiscuity and masturbation, is not top of mind. 

Yet these kinds of moralizing ideas about health—embraced and perpetuated by a health authority of Kellogg’s significance—gave birth to the modern wellness industry and have become rooted in alternative medicine. 

My latest in @bigthink on the unsavory history of the wellness industry:',
  'http://twitter.com/jonathanstea/statuses/1938693512855462308',
  'https://bigthink.com/health/the-unsavory-history-of-the-wellness-industry/',
  '2025-06-27'::timestamptz, now()
FROM handles h WHERE h.name = 'Jonathan N Stea';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink How Apple, Airbnb, and Amazon created entirely new markets: The "blue ocean strategy"

Read more: https://t.co/luozkKHhYW',
  'http://twitter.com/JasonSilva/statuses/1939709737324716346',
  'https://bigthink.com/business/blue-ocean-strategy-the-red-thread-connecting-apple-with-yellow-tail/',
  '2025-06-30'::timestamptz, now()
FROM handles h WHERE h.name = 'Jason Silva';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  '"New technologies have always scared people. When the printing press was invented, Scribes’ Guilds destroyed the machines and chased book merchants out of town."

https://t.co/HWKKCju6Kc',
  'http://twitter.com/jposhaughnessy/statuses/1940766030357581897',
  'https://bigthink.com/the-past/printing-press-ai/',
  '2025-07-03'::timestamptz, now()
FROM handles h WHERE h.name = 'Jim O''Shaughnessy';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @jposhaughnessy "New technologies have always scared people. When the printing press was invented, Scribes’ Guilds destroyed the machines and chased book merchants out of town."

https://t.co/HWKKCju6Kc',
  'http://twitter.com/PessimistsArc/statuses/1940836086437273943',
  'https://bigthink.com/the-past/printing-press-ai/',
  '2025-07-03'::timestamptz, now()
FROM handles h WHERE h.name = 'Pessimists Archive';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'whaaaat!

never thought that the moon left a glowing trail of sodium! here they visualize it 

via bigthink

https://t.co/oIHJlBtk4r https://t.co/h9syNAKII7',
  'http://twitter.com/DanielleFong/statuses/1941967974577184948',
  'https://bigthink.com/starts-with-a-bang/astronaut-footprints-disappearing-moon/',
  '2025-07-06'::timestamptz, now()
FROM handles h WHERE h.name = 'Danielle Fong';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'We''ve now seen 3 interstellar objects passing through the solar system. Each is distinctly different. 

Comet 3I/ATLAS is by far the biggest, fastest & oldest: probably older than our solar system, making it the most ancient object we''ve seen up close. 

https://t.co/ebHj1I0Imz https://t.co/vFCkrg5FIX',
  'http://twitter.com/coreyspowell/statuses/1944408774279606376',
  'https://bigthink.com/starts-with-a-bang/third-interstellar-object-3i-atlas/',
  '2025-07-13'::timestamptz, now()
FROM handles h WHERE h.name = 'Corey S Powell';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'This was my most "big-think" post in a while: A vision of what humanity will look like over the next century, as our numbers steadily dwindle but we''re connected ever more tightly into AI-guided hive minds.

https://t.co/XPNK5e17yu',
  'http://twitter.com/Noahpinion/statuses/1944689409456324734',
  NULL,
  '2025-07-14'::timestamptz, now()
FROM handles h WHERE h.name = 'Noah Smith';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'An excellent overview here.

The 6 superpowers of generalists: #Leadership gold dust.
.
 https://t.co/hIAGqmm0iw',
  'http://twitter.com/jameslhbartlett/statuses/1945011281414480006',
  'https://bigthink.com/business/the-6-superpowers-of-generalists-leadership-gold-dust/',
  '2025-07-15'::timestamptz, now()
FROM handles h WHERE h.name = 'James L H Bartlett';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@Loh https://t.co/iBBihX0pxc',
  'http://twitter.com/AdamSinger/statuses/1945466483791827102',
  'https://bigthink.com/the-present/yuri-bezmenov/',
  '2025-07-16'::timestamptz, now()
FROM handles h WHERE h.name = 'Adam Singer';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@CS19964872 yeah https://t.co/iBBihX0pxc',
  'http://twitter.com/AdamSinger/statuses/1945481037011698037',
  'https://bigthink.com/the-present/yuri-bezmenov/',
  '2025-07-16'::timestamptz, now()
FROM handles h WHERE h.name = 'Adam Singer';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Oxonians! I''ll be exploring "the mystery of consciousness" with none other than Jonny Thomson @philosophyminis at The North Wall Arts Centre on Sep 16th. Tickets are free - courtesy of @bigthink. More details: https://t.co/WRqCswiA5o',
  'http://twitter.com/anilkseth/statuses/1945581199033770125',
  NULL,
  '2025-07-16'::timestamptz, now()
FROM handles h WHERE h.name = 'Anil Seth';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @anilkseth Oxonians! I''ll be exploring "the mystery of consciousness" with none other than Jonny Thomson @philosophyminis at The North Wall Arts Centre on Sep 16th. Tickets are free - courtesy of @bigthink. More details: https://t.co/WRqCswiA5o',
  'http://twitter.com/TheAnnaGat/statuses/1945595496447262800',
  NULL,
  '2025-07-16'::timestamptz, now()
FROM handles h WHERE h.name = 'Anna Gat';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Stuck doomscrolling? @neuranne #SmartSkills

Here''s how to redirect your reward system: https://t.co/YCWH2BVBFS',
  'http://twitter.com/neuranne/statuses/1947919128209322290',
  NULL,
  '2025-07-23'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Excellent insights here. Experience counts!

Founders: The hiring strategy that can turn scrappy to stellar.
 https://t.co/zkdGBbD8WY',
  'http://twitter.com/jameslhbartlett/statuses/1948313246911406266',
  'https://bigthink.com/business/founders-the-hiring-strategy-that-can-turn-scrappy-to-stellar/',
  '2025-07-24'::timestamptz, now()
FROM handles h WHERE h.name = 'James L H Bartlett';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Why self and free will are actually illusions | Annaka Harris @annakaharris 

0:00 The illusion of self 
4:22 The brain as a dynamic process 
6:53 Decision-making & “free will" 
10:33 Neuroscience of the self
13:11 Losing the self https://t.co/xoH0nT2UEw',
  'http://twitter.com/annakaharris/statuses/1949192765340074363',
  NULL,
  '2025-07-26'::timestamptz, now()
FROM handles h WHERE h.name = 'Annaka Harris';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'When @PikeGrey1418 and I sat down with @bigthink to talk all things 1914… 

https://t.co/0ADtF5vv7X',
  'http://twitter.com/churchill_alex/statuses/1951610800495296520',
  'https://bigthink.com/books/ring-of-fire-book',
  '2025-08-02'::timestamptz, now()
FROM handles h WHERE h.name = 'Alexandra Churchill';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink 6 books that changed the life of @JohnAmaechi 🧵

1. Whistling Vivaldi by @cmasonsteele

“Whistling Vivaldi is Claude Steele’s insightful exploration of (and my first introduction to the concept of) stereotype threat and how identity shapes performance and experience, especially in education and the workplace.”',
  'http://twitter.com/JohnAmaechi/statuses/1953531120609370417',
  NULL,
  '2025-08-07'::timestamptz, now()
FROM handles h WHERE h.name = 'John Amaechi';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  '"Just as giving constructive criticism is no straight-forward matter and requires skills and knowledge, so it is with compliments. Done well, words of praise can be a soothing balm for human relations at home and at work." — Dr. @arthurbrooks, in an excerpt from "The Happiness Files" for @bigthink 
https://t.co/4Rjazte6ed',
  'http://twitter.com/HarvardBiz/statuses/1955677995089186966',
  NULL,
  '2025-08-13'::timestamptz, now()
FROM handles h WHERE h.name = 'Harvard Business Review';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @HarvardBiz "Just as giving constructive criticism is no straight-forward matter and requires skills and knowledge, so it is with compliments. Done well, words of praise can be a soothing balm for human relations at home and at work." — Dr. @arthurbrooks, in an excerpt from "The Happiness Files" for @bigthink 
https://t.co/4Rjazte6ed',
  'http://twitter.com/arthurbrooks/statuses/1955701913858560478',
  NULL,
  '2025-08-13'::timestamptz, now()
FROM handles h WHERE h.name = 'Arthur Brooks';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'An excerpt from my new book, "The Happiness Files," in @bigthink 

Read here: https://t.co/mdGofxRGmg',
  'http://twitter.com/arthurbrooks/statuses/1955702266268180535',
  'https://bigthink.com/business/how-to-give-compliments-and-criticism-for-a-happier-work-life/',
  '2025-08-13'::timestamptz, now()
FROM handles h WHERE h.name = 'Arthur Brooks';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink What if we could learn from the biggest thinkers... by pretending to be them?

"It’s easier to imitate wholeness than it is to assemble it from parts." — @catehall 

Read more: https://t.co/zh8ai4udFx https://t.co/OXzWAu6D4l',
  'http://twitter.com/catehall/statuses/1955704505112420490',
  'https://bigthink.com/smart-skills/how-to-instantly-be-better-at-things/',
  '2025-08-13'::timestamptz, now()
FROM handles h WHERE h.name = 'Cate Hall';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@jasoncrawford Map via @bigthink https://t.co/mnUK6HFr5h',
  'http://twitter.com/jasoncrawford/statuses/1955725049731633314',
  'https://bigthink.com/strange-maps/342-more-typical-than-any-real-state-of-the-union-sinclair-lewiss-winnemac/',
  '2025-08-13'::timestamptz, now()
FROM handles h WHERE h.name = 'Jason Crawford';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@SMC_1991 @bigthink thank you, Scott :)',
  'http://twitter.com/catehall/statuses/1955758122179682478',
  NULL,
  '2025-08-13'::timestamptz, now()
FROM handles h WHERE h.name = 'Cate Hall';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@kevinmusingu @lexfridman @tferriss @naval @Rainmaker1973 @bigthink Thank you. A high honor to be on this list.',
  'http://twitter.com/BrianRoemmele/statuses/1957077855336026428',
  NULL,
  '2025-08-17'::timestamptz, now()
FROM handles h WHERE h.name = 'Brian Roemmele';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink What if we saw procrastination as a signal? @neuranne 

Anne-Laure Le Cunff, neuroscientist and author of "Tiny Experiments", shares how to understand and address the root causes of your procrastination.

0:00 The moralization of procrastination
1:47 The Triple Check Method
2:29 Using the method to take action
3:24 Looking for systemic barriers 
3:55 Finding your ‘Magic Windows’
5:56 Using procrastination to connect with our emotions',
  'http://twitter.com/neuranne/statuses/1957500213192446186',
  NULL,
  '2025-08-18'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Big news: Big Think is going to print.

Our next special issue, "Consciousness," drops later this week. And for the first time ever, Big Think members will find a physical copy on their doorsteps.

Want one? Sign up to be a member on Substack: https://t.co/9yTJjKYkOd https://t.co/vh1Qsse9Vl',
  'http://twitter.com/LouisAnslow/statuses/1957979021129478199',
  NULL,
  '2025-08-20'::timestamptz, now()
FROM handles h WHERE h.name = 'Louis Anslow';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'An interview of me was just published in @bigthink. Here''s why I still like Integrated Information Theory as a theory of consciousness https://t.co/oBrdE8C0mN',
  'http://twitter.com/erikphoel/statuses/1958254605780811834',
  NULL,
  '2025-08-20'::timestamptz, now()
FROM handles h WHERE h.name = 'Erik Hoel';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink A fascinating look into tech fears of the past from @PessimistsArc and @LouisAnslow https://t.co/gKICPSQ9UM',
  'http://twitter.com/PessimistsArc/statuses/1958274388643438717',
  NULL,
  '2025-08-20'::timestamptz, now()
FROM handles h WHERE h.name = 'Pessimists Archive';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'My interview with @AdamFrank4 on @bigthink:
"Growing up, Annaka Harris had a restless, inquisitive mind — and terrible migraines. Which is how she developed an interest in the subject that would captivate her for most of her career: consciousness..." https://t.co/JuwCI91AAw',
  'http://twitter.com/annakaharris/statuses/1958317133072666838',
  'https://bigthink.com/13-8/annaka-harris-on-consciousness/',
  '2025-08-20'::timestamptz, now()
FROM handles h WHERE h.name = 'Annaka Harris';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  '“Harris challenges the belief that consciousness emerges from complexity, instead treating it as a fundamental feature of reality.”

https://t.co/BpTysZMdQV',
  'http://twitter.com/donalddhoffman/statuses/1958523249991774343',
  'https://bigthink.com/13-8/annaka-harris-on-consciousness/',
  '2025-08-21'::timestamptz, now()
FROM handles h WHERE h.name = 'Donald Hoffman';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @donalddhoffman “Harris challenges the belief that consciousness emerges from complexity, instead treating it as a fundamental feature of reality.”

https://t.co/BpTysZMdQV',
  'http://twitter.com/JasonSilva/statuses/1958566870312747328',
  'https://bigthink.com/13-8/annaka-harris-on-consciousness/',
  '2025-08-21'::timestamptz, now()
FROM handles h WHERE h.name = 'Jason Silva';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink A conversation with Annaka Harris on shared perception, experimental science, and why our intuition about consciousness is wrong. @annakaharris https://t.co/rgwmIMjnZM',
  'http://twitter.com/annakaharris/statuses/1958576959363166447',
  NULL,
  '2025-08-21'::timestamptz, now()
FROM handles h WHERE h.name = 'Annaka Harris';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink The Consciousness Issue is live!

This special issue explores the field''s biggest questions with essays and interviews from experts like Anil Seth, Annaka Harris, Erik Hoel, and Peter Godfrey-Smith.

Some highlights:

🧵 (1/6) https://t.co/9SrRecbJwt',
  'http://twitter.com/annakaharris/statuses/1958577163495776334',
  NULL,
  '2025-08-21'::timestamptz, now()
FROM handles h WHERE h.name = 'Annaka Harris';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink @annakaharris An essay from Anil Seth on how the tendency of machine minds to get stuck in infinite loops makes "AI consciousness" unlikely. @anilkseth @jonwrhan https://t.co/aIx2FsfBOe',
  'http://twitter.com/anilkseth/statuses/1958810265396326872',
  NULL,
  '2025-08-22'::timestamptz, now()
FROM handles h WHERE h.name = 'Anil Seth';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @AdamFrank4 Here is my interview with the always creative and thought provoking @annakaharris on the nature of consciousness - perhaps the most important question emerging for the 21st century. 

@bigthink 

https://t.co/fV3tI7w50h',
  'http://twitter.com/annakaharris/statuses/1958949123140591705',
  'https://bigthink.com/13-8/annaka-harris-on-consciousness/',
  '2025-08-22'::timestamptz, now()
FROM handles h WHERE h.name = 'Annaka Harris';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  '“Consciousness is at once a scientific puzzle, a philosophical riddle, and a personal reality — the background of everything we know.”

https://t.co/9GvJvMOJ7z',
  'http://twitter.com/donalddhoffman/statuses/1959254947943608658',
  'https://bigthink.com/collections/consciousness/',
  '2025-08-23'::timestamptz, now()
FROM handles h WHERE h.name = 'Donald Hoffman';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  'A breathtaking and exquisitely written essay',
  'http://twitter.com/slsatel/statuses/1959276693912174874',
  'https://bigthink.com/business/brain-surgery-fragile-gift-of-consciousness/',
  '2025-08-23'::timestamptz, now()
FROM handles h WHERE h.name = 'Sally Satel';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @donalddhoffman “Consciousness is at once a scientific puzzle, a philosophical riddle, and a personal reality — the background of everything we know.”

https://t.co/9GvJvMOJ7z',
  'http://twitter.com/JasonSilva/statuses/1959289202740252772',
  'https://bigthink.com/collections/consciousness/',
  '2025-08-23'::timestamptz, now()
FROM handles h WHERE h.name = 'Jason Silva';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @MacrinePhD Why does AI get stuck in infinite loops?

"Unlike computers, we are beings in time-embodied, embedded, and entimed in our worlds. We can never be caught in infinite loops because we never exist out of time." 

Read the full essay from @anilkseth here: https://t.co/BIeAqhw5bC',
  'http://twitter.com/anilkseth/statuses/1959295303980400925',
  'https://bigthink.com/neuropsych/anil-seth-consciousness-time-perception/',
  '2025-08-23'::timestamptz, now()
FROM handles h WHERE h.name = 'Anil Seth';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bimedotcom Why the 21st century could bring a new "consciousness winter" https://t.co/wURcVAuzdq 
✍️ @SteRoPo via @bigthink 

👉A conversation with neuroscientist @erikphoel about the future of consciousness research
👉"Hoel argues that the “real bottleneck” in modern consciousness research is a shortage of good ideas"
👉"He suggests the creation of AGI might lead people to think not that AI is conscious, but rather that it is highly intelligent, and therefore consciousness doesn’t matter much" 

@Corix_JC @jeanyvesgonin @sonu_monika @JagersbergKnut @ahier @sim010101 @maponi @EstelaMandela @Shi4Tech @BetaMoroney @CEO_Aisoma @SpirosMargaris @IngridVasiliu @dinisguarda @mvollmer1 @RamonaEid @smaksked @ChuckDBrooks @FernandaKellner @YvesMulkers @PVynckier @JoannMoretti @NeiraOsci @tlloydjones @SusanHayes_ @theomitsa @TarakRindani @Nicochan33 @mikeflache @Khulood_Almani @TysonLester @KanezaDiane @CurieuxExplorer @amalmerzouk @MaryRich78 @sulefati7 @pchamard @Analytics_699 @TheAIObserverX @NathaliaLeHen @sminaev2015 @WillyRayNick @jeancayeux @DanielleLargier @ALLavalette @FrRonconi @RLDI_Lamy',
  'http://twitter.com/erikphoel/statuses/1959673643950055864',
  'https://bigthink.com/neuropsych/erik-hoel-on-the-consciousness-wars/',
  '2025-08-24'::timestamptz, now()
FROM handles h WHERE h.name = 'Erik Hoel';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink What if our intuition about consciousness is wrong? @annakaharris

"We have no direct evidence that consciousness arises from complexity. We assume it because it seems that way to us, based on what we now understand to be illusions created by the brain." https://t.co/TYkFeROvD8',
  'http://twitter.com/annakaharris/statuses/1960365851422642497',
  NULL,
  '2025-08-26'::timestamptz, now()
FROM handles h WHERE h.name = 'Annaka Harris';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@EricNewcomer @nikitabier this one? https://t.co/tQ3pSUjFmS',
  'http://twitter.com/alex/statuses/1960746328847474886',
  'https://bigthink.com/wp-content/uploads/2025/02/cropped-iq-curve-moral-circles-meme.png?resize=480',
  '2025-08-27'::timestamptz, now()
FROM handles h WHERE h.name = 'Alex Wilhelm';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  'New written interview about what I’ve learned from reading 400 biographies of founders:',
  'http://twitter.com/FoundersPodcast/statuses/1961094708974776618',
  'https://bigthink.com/business/the-david-senra-interview-use-history-as-a-form-of-leverage/',
  '2025-08-28'::timestamptz, now()
FROM handles h WHERE h.name = 'David Senra';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@SeekingN0rth @bigthink Spend more time with a handful of timeless principles. Revisit them often. Skip everything else.',
  'http://twitter.com/FoundersPodcast/statuses/1961107347365138691',
  NULL,
  '2025-08-28'::timestamptz, now()
FROM handles h WHERE h.name = 'David Senra';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@FoundersPodcast Full interview: https://t.co/vlgKPGW1eF',
  'http://twitter.com/FoundersPodcast/statuses/1961108363041018363',
  'https://bigthink.com/business/the-david-senra-interview-use-history-as-a-form-of-leverage/',
  '2025-08-28'::timestamptz, now()
FROM handles h WHERE h.name = 'David Senra';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@philoliberta @bigthink @davidsenra Zell nailed that. At the top.',
  'http://twitter.com/FoundersPodcast/statuses/1961276938250539320',
  NULL,
  '2025-08-29'::timestamptz, now()
FROM handles h WHERE h.name = 'David Senra';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '“I personally think the world has enough critics and that we need more enthusiasts.”
~@FoundersPodcast 

Great interview with David 👇🏻',
  'http://twitter.com/jposhaughnessy/statuses/1961418893596963323',
  'https://bigthink.com/business/the-david-senra-interview-use-history-as-a-form-of-leverage/',
  '2025-08-29'::timestamptz, now()
FROM handles h WHERE h.name = 'Jim O''Shaughnessy';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  'I really enjoyed this conversation with @KHosanagar on the question of ''Conscious AI'' - well worth a listen 👇🏽 - see also this short piece in @bigthink https://t.co/l8JTv2Deia',
  'http://twitter.com/anilkseth/statuses/1962905433846268347',
  NULL,
  '2025-09-02'::timestamptz, now()
FROM handles h WHERE h.name = 'Anil Seth';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink We all love to criticize. 

Unfortunately, we also hate being criticized.

How can we give and take better feedback for a happier life?

Professor Arthur C. Brooks breaks down 4 research-backed rules to getting and giving criticism.

@arthurbrooks @harvardbiz

🧵 1/4 https://t.co/fqiV9S5W4g',
  'http://twitter.com/arthurbrooks/statuses/1962980852490531286',
  NULL,
  '2025-09-02'::timestamptz, now()
FROM handles h WHERE h.name = 'Arthur Brooks';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  'Really looking forward to this - and delighted to be able to come back to Oxford for an evening 👇🏽',
  'http://twitter.com/anilkseth/statuses/1963299554603790424',
  NULL,
  '2025-09-03'::timestamptz, now()
FROM handles h WHERE h.name = 'Anil Seth';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Dropping soon: me for @bigthink (again!). Stay tuned for my reflections on the state of boys and men in 2025. Thanks a ton to the producers and crew for making this possible! https://t.co/sSDebA4162',
  'http://twitter.com/RichardvReeves/statuses/1963630467493548166',
  NULL,
  '2025-09-04'::timestamptz, now()
FROM handles h WHERE h.name = 'Richard Reeves';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Recent news that unemployment for men has jumped to 4.1% (vs 3.8% for women) underscores what I discussed here: we’re not just seeing individual struggles, but structural problems in our economy. Grateful for the platform w/ @bigthink to discuss the challenges facing young men. https://t.co/mK8kqd0Ate',
  'http://twitter.com/RichardvReeves/statuses/1963997003169386653',
  NULL,
  '2025-09-05'::timestamptz, now()
FROM handles h WHERE h.name = 'Richard Reeves';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@CNewcombe67 @ScienceMagazine @DanClery Here''s some helpful background:
https://t.co/AWGwXdra1P',
  'http://twitter.com/coreyspowell/statuses/1964695143631712373',
  'https://bigthink.com/starts-with-a-bang/7-independent-pieces-of-evidence-for-dark-matter/',
  '2025-09-07'::timestamptz, now()
FROM handles h WHERE h.name = 'Corey S Powell';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@JMchangama In my new video for @bigthink’s The Well, I explain why abandoning free speech in fear of its abuses risks losing democracy itself. Watch here: https://t.co/hE5LbrbHBH',
  'http://twitter.com/JMchangama/statuses/1965459163892559890',
  'https://bigthink.com/the-well/true-free-speech/',
  '2025-09-09'::timestamptz, now()
FROM handles h WHERE h.name = 'Jacob Mchangama';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@RichardvReeves Full video: https://t.co/HubdYoUoK3',
  'http://twitter.com/RichardvReeves/statuses/1965773987461677410',
  'https://bigthink.com/series/full-interview/working-class-men/',
  '2025-09-10'::timestamptz, now()
FROM handles h WHERE h.name = 'Richard Reeves';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Maybe it''s just complex and can''t fit within a tiny box? https://t.co/D2snbkqwdu',
  'http://twitter.com/IntuitMachine/statuses/1966071621501989113',
  'https://bigthink.com/starts-with-a-bang/argument-against-theory-of-everything/',
  '2025-09-11'::timestamptz, now()
FROM handles h WHERE h.name = 'Carlos E Perez';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink 5 more days until our free event "The Mystery of Consciousness" at The North Wall Arts Centre with @anilkseth @philosophyminis 

Get your tickets here: https://t.co/JmMKZmAvs4 https://t.co/fVcXn2WsQx',
  'http://twitter.com/anilkseth/statuses/1966239367661498726',
  NULL,
  '2025-09-11'::timestamptz, now()
FROM handles h WHERE h.name = 'Anil Seth';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Why working-class men are facing the sharpest decline | Full interview with Richard Reeves @RichardvReeves 

Reeves argues that men are struggling in ways that challenge our cultural narratives about progress. 

00:00:00 The permission space to talk about boys and men
00:02:02 The abandonment of men
00:02:48 Barriers to talking about boys and men
00:05:15 Young men and blame
00:08:39 Men and the job market
00:12:24 Economic trends for working class men
00:19:40 Unhoused men
00:30:54 Why representation matters
00:31:32 Men and the mental health crisis
00:32:17 Men and recreational drug use
00:42:18 Men and political affiliation
01:15:45 The positive aspects of masculinity 
01:16:47 The term ‘toxic masculinity’
01:18:26 Men and risk-taking 
01:21:57 Oxytocin and bonding
01:25:40 The nature of fatherhood',
  'http://twitter.com/RichardvReeves/statuses/1966856355031253321',
  NULL,
  '2025-09-13'::timestamptz, now()
FROM handles h WHERE h.name = 'Richard Reeves';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Russian Cosmism imagined a world where science and technology could conquer death and unite humanity.
 
@bigthink interviewed Boris Groys about why these 19th-century ideas feel surprisingly relevant in the age of Big Tech: https://t.co/OYCIdxhufX',
  'http://twitter.com/mitpress/statuses/1967601562923975159',
  'https://bigthink.com/high-culture/cosmism-russia-future/',
  '2025-09-15'::timestamptz, now()
FROM handles h WHERE h.name = 'MIT Press';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'I''m delighted to be heading back to Oxford today, to talk about The Mystery of Consciousness with Jonny Thomson @philosophyminis @bigthink, 7pm at The North Wall Cultural Centre https://t.co/WRqCswj7UW',
  'http://twitter.com/anilkseth/statuses/1967890324409422198',
  NULL,
  '2025-09-16'::timestamptz, now()
FROM handles h WHERE h.name = 'Anil Seth';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink In America, liberalism is being squeezed from both sides of the political aisle. @CassSunstein @KevinRDickinson #BTBooks

Cass Sunstein makes the case for a reinvigoration of liberalism by sharing what we stand to lose if we can''t save it from crisis. https://t.co/vA3dgVrWU5',
  'http://twitter.com/CassSunstein/statuses/1967984430041141395',
  NULL,
  '2025-09-16'::timestamptz, now()
FROM handles h WHERE h.name = 'Cass Sunstein';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  '"Gutenberg to Zuckerberg: How to handle disruption without hitting an iceberg" via @bigthink. Enjoy an excerpt from @ScottDAnthony''s new book, "Epic Disruptions," out today: 
https://t.co/kERRb5ohJ1',
  'http://twitter.com/HarvardBiz/statuses/1968082472723222656',
  'https://bigthink.com/business/gutenberg-to-zuckerberg-how-to-handle-disruption-without-hitting-an-iceberg/',
  '2025-09-16'::timestamptz, now()
FROM handles h WHERE h.name = 'Harvard Business Review';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Excellent article on self-understanding and #leadership. We can all self-assess to learn from it.

Why self-understanding is your most valuable leadership asset.
.
 https://t.co/iYTFWKIdvH',
  'http://twitter.com/jameslhbartlett/statuses/1968589370845257756',
  'https://bigthink.com/business/why-self-understanding-is-your-most-valuable-leadership-asset/',
  '2025-09-18'::timestamptz, now()
FROM handles h WHERE h.name = 'James L H Bartlett';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  'I am honored to have #consciousthebook included on this list! @drrachelbarr',
  'http://twitter.com/annakaharris/statuses/1970202609685561616',
  NULL,
  '2025-09-22'::timestamptz, now()
FROM handles h WHERE h.name = 'Annaka Harris';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink @KevinRDickinson @GazzanigaM 3. Conscious: A Brief Guide to the fundamental Mystery of the Mind @annakaharris https://t.co/L8KrnYAtyh',
  'http://twitter.com/annakaharris/statuses/1970202756670800101',
  NULL,
  '2025-09-22'::timestamptz, now()
FROM handles h WHERE h.name = 'Annaka Harris';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @culichi The Morissa Schwartz interview: AI and the new media landscape https://t.co/MkK5UITwrw',
  'http://twitter.com/MorissaSchwartz/statuses/1970768283122180322',
  'https://bigthink.com/business/the-morissa-schwartz-interview-ai-and-the-new-media-landscape/',
  '2025-09-24'::timestamptz, now()
FROM handles h WHERE h.name = 'Morissa Schwartz';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@alexisohanian @Reddit Founders who treat storytelling as part of the job (not fluff) will see the payoff.

An excerpt from @chrissyfarr''s "The Storyteller’s Advantage" in @BigThink dives into how I approached it ↓ 
https://t.co/pUHcaIdmFQ',
  'http://twitter.com/alexisohanian/statuses/1971288670989881449',
  'https://bigthink.com/business/channel-the-storytelling-genius-of-reddit-cofounder-alexis-ohanian/',
  '2025-09-25'::timestamptz, now()
FROM handles h WHERE h.name = 'Alexis Ohanian';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @AdamFrank4 My @bigthink interview with the wonderful @david_kipping about all things astrobiology and science outreach.

https://t.co/kVYzoT3695',
  'http://twitter.com/david_kipping/statuses/1971849095569686685',
  'https://bigthink.com/13-8/david-kipping-on-how-the-search-for-alien-life-is-gaining-credibility/',
  '2025-09-27'::timestamptz, now()
FROM handles h WHERE h.name = 'David Kipping';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigmic2504 Building a free speech culture with Greg Lukianoff https://t.co/jp9HTj4CbY',
  'http://twitter.com/glukianoff/statuses/1972348928445251669',
  'https://bigthink.com/series/the-big-think-interview/free-speech-with-greg-lukianoff/',
  '2025-09-28'::timestamptz, now()
FROM handles h WHERE h.name = 'Greg Lukianoff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  '15+ years later... Should I go back on Big Think? 
(they just reached out, wanting me to talk about the turnaround & then the move in 2020 to 776 and reimagining new industries like sports) https://t.co/5I55eekdei',
  'http://twitter.com/alexisohanian/statuses/1972437500313670104',
  NULL,
  '2025-09-28'::timestamptz, now()
FROM handles h WHERE h.name = 'Alexis Ohanian';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink How to filter news like a spy | Andrew Bustamante

Former CIA intelligence officer, Andrew Bustamante, explains how to find the facts behind a story. 

@EverydaySpy #SmartSkills https://t.co/IxROfNGxai',
  'http://twitter.com/EverydaySpy/statuses/1972729303675859278',
  NULL,
  '2025-09-29'::timestamptz, now()
FROM handles h WHERE h.name = 'Andrew Bustamente';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  'This really mattered in 2005. I highly encourage founders to go direct today. The core is more true now than ever — be a storyteller, not just a CEO.',
  'http://twitter.com/alexisohanian/statuses/1972763320081056237',
  NULL,
  '2025-09-29'::timestamptz, now()
FROM handles h WHERE h.name = 'Alexis Ohanian';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Are video games and porn the problem? | Richard Reeves

Writer and social scientist Richard Reeves explores the role of video games and porn as a place to go for men retreating from the labor market. 

#Sociology @RichardVReeves https://t.co/tLLxQljJwA',
  'http://twitter.com/RichardvReeves/statuses/1974243692010443047',
  NULL,
  '2025-10-03'::timestamptz, now()
FROM handles h WHERE h.name = 'Richard Reeves';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'The sharp edge of the issues facing boys and men is being felt by the men with the least amount of economic power.

Check out my full interview with @bigthink: https://t.co/HubdYoUoK3 https://t.co/9xEPehPc5e',
  'http://twitter.com/RichardvReeves/statuses/1974471904611459237',
  'https://bigthink.com/series/full-interview/working-class-men/',
  '2025-10-04'::timestamptz, now()
FROM handles h WHERE h.name = 'Richard Reeves';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @koenfucius Resilience is not the absence of setbacks. It is “the idea that you recognize this setback is a part of your achievement pathway, and you''re going to return and maybe even exceed your previous performance despite it”, says @johnamaechi:

https://t.co/HAa7QJyCYU https://t.co/PFrMaj226h',
  'http://twitter.com/JohnAmaechi/statuses/1974769330291200502',
  'https://bigthink.com/series/legends/john-amaechi/',
  '2025-10-05'::timestamptz, now()
FROM handles h WHERE h.name = 'John Amaechi';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'When most people hear the name Kellogg, they think of breakfast ce­real. 

Corn Flakes, Rice Krispies, maybe even Eggo Waffles and Pop-Tarts. 

Misogynistically removing the clitoris as a punishment, masked as a treatment for female sexual promiscuity and masturbation, is not top of mind. 

Yet these kinds of moralizing ideas about health—embraced and perpetuated by a health authority of Kellogg’s significance—gave birth to the modern wellness industry and have become rooted in alternative medicine. 

I wrote in @bigthink on the unsavory history of the wellness industry: https://t.co/ecntXcHrfE',
  'http://twitter.com/jonathanstea/statuses/1975538482199318895',
  NULL,
  '2025-10-07'::timestamptz, now()
FROM handles h WHERE h.name = 'Jonathan N Stea';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink What is the difference between being motivated and being manipulated? | Andrew Bustamante
#Psychology @everydayspy https://t.co/1NFS2e90iC',
  'http://twitter.com/EverydaySpy/statuses/1975585715711865150',
  NULL,
  '2025-10-07'::timestamptz, now()
FROM handles h WHERE h.name = 'Andrew Bustamente';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @jonathanstea When most people hear the name Kellogg, they think of breakfast ce­real. 

Corn Flakes, Rice Krispies, maybe even Eggo Waffles and Pop-Tarts. 

Misogynistically removing the clitoris as a punishment, masked as a treatment for female sexual promiscuity and masturbation, is not top of mind. 

Yet these kinds of moralizing ideas about health—embraced and perpetuated by a health authority of Kellogg’s significance—gave birth to the modern wellness industry and have become rooted in alternative medicine. 

I wrote in @bigthink on the unsavory history of the wellness industry: https://t.co/ecntXcHrfE',
  'http://twitter.com/jonathanstea/statuses/1975688848480084285',
  NULL,
  '2025-10-07'::timestamptz, now()
FROM handles h WHERE h.name = 'Jonathan N Stea';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bizbookpr Why most people are only giving 70%--and what happens at 100%. @bigthink video interview with psychologist & former @NBA basketball player @JohnAmaechi about his book #ItsNotMagic: The Ordinary Skills of Exceptional Leaders @WileyBusiness https://t.co/ZteU2Pd5WB via @YouTube',
  'http://twitter.com/JohnAmaechi/statuses/1976013124613570965',
  NULL,
  '2025-10-08'::timestamptz, now()
FROM handles h WHERE h.name = 'John Amaechi';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'In order to fully understand the conflict in the Middle East, I had to see it through the eyes of a novelist. https://t.co/vjmR5f1sI1',
  'http://twitter.com/lawrence_wright/statuses/1976759774445265378',
  'https://bigthink.com/series/the-big-think-interview/lawrence-wright-truth-fiction/',
  '2025-10-10'::timestamptz, now()
FROM handles h WHERE h.name = 'Lawrence Wright';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @Rainmaker1973 Ever feel like you just *get* someone? Here''s the science of what''s going on.

When you vibe effortlessly in conversation, it’s not just shared interests—your brains might be in sync. Neuroscientist Ben Rein notes that close friends often share similar brain structures in social regions, a concept called homophily, where neurologically similar people bond easily. This similarity makes conversations flow smoothly, as your brains operate on the same wavelength.

Beyond this structural overlap, there’s something even more sci-fi: interbrain synchrony.

This occurs when two people interacting—especially during teamwork or storytelling—exhibit nearly identical patterns of brain activity in certain regions. It’s not magic or telepathy, just the brain’s natural ability to mirror and connect. So if you’ve ever walked away from a great conversation feeling unusually understood, there’s a good chance your brain was quite literally in sync with theirs.

[Thomson, J. (2024). The sci-fi hypothesis that explains why you click with certain people. Big Think]',
  'http://twitter.com/AskDrShashank/statuses/1976805984334188769',
  NULL,
  '2025-10-11'::timestamptz, now()
FROM handles h WHERE h.name = 'Shashank Joshi';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink How do we make the shift to seeing failure as an opportunity for learning? 

Acquire CEO Andrew Gazdecki talks "outrageous optimism", failure as signal, and overthinking. 

Read the full article by Tim Brinkhof: https://t.co/zukk5xmQtV 

@agazdecki #Business https://t.co/e2Y0G4HjhU',
  'http://twitter.com/agazdecki/statuses/1977790527090438330',
  'https://bigthink.com/business/why-outrageous-optimism-is-your-startup-super-skill/',
  '2025-10-13'::timestamptz, now()
FROM handles h WHERE h.name = 'Andrew Gazdecki';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@bigthink Thanks for the interview!',
  'http://twitter.com/agazdecki/statuses/1977790592865481125',
  NULL,
  '2025-10-13'::timestamptz, now()
FROM handles h WHERE h.name = 'Andrew Gazdecki';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Are young workers canaries in the AI coal mine?

@bigthink had a conversation with @econ_b and me about the research we did with @RuyuChen about AI and employment.

Links in the next post.',
  'http://twitter.com/erikbryn/statuses/1977912814066172267',
  NULL,
  '2025-10-14'::timestamptz, now()
FROM handles h WHERE h.name = 'Erik Brynjolfsson';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@erikbryn Here''s the interview:

https://t.co/vS7HtOZ3NA

And here''s the paper: https://t.co/9m8fVeO8Lz',
  'http://twitter.com/erikbryn/statuses/1977912814900764894',
  'https://bigthink.com/business/are-young-workers-canaries-in-the-ai-coal-mine/',
  '2025-10-14'::timestamptz, now()
FROM handles h WHERE h.name = 'Erik Brynjolfsson';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Do you find yourself forgetting things as you learn them? 

Inspired by a recent interview with neuroscientist, psychiatrist, and philosopher Iain McGilchrist, Jonny Thomson shares a process he calls "The Nexus Method."

@philosophyminis @dr_mcgilchrist

🧵 1/7 https://t.co/hEOyAY62AO',
  'http://twitter.com/dr_mcgilchrist/statuses/1978071693223424278',
  'https://bigthink.com/mini-philosophy/the-nexus-method-how-to-make-the-most-of-what-you-learn/',
  '2025-10-14'::timestamptz, now()
FROM handles h WHERE h.name = 'Iain McGilchrist';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Science is a patient act, and the simple desire to understand is one of the most beautiful and powerful parts of being human. Part of my conversation with @bigthink & @templeton_fdn is now online. Hope you enjoy it, stay curious! ✨

https://t.co/OXTNSeODuf',
  'http://twitter.com/betulland/statuses/1978114972900086186',
  NULL,
  '2025-10-14'::timestamptz, now()
FROM handles h WHERE h.name = 'Betul Kacar';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @betulland Science is a patient act, and the simple desire to understand is one of the most beautiful and powerful parts of being human. Part of my conversation with @bigthink & @templeton_fdn is now online. Hope you enjoy it, stay curious! ✨

https://t.co/OXTNSeODuf',
  'http://twitter.com/betulland/statuses/1978428410968871285',
  NULL,
  '2025-10-15'::timestamptz, now()
FROM handles h WHERE h.name = 'Betul Kacar';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @betulland Science is a patient act, and the simple desire to understand is one of the most beautiful and powerful parts of being human. Part of my conversation with @bigthink & @templeton_fdn is now online. Hope you enjoy it, stay curious! ✨

https://t.co/OXTNSeODuf',
  'http://twitter.com/betulland/statuses/1978631305500733921',
  NULL,
  '2025-10-16'::timestamptz, now()
FROM handles h WHERE h.name = 'Betul Kacar';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Huge honor being featured by @bigthink this week. We talked about why “outrageous optimism” is a required skillset for founders.

Startups are built by people who believe just enough to keep going when everything says stop. When the odds are 1000 to 1 that belief is what gets you through the “this might not work” moments.

I shared lessons from selling my first startup, what I got wrong, and why I built @acquiredotcom to make selling simpler for other founders.

If you’re building something right now, keep that spark. The best founders are optimistic to the point of being completely unreasonable and that’s exactly why they win.',
  'http://twitter.com/agazdecki/statuses/1978804847450456306',
  NULL,
  '2025-10-16'::timestamptz, now()
FROM handles h WHERE h.name = 'Andrew Gazdecki';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@agazdecki Check out the full interview here: https://t.co/Y2QwGWmcLq',
  'http://twitter.com/agazdecki/statuses/1978805204788158834',
  'https://bigthink.com/business/why-outrageous-optimism-is-your-startup-super-skill/',
  '2025-10-16'::timestamptz, now()
FROM handles h WHERE h.name = 'Andrew Gazdecki';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@samuelgrisanzio @bigthink Yes!',
  'http://twitter.com/agazdecki/statuses/1978809927297593690',
  NULL,
  '2025-10-16'::timestamptz, now()
FROM handles h WHERE h.name = 'Andrew Gazdecki';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@omidsard @bigthink 100%',
  'http://twitter.com/agazdecki/statuses/1978809963188297737',
  NULL,
  '2025-10-16'::timestamptz, now()
FROM handles h WHERE h.name = 'Andrew Gazdecki';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'One blockbuster innovation isn’t enough to maintain sustainable growth or achieve “legacy brand” status. In this piece for @Bigthink, Lew Frankfort, former CEO of Coach and author of Bag Man, shares how an obsession with “what made consumers tick” was a significant competitive advantage. https://t.co/yKYoh1cXFP',
  'http://twitter.com/HarvardBiz/statuses/1978858497103016006',
  NULL,
  '2025-10-16'::timestamptz, now()
FROM handles h WHERE h.name = 'Harvard Business Review';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink When has discomfort turned out to be a good thing in your life? 

Neuroscientist Anne-Laure Le Cunff explains how to harness periods of uncertainty for growth. 

Read the full article: https://t.co/OWIJY8qtAB 

@neuranne #Neuropsych https://t.co/vZDiUoeSZo',
  'http://twitter.com/neuranne/statuses/1979029220387921975',
  'https://bigthink.com/smart-skills/liminal-spaces-neuroscience/',
  '2025-10-17'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@liangsays @bigthink @freethinkmedia Freethink <> a16z collab LFGGGGG',
  'http://twitter.com/pronounced_kyle/statuses/1981031384790491434',
  NULL,
  '2025-10-22'::timestamptz, now()
FROM handles h WHERE h.name = 'Christian Keil';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@liangsays @a16z @bigthink @LumaLabsAI @elevenlabsio @theworldlabs which tweet',
  'http://twitter.com/tszzl/statuses/1981078329047630235',
  NULL,
  '2025-10-22'::timestamptz, now()
FROM handles h WHERE h.name = 'Roon';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @liangsays excited to present "two futures"

inspired by ai, infra, and a few @tszzl posts

produced by @a16z new media in partnership with @bigthink 

and help from @LumaLabsAI, @elevenlabsio and @theworldlabs - our amazing portcos https://t.co/0k4i8JJkLh',
  'http://twitter.com/kmele/statuses/1981140860483109029',
  NULL,
  '2025-10-22'::timestamptz, now()
FROM handles h WHERE h.name = 'Kmele Foster';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  '“For men, the old role of ‘I’ll just provide while you raise the kids,’ well that’s out the window,” I told @bigthink when discussing the cultural shift in marriages as divorces are declining. https://t.co/4xqjImiAz1',
  'http://twitter.com/RichardvReeves/statuses/1981436833348157785',
  NULL,
  '2025-10-23'::timestamptz, now()
FROM handles h WHERE h.name = 'Richard Reeves';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Why investing should be boring | Barry Ritholtz @Ritholtz https://t.co/itUTaE6MrR',
  'http://twitter.com/Ritholtz/statuses/1982891799996969160',
  NULL,
  '2025-10-27'::timestamptz, now()
FROM handles h WHERE h.name = 'Barry Ritholtz';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Why 2025 is the single most pivotal year in our lifetime | Peter Leyden @peteleyden 

0:00 An extraordinary moment in history
1:05 Wired magazine 
2:09 Technology adoption curve
2:53 80 year cycles
3:26 Post-war era
5:08 Gilded age
6:59 Founding era
8:24 The arrival of AI 
9:42 The rise of clean energy
10:52 The rise of bioengineering
13:45 The beginning of a shift',
  'http://twitter.com/peteleyden/statuses/1983598841451704835',
  NULL,
  '2025-10-29'::timestamptz, now()
FROM handles h WHERE h.name = 'Peter Leyden';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Why 2025 is the single most pivotal year in our lifetime | Peter Leyden @peteleyden 

0:00 An extraordinary moment in history
1:05 Wired magazine 
2:09 Technology adoption curve
2:53 80 year cycles
3:26 Post-war era
5:08 Gilded age
6:59 Founding era
8:24 The arrival of AI 
9:42 The rise of clean energy
10:52 The rise of bioengineering
13:45 The beginning of a shift',
  'http://twitter.com/garrytan/statuses/1984663095055397061',
  NULL,
  '2025-11-01'::timestamptz, now()
FROM handles h WHERE h.name = 'Garry Tan';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'I did a video with the folks at Big Think over the summer - it was intense, but also a lot of fun. 

Their MO is they throw questions at you for nearly 3 hours, then edit it down to one hour.

It dropped a week ago; already 100,000+ views!

Check it out:
https://t.co/pXs7vsCceZ',
  'http://twitter.com/Ritholtz/statuses/1984988831024665086',
  NULL,
  '2025-11-02'::timestamptz, now()
FROM handles h WHERE h.name = 'Barry Ritholtz';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Why we need men | Richard Reeves @richardvreeves https://t.co/9h4T8xYSxf',
  'http://twitter.com/RichardvReeves/statuses/1985485404703773171',
  NULL,
  '2025-11-03'::timestamptz, now()
FROM handles h WHERE h.name = 'Richard Reeves';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Why your best ideas come after your worst | Rachel Barr @drrachelbarr

According to former Co-owner of @TheOnion, @ScottDikkers, the brain has both a Clown and an Editor — one generates ideas, the other judges them. 

Which one do you think runs your life most of the time? https://t.co/JqP9kq5vRU',
  'http://twitter.com/ScottDikkers/statuses/1986043206459351183',
  NULL,
  '2025-11-05'::timestamptz, now()
FROM handles h WHERE h.name = 'Scott DIkkers';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @cowenconvos How persuadable are humans, really? Sam Altman returns to discuss accidental AI takeover, why GPT-6 might crack real science, when we''ll see AI CEOs running the show, and the question he asked someone to pose to the Dalai Lama.

Timestamps
0:00:00 – Sam’s basic trick for productivity
0:01:22 – Hiring hardware vs. software people
0:05:46 – How long before an AI CEO
0:10:48 – Government backstops for AI companies
0:13:26 – Monetizing AI services
0:18:04 – Negotiating deals with Saudia Arabia and the UAE
0:22:00 – How good GPT-6 will be at poetry
0:25:15 – Chip-building and where the energy will come from
0:29:04 – Sam’s changing health habits
0:30:20 – UAP’s and conspiracy theories
0:31:43 – Revitalizing St. Louis
0:33:12 – Regulating AI agents
0:34:39 – New ways to interface with AI
0:38:12 – How normies will learn AI
0:44:36 – The trajectory of healthcare and housing prices
0:46:57 – Reexamining freedom of speech
0:50:08 – Humanity’s persuadability

Recorded live with @tylercowen and @sama at the 2025 Progress Conference, hosted by @rootsofprogress. Thanks to @bigthink for the video production.',
  'http://twitter.com/tylercowen/statuses/1986103529098899667',
  NULL,
  '2025-11-05'::timestamptz, now()
FROM handles h WHERE h.name = 'Tyler Cowen';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @cowenconvos How persuadable are humans, really? Sam Altman returns to discuss accidental AI takeover, why GPT-6 might crack real science, when we''ll see AI CEOs running the show, and the question he asked someone to pose to the Dalai Lama.

Timestamps
0:00:00 – Sam’s basic trick for productivity
0:01:22 – Hiring hardware vs. software people
0:05:46 – How long before an AI CEO
0:10:48 – Government backstops for AI companies
0:13:26 – Monetizing AI services
0:18:04 – Negotiating deals with Saudia Arabia and the UAE
0:22:00 – How good GPT-6 will be at poetry
0:25:15 – Chip-building and where the energy will come from
0:29:04 – Sam’s changing health habits
0:30:20 – UAP’s and conspiracy theories
0:31:43 – Revitalizing St. Louis
0:33:12 – Regulating AI agents
0:34:39 – New ways to interface with AI
0:38:12 – How normies will learn AI
0:44:36 – The trajectory of healthcare and housing prices
0:46:57 – Reexamining freedom of speech
0:50:08 – Humanity’s persuadability

Recorded live with @tylercowen and @sama at the 2025 Progress Conference, hosted by @rootsofprogress. Thanks to @bigthink for the video production.',
  'http://twitter.com/DanielleFong/statuses/1986132817806565769',
  NULL,
  '2025-11-05'::timestamptz, now()
FROM handles h WHERE h.name = 'Danielle Fong';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'I did an interview on panpsychism, religion, and the meaning of existence. 
https://t.co/GAPHyx2cUm',
  'http://twitter.com/Philip_Goff/statuses/1986157956275052718',
  'https://bigthink.com/the-well/is-the-universe-conscious/',
  '2025-11-05'::timestamptz, now()
FROM handles h WHERE h.name = 'Philip Goff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @Philip_Goff I did an interview on panpsychism, religion, and the meaning of existence. 
https://t.co/GAPHyx2cUm',
  'http://twitter.com/Philip_Goff/statuses/1986182267442704690',
  'https://bigthink.com/the-well/is-the-universe-conscious/',
  '2025-11-05'::timestamptz, now()
FROM handles h WHERE h.name = 'Philip Goff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @cowenconvos How persuadable are humans, really? Sam Altman returns to discuss accidental AI takeover, why GPT-6 might crack real science, when we''ll see AI CEOs running the show, and the question he asked someone to pose to the Dalai Lama.

Timestamps
0:00:00 – Sam’s basic trick for productivity
0:01:22 – Hiring hardware vs. software people
0:05:46 – How long before an AI CEO
0:10:48 – Government backstops for AI companies
0:13:26 – Monetizing AI services
0:18:04 – Negotiating deals with Saudia Arabia and the UAE
0:22:00 – How good GPT-6 will be at poetry
0:25:15 – Chip-building and where the energy will come from
0:29:04 – Sam’s changing health habits
0:30:20 – UAP’s and conspiracy theories
0:31:43 – Revitalizing St. Louis
0:33:12 – Regulating AI agents
0:34:39 – New ways to interface with AI
0:38:12 – How normies will learn AI
0:44:36 – The trajectory of healthcare and housing prices
0:46:57 – Reexamining freedom of speech
0:50:08 – Humanity’s persuadability

Recorded live with @tylercowen and @sama at the 2025 Progress Conference, hosted by @rootsofprogress. Thanks to @bigthink for the video production.',
  'http://twitter.com/jasoncrawford/statuses/1986193920460566888',
  NULL,
  '2025-11-05'::timestamptz, now()
FROM handles h WHERE h.name = 'Jason Crawford';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Perhaps you crave meaning, but not the doctrines that come with religion. Maybe religious teachings resonate, but you don’t think Jesus was conceived by a virgin or that Muhammad literally flew on a winged horse to heaven. Or you look to science for answers, but sense that there are elements of reality it won’t ever be able to explain.

Philosopher Philip Goff (@philip_goff) once felt the same. After leaving atheism behind for a slightly heretical form of Christianity, he now explores modern theories like panpsychism that could help today’s skeptics find meaning.

We interviewed him for The Well, a publication made by Big Think in partnership with the John Templeton Foundation (@templeton_fdn), to learn about what this could mean for the future of faith, science, and everything in between. 

Read the full Q&A here: https://t.co/nyF41DYpWS',
  'http://twitter.com/Philip_Goff/statuses/1986442139689996687',
  NULL,
  '2025-11-06'::timestamptz, now()
FROM handles h WHERE h.name = 'Philip Goff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @CloserToTruth Is the universe conscious? Panpsychist philosopher @Philip_Goff on mysticism and the future of faith. https://t.co/RpQItG6ZUa https://t.co/jYSfoVTGIv',
  'http://twitter.com/Philip_Goff/statuses/1986917086187163798',
  'https://bigthink.com/the-well/is-the-universe-conscious/',
  '2025-11-07'::timestamptz, now()
FROM handles h WHERE h.name = 'Philip Goff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @koenfucius Dopamine does not give us pleasure, but motivates us to seek it—a double-edged sword driving achievement as well as instant gratification. 

That can be hard to navigate. 

@neuranne explains how we can redirect our reward system to meaningful activity:

https://t.co/XgC6U7b1GV https://t.co/qkGbcWukAD',
  'http://twitter.com/neuranne/statuses/1986941132375310593',
  'https://bigthink.com/smart-skills/how-to-escape-the-dopamine-crash-loop-and-rewire-your-curiosity/',
  '2025-11-07'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@dwallacewells https://t.co/tRJRZXLzms',
  'http://twitter.com/dwallacewells/statuses/1987914499102502983',
  'https://bigthink.com/strange-maps/everest-deaths/',
  '2025-11-10'::timestamptz, now()
FROM handles h WHERE h.name = 'David Wallace-Wells';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink The illusion of shared reality: Why no two minds see the same world | Anil Seth & Jonny Thomson @philosophyminis @anilkseth 

0:00 Non-human consciousness
1:40 The current state of consciousness science
2:10 What is consciousness?
4:05 The similarity of conscious experiences
5:48 Consciousness in the brain
11:23 Technology for measuring consciousness
16:03 Measuring consciousness levels
20:33 Pragmatic physicalism and functionalism
23:25 Pansychism
28:25 Emergence
32:35 AI and consciousness
36:49 The difference between non-human animals and AI
41:49 Is artificial consciousness possible?
48:12 Consciousness in the body and outside the brain
Consciousness in the future and AI 
50:27 Audience Q&A
50:41 Could computers could simulate the brain and body?
59:55 Why are you skeptical about asserting the dependency of life to the consciousness?
1:03:31 If consciousness is so clinical, does it undermine free will?',
  'http://twitter.com/anilkseth/statuses/1988306763138167225',
  NULL,
  '2025-11-11'::timestamptz, now()
FROM handles h WHERE h.name = 'Anil Seth';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Why losses hurt more than wins | Barry Ritholtz @Ritholtz https://t.co/HSD3BqVWsQ',
  'http://twitter.com/Ritholtz/statuses/1989425968327622798',
  NULL,
  '2025-11-14'::timestamptz, now()
FROM handles h WHERE h.name = 'Barry Ritholtz';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'I spoke with @BigThink about why even the most experienced professionals need a coach — including surgeons. It’s one of the most under-utilized ways people improve.
Video: https://t.co/KkAf5xe2Th',
  'http://twitter.com/Atul_Gawande/statuses/1991144250537336942',
  NULL,
  '2025-11-19'::timestamptz, now()
FROM handles h WHERE h.name = 'Atul Gawande';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @cowenconvos Blake Scholl is one of the leading figures working to bring back commercial supersonic flight as the founder and CEO of @boomsupersonic. But he''s equally as impressive as someone who thinks systematically about improving dysfunction—whether it''s airport design, traffic congestion, or defense procurement—and sees creative solutions to problems everyone else has learned to accept.

0:00:00 - Reimagining airports
0:02:52 - Airport security
0:06:12 - Fixing traffic
0:10:42 - Fixing boarding and improving airplane interiors
0:14:49 – The contrasting cultures of Amazon and Groupon
0:18:25 - The rise, fall, and return of supersonic flight
0:27:24 - The practical implications of commercial supersonic flight
0:31:14 - American manufacturing and defense procurement
0:35:41 - Learning across domains and reducing the cost of change
0:39:06 - Future innovation

Recorded live with @tylercowen and @bscholl at the 2025 Progress Conference, hosted by @rootsofprogress. Thanks to @bigthink for the video production.',
  'http://twitter.com/tylercowen/statuses/1991162789507780717',
  NULL,
  '2025-11-19'::timestamptz, now()
FROM handles h WHERE h.name = 'Tyler Cowen';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @cowenconvos Blake Scholl is one of the leading figures working to bring back commercial supersonic flight as the founder and CEO of @boomsupersonic. But he''s equally as impressive as someone who thinks systematically about improving dysfunction—whether it''s airport design, traffic congestion, or defense procurement—and sees creative solutions to problems everyone else has learned to accept.

0:00:00 - Reimagining airports
0:02:52 - Airport security
0:06:12 - Fixing traffic
0:10:42 - Fixing boarding and improving airplane interiors
0:14:49 – The contrasting cultures of Amazon and Groupon
0:18:25 - The rise, fall, and return of supersonic flight
0:27:24 - The practical implications of commercial supersonic flight
0:31:14 - American manufacturing and defense procurement
0:35:41 - Learning across domains and reducing the cost of change
0:39:06 - Future innovation

Recorded live with @tylercowen and @bscholl at the 2025 Progress Conference, hosted by @rootsofprogress. Thanks to @bigthink for the video production.',
  'http://twitter.com/bscholl/statuses/1991166728835871102',
  NULL,
  '2025-11-19'::timestamptz, now()
FROM handles h WHERE h.name = 'Blake Scholl';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Were Concorde and Apollo good for the future of aerospace? @bigthink has my op-ed with my admittedly radical view. 👇 https://t.co/1pk7VyoDZT',
  'http://twitter.com/bscholl/statuses/1991211745419858156',
  NULL,
  '2025-11-19'::timestamptz, now()
FROM handles h WHERE h.name = 'Blake Scholl';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@bscholl https://t.co/g3BY3dsDSW',
  'http://twitter.com/bscholl/statuses/1991211747269550399',
  'https://bigthink.com/the-future/concorde-apollo-aerospace/',
  '2025-11-19'::timestamptz, now()
FROM handles h WHERE h.name = 'Blake Scholl';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink @yegg @StandTogether 3. Red Mars by Kim Stanley Robinson @cjhandmer @terraformindies https://t.co/PJK4hvHmAk',
  'http://twitter.com/CJHandmer/statuses/1991225313297084895',
  NULL,
  '2025-11-19'::timestamptz, now()
FROM handles h WHERE h.name = 'Casey Handmer';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@bscholl @bigthink https://t.co/TgtzDbT0vg',
  'http://twitter.com/astrogrant/statuses/1991246556255711628',
  NULL,
  '2025-11-19'::timestamptz, now()
FROM handles h WHERE h.name = 'Grant Trembley';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink BIG NEWS: "The Engine of Progress" is live!

In this special issue, we examine the nature of progress: what nurtures it, what stifles it, and what we can do to shape it more deliberately in the years ahead. 

Here''s some of what''s inside: 🧵 (1/7) @jasoncrawford @rootsofprogress https://t.co/Ho8knq7At8',
  'http://twitter.com/jasoncrawford/statuses/1991499190774689857',
  NULL,
  '2025-11-20'::timestamptz, now()
FROM handles h WHERE h.name = 'Jason Crawford';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@jasoncrawford If you want to support @bigthink and read ad-free, you can get a membership: https://t.co/536DiQE3TB',
  'http://twitter.com/jasoncrawford/statuses/1991500653248860427',
  'https://bigthink.com/membership/',
  '2025-11-20'::timestamptz, now()
FROM handles h WHERE h.name = 'Jason Crawford';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  'Special issue from @bigthink coming out of Progress Conference 2025!

Featuring pieces from some of the speakers and perspectives from several @rootsofprogress fellows who attended, with an intro from me:

https://t.co/8WLvsiuLrA',
  'http://twitter.com/jasoncrawford/statuses/1991500651378143705',
  NULL,
  '2025-11-20'::timestamptz, now()
FROM handles h WHERE h.name = 'Jason Crawford';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @rootsofprogress The second annual progress conference was a hit. Dates for 2026: October 8th-11th in Berkeley, CA at Lighthaven. More info early next year! 

In this post: watch videos of conference talks, read articles and blog posts written from the conference, and browse a new @bigthink special issue on progress.

https://t.co/rqwvpeyvZH',
  'http://twitter.com/jasoncrawford/statuses/1991611804494250175',
  NULL,
  '2025-11-20'::timestamptz, now()
FROM handles h WHERE h.name = 'Jason Crawford';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @jasoncrawford Special issue from @bigthink coming out of Progress Conference 2025!

Featuring pieces from some of the speakers and perspectives from several @rootsofprogress fellows who attended, with an intro from me:

https://t.co/8WLvsiuLrA https://t.co/UgkPEomyO7',
  'http://twitter.com/smc90/statuses/1991660578981704140',
  'https://bigthink.com/collections/the-engine-of-progress/',
  '2025-11-21'::timestamptz, now()
FROM handles h WHERE h.name = 'Sonal Chokshi';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'Preindustrial life wasn’t simple or serene — it was filthy, violent, and short. The Industrial Revolution was imperfect, but it was progress https://t.co/UieKBYNRg7',
  'http://twitter.com/jhagel/statuses/1991869280359731300',
  'https://bigthink.com/the-past/debunking-preindustrial-life/',
  '2025-11-21'::timestamptz, now()
FROM handles h WHERE h.name = 'John Hagel';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@DKThomp @sarthakgh @tylercowen I wrote about this a bit more here: https://t.co/jmFO8N5JND',
  'http://twitter.com/bscholl/statuses/1991875479171915820',
  'https://bigthink.com/the-future/concorde-apollo-aerospace/',
  '2025-11-21'::timestamptz, now()
FROM handles h WHERE h.name = 'Blake Scholl';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'mention',
  'so i did a @bigthink interview

it’s live today!! you should watch it:

https://t.co/keB58V49sk',
  'http://twitter.com/danshipper/statuses/1991898476083654924',
  NULL,
  '2025-11-21'::timestamptz, now()
FROM handles h WHERE h.name = 'Dan Shipper';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @kplikethebird The theme of the day @every is "long live the humanities" 

If you like Socrates, neural networks, and therapy, you simply must watch @danshipper talk about all three on @bigthink https://t.co/g7nAI6tdjz',
  'http://twitter.com/danshipper/statuses/1991913174480900151',
  NULL,
  '2025-11-21'::timestamptz, now()
FROM handles h WHERE h.name = 'Dan Shipper';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '☺️',
  'http://twitter.com/danshipper/statuses/1991920685606916221',
  NULL,
  '2025-11-21'::timestamptz, now()
FROM handles h WHERE h.name = 'Dan Shipper';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@KevinEspiritu @bigthink BIG',
  'http://twitter.com/danshipper/statuses/1991930505298911508',
  NULL,
  '2025-11-21'::timestamptz, now()
FROM handles h WHERE h.name = 'Dan Shipper';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @every @danshipper joined @bigthink to talk through the big ideas shaping this moment in AI—from the primacy of context over commands to the future of creative work. 

Watch the conversation: https://t.co/Qu1h9GCAqS',
  'http://twitter.com/danshipper/statuses/1991940149115294001',
  NULL,
  '2025-11-21'::timestamptz, now()
FROM handles h WHERE h.name = 'Dan Shipper';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Neural networks and the art of human-like thinking | Full interview with Dan Shipper @danshipper, CEO of @every 

0:00 Neural networks and human intuition
1:13 The limits of rationalism, from Socrates to neural networks
1:23 Rationalism
2:42 Socrates, the father of Rationalism
5:47 The Age of Enlightenment
7:36 The structure of social sciences
8:51 Defining AI
9:47 The origins of AI
10:39 The General Problem Solver
15:09 Neural networks
18:22 Metaphors for the mind
23:00 Seeing the world like a large language model
30:25 Should we stop looking for general theories?
32:22 Training neural networks
39:32 Will AI steal our humanity?
43:43 AI and rational explanation
47:17 Could LLMs be dangerous?
51:12 Knowledge economies and allocation economies',
  'http://twitter.com/danshipper/statuses/1991942235630584004',
  NULL,
  '2025-11-21'::timestamptz, now()
FROM handles h WHERE h.name = 'Dan Shipper';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @BobbyHugh It was a pleasure and an honor to have @danshipper sit down with us for a Big Think Interview! 

The work that he and the Every team are doing is incredible.

Definitely give this one a watch, it is well worth your time. https://t.co/nj3YifbGiv',
  'http://twitter.com/danshipper/statuses/1991956190306443551',
  NULL,
  '2025-11-21'::timestamptz, now()
FROM handles h WHERE h.name = 'Dan Shipper';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Why you won''t beat the market | Barry Ritholtz @Ritholtz https://t.co/M1df9HeF0C',
  'http://twitter.com/Ritholtz/statuses/1992010480093933623',
  NULL,
  '2025-11-21'::timestamptz, now()
FROM handles h WHERE h.name = 'Barry Ritholtz';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @every This week''s Context Window: ChatGPT''s group chats, engineers producing at 15x scale, and what Frankenstein is really about.

Highlights:
– The Every team vibe checks ChatGPT''s new group chat feature and finds that collaboration potential meets interface friction.
– @kplikethebird on why Frankenstein''s real lesson is maintenance, not creation.
– @DannyAziz97 on finding yourself when AI can do your job—plus the framework he used to figure out his new path
– @kieranklaassen and @nityeshaga on programming like a 15-person team through compounding workflows
– @tedescau joins as Every''s new Head of Growth from @SubstackInc
– @Ashwinreads on what Captain Cook''s voyages reveal about exploring the AI frontier

From Every Studio:
– @danshipper joined @bigthink for an hour-long talk on neural networks, intuition, and why human judgment matters in the age of automation
– @CoraComputer''s deals dashboard consolidates Black Friday emails in one place

Full Context Window: https://t.co/xruZ5liTnT',
  'http://twitter.com/danshipper/statuses/1992637521403211913',
  NULL,
  '2025-11-23'::timestamptz, now()
FROM handles h WHERE h.name = 'Dan Shipper';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'reply',
  '@neurodelia @JHPsychedelics @RCarhartHarris @canalesjohnson @MatthewSacchet @AdvInAwareness @healthyminds @RubenLaukkonen @bigthink @psychmag @CIFAR_News @winslow_strong @ruffini @mesec_ @joel_frohlich @aeonmag @kathryndevaney @DorKonforty Very cool work! Paired EEG<>microphenomenology data from a Lama on 5-MeO 🤯 Worth its weight in pointing-out instructions...',
  'http://twitter.com/DillanDiNardo/statuses/1993160989257482531',
  NULL,
  '2025-11-25'::timestamptz, now()
FROM handles h WHERE h.name = 'Dillan DiNardo';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Do we get more progress from unlimited budgets… or tight constraints? 

Blake Scholl @bscholl, CEO of Boom Supersonic @boomsupersonic, argues that government-led “glory projects” ultimately hurt the aerospace industry they were meant to advance.

Full article: https://t.co/vrbSqjdZvP',
  'http://twitter.com/bscholl/statuses/1993364644119924911',
  NULL,
  '2025-11-25'::timestamptz, now()
FROM handles h WHERE h.name = 'Blake Scholl';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink We are living through a slowdown in human progress | Jason Crawford @jasoncrawford 

00:00 Was modernity a mistake?
00:45 The history of progress
02:02 Francis Bacon 
03:33 The Industrial Revolution
06:07 A period of optimism
07:25 Technology and world wars
08:29 The cost and risks of progress
11:46 What our future can bring',
  'http://twitter.com/jasoncrawford/statuses/1993383699283689901',
  NULL,
  '2025-11-25'::timestamptz, now()
FROM handles h WHERE h.name = 'Jason Crawford';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Is a new progressive era on the horizon? 

In this op-ed, Peter Leyden @peteleyden explores how today’s mix of transformative technologies, extreme inequality, and rising populism closely mirrors the conditions that preceded America’s Progressive Era. https://t.co/EpXNGepnAy',
  'http://twitter.com/peteleyden/statuses/1994153809686483369',
  NULL,
  '2025-11-27'::timestamptz, now()
FROM handles h WHERE h.name = 'Peter Leyden';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Want to be a better learner? Start by noticing how you think. 

Anne-Laure Le Cunff @neuranne explains how metacognition — the ability to think about your thinking — can help you learn faster and make better decisions. 

Full article: https://t.co/okLMzCzwbF https://t.co/VgMg3kuUKw',
  'http://twitter.com/neuranne/statuses/1994186265936253218',
  'https://bigthink.com/thinking/learn-with-metacognition/',
  '2025-11-27'::timestamptz, now()
FROM handles h WHERE h.name = 'Anne-Laure Le Cunff';

INSERT INTO interactions (handle_id, platform, interaction_type, content, mention_url, post_url, interacted_at, synced_at)
SELECT h.id, 'x', 'repost',
  'RT @bigthink Why representation in education matters | Richard Reeves @richardvreeves https://t.co/KpisdCgsJF',
  'http://twitter.com/RichardvReeves/statuses/1994498771418583222',
  NULL,
  '2025-11-28'::timestamptz, now()
FROM handles h WHERE h.name = 'Richard Reeves';

COMMIT;