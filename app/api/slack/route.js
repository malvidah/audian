import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// ─── Slack signature verification ────────────────────────────────────────────
async function verifySlackSignature(req, rawBody) {
  const secret = process.env.SLACK_SIGNING_SECRET;
  if (!secret) return false;
  const timestamp = req.headers.get('x-slack-request-timestamp');
  const slackSig  = req.headers.get('x-slack-signature');
  if (!timestamp || !slackSig) return false;
  if (Math.abs(Date.now() / 1000 - parseInt(timestamp, 10)) > 300) return false;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`v0:${timestamp}:${rawBody}`);
  const computed = `v0=${hmac.digest('hex')}`;
  try { return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(slackSig)); }
  catch { return false; }
}

// ─── URL extraction ───────────────────────────────────────────────────────────
// Slack wraps URLs as <https://...> or <https://...|display text>
function extractUrls(text = '') {
  const matches = [...text.matchAll(/<(https?:\/\/[^|>]+)[|>]/g)];
  return matches.map(m => m[1]);
}

function platformFromUrl(url) {
  if (!url) return null;
  if (url.includes('linkedin.com'))  return 'linkedin';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'x';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  return null;
}

// Extract @handle from X/Twitter post URLs: x.com/handle/status/123
function handleFromUrl(url) {
  const xMatch = url.match(/(?:twitter\.com|x\.com)\/([A-Za-z0-9_]+)\/status\//);
  if (xMatch) return xMatch[1].toLowerCase();
  const igMatch = url.match(/instagram\.com\/([A-Za-z0-9_.]+)\//);
  if (igMatch && igMatch[1] !== 'p') return igMatch[1].toLowerCase();
  return null;
}

// ─── Screenshot downloader ───────────────────────────────────────────────────
// Slack serves uploaded files at private URLs that require bot token auth.
// Returns { data: base64string, mediaType: 'image/png' } or null.
async function downloadSlackImage(file) {
  const botToken = process.env.SLACK_BOT_TOKEN;
  if (!botToken || !file?.url_private) return null;

  // Only handle image types Claude supports
  const supported = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
  if (!supported.includes(file.mimetype)) return null;

  // Skip huge files (> 8 MB) to stay within Claude's limits
  if (file.size > 8 * 1024 * 1024) return null;

  try {
    const res = await fetch(file.url_private, {
      headers: { Authorization: `Bearer ${botToken}` },
    });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const base64 = Buffer.from(buf).toString('base64');
    return { data: base64, mediaType: file.mimetype };
  } catch (err) {
    console.error('[slack] image download failed:', err.message);
    return null;
  }
}

// ─── AI parsing ───────────────────────────────────────────────────────────────
// Sends message text + link previews + any screenshot to Claude for extraction.
async function parseWithClaude(event) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  // Clean Slack formatting from text
  const rawText = (event.text || '')
    .replace(/<@[A-Z0-9]+\|([^>]+)>/g, '@$1')
    .replace(/<#[A-Z0-9]+\|([^>]+)>/g, '#$1')
    .replace(/<(https?:\/\/[^|>]+)\|([^>]+)>/g, '$2 ($1)')
    .replace(/<(https?:\/\/[^>]+)>/g, '$1')
    .trim();

  // Gather context from Slack's link unfurls
  const attachmentContext = (event.attachments || []).map(a => {
    const parts = [];
    if (a.title)       parts.push(`Title: ${a.title}`);
    if (a.title_link)  parts.push(`URL: ${a.title_link}`);
    if (a.text)        parts.push(`Text: ${a.text}`);
    if (a.author_name) parts.push(`Author: ${a.author_name}`);
    return parts.join(' | ');
  }).filter(Boolean).join('\n');

  const textContext = [rawText, attachmentContext].filter(Boolean).join('\n\nLink preview:\n');

  // Try to download the first image file attachment (screenshot)
  const imageFiles = (event.files || []).filter(f => f.mimetype?.startsWith('image/'));
  const image = imageFiles.length > 0 ? await downloadSlackImage(imageFiles[0]) : null;

  const prompt = `You monitor a Slack channel where the Big Think social media team logs when notable people mention, share, or engage with Big Think content online.

Analyze this Slack message${image ? ' and the attached screenshot' : ''} and extract the interaction data. Return ONLY a JSON object — no explanation, no markdown.

Message:
${textContext || '(no text — see screenshot)'}

Return this JSON shape:
{
  "name": "Person's full name, or null if unclear",
  "handle": "Social media username without @, or null if not visible",
  "platform": "One of: x, instagram, youtube, linkedin — infer from URL, screenshot, or context. Null if unknown.",
  "interaction_type": "One of: mention, comment, repost, like, follow, tag, collaboration — pick the best fit",
  "content": "One sentence describing what they did, e.g. 'Shared Big Think article about AI ethics' or null",
  "mention_url": "Direct URL to the social post if present in text, or null"
}

Rules:
- Read the screenshot carefully — the person's name, handle (@username), platform logo, and post content are often visible there
- If someone shared/reposted a Big Think article with no commentary, use "repost"; if they added their own text, use "mention"
- LinkedIn posts where someone writes about Big Think = "mention"
- If you genuinely cannot determine name AND platform, return null instead of the JSON object`;

  // Build message content — text always included, image added if available
  const userContent = image
    ? [
        { type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.data } },
        { type: 'text', text: prompt },
      ]
    : prompt;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{ role: 'user', content: userContent }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text?.trim();
    if (!text) return null;

    const json = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(json);
    if ((!parsed.name && !parsed.handle) || !parsed.platform) return null;
    return parsed;
  } catch (err) {
    console.error('[slack] Claude parse error:', err.message);
    return null;
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req) {
  const rawBody = await req.text();

  let body;
  try { body = JSON.parse(rawBody); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  // Slack URL verification challenge (one-time setup handshake)
  if (body.type === 'url_verification') {
    return NextResponse.json({ challenge: body.challenge });
  }

  // Verify signature
  const valid = await verifySlackSignature(req, rawBody);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = body.event;
  if (!event || event.type !== 'message') return NextResponse.json({ ok: true });

  // Ignore bot messages, edits, deletes, thread replies
  if (event.subtype || event.bot_id || event.thread_ts) return NextResponse.json({ ok: true });

  // Skip empty messages
  const hasText  = event.text?.trim();
  const hasFiles = event.files?.length > 0;
  if (!hasText && !hasFiles) return NextResponse.json({ ok: true });

  // ── Quick platform/handle sniff from URLs before hitting AI ──
  const urls = extractUrls(event.text || '');
  const urlPlatform = urls.map(platformFromUrl).find(Boolean) || null;
  const urlHandle   = urls.map(handleFromUrl).find(Boolean)   || null;

  // ── AI extraction ──
  const parsed = await parseWithClaude(event);
  if (!parsed) {
    console.log('[slack] could not parse message, skipping');
    return NextResponse.json({ ok: true });
  }

  // URL sniff fills in blanks AI might miss (e.g. handle in X URL)
  const platform    = parsed.platform || urlPlatform;
  const handle      = (parsed.handle  || urlHandle  || '').toLowerCase().replace(/^@/, '') || null;
  const name        = parsed.name || handle || 'Unknown';
  const type        = parsed.interaction_type || 'mention';
  const content     = parsed.content   || null;
  const mentionUrl  = parsed.mention_url || urls[0] || null;

  if (!platform) {
    console.log('[slack] no platform detected, skipping');
    return NextResponse.json({ ok: true });
  }

  const now       = new Date().toISOString();
  const handleCol = `handle_${platform}`;

  // ── Look up or create handle ──
  let handleId = null;

  // Try by social handle first, then by name
  if (handle) {
    const { data } = await supabase
      .from('handles')
      .select('id')
      .eq(handleCol, handle)
      .maybeSingle();
    if (data) handleId = data.id;
  }

  if (!handleId) {
    const { data } = await supabase
      .from('handles')
      .select('id')
      .ilike('name', name)
      .maybeSingle();
    if (data) handleId = data.id;
  }

  if (!handleId) {
    const insert = { name, zone: 'ELITE', added_at: now, updated_at: now };
    if (handle) insert[handleCol] = handle;

    const { data: created, error: createErr } = await supabase
      .from('handles')
      .insert(insert)
      .select('id')
      .single();

    if (createErr) {
      console.error('[slack] handle create failed:', createErr.message);
      return NextResponse.json({ error: createErr.message }, { status: 500 });
    }
    handleId = created.id;
  }

  // ── Insert interaction ──
  const { error: intErr } = await supabase.from('interactions').insert({
    handle_id:        handleId,
    platform,
    interaction_type: type,
    content:          content?.slice(0, 2000) || null,
    mention_url:      mentionUrl || null,
    interacted_at:    now,
    synced_at:        now,
  });

  if (intErr) {
    console.error('[slack] interaction insert failed:', intErr.message);
    return NextResponse.json({ error: intErr.message }, { status: 500 });
  }

  console.log(`[slack] logged ${type} from ${name} (${handle || 'no handle'}) on ${platform}`);
  return NextResponse.json({ ok: true });
}
