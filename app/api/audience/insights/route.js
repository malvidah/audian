import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { dateFrom, dateTo, platform } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }

    // ── Fetch all interactions that have comment/mention content ──────────────
    let query = supabaseAdmin
      .from('interactions')
      .select('interaction_type, content, platform, interacted_at, handles(name, zone, followers_x, followers_instagram, followers_youtube, followers_linkedin)')
      .not('content', 'is', null)
      .neq('content', '')
      .order('interacted_at', { ascending: false });

    if (dateFrom) query = query.gte('interacted_at', dateFrom);
    if (dateTo)   query = query.lte('interacted_at', dateTo + 'T23:59:59Z');
    const platforms = Array.isArray(platform) ? platform : (platform && platform !== 'all' ? [platform] : []);
    if (platforms.length === 1) query = query.eq('platform', platforms[0]);
    else if (platforms.length > 1) query = query.in('platform', platforms);

    const { data: interactions, error: dbError } = await query;
    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

    if (!interactions || interactions.length === 0) {
      return NextResponse.json({ error: 'No comment data found for this period' }, { status: 404 });
    }

    // ── Format comments for the prompt ───────────────────────────────────────
    // Prioritise richer content (longer text = more signal), cap at 400 entries
    const sorted = [...interactions].sort((a, b) => (b.content?.length || 0) - (a.content?.length || 0));
    const capped  = sorted.slice(0, 400);

    const commentLines = capped.map(i => {
      const h = i.handles || {};
      const followers =
        i.platform === 'instagram' ? (h.followers_instagram || 0) :
        i.platform === 'x'         ? (h.followers_x        || 0) :
        i.platform === 'youtube'   ? (h.followers_youtube   || 0) :
                                     (h.followers_linkedin  || 0);
      const fmtF = n => n >= 1_000_000 ? (n/1_000_000).toFixed(1)+'M' : n >= 1_000 ? (n/1_000).toFixed(1)+'K' : String(n);
      const who  = [h.name || 'Anonymous', h.zone ? `[${h.zone}]` : '', followers > 0 ? `${fmtF(followers)} followers` : ''].filter(Boolean).join(' ');
      const type = i.interaction_type || 'comment';
      const text = (i.content || '').slice(0, 300);
      return `• [${type}] ${who}: "${text}"`;
    }).join('\n');

    const dateLabel = dateFrom && dateTo
      ? `${new Date(dateFrom + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} – ${new Date(dateTo + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
      : 'the selected period';
    const platLabel = platform && platform !== 'all' ? ` on ${platform}` : '';

    const prompt = `You are analyzing ${interactions.length} audience comments and mentions${platLabel} from ${dateLabel}.

${commentLines}

─────────────────────────────────────────

Derive exactly 3 key audience insights from this data. Focus on non-obvious, specific, actionable findings — NOT generic observations like "your audience is engaged."

Good insight angles to consider:
- Recurring themes, questions, or requests that appear across multiple comments
- Emotional tone patterns (excitement, frustration, nostalgia, humor, etc.)
- Specific content formats, topics, or names that appear repeatedly
- Demographic or interest signals hidden in the comments
- Surprising contrasts or unexpected reactions

REQUIREMENTS:
- Each insight must cite 2–4 specific verbatim quotes as evidence (exact words from the comments above)
- Each quote must include the commenter's name and approximate follower count if available
- Be concrete and specific — mention actual themes, topics, names, numbers
- The title should be a punchy 4–7 word headline
- The insight body should be 2–3 sentences

Return ONLY valid JSON, no markdown fences, no explanation:
{
  "insights": [
    {
      "title": "Short punchy headline",
      "insight": "2–3 sentence specific observation about what the data shows.",
      "evidence": [
        { "quote": "exact quote from comment", "commenter": "Name", "followers": "12.4K", "type": "comment" },
        { "quote": "exact quote from comment", "commenter": "Name", "followers": "8.2K", "type": "mention" }
      ]
    }
  ]
}`;

    // ── Call Claude Sonnet ────────────────────────────────────────────────────
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':           apiKey,
        'anthropic-version':   '2023-06-01',
        'content-type':        'application/json',
      },
      body: JSON.stringify({
        model:      'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages:   [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Anthropic API error: ${err}` }, { status: 500 });
    }

    const data   = await res.json();
    const raw    = data.content?.[0]?.text || '{}';
    const match  = raw.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: 'Could not parse insights', raw }, { status: 500 });

    const parsed = JSON.parse(match[0]);
    return NextResponse.json({ insights: parsed.insights, commentCount: interactions.length });

  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
