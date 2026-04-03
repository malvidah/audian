import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
export const dynamic = 'force-dynamic';

// Returns all distinct tags currently in use across handles, sorted alphabetically.
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('handles')
      .select('tags')
      .not('tags', 'is', null);

    if (error) return NextResponse.json({ tags: [], _error: error.message });

    const set = new Set();
    for (const row of data || []) {
      if (Array.isArray(row.tags)) {
        row.tags.forEach(t => { if (t && t.trim()) set.add(t.trim()); });
      }
    }

    return NextResponse.json({ tags: [...set].sort((a, b) => a.localeCompare(b)) });
  } catch (err) {
    return NextResponse.json({ tags: [], _error: err.message });
  }
}
