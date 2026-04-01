-- Seed: YouTube Community Post Comments (Big Think)
-- Source: Manual scrape of 12 YouTube community posts, collected 2026-04-01
-- Posts span from ~2026-03-01 to 2026-04-01

BEGIN;

-- ============================================================
-- POST 1: "Andy Weir on Project Hail Mary" (2026-04-01)
-- ============================================================

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'chosen3344', 'chosen3344', 'the movie was so good!!', 'ENGAGED', 'WATCH', '2026-04-01', 'Andy Weir on Project Hail Mary', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'GinenTawnik', 'GinenTawnik', 'Just sitting down to watch it... Read the novel - it was excellent. Hope the movie lives up to the hype!', 'ENGAGED', 'CORE', '2026-04-01', 'Andy Weir on Project Hail Mary', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'viesuro', 'viesuro', 'For me the film was more a space opera or a comedy than a hard sci Fi movie. It was very good, but for me some aspects were a little hollow', 'THOUGHTFUL', 'CORE', '2026-04-01', 'Andy Weir on Project Hail Mary', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'GemmaHentsch', 'GemmaHentsch', 'Hardcore science and yet there''s a pathogen that infects stars? What are you smoking?', 'ENGAGED', 'CORE', '2026-04-01', 'Andy Weir on Project Hail Mary', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'OscarthePalm', 'OscarthePalm', 'Seen the movie. It was very 0815 sci-fi-popcultur stuff. Nothing with depth.', 'ENGAGED', 'WATCH', '2026-04-01', 'Andy Weir on Project Hail Mary', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'PatrickSmith', 'PatrickSmith', 'The premise of organisms blocking the sun is unscientific and impossible.', 'ENGAGED', 'WATCH', '2026-04-01', 'Andy Weir on Project Hail Mary', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'MolotovKilljoy', 'MolotovKilljoy', 'I haven''t seen the movie yet, but I''ve read the book at least 10 times. Sooooo good. It had me feeling all kinds of feelings. This man can really write a story.', 'ENGAGED', 'CORE', '2026-04-01', 'Andy Weir on Project Hail Mary', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'ev__hdvhutcbb', 'ev__hdvhutcbb', 'Movie was dogshit. Skipped all the interesting science from the book.', 'ENGAGED', 'WATCH', '2026-04-01', 'Andy Weir on Project Hail Mary', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

-- @TheAlchemistZero1 — ONE representative comment (appears across many posts with long essays)
INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'TheAlchemistZero1', 'TheAlchemistZero1', 'The tension between Finite Nature and Infinite Nature is the engine of all creative evolution. We are both the observer and the observed, collapsing possibility into form.', 'THOUGHTFUL', 'CORE', '2026-04-01', 'Andy Weir on Project Hail Mary', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

-- ============================================================
-- POST 3: "Eric Markowitz: Mastery and Meditation in Kyoto" (2026-03-27)
-- ============================================================

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'aaronconnolly1496', 'aaronconnolly1496', 'Would love to hear some examples of people of their crafts which demand approach. Want to be inspired!', 'ENGAGED', 'CORE', '2026-03-27', 'Eric Markowitz: Mastery and Meditation in Kyoto', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'widdershins5383', 'widdershins5383', 'Because mastery requires focus and elimination of distractions.....which is meditation lol', 'THOUGHTFUL', 'CORE', '2026-03-27', 'Eric Markowitz: Mastery and Meditation in Kyoto', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

-- ============================================================
-- POST 4: "Will athletes keep breaking records forever?" (2026-03-25)
-- ============================================================

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'mathiasbartl903', 'mathiasbartl903', 'Freediving organizations have already closed the books on depth record, because of the increasingly extreme risk.', 'THOUGHTFUL', 'GOLD', '2026-03-25', 'Will athletes keep breaking records forever?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'simononeill941', 'simononeill941', 'One day someone will finish the 100m sprint before it starts.', 'ENGAGED', 'CORE', '2026-03-25', 'Will athletes keep breaking records forever?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'connaeris8230', 'connaeris8230', 'I doubt Bolt''s time will ever be surpassed by much. By a few hundredths of a second, yes, but not more. At some point it becomes physically impossible.', 'THOUGHTFUL', 'CORE', '2026-03-25', 'Will athletes keep breaking records forever?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'jakubd.2423', 'jakubd.2423', 'You can break record infinitely many times and yet still get a finite limit. 1/2+1/4+1/8+...+...=1', 'THOUGHTFUL', 'GOLD', '2026-03-25', 'Will athletes keep breaking records forever?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'John-zh1ud', 'John-zh1ud', 'It will just be longer and longer time between. How accurate can you be too if someone beats it by .0001...', 'ENGAGED', 'CORE', '2026-03-25', 'Will athletes keep breaking records forever?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'QuodDixi', 'QuodDixi', 'Same with life expectancy, we still don''t know what is the limit.', 'ENGAGED', 'CORE', '2026-03-25', 'Will athletes keep breaking records forever?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'Blakenew127', 'Blakenew127', 'Yes, they keep finding new performance enhancement drugs that are not officially banned.', 'ENGAGED', 'WATCH', '2026-03-25', 'Will athletes keep breaking records forever?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

