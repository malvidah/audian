import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
export const dynamic = 'force-dynamic';

// Stores a compressed screenshot thumbnail and returns its ID.
// Called from the import page after parsing, before saving interactions.
// Accepts: { filename, thumbnail, mediaType, platform, interactionCount }
// thumbnail: base64 string (already compressed client-side to ~300px wide JPEG)

export async function POST(req) {
  try {
    const { filename, thumbnail, mediaType, platform, interactionCount } = await req.json();
    if (!thumbnail) return NextResponse.json({ error: 'No thumbnail' }, { status: 400 });

    const now = new Date();
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}/${Date.now()}_${safeName}`;

    // Try to upload to Supabase Storage
    let thumbnailUrl = null;
    const buf = Buffer.from(thumbnail, 'base64');
    const { error: uploadErr } = await supabase.storage
      .from('screenshots')
      .upload(storagePath, buf, {
        contentType: mediaType || 'image/jpeg',
        upsert: false,
      });

    if (!uploadErr) {
      const { data: urlData } = supabase.storage
        .from('screenshots')
        .getPublicUrl(storagePath);
      thumbnailUrl = urlData?.publicUrl || null;
    }

    // Insert record — store base64 as fallback if storage failed
    const { data, error } = await supabase
      .from('screenshots')
      .insert({
        filename,
        thumbnail_url: thumbnailUrl,
        thumbnail_data: thumbnailUrl ? null : `data:${mediaType};base64,${thumbnail}`,
        platform: platform || 'instagram',
        parsed_at: now.toISOString(),
        interaction_count: interactionCount || 0,
      })
      .select('id, thumbnail_url, thumbnail_data')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      id: data.id,
      thumbnailUrl: data.thumbnail_url || data.thumbnail_data,
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
