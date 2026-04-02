"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ─── Design tokens ────────────────────────────────────────────────────────────
export const T = {
  bg:           "#F8F7F5",
  surface:      "#FFFFFF",
  card:         "#FFFFFF",
  well:         "#F3F2F0",
  border:       "#E8E6E1",
  border2:      "#D6D3CC",
  text:         "#1A1816",
  sub:          "#6B6560",
  dim:          "#A8A39C",
  accent:       "#FF6B35",
  accentBg:     "#FFF3EE",
  accentBorder: "#FFD4C2",
  green:        "#16A34A",
  greenBg:      "#F0FDF4",
  greenBorder:  "#BBF7D0",
  yellow:       "#CA8A04",
  yellowBg:     "#FEFCE8",
  yellowBorder: "#FEF08A",
  red:          "#DC2626",
  redBg:        "#FEF2F2",
  redBorder:    "#FECACA",
  shadow:       "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
  shadowSm:     "0 1px 2px rgba(0,0,0,0.05)",
  shadowMd:     "0 4px 24px rgba(0,0,0,0.08)",
};

const PLAT_COLORS = { youtube: "#FF0000", x: "#000000", instagram: "#E1306C", linkedin: "#0077B5" };
const PLAT_LABEL  = { youtube: "YouTube", x: "X", instagram: "Instagram", linkedin: "LinkedIn" };

export const sans = "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif";
export const F    = { xl: 28, lg: 20, md: 15, sm: 13, xs: 11 };

const H1_FROM = "2026-01-01";

const TAB_STYLE = (active) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 4px",
  fontSize: 14,
  fontWeight: active ? 600 : 500,
  color: active ? T.accent : T.dim,
  background: "transparent",
  border: "none",
  borderBottom: active ? `2px solid ${T.accent}` : "2px solid transparent",
  cursor: "pointer",
  transition: "all 0.15s ease",
  fontFamily: sans,
  textDecoration: "none",
  marginBottom: -1,
});

const TABS = [
  { key: "engagement",   label: "Content",      emoji: "\uD83D\uDCCA", href: "/" },
  { key: "interactions", label: "Interactions", emoji: "\uD83E\uDD1D", href: "/interactions" },
  { key: "handles",      label: "Handles",      emoji: "\uD83D\uDC64", href: "/handles" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n) {
  if (!n && n !== 0) return "—";
  n = parseInt(n);
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function parseCSVLine(line) {
  const result = [];
  let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQ = !inQ; }
    else if (ch === "," && !inQ) { result.push(cur.trim()); cur = ""; }
    else { cur += ch; }
  }
  result.push(cur.trim());
  return result;
}

// ─── Platform SVG icons ───────────────────────────────────────────────────────
function IgIcon({ size = 16, color = "#E1306C" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4.5"/>
      <circle cx="17.5" cy="6.5" r="1" fill={color} stroke="none"/>
    </svg>
  );
}

function PlatDot({ platform, size = 8 }) {
  const boxSize  = size + 8;
  const color    = PLAT_COLORS[platform] || T.dim;
  const bgCircle = { display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: boxSize, height: boxSize, borderRadius: "50%",
    background: color + "18", flexShrink: 0 };

  if (platform === "instagram") {
    return <span style={bgCircle}><IgIcon size={size + 2} color={color} /></span>;
  }
  const icons = { youtube: "▶", x: "𝕏", linkedin: "in" };
  return (
    <span style={{ ...bgCircle, fontSize: size * 0.85, color }}>
      {icons[platform] || "·"}
    </span>
  );
}