-- ============================================================
-- POST 5: "What can we do to quiet our brains?" (2026-03-24)
-- ============================================================

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'jaketyler2788', 'jaketyler2788', 'I think #5 is the most important. I''ve learned to deal with the fact that the books I think I would want to read are the books I don''t enjoy. I use to think ''if I''m going to spend the time reading, it ought to be educational'' but the truth is I actually end up reading less of those books and it''s more of a chore than an enjoyment. Choose books that you''re excited to read, whatever they are.', 'THOUGHTFUL', 'GOLD', '2026-03-24', 'What can we do to quiet our brains?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'nothingtoseehere93', 'nothingtoseehere93', 'Nothing, trying to quiet ur brain will only make it louder. The resistance is the noise.', 'THOUGHTFUL', 'CORE', '2026-03-24', 'What can we do to quiet our brains?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'dpssocket', 'dpssocket', 'Slow exhale is the king.', 'ENGAGED', 'CORE', '2026-03-24', 'What can we do to quiet our brains?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

-- ============================================================
-- POST 6: "Print isn't dead" (2026-03-20)
-- ============================================================

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'PetitoutStwilly', 'PetitoutStwilly', 'I''d love to subscribe but do you ship to EU/UK?', 'ENGAGED', 'CORE', '2026-03-20', 'Print isn''t dead', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'HamsterClamper', 'HamsterClamper', 'You should publish these as books like Kurzgesagt does. I''d buy those, but $12 a month for a subscription is too much.', 'THOUGHTFUL', 'CORE', '2026-03-20', 'Print isn''t dead', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'google4glory607', 'google4glory607', 'What is this foreign material? How long does the battery hold? Can you link it to other devices?', 'ENGAGED', 'WATCH', '2026-03-20', 'Print isn''t dead', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'NordicGroove', 'NordicGroove', 'Please consider international shipping.', 'ENGAGED', 'CORE', '2026-03-20', 'Print isn''t dead', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'rockandrollprophet76', 'rockandrollprophet76', 'That would explain why I fall asleep while reading', 'ENGAGED', 'WATCH', '2026-03-20', 'Print isn''t dead', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

-- ============================================================
-- POST 7: "What could life on other planets look like?" (2026-03-18)
-- ============================================================

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'nathat4250', 'nathat4250', 'I never cease to be amazed at how misguided assumptions lead to ridiculous conclusions', 'ENGAGED', 'CORE', '2026-03-18', 'What could life on other planets look like?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'TardisTravel420', 'TardisTravel420', 'If a planet is too big, a species can''t discover flight due to gravity being too heavy.', 'THOUGHTFUL', 'CORE', '2026-03-18', 'What could life on other planets look like?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'mauncan6347', 'mauncan6347', 'Bilateral symmetry (mirror image in long axis) and cephalization (major sense organs and computational hub in the same place - the head) are very likely to be the morphologies found everywhere complex organisms develop.', 'THOUGHTFUL', 'GOLD', '2026-03-18', 'What could life on other planets look like?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'leomarshal7', 'leomarshal7', 'The game Returnal did an excellent job showcasing life and environments on a distant planet.', 'ENGAGED', 'CORE', '2026-03-18', 'What could life on other planets look like?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'modernmind74', 'modernmind74', 'Life probably looks the same on other planets as it does here with slight variations.', 'ENGAGED', 'WATCH', '2026-03-18', 'What could life on other planets look like?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'AYVYN', 'AYVYN', 'If a planet is too big, a species can''t discover flight due to gravity being too heavy. Unintelligent life may look very different from ours.', 'THOUGHTFUL', 'CORE', '2026-03-18', 'What could life on other planets look like?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

