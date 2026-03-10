import express from "express";
import { chromium } from "playwright";

const app  = express();
const PORT = process.env.PORT || 3001;
const AUTH_TOKEN = process.env.AUTH_TOKEN || "changeme";

app.use(express.json({ limit: "2mb" }));

// ── Auth middleware ────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const token = req.headers["x-auth-token"] || req.query.token;
  if (token !== AUTH_TOKEN) return res.status(401).json({ error: "unauthorized" });
  next();
});

// ── Browser pool (one persistent browser, new context per request) ─────────────
let browser = null;
async function getBrowser() {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-blink-features=AutomationControlled",
      ],
    });
  }
  return browser;
}

async function withContext(cookiesJson, fn) {
  const b   = await getBrowser();
  const ctx = await b.newContext({
    viewport: { width: 390, height: 844 },
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) " +
      "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
    locale: "en-US",
  });

  // Inject cookies
  const cookies = typeof cookiesJson === "string" ? JSON.parse(cookiesJson) : cookiesJson;
  if (cookies?.length) {
    await ctx.addCookies(
      cookies.map((c) => ({
        name:   c.name,
        value:  c.value,
        domain: c.domain || ".instagram.com",
        path:   c.path   || "/",
        secure: c.secure ?? true,
        httpOnly: c.httpOnly ?? false,
        sameSite: c.sameSite === "no_restriction" ? "None"
                : c.sameSite === "lax"            ? "Lax"
                : c.sameSite === "strict"          ? "Strict"
                : "None",
      }))
    );
  }

  try {
    return await fn(ctx);
  } finally {
    await ctx.close();
  }
}

