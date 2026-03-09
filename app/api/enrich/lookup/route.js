import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Scrape public Instagram profile page for follower count + display name.
// No auth needed — works on any public account.
async function scrapeInstagramProfile(handle) {
  try {
    // Fetch public profile page
    const res = await fetch(`https://www.instagram.com/${handle}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;
    const html = await res.text();

    // Try multiple patterns Instagram has used over the years
    let followers = null;
    let name = null;
    let verified = false;

    // Pattern 1: JSON in script tags (newer Instagram)
    const jsonMatches = html.matchAll(/<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/g);
    for (const match of jsonMatches) {
      try {
        const json = JSON.parse(match[1]);
        const str = JSON.stringify(json);

        // Look for follower count patterns
        const followerMatch = str.match(/"edge_followed_by":\{"count":(\d+)\}/) ||
                              str.match(/"follower_count":(\d+)/) ||
                              str.match(/"followers":(\d+)/);
        if (followerMatch) followers = parseInt(followerMatch[1]);

        const nameMatch = str.match(/"full_name":"([^"]+)"/) ||
                          str.match(/"name":"([^"]+)"/);
        if (nameMatch) name = nameMatch[1];

        const verifiedMatch = str.match(/"is_verified":(true|false)/);
        if (verifiedMatch) verified = verifiedMatch[1] === 'true';

        if (followers !== null) break;
      } catch {}
    }

    // Pattern 2: window._sharedData (older Instagram)
    if (followers === null) {
      const sharedDataMatch = html.match(/window\._sharedData\s*=\s*(\{.+?\});<\/script>/);
      if (sharedDataMatch) {
        try {
          const data = JSON.parse(sharedDataMatch[1]);
          const user = data?.entry_data?.ProfilePage?.[0]?.graphql?.user;
          if (user) {
            followers = user.edge_followed_by?.count ?? null;
            name = user.full_name || null;
            verified = user.is_verified || false;
          }
        } catch {}
      }
    }

    // Pattern 3: Meta tags (always present as fallback for name)
    if (!name) {
      const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/);
      if (ogTitle) {
        // og:title format: "Name (@handle) • Instagram photos and videos"
        const titleMatch = ogTitle[1].match(/^(.+?)\s*\(@/);
        if (titleMatch) name = titleMatch[1].trim();
      }
    }

    // Pattern 4: followers in meta description
    if (followers === null) {
      const descMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/);
      if (descMatch) {
        const desc = descMatch[1];
        // "X Followers, Y Following, Z Posts"
        const fMatch = desc.match(/([\d,]+)\s+Followers/i);
        if (fMatch) followers = parseInt(fMatch[1].replace(/,/g, ''));
      }
    }

    return { followers, name, verified, found: followers !== null || name !== null };
  } catch (e) {
    console.error(`scrape failed for ${handle}:`, e.message);
    return null;
  }
}

// Also try Meta Graph API business_discovery (works for business/creator accounts)
async function lookupViaGraphAPI(handle, token, igId) {
  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${igId}?fields=business_discovery.fields(followers_count,name,biography,is_verified,profile_picture_url)&username=${encodeURIComponent(handle)}&access_token=${token}`,
      { signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    const bd = data.business_discovery;
    if (!bd || data.error) return null;
    return {
      followers: bd.followers_count || null,
      name: bd.name || null,
      verified: bd.is_verified || false,
      bio: bd.biography || null,
      avatar: bd.profile_picture_url || null,
      found: true,
    };
  } catch {
    return null;
  }
}

export async function POST(req) {
  try {
    const { handles } = await req.json();
    if (!handles?.length) return NextResponse.json({ results: [] });

    // Get Instagram connection for Graph API fallback
    const { data: conns } = await supabase
      .from('platform_connections')
      .select('access_token, channel_id')
      .eq('platform', 'instagram')
      .order('connected_at', { ascending: false })
      .limit(1);
    const conn = conns?.[0];

    // Load watchlist for CORE check
    const { data: wlRows } = await supabase
      .from('watchlist')
      .select('handle')
      .eq('platform', 'instagram');
    const watchSet = new Set((wlRows || []).map(r => r.handle.toLowerCase().replace(/^@/, '')));

    const results = [];

    for (const handle of handles.slice(0, 30)) { // cap at 30 per call
      const cleanHandle = handle.toLowerCase().replace(/^@/, '');

      // Try Graph API first (faster, more reliable for creator accounts)
      let profile = null;
      if (conn?.access_token && conn?.channel_id) {
        profile = await lookupViaGraphAPI(cleanHandle, conn.access_token, conn.channel_id);
      }

      // Fall back to public page scrape
      if (!profile?.found) {
        profile = await scrapeInstagramProfile(cleanHandle);
      }

      const onWatchlist = watchSet.has(cleanHandle);
      const followers = profile?.followers ?? null;
      const verified = profile?.verified ?? false;
      const zone = onWatchlist ? 'CORE' :
        (verified || (followers || 0) >= 10000) ? 'INFLUENTIAL' : 'RADAR';

      results.push({
        handle: cleanHandle,
        name: profile?.name || null,
        followers,
        verified,
        bio: profile?.bio || null,
        avatar: profile?.avatar || null,
        zone,
        on_watchlist: onWatchlist,
        found: profile?.found ?? false,
      });

      // Small delay to avoid rate-limiting
      await new Promise(r => setTimeout(r, 400));
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error('Lookup error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
