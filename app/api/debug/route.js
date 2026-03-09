import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Try to list tables via information_schema using rpc
  const tests = {};

  // Test 1: can we hit handles directly?
  const t1 = await supabase.from('handles').select('id').limit(1);
  tests.handles_query = t1.error ? `ERROR: ${t1.error.message}` : `OK (${t1.data?.length ?? 0} rows)`;

  // Test 2: can we hit platform_interactions?
  const t2 = await supabase.from('platform_interactions').select('id').limit(1);
  tests.platform_interactions_query = t2.error ? `ERROR: ${t2.error.message}` : `OK`;

  return NextResponse.json(tests);
}
