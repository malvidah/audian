-- Instagram posts from Buffer export (Jan 1 - Mar 31, 2026)
-- Replaces all existing Instagram posts with accurate Buffer metrics.
-- Run in Supabase SQL editor.

BEGIN;

DELETE FROM posts WHERE platform = 'instagram';

INSERT INTO posts (post_id, platform, published_at, content, permalink, likes, comments, impressions, shares, saves, post_type, source)
VALUES
-- Mar 31
('instagram_20260331_1', 'instagram', '2026-03-31T12:00:00Z', 'Our March issue, The Roots of Resilience...', '', 262, 0, 10398, 0, 0, 'post', 'buffer_export'),
('instagram_20260331_2', 'instagram', '2026-03-31T10:00:00Z', 'Andy Weir on Project Hail Mary...', '', 660, 1, 18653, 0, 0, 'post', 'buffer_export'),

-- Mar 30
('instagram_20260330_1', 'instagram', '2026-03-30T12:00:00Z', 'Will AI friends become the norm? | Derek Thompson', '', 191, 10, 7759, 0, 0, 'post', 'buffer_export'),

-- Mar 27
('instagram_20260327_1', 'instagram', '2026-03-27T12:00:00Z', 'The secret to effective male communication | Richard Reeves', '', 9920, 239, 177248, 0, 0, 'post', 'buffer_export'),

-- Mar 26
('instagram_20260326_1', 'instagram', '2026-03-26T12:00:00Z', 'Will athletes keep breaking records forever?...', '', 388, 4, 24633, 0, 0, 'post', 'buffer_export'),
('instagram_20260326_2', 'instagram', '2026-03-26T10:00:00Z', 'Is productivity optimizing the humanity out of life?...', '', 231, 1, 20491, 0, 0, 'post', 'buffer_export'),

-- Mar 25
('instagram_20260325_1', 'instagram', '2026-03-25T12:00:00Z', 'What does MDMA therapy actually look like? | Rachel Yehuda', '', 336, 6, 16013, 0, 0, 'post', 'buffer_export'),

-- Mar 24
('instagram_20260324_1', 'instagram', '2026-03-24T14:00:00Z', 'Last day to get on tomorrow''s order...', '', 170, 4, 13893, 0, 0, 'post', 'buffer_export'),
('instagram_20260324_2', 'instagram', '2026-03-24T12:00:00Z', 'What can we do to quiet our brains?...', '', 6186, 22, 154532, 0, 0, 'post', 'buffer_export'),
('instagram_20260324_3', 'instagram', '2026-03-24T10:00:00Z', 'Print isn''t dead...', '', 154, 9, 26803, 0, 0, 'post', 'buffer_export'),

-- Mar 23
('instagram_20260323_1', 'instagram', '2026-03-23T12:00:00Z', 'Forgetting is normal | Lisa Genova', '', 1154, 8, 29472, 0, 0, 'post', 'buffer_export'),

-- Mar 20
('instagram_20260320_1', 'instagram', '2026-03-20T12:00:00Z', 'Why are men failing in dating culture? | Richard Reeves', '', 4253, 255, 127848, 0, 0, 'post', 'buffer_export'),

-- Mar 19
('instagram_20260319_1', 'instagram', '2026-03-19T12:00:00Z', 'What could life on other planets look like?...', '', 775, 5, 38154, 0, 0, 'post', 'buffer_export'),

-- Mar 18
('instagram_20260318_1', 'instagram', '2026-03-18T12:00:00Z', 'Can psychedelics be tools for the brain? | Rachel Yehuda', '', 2115, 44, 47751, 0, 0, 'post', 'buffer_export'),

-- Mar 17
('instagram_20260317_1', 'instagram', '2026-03-17T12:00:00Z', 'How do you build a top performer?...', '', 6402, 40, 256964, 0, 0, 'post', 'buffer_export'),

-- Mar 16
('instagram_20260316_1', 'instagram', '2026-03-16T12:00:00Z', 'We are on the verge of becoming a spacefaring civilization | Brian Cox', '', 603, 7, 17801, 0, 0, 'post', 'buffer_export'),