-- ============================================================
-- POST 8: "How do you build a top performer?" (2026-03-01)
-- ============================================================

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'smilingoma333', 'smilingoma333', 'Life is a long lesson in humility, as written by J M Barrie. We hardly ever do it or cultivate it in the young, but they also need to be taught to fail.', 'THOUGHTFUL', 'GOLD', '2026-03-01', 'How do you build a top performer?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'smilingoma333', 'smilingoma333', 'I''m going to share this in a few places with others I think could benefit from this too.', 'ENGAGED', 'CORE', '2026-03-01', 'How do you build a top performer?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'strangertimes44', 'strangertimes44', 'it''s important to understand that mastering something doesn''t make you happy, or feel all that different, it''s simply changing the level you are playing at.', 'THOUGHTFUL', 'GOLD', '2026-03-01', 'How do you build a top performer?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'jamiesray', 'jamiesray', 'Just read Range by this guy. Really liked it.', 'ENGAGED', 'CORE', '2026-03-01', 'How do you build a top performer?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'debsylvester2012', 'debsylvester2012', 'I am a very fortunate person. I have had some of the best mentors anyone could ever pray for. They challenged me over and over.', 'THOUGHTFUL', 'CORE', '2026-03-01', 'How do you build a top performer?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'widdershins5383', 'widdershins5383', 'I got my associates while working to become a Project manager someday... I''m now 29, soon to be promoted & without a Bachelors degree.', 'ENGAGED', 'CORE', '2026-03-01', 'How do you build a top performer?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'Porchop45', 'Porchop45', 'This is so true. You need that obsession to keep you going.', 'ENGAGED', 'CORE', '2026-03-01', 'How do you build a top performer?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'Headroomtalking', 'Headroomtalking', 'This seems a distorted Hegel. The master cannot find recognition of his identity through the bondsman because he is not his equal.', 'THOUGHTFUL', 'GOLD', '2026-03-01', 'How do you build a top performer?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

-- ============================================================
-- POST 9: "How social are our identities?" (2026-03-01)
-- ============================================================

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'Touchinggrass3493', 'Touchinggrass3493', 'Conversations around identity have become bids for control rather opportunities to learn and share culture.', 'THOUGHTFUL', 'GOLD', '2026-03-01', 'How social are our identities?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'mwfmtnman', 'mwfmtnman', 'Conversations you have with yourself are the real forges of identity.', 'THOUGHTFUL', 'GOLD', '2026-03-01', 'How social are our identities?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'R.Pi_II', 'R.Pi_II', 'Identity is a social survival skill to remain acceptable to the tribe. It serves no other purpose.', 'THOUGHTFUL', 'CORE', '2026-03-01', 'How social are our identities?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'guillaumeusannaz4153', 'guillaumeusannaz4153', 'Is that a book? Article? Where can I read that?', 'ENGAGED', 'CORE', '2026-03-01', 'How social are our identities?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'keesdevreugd9177', 'keesdevreugd9177', 'Maybe people should just get more fulfilling lives and stop worrying about what others think of them.', 'ENGAGED', 'CORE', '2026-03-01', 'How social are our identities?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'francescolosavio4249', 'francescolosavio4249', 'I definitely agree with slide 4, particularly in regards to the LGBT+ community.', 'ENGAGED', 'CORE', '2026-03-01', 'How social are our identities?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

