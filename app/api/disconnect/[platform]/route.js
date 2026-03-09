import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function DELETE(req, { params }) {
  try {
    const { platform } = params;

    // Verify auth token from Authorization header
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const [connResult, metricsResult, commentsResult, interactionsResult] = await Promise.all([
      supabaseAdmin.from('platform_connections').delete().eq('platform', platform),
      supabaseAdmin.from('platform_metrics').delete().eq('platform', platform),
      supabaseAdmin.from('platform_comments').delete().eq('platform', platform),
      supabaseAdmin.from('platform_interactions').delete().eq('platform', platform),
    ]);

    const err = connResult.error || metricsResult.error || commentsResult.error;
    if (err) return NextResponse.json({ error: err.message }, { status: 500 });

    return NextResponse.json({ success: true, platform });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
