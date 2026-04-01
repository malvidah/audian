"use client";
import React, { useState, useEffect, useCallback } from "react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
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

const sans       = "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif";
const F          = { xl: 28, lg: 20, md: 15, sm: 13, xs: 11 };
const LIKES_GOAL = 2000;
const POSTS_GOAL = 3;
const H1_FROM    = "2026-01-01";
const H1_TO      = "2026-04-01";

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
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Monday-based ISO week key: "2026-01-05"
function weekKey(iso) {
  const d   = new Date(iso);
  const mon = new Date(d);
  mon.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return mon.toISOString().slice(0, 10);
}

function weekLabel(key) {
  const d = new Date(key + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function weekEnd(key) {
  const d = new Date(key + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 6);
  return d;
}

// Simple CSV line parser
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

// ─── Small components ─────────────────────────────────────────────────────────
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

function Pill({ children, active, onClick, color }) {
  return (
    <button onClick={onClick} style={{
      background: active ? (color || T.accent) : T.well,
      color:      active ? "#fff" : T.sub,
      border:     `1px solid ${active ? (color || T.accent) : T.border}`,
      borderRadius: 20, padding: "5px 14px", fontSize: F.xs, fontWeight: 600,
      fontFamily: sans, cursor: "pointer", transition: "all 0.12s",
    }}>{children}</button>
  );
}

// ─── Weekly OKR tracker (also acts as week filter) ────────────────────────────
function WeeklyOKR({ posts, activePlatform, selectedWeek, onWeekSelect }) {
  const filtered = posts.filter(p =>
    p.post_type !== "daily_aggregate" &&
    (activePlatform === "all" || p.platform === activePlatform)
  );

  const weekMap = {};
  for (const p of filtered) {
    if (!p.published_at) continue;
    const k = weekKey(p.published_at);
    if (!weekMap[k]) weekMap[k] = { posts: [], maxLikes: 0 };
    weekMap[k].posts.push(p);
    const lk = parseInt(p.likes || 0);
    if (lk > weekMap[k].maxLikes) weekMap[k].maxLikes = lk;
  }

  const weeks = Object.entries(weekMap).sort((a, b) => a[0].localeCompare(b[0]));
  if (weeks.length === 0) return null;

  const enriched = weeks.map(([k, w]) => {
    const postsOk = w.posts.length >= POSTS_GOAL;
    const likesOk = w.maxLikes >= LIKES_GOAL;
    let status;
    if (weekEnd(k) > new Date())       status = "INCOMPLETE";
    else if (postsOk && likesOk)       status = "ON_TRACK";
    else if (postsOk || likesOk)       status = "MIGHT_MISS";
    else                               status = "WILL_MISS";
    return { key: k, ...w, status };
  });

  const complete  = enriched.filter(w => w.status !== "INCOMPLETE").length;
  const onTrack   = enriched.filter(w => w.status === "ON_TRACK").length;

  const statusStyle = {
    ON_TRACK:   { bg: T.greenBg,  border: T.greenBorder,  text: T.green  },
    MIGHT_MISS: { bg: T.yellowBg, border: T.yellowBorder, text: T.yellow },
    WILL_MISS:  { bg: T.redBg,    border: T.redBorder,    text: T.red    },
    INCOMPLETE: { bg: T.well,     border: T.border,       text: T.dim    },
  };

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
        <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text }}>
          Weekly OKR
        </div>
        <div style={{ fontFamily: sans, fontSize: F.xs, color: T.sub }}>
          3 posts · 1 post at 2K+ likes · click a week to filter
        </div>
        <div style={{ marginLeft: "auto", fontFamily: sans, fontSize: F.xs, fontWeight: 600,
          color: onTrack === complete ? T.green : T.yellow }}>
          {onTrack}/{complete} weeks on track
        </div>
        {selectedWeek && (
          <button onClick={() => onWeekSelect(null)} style={{
            background: T.accent, color: "#fff", border: "none",
            borderRadius: 20, padding: "3px 10px", fontSize: F.xs, fontWeight: 600,
            fontFamily: sans, cursor: "pointer",
          }}>
            Week of {weekLabel(selectedWeek)} ✕
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {enriched.map(w => {
          const s       = statusStyle[w.status];
          const isSelected = selectedWeek === w.key;
          return (
            <div key={w.key} onClick={() => onWeekSelect(isSelected ? null : w.key)}
              style={{
                background: isSelected ? (PLAT_COLORS[activePlatform] || T.accent) : s.bg,
                border:     `2px solid ${isSelected ? (PLAT_COLORS[activePlatform] || T.accent) : s.border}`,
                borderRadius: 10, padding: "10px 14px", minWidth: 108, cursor: "pointer",
                transition: "all 0.12s",
                boxShadow: isSelected ? T.shadowMd : "none",
                transform: isSelected ? "translateY(-2px)" : "none",
              }}>
              <div style={{ fontFamily: sans, fontSize: F.xs,
                color: isSelected ? "rgba(255,255,255,0.8)" : T.sub, marginBottom: 4 }}>
                {weekLabel(w.key)}
              </div>
              <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 700,
                color: isSelected ? "#fff" : T.text, marginBottom: 2 }}>
                {w.posts.length} <span style={{ fontWeight: 400,
                  color: isSelected ? "rgba(255,255,255,0.7)" : T.sub }}>posts</span>
              </div>
              <div style={{ fontFamily: sans, fontSize: F.xs,
                color: isSelected ? "rgba(255,255,255,0.9)"
                  : w.maxLikes >= LIKES_GOAL ? T.green : T.sub }}>
                {w.maxLikes >= LIKES_GOAL ? "✓ " : ""}{fmt(w.maxLikes)} top
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Import panel ─────────────────────────────────────────────────────────────
function ImportPanel({ posts, onImported }) {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(null);
  const [message, setMessage] = useState(null);

  // Build a dedup set from existing posts: permalinks + "platform|date|content_start"
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
        // Skip description row (row 0), headers on row 1
        const headerLine = lines[1] || lines[0];
        const headers    = parseCSVLine(headerLine).map(h => h.toLowerCase());
        const dataStart  = headers[0].includes("date") ? 2 : 1;
        const idx        = (name) => headers.findIndex(h => h.includes(name));
        const iDate = 0, iReact = idx("reactions (organic)") !== -1 ? idx("reactions (organic)") : idx("reaction");
        const iImpr = idx("impressions (organic)") !== -1 ? idx("impressions (organic)") : idx("impression");
        const iComm = idx("comments (organic)") !== -1 ? idx("comments (organic)") : idx("comment");
        const iRep  = idx("reposts (organic)") !== -1 ? idx("reposts (organic)") : idx("repost");

        for (let i = dataStart; i < lines.length; i++) {
          const v = parseCSVLine(lines[i]);
          const dateStr = v[0]?.trim();
          if (!dateStr || !dateStr.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/)) continue;
          const parts = dateStr.split(/[\/\-]/);
          let publishedAt;
          // MM/DD/YYYY or DD/MM/YYYY — LinkedIn uses MM/DD/YYYY
          try {
            const [mm, dd, yyyy] = parts.length === 3 ? parts : [parts[1], parts[2], parts[0]];
            publishedAt = new Date(`${yyyy}-${mm.padStart(2,"0")}-${dd.padStart(2,"0")}T12:00:00Z`).toISOString();
          } catch { continue; }
          const post_id = `li_daily_${publishedAt.slice(0,10).replace(/-/g,"")}`;
          const content = `LinkedIn daily — ${fmtDate(publishedAt)}`;
          posts.push({
            platform: "linkedin", post_id, published_at: publishedAt, content, permalink: null,
            likes:       Math.round(parseFloat(v[iReact] || 0)),
            impressions: Math.round(parseFloat(v[iImpr]  || 0)),
            comments:    Math.round(parseFloat(v[iComm]  || 0)),
            shares:      Math.round(parseFloat(v[iRep]   || 0)),
            post_type: "daily_aggregate", source: "csv_import",
          });
        }
      } else if (platform === "buffer") {
        // Buffer CSV: Date, Post Text, Link, Network, Likes/Favorites, Comments, Shares/Retweets, Reach/Impressions
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

      const dupeSkipped = /* original count */ (() => {
        // Re-count by comparing total parsed vs posts sent
        return 0; // approximate — exact count shown in success message
      })();

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
              hint: "Export from LinkedIn analytics",
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

// ─── Platform stats row ───────────────────────────────────────────────────────
function PlatformStats({ posts }) {
  const order = ["instagram", "x", "linkedin", "youtube"];
  const stats = {};
  for (const plat of order) {
    const pp = posts.filter(p => p.platform === plat && p.post_type !== "daily_aggregate");
    if (!pp.length) continue;
    stats[plat] = {
      count:   pp.length,
      likes:   pp.reduce((s, p) => s + parseInt(p.likes || 0), 0),
      impr:    pp.reduce((s, p) => s + parseInt(p.impressions || 0), 0),
      maxLikes:Math.max(...pp.map(p => parseInt(p.likes || 0))),
    };
  }

  const entries = Object.entries(stats);
  if (!entries.length) return null;

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
      {entries.map(([plat, s]) => (
        <div key={plat} style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
          padding: "14px 18px", flex: "1 1 160px", boxShadow: T.shadowSm,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <PlatDot platform={plat} size={12} />
            <span style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text }}>
              {PLAT_LABEL[plat] || plat}
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
            {[["Posts", s.count], ["Total likes", fmt(s.likes)],
              ["Top post", fmt(s.maxLikes) + " likes"], ["Impressions", fmt(s.impr)]
            ].map(([lbl, val]) => (
              <div key={lbl}>
                <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>{lbl}</div>
                <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Top posts ────────────────────────────────────────────────────────────────
function TopPosts({ posts }) {
  const top = [...posts]
    .filter(p => p.post_type !== "daily_aggregate" && parseInt(p.likes || 0) >= 500)
    .sort((a, b) => parseInt(b.likes || 0) - parseInt(a.likes || 0))
    .slice(0, 5);
  if (!top.length) return null;

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text, marginBottom: 12 }}>
        Top performing posts
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {top.map((p, i) => {
          const likes = parseInt(p.likes || 0);
          const isGoal = likes >= LIKES_GOAL;
          return (
            <div key={p.id || i} style={{
              background: isGoal ? T.greenBg : T.accentBg,
              border: `1px solid ${isGoal ? T.greenBorder : T.accentBorder}`,
              borderRadius: 10, padding: "12px 16px", flex: "1 1 180px", maxWidth: 260,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <PlatDot platform={p.platform} size={10} />
                <span style={{ fontFamily: sans, fontSize: F.xs, color: T.sub }}>{fmtDate(p.published_at)}</span>
                {isGoal && <span style={{ marginLeft: "auto", fontFamily: sans, fontSize: F.xs, fontWeight: 700, color: T.green }}>✓ 2K+</span>}
              </div>
              <div style={{
                fontFamily: sans, fontSize: F.xs, color: T.sub, marginBottom: 8, lineHeight: 1.4,
                overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              }}>
                {p.content || "—"}
              </div>
              <div style={{ fontFamily: sans, fontSize: F.lg, fontWeight: 700, color: isGoal ? T.green : T.accent }}>
                {fmt(likes)} <span style={{ fontSize: F.xs, fontWeight: 500, color: T.sub }}>likes</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Outliers ─────────────────────────────────────────────────────────────────
function Outliers({ posts, activePlatform }) {
  const filtered = posts.filter(p => {
    if (p.post_type === "daily_aggregate") return false;
    if (activePlatform !== "all" && p.platform !== activePlatform) return false;
    return true;
  });

  if (filtered.length < 4) return null;

  const withEng = filtered.map(p => ({
    ...p,
    engagement: parseInt(p.likes || 0) + parseInt(p.comments || 0),
  }));

  const avg   = withEng.reduce((s, p) => s + p.engagement, 0) / withEng.length;
  const over  = withEng.filter(p => p.engagement > avg * 1.5)
                       .sort((a, b) => b.engagement - a.engagement).slice(0, 5);
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const under = withEng.filter(p =>
      p.engagement < avg * 0.5 &&
      p.engagement >= 0 &&
      p.published_at &&
      (Date.now() - new Date(p.published_at).getTime()) >= ONE_WEEK_MS
    ).sort((a, b) => a.engagement - b.engagement).slice(0, 5);

  const Row = ({ p, isOver }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12,
      padding: "11px 18px", borderBottom: `1px solid ${T.border}` }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: isOver ? T.greenBg : T.well,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
        {isOver ? "🚀" : "📉"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <PlatDot platform={p.platform} size={9} />
          <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>
            {p.published_at ? new Date(p.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
          </span>
        </div>
        <div style={{ fontFamily: sans, fontSize: F.xs, color: T.text, lineHeight: 1.4,
          overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {p.permalink
            ? <a href={p.permalink} target="_blank" rel="noreferrer"
                 style={{ color: T.text, textDecoration: "none" }}>{p.content || "—"}</a>
            : (p.content || "—")}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <span style={{ fontFamily: sans, fontSize: F.xs, color: T.sub }}>♥ {fmt(p.likes)}</span>
          <span style={{ fontFamily: sans, fontSize: F.xs, color: T.sub }}>✦ {fmt(p.comments)}</span>
        </div>
      </div>
      <span style={{
        fontFamily: sans, fontSize: F.xs, fontWeight: 700, flexShrink: 0,
        color: isOver ? T.green : T.red,
        background: isOver ? T.greenBg : T.redBg,
        border: `1px solid ${isOver ? T.greenBorder : T.redBorder}`,
        borderRadius: 6, padding: "2px 7px",
      }}>
        {isOver ? "+" : ""}{avg > 0 ? Math.round((p.engagement / avg - 1) * 100) : 0}%
      </span>
    </div>
  );

  const platLabel = activePlatform === "all" ? "all platforms" : (PLAT_LABEL[activePlatform] || activePlatform);

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text, marginBottom: 12 }}>
        Outliers · {platLabel}
        <span style={{ fontWeight: 400, color: T.dim, marginLeft: 8 }}>vs {fmt(Math.round(avg))} avg engagement</span>
      </div>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
        boxShadow: T.shadowSm, display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden" }}>
        {/* Overperforming */}
        <div style={{ borderRight: `1px solid ${T.border}` }}>
          <div style={{ padding: "10px 18px 8px", display: "flex", alignItems: "center", gap: 6,
            borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontFamily: sans, fontSize: F.xs, fontWeight: 700, color: T.green }}>↑ OVERPERFORMING</span>
            <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>above 1.5× avg</span>
          </div>
          {over.length === 0
            ? <div style={{ padding: "20px 18px", fontFamily: sans, fontSize: F.sm, color: T.dim }}>No posts above 1.5× avg</div>
            : over.map((p, i) => <Row key={i} p={p} isOver={true} />)}
        </div>
        {/* Underperforming */}
        <div>
          <div style={{ padding: "10px 18px 8px", display: "flex", alignItems: "center", gap: 6,
            borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontFamily: sans, fontSize: F.xs, fontWeight: 700, color: T.red }}>↓ UNDERPERFORMING</span>
            <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>below 0.5× avg</span>
          </div>
          {under.length === 0
            ? <div style={{ padding: "20px 18px", fontFamily: sans, fontSize: F.sm, color: T.dim }}>No posts below 0.5× avg</div>
            : under.map((p, i) => <Row key={i} p={p} isOver={false} />)}
        </div>
      </div>
    </div>
  );
}

// ─── Posts table ──────────────────────────────────────────────────────────────
function PostsTable({ posts, activePlatform, selectedWeek }) {
  const [sortBy,   setSortBy]   = useState("published_at");
  const [sortDesc, setSortDesc] = useState(true);
  const [showAgg,  setShowAgg]  = useState(false);

  const visible = posts.filter(p => {
    if (activePlatform !== "all" && p.platform !== activePlatform) return false;
    if (!showAgg && p.post_type === "daily_aggregate") return false;
    if (selectedWeek && weekKey(p.published_at) !== selectedWeek) return false;
    return true;
  });

  const sorted = [...visible].sort((a, b) => {
    let av = a[sortBy] ?? 0, bv = b[sortBy] ?? 0;
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDesc ? -cmp : cmp;
  });

  function toggleSort(col) {
    if (sortBy === col) setSortDesc(d => !d);
    else { setSortBy(col); setSortDesc(true); }
  }

  const thStyle = (col) => ({
    fontFamily: sans, fontSize: F.xs, fontWeight: 600,
    color: sortBy === col ? T.accent : T.sub,
    padding: "10px 12px", textAlign: "left", cursor: "pointer",
    whiteSpace: "nowrap", borderBottom: `1px solid ${T.border}`, userSelect: "none",
  });

  const td = { padding: "11px 12px", fontFamily: sans, fontSize: F.sm, color: T.text,
    borderBottom: `1px solid ${T.border}`, verticalAlign: "middle" };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <div style={{ fontFamily: sans, fontSize: F.sm, color: T.sub }}>
          {sorted.length} post{sorted.length !== 1 ? "s" : ""}
          {selectedWeek ? ` · week of ${weekLabel(selectedWeek)}` : ""}
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: sans, fontSize: F.xs, color: T.sub, cursor: "pointer", marginLeft: "auto" }}>
          <input type="checkbox" checked={showAgg} onChange={e => setShowAgg(e.target.checked)} />
          Show LinkedIn daily totals
        </label>
      </div>

      <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${T.border}`, boxShadow: T.shadowSm }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: T.card }}>
          <thead>
            <tr style={{ background: T.well }}>
              <th style={thStyle("published_at")} onClick={() => toggleSort("published_at")}>
                Date {sortBy === "published_at" ? (sortDesc ? "↓" : "↑") : ""}
              </th>
              <th style={{ ...thStyle(), cursor: "default" }}>Platform</th>
              <th style={{ ...thStyle(), width: "40%", cursor: "default" }}>Content</th>
              <th style={thStyle("likes")} onClick={() => toggleSort("likes")}>
                Likes {sortBy === "likes" ? (sortDesc ? "↓" : "↑") : ""}
              </th>
              <th style={thStyle("impressions")} onClick={() => toggleSort("impressions")}>
                Impr. {sortBy === "impressions" ? (sortDesc ? "↓" : "↑") : ""}
              </th>
              <th style={thStyle("comments")} onClick={() => toggleSort("comments")}>
                Comments {sortBy === "comments" ? (sortDesc ? "↓" : "↑") : ""}
              </th>
              <th style={{ ...thStyle(), cursor: "default" }}>↗</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr><td colSpan={7} style={{ ...td, textAlign: "center", color: T.dim, padding: 40 }}>
                {selectedWeek ? `No posts for week of ${weekLabel(selectedWeek)}` : "No posts yet — import data above"}
              </td></tr>
            )}
            {sorted.map((p, i) => {
              const likes  = parseInt(p.likes || 0);
              const isHot  = likes >= LIKES_GOAL;
              return (
                <tr key={p.id || i} style={{ background: i % 2 === 0 ? T.card : T.well + "88" }}>
                  <td style={{ ...td, whiteSpace: "nowrap", color: T.sub, fontSize: F.xs }}>
                    {fmtDate(p.published_at)}
                  </td>
                  <td style={td}><PlatDot platform={p.platform} size={12} /></td>
                  <td style={{ ...td, maxWidth: 0 }}>
                    <div style={{
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      fontSize: F.xs, color: p.post_type === "daily_aggregate" ? T.dim : T.text,
                      fontStyle: p.post_type === "daily_aggregate" ? "italic" : "normal",
                    }}>{p.content || "—"}</div>
                  </td>
                  <td style={{ ...td, fontWeight: isHot ? 700 : 400, color: isHot ? T.green : T.text }}>
                    {isHot && "🔥 "}{fmt(likes)}
                  </td>
                  <td style={{ ...td, color: T.sub }}>{fmt(p.impressions)}</td>
                  <td style={{ ...td, color: T.sub }}>{fmt(p.comments)}</td>
                  <td style={td}>
                    {p.permalink
                      ? <a href={p.permalink} target="_blank" rel="noopener noreferrer"
                          style={{ color: T.accent, textDecoration: "none", fontSize: F.xs }}>↗</a>
                      : <span style={{ color: T.dim }}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PostsPage() {
  const [posts,          setPosts]         = useState([]);
  const [loading,        setLoading]       = useState(true);
  const [error,          setError]         = useState(null);
  const [activePlatform, setActivePlatform] = useState("all");
  const [selectedWeek,   setSelectedWeek]  = useState(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/posts?from=${H1_FROM}&to=${H1_TO}&limit=1000`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPosts(data.posts || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  // Platform pills — derived from all posts (including aggregates so LinkedIn always shows)
  const platforms = ["all", ...Array.from(new Set(
    posts.map(p => p.platform)
  )).sort()];

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: sans }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <a href="/" style={{ fontFamily: sans, fontSize: F.xs, color: T.dim, textDecoration: "none" }}>
              ← Dashboard
            </a>
            <h1 style={{ fontFamily: sans, fontSize: F.xl, fontWeight: 700, color: T.text, margin: "6px 0 4px", letterSpacing: "-0.02em" }}>
              Content Calendar
            </h1>
            <div style={{ fontFamily: sans, fontSize: F.sm, color: T.sub }}>
              H1 2026 · Jan – Mar · OKR: 3 posts/week · 1 post at 2K+ likes
            </div>
          </div>
          <button onClick={loadPosts} disabled={loading} style={{
            background: T.well, color: T.sub, border: `1px solid ${T.border}`,
            borderRadius: 8, padding: "7px 14px", fontSize: F.xs, fontWeight: 600,
            fontFamily: sans, cursor: "pointer",
          }}>
            {loading ? "Loading…" : "↻ Refresh"}
          </button>
        </div>

        {/* Import */}
        <ImportPanel posts={posts} onImported={loadPosts} />

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
        ) : posts.length === 0 ? (
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
          <>
            {/* Platform filter */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
              {platforms.map(p => (
                <Pill key={p} active={activePlatform === p} color={PLAT_COLORS[p]}
                  onClick={() => { setActivePlatform(p); setSelectedWeek(null); }}>
                  {p === "all" ? "All platforms" : PLAT_LABEL[p] || p}
                </Pill>
              ))}
            </div>

            {/* Platform stats */}
            <PlatformStats posts={posts} />

            {/* Outliers — updates with platform filter */}
            {!selectedWeek && (
              <Outliers posts={posts} activePlatform={activePlatform} />
            )}

            {/* Weekly OKR — doubles as filter */}
            <WeeklyOKR
              posts={posts}
              activePlatform={activePlatform}
              selectedWeek={selectedWeek}
              onWeekSelect={setSelectedWeek}
            />

            {/* Posts table */}
            <PostsTable
              posts={posts}
              activePlatform={activePlatform}
              selectedWeek={selectedWeek}
            />
          </>
        )}
      </div>
    </div>
  );
}
