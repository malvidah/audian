"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Design tokens (shared with Dashboard) ────────────────────────────────────
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
  blue:         "#2563EB",
  blueBg:       "#EFF6FF",
  shadow:       "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
  shadowSm:     "0 1px 2px rgba(0,0,0,0.05)",
  shadowMd:     "0 4px 24px rgba(0,0,0,0.08)",
};

const PLAT_COLORS = { youtube: "#FF0000", x: "#000000", instagram: "#E1306C", linkedin: "#0077B5" };
const PLAT_LABEL  = { youtube: "YouTube", x: "X", instagram: "Instagram", linkedin: "LinkedIn" };
const PLAT_ICON   = { youtube: "▶", x: "𝕏", instagram: "◉", linkedin: "in" };

const sans = "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif";
const F    = { xl: 28, lg: 20, md: 15, sm: 13, xs: 11 };

const LIKES_GOAL  = 2000;
const POSTS_GOAL  = 3;
const H1_FROM     = "2026-01-01T00:00:00Z";
const H1_TO       = "2026-04-01T00:00:00Z";

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

function weekKey(iso) {
  const d = new Date(iso);
  const mon = new Date(d);
  mon.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
  return mon.toISOString().slice(0, 10);
}

function weekLabel(key) {
  const d = new Date(key + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Small components ─────────────────────────────────────────────────────────
function PlatDot({ platform, size = 8 }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: size + 8, height: size + 8, borderRadius: "50%",
      background: (PLAT_COLORS[platform] || T.dim) + "18",
      fontSize: size * 0.8, flexShrink: 0,
      color: PLAT_COLORS[platform] || T.dim,
    }}>
      {PLAT_ICON[platform] || "·"}
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

function StatusBadge({ status }) {
  const cfg = {
    ON_TRACK:   { label: "On track",   bg: T.greenBg,  color: T.green,  border: T.greenBorder  },
    MIGHT_MISS: { label: "Might miss", bg: T.yellowBg, color: T.yellow, border: T.yellowBorder },
    WILL_MISS:  { label: "Will miss",  bg: T.redBg,    color: T.red,    border: T.redBorder    },
    INCOMPLETE: { label: "Incomplete", bg: T.well,     color: T.dim,    border: T.border       },
  }[status] || { label: status, bg: T.well, color: T.dim, border: T.border };

  return (
    <span style={{
      display: "inline-block", background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`, borderRadius: 6, padding: "2px 8px",
      fontSize: F.xs, fontWeight: 600, fontFamily: sans,
    }}>{cfg.label}</span>
  );
}

// ─── Weekly OKR tracker ───────────────────────────────────────────────────────
function WeeklyOKR({ posts, activePlatform }) {
  const filtered = activePlatform === "all"
    ? posts.filter(p => p.post_type !== "daily_aggregate")
    : posts.filter(p => p.platform === activePlatform && p.post_type !== "daily_aggregate");

  // Group by week
  const weekMap = {};
  for (const p of filtered) {
    if (!p.published_at) continue;
    const k = weekKey(p.published_at);
    if (!weekMap[k]) weekMap[k] = { posts: [], maxLikes: 0, totalLikes: 0 };
    weekMap[k].posts.push(p);
    const lk = parseInt(p.likes || 0);
    if (lk > weekMap[k].maxLikes) weekMap[k].maxLikes = lk;
    weekMap[k].totalLikes += lk;
  }

  const weeks = Object.entries(weekMap).sort((a, b) => a[0].localeCompare(b[0]));
  if (weeks.length === 0) return null;

  // Determine status per week
  const enriched = weeks.map(([k, w]) => {
    const postsOk  = w.posts.length >= POSTS_GOAL;
    const likesOk  = w.maxLikes >= LIKES_GOAL;
    let status;
    if (postsOk && likesOk)        status = "ON_TRACK";
    else if (postsOk || likesOk)   status = "MIGHT_MISS";
    else                           status = "WILL_MISS";
    // Last partial week → incomplete
    const weekEnd = new Date(k);
    weekEnd.setDate(weekEnd.getDate() + 6);
    if (weekEnd > new Date()) status = "INCOMPLETE";
    return { key: k, ...w, status };
  });

  const onTrack  = enriched.filter(w => w.status === "ON_TRACK").length;
  const complete = enriched.filter(w => w.status !== "INCOMPLETE").length;

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Summary row */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 14 }}>
        <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text }}>
          Weekly OKR Tracker
        </div>
        <div style={{ fontFamily: sans, fontSize: F.xs, color: T.sub }}>
          3 posts/week · 1 post hitting 2K+ likes
        </div>
        <div style={{ marginLeft: "auto", fontFamily: sans, fontSize: F.xs, fontWeight: 600, color: onTrack === complete ? T.green : T.yellow }}>
          {onTrack}/{complete} weeks on track
        </div>
      </div>

      {/* Week grid */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {enriched.map(w => (
          <div key={w.key} style={{
            background: {
              ON_TRACK:   T.greenBg,
              MIGHT_MISS: T.yellowBg,
              WILL_MISS:  T.redBg,
              INCOMPLETE: T.well,
            }[w.status],
            border: `1px solid ${({
              ON_TRACK:   T.greenBorder,
              MIGHT_MISS: T.yellowBorder,
              WILL_MISS:  T.redBorder,
              INCOMPLETE: T.border,
            })[w.status]}`,
            borderRadius: 10, padding: "10px 14px", minWidth: 110,
          }}>
            <div style={{ fontFamily: sans, fontSize: F.xs, color: T.sub, marginBottom: 4 }}>
              {weekLabel(w.key)}
            </div>
            <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 700, color: T.text, marginBottom: 2 }}>
              {w.posts.length} <span style={{ fontWeight: 400, color: T.sub }}>posts</span>
            </div>
            <div style={{ fontFamily: sans, fontSize: F.xs, color: w.maxLikes >= LIKES_GOAL ? T.green : T.sub }}>
              {w.maxLikes >= LIKES_GOAL ? "✓" : ""} {fmt(w.maxLikes)} top likes
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Import panel ─────────────────────────────────────────────────────────────
function ImportPanel({ onImported }) {
  const [open,     setOpen]     = useState(false);
  const [loading,  setLoading]  = useState(null);
  const [message,  setMessage]  = useState(null);

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
      const text = await file.text();
      let posts  = [];

      if (platform === "x") {
        // Parse X CSV
        const lines   = text.split("\n").filter(l => l.trim());
        const headers = parseCSVLine(lines[0]);
        for (let i = 1; i < lines.length; i++) {
          const vals = parseCSVLine(lines[i]);
          if (!vals[1]) continue;
          const dateStr = vals[1].trim();
          let publishedAt;
          try { publishedAt = new Date(dateStr).toISOString(); } catch { continue; }
          posts.push({
            platform:     "x",
            post_id:      vals[0]?.trim(),
            published_at: publishedAt,
            content:      vals[2]?.trim() || "",
            permalink:    vals[3]?.trim() || null,
            impressions:  parseInt(vals[4]  || 0),
            likes:        parseInt(vals[5]  || 0),
            shares:       parseInt(vals[11] || 0),
            saves:        parseInt(vals[7]  || 0),
            comments:     parseInt(vals[10] || 0),
            post_type:    "post",
            source:       "csv_import",
          });
        }
      } else if (platform === "linkedin") {
        // Parse LinkedIn XLS-exported-as-CSV, or handle daily aggregates
        const lines = text.split("\n").filter(l => l.trim());
        // Skip description row (row 0) and use row 1 as headers
        let dataStart = 2;
        for (let i = dataStart; i < lines.length; i++) {
          const vals = parseCSVLine(lines[i]);
          const dateStr = vals[0]?.trim();
          if (!dateStr || !dateStr.match(/\d{2}\/\d{2}\/\d{4}/)) continue;
          const [mm, dd, yyyy] = dateStr.split("/");
          const publishedAt = new Date(`${yyyy}-${mm}-${dd}T12:00:00Z`).toISOString();
          const reactions   = parseFloat(vals[8] || 0);
          const impressions = parseFloat(vals[1] || 0);
          const comments    = parseFloat(vals[11] || 0);
          const reposts     = parseFloat(vals[14] || 0);
          posts.push({
            platform:     "linkedin",
            post_id:      `li_daily_${yyyy}${mm}${dd}`,
            published_at: publishedAt,
            content:      `LinkedIn daily — ${dateStr}`,
            permalink:    null,
            likes:        Math.round(reactions),
            impressions:  Math.round(impressions),
            comments:     Math.round(comments),
            shares:       Math.round(reposts),
            post_type:    "daily_aggregate",
            source:       "csv_import",
          });
        }
      }

      if (posts.length === 0) {
        setMessage("No posts parsed — check file format.");
        return;
      }

      // Chunk into batches of 100
      let total = 0;
      for (let i = 0; i < posts.length; i += 100) {
        const batch = posts.slice(i, i + 100);
        const res   = await fetch("/api/posts/import", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ posts: batch }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        total += data.imported || batch.length;
      }
      setMessage(`✓ Imported ${total} ${platform} records`);
      onImported();
    } catch (e) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setLoading(null);
    }
  }

  function parseCSVLine(line) {
    const result = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; }
      else if (ch === "," && !inQ) { result.push(cur); cur = ""; }
      else { cur += ch; }
    }
    result.push(cur);
    return result;
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
          borderRadius: 12, padding: 20, display: "flex", flexWrap: "wrap", gap: 16,
        }}>
          {/* Instagram sync */}
          <div style={{ minWidth: 200 }}>
            <div style={{ fontFamily: sans, fontSize: F.xs, fontWeight: 600, color: T.text, marginBottom: 6 }}>
              Instagram
            </div>
            <button disabled={loading === "instagram"} onClick={syncInstagram} style={{
              background: "#E1306C18", color: "#E1306C", border: "1px solid #E1306C44",
              borderRadius: 7, padding: "6px 14px", fontSize: F.xs, fontWeight: 600,
              fontFamily: sans, cursor: "pointer",
            }}>
              {loading === "instagram" ? "Syncing…" : "Sync from API"}
            </button>
            <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim, marginTop: 4 }}>
              Pulls posts from last sync
            </div>
          </div>

          {/* X import */}
          <div style={{ minWidth: 220 }}>
            <div style={{ fontFamily: sans, fontSize: F.xs, fontWeight: 600, color: T.text, marginBottom: 6 }}>
              X / Twitter
            </div>
            <label style={{
              display: "inline-block", background: "#00000010", color: T.text,
              border: `1px solid ${T.border}`, borderRadius: 7, padding: "6px 14px",
              fontSize: F.xs, fontWeight: 600, fontFamily: sans, cursor: "pointer",
            }}>
              {loading === "x" ? "Importing…" : "Upload CSV"}
              <input type="file" accept=".csv" style={{ display: "none" }}
                onChange={e => importFile("x", e.target.files[0])} />
            </label>
            <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim, marginTop: 4 }}>
              Export from analytics.twitter.com
            </div>
          </div>

          {/* LinkedIn import */}
          <div style={{ minWidth: 220 }}>
            <div style={{ fontFamily: sans, fontSize: F.xs, fontWeight: 600, color: T.text, marginBottom: 6 }}>
              LinkedIn
            </div>
            <label style={{
              display: "inline-block", background: "#0077B510", color: "#0077B5",
              border: "1px solid #0077B544", borderRadius: 7, padding: "6px 14px",
              fontSize: F.xs, fontWeight: 600, fontFamily: sans, cursor: "pointer",
            }}>
              {loading === "linkedin" ? "Importing…" : "Upload CSV/XLS"}
              <input type="file" accept=".csv,.xls,.xlsx" style={{ display: "none" }}
                onChange={e => importFile("linkedin", e.target.files[0])} />
            </label>
            <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim, marginTop: 4 }}>
              Export from LinkedIn analytics
            </div>
          </div>

          {message && (
            <div style={{
              width: "100%", fontFamily: sans, fontSize: F.xs, fontWeight: 500,
              color: message.startsWith("✓") ? T.green : T.red,
              background: message.startsWith("✓") ? T.greenBg : T.redBg,
              border: `1px solid ${message.startsWith("✓") ? T.greenBorder : T.redBorder}`,
              borderRadius: 7, padding: "8px 12px",
            }}>{message}</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Posts table ──────────────────────────────────────────────────────────────
function PostsTable({ posts, activePlatform }) {
  const [sortBy,    setSortBy]    = useState("published_at");
  const [sortDesc,  setSortDesc]  = useState(true);
  const [showAgg,   setShowAgg]   = useState(false);

  const visible = posts.filter(p => {
    if (activePlatform !== "all" && p.platform !== activePlatform) return false;
    if (!showAgg && p.post_type === "daily_aggregate") return false;
    return true;
  });

  const sorted = [...visible].sort((a, b) => {
    const av = a[sortBy] ?? 0;
    const bv = b[sortBy] ?? 0;
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDesc ? -cmp : cmp;
  });

  function toggleSort(col) {
    if (sortBy === col) setSortDesc(d => !d);
    else { setSortBy(col); setSortDesc(true); }
  }

  const thStyle = (col) => ({
    fontFamily: sans, fontSize: F.xs, fontWeight: 600, color: sortBy === col ? T.accent : T.sub,
    padding: "10px 12px", textAlign: "left", cursor: "pointer", whiteSpace: "nowrap",
    borderBottom: `1px solid ${T.border}`, userSelect: "none",
  });

  const tdStyle = {
    padding: "11px 12px", fontFamily: sans, fontSize: F.sm, color: T.text,
    borderBottom: `1px solid ${T.border}`, verticalAlign: "middle",
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <div style={{ fontFamily: sans, fontSize: F.sm, color: T.sub }}>
          {sorted.length} posts
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: sans, fontSize: F.xs, color: T.sub, cursor: "pointer" }}>
          <input type="checkbox" checked={showAgg} onChange={e => setShowAgg(e.target.checked)} />
          Show LinkedIn daily aggregates
        </label>
      </div>

      <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${T.border}`, boxShadow: T.shadowSm }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: T.card }}>
          <thead>
            <tr style={{ background: T.well }}>
              <th style={thStyle("published_at")} onClick={() => toggleSort("published_at")}>
                Date {sortBy === "published_at" ? (sortDesc ? "↓" : "↑") : ""}
              </th>
              <th style={{ ...thStyle("platform") }}>Platform</th>
              <th style={{ ...thStyle("content"), width: "40%" }}>Content</th>
              <th style={thStyle("likes")} onClick={() => toggleSort("likes")}>
                Likes {sortBy === "likes" ? (sortDesc ? "↓" : "↑") : ""}
              </th>
              <th style={thStyle("impressions")} onClick={() => toggleSort("impressions")}>
                Impressions {sortBy === "impressions" ? (sortDesc ? "↓" : "↑") : ""}
              </th>
              <th style={thStyle("comments")} onClick={() => toggleSort("comments")}>
                Comments {sortBy === "comments" ? (sortDesc ? "↓" : "↑") : ""}
              </th>
              <th style={{ ...thStyle("permalink"), cursor: "default" }}>Link</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} style={{ ...tdStyle, textAlign: "center", color: T.dim, padding: "40px" }}>
                  No posts yet — import data above or run Instagram sync
                </td>
              </tr>
            )}
            {sorted.map((p, i) => {
              const likes = parseInt(p.likes || 0);
              const isHot = likes >= LIKES_GOAL;
              return (
                <tr key={p.id || i} style={{ background: i % 2 === 0 ? T.card : T.well + "88" }}>
                  <td style={{ ...tdStyle, whiteSpace: "nowrap", color: T.sub, fontSize: F.xs }}>
                    {fmtDate(p.published_at)}
                  </td>
                  <td style={{ ...tdStyle }}>
                    <PlatDot platform={p.platform} size={12} />
                  </td>
                  <td style={{ ...tdStyle, maxWidth: 0 }}>
                    <div style={{
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      fontSize: F.xs, color: p.post_type === "daily_aggregate" ? T.dim : T.text,
                      fontStyle: p.post_type === "daily_aggregate" ? "italic" : "normal",
                    }}>
                      {p.content || "—"}
                    </div>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: isHot ? 700 : 400, color: isHot ? T.green : T.text }}>
                    {isHot && <span style={{ marginRight: 3 }}>🔥</span>}
                    {fmt(likes)}
                  </td>
                  <td style={{ ...tdStyle, color: T.sub }}>{fmt(p.impressions)}</td>
                  <td style={{ ...tdStyle, color: T.sub }}>{fmt(p.comments)}</td>
                  <td style={{ ...tdStyle }}>
                    {p.permalink ? (
                      <a href={p.permalink} target="_blank" rel="noopener noreferrer"
                        style={{ color: T.accent, textDecoration: "none", fontSize: F.xs }}>↗</a>
                    ) : "—"}
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

// ─── Top posts highlight ──────────────────────────────────────────────────────
function TopPosts({ posts }) {
  const top = [...posts]
    .filter(p => p.post_type !== "daily_aggregate" && parseInt(p.likes || 0) >= 500)
    .sort((a, b) => parseInt(b.likes || 0) - parseInt(a.likes || 0))
    .slice(0, 5);

  if (top.length === 0) return null;

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
              <div style={{ fontFamily: sans, fontSize: F.xs, color: T.sub, marginBottom: 8, lineHeight: 1.4,
                overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
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

// ─── Platform summary stats ───────────────────────────────────────────────────
function PlatformStats({ posts }) {
  const platforms = ["instagram", "x", "linkedin", "youtube"];
  const stats = {};
  for (const plat of platforms) {
    const pp = posts.filter(p => p.platform === plat && p.post_type !== "daily_aggregate");
    if (pp.length === 0) continue;
    const likes = pp.reduce((s, p) => s + parseInt(p.likes || 0), 0);
    const impr  = pp.reduce((s, p) => s + parseInt(p.impressions || 0), 0);
    const maxLk = Math.max(...pp.map(p => parseInt(p.likes || 0)));
    stats[plat] = { count: pp.length, likes, impressions: impr, maxLikes: maxLk };
  }

  const entries = Object.entries(stats);
  if (entries.length === 0) return null;

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
              {PLAT_LABEL[plat]}
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 0" }}>
            {[
              ["Posts",  s.count],
              ["Likes",  fmt(s.likes)],
              ["Top post", fmt(s.maxLikes) + " likes"],
              ["Impressions", fmt(s.impressions)],
            ].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>{label}</div>
                <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PostsPage() {
  const [posts,          setPosts]         = useState([]);
  const [loading,        setLoading]       = useState(true);
  const [activePlatform, setActivePlatform] = useState("all");
  const [error,          setError]         = useState(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

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

  const platforms = ["all", ...Array.from(new Set(posts.map(p => p.platform))).sort()];

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: sans }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <a href="/" style={{ fontFamily: sans, fontSize: F.xs, color: T.dim, textDecoration: "none" }}>← Dashboard</a>
            </div>
            <h1 style={{ fontFamily: sans, fontSize: F.xl, fontWeight: 700, color: T.text, margin: 0, letterSpacing: "-0.02em" }}>
              Content Calendar
            </h1>
            <div style={{ fontFamily: sans, fontSize: F.sm, color: T.sub, marginTop: 4 }}>
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

        {/* Import panel */}
        <ImportPanel onImported={loadPosts} />

        {error && (
          <div style={{ background: T.redBg, border: `1px solid ${T.redBorder}`, borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontFamily: sans, fontSize: F.sm, color: T.red }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", fontFamily: sans, fontSize: F.sm, color: T.dim }}>
            Loading posts…
          </div>
        ) : posts.length === 0 ? (
          <div style={{
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
            padding: "60px 40px", textAlign: "center", boxShadow: T.shadowSm,
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
            <div style={{ fontFamily: sans, fontSize: F.md, fontWeight: 600, color: T.text, marginBottom: 6 }}>
              No posts yet
            </div>
            <div style={{ fontFamily: sans, fontSize: F.sm, color: T.sub }}>
              Use the Import panel above to load your X CSV, LinkedIn export, or sync Instagram posts.
            </div>
          </div>
        ) : (
          <>
            {/* Platform filter */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
              {platforms.map(p => (
                <Pill key={p} active={activePlatform === p} color={PLAT_COLORS[p]}
                  onClick={() => setActivePlatform(p)}>
                  {p === "all" ? "All platforms" : PLAT_LABEL[p] || p}
                </Pill>
              ))}
            </div>

            {/* Platform stats */}
            <PlatformStats posts={posts} />

            {/* Top posts */}
            <TopPosts posts={posts} />

            {/* Weekly OKR */}
            <WeeklyOKR posts={posts} activePlatform={activePlatform} />

            {/* Posts table */}
            <PostsTable posts={posts} activePlatform={activePlatform} />
          </>
        )}
      </div>
    </div>
  );
}
