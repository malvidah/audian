import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function followerScore(f) {
  if (!f) return 5;
  if (f >= 1_000_000) return 60;
  if (f >= 500_000)   return 52;
  if (f >= 100_000)   return 42;
  if (f >= 50_000)    return 34;
  if (f >= 10_000)    return 26;
  if (f >= 1_000)     return 16;
  return 3;
}

// Upsert a person row, return their id
async function upsertPerson(item, platform, cleanHandle, now) {
  const handleCol    = `handle_${platform}`;
  const followersCol = `followers_${platform}`;
  const verifiedCol  = `verified_${platform}`;
  const category     = item.zone || 'SIGNAL';

  // Try to find existing person by this platform handle
  const { data: existing } = await supabase
    .from('people')
    .select('id, category, name, bio')
    .eq(handleCol, cleanHandle)
    .maybeSingle();

  if (existing) {
    // Don't downgrade ELITE
    const newCategory = existing.category === 'ELITE' ? 'ELITE' : category;
    await supabase.from('people').update({
      category:        newCategory,
      [followersCol]:  item.followers || null,
      [verifiedCol]:   item.verified  || false,
      ...(item.name && !existing.name ? { name: item.name } : {}),
      ...(item.bio  && !existing.bio  ? { bio:  item.bio  } : {}),
      updated_at: now,
    }).eq('id', existing.id);
    return existing.id;
  }

  // Create new person
  const { data: created, error } = await supabase.from('people').insert({
    name:           item.name || cleanHandle,
    bio:            item.bio  || null,
    avatar_url:     item.avatar_url || null,
    category,
    [handleCol]:    cleanHandle,
    [followersCol]: item.followers || null,
    [verifiedCol]:  item.verified  || false,
    added_at:  now,
    updated_at: now,
  }).select('id').single();

  if (error) { console.error('upsertPerson error:', error.message); return null; }
  return created.id;
}

export async function POST(req) {
  try {
    const { interactions } = await req.json();
    if (!interactions?.length) return NextResponse.json({ saved: 0 });

    const now = new Date().toISOString();
    let saved = 0;
    const errors = [];

    const toSave = interactions.filter(i => i.handle && i.zone !== 'IGNORE');

    for (const item of toSave) {
      const platform    = (item.platform || 'instagram').toLowerCase();
      const cleanHandle = item.handle.toLowerCase().replace(/^@/, '');

      // 1. Upsert person
      const personId = await upsertPerson(item, platform, cleanHandle, now);
      if (!personId) { errors.push(`${cleanHandle}: could not create person`); continue; }

      // 2. Insert interaction event(s) — one per type
      const types = (item.interaction_type || 'unknown').split(',').map(t => t.trim()).filter(Boolean);
      for (const type of types) {
        const { error: intErr } = await supabase.from('interactions').insert({
          person_id:     personId,
          platform,
          type,
          content:       item.content?.slice(0, 2000) || null,
          content_title: item.content_title || null,
          screenshot_id: item.screenshot_id || null,
          interacted_at: now,
          synced_at:     now,
        });
        if (intErr) errors.push(`${cleanHandle}/${type}: ${intErr.message}`);
        else saved++;
      }
    }

    return NextResponse.json({
      saved,
      skipped: interactions.length - toSave.length,
      errors: errors.length,
      errorDetails: errors.slice(0, 5),
      message: saved > 0
        ? `Saved ${saved} interaction${saved !== 1 ? 's' : ''}`
        : errors.length > 0
          ? `Save failed: ${errors[0]}`
          : `Nothing to save (${interactions.length - toSave.length} IGNORE)`,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
