import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// POST /api/posts/merge-duplicates
// One-time migration: merges duplicate instagram posts where:
//   - source='api'          → real Instagram post_id, full caption with @handles, impressions=0
//   - source='buffer_export' → truncated content, has real impressions/likes/comments data
// For each matched pair (same day ±1, shared content prefix ≥55% similarity):
//   - Updates the 'api' row with max(likes/comments/impressions/saves/views)
//     and the longer content (api version preserves @handles + fuller text)
//   - Deletes the 'buffer_export' duplicate
// Safe to re-run — returns merged:0 once all pairs are resolved.

function normalisePrefix(content) {
  if (!content) return '';
  return content.slice(0, 40).toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}

export async function POST() {
  try {
    // Fetch all instagram posts
    const { data: posts, error } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('platform', 'instagram')
      .order('published_at', { ascending: false });

    if (error) throw error;

    const apiPosts    = posts.filter(p => p.source === 'api');
    const bufferPosts = posts.filter(p => p.source === 'buffer_export');

    const merges   = [];
    const usedBuf  = new Set();
    const usedApi  = new Set();

    for (const api of apiPosts) {
      const apiDate    = api.published_at ? api.published_at.slice(0, 10) : null;
      const apiPrefix  = normalisePrefix(api.content);
      if (!apiDate || !apiPrefix) continue;

      let bestMatch = null;
      let bestScore = 0;

      for (const buf of bufferPosts) {
        if (usedBuf.has(buf.id)) continue;
        const bufDate   = buf.published_at ? buf.published_at.slice(0, 10) : null;
        const bufPrefix = normalisePrefix(buf.content);
        if (!bufDate || !bufPrefix) continue;

        const dayDiff = Math.abs(
          (new Date(apiDate).getTime() - new Date(bufDate).getTime()) / 86400000
        );
        if (dayDiff > 1) continue;

        let sharedLen = 0;
        const minLen = Math.min(apiPrefix.length, bufPrefix.length);
        for (let i = 0; i < minLen; i++) {
          if (apiPrefix[i] === bufPrefix[i]) sharedLen++;
          else break;
        }
        const score = sharedLen / Math.max(apiPrefix.length, bufPrefix.length);
        if (score > bestScore && score >= 0.55) {
          bestScore = score;
          bestMatch = buf;
        }
      }

      if (!bestMatch || usedApi.has(api.id)) continue;

      usedBuf.add(bestMatch.id);
      usedApi.add(api.id);

      const updatedFields = {
        likes:       Math.max(api.likes       || 0, bestMatch.likes       || 0),
        comments:    Math.max(api.comments    || 0, bestMatch.comments    || 0),
        impressions: Math.max(api.impressions || 0, bestMatch.impressions || 0),
        saves:       Math.max(api.saves       || 0, bestMatch.saves       || 0),
        views:       Math.max(api.views       || 0, bestMatch.views       || 0),
        content: (api.content?.length || 0) >= (bestMatch.content?.length || 0)
          ? api.content
          : bestMatch.content,
        synced_at: new Date().toISOString(),
      };

      merges.push({ apiPost: api, bufferPost: bestMatch, updatedFields });
    }

    if (merges.length === 0) {
      return NextResponse.json({ merged: 0, message: 'No duplicate pairs found. Database is clean.' });
    }

    const results = [];
    for (const { apiPost, bufferPost, updatedFields } of merges) {
      const { error: updateErr } = await supabaseAdmin
        .from('posts')
        .update(updatedFields)
        .eq('id', apiPost.id);
      if (updateErr) throw updateErr;

      const { error: deleteErr } = await supabaseAdmin
        .from('posts')
        .delete()
        .eq('id', bufferPost.id);
      if (deleteErr) throw deleteErr;

      results.push({
        kept:        apiPost.post_id,
        deleted:     bufferPost.post_id,
        content:     updatedFields.content?.slice(0, 60),
        impressions: updatedFields.impressions,
        likes:       updatedFields.likes,
      });
    }

    return NextResponse.json({ success: true, merged: merges.length, details: results });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
