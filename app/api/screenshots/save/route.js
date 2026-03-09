import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
export const dynamic = 'force-dynamic';

function followerScore(f) {
  if (!f) return 5;
  if (f >= 1_000_000) return 60;
  if (f >= 500_000)   return 52;
  if (f >= 100_000)   return 42;
  if (f >= 50_000)    return 34;
  if (f >= 10_000)    return 26;
  if (f >= 1_000)     return 16;
  if (f >= 100)       return 8;
  return 3;
}

// Try accounts table — fail gracefully if it doesn't exist yet
async function resolveAccount(platform, cleanHandle, item, now) {
  try {
    const handleCol    = `handle_${platform}`;
    const followersCol = `followers_${platform}`;
    const verifiedCol  = `verified_${platform}`;
    const incomingCategory = item.zone || 'IGNORE'; // trust frontend computeZone

    let { data: account, error: fetchErr } = await supabase
      .from('accounts')
      .select('*')
      .eq(handleCol, cleanHandle)
      .maybeSingle();

    if (fetchErr) return null; // table doesn't exist yet — skip accounts layer

    const followers = item.followers || null;
    const verified  = item.verified  || false;

    if (!account) {
      const { data: created, error: createErr } = await supabase
        .from('accounts')
        .insert({
          name:           item.name || cleanHandle,
          bio:            item.bio  || null,
          category:       incomingCategory,
          [handleCol]:    cleanHandle,
          [followersCol]: followers,
          [verifiedCol]:  verified,
          avatar_url:     item.avatar_url || null,
          added_at: now, updated_at: now,
        })
        .select().single();
      if (createErr) return null;
      return created;
    } else {
      const newCategory = account.category === 'ELITE' ? 'ELITE' : incomingCategory;
      const updates = {
        updated_at:      now,
        category:        newCategory,
        [followersCol]:  item.followers || account[followersCol],
        [verifiedCol]:   item.verified  || account[verifiedCol],
        ...(item.name && !account.name ? { name: item.name } : {}),
        ...(item.bio  && !account.bio  ? { bio:  item.bio  } : {}),
      };
      await supabase.from('accounts').update(updates).eq('id', account.id);
      return { ...account, ...updates };
    }
  } catch {
    return null; // accounts table missing — ok, save continues
  }
}

export async function POST(req) {
  try {
    const { interactions } = await req.json();
    if (!interactions?.length) return NextResponse.json({ saved: 0 });

    const now = new Date().toISOString();
    let saved = 0;
    const errors = [];

    // Save all non-IGNORE items
    const toSave = interactions.filter(i => i.handle && i.zone !== 'IGNORE');

    for (const item of toSave) {
      const platform    = (item.platform || 'instagram').toLowerCase();
      const cleanHandle = item.handle.toLowerCase().replace(/^@/, '');

      // Try to maintain accounts table (best-effort — works even if table missing)
      const account = await resolveAccount(platform, cleanHandle, item, now);

      const followers = item.followers || null;
      const verified  = item.verified  || false;
      const zone      = account?.category || item.zone || 'IGNORE';
      const score     = zone === 'ELITE' ? 85 :
        Math.min(100, followerScore(followers) + (verified ? 15 : 0));

      // Get existing interaction to merge types
      const { data: existing } = await supabase
        .from('platform_interactions')
        .select('interaction_type, influence_score, comment_count')
        .eq('platform', platform)
        .eq('handle', cleanHandle)
        .maybeSingle();

      const existingTypes = existing?.interaction_type?.split(',') || [];
      const newType       = item.interaction_type || 'unknown';
      const allTypes      = [...new Set([...existingTypes, newType])].join(',');
      const finalScore    = Math.max(score, existing?.influence_score || 0);

      const profileUrls = {
        instagram: `https://instagram.com/${cleanHandle}`,
        x:         `https://x.com/${cleanHandle}`,
        youtube:   `https://youtube.com/@${cleanHandle}`,
        linkedin:  `https://linkedin.com/in/${cleanHandle}`,
      };

      const { error: upsertErr } = await supabase
        .from('platform_interactions')
        .upsert({
          platform,
          handle:           cleanHandle,
          name:             item.name  || account?.name || cleanHandle,
          followers,
          verified,
          bio:              item.bio   || account?.bio  || null,
          interaction_type: allTypes,
          content:          item.content?.slice(0, 500) || null,
          influence_score:  finalScore,
          zone,
          profile_url:      profileUrls[platform] || `https://${platform}.com/${cleanHandle}`,
          on_watchlist:     zone === 'ELITE',
          ignored:          false,
          comment_count:    (existing?.comment_count || 0) + (newType === 'comment' ? 1 : 0),
          interacted_at:    now,
          synced_at:        now,
          ...(account?.id          ? { account_id:    account.id }          : {}),
          ...(item.screenshot_id   ? { screenshot_id: item.screenshot_id }  : {}),
        }, { onConflict: 'platform,handle' });

      if (upsertErr) errors.push(`${cleanHandle}: ${upsertErr.message}`);
      else saved++;
    }

    return NextResponse.json({
      saved,
      skipped: interactions.length - toSave.length,
      errors: errors.length,
      errorDetails: errors.slice(0, 5),
      message: saved > 0
        ? `Saved ${saved} interaction${saved !== 1 ? 's' : ''}`
        : errors.length > 0
          ? `Save failed: ${errors[0]}`
          : `Nothing to save (${interactions.length - toSave.length} were IGNORE)`,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
