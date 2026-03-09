import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
- name: Display name if shown (optional)
- followers: Follower count as integer if visible (optional — null if not shown)
- verified: true/false — look for blue checkmark ✓ badge
- interaction_type: one of "like", "follow", "comment", "mention", "tag", "view"
- content: The comment text if it's a comment (optional)
- platform: always "instagram"
- notes: anything notable (e.g. "verified creator", "blue badge", "business account")

Zone assignment rules:
- CORE: if they have a blue verification badge
- INFLUENTIAL: if followers >= 10000, OR verified
- RADAR: everyone else

Return ONLY valid JSON array, no markdown, no explanation:
[
  {
    "handle": "username",
    "name": "Display Name",
    "followers": 45200,
    "verified": true,
    "interaction_type": "like",
    "content": null,
    "platform": "instagram",
    "zone": "INFLUENTIAL",
    "notes": "verified creator account"
  }
]

If no interactions are found or the image is not an Instagram screenshot, return [].`;

export async function POST(req) {
  try {
    const body = await req.json();
    const { images } = body; // array of { base64, mediaType, filename }

    if (!images?.length) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 });
    }

    const results = [];

    for (const img of images) {
      try {
        const response = await anthropic.messages.create({
          model: 'claude-opus-4-5',
          max_tokens: 2000,
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
          system: SYSTEM_PROMPT,
        });

        const text = response.content[0]?.text || '[]';
        // Strip any accidental markdown fences
        const clean = text.replace(/```json\n?|```\n?/g, '').trim();
        let parsed;
        try {
          parsed = JSON.parse(clean);
        } catch {
          parsed = [];
        }

        results.push({
          filename: img.filename,
          interactions: Array.isArray(parsed) ? parsed : [],
          error: null,
        });
      } catch (e) {
        results.push({
          filename: img.filename,
          interactions: [],
          error: e.message,
        });
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
