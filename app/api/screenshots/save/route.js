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

export async function POST(req) {
  try {
    const { interactions } = await req.json();
    if (!interactions?.length) return NextResponse.json({ saved: 0 });

    const now = new Date().toISOString();
    let saved = 0;
    const errors = [];

    for (const item of interactions) {
      if (!item.handle) continue;

      const platform    = (item.platform || 'instagram').toLowerCase();
      const cleanHandle = item.handle.toLowerCase().replace(/^@/, '');
      const handleCol   = `handle_${platform}`;
      const followersCol = `followers_${platform}`;
      const verifiedCol  = `verified_${platform}`;

      // ── 1. Resolve account ────────────────────────────────────────────────
      // Look up by this platform's handle
      let { data: account } = await supabase
        .from('accounts')
        .select('*')
        .eq(handleCol, cleanHandle)
        .maybeSingle();

      const incomingCategory = item.zone === 'IGNORE' ? 'IGNORE' :
        item.zone || account?.category || 'SIGNAL';

      // Skip: if already IGNORE in DB or incoming
      if (account?.category === 'IGNORE' || item.zone === 'IGNORE') {
        // Still upsert account so it stays ignored
        if (!account) {
          await supabase.from('accounts').insert({
            name:        item.name || cleanHandle,
            bio:         item.bio  || null,
            category:    'IGNORE',
            [handleCol]: cleanHandle,
            added_at:    now, updated_at: now,
          });
        } else if (incomingCategory === 'IGNORE') {
          await supabase.from('accounts').update({ category: 'IGNORE', updated_at: now }).eq('id', account.id);
        }
        continue;
      }

      const followers = item.followers || null;
      const verified  = item.verified  || false;

      if (!account) {
        // Create account
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
            added_at:       now, updated_at: now,
          })
          .select()
          .single();
        if (createErr) { errors.push(`account create ${cleanHandle}: ${createErr.message}`); continue; }
        account = created;
      } else {
        // Update account — category respects ELITE lock
        const newCategory = account.category === 'ELITE' ? 'ELITE' : incomingCategory;
        const updates = {
          updated_at:      now,
          category:        newCategory,
          [followersCol]:  followers || account[followersCol],
          [verifiedCol]:   verified  || account[verifiedCol],
          ...(item.name && !account.name ? { name: item.name } : {}),
          ...(item.bio  && !account.bio  ? { bio:  item.bio  } : {}),
          ...(item.avatar_url && !account.avatar_url ? { avatar_url: item.avatar_url } : {}),
        };
        await supabase.from('accounts').update(updates).eq('id', account.id);
        account = { ...account, ...updates };
      }

      // ── 2. Compute interaction score ──────────────────────────────────────
      const score = account.category === 'ELITE' ? 85 :
        Math.min(100, followerScore(followers) + (verified ? 15 : 0));

      // ── 3. Upsert platform_interaction ────────────────────────────────────
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

      // Profile URL by platform
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
          name:             item.name     || account.name || cleanHandle,
          followers:        followers,
          verified:         verified,
          bio:              item.bio      || account.bio || null,
          interaction_type: allTypes,
          content:          item.content?.slice(0, 500) || null,
          influence_score:  finalScore,
          zone:             account.category,
          profile_url:      profileUrls[platform] || `https://${platform}.com/${cleanHandle}`,
          on_watchlist:     account.category === 'ELITE',
          ignored:          false,
          comment_count:    (existing?.comment_count || 0) + (newType === 'comment' ? 1 : 0),
          interacted_at:    now,
          synced_at:        now,
          account_id:       account.id,
          ...(item.screenshot_id ? { screenshot_id: item.screenshot_id } : {}),
        }, { onConflict: 'platform,handle' });

      if (upsertErr) errors.push(`${cleanHandle}: ${upsertErr.message}`);
      else saved++;
    }

    return NextResponse.json({
      saved,
      errors: errors.length,
      errorDetails: errors.slice(0, 5),
      message: `Saved ${saved} interactions`,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