// ─── Import panel ─────────────────────────────────────────────────────────────
function ImportPanel({ posts, onImported }) {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(null);
  const [message, setMessage] = useState(null);

  const existingKeys = new Set([
    ...posts.filter(p => p.permalink).map(p => p.permalink),
    ...posts.map(p => `${p.platform}|${p.published_at?.slice(0,10)}|${(p.content||"").slice(0,40)}`),
  ]);

  function isDupe(platform, published_at, content, permalink) {
    if (permalink && existingKeys.has(permalink)) return true;
    const key = `${platform}|${published_at?.slice(0,10)}|${(content||"").slice(0,40)}`;
    return existingKeys.has(key);
  }

  async function syncInstagram() {
    setLoading("instagram");
    setMessage(null);
    try {
      const res  = await fetch("/api/posts/sync-instagram", { method: "POST" });
      const data = await res.json();
      setMessage(data.error ? `Error: ${data.error}` : `✓ ${data.message}`);
      if (!data.error) onImported();
    } catch (e) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setLoading(null);
    }
  }

  async function syncYouTube() {
    setLoading("youtube");
    setMessage(null);
    try {
      const res  = await fetch("/api/sync/youtube", { method: "POST" });
      const data = await res.json();
      setMessage(data.error ? `Error: ${data.error}` : `✓ ${data.message}`);
      if (!data.error) onImported();
    } catch (e) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setLoading(null);
    }
  }

  async function importFile(platform, file) {
    if (!file) return;
    setLoading(platform);
    setMessage(null);
    try {
      const text  = await file.text();
      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
      let posts   = [];

      if (platform === "x") {
        const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
        const idx = (name) => headers.findIndex(h => h.includes(name));
        const iDate = idx("date"), iTweet = idx("post text") !== -1 ? idx("post text") : idx("tweet text");
        const iId   = idx("post id") !== -1 ? idx("post id") : idx("tweet id");
        const iLink = idx("post link") !== -1 ? idx("post link") : idx("tweet permalink");
        const iLikes = idx("likes"), iImpr = idx("impressions");
        const iReplies = idx("replies"), iReposts = idx("reposts"), iBookmarks = idx("bookmarks");

        for (let i = 1; i < lines.length; i++) {
          const v = parseCSVLine(lines[i]);
          if (!v[iDate]) continue;
          let publishedAt;
          try { publishedAt = new Date(v[iDate]).toISOString(); } catch { continue; }
          const content   = v[iTweet]  || "";
          const permalink = v[iLink]   || null;
          const post_id   = v[iId]     || null;
          if (isDupe("x", publishedAt, content, permalink)) continue;
          posts.push({
            platform: "x", post_id, published_at: publishedAt, content, permalink,
            likes:       parseInt(v[iLikes]     || 0),
            comments:    parseInt(v[iReplies]   || 0),
            impressions: parseInt(v[iImpr]      || 0),
            shares:      parseInt(v[iReposts]   || 0),
            saves:       parseInt(v[iBookmarks] || 0),
            post_type: "post", source: "csv_import",
          });
        }
      } else if (platform === "linkedin") {
        // LinkedIn CSV daily-aggregate import disabled — correct data comes from
        // Buffer export seed files (supabase/seed_linkedin_posts.sql).
        // Old li_daily_* rows cleaned up via supabase/fix_delete_li_daily_final.sql.
        setMessage("LinkedIn CSV import is disabled. Use Buffer export instead.");
        return;
      } else if (platform === "buffer") {
        const headers  = parseCSVLine(lines[0]).map(h => h.toLowerCase());
        const idx      = (name) => headers.findIndex(h => h.includes(name));
        const iDate    = idx("date") !== -1 ? idx("date") : idx("sent at");
        const iText    = idx("post text") !== -1 ? idx("post text") : idx("content") !== -1 ? idx("content") : idx("text");
        const iLink    = idx("link") !== -1 ? idx("link") : idx("url");
        const iNet     = idx("network") !== -1 ? idx("network") : idx("platform") !== -1 ? idx("platform") : idx("profile");
        const iLikes   = idx("likes") !== -1 ? idx("likes") : idx("favorites") !== -1 ? idx("favorites") : idx("reactions");
        const iComm    = idx("comments") !== -1 ? idx("comments") : idx("replies");
        const iShares  = idx("shares") !== -1 ? idx("shares") : idx("retweets") !== -1 ? idx("retweets") : idx("reposts");
        const iReach   = idx("impressions") !== -1 ? idx("impressions") : idx("reach");

        const NETWORK_MAP = { twitter: "x", "x (twitter)": "x", instagram: "instagram",
          linkedin: "linkedin", youtube: "youtube", facebook: "facebook" };

        for (let i = 1; i < lines.length; i++) {
          const v = parseCSVLine(lines[i]);
          if (!v[iDate]) continue;
          let publishedAt;
          try { publishedAt = new Date(v[iDate]).toISOString(); } catch { continue; }
          const rawNet  = (v[iNet] || "").toLowerCase().trim();
          const platKey = NETWORK_MAP[rawNet] || rawNet.split(" ")[0] || "unknown";
          const content   = v[iText]  || "";
          const permalink = v[iLink]  || null;
          if (isDupe(platKey, publishedAt, content, permalink)) continue;
          posts.push({
            platform: platKey, post_id: permalink || null, published_at: publishedAt,
            content, permalink,
            likes:       parseInt(v[iLikes]  || 0),
            comments:    parseInt(v[iComm]   || 0),
            impressions: parseInt(v[iReach]  || 0),
            shares:      parseInt(v[iShares] || 0),
            post_type: "post", source: "buffer_import",
          });
        }
      }

      if (posts.length === 0) {
        setMessage("No new posts found — all records are already in the database or the file format wasn't recognised.");
        return;
      }

      let total = 0;
      for (let i = 0; i < posts.length; i += 100) {
        const batch = posts.slice(i, i + 100);
        const res   = await fetch("/api/posts/import", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ posts: batch }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        total += data.imported || batch.length;
      }
      setMessage(`✓ Imported ${total} posts`);
      onImported();
    } catch (e) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: T.well, color: T.sub, border: `1px solid ${T.border}`,
        borderRadius: 8, padding: "6px 14px", fontSize: F.xs, fontWeight: 600,
        fontFamily: sans, cursor: "pointer",
      }}>
        ↑ Import data {open ? "▾" : "▸"}
      </button>

      {open && (
        <div style={{
          marginTop: 10, background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 12, padding: 20, display: "flex", flexWrap: "wrap", gap: 20,
        }}>
          {[
            {
              id: "instagram", label: "Instagram", color: "#E1306C",
              action: <button disabled={loading === "instagram"} onClick={syncInstagram} style={{
                background: "#E1306C18", color: "#E1306C", border: "1px solid #E1306C44",
                borderRadius: 7, padding: "6px 14px", fontSize: F.xs, fontWeight: 600,
                fontFamily: sans, cursor: "pointer",
              }}>{loading === "instagram" ? "Syncing…" : "Sync from API"}</button>,
              hint: "Pulls individual posts from last API sync",
            },
            {
              id: "youtube", label: "YouTube", color: "#FF0000",
              action: <button disabled={loading === "youtube"} onClick={syncYouTube} style={{
                background: "#FF000018", color: "#FF0000", border: "1px solid #FF000044",
                borderRadius: 7, padding: "6px 14px", fontSize: F.xs, fontWeight: 600,
                fontFamily: sans, cursor: "pointer",
              }}>{loading === "youtube" ? "Syncing…" : "Sync from API"}</button>,
              hint: "Pulls videos + comments from your YouTube channel",
            },
            {
              id: "x", label: "X / Twitter", color: "#000",
              action: <label style={{
                display: "inline-block", background: "#00000010", color: T.text,
                border: `1px solid ${T.border}`, borderRadius: 7, padding: "6px 14px",
                fontSize: F.xs, fontWeight: 600, fontFamily: sans, cursor: "pointer",
              }}>
                {loading === "x" ? "Importing…" : "Upload CSV"}
                <input type="file" accept=".csv" style={{ display: "none" }}
                  onChange={e => importFile("x", e.target.files[0])} />
              </label>,
              hint: "Export from analytics.twitter.com",
            },
            {
              id: "linkedin", label: "LinkedIn", color: "#0077B5",
              action: <label style={{
                display: "inline-block", background: "#0077B510", color: "#0077B5",
                border: "1px solid #0077B544", borderRadius: 7, padding: "6px 14px",
                fontSize: F.xs, fontWeight: 600, fontFamily: sans, cursor: "pointer",
              }}>
                {loading === "linkedin" ? "Importing…" : "Upload CSV"}
                <input type="file" accept=".csv,.xls,.xlsx" style={{ display: "none" }}
                  onChange={e => importFile("linkedin", e.target.files[0])} />
              </label>,
              hint: "Disabled — use Buffer export instead",
            },
            {
              id: "buffer", label: "Buffer", color: "#168EEA",
              action: <label style={{
                display: "inline-block", background: "#168EEA10", color: "#168EEA",
                border: "1px solid #168EEA44", borderRadius: 7, padding: "6px 14px",
                fontSize: F.xs, fontWeight: 600, fontFamily: sans, cursor: "pointer",
              }}>
                {loading === "buffer" ? "Importing…" : "Upload CSV"}
                <input type="file" accept=".csv" style={{ display: "none" }}
                  onChange={e => importFile("buffer", e.target.files[0])} />
              </label>,
              hint: "Exports → All channels · deduped automatically",
            },
          ].map(src => (
            <div key={src.id} style={{ minWidth: 190 }}>
              <div style={{ fontFamily: sans, fontSize: F.xs, fontWeight: 600, color: T.text, marginBottom: 8 }}>
                {src.label}
              </div>
              {src.action}
              <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim, marginTop: 5, lineHeight: 1.4 }}>
                {src.hint}
              </div>
            </div>
          ))}

          {message && (
            <div style={{
              width: "100%", fontFamily: sans, fontSize: F.xs, fontWeight: 500,
              color:      message.startsWith("✓") ? T.green  : T.red,
              background: message.startsWith("✓") ? T.greenBg : T.redBg,
              border:     `1px solid ${message.startsWith("✓") ? T.greenBorder : T.redBorder}`,
              borderRadius: 7, padding: "8px 12px",
            }}>{message}</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Platform stats row (cards double as filter buttons) ─────────────────────
function PlatformStats({ posts, activePlatform, onPlatformSelect, followerLatest }) {
  const order = ["instagram", "x", "linkedin", "youtube"];
  const stats = {};
  for (const plat of order) {
    const pp = posts.filter(p => p.platform === plat && p.post_type !== "daily_aggregate");
    stats[plat] = {
      count:   pp.length,
      likes:   pp.reduce((s, p) => s + parseInt(p.likes || 0), 0),
      impr:    pp.reduce((s, p) => s + parseInt(p.impressions || 0), 0),
      maxLikes: pp.length ? Math.max(...pp.map(p => parseInt(p.likes || 0))) : 0,
    };
  }

  const allPosts = posts.filter(p => p.post_type !== "daily_aggregate");
  if (!allPosts.length && (!followerLatest || !Object.keys(followerLatest).length)) return null;

  const allStats = {
    count:   allPosts.length,
    likes:   allPosts.reduce((s, p) => s + parseInt(p.likes || 0), 0),
    impr:    allPosts.reduce((s, p) => s + parseInt(p.impressions || 0), 0),
    maxLikes: allPosts.length ? Math.max(...allPosts.map(p => parseInt(p.likes || 0))) : 0,
  };

  const cards = [["all", allStats], ...order.map(p => [p, stats[p]])];

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
      {cards.map(([plat, s]) => {
        const isActive = activePlatform === plat;
        const color    = PLAT_COLORS[plat] || T.accent;
        return (
          <div key={plat} onClick={() => onPlatformSelect(isActive ? "all" : plat)}
            style={{
              background: isActive ? color + "08" : T.card,
              border:     `1px solid ${isActive ? color + "44" : T.border}`,
              borderRadius: 12, padding: "12px 16px", flex: "1 1 140px",
              boxShadow: isActive ? "none" : "none",
              cursor: "pointer", transition: "all 0.12s",
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
              {plat === "all"
                ? <span style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600,
                    color: isActive ? T.accent : T.text }}>All</span>
                : <><PlatDot platform={plat} size={10} />
                   <span style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600,
                     color: isActive ? color : T.text }}>{PLAT_LABEL[plat] || plat}</span></>
              }
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 14px" }}>
              {[
                ["Posts",      s.count],
                ["Total likes", fmt(s.likes)],
                ["Top post",   fmt(s.maxLikes) + " likes"],
                ["Impressions", fmt(s.impr)],
                ["Followers", plat === "all"
                  ? (followerLatest && Object.keys(followerLatest).length
                      ? fmt(Object.values(followerLatest).reduce((a, b) => a + b, 0))
                      : "—")
                  : (followerLatest?.[plat] ? fmt(followerLatest[plat]) : "—")],
              ].map(([lbl, val]) => (
                <div key={lbl}>
                  <div style={{ fontFamily: sans, fontSize: 10, color: T.dim, marginBottom: 1 }}>{lbl}</div>
                  <div style={{ fontFamily: sans, fontSize: F.xs, fontWeight: 600,
                    color: isActive && plat !== "all" ? color : T.text }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Sign In ─────────────────────────────────────────────────────────────────
function SignIn() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  async function go() {
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    if (!error) setSent(true);
    setLoading(false);
  }
  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sans }}>
      <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, padding: "40px 44px", maxWidth: 380, width: "100%", boxShadow: T.shadowMd }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>A</span>
          </div>
          <div>
            <div style={{ fontSize: F.md, fontWeight: 700, color: T.text, letterSpacing: "-0.02em" }}>Audian</div>
            <div style={{ fontSize: F.xs, color: T.sub }}>Social Intelligence</div>
          </div>
        </div>
        <div style={{ fontSize: F.lg, fontWeight: 600, color: T.text, marginBottom: 6, letterSpacing: "-0.02em" }}>Welcome back</div>
        <div style={{ fontSize: F.sm, color: T.sub, marginBottom: 24 }}>Sign in to your workspace</div>
        {sent ? (
          <div style={{ background: T.greenBg, border: `1px solid ${T.greenBorder}`, borderRadius: 8, padding: "12px 14px", fontSize: F.sm, color: T.green }}>
            Check your email for the magic link.
          </div>
        ) : (
          <>
            <input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && go()}
              style={{ width: "100%", background: T.well, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", color: T.text, fontFamily: sans, fontSize: F.sm, outline: "none", boxSizing: "border-box", marginBottom: 10 }} />
            <button onClick={go} disabled={loading}
              style={{ width: "100%", background: T.accent, border: "none", borderRadius: 8, padding: "11px", color: "#fff", fontFamily: sans, fontSize: F.sm, fontWeight: 600, cursor: "pointer" }}>
              {loading ? "Sending..." : "Continue with email"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Profile Menu ────────────────────────────────────────────────────────────
const PLAT_META = [
  { id: "youtube",   label: "YouTube",    icon: "▶",  color: "#FF0000", authUrl: "/api/auth/youtube",   syncUrl: "/api/sync/youtube" },
  { id: "instagram", label: "Instagram",  icon: "◉",  color: "#E1306C", authUrl: "/api/auth/instagram", syncUrl: "/api/posts/sync-instagram" },
  { id: "x",         label: "X / Twitter", icon: "𝕏", color: "#000000", authUrl: "/api/auth/x",         syncUrl: "/api/sync/x" },
  { id: "linkedin",  label: "LinkedIn",   icon: "in", color: "#0077B5", authUrl: "/api/auth/linkedin",  syncUrl: null },
];

function Toggle({ on, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
        background: on ? T.accent : (hov ? T.border2 : T.border),
        position: "relative", transition: "background 0.2s", flexShrink: 0,
        boxShadow: on ? `0 0 0 3px ${T.accent}25` : "none",
      }}>
      <span style={{
        position: "absolute", top: 3, left: on ? 21 : 3,
        width: 16, height: 16, borderRadius: "50%", background: "#fff",
        transition: "left 0.18s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        display: "block",
      }} />
    </button>
  );
}

function ProfileMenu({ session, avatarUrl, connections = [], onDisconnect, posts, onImported }) {
  const [open, setOpen] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [disconnecting, setDisconnecting] = useState(null);
  const [syncing, setSyncing] = useState(null);           // platform id currently syncing
  const [syncResult, setSyncResult] = useState({});       // { [platformId]: { ok, msg } }
  const menuRef = useRef(null);
  const email = session?.user?.email || "";
  const initial = email[0]?.toUpperCase() || "?";

  useEffect(() => {
    if (!open) return;
    function handle(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  async function disconnect(platformId) {
    setDisconnecting(platformId);
    try { await onDisconnect?.(platformId); } catch(e) { console.error(e); }
    setDisconnecting(null);
  }

  async function syncPlatform(platformId, syncUrl) {
    if (!syncUrl || syncing) return;
    setSyncing(platformId);
    setSyncResult(r => ({ ...r, [platformId]: null }));
    try {
      const res  = await fetch(syncUrl, { method: "POST" });
      const data = await res.json();
      const ok   = !data.error;
      setSyncResult(r => ({ ...r, [platformId]: { ok, msg: ok ? (data.message || "Synced") : data.error } }));
      if (ok) onImported?.();
    } catch (e) {
      setSyncResult(r => ({ ...r, [platformId]: { ok: false, msg: e.message } }));
    } finally {
      setSyncing(null);
      // auto-clear result after 4 s
      setTimeout(() => setSyncResult(r => ({ ...r, [platformId]: null })), 4000);
    }
  }

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{
          width: 36, height: 36, borderRadius: "50%",
          background: avatarUrl ? `url(${avatarUrl}) center/cover` : `linear-gradient(135deg, ${T.accent} 0%, #ff9060 100%)`,
          border: open ? `2px solid ${T.accent}` : "2px solid transparent",
          boxShadow: open ? `0 0 0 3px ${T.accent}30` : "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "all 0.15s",
          fontFamily: sans, fontSize: 14, fontWeight: 700, color: "#fff",
          overflow: "hidden", flexShrink: 0,
        }}>
        {!avatarUrl && initial}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 10px)", left: 0,
          width: 300, background: T.card,
          border: `1px solid ${T.border}`, borderRadius: 14,
          boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
          zIndex: 500, overflow: "hidden",
          animation: "fadeSlideDown 0.12s ease-out",
        }}>
          <style>{`
            @keyframes fadeSlideDown {
              from { opacity: 0; transform: translateY(-6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* User info */}
          <div style={{ padding: "16px 18px 14px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                background: avatarUrl ? `url(${avatarUrl}) center/cover` : `linear-gradient(135deg, ${T.accent} 0%, #ff9060 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: sans, fontSize: 15, fontWeight: 700, color: "#fff", overflow: "hidden",
              }}>{!avatarUrl && initial}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email.split("@")[0]}</div>
                <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email}</div>
              </div>
            </div>
          </div>

          {/* Platform connections */}
          <div style={{ padding: "10px 0" }}>
            <div style={{ padding: "4px 18px 8px", fontFamily: sans, fontSize: 10, fontWeight: 600, color: T.dim, letterSpacing: "0.06em", textTransform: "uppercase" }}>Connections</div>
            {PLAT_META.map(p => {
              const conn        = connections.find(c => c.platform === p.id);
              const isConnected = !!conn;
              const isDisc      = disconnecting === p.id;
              const isSyncing   = syncing === p.id;
              const result      = syncResult[p.id];
              return (
                <div key={p.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 18px" }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                      background: p.color + "14",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, color: p.color, fontWeight: 700,
                    }}>{p.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 500, color: T.text }}>{p.label}</div>
                      {conn?.channel_name && (
                        <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{conn.channel_name}</div>
                      )}
                    </div>
                    {/* Sync button — only shown when connected and a sync route exists */}
                    {isConnected && p.syncUrl && (
                      <button
                        title={`Sync ${p.label}`}
                        disabled={!!syncing}
                        onClick={() => syncPlatform(p.id, p.syncUrl)}
                        style={{
                          width: 28, height: 28, borderRadius: 7, border: "none", cursor: syncing ? "default" : "pointer",
                          background: isSyncing ? p.color + "20" : T.well,
                          color: isSyncing ? p.color : T.dim,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, flexShrink: 0, transition: "background 0.15s, color 0.15s",
                        }}>
                        {isSyncing ? "…" : "↻"}
                      </button>
                    )}
                    {isDisc ? (
                      <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>...</span>
                    ) : isConnected ? (
                      <Toggle on={true} onClick={() => disconnect(p.id)} />
                    ) : (
                      <Toggle on={false} onClick={() => { window.location.href = p.authUrl; }} />
                    )}
                  </div>
                  {/* Inline result pill */}
                  {result && (
                    <div style={{
                      margin: "0 18px 8px", padding: "5px 10px", borderRadius: 6,
                      fontFamily: sans, fontSize: F.xs, fontWeight: 500,
                      background: result.ok ? T.greenBg  : T.redBg,
                      color:      result.ok ? T.green    : T.red,
                      border:     `1px solid ${result.ok ? T.greenBorder : T.redBorder}`,
                    }}>
                      {result.ok ? "✓ " : "✗ "}{result.msg}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Manage handles */}
          <div style={{ borderTop: `1px solid ${T.border}` }}>
            <a href="/handles"
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 18px", textDecoration: "none" }}
              onMouseEnter={e => e.currentTarget.style.background = T.well}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <span style={{ fontFamily: sans, fontSize: F.sm, color: T.text, fontWeight: 500 }}>Manage handles</span>
              <span style={{ color: T.dim, fontSize: F.xs, marginLeft: "auto" }}>&#8599;</span>
            </a>
          </div>

          {/* Import data */}
          <div style={{ borderTop: `1px solid ${T.border}` }}>
            <button onClick={() => setShowImport(s => !s)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 18px", width: "100%",
                background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
              onMouseEnter={e => e.currentTarget.style.background = T.well}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <span style={{ fontFamily: sans, fontSize: F.sm, color: T.text, fontWeight: 500 }}>Import data</span>
              <span style={{ color: T.dim, fontSize: F.xs, marginLeft: "auto" }}>{showImport ? "▾" : "▸"}</span>
            </button>
            {showImport && (
              <div style={{ padding: "0 18px 14px" }}>
                <ImportPanel posts={posts} onImported={onImported} />
              </div>
            )}
          </div>

          {/* Sign out */}
          <div style={{ borderTop: `1px solid ${T.border}`, padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <a href="https://audian.app" target="_blank" rel="noreferrer"
              style={{ fontFamily: sans, fontSize: F.xs, color: T.sub, textDecoration: "none", fontWeight: 500 }}>
              audian.app &#8599;
            </a>
            <button onClick={() => supabase.auth.signOut()}
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: sans, fontSize: F.xs, color: T.sub, fontWeight: 500 }}>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PageShell ───────────────────────────────────────────────────────────────
export default function PageShell({ activeTab, children }) {
  const [session,        setSession]       = useState(null);
  const [authLoading,    setAuthLoading]   = useState(true);
  const [posts,          setPosts]         = useState([]);
  const [loading,        setLoading]       = useState(true);
  const [error,          setError]         = useState(null);
  const [activePlatform, setActivePlatform] = useState("all");
  const [selectedWeek,   setSelectedWeek]  = useState(null);
  const [dateFrom,       setDateFrom]      = useState(H1_FROM);
  const [dateTo,         setDateTo]        = useState(new Date().toISOString().slice(0, 10));
  const [followerSnaps,  setFollowerSnaps] = useState([]);
  const [followerLatest, setFollowerLatest] = useState({});
  const [weekFilter,     setWeekFilter]    = useState(null);
  const [accountName,    setAccountName]   = useState("");
  const [avatarUrl,      setAvatarUrl]     = useState("");
  const [connections,    setConnections]   = useState([]);
  const [actionMessage,  setActionMessage] = useState(null);
  const [enriching,      setEnriching]     = useState(false);
  const [refreshKey,     setRefreshKey]    = useState(0);

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setAuthLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // Settings + connections
  useEffect(() => {
    if (!session) return;
    fetch("/api/settings").then(r => r.json()).then(d => {
      if (d.settings?.account_name) setAccountName(d.settings.account_name);
      if (d.settings?.avatar_url) setAvatarUrl(d.settings.avatar_url);
    }).catch(() => {});
    supabase.from("platform_connections").select("*").then(({ data }) => {
      if (data) setConnections(data);
    });
  }, [session]);

  const loadPosts = useCallback(async (from, to) => {
    setLoading(true);
    setError(null);
    try {
      const [postsRes, followersRes] = await Promise.all([
        fetch(`/api/posts?from=${from}&to=${to}&limit=2000`),
        fetch(`/api/followers`),
      ]);
      const postsData     = await postsRes.json();
      const followersData = await followersRes.json();
      if (postsData.error) throw new Error(postsData.error);
      setPosts(postsData.posts || []);
      setFollowerSnaps(followersData.snapshots  || []);
      setFollowerLatest(followersData.latest    || {});
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (session) loadPosts(dateFrom, dateTo); }, [session, loadPosts, dateFrom, dateTo]);

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: sans, fontSize: F.sm, color: T.dim }}>Loading...</div>
      </div>
    );
  }

  if (!session) return <SignIn />;

  const importHref = (() => {
    const params = new URLSearchParams();
    if (activePlatform && activePlatform !== "all") params.set("platform", activePlatform);
    if (activeTab === "interactions") params.set("mode", "interactions");
    if (activeTab === "handles") params.set("mode", "handles");
    const query = params.toString();
    return query ? `/import?${query}` : "/import";
  })();

  async function runInteractionEnrichment() {
    setEnriching(true);
    setActionMessage(null);
    try {
      let handleIds = [];

      if (activeTab === "handles") {
        const res = await fetch("/api/handles");
        const data = await res.json();
        if (!res.ok || data._error) throw new Error(data._error || "Could not load handles.");

        const needsEnrichment = (handle) => {
          const missingBio = !handle.bio?.trim();

          const platformsToCheck = activePlatform === "all"
            ? ["instagram", "x", "youtube", "linkedin"]
            : [activePlatform];

          const missingFollowers = platformsToCheck.some((platform) => {
            const hasHandle = !!handle[`handle_${platform}`];
            const hasFollowers = !!handle[`followers_${platform}`];
            return hasHandle && !hasFollowers;
          });

          return missingBio || missingFollowers;
        };

        handleIds = (data.handles || [])
          .filter((handle) => activePlatform === "all" || handle[`handle_${activePlatform}`])
          .filter(needsEnrichment)
          .map((handle) => handle.id)
          .filter(Boolean);
      } else {
        const res = await fetch("/api/interactions/list");
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || "Could not load interactions.");

        handleIds = [...new Set(
          (data.interactions || [])
            .filter(i => activePlatform === "all" || i.platform === activePlatform)
            .map(i => i.handle_id)
            .filter(Boolean)
        )];
      }

      if (handleIds.length === 0) {
        setActionMessage({
          tone: "muted",
          text: activeTab === "handles"
            ? "No handles in this view still need bio or follower enrichment."
            : "No handles found to enrich for this view.",
        });
        return;
      }

      let enriched = 0;
      let checked = 0;
      let bioUpdates = 0;
      let followerUpdates = 0;
      const batchSize = 10;
      const totalBatches = Math.ceil(handleIds.length / batchSize);

      for (let i = 0; i < handleIds.length; i += batchSize) {
        const batch = handleIds.slice(i, i + batchSize);
        const batchNum = Math.floor(i / batchSize) + 1;
        setActionMessage({
          tone: "muted",
          text: `Batch ${batchNum} of ${totalBatches} · pulling bios and follower counts for ${checked + 1}-${Math.min(checked + batch.length, handleIds.length)} of ${handleIds.length} handles…`,
        });
        const enrichRes = await fetch("/api/enrich/handles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: batch }),
        });
        const enrichData = await enrichRes.json();
        if (!enrichRes.ok || enrichData.error) {
          throw new Error(enrichData.error || "Enrichment failed.");
        }
        enriched += enrichData.enriched || 0;
        checked += enrichData.total || batch.length;
        bioUpdates += enrichData.bioUpdates || 0;
        followerUpdates += enrichData.followerUpdates || 0;
        setRefreshKey(v => v + 1);
      }

      setActionMessage({
        tone: enriched > 0 ? "success" : "muted",
        text: enriched > 0
          ? `Updated ${enriched} handle${enriched === 1 ? "" : "s"} · ${bioUpdates} bio${bioUpdates === 1 ? "" : "s"} and ${followerUpdates} follower count${followerUpdates === 1 ? "" : "s"} filled in.`
          : `Checked ${checked} profile${checked === 1 ? "" : "s"} and everything already looked filled in.`,
      });
    } catch (e) {
      setActionMessage({ tone: "error", text: e.message || "Enrichment failed." });
    } finally {
      setEnriching(false);
    }
  }

  // Build the props that children will receive
  const childProps = {
    posts,
    loading,
    activePlatform,
    selectedWeek,
    setSelectedWeek,
    dateFrom,
    dateTo,
    followerSnaps,
    followerLatest,
    weekFilter,
    loadPosts,
    refreshKey,
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: sans }}>

      {/* Sticky header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100, background: T.bg,
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "12px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ProfileMenu session={session} avatarUrl={avatarUrl} connections={connections}
              onDisconnect={async (id) => {
                await fetch("/api/disconnect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ platform: id }) });
                setConnections(c => c.filter(x => x.platform !== id));
              }}
              posts={posts} onImported={() => loadPosts(dateFrom, dateTo)} />
            <h1 style={{ fontFamily: sans, fontSize: F.lg, fontWeight: 700, color: T.text, margin: 0, letterSpacing: "-0.02em" }}>
              {accountName || "Analytics"}
            </h1>
          </div>

          {/* Date range picker */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {loading && (
              <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>Loading...</span>
            )}
            {[
              { label: "From", value: dateFrom, set: setDateFrom },
              { label: "To",   value: dateTo,   set: setDateTo   },
            ].map(({ label, value, set }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>{label}</span>
                <input
                  type="date"
                  value={value}
                  onChange={e => { set(e.target.value); setSelectedWeek(null); }}
                  style={{
                    fontFamily: sans, fontSize: F.xs, color: T.text,
                    background: T.card, border: `1px solid ${T.border}`,
                    borderRadius: 7, padding: "5px 8px", cursor: "pointer",
                    outline: "none",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px" }}>

        {error && (
          <div style={{ background: T.redBg, border: `1px solid ${T.redBorder}`, borderRadius: 10,
            padding: "12px 16px", marginBottom: 20, fontFamily: sans, fontSize: F.sm, color: T.red }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", fontFamily: sans, fontSize: F.sm, color: T.dim }}>
            Loading posts…
          </div>
        ) : (
          <>
            {posts.length > 0 && (
              <PlatformStats
                posts={posts}
                activePlatform={activePlatform}
                onPlatformSelect={(p) => { setActivePlatform(p); setSelectedWeek(null); }}
                followerLatest={followerLatest}
              />
            )}

            {/* Section tabs + actions */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, borderBottom: `1px solid ${T.border}`, marginBottom: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {TABS.map(tab => (
                  <a key={tab.key} href={tab.href} style={TAB_STYLE(activeTab === tab.key)}
                    onMouseEnter={e => { if (activeTab !== tab.key) e.currentTarget.style.color = T.sub; }}
                    onMouseLeave={e => { if (activeTab !== tab.key) e.currentTarget.style.color = T.dim; }}>
                    <span>{tab.emoji}</span>
                    {tab.label}
                  </a>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, paddingBottom: 8, flexWrap: "wrap" }}>
                <a href={importHref} style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  background: T.card, color: T.sub, border: `1px solid ${T.border}`,
                  borderRadius: 999, padding: "7px 14px", fontSize: F.xs, fontWeight: 600,
                  fontFamily: sans, cursor: "pointer", textDecoration: "none",
                  transition: "all 0.12s", boxShadow: T.shadowSm,
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.well; }}
                  onMouseLeave={e => { e.currentTarget.style.background = T.card; }}>
                  <span style={{ fontSize: 12 }}>{"\u2191"}</span> Import
                </a>
                {(activeTab === "interactions" || activeTab === "handles") && (
                  <button onClick={runInteractionEnrichment} disabled={enriching} style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    background: T.accent, color: "#fff", border: "none",
                    borderRadius: 999, padding: "7px 14px", fontSize: F.xs, fontWeight: 600,
                    fontFamily: sans, cursor: enriching ? "wait" : "pointer", transition: "all 0.12s",
                    boxShadow: T.shadowSm, opacity: enriching ? 0.75 : 1,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
                    <span style={{ fontSize: 11 }}>{"\u2728"}</span> {enriching ? "Enriching…" : "Enrich"}
                  </button>
                )}
              </div>
            </div>

            {actionMessage && (
              <div style={{
                marginBottom: 18,
                fontFamily: sans,
                fontSize: F.xs,
                fontWeight: 600,
                color: actionMessage.tone === "success" ? T.green : actionMessage.tone === "error" ? T.red : T.sub,
                background: actionMessage.tone === "success" ? T.greenBg : actionMessage.tone === "error" ? T.redBg : T.well,
                border: `1px solid ${actionMessage.tone === "success" ? T.greenBorder : actionMessage.tone === "error" ? T.redBorder : T.border}`,
                borderRadius: 10,
                padding: "10px 12px",
              }}>
                {actionMessage.text}
              </div>
            )}

            {posts.length === 0 && activeTab === "engagement" ? (
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
                padding: "60px 40px", textAlign: "center", boxShadow: T.shadowSm }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
                <div style={{ fontFamily: sans, fontSize: F.md, fontWeight: 600, color: T.text, marginBottom: 6 }}>
                  No posts yet
                </div>
                <div style={{ fontFamily: sans, fontSize: F.sm, color: T.sub }}>
                  Use the Import panel above to load your X CSV, LinkedIn export, Buffer export, or sync Instagram.
                </div>
              </div>
            ) : (
              typeof children === "function" ? children(childProps) : children
            )}
          </>
        )}
      </div>
    </div>
  );
}
