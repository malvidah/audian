import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Vercel pro allows up to 60s

function parseFollowerCount(str) {
  if (!str) return null;
  const s = str.replace(/,/g, '').trim();
  const m = s.match(/([\d.]+)\s*([KkMmBb]?)\+?/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const suffix = m[2].toUpperCase();
  if (suffix === 'K') return Math.round(n * 1_000);
  if (suffix === 'M') return Math.round(n * 1_000_000);
  if (suffix === 'B') return Math.round(n * 1_000_000_000);
  return Math.round(n);
}

async function lookupOne(acc, apiKey) {
  const name     = acc.name || acc.handle;
  const platform = acc.platform || 'instagram';
  const handle   = acc.handle;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: `You are a data extraction assistant. Use web_search to find the ${platform} follower count for the given account. After searching, respond with ONLY a raw JSON object (no markdown, no explanation): {"followers": 125000, "found": true} or {"found": false}. Convert K/M/B abbreviations to full integers.`,
        messages: [{
          role: 'user',
          content: `Find the ${platform} follower count for "@${handle}"${name && name !== handle ? ` (name: ${name})` : ''}. Return JSON only.`
        }],
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || `API ${response.status}`);

    const textBlock = data.content?.find(b => b.type === 'text');
    const text = textBlock?.text?.trim() || '';
    console.log(`[followers] ${handle}: ${text.slice(0, 120)}`);

    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.found && parsed.followers) {
        return {
          handle, found: true,
          followers: typeof parsed.followers === 'string'
            ? parseFollowerCount(parsed.followers)
            : Math.round(parsed.followers),
        };
      }
    }
    // Fallback: scan for "NNNk followers" pattern in text
    const numMatch = text.match(/([\d.]+\s*[KkMmBb]?)\s*followers/i);
    if (numMatch) return { handle, found: true, followers: parseFollowerCount(numMatch[1]) };

    return { handle, found: false };
  } catch (e) {
    console.error(`[followers] ${handle} error:`, e.message);
    return { handle, found: false, error: e.message };
  }
}

export async function POST(req) {
  try {
    const { accounts } = await req.json();
    if (!accounts?.length) return NextResponse.json({ results: [] });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 });

    // Run all lookups in parallel — no sequential delay, no timeout risk
    const results = await Promise.all(accounts.map(acc => lookupOne(acc, apiKey)));

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
