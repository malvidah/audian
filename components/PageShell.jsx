"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { PlatDot, PLAT_COLORS } from "./PlatIcon";
import ReportModal from "./ReportModal";
// Re-export design system so pages that import PageShell still work
export { T, sans, F, fmt, fmtDate, timeAgo, truncate, PLAT_LABEL } from "../lib/design.js";
import { T, sans, F, fmt, fmtDate, timeAgo, PLAT_LABEL } from "../lib/design.js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function daysAgo(n) {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10);
}
const TODAY = new Date().toISOString().slice(0, 10);

// ─── MiniCalendar ─────────────────────────────────────────────────────────────
const CAL_DAYS  = ["S", "M", "T", "W", "T", "F", "S"];
const CAL_MONTHS = ["January","February","March","April","May","June",
                    "July","August","September","October","November","December"];

function MiniCalendar({ value, onChange, onClose, anchorRef }) {
  const today     = new Date();
  const initDate  = value ? new Date(value + "T12:00:00") : today;
  const [view, setView] = useState({ year: initDate.getFullYear(), month: initDate.getMonth() });
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target) &&
          anchorRef?.current && !anchorRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, anchorRef]);

  const { year, month } = view;
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstDow).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );
  while (cells.length % 7 !== 0) cells.push(null);

  const pad = n => String(n).padStart(2, "0");
  const cellToIso = d => `${year}-${pad(month + 1)}-${pad(d)}`;
  const todayIso  = today.toISOString().slice(0, 10);

  const nav = (delta) => setView(v => {
    let m = v.month + delta, y = v.year;
    if (m < 0)  { m = 11; y--; }
    if (m > 11) { m = 0;  y++; }
    return { year: y, month: m };
  });

  return (
    <div ref={ref} style={{
      position: "absolute", zIndex: 9999, marginTop: 6,
      background: "#fff", borderRadius: 14,
      boxShadow: "0 8px 32px rgba(0,0,0,0.13), 0 1px 4px rgba(0,0,0,0.06)",
      padding: "16px 16px 12px",
      width: 252,
      fontFamily: sans,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button onClick={() => nav(-1)} style={{
          background: "none", border: "none", cursor: "pointer",
          width: 28, height: 28, borderRadius: 8, display: "flex",
          alignItems: "center", justifyContent: "center",
          color: T.sub, fontSize: 14, transition: "background 0.1s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = T.well}
          onMouseLeave={e => e.currentTarget.style.background = "none"}
        >‹</button>

        <button onClick={() => {
          const now = new Date();
          setView({ year: now.getFullYear(), month: now.getMonth() });
        }} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: F.sm, fontWeight: 600, color: T.text, letterSpacing: "-0.01em",
          padding: "2px 8px", borderRadius: 6, transition: "background 0.1s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = T.well}
          onMouseLeave={e => e.currentTarget.style.background = "none"}
        >
          {CAL_MONTHS[month]} {year}
        </button>

        <button onClick={() => nav(1)} style={{
          background: "none", border: "none", cursor: "pointer",
          width: 28, height: 28, borderRadius: 8, display: "flex",
          alignItems: "center", justifyContent: "center",
          color: T.sub, fontSize: 14, transition: "background 0.1s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = T.well}
          onMouseLeave={e => e.currentTarget.style.background = "none"}
        >›</button>
      </div>

      {/* Weekday labels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
        {CAL_DAYS.map((d, i) => (
          <div key={i} style={{
            textAlign: "center", fontSize: 10, fontWeight: 600,
            color: T.dim, letterSpacing: "0.06em", padding: "2px 0",
          }}>{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px 0" }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const iso = cellToIso(d);
          const isSelected = iso === value;
          const isToday    = iso === todayIso;
          return (
            <button key={i} onClick={() => { onChange(iso); onClose(); }}
              style={{
                background: isSelected ? T.accent : "none",
                border: "none", borderRadius: 8, cursor: "pointer",
                fontFamily: sans, fontSize: F.xs, fontWeight: isSelected ? 700 : isToday ? 600 : 400,
                color: isSelected ? "#fff" : isToday ? T.accent : T.text,
                height: 32, width: "100%",
                position: "relative",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = T.well; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "none"; }}
            >
              {d}
              {isToday && !isSelected && (
                <span style={{
                  position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)",
                  width: 3, height: 3, borderRadius: "50%", background: T.accent,
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}`,
      }}>
        <button onClick={() => { onChange(""); onClose(); }} style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: sans, fontSize: F.xs, fontWeight: 500, color: T.dim,
          padding: "4px 6px", borderRadius: 6, transition: "color 0.1s",
        }}
          onMouseEnter={e => e.currentTarget.style.color = T.text}
          onMouseLeave={e => e.currentTarget.style.color = T.dim}
        >Clear</button>
        <button onClick={() => {
          onChange(todayIso);
          onClose();
        }} style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: sans, fontSize: F.xs, fontWeight: 600, color: T.accent,
          padding: "4px 6px", borderRadius: 6, transition: "opacity 0.1s",
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >Today</button>
      </div>
    </div>
  );
}

// ─── Quarter helpers ──────────────────────────────────────────────────────────
// Q0=Winter(Jan-Mar), Q1=Spring(Apr-Jun), Q2=Summer(Jul-Sep), Q3=Fall(Oct-Dec)
const QUARTER_NAMES = ["Winter", "Spring", "Summer", "Fall"];
function quarterDates(year, q) {
  const startMonth = q * 3;
  const endMonth = startMonth + 2;
  const pad = n => String(n).padStart(2, "0");
  const start = `${year}-${pad(startMonth + 1)}-01`;
  const lastDay = new Date(year, endMonth + 1, 0).getDate();
  const end = `${year}-${pad(endMonth + 1)}-${lastDay}`;
  return { start, end };
}
function currentQuarter() {
  const now = new Date();
  return { year: now.getFullYear(), q: Math.floor(now.getMonth() / 3) };
}
function quarterPresets() {
  const { year, q } = currentQuarter();
  const presets = [];
  for (let i = 3; i >= 0; i--) {
    let pq = q - i, py = year;
    if (pq < 0) { pq += 4; py -= 1; }
    const { start, end } = quarterDates(py, pq);
    presets.push({
      key: `q${pq}_${py}`,
      label: `${QUARTER_NAMES[pq]} ${py}`,
      from: start,
      to: end,
      isCurrent: i === 0,
    });
  }
  return presets;
}

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
  { key: "engagement",   label: "Posts",        emoji: "\uD83D\uDCCA", href: "/" },
  { key: "interactions", label: "Interactions", emoji: "\uD83E\uDD1D", href: "/interactions" },
  { key: "handles",      label: "People & Organizations", emoji: "\uD83D\uDC64", href: "/peopleandorganizations" },
  { key: "report",       label: "Report",       emoji: "\uD83D\uDCCB", href: "/report" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  const [tab,      setTab]      = useState("password"); // "magic" | "password"
  const [email,    setEmail]    = useState("");
  const [sent,     setSent]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passErr,  setPassErr]  = useState(null);

  async function goMagic() {
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    if (!error) setSent(true);
    setLoading(false);
  }

  async function goPassword() {
    if (!username || !password) return;
    setLoading(true);
    setPassErr(null);
    try {
      // Look up email for this username from user_settings (RLS disabled — anon read OK)
      const res = await fetch("/api/settings");
      const { settings } = await res.json();
      if (!settings.auth_username || settings.auth_username !== username) {
        setPassErr("Invalid username or password");
        setLoading(false);
        return;
      }
      const authEmail = settings.auth_email;
      if (!authEmail) {
        setPassErr("No email linked to this username. Ask your admin to configure it.");
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password });
      if (error) setPassErr("Invalid username or password");
    } catch {
      setPassErr("Sign in failed. Try again.");
    }
    setLoading(false);
  }

  const inputStyle = {
    width: "100%", background: T.well, border: `1px solid ${T.border}`, borderRadius: 8,
    padding: "10px 12px", color: T.text, fontFamily: sans, fontSize: F.sm,
    outline: "none", boxSizing: "border-box", marginBottom: 10,
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sans }}>
      <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, padding: "40px 44px", maxWidth: 380, width: "100%", boxShadow: T.shadowMd }}>
        {/* Logo */}
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
        <div style={{ fontSize: F.sm, color: T.sub, marginBottom: 20 }}>Sign in to your workspace</div>

        {/* Tab switcher */}
        <div style={{ display: "flex", background: T.well, borderRadius: 9, padding: 3, marginBottom: 20 }}>
          {[["password", "Username"], ["magic", "Magic link"]].map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key); setPassErr(null); setSent(false); }}
              style={{
                flex: 1, padding: "7px 0", borderRadius: 7, border: "none", cursor: "pointer",
                fontFamily: sans, fontSize: F.xs, fontWeight: 600,
                background: tab === key ? T.card : "transparent",
                color: tab === key ? T.text : T.sub,
                boxShadow: tab === key ? T.shadowSm : "none",
                transition: "all 0.15s",
              }}>
              {label}
            </button>
          ))}
        </div>

        {tab === "magic" ? (
          sent ? (
            <div style={{ background: T.greenBg, border: `1px solid ${T.greenBorder}`, borderRadius: 8, padding: "12px 14px", fontSize: F.sm, color: T.green }}>
              Check your email for the magic link.
            </div>
          ) : (
            <>
              <input type="email" placeholder="you@company.com" value={email}
                onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && goMagic()}
                style={inputStyle} />
              <button onClick={goMagic} disabled={loading}
                style={{ width: "100%", background: T.accent, border: "none", borderRadius: 8, padding: "11px", color: "#fff", fontFamily: sans, fontSize: F.sm, fontWeight: 600, cursor: "pointer" }}>
                {loading ? "Sending..." : "Continue with email"}
              </button>
            </>
          )
        ) : (
          <>
            <input placeholder="Username" value={username}
              onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === "Enter" && goPassword()}
              style={inputStyle} autoComplete="username" />
            <input type="password" placeholder="Password" value={password}
              onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && goPassword()}
              style={{ ...inputStyle, marginBottom: passErr ? 8 : 10 }} autoComplete="current-password" />
            {passErr && (
              <div style={{ fontSize: F.xs, color: T.red, marginBottom: 10 }}>{passErr}</div>
            )}
            <button onClick={goPassword} disabled={loading || !username || !password}
              style={{
                width: "100%", background: T.accent, border: "none", borderRadius: 8,
                padding: "11px", color: "#fff", fontFamily: sans, fontSize: F.sm,
                fontWeight: 600, cursor: loading ? "wait" : "pointer",
                opacity: !username || !password ? 0.6 : 1,
              }}>
              {loading ? "Signing in..." : "Sign in"}
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

function ProfileMenu({ session, avatarUrl, onAvatarChange, connections = [], onDisconnect, posts, onImported }) {
  const [open, setOpen] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [disconnecting, setDisconnecting] = useState(null);
  const [syncing, setSyncing] = useState(null);           // platform id currently syncing
  const [syncResult, setSyncResult] = useState({});       // { [platformId]: { ok, msg } }
  const [csvUploading, setCsvUploading] = useState(null); // platform id currently uploading CSV
  const [editingChannel, setEditingChannel] = useState(false);  // youtube channel edit mode
  const [channelInput, setChannelInput]     = useState("");
  const [channelSaving, setChannelSaving]   = useState(false);
  const [channelResult, setChannelResult]   = useState(null);
  // Login settings
  const [showLoginSettings, setShowLoginSettings] = useState(false);
  const [loginUsername,     setLoginUsername]     = useState("");
  const [newPassword,       setNewPassword]       = useState("");
  const [loginSaving,       setLoginSaving]       = useState(false);
  const [loginMsg,          setLoginMsg]          = useState(null);
  // Account avatar upload
  const [localAvatarUrl,   setLocalAvatarUrl]   = useState(avatarUrl);
  const [avatarUploading,  setAvatarUploading]  = useState(false);
  const [avatarHover,      setAvatarHover]      = useState(false);
  const avatarFileRef = useRef(null);
  const menuRef    = useRef(null);
  const csvFileRef = useRef(null);
  const csvPlatRef = useRef(null); // which platform the pending file input is for
  const email = session?.user?.email || "";
  const initial = email[0]?.toUpperCase() || "?";

  // Sync prop → local when parent re-fetches
  useEffect(() => { setLocalAvatarUrl(avatarUrl); }, [avatarUrl]);

  async function handleAvatarUpload(file) {
    if (!file || avatarUploading) return;
    setAvatarUploading(true);
    const preview = URL.createObjectURL(file);
    setLocalAvatarUrl(preview);
    try {
      const form = new FormData();
      form.append("file", file);
      const res  = await fetch("/api/account/avatar", { method: "POST", body: form });
      const data = await res.json();
      if (data.url) {
        setLocalAvatarUrl(data.url);
        onAvatarChange?.(data.url);
      } else {
        setLocalAvatarUrl(avatarUrl); // revert on error
      }
    } catch {
      setLocalAvatarUrl(avatarUrl);
    } finally {
      setAvatarUploading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    function handle(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // Load current login username when menu opens
  useEffect(() => {
    if (!open) return;
    fetch("/api/settings").then(r => r.json()).then(d => {
      if (d.settings?.auth_username) setLoginUsername(d.settings.auth_username);
    }).catch(() => {});
  }, [open]);

  async function saveLoginSettings() {
    setLoginSaving(true);
    setLoginMsg(null);
    try {
      const updates = { auth_username: loginUsername, auth_email: email };
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (newPassword) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw new Error(error.message);
        setNewPassword("");
      }
      setLoginMsg("Saved ✓");
      setTimeout(() => setLoginMsg(null), 3000);
    } catch (e) {
      setLoginMsg("Error: " + e.message);
    }
    setLoginSaving(false);
  }

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
      setTimeout(() => setSyncResult(r => ({ ...r, [platformId]: null })), 4000);
    }
  }

  async function uploadFollowersCsv(platformId, file) {
    if (!file || csvUploading) return;
    setCsvUploading(platformId);
    setSyncResult(r => ({ ...r, [platformId]: null }));
    try {
      const csv  = await file.text();
      const res  = await fetch("/api/followers/import", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ platform: platformId, csv }),
      });
      const data = await res.json();
      const ok   = !data.error;
      setSyncResult(r => ({ ...r, [platformId]: {
        ok,
        msg: ok ? `Imported ${data.inserted} data points` : data.error,
      }}));
      if (ok) onImported?.();
    } catch (e) {
      setSyncResult(r => ({ ...r, [platformId]: { ok: false, msg: e.message } }));
    } finally {
      setCsvUploading(null);
      setTimeout(() => setSyncResult(r => ({ ...r, [platformId]: null })), 5000);
    }
  }

  async function saveChannel() {
    if (!channelInput.trim() || channelSaving) return;
    setChannelSaving(true);
    setChannelResult(null);
    try {
      const res  = await fetch("/api/auth/youtube/channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: channelInput.trim() }),
      });
      const data = await res.json();
      if (data.error) {
        setChannelResult({ ok: false, msg: data.error });
      } else {
        setChannelResult({ ok: true, msg: `Connected to ${data.channel_name}` });
        setEditingChannel(false);
        setChannelInput("");
        onImported?.();   // refresh connections list in parent
      }
    } catch (e) {
      setChannelResult({ ok: false, msg: e.message });
    } finally {
      setChannelSaving(false);
    }
  }

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{
          width: 36, height: 36, borderRadius: "50%",
          background: localAvatarUrl ? `url(${localAvatarUrl}) center/cover` : `linear-gradient(135deg, ${T.accent} 0%, #ff9060 100%)`,
          border: open ? `2px solid ${T.accent}` : "2px solid transparent",
          boxShadow: open ? `0 0 0 3px ${T.accent}30` : "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "all 0.15s",
          fontFamily: sans, fontSize: 14, fontWeight: 700, color: "#fff",
          overflow: "hidden", flexShrink: 0,
        }}>
        {!localAvatarUrl && initial}
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
              {/* Clickable avatar — click to upload new photo */}
              <div
                style={{ position: "relative", width: 42, height: 42, flexShrink: 0, cursor: "pointer" }}
                onMouseEnter={() => setAvatarHover(true)}
                onMouseLeave={() => setAvatarHover(false)}
                onClick={() => avatarFileRef.current?.click()}
                title="Click to update profile photo"
              >
                <div style={{
                  width: 42, height: 42, borderRadius: "50%",
                  background: localAvatarUrl ? `url(${localAvatarUrl}) center/cover` : `linear-gradient(135deg, ${T.accent} 0%, #ff9060 100%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: sans, fontSize: 16, fontWeight: 700, color: "#fff", overflow: "hidden",
                  transition: "opacity 0.15s",
                  opacity: avatarUploading ? 0.5 : 1,
                }}>
                  {!localAvatarUrl && initial}
                </div>
                {(avatarHover || avatarUploading) && (
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: "50%",
                    background: "rgba(0,0,0,0.45)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {avatarUploading ? (
                      <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>…</span>
                    ) : (
                      <svg width={17} height={17} viewBox="0 0 24 24" fill="none"
                        stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                    )}
                  </div>
                )}
                <input
                  ref={avatarFileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: "none" }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f); e.target.value = ""; }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email.split("@")[0]}</div>
                <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {avatarUploading ? "Uploading…" : email}
                </div>
              </div>
            </div>
          </div>

          {/* Platform connections */}
          <div style={{ padding: "10px 0" }}>
            <div style={{ padding: "4px 18px 8px", fontFamily: sans, fontSize: 10, fontWeight: 600, color: T.dim, letterSpacing: "0.06em", textTransform: "uppercase" }}>Connections</div>
            {/* Hidden file input for CSV follower uploads — shared across all platforms */}
            <input
              ref={csvFileRef} type="file" accept=".csv,text/csv" style={{ display: "none" }}
              onChange={e => {
                const file = e.target.files?.[0];
                if (file && csvPlatRef.current) uploadFollowersCsv(csvPlatRef.current, file);
                e.target.value = ""; // reset so same file can be re-uploaded
              }}
            />

            {PLAT_META.map(p => {
              const conn        = connections.find(c => c.platform === p.id);
              const isConnected = !!conn;
              const isDisc      = disconnecting === p.id;
              const isSyncing   = syncing === p.id;
              const isCsvUp     = csvUploading === p.id;
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
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{conn.channel_name}</div>
                          {/* YouTube: pencil to switch channel */}
                          {p.id === "youtube" && (
                            <button title="Switch channel" onClick={() => { setEditingChannel(e => !e); setChannelInput(""); setChannelResult(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: T.dim, fontSize: 10, padding: "0 2px", lineHeight: 1 }}>✎</button>
                          )}
                        </div>
                      )}
                      {/* YouTube: not yet connected or no channel_name — show edit prompt */}
                      {p.id === "youtube" && isConnected && !conn?.channel_name && (
                        <button onClick={() => setEditingChannel(true)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: sans, fontSize: F.xs, color: T.accent, padding: 0 }}>Set channel →</button>
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
                    {/* Upload CSV button — available for all connected platforms */}
                    {isConnected && (
                      <button
                        title={`Upload ${p.label} followers CSV`}
                        disabled={!!csvUploading}
                        onClick={() => { csvPlatRef.current = p.id; csvFileRef.current?.click(); }}
                        style={{
                          width: 28, height: 28, borderRadius: 7, border: "none", cursor: csvUploading ? "default" : "pointer",
                          background: isCsvUp ? p.color + "20" : T.well,
                          color: isCsvUp ? p.color : T.dim,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, flexShrink: 0, transition: "background 0.15s, color 0.15s",
                        }}>
                        {isCsvUp ? "…" : "↑"}
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
                  {/* YouTube channel switcher */}
                  {p.id === "youtube" && editingChannel && (
                    <div style={{ margin: "0 18px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim, lineHeight: 1.4 }}>
                        Enter your channel handle or ID (e.g. <span style={{ color: T.text }}>@bigthink</span> or a YouTube URL)
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <input
                          autoFocus
                          value={channelInput}
                          onChange={e => setChannelInput(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && saveChannel()}
                          placeholder="@bigthink"
                          style={{
                            flex: 1, padding: "5px 8px", borderRadius: 6, border: `1px solid ${T.border}`,
                            fontFamily: sans, fontSize: F.xs, background: T.well, color: T.text, outline: "none",
                          }}
                        />
                        <button
                          disabled={channelSaving || !channelInput.trim()}
                          onClick={saveChannel}
                          style={{
                            padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer",
                            background: "#FF000018", color: "#FF0000", fontFamily: sans,
                            fontSize: F.xs, fontWeight: 600,
                          }}>
                          {channelSaving ? "…" : "Save"}
                        </button>
                        <button onClick={() => { setEditingChannel(false); setChannelResult(null); }} style={{ padding: "5px 8px", borderRadius: 6, border: "none", cursor: "pointer", background: T.well, color: T.dim, fontFamily: sans, fontSize: F.xs }}>✕</button>
                      </div>
                      {channelResult && (
                        <div style={{
                          padding: "5px 8px", borderRadius: 6, fontFamily: sans, fontSize: F.xs, fontWeight: 500,
                          background: channelResult.ok ? T.greenBg : T.redBg,
                          color:      channelResult.ok ? T.green   : T.red,
                          border:     `1px solid ${channelResult.ok ? T.greenBorder : T.redBorder}`,
                        }}>
                          {channelResult.ok ? "✓ " : "✗ "}{channelResult.msg}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Manage handles */}
          <div style={{ borderTop: `1px solid ${T.border}` }}>
            <a href="/peopleandorganizations"
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 18px", textDecoration: "none" }}
              onMouseEnter={e => e.currentTarget.style.background = T.well}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <span style={{ fontFamily: sans, fontSize: F.sm, color: T.text, fontWeight: 500 }}>Manage people & organizations</span>
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

          {/* Login settings */}
          <div style={{ borderTop: `1px solid ${T.border}` }}>
            <button
              onClick={() => setShowLoginSettings(s => !s)}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 18px", background: "none", border: "none", cursor: "pointer",
                textAlign: "left",
              }}
              onMouseEnter={e => e.currentTarget.style.background = T.well}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontFamily: sans, fontSize: F.sm, color: T.text, fontWeight: 500 }}>Login settings</span>
              <span style={{ color: T.dim, fontSize: F.xs }}>{showLoginSettings ? "▾" : "▸"}</span>
            </button>
            {showLoginSettings && (
              <div style={{ padding: "0 18px 16px" }}>
                <div style={{ fontSize: F.xs, color: T.dim, marginBottom: 10, fontFamily: sans }}>
                  Signed in as <strong style={{ color: T.sub }}>{email}</strong>
                </div>
                {/* Username */}
                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: "block", fontFamily: sans, fontSize: F.xs, fontWeight: 600,
                    color: T.sub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                    Login username
                  </label>
                  <input
                    value={loginUsername}
                    onChange={e => setLoginUsername(e.target.value)}
                    placeholder="e.g. bigthink"
                    style={{
                      width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 7,
                      border: `1px solid ${T.border}`, background: T.well, color: T.text,
                      fontFamily: sans, fontSize: F.sm, outline: "none",
                    }}
                    onFocus={e => e.target.style.borderColor = T.accent}
                    onBlur={e => e.target.style.borderColor = T.border}
                  />
                </div>
                {/* Password */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontFamily: sans, fontSize: F.xs, fontWeight: 600,
                    color: T.sub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                    New password <span style={{ fontWeight: 400, textTransform: "none" }}>(leave blank to keep)</span>
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="New password"
                    autoComplete="new-password"
                    style={{
                      width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 7,
                      border: `1px solid ${T.border}`, background: T.well, color: T.text,
                      fontFamily: sans, fontSize: F.sm, outline: "none",
                    }}
                    onFocus={e => e.target.style.borderColor = T.accent}
                    onBlur={e => e.target.style.borderColor = T.border}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    onClick={saveLoginSettings}
                    disabled={loginSaving || !loginUsername}
                    style={{
                      padding: "7px 16px", borderRadius: 7, border: "none", cursor: "pointer",
                      background: T.accent, color: "#fff", fontFamily: sans, fontSize: F.xs,
                      fontWeight: 600, opacity: loginSaving || !loginUsername ? 0.6 : 1,
                    }}>
                    {loginSaving ? "Saving…" : "Save"}
                  </button>
                  {loginMsg && (
                    <span style={{ fontFamily: sans, fontSize: F.xs,
                      color: loginMsg.startsWith("Error") ? T.red : T.green }}>
                      {loginMsg}
                    </span>
                  )}
                </div>
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
// ─── Followers chart ─────────────────────────────────────────────────────────
function FollowersChart({ snapshots, activePlatform }) {
  const [hover, setHover] = useState(null);

  const empty = !snapshots || snapshots.length === 0 ||
    snapshots.every(s => !s.followers || s.followers === 0);

  if (empty) return null; // hide entirely when no data (don't show empty state in persistent position)

  const filtered = activePlatform && activePlatform !== "all"
    ? snapshots.filter(s => s.platform === activePlatform)
    : snapshots;

  // Deduplicate to one snapshot per platform per day (keep latest)
  const latestPerPlatformDay = {};
  for (const s of filtered) {
    const day = s.snapshot_at.slice(0, 10);
    const key = `${s.platform}:${day}`;
    const prev = latestPerPlatformDay[key];
    if (!prev || new Date(s.snapshot_at) > new Date(prev.snapshot_at)) {
      latestPerPlatformDay[key] = s;
    }
  }

  // Build per-platform sorted arrays so we can fill-forward missing days
  const platArrays = {};
  for (const s of Object.values(latestPerPlatformDay)) {
    const plat = s.platform;
    if (!platArrays[plat]) platArrays[plat] = [];
    platArrays[plat].push(s);
  }
  for (const plat of Object.keys(platArrays)) {
    platArrays[plat].sort((a, b) => a.snapshot_at.localeCompare(b.snapshot_at));
  }

  // Collect all unique days across all platforms, sorted
  const allDays = [...new Set(Object.values(latestPerPlatformDay).map(s => s.snapshot_at.slice(0, 10)))].sort();

  // For each day, sum every platform's last-known value (fill-forward)
  // This prevents spikes when platforms have uneven snapshot coverage
  const byDate = {};
  const platLastVal = {};
  for (const day of allDays) {
    for (const [plat, arr] of Object.entries(platArrays)) {
      for (const s of arr) {
        if (s.snapshot_at.slice(0, 10) <= day) platLastVal[plat] = s.followers || 0;
      }
    }
    const total = Object.values(platLastVal).reduce((sum, v) => sum + v, 0);
    byDate[day] = { date: new Date(`${day}T00:00:00Z`), total };
  }

  const pts = Object.values(byDate).sort((a, b) => a.date - b.date);
  if (pts.length === 0) return null;

  const W = 900, H = 200, PAD = { top: 20, right: 20, bottom: 36, left: 58 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const minDate = pts[0].date;
  const maxDate = pts[pts.length - 1].date;
  const rawMin  = Math.min(...pts.map(p => p.total));
  const rawMax  = Math.max(...pts.map(p => p.total));
  const pad5    = (rawMax - rawMin) * 0.08;
  const minF    = Math.max(0, rawMin - pad5);
  const maxF    = rawMax + pad5;
  const rangeF  = maxF - minF || 1;

  const xPos = d => ((d - minDate) / ((maxDate - minDate) || 1)) * chartW;
  const yPos = f => chartH - ((f - minF) / rangeF) * chartH;
  const fmtK = n => n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M'
                  : n >= 1000       ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K'
                  : String(n);

  const smoothPath = pts.map(({ date, total }, i) => {
    const x = xPos(date), y = yPos(total);
    if (i === 0) return `M${x.toFixed(1)},${y.toFixed(1)}`;
    const prev = pts[i - 1];
    const px = xPos(prev.date), py = yPos(prev.total);
    const cpx = (px + x) / 2;
    return `C${cpx.toFixed(1)},${py.toFixed(1)} ${cpx.toFixed(1)},${y.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const areaPath = `${smoothPath} L${xPos(pts[pts.length - 1].date).toFixed(1)},${chartH} L${xPos(pts[0].date).toFixed(1)},${chartH} Z`;

  const step   = (rawMax - rawMin) / 3;
  const yTicks = [0, 1, 2, 3].map(i => Math.round((rawMin + i * step) / 1000) * 1000);

  const xTicks = [];
  const tc = new Date(minDate); tc.setUTCDate(1);
  while (tc <= maxDate) { xTicks.push(new Date(tc)); tc.setUTCMonth(tc.getUTCMonth() + 1); }

  const handleMouseMove = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx   = (e.clientX - rect.left) / rect.width * W - PAD.left;
    if (mx < 0 || mx > chartW) { setHover(null); return; }
    const tAtX = minDate.getTime() + (mx / chartW) * (maxDate - minDate);
    let best = null, bestDist = Infinity;
    for (const pt of pts) {
      const dist = Math.abs(pt.date.getTime() - tAtX);
      if (dist < bestDist) { bestDist = dist; best = pt; }
    }
    if (best) {
      const cx = PAD.left + xPos(best.date);
      const cy = PAD.top  + yPos(best.total);
      setHover({ x: cx, y: cy, followers: best.total, date: best.date });
    }
  };

  const color = (activePlatform && activePlatform !== "all" && PLAT_COLORS[activePlatform]) || T.accent;
  const label = activePlatform && activePlatform !== "all"
    ? `${PLAT_LABEL[activePlatform] || activePlatform} Followers`
    : "Followers";

  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
      padding: "20px 24px 14px", marginBottom: 24, boxShadow: T.shadowSm }}>

      <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text, marginBottom: 16 }}>
        {label}
      </div>

      <div style={{ position: "relative" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", overflow: "visible" }}
          onMouseMove={handleMouseMove} onMouseLeave={() => setHover(null)}>
          <defs>
            <linearGradient id="grad-followers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={color} stopOpacity="0.01" />
            </linearGradient>
          </defs>
          <g transform={`translate(${PAD.left},${PAD.top})`}>
            {yTicks.map((v, i) => (
              <g key={i}>
                <line x1={0} y1={yPos(v)} x2={chartW} y2={yPos(v)} stroke={T.border} strokeWidth={0.75} />
                <text x={-10} y={yPos(v) + 4} textAnchor="end"
                  style={{ fontFamily: sans, fontSize: 10, fill: T.dim }}>{fmtK(v)}</text>
              </g>
            ))}
            {xTicks.filter(d => xPos(d) >= 0 && xPos(d) <= chartW).map((d, i) => (
              <text key={i} x={xPos(d)} y={chartH + 24} textAnchor="middle"
                style={{ fontFamily: sans, fontSize: 10, fill: T.dim }}>
                {d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })}
              </text>
            ))}
            <path d={areaPath} fill="url(#grad-followers)" />
            <path d={smoothPath} fill="none" stroke={color} strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round" />
            {hover && (() => {
              const hx = hover.x - PAD.left, hy = hover.y - PAD.top;
              return (
                <g>
                  <line x1={hx} y1={0} x2={hx} y2={chartH} stroke={T.border2} strokeWidth={1} strokeDasharray="4 3" />
                  <circle cx={hx} cy={hy} r={5} fill={color} stroke={T.card} strokeWidth={2} />
                </g>
              );
            })()}
          </g>
        </svg>

        {hover && (() => {
          const tipW = 140;
          const pct  = (hover.x - PAD.left) / chartW;
          const left = pct > 0.75 ? hover.x - tipW - 12 : hover.x + 12;
          return (
            <div style={{
              position: "absolute", top: hover.y - 28, left: `${(left / W) * 100}%`,
              background: T.text, color: "#fff", borderRadius: 8,
              padding: "8px 12px", pointerEvents: "none", zIndex: 10,
              boxShadow: T.shadowMd, minWidth: tipW,
            }}>
              <div style={{ fontFamily: sans, fontSize: F.xs, opacity: 0.7, marginBottom: 2 }}>
                {hover.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
              </div>
              <div style={{ fontFamily: sans, fontSize: F.md, fontWeight: 700 }}>
                {fmtK(hover.followers)} followers
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default function PageShell({ activeTab, children }) {
  const [session,        setSession]       = useState(null);
  const [authLoading,    setAuthLoading]   = useState(true);
  const [posts,          setPosts]         = useState([]);
  const [loading,        setLoading]       = useState(true);
  const [error,          setError]         = useState(null);
  const [activePlatform, setActivePlatform] = useState("all");
  const [selectedWeek,   setSelectedWeek]  = useState(null);
  const [dateRange,      setDateRange]      = useState(() => (typeof window !== "undefined" && sessionStorage.getItem("audian_dateRange")) || "3m");
  const [dateFrom,       setDateFrom]      = useState(() => (typeof window !== "undefined" && sessionStorage.getItem("audian_dateFrom")) || daysAgo(90));
  const [dateTo,         setDateTo]        = useState(() => (typeof window !== "undefined" && sessionStorage.getItem("audian_dateTo"))   || TODAY);
  const [showCustom,     setShowCustom]    = useState(() => typeof window !== "undefined" && sessionStorage.getItem("audian_dateRange") === "custom");
  const [calOpen,        setCalOpen]       = useState(null); // "from" | "to" | null
  const calFromRef = useRef(null);
  const calToRef   = useRef(null);

  // Persist date range to sessionStorage so it survives tab navigation
  useEffect(() => {
    sessionStorage.setItem("audian_dateRange", dateRange);
    sessionStorage.setItem("audian_dateFrom",  dateFrom);
    sessionStorage.setItem("audian_dateTo",    dateTo);
  }, [dateRange, dateFrom, dateTo]);

  const [followerSnaps,  setFollowerSnaps] = useState([]);
  const [followerLatest, setFollowerLatest] = useState({});
  const [weekFilter,     setWeekFilter]    = useState(null);
  const [accountName,    setAccountName]   = useState("");
  const [avatarUrl,      setAvatarUrl]     = useState("");
  const [connections,    setConnections]   = useState([]);
  const [actionMessage,  setActionMessage] = useState(null);
  const [enriching,      setEnriching]     = useState(false);
  const [refreshKey,     setRefreshKey]    = useState(0);
  const [showReport,     setShowReport]    = useState(false);

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setAuthLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'SIGNED_OUT') setSession(null);
      else if (s) setSession(s);
    });
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
        fetch(`/api/followers?from=${from}&to=${to}`),
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
            ? "No people in this view still need bio or follower enrichment."
            : "No people found to enrich for this view.",
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
          text: `Batch ${batchNum} of ${totalBatches} · pulling bios and follower counts for ${checked + 1}-${Math.min(checked + batch.length, handleIds.length)} of ${handleIds.length} people…`,
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

      // ── Photo pass: try Big Think for handles that still have no photo ──
      let photoUpdates = 0;
      try {
        const allRes = await fetch("/api/handles");
        const allData = await allRes.json();
        const noPhoto = (allData.handles || []).filter(
          h => handleIds.includes(h.id) && !h.avatar_url && h.name?.trim()
        );
        if (noPhoto.length > 0) {
          setActionMessage({ tone: "muted", text: `Looking up ${noPhoto.length} photo${noPhoto.length === 1 ? "" : "s"} on Big Think…` });
          for (const h of noPhoto) {
            try {
              const r = await fetch("/api/handles/autophoto", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ handle_id: h.id, name: h.name }),
              });
              const d = await r.json();
              if (d.url) photoUpdates++;
            } catch {}
            // Polite delay between Big Think requests
            await new Promise(res => setTimeout(res, 400));
          }
        }
      } catch {}

      const anyUpdates = enriched > 0 || photoUpdates > 0;
      const parts = [];
      if (bioUpdates > 0) parts.push(`${bioUpdates} bio${bioUpdates === 1 ? "" : "s"}`);
      if (followerUpdates > 0) parts.push(`${followerUpdates} follower count${followerUpdates === 1 ? "" : "s"}`);
      if (photoUpdates > 0) parts.push(`${photoUpdates} photo${photoUpdates === 1 ? "" : "s"}`);

      setActionMessage({
        tone: anyUpdates ? "success" : "muted",
        text: anyUpdates
          ? `Updated ${enriched + photoUpdates} person${(enriched + photoUpdates) === 1 ? "" : "s"} · ${parts.join(", ")} filled in.`
          : `Checked ${checked} profile${checked === 1 ? "" : "s"} and everything already looked filled in.`,
      });
      setRefreshKey(v => v + 1);
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
            <ProfileMenu session={session} avatarUrl={avatarUrl} onAvatarChange={url => setAvatarUrl(url)} connections={connections}
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
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {loading && <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>Loading…</span>}

            {/* Preset pills */}
            <div style={{ display: "flex", background: T.well, border: `1px solid ${T.border}`, borderRadius: 8, padding: 2, gap: 1 }}>
              {[
                { key: "1m",  label: "1m",  days: 30 },
                { key: "3m",  label: "3m",  days: 90 },
                { key: "6m",  label: "6m",  days: 183 },
                { key: "1y",  label: "1y",  days: 365 },
                { key: "3y",  label: "3y",  days: 1095 },
                { key: "custom", label: "Custom" },
              ].map(opt => {
                const isActive = dateRange === opt.key;
                return (
                  <button key={opt.key}
                    onClick={() => {
                      setDateRange(opt.key);
                      setSelectedWeek(null);
                      if (opt.days) {
                        setDateFrom(daysAgo(opt.days));
                        setDateTo(TODAY);
                        setShowCustom(false);
                      } else {
                        setShowCustom(s => !s);
                      }
                    }}
                    style={{
                      fontFamily: sans, fontSize: F.xs, fontWeight: isActive ? 600 : 400,
                      padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer",
                      background: isActive ? T.card : "transparent",
                      color: isActive ? T.text : T.dim,
                      boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                      transition: "all 0.12s",
                    }}>
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Date range — always visible, custom calendar pickers */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, position: "relative" }}>
              {/* From date */}
              <div style={{ position: "relative" }}>
                <button ref={calFromRef}
                  onClick={() => setCalOpen(v => v === "from" ? null : "from")}
                  style={{
                    fontFamily: sans, fontSize: F.xs, color: calOpen === "from" ? T.accent : T.text,
                    background: "transparent", border: "none", cursor: "pointer",
                    padding: "2px 4px", borderRadius: 4,
                  }}>
                  {dateFrom ? new Date(dateFrom + "T12:00:00").toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "Start"}
                </button>
                {calOpen === "from" && (
                  <MiniCalendar
                    value={dateFrom}
                    onChange={v => { setDateFrom(v); setDateRange("custom"); setShowCustom(true); setSelectedWeek(null); }}
                    onClose={() => setCalOpen(null)}
                    anchorRef={calFromRef}
                  />
                )}
              </div>

              <span style={{ color: T.dim, fontSize: F.xs }}>→</span>

              {/* To date */}
              <div style={{ position: "relative" }}>
                <button ref={calToRef}
                  onClick={() => setCalOpen(v => v === "to" ? null : "to")}
                  style={{
                    fontFamily: sans, fontSize: F.xs, color: calOpen === "to" ? T.accent : T.text,
                    background: "transparent", border: "none", cursor: "pointer",
                    padding: "2px 4px", borderRadius: 4,
                  }}>
                  {dateTo ? new Date(dateTo + "T12:00:00").toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "End"}
                </button>
                {calOpen === "to" && (
                  <MiniCalendar
                    value={dateTo}
                    onChange={v => { setDateTo(v); setDateRange("custom"); setShowCustom(true); setSelectedWeek(null); }}
                    onClose={() => setCalOpen(null)}
                    anchorRef={calToRef}
                  />
                )}
              </div>
            </div>

            {/* Export Report button */}
            <button
              onClick={() => setShowReport(true)}
              style={{
                fontFamily: sans, fontSize: F.xs, fontWeight: 600,
                padding: "6px 14px", borderRadius: 8, border: "none",
                cursor: "pointer", background: "#f97316", color: "#fff",
                display: "flex", alignItems: "center", gap: 6,
                boxShadow: "0 1px 3px rgba(249,115,22,0.3)",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReport && (
        <ReportModal
          dateFrom={dateFrom}
          dateTo={dateTo}
          accountName={accountName}
          onClose={() => setShowReport(false)}
        />
      )}

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

            <FollowersChart snapshots={followerSnaps} activePlatform={activePlatform} />

            {/* Section tabs + actions */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, borderBottom: `1px solid ${T.border}`, marginBottom: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {TABS.map(tab => (
                  <Link key={tab.key} href={tab.href} style={TAB_STYLE(activeTab === tab.key)}
                    onMouseEnter={e => { if (activeTab !== tab.key) e.currentTarget.style.color = T.sub; }}
                    onMouseLeave={e => { if (activeTab !== tab.key) e.currentTarget.style.color = T.dim; }}>
                    <span>{tab.emoji}</span>
                    {tab.label}
                  </Link>
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
