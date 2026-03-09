import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export async function DELETE(req, { params }) {
  try {
    const { platform } = params;

    // Verify the user is authenticated
    const cookieStore = cookies();
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role to delete (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Cascade delete all platform data
    const [connResult, metricsResult, commentsResult, interactionsResult] = await Promise.all([
      supabaseAdmin.from('platform_connections').delete().eq('platform', platform),
      supabaseAdmin.from('platform_metrics').delete().eq('platform', platform),
      supabaseAdmin.from('platform_comments').delete().eq('platform', platform),
      supabaseAdmin.from('platform_interactions').delete().eq('platform', platform),
    ]);

    const err = connResult.error || metricsResult.error || commentsResult.error;
    if (err) return NextResponse.json({ error: err.message }, { status: 500 });

    return NextResponse.json({ success: true, platform, deleted: { metrics: true, comments: true, interactions: true } });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