-- ============================================================
-- POST 10: "Are we losing deep reading in the digital age?" (2026-03-01)
-- ============================================================

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'ZeekEST99', 'ZeekEST99', 'We already lost it. People look at my bookshelf like its a museum exhibit.', 'THOUGHTFUL', 'CORE', '2026-03-01', 'Are we losing deep reading in the digital age?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'ndrew5809', 'ndrew5809', 'My 7yr old regularly reads to herself after I have finished reading with her.', 'ENGAGED', 'CORE', '2026-03-01', 'Are we losing deep reading in the digital age?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'skeksis3082', 'skeksis3082', 'We don''t paint on caves anymore either', 'ENGAGED', 'CORE', '2026-03-01', 'Are we losing deep reading in the digital age?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', '123andrewli7', '123andrewli7', 'Tbf most Americans never had it, half the country apparently can read at all', 'ENGAGED', 'WATCH', '2026-03-01', 'Are we losing deep reading in the digital age?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'slynn7816', 'slynn7816', 'I remember that during my summer vacations, I would read for entire days. 8 to 10 hours a day.', 'ENGAGED', 'CORE', '2026-03-01', 'Are we losing deep reading in the digital age?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'tmuxor', 'tmuxor', 'Tldr do you have a video on the topic instead?', 'ENGAGED', 'WATCH', '2026-03-01', 'Are we losing deep reading in the digital age?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'prominence1351', 'prominence1351', 'We''ve exchanged it for depression.', 'ENGAGED', 'CORE', '2026-03-01', 'Are we losing deep reading in the digital age?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'airbear8', 'airbear8', 'I do think it''s ironic that we''re getting this update in a digitized post.', 'THOUGHTFUL', 'CORE', '2026-03-01', 'Are we losing deep reading in the digital age?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'NRG-yo8nr', 'NRG-yo8nr', 'There''s a reason asian countries ban their kids from tiktok and yet China ''reluctantly'' sold it to the US.', 'THOUGHTFUL', 'CORE', '2026-03-01', 'Are we losing deep reading in the digital age?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'sloppenheimer-67', 'sloppenheimer-67', 'Same is happening to music. The ritual of reading for intellectual fulfillment and the ritual of listening to music for spiritual and social fulfillment appears to be over.', 'THOUGHTFUL', 'GOLD', '2026-03-01', 'Are we losing deep reading in the digital age?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'ShinKhantKaung', 'ShinKhantKaung', 'I love to read, but the only library we had, which has fascinating books, stories, novels, was closed due to the conflict in Myanmar.', 'THOUGHTFUL', 'CORE', '2026-03-01', 'Are we losing deep reading in the digital age?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'Viracocha785', 'Viracocha785', 'I dropped out of high school got a G.E.D. and took 20 years to get an associates. I am now working on my doctorate', 'THOUGHTFUL', 'CORE', '2026-03-01', 'Are we losing deep reading in the digital age?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

-- ============================================================
-- POST 11: "Why do most people give up before they get good?" (2026-03-01)
-- ============================================================

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'Zegeebwah', 'Zegeebwah', 'I don''t need to see the video to know most people lose interest when the learning curve starts to flatten', 'THOUGHTFUL', 'CORE', '2026-03-01', 'Why do most people give up before they get good?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'brendanbirdfield1284', 'brendanbirdfield1284', 'Growth vs fixed mindset', 'ENGAGED', 'WATCH', '2026-03-01', 'Why do most people give up before they get good?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'EL-ee4cz', 'EL-ee4cz', 'Ugh, I''ve been waiting for the shift back toward science.', 'ENGAGED', 'CORE', '2026-03-01', 'Why do most people give up before they get good?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'lephtovermeet', 'lephtovermeet', 'Or in my case: Start behind, stay behind and when trying to get ahead - get pushed back behind. Die behind.', 'ENGAGED', 'CORE', '2026-03-01', 'Why do most people give up before they get good?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

-- ============================================================
-- POST 12: "What do the beginnings of complex life look like?" (2026-03-01)
-- ============================================================

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'krunkle5136', 'krunkle5136', 'The mind gets in the way of spirit. A calm and reflective state is needed.', 'ENGAGED', 'CORE', '2026-03-01', 'What do the beginnings of complex life look like?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'VigilantnotMilitant', 'VigilantnotMilitant', 'You know festival tribes and Terrance McKenna types are blowing up their group chats with this evidence', 'ENGAGED', 'CORE', '2026-03-01', 'What do the beginnings of complex life look like?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'an_thewiz', 'an_thewiz', 'My personal theory is that consciousness is stored in mycillium.', 'THOUGHTFUL', 'CORE', '2026-03-01', 'What do the beginnings of complex life look like?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'ws43', 'ws43', 'So. A fungal spore made its way to earth, landed here, adapted to the carbon based environment, and then grew!', 'ENGAGED', 'CORE', '2026-03-01', 'What do the beginnings of complex life look like?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'oiDannyio', 'oiDannyio', 'Is that why one of our closest dna relatives is a mushroom', 'ENGAGED', 'CORE', '2026-03-01', 'What do the beginnings of complex life look like?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

INSERT INTO platform_comments (platform, author_name, author_handle, content, quality_tag, zone, published_at, video_title, synced_at)
VALUES ('youtube', 'PhebeBannister', 'PhebeBannister', 'So is eating fungi.. cannibalism?', 'ENGAGED', 'WATCH', '2026-03-01', 'What do the beginnings of complex life look like?', now())
ON CONFLICT (platform, author_name, content) DO NOTHING;

COMMIT;
