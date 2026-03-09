import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PLATFORMS = ['instagram', 'x', 'youtube', 'linkedin'];

async function wikiSearch(name) {
  const searchRes = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&srlimit=3&format=json&origin=*`,
    { headers: { 'User-Agent': 'Audian/1.0' } }
  );
  const { query } = await searchRes.json();
  const top = query?.search?.[0];
  if (!top) return null;
  const nameWords = name.toLowerCase().split(/\s+/).filter(w => w.length > 1);
  const score = nameWords.filter(w => top.title.toLowerCase().includes(w)).length / nameWords.length;
  if (score < 0.6) return null;
  const sumRes = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(top.title)}`,
    { headers: { 'User-Agent': 'Audian/1.0' } }
  );
  if (!sumRes.ok) return null;
  const summary = await sumRes.json();
  if (summary.type === 'disambiguation') return null;
  const first = summary.extract?.split(/\.\s+/)[0]?.trim();
  if (!first || first.length < 20) return null;
  return first.length > 160 ? first.slice(0, 157) + '…' : first;
}

function parseFollowers(str) {
  if (!str) return null;
  const m = str.replace(/,/g, '').match(/([\d.]+)\s*([KkMmBb]?)\+?/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const s = m[2].toUpperCase();
  if (s === 'K') return Math.round(n * 1_000);
  if (s === 'M') return Math.round(n * 1_000_000);
  if (s === 'B') return Math.round(n * 1_000_000_000);
  return Math.round(n);
}

async function lookupFollowers(name, handle, platform, apiKey) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: `Find the ${platform} follower count. Respond ONLY with raw JSON: {"followers": 125000, "found": true} or {"found": false}.`,
        messages: [{ role: 'user', content: `${platform} follower count for "@${handle}"${name && name !== handle ? ` (${name})` : ''}. JSON only.` }],
      }),
    });
    const data = await res.json();
    const text = data.content?.find(b => b.type === 'text')?.text?.trim() || '';
    const match = text.match(/\{[\s\S]*?\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (parsed.found && parsed.followers) return typeof parsed.followers === 'string' ? parseFollowers(parsed.followers) : Math.round(parsed.followers);
    }
    const numMatch = text.match(/([\d.]+\s*[KkMmBb]?)\s*followers/i);
    if (numMatch) return parseFollowers(numMatch[1]);
    return null;
  } catch { return null; }
}

// POST { ids: [uuid, ...] } — enrich up to 50 handles per call
export async function POST(req) {
  try {
    const { ids } = await req.json();
    if (!ids?.length) return NextResponse.json({ enriched: 0 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    const { data: handles, error } = await supabase
      .from('handles')
      .select('*')
      .in('id', ids.slice(0, 50));
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    let enriched = 0;
    for (const h of handles) {
      const updates = {};

      // Wiki bio — only if name exists and bio is empty
      if (h.name && !h.bio?.trim()) {
        try {
          const bio = await wikiSearch(h.name);
          if (bio) updates.bio = bio;
        } catch {}
        await new Promise(r => setTimeout(r, 120));
      }

      // Follower counts — each platform with a handle but no count, in parallel
      if (apiKey) {
        const jobs = PLATFORMS.filter(p => h[`handle_${p}`] && !h[`followers_${p}`]);
        await Promise.all(jobs.map(async p => {
          const count = await lookupFollowers(h.name || h[`handle_${p}`], h[`handle_${p}`], p, apiKey);
          if (count) updates[`followers_${p}`] = count;
        }));
      }

      if (Object.keys(updates).length > 0) {
        updates.updated_at = new Date().toISOString();
        await supabase.from('handles').update(updates).eq('id', h.id);
        enriched++;
      }
    }

    return NextResponse.json({ enriched, total: handles.length });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
