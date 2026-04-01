import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET /api/posts?platform=x&from=2026-01-01&to=2026-03-31&limit=500
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const from     = searchParams.get('from') || '2026-01-01';
    const to       = searchParams.get('to')   || new Date().toISOString();
    const limit    = parseInt(searchParams.get('limit') || '500');

    let query = supabaseAdmin
      .from('posts')
      .select('*')
      .gte('published_at', from)
      .lte('published_at', to)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (platform && platform !== 'all') {
      query = query.eq('platform', platform);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ posts: data || [] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
