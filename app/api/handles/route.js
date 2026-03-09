import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error(`Missing env: url=${!!url} key=${!!key}`);
  return createClient(url, key);
}

export async function GET() {
  try {
    const supabase = getClient();

    const { data: handles, error } = await supabase
      .from('handles')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('[handles GET] supabase error:', error.message, error.code, error.details);
      return NextResponse.json({ handles: [], _error: error.message, _code: error.code });
    }

    const ids = (handles || []).map(h => h.id).filter(Boolean);
    let interactionMap = {};

    if (ids.length > 0) {
      const { data: counts, error: cErr } = await supabase
        .from('platform_interactions')
        .select('handle_id, interacted_at')
        .in('handle_id', ids)
        .order('interacted_at', { ascending: false });

      if (cErr) {
        console.error('[handles GET] interaction count error:', cErr.message);
      } else if (counts) {
        counts.forEach(r => {
          if (!interactionMap[r.handle_id]) {
            interactionMap[r.handle_id] = { count: 0, last: r.interacted_at };
          }
          interactionMap[r.handle_id].count++;
        });
      }
    }

    const enriched = (handles || []).map(h => ({
      ...h,
      interaction_count: interactionMap[h.id]?.count || 0,
      last_interaction: interactionMap[h.id]?.last || null,
    }));

    return NextResponse.json({ handles: enriched });

  } catch (err) {
    console.error('[handles GET] caught exception:', err.message, err.stack);
    return NextResponse.json({ handles: [], _error: err.message }, { status: 200 });
  }
}

export async function PATCH(req) {
  try {
    const supabase = getClient();
    const { id, updates } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const allowed = ['name','bio','zone','followed_by','avatar_url',
      'handle_instagram','handle_x','handle_youtube','handle_linkedin',
      'followers_instagram','followers_x','followers_youtube','followers_linkedin'];
    const safe = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)));
    safe.updated_at = new Date().toISOString();

    const { data, error } = await supabase.from('handles').update(safe).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ handle: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const supabase = getClient();
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const { error } = await supabase.from('handles').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
