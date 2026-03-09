import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function DELETE(req, { params }) {
  try {
    const { platform } = params;

    const [connResult, metricsResult, interactionsResult] = await Promise.all([
      supabaseAdmin.from('platform_connections').delete().eq('platform', platform),
      supabaseAdmin.from('platform_metrics').delete().eq('platform', platform),
      supabaseAdmin.from('interactions').delete().eq('platform', platform),
    ]);

    const err = connResult.error || metricsResult.error || interactionsResult.error;
    if (err) return NextResponse.json({ error: err.message }, { status: 500 });

    return NextResponse.json({ success: true, platform });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
