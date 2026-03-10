import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { filename, thumbnail, mediaType, platform, interactionCount } = await req.json();
    if (!thumbnail) return NextResponse.json({ error: 'No thumbnail' }, { status: 400 });

    const now = new Date();
    const safeName = (filename || 'screenshot').replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}/${Date.now()}_${safeName}`;

    // Try storage upload — fail silently if bucket doesn't exist
    let thumbnailUrl = null;
    try {
      const buf = Buffer.from(thumbnail, 'base64');
      const { error: uploadErr } = await supabase.storage
        .from('screenshots')
        .upload(storagePath, buf, { contentType: mediaType || 'image/jpeg', upsert: false });
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from('screenshots').getPublicUrl(storagePath);
        thumbnailUrl = urlData?.publicUrl || null;
      }
    } catch {}

    // Try inserting into screenshots table — if it doesn't exist, return a temp id
    const { data, error } = await supabase
      .from('screenshots')
      .insert({
        filename: filename || safeName,
        thumbnail_url:  thumbnailUrl,
        thumbnail_data: thumbnailUrl ? null : `data:${mediaType};base64,${thumbnail}`,
        platform: platform || 'instagram',
        parsed_at: now.toISOString(),
        interaction_count: interactionCount || 0,
      })
      .select('id, thumbnail_url, thumbnail_data')
      .single();

    if (error) {
      // Screenshots table may not exist — return a synthetic id so import can continue
      console.error('[store] screenshots insert error:', error.message);
      return NextResponse.json({
        id: `temp_${Date.now()}`,
        thumbnailUrl: thumbnailUrl || `data:${mediaType};base64,${thumbnail}`,
      });
    }

    return NextResponse.json({
      id: data.id,
      thumbnailUrl: data.thumbnail_url || data.thumbnail_data,
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
