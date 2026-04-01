-- Instagram posts from Buffer (H1 2026)
INSERT INTO posts (post_id,platform,published_at,content,permalink,likes,comments,impressions,shares,saves,post_type,source)
VALUES
('17917901847270850','instagram','2026-02-27T12:02:53Z','Why people sabotage relationships | Alain de Botton @theschooloflifelondon','https://www.instagram.com/reel/DVRbjU6DLLu/',16413,257,499200,0,14218,'reel','buffer_import'),
('17861766822561167','instagram','2026-01-02T10:03:29Z','Why do we tend to repeat simple things like using the same mug for our morning coffee?  Anne-Laure Le Cunff @neuranne explains the neuroscience of everyday rituals.  A few years ago','https://www.instagram.com/p/DTBBb-vkgqq/',10616,37,302689,0,6807,'post','buffer_import'),
('18089301623125404','instagram','2026-02-25T12:02:53Z','How we know attachment matters | Alain de Botton @theschooloflifelondon','https://www.instagram.com/reel/DVMR78wlBOv/',9596,216,206846,0,2553,'reel','buffer_import'),
('18036442352588429','instagram','2026-03-27T11:05:12Z','The secret to effective male communication | Richard Reeves','https://www.instagram.com/reel/DWZUXTAiTV0/',9110,202,164695,0,4169,'reel','buffer_import'),
('18042413444713453','instagram','2026-01-09T10:00:00Z','Read the full article on bigthink.com. Link in bio. How is neuroscience changing our view of free will, meaning, and the self?  Rachel Barr @drrachelbarr explores 3 philosophical debates from the 20th century that are being reshaped by modern neuroscience.  Image credits: Sarah Soryal @insarahsbrain #Neuropsych','https://www.instagram.com/p/DTTCsbqEysD/',9048,160,319161,0,6189,'post','buffer_import')
ON CONFLICT (platform,post_id) DO UPDATE SET likes=EXCLUDED.likes,impressions=EXCLUDED.impressions,comments=EXCLUDED.comments,saves=EXCLUDED.saves;
