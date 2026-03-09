import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET() {
  const out = {};

  // Table counts
  for (const tbl of ['platform_comments','platform_interactions','platform_metrics','watchlist']) {
    const { count } = await supabase.from(tbl).select('*', { count: 'exact', head: true });
    out[tbl + '_count'] = count;
  }

  // Sample interactions — show ALL fields so we know what we have
  const { data: interactions } = await supabase
    .from('platform_interactions')
    .select('platform,handle,name,followers,bio,verified,interaction_type,influence_score,zone,comment_count,content,on_watchlist')
    .order('influence_score', { ascending: false })
    .limit(5);
  out.top_interactions = interactions || [];

  // Zone breakdown
  const { data: zones } = await supabase
    .from('platform_interactions')
    .select('zone');
  const zoneCounts = { CORE: 0, INFLUENTIAL: 0, RADAR: 0 };
  for (const z of (zones || [])) zoneCounts[z.zone || 'RADAR']++;
  out.zone_breakdown = zoneCounts;

  // How many have follower data?
  const { count: withFollowers } = await supabase
    .from('platform_interactions')
    .select('*', { count: 'exact', head: true })
    .gt('followers', 0);
  out.have_follower_data = withFollowers;

  // Null author comments remaining
  const { count: nullComments } = await supabase
    .from('platform_comments')
    .select('*', { count: 'exact', head: true })
    .is('author_name', null);
  out.null_author_comments = nullComments;

  return NextResponse.json(out, { headers: { 'Content-Type': 'application/json' } });
}
