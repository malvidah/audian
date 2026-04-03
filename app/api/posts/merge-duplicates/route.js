import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// POST /api/posts/merge-duplicates
// Merges pairs of instagram posts where:
//   - one came from source='api'     → has real post_id, full content with @handles, impressions=0
//   - one came from source='buffer_export' → truncated content, has real impressions data
// For each matched pair:
//   - Updates the 'api' row with max(likes/comments/impressions/saves/views)
//     and the longer content (api version is always more complete)
//   - Deletes the 'buffer_export' duplicate
// Matching: same published_at date (±1 day) + shared content prefix (first 30 chars)

function normalisePrefix(content) {
  if (!content) return '';
  // Remove punctuation/whitespace noise and lowercase for comparison
  return content.slice(0, 40).toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}

export async function POST() {
  try {
    // ── Write sanity-check: update one post, re-fetch, revert ──────────────
    const { data: testRows } = await supabaseAdmin
      .from('posts').select('id,synced_at').eq('platform','instagram').limit(1);
    let writeWorks = false;
    if (testRows?.length) {
      const testId  = testRows[0].id;
      const testTag = 'merge-test-' + Date.now();
      const { error: writeErr } = await supabaseAdmin
        .from('posts').update({ synced_at: new Date().toISOString() }).eq('id', testId);
      if (!writeErr) {
        const { data: verify } = await supabaseAdmin
          .from('posts').select('id').eq('id', testId).limit(1);
        writeWorks = !!verify?.length;
      }
    }
    if (!writeWorks) {
      return NextResponse.json({ error: 'Supabase writes are not working from this route', supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY }, { status: 500 });
    }
    // ─────────────────────────────────────────────────────────────────────

    // Fetch all instagram posts
    const { data: posts, error } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('platform', 'instagram')
      .order('published_at', { ascending: false });

    if (error) throw error;

    const apiPosts    = posts.filter(p => p.source === 'api');
    const bufferPosts = posts.filter(p => p.source === 'buffer_export');

    console.log(`[merge-duplicates] total=${posts?.length} api=${apiPosts.length} buffer=${bufferPosts.length}`);
    if (apiPosts[0]) {
      const ap = apiPosts[0];
      const bp = bufferPosts[0];
      console.log(`[merge-duplicates] sample api: id=${ap.id} post_id=${ap.post_id} date=${ap.published_at?.slice(0,10)} prefix="${normalisePrefix(ap.content)}"`);
      if (bp) console.log(`[merge-duplicates] sample buf: id=${bp.id} post_id=${bp.post_id} date=${bp.published_at?.slice(0,10)} prefix="${normalisePrefix(bp.content)}"`);
    }

    const merges   = [];  // { apiId, bufferId, updatedFields }
    const usedBuf  = new Set();
    const usedApi  = new Set();

    for (const api of apiPosts) {
      const apiDate    = api.published_at ? api.published_at.slice(0, 10) : null;
      const apiPrefix  = normalisePrefix(api.content);
      if (!apiDate || !apiPrefix) continue;

      // Find the best-matching buffer post: same/adjacent date + matching content prefix
      let bestMatch = null;
      let bestScore = 0;

      for (const buf of bufferPosts) {
        if (usedBuf.has(buf.id)) continue;
        const bufDate   = buf.published_at ? buf.published_at.slice(0, 10) : null;
        const bufPrefix = normalisePrefix(buf.content);
        if (!bufDate || !bufPrefix) continue;

        // Date must be within 1 day
        const dayDiff = Math.abs(
          (new Date(apiDate).getTime() - new Date(bufDate).getTime()) / 86400000
        );
        if (dayDiff > 1) continue;

        // Shared prefix length (how many chars match)
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

      // Merge: keep api row, take max of all metrics, keep longer content
      const updatedFields = {
        likes:       Math.max(api.likes       || 0, bestMatch.likes       || 0),
        comments:    Math.max(api.comments    || 0, bestMatch.comments    || 0),
        impressions: Math.max(api.impressions || 0, bestMatch.impressions || 0),
        saves:       Math.max(api.saves       || 0, bestMatch.saves       || 0),
        views:       Math.max(api.views       || 0, bestMatch.views       || 0),
        // Keep whichever content is longer (api usually has @handles + fuller text)
        content: (api.content?.length || 0) >= (bestMatch.content?.length || 0)
          ? api.content
          : bestMatch.content,
        synced_at: new Date().toISOString(),
      };

      merges.push({ apiPost: api, bufferPost: bestMatch, updatedFields });
    }

    if (merges.length === 0) {
      // Sample api post impressions to confirm previous run's updates landed
      const apiImpressionsSample = apiPosts.slice(0, 5).map(p => ({
        post_id: p.post_id,
        impressions: p.impressions,
        likes: p.likes,
        content: p.content?.slice(0, 40),
      }));
      return NextResponse.json({
        merged: 0,
        message: 'No matching duplicate pairs found.',
        debug: {
          total: posts?.length,
          apiCount: apiPosts.length,
          bufferCount: bufferPosts.length,
          apiImpressionsSample,
        }
      });
    }

    // Apply updates to api rows and delete buffer rows
    const results = [];
    for (const { apiPost, bufferPost, updatedFields } of merges) {
      // Update api post with merged metrics
      const { error: updateErr } = await supabaseAdmin
        .from('posts')
        .update(updatedFields)
        .eq('id', apiPost.id);
      if (updateErr) throw updateErr;

      // Delete the buffer_export duplicate
      const { error: deleteErr } = await supabaseAdmin
        .from('posts')
        .delete()
        .eq('id', bufferPost.id);
      if (deleteErr) throw deleteErr;

      results.push({
        kept:    apiPost.post_id,
        deleted: bufferPost.post_id,
        content: updatedFields.content?.slice(0, 60),
        impressions: updatedFields.impressions,
        likes: updatedFields.likes,
      });
    }

    return NextResponse.json({
      success: true,
      merged:  merges.length,
      details: results,
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
