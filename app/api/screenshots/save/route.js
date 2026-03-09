import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function upsertHandle(item, platform, cleanHandle, now) {
  const handleCol    = `handle_${platform}`;
  const followersCol = `followers_${platform}`;
  const verifiedCol  = `verified_${platform}`;
  const zone         = item.zone || 'SIGNAL';

  const { data: existing } = await supabase
    .from('handles')
    .select('id, zone, name, bio')
    .eq(handleCol, cleanHandle)
    .maybeSingle();

  if (existing) {
    await supabase.from('handles').update({
      zone:          existing.zone === 'ELITE' ? 'ELITE' : zone,
      [followersCol]: item.followers || null,
      [verifiedCol]:  item.verified  || false,
      ...(item.name && !existing.name ? { name: item.name } : {}),
      ...(item.bio  && !existing.bio  ? { bio:  item.bio  } : {}),
      updated_at: now,
    }).eq('id', existing.id);
    return existing.id;
  }

  const { data: created, error } = await supabase.from('handles').insert({
    name:           item.name || cleanHandle,
    bio:            item.bio  || null,
    avatar_url:     item.avatar_url || null,
    zone,
    [handleCol]:    cleanHandle,
    [followersCol]: item.followers || null,
    [verifiedCol]:  item.verified  || false,
    added_at:   now,
    updated_at: now,
  }).select('id').single();

  if (error) { console.error('[save] upsertHandle error:', error.message); return null; }
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

      // 1. Upsert handle (person/org identity)
      const handleId = await upsertHandle(item, platform, cleanHandle, now);
      if (!handleId) { errors.push(`${cleanHandle}: could not upsert handle`); continue; }

      // 2. Insert interaction event(s)
      const types = (item.interaction_type || 'unknown').split(',').map(t => t.trim()).filter(Boolean);
      for (const type of types) {
        const { error } = await supabase.from('interactions').insert({
          handle_id:        handleId,
          platform,
          interaction_type: type,
          content:          item.content?.slice(0, 2000) || null,
          screenshot_id:    item.screenshot_id || null,
          interacted_at:    now,
          synced_at:        now,
        });
        if (error) errors.push(`${cleanHandle}/${type}: ${error.message}`);
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
