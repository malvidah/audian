import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

// Wikipedia REST API — no key, free, rate-limit friendly
async function wikiSearch(name) {
  // Step 1: search for the name
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&srlimit=3&format=json&origin=*`;
  const searchRes = await fetch(searchUrl, { headers: { 'User-Agent': 'Audian/1.0 (social analytics)' } });
  const searchData = await searchRes.json();
  const results = searchData?.query?.search || [];
  if (!results.length) return null;

  // Step 2: check if top result title is a close match to the name
  const top = results[0];
  const topTitle = top.title.toLowerCase();
  const nameLower = name.toLowerCase();

  // Confidence check — title must contain the name or name must contain the title
  const nameWords = nameLower.split(/\s+/).filter(w => w.length > 1);
  const matchScore = nameWords.filter(w => topTitle.includes(w)).length / nameWords.length;
  if (matchScore < 0.6) return null; // not confident enough

  // Step 3: fetch the summary extract
  const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(top.title)}`;
  const summaryRes = await fetch(summaryUrl, { headers: { 'User-Agent': 'Audian/1.0' } });
  if (!summaryRes.ok) return null;
  const summary = await summaryRes.json();

  // Only return if it's clearly a person/entity (not disambiguation)
  if (summary.type === 'disambiguation') return null;

  // Return first sentence only — keep it short for a bio field
  const extract = summary.extract || '';
  const firstSentence = extract.split(/\.\s+/)[0]?.trim();
  if (!firstSentence || firstSentence.length < 20) return null;

  return {
    bio: firstSentence.length > 160 ? firstSentence.slice(0, 157) + '…' : firstSentence,
    wikiTitle: summary.title,
    wikiUrl: summary.content_urls?.desktop?.page || null,
    confidence: matchScore,
  };
}

export async function POST(req) {
  try {
    const { accounts } = await req.json(); // [{handle, name}]
    if (!accounts?.length) return NextResponse.json({ results: [] });

    const results = [];
    for (const acc of accounts) {
      if (!acc.name || acc.name === acc.handle) {
        results.push({ handle: acc.handle, found: false });
        continue;
      }
      try {
        const wiki = await wikiSearch(acc.name);
        if (wiki) {
          results.push({ handle: acc.handle, found: true, ...wiki });
        } else {
          results.push({ handle: acc.handle, found: false });
        }
      } catch {
        results.push({ handle: acc.handle, found: false });
      }
      // Small delay to be a good citizen with Wikipedia's API
      await new Promise(r => setTimeout(r, 120));
    }

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
