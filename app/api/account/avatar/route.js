import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { supabaseAdmin as supabase } from '@/lib/supabase';
export const dynamic = 'force-dynamic';

// Account profile photo — same pipeline as handle avatars.
// Stored once at account/profile.webp (upserted on each upload).
const MAX_DIM = 256;
const QUALITY = 82;

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get('file');

    if (!file) {
      return NextResponse.json({ error: 'file required' }, { status: 400 });
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, WEBP, or GIF allowed' }, { status: 400 });
    }

    const raw = Buffer.from(await file.arrayBuffer());

    const compressed = await sharp(raw)
      .resize(MAX_DIM, MAX_DIM, { fit: 'cover', position: 'centre' })
      .webp({ quality: QUALITY })
      .toBuffer();

    const storagePath = 'account/profile.webp';

    const { error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(storagePath, compressed, { contentType: 'image/webp', upsert: true });

    if (uploadErr) {
      return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(storagePath);
    // Cache-bust so the browser picks up the new image immediately
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    // Persist to user_settings so it survives page reloads
    const { error: settingsErr } = await supabase
      .from('user_settings')
      .upsert(
        { key: 'avatar_url', value: publicUrl, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );

    if (settingsErr) return NextResponse.json({ error: settingsErr.message }, { status: 500 });

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
