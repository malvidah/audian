import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
export const dynamic = 'force-dynamic';

function normPlatforms(platforms) {
  const arr = Array.isArray(platforms) ? platforms : (platforms ? [platforms] : []);
  return arr.filter(Boolean).sort().join(',');
}

// GET /api/audience/saved?dateFrom=X&dateTo=Y&platforms=instagram,x
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const dateFrom  = searchParams.get('dateFrom') || null;
    const dateTo    = searchParams.get('dateTo')   || null;
    const platforms = normPlatforms(searchParams.get('platforms')?.split(',').filter(Boolean) || []);

    let query = supabaseAdmin
      .from('audience_insights_saved')
      .select('*')
      .eq('platforms', platforms)
      .order('created_at', { ascending: false });

    if (dateFrom) query = query.eq('date_from', dateFrom);
    else          query = query.is('date_from', null);
    if (dateTo)   query = query.eq('date_to', dateTo);
    else          query = query.is('date_to', null);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ reports: data || [] });
  } catch (e) {
    return NextResponse.json({ reports: [], error: e.message }, { status: 500 });
  }
}

// POST /api/audience/saved  — save a new report
export async function POST(req) {
  try {
    const { dateFrom, dateTo, platforms, commentCount, insights } = await req.json();
    const platformStr = normPlatforms(platforms);

    const { data, error } = await supabaseAdmin
      .from('audience_insights_saved')
      .insert({
        date_from:     dateFrom || null,
        date_to:       dateTo   || null,
        platforms:     platformStr,
        comment_count: commentCount || null,
        insights:      insights,
      })
      .select('*')
      .single();

    if (error) throw error;
    return NextResponse.json({ report: data });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