-- Mar 13
('instagram_20260313_1', 'instagram', '2026-03-13T12:00:00Z', 'Why we aren''t going out anymore | Derek Thompson', '', 1442, 66, 45795, 0, 0, 'post', 'buffer_export'),

-- Mar 12
('instagram_20260312_1', 'instagram', '2026-03-12T12:00:00Z', 'Kristin Houser shares 5 books...', '', 1162, 6, 48097, 0, 0, 'post', 'buffer_export'),

-- Mar 11
('instagram_20260311_1', 'instagram', '2026-03-11T12:00:00Z', 'The difference between stress and trauma | Rachel Yehuda', '', 536, 3, 19613, 0, 0, 'post', 'buffer_export'),

-- Mar 4
('instagram_20260304_1', 'instagram', '2026-03-04T12:00:00Z', 'Understanding the distance to the Sun | Brian Cox', '', 187, 1, 4895, 0, 0, 'post', 'buffer_export'),

-- Feb 28
('instagram_20260228_1', 'instagram', '2026-02-28T12:00:00Z', 'How scientists made a mummy | Sam Kean', '', 109, 0, 6257, 0, 0, 'post', 'buffer_export'),

-- Feb 27
('instagram_20260227_1', 'instagram', '2026-02-27T12:00:00Z', 'Why people sabotage relationships | Alain de Botton', '', 16413, 257, 499200, 0, 0, 'post', 'buffer_export'),
('instagram_20260227_2', 'instagram', '2026-02-27T10:00:00Z', 'How social are our identities?...', '', 1396, 7, 62313, 0, 0, 'post', 'buffer_export'),

-- Feb 25
('instagram_20260225_1', 'instagram', '2026-02-25T12:00:00Z', 'How we know attachment matters | Alain de Botton', '', 9596, 216, 206846, 0, 0, 'post', 'buffer_export'),
('instagram_20260225_2', 'instagram', '2026-02-25T10:00:00Z', 'What do the beginnings of complex life look like?...', '', 755, 6, 30378, 0, 0, 'post', 'buffer_export'),

-- Feb 23
('instagram_20260223_1', 'instagram', '2026-02-23T12:00:00Z', 'How large is the universe? | Brian Cox', '', 6073, 95, 83063, 0, 0, 'post', 'buffer_export'),
('instagram_20260223_2', 'instagram', '2026-02-23T10:00:00Z', 'How do you separate good science from nonsense?...', '', 994, 8, 58091, 0, 0, 'post', 'buffer_export'),

-- Feb 20
('instagram_20260220_1', 'instagram', '2026-02-20T12:00:00Z', 'The problem with time-outs and sticker charts | Dr. Becky Kennedy', '', 1114, 10, 30946, 0, 0, 'post', 'buffer_export'),
('instagram_20260220_2', 'instagram', '2026-02-20T10:00:00Z', 'Will automated vehicles become a public good?...', '', 138, 2, 19260, 0, 0, 'post', 'buffer_export'),

-- Feb 19
('instagram_20260219_1', 'instagram', '2026-02-19T12:00:00Z', 'Is AI making us dumber? | Marvin Liyanage', '', 557, 19, 24229, 0, 0, 'post', 'buffer_export'),

-- Feb 18
('instagram_20260218_1', 'instagram', '2026-02-18T14:00:00Z', 'Yelling doesn''t work | Steve Stoute', '', 318, 2, 16335, 0, 0, 'post', 'buffer_export'),
('instagram_20260218_2', 'instagram', '2026-02-18T12:00:00Z', 'Our second monthly issue, Biology''s New Era...', '', 786, 3, 34961, 0, 0, 'post', 'buffer_export'),
('instagram_20260218_3', 'instagram', '2026-02-18T10:00:00Z', 'Frank Jacobs shares the story of London''s taxi drivers...', '', 1449, 4, 52583, 0, 0, 'post', 'buffer_export'),

-- Feb 16
('instagram_20260216_1', 'instagram', '2026-02-16T12:00:00Z', 'This is the most distant object we created | Brian Cox', '', 285, 4, 13463, 0, 0, 'post', 'buffer_export'),
('instagram_20260216_2', 'instagram', '2026-02-16T10:00:00Z', 'Are we losing deep reading in the digital age?...', '', 5836, 18, 197938, 0, 0, 'post', 'buffer_export'),

