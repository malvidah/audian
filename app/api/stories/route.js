import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const { data: rows } = await supabaseAdmin
      .from('interactions')
      .select('id, platform, interaction_type, content, interacted_at, handles(name, handle_instagram, handle_x, handle_youtube, handle_linkedin)')
      .eq('interaction_type', 'comment')
      .order('interacted_at', { ascending: false })
      .limit(80);

    if (!rows || rows.length < 3) {
      return NextResponse.json({ stories: [] });
    }

    const commentList = rows.map(r => {
      const h      = r.handles || {};
      const handle = h[`handle_${r.platform}`] || h.handle_instagram || h.handle_x || '?';
      return `[${r.platform}] @${handle}: "${r.content?.slice(0, 200)}"`;
    }).join('\n');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
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
        { "handle": "...", "content": "...", "platform": "..." }
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
          content: `Analyze these ${rows.length} comments and surface audience stories:\n\n${commentList}`,
        }],
      }),
    });

    const data = await res.json();
    const raw  = data.content?.[0]?.text || '';

    let result;
    try {
      result = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } catch {
      return NextResponse.json({ stories: [], error: 'Parse failed' });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Stories error:', err);
    return NextResponse.json({ stories: [], error: err.message }, { status: 500 });
  }
}
