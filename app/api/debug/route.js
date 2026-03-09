import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  const out = {};

  // Hard delete null-author comments via RPC to bypass any RLS
  const { error: delErr } = await supabase.rpc('exec_sql', {
    sql: "DELETE FROM platform_comments WHERE author_name IS NULL"
  }).single();

  // Fallback: direct delete if RPC doesn't exist
  const { error: delErr2 } = await supabase
    .from('platform_comments')
    .delete()
    .is('author_name', null);

  out.cleanup = delErr2 ? `error: ${delErr2.message}` : 'attempted';

  // Counts using service role (bypasses RLS)
  for (const tbl of ['platform_comments','platform_interactions','platform_metrics','watchlist']) {
    const { count, error } = await supabase
      .from(tbl)
      .select('*', { count: 'exact', head: true });
    out[tbl] = error ? `ERR: ${error.message}` : count;
  }

  // Sample comments with any author_name
  const { data: comments, error: cErr } = await supabase
    .from('platform_comments')
    .select('platform,author_name,content')
    .not('author_name', 'is', null)
    .limit(5);
  out.comments_with_author = cErr ? `ERR: ${cErr.message}` : (comments || []);

  // Sample null comments still remaining
  const { count: nullCount } = await supabase
    .from('platform_comments')
    .select('*', { count: 'exact', head: true })
    .is('author_name', null);
  out.null_author_comments_remaining = nullCount;

  return NextResponse.json(out);
}
