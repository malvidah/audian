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

    const platforms = Array.isArray(platform) ? platform : (platform && platform !== 'all' ? [platform] : []);

    // ── Fetch interactions with content ───────────────────────────────────────
    let intQuery = supabaseAdmin
      .from('interactions')
      .select('interaction_type, content, platform, interacted_at, post_url, handles(name, zone, followers_x, followers_instagram, followers_youtube, followers_linkedin)')
      .not('content', 'is', null)
      .neq('content', '')
      .order('interacted_at', { ascending: false });

    if (dateFrom) intQuery = intQuery.gte('interacted_at', dateFrom);
    if (dateTo)   intQuery = intQuery.lte('interacted_at', dateTo + 'T23:59:59Z');
    if (platforms.length === 1) intQuery = intQuery.eq('platform', platforms[0]);
    else if (platforms.length > 1) intQuery = intQuery.in('platform', platforms);

    // ── Fetch posts in the same window ────────────────────────────────────────
    let postsQuery = supabaseAdmin
      .from('posts')
      .select('platform, content, permalink, published_at, likes, comments, impressions')
      .not('content', 'is', null)
      .neq('content', '')
      .neq('post_type', 'daily_aggregate')
      .order('published_at', { ascending: false })
      .limit(300);

    if (dateFrom) postsQuery = postsQuery.gte('published_at', dateFrom);
    if (dateTo)   postsQuery = postsQuery.lte('published_at', dateTo + 'T23:59:59Z');
    if (platforms.length === 1) postsQuery = postsQuery.eq('platform', platforms[0]);
    else if (platforms.length > 1) postsQuery = postsQuery.in('platform', platforms);

    const [{ data: interactions, error: dbError }, { data: posts }] = await Promise.all([intQuery, postsQuery]);

    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
    if (!interactions || interactions.length === 0) {
      return NextResponse.json({ error: 'No comment data found for this period' }, { status: 404 });
    }

    // ── Build a post lookup by permalink ─────────────────────────────────────
    const PLAT_LABEL = { instagram: 'Instagram', x: 'X', linkedin: 'LinkedIn', youtube: 'YouTube' };
    const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
    const fmtK    = n => n >= 1_000_000 ? (n/1_000_000).toFixed(1)+'M' : n >= 1_000 ? (n/1_000).toFixed(1)+'K' : String(n||0);

    const postByUrl = {};
    (posts || []).forEach((p, i) => {
      if (p.permalink) postByUrl[p.permalink] = { ...p, label: `P${i+1}` };
    });

    // ── Group comments under their parent post ────────────────────────────────
    // Prioritise richer comments, cap total at 400
    const sorted = [...interactions].sort((a, b) => (b.content?.length || 0) - (a.content?.length || 0));
    const capped = sorted.slice(0, 400);

    // Build the posts section — only posts that have at least one comment linking to them, plus top posts by likes
    const linkedPostUrls = new Set(capped.map(i => i.post_url).filter(Boolean));
    const topPosts = (posts || [])
      .filter(p => p.permalink && (linkedPostUrls.has(p.permalink) || (p.likes || 0) > 0))
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 50);

    const postsSection = topPosts.length > 0
      ? 'POSTS (the content being commented on):\n' +
        topPosts.map((p, i) => {
          const snippet = (p.content || '').slice(0, 120).replace(/\n/g, ' ');
          return `[P${i+1}] ${PLAT_LABEL[p.platform] || p.platform} · ${fmtDate(p.published_at)} · ${fmtK(p.likes)} likes · ${fmtK(p.comments)} comments\n"${snippet}"\n${p.permalink || ''}`;
        }).join('\n\n')
      : '';

    // Rebuild post label map by permalink position in topPosts
    const postLabelByUrl = {};
    topPosts.forEach((p, i) => { if (p.permalink) postLabelByUrl[p.permalink] = `P${i+1}`; });

    const commentsSection = 'COMMENTS / MENTIONS:\n' +
      capped.map(i => {
        const h = i.handles || {};
        const type = i.interaction_type || 'comment';
        const who  = h.name || 'Anonymous';
        const postRef = i.post_url && postLabelByUrl[i.post_url] ? ` → re [${postLabelByUrl[i.post_url]}]` : '';
        const text = (i.content || '').slice(0, 300);
        return `• [${type}] ${who}${postRef}: "${text}"`;
      }).join('\n');

    const dateLabel = dateFrom && dateTo
      ? `${new Date(dateFrom + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} – ${new Date(dateTo + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
      : 'the selected period';
    const platLabel = platforms.length > 0 ? ` on ${platforms.map(p => PLAT_LABEL[p] || p).join(', ')}` : '';

    const prompt = `Here are the posts published${platLabel} in ${dateLabel}, and the comments/mentions they received. Read through and tell me what's actually interesting.

${postsSection}

${commentsSection}

─────────────────────────────────────────

Give me exactly 3 insights. Write like a smart colleague who spent an hour reading this and wants to share what they noticed. Plain language — no jargon.

Each insight should be grounded in specific content. Which posts sparked the most interesting reactions? What themes keep coming up across multiple pieces? What does the comment data tell you about what's resonating, and why?

What makes a good insight:
- A post or theme that got a reaction stronger or weaker than you'd expect
- Comments that reveal something about the audience's values, beliefs, or frustrations
- A recurring ask or question that points to an obvious content opportunity
- A contrast between what performed and what people actually engaged with in the comments

For each insight include:
- 1–2 specific content pieces that triggered it (use the post snippets from above)
- 2–4 verbatim comment quotes that back it up

TITLE: 4–7 words, direct. Could be a finding or a tension.

INSIGHT BODY: 2–3 sentences. What you see, why it matters, what you'd do with it. IMPORTANT: Never use P-number labels (like P1, P4, P10) in the insight text. Refer to posts by their actual content, topic, or a short description (e.g. "the post about male communication", "the physics video").

Return ONLY valid JSON, no markdown fences, no explanation:
{
  "insights": [
    {
      "title": "Short direct headline",
      "insight": "2–3 sentences: what you see, why it matters, what to do with it. Refer to posts by content, not by P-numbers.",
      "content_pieces": [
        { "snippet": "first ~10 words of the post", "platform": "instagram", "date": "Mar 27, 2026", "permalink": "https://...", "likes": "9.9K" }
      ],
      "evidence": [
        { "quote": "exact quote from comment", "commenter": "Name", "type": "comment" },
        { "quote": "exact quote from comment", "commenter": "Name", "type": "mention" }
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
        model:      'claude-sonnet-4-6',
        max_tokens: 2500,
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
    const insightsArr = parsed.insights || [];

    // ── Auto-save to DB ───────────────────────────────────────────────────────
    const platformStr = platforms.sort().join(',');
    const { data: saved } = await supabaseAdmin
      .from('audience_insights_saved')
      .insert({
        date_from:     dateFrom || null,
        date_to:       dateTo   || null,
        platforms:     platformStr,
        comment_count: interactions.length,
        insights:      insightsArr,
      })
      .select('id, created_at')
      .single();

    return NextResponse.json({
      insights:     insightsArr,
      commentCount: interactions.length,
      savedId:      saved?.id,
      savedAt:      saved?.created_at,
    });

  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
