import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
export const dynamic = 'force-dynamic';

// One-shot migration endpoint. Safe to call multiple times (uses IF NOT EXISTS).
// Hit POST /api/migrate once after deploying to add the tags column.
export async function POST() {
  try {
    const { error } = await supabase.rpc('run_sql', {
      query: `ALTER TABLE handles ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'`,
    });

    // If run_sql RPC doesn't exist, fall back to a direct insert trick won't work,
    // so we return a helpful message with the SQL to run manually.
    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Could not run migration automatically. Run this SQL in your Supabase SQL editor:',
        sql: `ALTER TABLE handles ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';`,
        error: error.message,
      });
    }

    return NextResponse.json({ success: true, message: 'tags column added (or already exists).' });
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: 'Run this SQL in your Supabase SQL editor:',
      sql: `ALTER TABLE handles ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';`,
      error: err.message,
    });
  }
}
