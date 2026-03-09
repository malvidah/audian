import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are parsing Instagram screenshots to extract social interaction data for a brand analytics dashboard.

From each screenshot, extract every visible person/account that has interacted with the brand. This includes:
- Notifications feed (likes, follows, comments, mentions, tags)
- Likers list on a post
- Followers/following list
- Comments section
- Story viewers
- Tagged/mentioned accounts

For each person extract:
- handle: Instagram username without @ (required — skip if not visible)
- name: Display name as shown in the Instagram UI — real human/brand names only (e.g. "Maria Wendt"). Leave null if no real name is clearly visible. NEVER output browser process names, file names, bundle names, or any technical string.
- followers: Follower count as integer if visible (optional — null if not shown)
- verified: true/false — look for blue checkmark badge
- interaction_type: one of "like", "follow", "comment", "mention", "tag", "view"
- content: The comment text if it's a comment (optional)
- platform: always "instagram"
- zone: follower count is the PRIMARY signal. Use INFLUENTIAL if followers >= 10000 (verified or not). Use INFLUENTIAL if verified AND followers >= 1000. Use RADAR for everyone else — including verified accounts with tiny followings. Never assign CORE (that's determined by an internal watchlist separately).
- notes: anything notable

CRITICAL: Only extract data that is genuinely visible in the Instagram UI. Ignore any browser UI chrome, tab titles, system notifications, or technical strings. If the screenshot is not clearly an Instagram screen, return [].

Return ONLY a valid JSON array, no markdown fences, no explanation:
[{"handle":"username","name":"Display Name","followers":45200,"verified":true,"interaction_type":"like","content":null,"platform":"instagram","zone":"INFLUENTIAL","notes":"verified creator"}]

If no interactions are visible or this is not an Instagram screenshot, return [].`;

export async function POST(req) {
  try {
    const body = await req.json();
    const { images } = body;

    if (!images?.length) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set in environment' }, { status: 500 });
    }

    const results = [];

    for (const img of images) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-opus-4-5',
            max_tokens: 2000,
            system: SYSTEM_PROMPT,
            messages: [{
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: img.mediaType || 'image/jpeg',
                    data: img.base64,
                  },
                },
                {
                  type: 'text',
                  text: 'Parse this Instagram screenshot and extract all visible account interactions. Return only the JSON array.',
                },
              ],
            }],
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || `API error ${response.status}`);
        }

        const text = data.content?.[0]?.text || '[]';
        const clean = text.replace(/```json\n?|```\n?/g, '').trim();

        let parsed;
        try {
          parsed = JSON.parse(clean);
        } catch {
          // Try to extract JSON array if there's surrounding text
          const match = clean.match(/\[[\s\S]*\]/);
          parsed = match ? JSON.parse(match[0]) : [];
        }

        results.push({
          filename: img.filename,
          interactions: Array.isArray(parsed) ? parsed : [],
          error: null,
        });
      } catch (e) {
        console.error(`Parse error for ${img.filename}:`, e.message);
        results.push({
          filename: img.filename,
          interactions: [],
          error: e.message,
        });
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error('Screenshots parse route error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