-- Feb 13
('instagram_20260213_1', 'instagram', '2026-02-13T12:00:00Z', 'Does punishing kids actually work? | Becky Kennedy', '', 949, 28, 32423, 0, 0, 'post', 'buffer_export'),
('instagram_20260213_2', 'instagram', '2026-02-13T10:00:00Z', 'What happened to the weavers?...', '', 400, 0, 27840, 0, 0, 'post', 'buffer_export'),

-- Feb 11
('instagram_20260211_1', 'instagram', '2026-02-11T14:00:00Z', 'We assign the world''s biggest problems to large corporations...', '', 306, 7, 48079, 0, 0, 'post', 'buffer_export'),
('instagram_20260211_2', 'instagram', '2026-02-11T12:00:00Z', 'Why conflict is good | Steve Stoute', '', 439, 10, 16825, 0, 0, 'post', 'buffer_export'),
('instagram_20260211_3', 'instagram', '2026-02-11T10:00:00Z', 'Hollywood actor Ethan Suplee shares lessons...', '', 282, 1, 33873, 0, 0, 'post', 'buffer_export'),

-- Feb 9
('instagram_20260209_1', 'instagram', '2026-02-09T12:00:00Z', 'Why we can''t see the smallest things | Brian Cox', '', 694, 5, 17465, 0, 0, 'post', 'buffer_export'),
('instagram_20260209_2', 'instagram', '2026-02-09T10:00:00Z', 'Why do most people give up before they get good?...', '', 5280, 14, 167414, 0, 0, 'post', 'buffer_export'),

-- Feb 6
('instagram_20260206_1', 'instagram', '2026-02-06T12:00:00Z', 'Will conscious-seeming AI make us more vulnerable to manipulation?...', '', 1251, 25, 79702, 0, 0, 'post', 'buffer_export'),
('instagram_20260206_2', 'instagram', '2026-02-06T10:00:00Z', 'Why are we more alone than ever? | Derek Thompson', '', 366, 10, 15544, 0, 0, 'post', 'buffer_export'),

-- Feb 5
('instagram_20260205_1', 'instagram', '2026-02-05T12:00:00Z', 'Get on the plane | Steve Stoute', '', 370, 19, 18571, 0, 0, 'post', 'buffer_export'),

-- Jan 30
('instagram_20260130_1', 'instagram', '2026-01-30T12:00:00Z', 'Don''t trade on old news | Barry Ritholtz', '', 207, 2, 13185, 0, 0, 'post', 'buffer_export'),
('instagram_20260130_2', 'instagram', '2026-01-30T10:00:00Z', 'Our January 2026 issue is live! The Pursuit of Mastery...', '', 808, 10, 52061, 0, 0, 'post', 'buffer_export'),

-- Jan 29
('instagram_20260129_1', 'instagram', '2026-01-29T12:00:00Z', 'How do we stop falling for rage bait?...', '', 597, 16, 23819, 0, 0, 'post', 'buffer_export'),

-- Jan 28
('instagram_20260128_1', 'instagram', '2026-01-28T12:00:00Z', 'What are dads good at? | Richard Reeves', '', 1482, 19, 40364, 0, 0, 'post', 'buffer_export'),

-- Jan 26
('instagram_20260126_1', 'instagram', '2026-01-26T12:00:00Z', '10,000 PhDs in your pocket | Dan Shipper', '', 961, 20, 31840, 0, 0, 'post', 'buffer_export'),

-- Jan 23
('instagram_20260123_1', 'instagram', '2026-01-23T12:00:00Z', 'How not managing emotions will make you poor | Barry Ritholtz', '', 500, 0, 19055, 0, 0, 'post', 'buffer_export'),

-- Jan 22
('instagram_20260122_1', 'instagram', '2026-01-22T12:00:00Z', 'Lately, it feels like everything on the internet is trying to make us angry...', '', 1044, 48, 36010, 0, 0, 'post', 'buffer_export'),

-- Jan 21
('instagram_20260121_1', 'instagram', '2026-01-21T12:00:00Z', 'The risk of reporting the truth | Lawrence Wright', '', 376, 1, 15528, 0, 0, 'post', 'buffer_export'),
('instagram_20260121_2', 'instagram', '2026-01-21T10:00:00Z', 'There is a medical myth that still shapes our view of women''s health...', '', 1070, 8, 52715, 0, 0, 'post', 'buffer_export'),

