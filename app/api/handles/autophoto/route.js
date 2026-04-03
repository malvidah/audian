import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { supabaseAdmin as supabase } from '@/lib/supabase';
export const dynamic = 'force-dynamic';

const MAX_DIM = 256;
const QUALITY = 82;

/** "David Epstein" → "david-epstein" */
function nameToSlug(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Extract the best author photo URL from a Big Think author page HTML.
 * Priority:
 *  1. JSON-LD @type=Person → image.url / image (string)
 *  2. <meta property="og:image"> — on author pages this is usually the headshot
 *  3. Any <img> whose src contains the slug (author-specific asset)
 */
function extractPhotoUrl(html, slug) {
  // 1. JSON-LD Person
  const ldMatches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const m of ldMatches) {
    try {
      const data = JSON.parse(m[1]);
      const nodes = Array.isArray(data['@graph']) ? data['@graph'] : [data];
      for (const node of nodes) {
        if (node['@type'] === 'Person' || node['@type']?.includes?.('Person')) {
          const img = node.image;
          if (typeof img === 'string' && img.startsWith('http')) return img;
          if (img?.url) return img.url;
          if (img?.contentUrl) return img.contentUrl;
        }
      }
    } catch {}
  }

  // 2. og:image
  const ogMatch =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (ogMatch?.[1]?.startsWith('http')) return ogMatch[1];

  // 3. img src containing slug
  const imgMatch = html.match(new RegExp(`<img[^>]+src=["']([^"']*${slug}[^"']*)["']`, 'i'));
  if (imgMatch?.[1]?.startsWith('http')) return imgMatch[1];

  return null;
}

export async function POST(req) {
  try {
    const { handle_id, name } = await req.json();
    if (!handle_id || !name) {
      return NextResponse.json({ error: 'handle_id and name required' }, { status: 400 });
    }

    const slug = nameToSlug(name);
    const authorUrl = `https://bigthink.com/authors/${slug}/`;

    // Fetch the Big Think author page
    const pageRes = await fetch(authorUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Audian/1.0)' },
      redirect: 'follow',
    });

    if (!pageRes.ok) {
      return NextResponse.json(
        { error: `No author page found for "${name}" (tried ${authorUrl})` },
        { status: 404 }
      );
    }

    const html = await pageRes.text();
    const photoUrl = extractPhotoUrl(html, slug);

    if (!photoUrl) {
      return NextResponse.json(
        { error: `Author page found but no photo detected for "${name}"` },
        { status: 404 }
      );
    }

    // Download the photo
    const imgRes = await fetch(photoUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Audian/1.0)' },
    });
    if (!imgRes.ok) {
      return NextResponse.json({ error: 'Could not download photo' }, { status: 500 });
    }

    const raw = Buffer.from(await imgRes.arrayBuffer());

    // Compress to 256×256 WebP
    const compressed = await sharp(raw)
      .resize(MAX_DIM, MAX_DIM, { fit: 'cover', position: 'centre' })
      .webp({ quality: QUALITY })
      .toBuffer();

    const storagePath = `handles/${handle_id}.webp`;

    const { error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(storagePath, compressed, { contentType: 'image/webp', upsert: true });

    if (uploadErr) {
      return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(storagePath);
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    await supabase
      .from('handles')
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', handle_id);

    return NextResponse.json({ url: publicUrl, source: authorUrl });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
