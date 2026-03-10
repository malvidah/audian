import { NextResponse } from "next/server";

const SERVICE_URL  = process.env.PLAYWRIGHT_SERVICE_URL;  // e.g. https://audian-pw.up.railway.app
const AUTH_TOKEN   = process.env.PLAYWRIGHT_AUTH_TOKEN;
const IG_COOKIES   = process.env.INSTAGRAM_COOKIES;

// In-memory cache: "platform:handle" -> { url, ts }
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 min

const PROFILE_URL = {
  instagram: h => `https://www.instagram.com/${h}/`,
  x:         h => `https://x.com/${h}`,
  youtube:   h => `https://www.youtube.com/@${h}`,
  linkedin:  h => `https://www.linkedin.com/in/${h}/`,
};

function cookiesForPlatform(platform) {
  if (platform === "instagram") {
    try { return JSON.parse(IG_COOKIES || "[]"); } catch { return []; }
  }
  return [];
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const handle   = (searchParams.get("handle") || "").replace(/^@/, "").toLowerCase();
  const platform = (searchParams.get("platform") || "instagram").toLowerCase();

  if (!handle) return NextResponse.json({ error: "handle required" }, { status: 400 });

  const cacheKey = `${platform}:${handle}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json({ url: cached.url, cached: true });
  }

  const profileUrl = PROFILE_URL[platform]?.(handle);
  if (!profileUrl) return NextResponse.json({ error: "unsupported platform" }, { status: 400 });

  if (!SERVICE_URL) {
    return NextResponse.json({ error: "PLAYWRIGHT_SERVICE_URL not configured" }, { status: 503 });
  }

  try {
    const res = await fetch(`${SERVICE_URL}/screenshot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": AUTH_TOKEN || "",
      },
      body: JSON.stringify({
        url:     profileUrl,
        cookies: cookiesForPlatform(platform),
        waitFor: 2500,
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => res.status);
      return NextResponse.json({ error: `service error: ${res.status} ${txt}` }, { status: 502 });
    }

    const { image, error } = await res.json();
    if (error) return NextResponse.json({ error }, { status: 502 });

    const dataUrl = `data:image/jpeg;base64,${image}`;
    cache.set(cacheKey, { url: dataUrl, ts: Date.now() });
    return NextResponse.json({ url: dataUrl, cached: false });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
