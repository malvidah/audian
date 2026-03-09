import { NextResponse } from 'next/server';
import { wikiSearch } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { accounts } = await req.json(); // [{ handle, name }]
    if (!accounts?.length) return NextResponse.json({ results: [] });

    const results = [];
    for (const acc of accounts) {
      if (!acc.name || acc.name === acc.handle) {
        results.push({ handle: acc.handle, found: false });
        continue;
      }
      try {
        const wiki = await wikiSearch(acc.name);
        results.push(wiki ? { handle: acc.handle, found: true, ...wiki } : { handle: acc.handle, found: false });
      } catch {
        results.push({ handle: acc.handle, found: false });
      }
      await new Promise(r => setTimeout(r, 120)); // be a good citizen
    }

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
