import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const { data: comments } = await supabase
      .from('interactions').eq('type', 'comment')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(80);

    if (!comments || comments.length < 3) {
      return NextResponse.json({ stories: [] });
    }

    // Build comment list for Claude
    const commentList = comments.map(c =>
      `[${c.platform}] ${c.author_name} on "${c.video_title?.slice(0, 50) || 'post'}": "${c.content?.slice(0, 200)}"`
    ).join('\n');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: `You are an audience intelligence analyst for Big Think, a media company. You analyze social media comments to surface what audiences find valuable, thought-provoking, or emotionally resonant.

Find 2-4 meaningful themes in the comments. Each theme should tell a story about what the audience cares about.

Respond ONLY with valid JSON:
{
  "stories": [
    {
      "theme": "SHORT THEME LABEL (e.g. PERSONAL CONNECTION, INTELLECTUAL CHALLENGE)",
      "headline": "A punchy editorial headline summarizing this story (max 12 words)",
      "insight": "2-3 sentences explaining the pattern and why it matters for content strategy",
      "evidence": [
        { "author_name": "...", "content": "...", "platform": "...", "video_title": "..." }
      ]
    }
  ]
}

Rules:
- Only include themes with at least 2 supporting comments
- evidence array must have 2-4 comments that best illustrate the theme
- headline should be editorial and specific, not generic
- insight should reference the actual content topics where possible`,
        messages: [{
          role: 'user',
          content: `Analyze these ${comments.length} comments and surface audience stories:\n\n${commentList}`,
        }],
      }),
    });

    const data = await res.json();
    const raw = data.content?.[0]?.text || '';

    let result;
    try {
      const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      result = JSON.parse(clean);
    } catch {
      return NextResponse.json({ stories: [], error: 'Parse failed' });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Stories error:', err);
    return NextResponse.json({ stories: [], error: err.message }, { status: 500 });
  }
}