-- Jan 19
('instagram_20260119_1', 'instagram', '2026-01-19T12:00:00Z', 'Is AI conscious? | Alex O''Connor', '', 782, 16, 23658, 0, 0, 'post', 'buffer_export'),
('instagram_20260119_2', 'instagram', '2026-01-19T10:00:00Z', 'Thanks to new tech, neuroscience is going places it couldn''t before...', '', 846, 3, 36721, 0, 0, 'post', 'buffer_export'),

-- Jan 17
('instagram_20260117_1', 'instagram', '2026-01-17T12:00:00Z', 'Why do our brains love rage bait? | Marvin Liyanage', '', 600, 8, 22000, 0, 0, 'post', 'buffer_export'),

-- Jan 16
('instagram_20260116_1', 'instagram', '2026-01-16T12:00:00Z', 'What is the most important trait for a spy to have?...', '', 829, 36, 40382, 0, 0, 'post', 'buffer_export'),
('instagram_20260116_2', 'instagram', '2026-01-16T10:00:00Z', 'Can slime and dumb rocks help us better define smart?...', '', 624, 7, 34053, 0, 0, 'post', 'buffer_export'),

-- Jan 14
('instagram_20260114_1', 'instagram', '2026-01-14T12:00:00Z', 'Most people want to have their story told | Lawrence Wright', '', 551, 6, 18186, 0, 0, 'post', 'buffer_export'),
('instagram_20260114_2', 'instagram', '2026-01-14T10:00:00Z', 'Is AI pretending to be intelligent, or is it really?...', '', 1714, 64, 75350, 0, 0, 'post', 'buffer_export'),

-- Jan 13
('instagram_20260113_1', 'instagram', '2026-01-13T12:00:00Z', 'Read our top 10 books', '', 1762, 4, 70339, 0, 0, 'post', 'buffer_export'),

-- Jan 12
('instagram_20260112_1', 'instagram', '2026-01-12T12:00:00Z', 'Is ChatGPT a good debate partner? | Alex O''Connor', '', 1049, 36, 33325, 0, 0, 'post', 'buffer_export'),

-- Jan 9
('instagram_20260109_1', 'instagram', '2026-01-09T12:00:00Z', 'How to approach everyday stressors | Andrew Bustamante', '', 496, 4, 23879, 0, 0, 'post', 'buffer_export'),
('instagram_20260109_2', 'instagram', '2026-01-09T10:00:00Z', 'How is neuroscience changing our view of free will...', '', 9048, 160, 319161, 0, 0, 'post', 'buffer_export'),

-- Jan 8
('instagram_20260108_1', 'instagram', '2026-01-08T12:00:00Z', 'Is social media psychology becoming a problem?...', '', 2427, 25, 112000, 0, 0, 'post', 'buffer_export'),

-- Jan 7
('instagram_20260107_1', 'instagram', '2026-01-07T12:00:00Z', 'The importance of humility | Lawrence Wright', '', 2257, 27, 52793, 0, 0, 'post', 'buffer_export'),

-- Jan 6
('instagram_20260106_1', 'instagram', '2026-01-06T12:00:00Z', 'Why meaning is subjective | Alex O''Connor', '', 2166, 53, 44288, 0, 0, 'post', 'buffer_export'),

-- Jan 2
('instagram_20260102_1', 'instagram', '2026-01-02T12:00:00Z', 'How AI can help us share intuitive knowledge | Dan Shipper', '', 596, 27, 23112, 0, 0, 'post', 'buffer_export'),
('instagram_20260102_2', 'instagram', '2026-01-02T10:00:00Z', 'Why do we tend to repeat simple things like using the same mug...', '', 10616, 37, 302689, 0, 0, 'post', 'buffer_export'),

-- Jan 1
('instagram_20260101_1', 'instagram', '2026-01-01T12:00:00Z', 'Can labels be harmful? | Marvin Liyanage', '', 2323, 46, 52881, 0, 0, 'post', 'buffer_export');

COMMIT;
