import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  const results = {};

  // 1. Check env vars
  results.env = {
    supabase_url:  !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    service_key:   !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    apify_key:     !!process.env.APIFY_API_KEY,
    app_url:       process.env.NEXT_PUBLIC_APP_URL || '(not set)',
  };

  // 2. Count rows in each table
  for (const tbl of ['platform_connections','platform_comments','platform_interactions','platform_metrics','watchlist']) {
    const { count, error } = await supabase.from(tbl).select('*', { count: 'exact', head: true });
    results[tbl] = error ? `ERROR: ${error.message}` : count;
  }

  // 3. Get column names for platform_interactions
  const { data: cols, error: colErr } = await supabase
    .rpc('get_table_columns', { table_name: 'platform_interactions' })
    .select('*');
  
  // Fallback: try a select to see what columns exist
  const { data: sample, error: sampleErr } = await supabase
    .from('platform_interactions').select('*').limit(1);
  results.interactions_sample = sampleErr
    ? `ERROR: ${sampleErr.message}`
    : sample?.length > 0 ? Object.keys(sample[0]) : '(empty — checking schema via insert test)';

  // 4. Test upsert with minimal data
  const { error: upsertErr } = await supabase.from('platform_interactions').upsert({
    platform: 'test',
    handle: '__debug_test__',
    interaction_type: 'comment',
    influence_score: 1,
    zone: 'RADAR',
    synced_at: new Date().toISOString(),
    interacted_at: new Date().toISOString(),
  }, { onConflict: 'platform,handle' });

  results.upsert_test = upsertErr ? `FAILED: ${upsertErr.message}` : 'OK';

  // 5. Clean up test row
  await supabase.from('platform_interactions')
    .delete().eq('handle', '__debug_test__');

  // 6. Sample IG comments
  const { data: igComments, error: igErr } = await supabase
    .from('platform_comments').select('author_name,content').eq('platform','instagram').limit(3);
  results.ig_comments_sample = igErr ? `ERROR: ${igErr.message}` : igComments;

  return NextResponse.json(results, { status: 200 });
}
