// ─── parseFollowers ───────────────────────────────────────────────────────────
// Converts "125K", "1.2M", "1,234,567" → integer, or null if unparseable.
export function parseFollowers(str) {
  if (!str) return null;
  const m = String(str).replace(/,/g, '').match(/([\d.]+)\s*([KkMmBb]?)\+?/);
  if (!m) return null;
  const n      = parseFloat(m[1]);
  const suffix = m[2].toUpperCase();
  if (suffix === 'K') return Math.round(n * 1_000);
  if (suffix === 'M') return Math.round(n * 1_000_000);
  if (suffix === 'B') return Math.round(n * 1_000_000_000);
  return Math.round(n);
}

// ─── wikiSearch ───────────────────────────────────────────────────────────────
// Looks up the first-sentence Wikipedia bio for a person's name.
// Returns { bio, wikiTitle, wikiUrl, confidence } or null if no confident match.
export async function wikiSearch(name) {
  const searchRes = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&srlimit=3&format=json&origin=*`,
    { headers: { 'User-Agent': 'Audian/1.0' } }
  );
  const { query } = await searchRes.json();
  const top = query?.search?.[0];
  if (!top) return null;

  const nameWords  = name.toLowerCase().split(/\s+/).filter(w => w.length > 1);
  const confidence = nameWords.filter(w => top.title.toLowerCase().includes(w)).length / nameWords.length;
  if (confidence < 0.6) return null;

  const sumRes = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(top.title)}`,
    { headers: { 'User-Agent': 'Audian/1.0' } }
  );
  if (!sumRes.ok) return null;
  const summary = await sumRes.json();
  if (summary.type === 'disambiguation') return null;

  const first = summary.extract?.split(/\.\s+/)[0]?.trim();
  if (!first || first.length < 20) return null;

  return {
    bio:       first.length > 160 ? first.slice(0, 157) + '…' : first,
    wikiTitle: summary.title,
    wikiUrl:   summary.content_urls?.desktop?.page || null,
    confidence,
  };
}
