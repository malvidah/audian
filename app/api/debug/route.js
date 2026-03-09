import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// One-shot: cleans null-author comments, returns table counts
export async function GET() {
  const deleted = await supabase
    .from('platform_comments')
    .delete()
    .is('author_name', null);

  const counts = {};
  for (const tbl of ['platform_comments','platform_interactions','platform_metrics','platform_connections','watchlist']) {
    const { count } = await supabase.from(tbl).select('*', { count: 'exact', head: true });
    counts[tbl] = count;
  }

  const { data: sample } = await supabase
    .from('platform_comments')
    .select('platform,author_name,content')
    .limit(5);

  return NextResponse.json({
    deleted_null_comments: deleted.count ?? '(check)',
    counts,
    comment_sample: sample,
  });
}
