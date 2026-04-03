import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    const handleId = form.get('handle_id');

    if (!file || !handleId) {
      return NextResponse.json({ error: 'file and handle_id required' }, { status: 400 });
    }

    // Validate type
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, WEBP, or GIF allowed' }, { status: 400 });
    }

    const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
    const storagePath = `handles/${handleId}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());

    // Upload (upsert=true replaces existing)
    const { error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(storagePath, buf, { contentType: file.type, upsert: true });

    if (uploadErr) {
      // If bucket doesn't exist yet, surface a clear message
      if (uploadErr.message?.includes('not found') || uploadErr.statusCode === 404) {
        return NextResponse.json(
          { error: 'Storage bucket "avatars" not found. Create it in Supabase Dashboard → Storage.' },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    }

    // Get public URL (add cache-busting param so browsers pick up replacements)
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(storagePath);
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    // Persist on handle record
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
