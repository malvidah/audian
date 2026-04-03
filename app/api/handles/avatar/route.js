import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { supabaseAdmin as supabase } from '@/lib/supabase';
export const dynamic = 'force-dynamic';

// Profile photos are stored as 256×256 WebP at quality 82.
// Worst case ~15 KB per image — 1 GB free tier holds ~65 000 avatars.
const MAX_DIM  = 256;
const QUALITY  = 82;

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    const handleId = form.get('handle_id');

    if (!file || !handleId) {
      return NextResponse.json({ error: 'file and handle_id required' }, { status: 400 });
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, WEBP, or GIF allowed' }, { status: 400 });
    }

    const raw = Buffer.from(await file.arrayBuffer());

    // Resize to MAX_DIM × MAX_DIM (cover crop, centre) and encode as WebP
    const compressed = await sharp(raw)
      .resize(MAX_DIM, MAX_DIM, { fit: 'cover', position: 'centre' })
      .webp({ quality: QUALITY })
      .toBuffer();

    // Always store as .webp regardless of original format
    const storagePath = `handles/${handleId}.webp`;

    const { error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(storagePath, compressed, { contentType: 'image/webp', upsert: true });

    if (uploadErr) {
      if (uploadErr.message?.includes('not found') || uploadErr.statusCode === 404) {
        return NextResponse.json(
          { error: 'Storage bucket "avatars" not found. Create it in Supabase Dashboard → Storage.' },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(storagePath);
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: patchErr } = await supabase
      .from('handles')
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', handleId);

    if (patchErr) return NextResponse.json({ error: patchErr.message }, { status: 500 });

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