// ── POST /screenshot ───────────────────────────────────────────────────────────
// Body: { url, cookies, waitFor?, selector? }
// Returns: { image: "<base64 jpeg>" }
app.post("/screenshot", async (req, res) => {
  const { url, cookies, waitFor = 2500, selector } = req.body;
  if (!url) return res.status(400).json({ error: "url required" });

  try {
    const image = await withContext(cookies, async (ctx) => {
      const page = await ctx.newPage();

      // Prevent Instagram from detecting automation
      await page.addInitScript(() => {
        Object.defineProperty(navigator, "webdriver", { get: () => undefined });
      });

      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.waitForTimeout(waitFor);

      // Dismiss dialogs (notifications prompt, cookie banner, etc.)
      for (const text of ["Not Now", "Not now", "Dismiss", "Close"]) {
        const btn = page.getByRole("button", { name: text, exact: false });
        if (await btn.isVisible().catch(() => false)) {
          await btn.click().catch(() => {});
          await page.waitForTimeout(400);
        }
      }

      if (selector) {
        const el = page.locator(selector).first();
        await el.waitFor({ timeout: 5000 }).catch(() => {});
        return await el.screenshot({ type: "jpeg", quality: 82 });
      }

      return await page.screenshot({
        type: "jpeg",
        quality: 82,
        clip: { x: 0, y: 0, width: 390, height: 844 },
      });
    });

    res.json({ image: image.toString("base64") });
  } catch (err) {
    console.error("screenshot error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /scrape ───────────────────────────────────────────────────────────────
// Body: { url, cookies, waitFor?, extract }
// extract: "profile" | "mentions" | "post_interactions" | "raw_text"
// Returns: { data: {...} }
app.post("/scrape", async (req, res) => {
  const { url, cookies, waitFor = 3000, extract = "raw_text" } = req.body;
  if (!url) return res.status(400).json({ error: "url required" });

  try {
    const data = await withContext(cookies, async (ctx) => {
      const page = await ctx.newPage();

      await page.addInitScript(() => {
        Object.defineProperty(navigator, "webdriver", { get: () => undefined });
      });

      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.waitForTimeout(waitFor);

      // Dismiss overlays
      for (const text of ["Not Now", "Not now", "Dismiss", "Close"]) {
        const btn = page.getByRole("button", { name: text, exact: false });
        if (await btn.isVisible().catch(() => false)) {
          await btn.click().catch(() => {});
          await page.waitForTimeout(300);
        }
      }

      if (extract === "profile") {
        return await page.evaluate(() => {
          const getText = (sel) => document.querySelector(sel)?.textContent?.trim() ?? null;
          const getMeta = (prop) =>
            document.querySelector(`meta[property="${prop}"]`)?.content ?? null;

          // Follower / following / posts counts
          const statEls = [...document.querySelectorAll("li span span, section ul li span")];
          const stats   = statEls.map((el) => el.textContent?.trim()).filter(Boolean);

          return {
            name:        getMeta("og:title")?.replace(/ \(@.*\)/, "").trim() ?? getText("h1") ?? getText("h2"),
            bio:         getMeta("og:description")?.split(" - ")?.[0]?.trim() ?? null,
            avatar:      getMeta("og:image") ?? null,
            followerRaw: stats[1] ?? null, // usually index 1 is followers
            stats,
            url:         window.location.href,
          };
        });
      }

      if (extract === "mentions") {
        // Navigate to activity / mentions page
        // Instagram shows follows, likes, comments, mentions in the activity feed
        return await page.evaluate(() => {
          const items = [];
          // Activity feed items
          document.querySelectorAll("div[role='button'], article").forEach((el) => {
            const text = el.innerText?.trim();
            if (text && text.length > 5 && text.length < 500) {
              items.push(text);
            }
          });
          return { raw: items, url: window.location.href };
        });
      }

      if (extract === "post_interactions") {
        // Scrape likes/comments from a post page
        return await page.evaluate(() => {
          const interactions = [];
          // Comment authors
          document.querySelectorAll("ul li").forEach((li) => {
            const handle = li.querySelector("a[href*='/']")?.getAttribute("href")
              ?.replace(/\//g, "") ?? null;
            const text   = li.querySelector("span")?.textContent?.trim() ?? null;
            if (handle && text) interactions.push({ handle, text, type: "comment" });
          });
          return { interactions, url: window.location.href };
        });
      }

      // raw_text fallback
      return await page.evaluate(() => ({
        title:  document.title,
        text:   document.body.innerText?.slice(0, 5000),
        url:    window.location.href,
      }));
    });

    res.json({ data });
  } catch (err) {
    console.error("scrape error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /scroll-scrape ────────────────────────────────────────────────────────
// Scrolls a page and extracts repeated items (for activity feeds, follower lists)
// Body: { url, cookies, scrolls?, itemSelector, fields }
app.post("/scroll-scrape", async (req, res) => {
  const { url, cookies, scrolls = 5, itemSelector, waitFor = 2000 } = req.body;
  if (!url) return res.status(400).json({ error: "url required" });

  try {
    const data = await withContext(cookies, async (ctx) => {
      const page = await ctx.newPage();
      await page.addInitScript(() => {
        Object.defineProperty(navigator, "webdriver", { get: () => undefined });
      });

      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.waitForTimeout(waitFor);

      // Dismiss overlays
      for (const text of ["Not Now", "Not now", "Dismiss"]) {
        const btn = page.getByRole("button", { name: text, exact: false });
        if (await btn.isVisible().catch(() => false)) await btn.click().catch(() => {});
      }

      const seen = new Set();
      const results = [];

      for (let i = 0; i < scrolls; i++) {
        const items = await page.evaluate((sel) => {
          const els = sel
            ? [...document.querySelectorAll(sel)]
            : [...document.querySelectorAll("article, li, [role='button']")];
          return els.map((el) => el.innerText?.trim()).filter((t) => t && t.length > 3);
        }, itemSelector ?? null);

        for (const item of items) {
          if (!seen.has(item)) { seen.add(item); results.push(item); }
        }

        await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
        await page.waitForTimeout(1200);
      }

      return { items: results, count: results.length };
    });

    res.json({ data });
  } catch (err) {
    console.error("scroll-scrape error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Health ─────────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`playwright-service listening on :${PORT}`));

// Cleanup on exit
process.on("SIGTERM", async () => { if (browser) await browser.close(); process.exit(0); });
process.on("SIGINT",  async () => { if (browser) await browser.close(); process.exit(0); });
