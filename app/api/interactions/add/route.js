import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, platform, handle, interaction_type, content, mention_url, post_url, zone, interacted_at, followers } = body;

    if (!name || !platform || !interaction_type) {
      return NextResponse.json({ error: 'Name, platform, and type are required' }, { status: 400 });
    }

    const VALID_PLATFORMS = ['x', 'instagram', 'youtube', 'linkedin'];
    if (!VALID_PLATFORMS.includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const handleCol = `handle_${platform}`;
    const followersCol = `followers_${platform}`;
    const cleanHandle = handle ? handle.toLowerCase().replace(/^@/, '') : null;
    const parsedFollowers = followers ? parseInt(followers, 10) || null : null;

    // ── Look up existing handle by platform handle or name ──────────────
    let handleId = null;
    let existingHandle = null;

    if (cleanHandle) {
      const { data } = await supabase
        .from('handles')
        .select('*')
        .eq(handleCol, cleanHandle)
        .maybeSingle();
      if (data) { handleId = data.id; existingHandle = data; }
    }

    if (!handleId) {
      const { data } = await supabase
        .from('handles')
        .select('*')
        .eq('name', name)
        .maybeSingle();
      if (data) { handleId = data.id; existingHandle = data; }
    }

    if (existingHandle) {
      // ── Merge: update existing handle with any new non-empty fields ──
      const mergeUpdates = {};

      // New data from this request fills in blanks on the existing handle
      if (cleanHandle && !existingHandle[handleCol]) mergeUpdates[handleCol] = cleanHandle;
      if (parsedFollowers && parsedFollowers > (existingHandle[followersCol] || 0)) mergeUpdates[followersCol] = parsedFollowers;
      if (zone && zone !== 'SIGNAL' && existingHandle.zone !== 'ELITE') mergeUpdates.zone = zone;

      if (Object.keys(mergeUpdates).length > 0) {
        mergeUpdates.updated_at = now;
        await supabase.from('handles').update(mergeUpdates).eq('id', handleId);
      }
    } else {
      // ── Create new handle ─────────────────────────────────────────────
      const insert = {
        name,
        zone: zone || 'SIGNAL',
        added_at: now,
        updated_at: now,
      };
      if (cleanHandle) insert[handleCol] = cleanHandle;
      if (parsedFollowers) insert[followersCol] = parsedFollowers;

      const { data: created, error } = await supabase
        .from('handles')
        .insert(insert)
        .select('*')
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      handleId = created.id;
      existingHandle = created;
    }

    // ── Insert interaction ──────────────────────────────────────────────
    const { data: inserted, error: intError } = await supabase.from('interactions').insert({
      handle_id: handleId,
      platform,
      interaction_type,
      content: content?.slice(0, 2000) || null,
      mention_url: mention_url || null,
      post_url: post_url || null,
      interacted_at: interacted_at || now,
      synced_at: now,
    }).select('id').single();

    if (intError) return NextResponse.json({ error: intError.message }, { status: 500 });

    // Return full handle data so the UI can autofill
    return NextResponse.json({
      success: true,
      handle_id: handleId,
      interaction_id: inserted.id,
      handle: existingHandle,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
