import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const handle_id = searchParams.get('handle_id');

  let query = supabase
    .from('platform_interactions')
    .select('*')
    .order('interacted_at', { ascending: false })
    .limit(500);

  if (handle_id) query = query.eq('handle_id', handle_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ interactions: data || [] });
}
