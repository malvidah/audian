import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { parseFollowers, wikiSearch } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const PLATFORMS = ['instagram', 'x', 'youtube', 'linkedin'];

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
    const data      = await res.json();
    const text      = data.content?.find(b => b.type === 'text')?.text?.trim() || '';
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
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
    const { data: handles, error } = await supabaseAdmin
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
          const wiki = await wikiSearch(h.name);
          if (wiki) updates.bio = wiki.bio;
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
        await supabaseAdmin.from('handles').update(updates).eq('id', h.id);
        enriched++;
      }
    }

    return NextResponse.json({ enriched, total: handles.length });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
