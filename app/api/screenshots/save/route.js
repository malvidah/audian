import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

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
      zone:           existing.zone === 'ELITE' ? 'ELITE' : zone,
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
    const { interactions, includeIgnore } = await req.json();
    if (!interactions?.length) return NextResponse.json({ saved: 0 });

    const now = new Date().toISOString();
    const toSave = interactions.filter(i =>
      i.handle && (includeIgnore || i.zone !== 'IGNORE')
    );

    if (!toSave.length) {
      const ignoreCount = interactions.filter(i => i.zone === 'IGNORE').length;
      return NextResponse.json({
        saved: 0,
        skipped: interactions.length,
        ignoreSkipped: ignoreCount,
        message: `Nothing saved — ${ignoreCount} IGNORE zone entries are excluded by default`,
      });
    }

    // ── Phase 1: upsert handles in parallel batches of 20 ───────────────────
    const BATCH = 20;
    const resolved = [];
    const errors = [];

    for (let i = 0; i < toSave.length; i += BATCH) {
      const chunk = toSave.slice(i, i + BATCH);
      const results = await Promise.all(chunk.map(async (item) => {
        const platform    = (item.platform || 'instagram').toLowerCase();
        const cleanHandle = item.handle.toLowerCase().replace(/^@/, '');
        const handleId    = await upsertHandle(item, platform, cleanHandle, now);
        return { item, platform, cleanHandle, handleId };
      }));
      resolved.push(...results);
    }

    // ── Phase 2: collect interaction rows ────────────────────────────────────
    let saved = 0;
    const interactionRows = [];

    for (const { item, platform, cleanHandle, handleId } of resolved) {
      if (!handleId) { errors.push(`${cleanHandle}: could not upsert handle`); continue; }
      saved++;
      const types = (item.interaction_type || 'unknown').split(',').map(t => t.trim()).filter(Boolean);
      for (const type of types) {
        interactionRows.push({
          handle_id:        handleId,
          platform,
          interaction_type: type,
          content:          item.content?.slice(0, 2000) || null,
          screenshot_id:    item.screenshot_id || null,
          post_url:         item.post_url || null,
          interacted_at:    item.interacted_at || item.interaction_date || now,
          synced_at:        now,
        });
      }
    }

    // ── Phase 3: dedup-aware interactions save ───────────────────────────────
    // Fetch existing interactions for these handle IDs so we can patch instead of dupe
    const handleIds = [...new Set(interactionRows.map(r => r.handle_id).filter(Boolean))];
    let existingRows = [];
    if (handleIds.length) {
      const { data } = await supabase
        .from('interactions')
        .select('id, handle_id, interaction_type, interacted_at, post_url, content')
        .in('handle_id', handleIds);
      existingRows = data || [];
    }

    // Build a lookup: "handle_id:type:YYYY-MM-DD" → existing row
    const existingMap = new Map();
    for (const row of existingRows) {
      const dateKey = row.interacted_at ? row.interacted_at.slice(0, 10) : 'nodate';
      existingMap.set(`${row.handle_id}:${row.interaction_type}:${dateKey}`, row);
    }

    const toInsert = [];
    const toUpdate = []; // { id, patch }

    for (const row of interactionRows) {
      const dateKey = row.interacted_at ? row.interacted_at.slice(0, 10) : 'nodate';
      const key = `${row.handle_id}:${row.interaction_type}:${dateKey}`;
      const existing = existingMap.get(key);

      if (!existing) {
        toInsert.push(row);
      } else {
        // Only patch fields that were missing on the existing record
        const patch = {};
        if (!existing.post_url && row.post_url) patch.post_url = row.post_url;
        if (!existing.content  && row.content)  patch.content  = row.content;
        if (Object.keys(patch).length) toUpdate.push({ id: existing.id, patch });
      }
    }

    // Bulk insert new rows
    for (let i = 0; i < toInsert.length; i += 200) {
      const chunk = toInsert.slice(i, i + 200);
      const { error } = await supabase.from('interactions').insert(chunk);
      if (error) {
        const isSchemaError = error.message?.includes('schema cache') || error.message?.includes('does not exist');
        if (!isSchemaError) errors.push(`interactions insert: ${error.message}`);
        console.error('[save] interactions bulk insert error:', error.message);
      }
    }

    // Patch existing rows with newly available fields (e.g. post_url added on re-import)
    await Promise.all(toUpdate.map(({ id, patch }) =>
      supabase.from('interactions').update(patch).eq('id', id)
    ));

    return NextResponse.json({
      saved,
      patched: toUpdate.length,
      skipped: interactions.length - toSave.length,
      ignoreSkipped: interactions.filter(i => i.zone === 'IGNORE').length,
      errors: errors.length,
      errorDetails: errors.slice(0, 5),
      message: saved > 0 || toUpdate.length > 0
        ? `Saved ${saved} new${toUpdate.length > 0 ? `, patched ${toUpdate.length} existing` : ''}`
        : errors.length > 0
          ? `Save failed: ${errors[0]}`
          : `Nothing to save`,
    });
  } catch (err) {
    console.error('Save route error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
