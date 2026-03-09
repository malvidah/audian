import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are parsing social media screenshots to extract interaction data for a brand analytics dashboard.

FIRST: Identify which platform this screenshot is from. Look for platform-specific UI cues:
- Instagram: Stories, Reels, round profile photos, heart likes, follower counts, blue verified checkmark
- X (Twitter): Tweet format, retweet/quote icons, X logo, blue verified badge or gray badge
- YouTube: Video thumbnails, subscriber counts, comment sections with thumbs up, YouTube logo
- LinkedIn: Professional profile layouts, connection counts, LinkedIn blue UI

For each visible person/account extract:
- handle: Username/handle without @ or prefix (required — skip if not visible)
- name: Real display name — human/brand names only. NEVER output browser strings, file names, or technical text.
- followers: Follower/subscriber/connection count as integer if visible (null if not shown)
- verified: true/false — look for verification badge
- interaction_type: one of "like", "follow", "comment", "mention", "tag", "view", "retweet", "reply"
- content: Comment or post text if visible (optional)
- platform: DETECT from UI — one of "instagram", "x", "youtube", "linkedin". Use the same platform for all rows from a single screenshot.
- zone: Use INFLUENTIAL if followers >= 10000. Use INFLUENTIAL if verified AND followers >= 1000. Use SIGNAL for everyone else. Never assign ELITE.
- notes: anything notable about this account

CRITICAL: Only extract data visible in the social media UI. Ignore browser chrome, OS UI, tab titles, system notifications, technical strings. If this is not a social media screenshot, return [].

Return ONLY a valid JSON array, no markdown fences, no explanation:
[{"handle":"username","name":"Display Name","followers":45200,"verified":true,"interaction_type":"like","content":null,"platform":"instagram","zone":"INFLUENTIAL","notes":""}]

If no interactions visible, return [].`;

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
