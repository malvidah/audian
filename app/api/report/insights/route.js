import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { dateFrom, dateTo, accountName, interactionsSummary, commentContent, postsSummary, totalInteractions } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }

    const dateLabel = dateFrom && dateTo
      ? `${new Date(dateFrom + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} – ${new Date(dateTo + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
      : 'the selected period';

    const prompt = `You are a social media analyst for ${accountName || 'Big Think'}, a science and ideas media brand.

Here is a summary of social media activity for ${dateLabel}:

NOTABLE INTERACTIONS (${totalInteractions} total):
${interactionsSummary || 'No notable interactions recorded.'}

COMMENT & MENTION CONTENT (sample):
${commentContent || 'No comment content available.'}

TOP POSTS BY ENGAGEMENT:
${postsSummary || 'No post data available.'}

Generate exactly 3 concise, specific insights about this period. Each insight should be 2–3 sentences. Focus on:
1. Who is engaging (audience quality, reach, influence signals)
2. What content or topics are resonating (patterns in what drove the best interactions)
3. Sentiment or opportunity (tone of comments/mentions, anything actionable)

Be specific — reference actual people, numbers, or content when possible. Avoid generic observations.

Return ONLY a valid JSON array with exactly 3 objects, no markdown, no explanation:
[{"insight": "..."}, {"insight": "..."}, {"insight": "..."}]`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Anthropic API error: ${err}` }, { status: 500 });
    }

    const data = await res.json();
    const raw = data.content?.[0]?.text || '[]';

    // Parse the JSON array from the response
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse insights from response', raw }, { status: 500 });
    }
    const insights = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ insights });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
