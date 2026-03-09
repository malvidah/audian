import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

// Parse "688.7K", "1.2M", "45,000" etc into an integer
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

export async function POST(req) {
  try {
    const { accounts } = await req.json(); // [{handle, name, platform}]
    if (!accounts?.length) return NextResponse.json({ results: [] });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 });

    const results = [];

    for (const acc of accounts) {
      const name     = acc.name || acc.handle;
      const platform = acc.platform || 'instagram';
      const handle   = acc.handle;

      try {
        // Ask Claude to search and extract the follower count
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
            system: `You are a data extraction assistant. Use web_search to find the ${platform} follower count for the given account. After searching, respond with ONLY a raw JSON object (no markdown, no explanation): {"followers": 125000, "found": true} or {"found": false}. Convert K/M to integers. Only return found:true if you are confident the result matches the handle.`,
            messages: [{
              role: 'user',
              content: `Search for the ${platform} follower count for handle "@${handle}"${name && name !== handle ? ` (name: ${name})` : ''}. Return JSON only.`
            }],
          }),
        });

        const data = await response.json();
        console.log(`[followers] ${handle} status=${response.status} content_blocks=${data.content?.length}`);
        if (!response.ok) throw new Error(data.error?.message || `API error ${response.status}`);

        // Extract the text response
        const textBlock = data.content?.find(b => b.type === 'text');
        const text = textBlock?.text?.trim() || '';

        // Parse JSON from response
        console.log(`[followers] ${handle} raw_text=${JSON.stringify(text?.slice(0,200))}`);
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.found && parsed.followers) {
            results.push({
              handle,
              found: true,
              followers: typeof parsed.followers === 'string'
                ? parseFollowerCount(parsed.followers)
                : parsed.followers,
              confidence: parsed.confidence || 'high',
            });
          } else {
            results.push({ handle, found: false });
          }
        } else {
          // Fallback: try to parse a number from the text
          const numMatch = text.match(/([\d.]+[KkMm]?)\s*followers/i);
          if (numMatch) {
            results.push({ handle, found: true, followers: parseFollowerCount(numMatch[1]), confidence: 'low' });
          } else {
            results.push({ handle, found: false });
          }
        }
      } catch (e) {
        console.error(`Follower lookup failed for ${handle}:`, e.message);
        results.push({ handle, found: false, error: e.message });
      }

      // Small delay between requests
      await new Promise(r => setTimeout(r, 200));
    }

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
