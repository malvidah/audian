import { NextResponse } from "next/server";

const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN;
const INSTAGRAM_COOKIES = process.env.INSTAGRAM_COOKIES; // JSON array string

// In-memory cache: "platform:handle" -> { url, ts }
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 min

const PROFILE_URL = {
  instagram: h => `https://www.instagram.com/${h}/`,
  x:         h => `https://x.com/${h}`,
  youtube:   h => `https://www.youtube.com/@${h}`,
  linkedin:  h => `https://www.linkedin.com/in/${h}/`,
};

function getInstagramCookies() {
  try { return JSON.parse(INSTAGRAM_COOKIES || "[]"); } catch { return []; }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const handle   = (searchParams.get("handle") || "").replace(/^@/, "").toLowerCase();
  const platform = (searchParams.get("platform") || "instagram").toLowerCase();

  if (!handle)   return NextResponse.json({ error: "handle required" }, { status: 400 });
  if (!BROWSERLESS_TOKEN) return NextResponse.json({ error: "BROWSERLESS_TOKEN not set" }, { status: 500 });

  const cacheKey = `${platform}:${handle}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json({ url: cached.url, cached: true });
  }

  const profileUrl = PROFILE_URL[platform]?.(handle);
  if (!profileUrl) return NextResponse.json({ error: "unsupported platform" }, { status: 400 });

  const rawCookies = platform === "instagram" ? getInstagramCookies() : [];
  const cookies = rawCookies.map(c => ({
    name:   c.name,
    value:  c.value,
    domain: c.domain || ".instagram.com",
    path:   c.path   || "/",
  }));

  try {
    const res = await fetch(
      `https://chrome.browserless.io/screenshot?token=${BROWSERLESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: profileUrl,
          options: {
            type: "jpeg",
            quality: 82,
            fullPage: false,
            clip: { x: 0, y: 0, width: 390, height: 844 },
          },
          viewport: {
            width: 390,
            height: 844,
            isMobile: true,
            hasTouch: true,
            deviceScaleFactor: 2,
          },
          cookies,
          waitFor: 2500,
          addScriptTag: [{
            content: `setTimeout(() => {
              // Dismiss "Turn on notifications" and other dialogs
              const btns = [...document.querySelectorAll('button')];
              const dismiss = btns.find(b => /not now|dismiss|close/i.test(b.textContent));
              if (dismiss) dismiss.click();
            }, 1800);`
          }],
        }),
      }
    );

    if (!res.ok) {
      const txt = await res.text().catch(() => res.status);
      return NextResponse.json({ error: `browserless: ${res.status} ${txt}` }, { status: 502 });
    }

    const buffer  = await res.arrayBuffer();
    const base64  = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    cache.set(cacheKey, { url: dataUrl, ts: Date.now() });
    return NextResponse.json({ url: dataUrl, cached: false });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
