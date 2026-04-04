"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import PageShell, { T, sans, F } from "../components/PageShell";
import { PlatDot, PLAT_COLORS } from "../components/PlatIcon";

const PLAT_LABEL  = { youtube: "YouTube", x: "X", instagram: "Instagram", linkedin: "LinkedIn" };

const LIKES_GOAL = 2000;
const POSTS_GOAL = 3;

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
  const safe = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso + "T12:00:00" : iso;
  return new Date(safe).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function weekKey(iso) {
  const d   = new Date(iso);
  const mon = new Date(d);
  mon.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return mon.toISOString().slice(0, 10);
}

function weekLabel(key) {
  const d = new Date(key + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function weekEnd(key) {
  const d = new Date(key + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 6);
  return d;
}

// ─── CSV helpers ─────────────────────────────────────────────────────────────
function parseCSVLine(line, sep = ",") {
  const cols = []; let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; } else inQ = !inQ;
    } else if (ch === sep && !inQ) { cols.push(cur.trim()); cur = ""; }
    else cur += ch;
  }
  cols.push(cur.trim()); return cols;
}

function normPlatform(p) {
  if (!p) return "";
  p = p.toLowerCase().trim();
  if (p === "twitter" || p === "x (twitter)" || p === "x/twitter") return "x";
  if (p === "ig") return "instagram";
  if (p === "yt") return "youtube";
  if (p === "li") return "linkedin";
  return p;
}

function detectPlatformFromUrl(url) {
  if (!url) return "";
  if (url.includes("instagram.com"))                          return "instagram";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("twitter.com") || url.includes("x.com"))  return "x";
  if (url.includes("linkedin.com"))                           return "linkedin";
  return "";
}

function parseDateStr(str) {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d) ? null : d.toISOString();
}

// ─── Platform SVG icons ───────────────────────────────────────────────────────

// ─── Weekly OKR tracker (also acts as week filter) ────────────────────────────
function WeeklyOKR({ posts, activePlatform, selectedWeek, onWeekSelect, dateFrom, dateTo }) {
  const filtered = posts.filter(p =>
    p.post_type !== "daily_aggregate" &&
    (activePlatform.length === 0 || activePlatform.includes(p.platform))
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

  const allWeekKeys = [];
  if (dateFrom && dateTo) {
    const start = new Date(dateFrom + "T00:00:00Z");
    const end   = new Date(dateTo   + "T23:59:59Z");
    const cur = new Date(start);
    cur.setUTCDate(cur.getUTCDate() - ((cur.getUTCDay() + 6) % 7));
    while (cur <= end) {
      allWeekKeys.push(cur.toISOString().slice(0, 10));
      cur.setUTCDate(cur.getUTCDate() + 7);
    }
  }

  const weeks = allWeekKeys.length > 0
    ? allWeekKeys.map(k => [k, weekMap[k] || { posts: [], maxLikes: 0 }])
    : Object.entries(weekMap).sort((a, b) => a[0].localeCompare(b[0]));

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
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
      padding: "20px 24px", marginBottom: 24, boxShadow: T.shadowSm }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
        <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text }}>
          Weekly
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
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
              {w.maxLikes >= LIKES_GOAL && (
                <div style={{ fontFamily: sans, fontSize: F.xs,
                  color: isSelected ? "rgba(255,255,255,0.9)" : T.green }}>
                  ✓ {fmt(w.maxLikes)} top
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Followers area chart ─────────────────────────────────────────────────────
function FollowersChart({ snapshots, activePlatform }) {
  const [hover, setHover] = useState(null);

  const empty = !snapshots || snapshots.length === 0 ||
    snapshots.every(s => !s.followers || s.followers === 0);

  if (empty) {
    return (
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
        padding: "32px 24px", textAlign: "center", marginBottom: 24, boxShadow: T.shadowSm }}>
        <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text, marginBottom: 6 }}>
          Followers
        </div>
        <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>
          No follower data yet — export from Buffer (Analytics → Export CSV) and share the file
        </div>
      </div>
    );
  }

  const filtered = activePlatform.length > 0
    ? snapshots.filter(s => activePlatform.includes(s.platform))
    : snapshots;

  const latestPerPlatformDay = {};
  for (const s of filtered) {
    const day = s.snapshot_at.slice(0, 10);
    const key = `${s.platform}:${day}`;
    const prev = latestPerPlatformDay[key];
    if (!prev || new Date(s.snapshot_at) > new Date(prev.snapshot_at)) {
      latestPerPlatformDay[key] = s;
    }
  }
  const byDate = {};
  for (const s of Object.values(latestPerPlatformDay)) {
    const day = s.snapshot_at.slice(0, 10);
    if (!byDate[day]) byDate[day] = { date: new Date(`${day}T00:00:00Z`), total: 0 };
    byDate[day].total += (s.followers || 0);
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

  const xPos = d  => ((d - minDate) / ((maxDate - minDate) || 1)) * chartW;
  const yPos = f  => chartH - ((f - minF) / rangeF) * chartH;
  const fmtK = n  => n >= 1_000_000 ? (n/1_000_000).toFixed(1)+'M'
                   : n >= 1000       ? (n/1000).toFixed(n >= 10000 ? 0 : 1)+'K'
                   : String(n);

  const smoothPath = pts.map(({ date, total }, i) => {
    const x = xPos(date), y = yPos(total);
    if (i === 0) return `M${x.toFixed(1)},${y.toFixed(1)}`;
    const prev = pts[i - 1];
    const px = xPos(prev.date), py = yPos(prev.total);
    const cpx = (px + x) / 2;
    return `C${cpx.toFixed(1)},${py.toFixed(1)} ${cpx.toFixed(1)},${y.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const areaPath = `${smoothPath} L${xPos(pts[pts.length-1].date).toFixed(1)},${chartH} L${xPos(pts[0].date).toFixed(1)},${chartH} Z`;

  const step = (rawMax - rawMin) / 3;
  const yTicks = [0,1,2,3].map(i => Math.round((rawMin + i * step) / 1000) * 1000);

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

  const color = (activePlatform.length === 1 && PLAT_COLORS[activePlatform[0]]) || T.accent;
  const label = activePlatform.length === 1
    ? `${PLAT_LABEL[activePlatform[0]] || activePlatform[0]} Followers`
    : activePlatform.length > 1
      ? `${activePlatform.map(p => PLAT_LABEL[p] || p).join(" + ")} Followers`
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
            <linearGradient id="grad-total" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={color} stopOpacity="0.01" />
            </linearGradient>
          </defs>

          <g transform={`translate(${PAD.left},${PAD.top})`}>
            {yTicks.map((v, i) => (
              <g key={i}>
                <line x1={0} y1={yPos(v)} x2={chartW} y2={yPos(v)}
                  stroke={T.border} strokeWidth={0.75} />
                <text x={-10} y={yPos(v) + 4} textAnchor="end"
                  style={{ fontFamily: sans, fontSize: 10, fill: T.dim }}>{fmtK(v)}</text>
              </g>
            ))}

            {xTicks.map((d, i) => (
              <text key={i} x={xPos(d)} y={chartH + 24} textAnchor="middle"
                style={{ fontFamily: sans, fontSize: 10, fill: T.dim }}>
                {d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })}
              </text>
            ))}

            <path d={areaPath} fill="url(#grad-total)" />
            <path d={smoothPath} fill="none" stroke={color} strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round" />

            {hover && (() => {
              const hx = hover.x - PAD.left;
              const hy = hover.y - PAD.top;
              return (
                <g>
                  <line x1={hx} y1={0} x2={hx} y2={chartH}
                    stroke={T.border2} strokeWidth={1} strokeDasharray="4 3" />
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

// ─── Shared export helpers ────────────────────────────────────────────────────
function ExportIconBtn({ wrapperRef, filename, onBeforeCapture }) {
  const [busy, setBusy] = useState(false);
  const [hover, setHover] = useState(false);
  async function handleExport() {
    if (!wrapperRef?.current) return;
    setBusy(true);
    try {
      if (onBeforeCapture) await onBeforeCapture();
      await new Promise(r => setTimeout(r, 150));
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(wrapperRef.current, { useCORS: true, scale: 2, backgroundColor: "#FFFFFF", logging: false });
      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally { setBusy(false); }
  }
  return (
    <button onClick={handleExport} disabled={busy} title="Export as image"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        marginLeft: "auto", width: 28, height: 28, borderRadius: 7,
        border: `1px solid ${hover ? T.accent : T.border}`,
        background: hover ? T.accent + "10" : "transparent",
        color: hover ? T.accent : T.dim, cursor: busy ? "wait" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.12s", flexShrink: 0,
      }}>
      {busy
        ? <svg width="14" height="14" viewBox="0 0 14 14" style={{ animation: "spin 1s linear infinite" }}><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="20 12" /></svg>
        : <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 2v7M4 6l3 3 3-3M2 11h10" /></svg>
      }
    </button>
  );
}

function ContextStamp({ dateFrom, dateTo, activePlatform }) {
  const platLabel = activePlatform?.length > 0
    ? activePlatform.map(p => ({ instagram: "Instagram", x: "X", linkedin: "LinkedIn", youtube: "YouTube" }[p] || p)).join(", ")
    : null;
  const dateLabel = dateFrom && dateTo ? `${dateFrom} – ${dateTo}` : null;
  if (!platLabel && !dateLabel) return null;
  return (
    <div style={{
      marginTop: 14, paddingTop: 10, borderTop: `1px solid ${T.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      fontFamily: sans, fontSize: 10, color: T.dim,
    }}>
      <span>{[platLabel, dateLabel].filter(Boolean).join(" · ")}</span>
      <span style={{ fontWeight: 700, letterSpacing: "0.08em", color: T.dim }}>AUDIAN</span>
    </div>
  );
}

// ─── Outliers ─────────────────────────────────────────────────────────────────
function Outliers({ posts, activePlatform, selectedWeek, dateFrom, dateTo }) {
  const filtered = posts.filter(p => {
    if (p.post_type === "daily_aggregate") return false;
    if (activePlatform.length > 0 && !activePlatform.includes(p.platform)) return false;
    if (selectedWeek && weekKey(p.published_at) !== selectedWeek) return false;
    return true;
  });

  if (filtered.length < 4) return null;

  const withEng = filtered.map(p => ({
    ...p,
    engagement: parseInt(p.likes || 0),
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
            {p.published_at ? new Date(p.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
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

  const wrapperRef = useRef(null);
  const platLabel = activePlatform.length === 0 ? "all platforms" : activePlatform.map(p => PLAT_LABEL[p] || p).join(", ");
  const weekSuffix = selectedWeek ? ` · week of ${weekLabel(selectedWeek)}` : "";
  const slug = `outliers-${dateFrom || "all"}-to-${dateTo || "all"}${activePlatform.length ? `-${activePlatform.join("-")}` : ""}`;

  return (
    <div ref={wrapperRef} style={{ background: "#fff", borderRadius: 14,
      padding: "20px 24px", marginBottom: 24, boxShadow: T.shadowSm }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text }}>
          Outliers · {platLabel}{weekSuffix}
        </span>
        <span style={{ fontFamily: sans, fontWeight: 400, color: T.dim, fontSize: F.xs }}>avg {fmt(Math.round(avg))} likes</span>
        <ExportIconBtn wrapperRef={wrapperRef} filename={slug} />
      </div>
      <div style={{ border: `1px solid ${T.border}`, borderRadius: 12,
        display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden" }}>
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
      <ContextStamp dateFrom={dateFrom} dateTo={dateTo} activePlatform={activePlatform} />
    </div>
  );
}

// ─── Import Posts panel ───────────────────────────────────────────────────────
function ImportPostsPanel({ activePlatform, onImported, onClose }) {
  const [rawText,    setRawText]    = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [parsed,     setParsed]     = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState(null);
  const [dragging,   setDragging]   = useState(false);

  useEffect(() => {
    if (!rawText.trim()) { setParsed(null); return; }
    setParsed(parsePostsText(rawText));
  }, [rawText, activePlatform]); // eslint-disable-line

  function parsePostsText(text) {
    const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
    if (!lines.length) return null;
    const sep   = lines[0].includes("\t") ? "\t" : ",";
    const first = lines[0].trim();
    const isURL = first.startsWith("http") || first.startsWith("www.");
    const isCSV = !isURL && (first.includes(sep) && !first.startsWith("@"));

    if (isURL) {
      // One URL per line
      const rows = lines.map(url => ({
        platform:    detectPlatformFromUrl(url) || (activePlatform.length === 1 ? activePlatform[0] : ""),
        permalink:   url.trim(), content: null, likes: 0, comments: 0,
      })).filter(r => r.platform);
      return { rows, format: "urls" };
    }

    if (isCSV || first.toLowerCase().includes("url") || first.toLowerCase().includes("date")
              || first.toLowerCase().includes("platform")) {
      const splitFn = l => sep === "\t" ? l.split("\t").map(s => s.trim()) : parseCSVLine(l, sep);
      const headers = splitFn(lines[0]).map(h => h.toLowerCase().replace(/['"]/g, "").trim());
      const ix = name => {
        const aliases = {
          platform:    ["platform","network","channel","source"],
          permalink:   ["permalink","url","link","post_url","post_link","post url"],
          content:     ["content","caption","text","title","message","body","description"],
          published_at:["date","published_at","published","posted","post_date","created_at","created"],
          likes:       ["likes","like_count","hearts","favorites","faves"],
          comments:    ["comments","comment_count","replies","reply_count"],
          impressions: ["impressions","reach","views","view_count","impr"],
          shares:      ["shares","retweets","reposts","reshares"],
        };
        for (const a of (aliases[name] || [name])) {
          const i = headers.findIndex(h => h === a || h.includes(a));
          if (i !== -1) return i;
        }
        return -1;
      };
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const cols  = splitFn(lines[i]);
        const get   = n => { const j = ix(n); return j !== -1 ? (cols[j] || "").replace(/^["']|["']$/g, "").trim() : ""; };
        const plat  = normPlatform(get("platform")) || (activePlatform.length === 1 ? activePlatform[0] : "");
        if (!plat) continue;
        rows.push({
          platform:    plat,
          permalink:   get("permalink") || null,
          content:     get("content")   || null,
          published_at: parseDateStr(get("published_at")),
          likes:       parseInt(get("likes"))       || 0,
          comments:    parseInt(get("comments"))    || 0,
          impressions: parseInt(get("impressions")) || 0,
          shares:      parseInt(get("shares"))      || 0,
        });
      }
      return rows.length ? { rows, format: "csv" } : null;
    }
    return null;
  }

  function handleDrop(e) {
    e.preventDefault(); setDragging(false);
    for (const file of Array.from(e.dataTransfer.files)) {
      if (file.type === "text/csv" || file.name.endsWith(".csv") || file.type === "text/plain" || file.name.endsWith(".tsv")) {
        const r = new FileReader(); r.onload = ev => setRawText(t => t ? t + "\n" + ev.target.result : ev.target.result); r.readAsText(file);
      } else if (file.type.startsWith("image/")) {
        const r = new FileReader(); r.onload = ev => setImageFiles(f => [...f, { name: file.name, preview: ev.target.result }]); r.readAsDataURL(file);
      }
    }
  }

  async function handleImport() {
    if (!parsed?.rows?.length || loading) return;
    setLoading(true); setResult(null);
    try {
      const res  = await fetch("/api/posts/import", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posts: parsed.rows }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult({ ok: true, msg: `Imported ${data.imported} post${data.imported !== 1 ? "s" : ""}` });
      onImported?.();
      setTimeout(() => { setRawText(""); setParsed(null); setResult(null); setImageFiles([]); }, 2500);
    } catch (e) { setResult({ ok: false, msg: e.message }); }
    finally { setLoading(false); }
  }

  const count = parsed?.rows?.length || 0;
  return (
    <div style={{ marginBottom: 20, background: T.well, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text }}>Import Posts</div>
        <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: T.dim, fontSize: 16, lineHeight: 1, padding: "2px 4px" }}>✕</button>
      </div>

      {/* Drop zone + textarea */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false); }}
        onDrop={handleDrop}
        style={{ position: "relative", borderRadius: 10, border: `2px dashed ${dragging ? T.accent : T.border}`, background: dragging ? T.accent + "08" : T.card, transition: "border-color 0.15s, background 0.15s" }}
      >
        <textarea
          value={rawText}
          onChange={e => setRawText(e.target.value)}
          placeholder={"Drop CSV or screenshots here, or paste data…\n\nAccepts:\n  • URLs (one per line)\n  • CSV with columns: url, date, platform, content, likes, comments, impressions\n  • Drag & drop .csv or .tsv files\n  • Drag & drop screenshots (coming soon)"}
          style={{ width: "100%", minHeight: 130, padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: T.text, background: "transparent", border: "none", outline: "none", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }}
        />
        {dragging && (
          <div style={{ position: "absolute", inset: 0, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", background: T.accent + "12" }}>
            <span style={{ fontFamily: sans, fontSize: F.md, fontWeight: 700, color: T.accent }}>Drop to import</span>
          </div>
        )}
      </div>

      {/* Image previews */}
      {imageFiles.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
          {imageFiles.map((f, i) => (
            <div key={i} style={{ position: "relative", width: 72, height: 54, borderRadius: 6, overflow: "hidden", border: `1px solid ${T.border}`, flexShrink: 0 }}>
              <img src={f.preview} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button onClick={() => setImageFiles(fs => fs.filter((_, j) => j !== i))} style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: "rgba(0,0,0,0.65)", color: "#fff", border: "none", cursor: "pointer", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
          ))}
          <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>Screenshot parsing coming soon</span>
        </div>
      )}

      {/* Preview */}
      {parsed?.rows?.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontFamily: sans, fontSize: F.xs, color: T.sub, marginBottom: 6 }}>
            {count} post{count !== 1 ? "s" : ""} detected · {parsed.format === "csv" ? "CSV" : "URL list"}
          </div>
          <div style={{ maxHeight: 160, overflowY: "auto", borderRadius: 8, border: `1px solid ${T.border}`, background: T.card }}>
            {parsed.rows.slice(0, 25).map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "6px 12px", alignItems: "center", borderBottom: i < Math.min(count, 25) - 1 ? `1px solid ${T.border}` : "none", fontFamily: sans, fontSize: F.xs }}>
                <PlatDot platform={r.platform} size={8} />
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: T.text }}>
                  {r.content || r.permalink || "(no content)"}
                </span>
                {r.likes > 0 && <span style={{ color: T.dim, flexShrink: 0 }}>♥ {r.likes}</span>}
                {r.published_at && <span style={{ color: T.dim, flexShrink: 0 }}>{fmtDate(r.published_at)}</span>}
              </div>
            ))}
            {count > 25 && <div style={{ padding: "6px 12px", fontFamily: sans, fontSize: F.xs, color: T.dim }}>+ {count - 25} more</div>}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
        <button
          disabled={!count || loading}
          onClick={handleImport}
          style={{ padding: "7px 18px", borderRadius: 8, border: "none", fontFamily: sans, fontSize: F.xs, fontWeight: 600, cursor: count && !loading ? "pointer" : "default", background: count ? T.accent : T.border, color: count ? "#fff" : T.dim, transition: "background 0.15s" }}>
          {loading ? "Importing…" : `Import ${count} post${count !== 1 ? "s" : ""}`}
        </button>
        {result && (
          <span style={{ fontFamily: sans, fontSize: F.xs, fontWeight: 500, color: result.ok ? T.green : T.red }}>
            {result.ok ? "✓ " : "✗ "}{result.msg}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Import Interactions panel (per-post) ─────────────────────────────────────
function ImportInteractionsPanel({ post, onImported }) {
  const [rawText,  setRawText]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e) {
    e.preventDefault(); setDragging(false);
    for (const file of Array.from(e.dataTransfer.files)) {
      if (file.type === "text/csv" || file.name.endsWith(".csv") || file.type === "text/plain") {
        const r = new FileReader(); r.onload = ev => setRawText(ev.target.result); r.readAsText(file);
      }
    }
  }

  function parseInteractionsText(text) {
    const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
    if (!lines.length) return [];
    const sep   = lines[0].includes("\t") ? "\t" : ",";
    const first = lines[0].trim().toLowerCase();
    const hasHeader = first.includes("handle") || first.includes("name") || first.includes("user") || first.includes("type");
    const startIdx  = hasHeader ? 1 : 0;
    const splitFn   = l => sep === "\t" ? l.split("\t").map(s => s.trim()) : parseCSVLine(l, sep);

    let headers = hasHeader ? splitFn(lines[0]).map(h => h.toLowerCase().trim()) : ["handle","type","date","content"];
    const ix    = name => { const i = headers.findIndex(h => h.includes(name)); return i === -1 ? -1 : i; };

    const rows = [];
    for (let i = startIdx; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const cols = splitFn(lines[i]);
      // Single handle per line (no commas / tabs)
      if (cols.length === 1) {
        const h = cols[0].replace(/^@/, "").trim();
        if (h) rows.push({ name: h, handle: h, platform: post.platform, interaction_type: "comment", post_url: post.permalink });
        continue;
      }
      const get = name => { const j = ix(name); return j !== -1 ? (cols[j] || "").replace(/^["']|["']$/g, "").trim() : ""; };
      const rawHandle = get("handle") || get("user") || get("name") || cols[0];
      const handle    = rawHandle.replace(/^@/, "");
      if (!handle) continue;
      const interacted_at = parseDateStr(get("date") || get("time") || get("created"));
      rows.push({
        name:             handle,
        handle:           handle,
        platform:         post.platform,
        interaction_type: (get("type") || get("interaction") || "comment").toLowerCase(),
        content:          get("content") || get("comment") || get("text") || undefined,
        interacted_at:    interacted_at || undefined,
        post_url:         post.permalink,
      });
    }
    return rows;
  }

  async function handleImport() {
    if (!rawText.trim() || loading) return;
    setLoading(true); setResult(null);
    const rows = parseInteractionsText(rawText);
    if (!rows.length) { setResult({ ok: false, msg: "No interactions parsed" }); setLoading(false); return; }
    let ok = 0, fail = 0;
    for (const row of rows) {
      try {
        const res = await fetch("/api/interactions/add", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(row) });
        if (res.ok) ok++; else fail++;
      } catch { fail++; }
    }
    setResult({ ok: ok > 0, msg: `${ok} imported${fail > 0 ? `, ${fail} failed` : ""}` });
    if (ok > 0) { onImported?.(); setRawText(""); }
    setLoading(false);
  }

  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
      <div style={{ fontFamily: sans, fontSize: F.xs, fontWeight: 600, color: T.text, marginBottom: 4 }}>
        Import Interactions
      </div>
      <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim, marginBottom: 8, lineHeight: 1.5 }}>
        Platform: <strong>{post.platform}</strong>
        {post.permalink && <> · <a href={post.permalink} target="_blank" rel="noreferrer" style={{ color: T.accent, textDecoration: "none" }}>{post.permalink.length > 50 ? post.permalink.slice(0, 50) + "…" : post.permalink}</a></>}
      </div>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false); }}
        onDrop={handleDrop}
        style={{ borderRadius: 8, border: `1.5px dashed ${dragging ? T.accent : T.border}`, background: dragging ? T.accent + "08" : T.card, transition: "all 0.15s", position: "relative" }}
      >
        <textarea
          value={rawText}
          onChange={e => setRawText(e.target.value)}
          placeholder={"Paste interactions or drop a CSV…\n\nFormats:\n  @handle (one per line)\n  handle, type, date, content (CSV)\n  CSV with header row: handle, type, date, content"}
          style={{ width: "100%", minHeight: 90, padding: "10px 12px", fontFamily: "monospace", fontSize: 12, color: T.text, background: "transparent", border: "none", outline: "none", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }}
        />
        {dragging && (
          <div style={{ position: "absolute", inset: 0, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", background: T.accent + "12" }}>
            <span style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 700, color: T.accent }}>Drop CSV</span>
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
        <button
          disabled={!rawText.trim() || loading}
          onClick={handleImport}
          style={{ padding: "5px 14px", borderRadius: 7, border: "none", fontFamily: sans, fontSize: F.xs, fontWeight: 600, cursor: rawText.trim() && !loading ? "pointer" : "default", background: rawText.trim() ? T.accent : T.border, color: rawText.trim() ? "#fff" : T.dim }}>
          {loading ? "Importing…" : "Import"}
        </button>
        {result && <span style={{ fontFamily: sans, fontSize: F.xs, color: result.ok ? T.green : T.red }}>{result.ok ? "✓ " : "✗ "}{result.msg}</span>}
      </div>
    </div>
  );
}

// ─── Inline post interactions expansion ──────────────────────────────────────
const ZONE_CFG_PANEL = {
  ELITE:       { color: "#FF6B35", bg: "#FFF3EE", border: "#FFD4C2" },
  INFLUENTIAL: { color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
  SIGNAL:      { color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  UNASSIGNED:  { color: "#64748B", bg: "#F1F5F9", border: "#CBD5E1" },
  IGNORE:      { color: "#A8A39C", bg: "#F3F2F0", border: "#E8E6E1" },
};
const TYPE_CFG_PANEL = {
  like:    { label: "Like",    icon: "♥",  color: "#DC2626" },
  follow:  { label: "Follow",  icon: "👤", color: "#2563EB" },
  comment: { label: "Comment", icon: "💬", color: "#CA8A04" },
  mention: { label: "Mention", icon: "@",  color: "#FF6B35" },
  tag:     { label: "Tag",     icon: "🏷", color: "#7C3AED" },
  view:    { label: "View",    icon: "👁", color: "#64748B" },
  reply:   { label: "Reply",   icon: "↩",  color: "#CA8A04" },
  repost:  { label: "Repost",  icon: "↗",  color: "#16A34A" },
};
const ZONE_ORDER = ["ELITE", "INFLUENTIAL", "SIGNAL", "UNASSIGNED", "IGNORE"];

function ExpandedInteractions({ post, typeFilter, onClose, colSpan }) {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeType, setActiveType]     = useState(typeFilter || null);
  const [showImport, setShowImport]     = useState(false);

  // Sync when parent switches stat button
  useEffect(() => { setActiveType(typeFilter || null); }, [typeFilter]);

  function refreshInteractions() {
    if (!post?.permalink) return;
    fetch(`/api/interactions/list?post_url=${encodeURIComponent(post.permalink)}&limit=200`)
      .then(r => r.json()).then(d => setInteractions(d.interactions || [])).catch(() => {});
  }

  useEffect(() => {
    if (!post?.permalink) { setLoading(false); return; }
    setLoading(true);
    fetch(`/api/interactions/list?post_url=${encodeURIComponent(post.permalink)}&limit=200`)
      .then(r => r.json())
      .then(d => setInteractions(d.interactions || []))
      .catch(() => setInteractions([]))
      .finally(() => setLoading(false));
  }, [post?.permalink]);

  const allTypes = [...new Set(
    interactions.map(i => (i.interaction_type || "").split(",")[0].trim()).filter(Boolean)
  )];

  const filtered = activeType
    ? interactions.filter(i => (i.interaction_type || "").split(",")[0].trim() === activeType)
    : interactions;

  const sorted = [...filtered].sort((a, b) => {
    const zi = z => { const idx = ZONE_ORDER.indexOf(z); return idx === -1 ? 4 : idx; };
    const zd = zi(a.zone) - zi(b.zone);
    if (zd !== 0) return zd;
    return new Date(b.interacted_at || 0) - new Date(a.interacted_at || 0);
  });

  const importHref = `/import?mode=interactions${post.permalink ? `&post_url=${encodeURIComponent(post.permalink)}` : ""}`;
  const fmtFol = n => n >= 1_000_000 ? (n/1_000_000).toFixed(1)+"M"
                    : n >= 1_000     ? (n/1_000).toFixed(1)+"K"
                    : n.toLocaleString();

  const tabBtn = (label, isActive, color, onClick) => ({
    onClick,
    style: {
      padding: "3px 11px", borderRadius: 20, cursor: "pointer", fontFamily: sans,
      fontSize: F.xs, fontWeight: 600, border: "1px solid",
      borderColor: isActive ? (color || T.accent) : T.border,
      background: isActive ? (color ? color + "18" : T.accent) : "transparent",
      color: isActive ? (color || "#fff") : T.sub,
      transition: "all 0.1s",
    },
  });

  return (
    <tr>
      <td colSpan={colSpan} style={{
        padding: 0,
        background: "#F5F3F0",
        borderBottom: `2px solid ${T.accent}`,
        borderTop: "none",
      }}>
        <div style={{ padding: "14px 20px 16px", fontFamily: sans }}>

          {/* Controls: type filter tabs + import + close */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            <button {...tabBtn(`All${!loading ? ` (${interactions.length})` : ""}`, !activeType, null, () => setActiveType(null))}>
              All {!loading && `(${interactions.length})`}
            </button>
            {allTypes.map(t => {
              const tc    = TYPE_CFG_PANEL[t] || { label: t, icon: "·", color: T.sub };
              const count = interactions.filter(i => (i.interaction_type || "").split(",")[0].trim() === t).length;
              return (
                <button key={t} {...tabBtn(`${tc.icon} ${tc.label} (${count})`, activeType === t, tc.color, () => setActiveType(t))}>
                  {tc.icon} {tc.label} ({count})
                </button>
              );
            })}
            <div style={{ flex: 1 }} />
            <button onClick={() => setShowImport(s => !s)} style={{
              fontSize: F.xs, fontWeight: 600, color: showImport ? "#fff" : T.accent,
              background: showImport ? T.accent : "#FFF3EE",
              border: `1px solid ${showImport ? T.accent : "#FFD4C2"}`,
              borderRadius: 6, padding: "3px 10px", flexShrink: 0, cursor: "pointer",
            }}>{showImport ? "✕ Close" : "+ Import interactions"}</button>
            <button onClick={onClose} style={{
              background: "none", border: "none", color: T.dim,
              cursor: "pointer", fontSize: 16, padding: "2px 5px", lineHeight: 1, flexShrink: 0,
            }}>✕</button>
          </div>

          {/* Interactions list */}
          <div style={{
            maxHeight: 300, overflowY: "auto",
            borderRadius: 10, border: `1px solid ${T.border}`,
            background: T.card,
          }}>
            {loading && [1,2,3].map(i => (
              <div key={i} style={{
                height: 50, margin: "6px 10px", borderRadius: 8,
                background: T.well, opacity: 1 - i * 0.25,
              }} />
            ))}

            {!loading && sorted.length === 0 && (
              <div style={{ padding: "28px 20px", textAlign: "center" }}>
                <div style={{ fontSize: F.sm, color: T.dim, marginBottom: interactions.length === 0 ? 12 : 0 }}>
                  {interactions.length === 0
                    ? "No interactions imported for this post yet."
                    : `No ${activeType} interactions found.`}
                </div>
                {interactions.length === 0 && (
                  <button onClick={() => setShowImport(true)} style={{
                    display: "inline-block", fontSize: F.xs, fontWeight: 600,
                    color: "#fff", background: T.accent, border: "none",
                    borderRadius: 8, padding: "6px 14px", cursor: "pointer",
                  }}>Import interactions →</button>
                )}
              </div>
            )}

            {!loading && sorted.map((ix, i) => {
              const zone = ix.zone || "IGNORE";
              const zc   = ZONE_CFG_PANEL[zone] || ZONE_CFG_PANEL.IGNORE;
              const type = (ix.interaction_type || "comment").split(",")[0].trim();
              const tc   = TYPE_CFG_PANEL[type] || { label: type, icon: "·", color: T.sub };
              const d    = ix.interacted_at
                ? new Date(ix.interacted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "";
              return (
                <div key={ix.id || i} style={{
                  display: "flex", alignItems: "flex-start",
                  borderBottom: i < sorted.length - 1 ? `1px solid ${T.border}` : "none",
                  background: i % 2 === 0 ? T.card : "#FAFAF8",
                  transition: "background 0.1s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F0EDE8"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? T.card : "#FAFAF8"}
                >
                  <div style={{ width: 3, alignSelf: "stretch", flexShrink: 0, background: zc.color }} />
                  <div style={{ flex: 1, padding: "9px 14px", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{
                        fontSize: F.sm, fontWeight: 600, color: T.text,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
                      }}>@{ix.handle}</span>
                      <span style={{ fontSize: F.xs, fontWeight: 600, color: tc.color, flexShrink: 0 }}>
                        {tc.icon} {tc.label}
                      </span>
                      <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: "0.04em",
                        color: zc.color, background: zc.bg, border: `1px solid ${zc.border}`,
                        borderRadius: 4, padding: "1px 5px", flexShrink: 0,
                      }}>{zone}</span>
                      {d && <span style={{ fontSize: F.xs, color: T.dim, flexShrink: 0 }}>{d}</span>}
                      {ix.followers > 0 && (
                        <span style={{ fontSize: F.xs, color: T.dim, flexShrink: 0 }}>{fmtFol(ix.followers)}</span>
                      )}
                    </div>
                    {ix.content && (
                      <div style={{
                        fontSize: F.xs, color: T.sub, lineHeight: 1.5, marginTop: 2,
                        overflow: "hidden", display: "-webkit-box",
                        WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                      }}>{ix.content}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Import Interactions panel — toggled by button in toolbar */}
          {showImport && (
            <ImportInteractionsPanel post={post} onImported={refreshInteractions} />
          )}

        </div>
      </td>
    </tr>
  );
}

// ─── Add Post Drawer ──────────────────────────────────────────────────────────
const PLAT_OPTIONS_POSTS = ["instagram", "x", "youtube", "linkedin"];
const POST_TYPE_OPTIONS  = ["post", "reel", "video", "story"];

function AddPostDrawer({ open, onClose, onSaved }) {
  const [form, setForm] = useState({
    platform: "instagram", post_type: "post", content: "", permalink: "",
    published_at: new Date().toISOString().slice(0, 10),
    likes: "", comments: "", impressions: "", shares: "", saves: "", views: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);

  useEffect(() => {
    if (open) { setForm({ platform: "instagram", post_type: "post", content: "", permalink: "",
      published_at: new Date().toISOString().slice(0, 10),
      likes: "", comments: "", impressions: "", shares: "", saves: "", views: "" }); setError(null); }
  }, [open]);

  if (!open) return null;

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSave() {
    setSaving(true); setError(null);
    try {
      const payload = { ...form };
      ["likes","comments","impressions","shares","saves","views"].forEach(k => {
        payload[k] = payload[k] !== "" ? parseInt(payload[k]) || 0 : 0;
      });
      if (payload.published_at) payload.published_at = new Date(payload.published_at).toISOString();
      const res  = await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      onSaved(data.post);
      onClose();
    } catch (e) { setError(e.message); }
    setSaving(false);
  }

  const inputStyle = {
    width: "100%", boxSizing: "border-box", padding: "8px 12px", borderRadius: 8,
    border: `1px solid ${T.border}`, background: T.surface, color: T.text,
    fontFamily: sans, fontSize: F.sm, outline: "none",
  };
  const labelStyle = {
    display: "block", fontSize: F.xs, fontWeight: 700, color: T.sub,
    textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6, fontFamily: sans,
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(26,24,22,0.35)",
        zIndex: 999, backdropFilter: "blur(2px)", animation: "fadeIn 0.15s ease" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 460, background: T.surface,
        zIndex: 1000, boxShadow: "-4px 0 32px rgba(0,0,0,0.14)", display: "flex", flexDirection: "column",
        animation: "slideInRight 0.2s cubic-bezier(0.16,1,0.3,1)", fontFamily: sans }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px 16px", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div style={{ fontSize: F.lg, fontWeight: 700, color: T.text }}>New post</div>
          <button onClick={onClose} style={{ background: T.well, border: `1px solid ${T.border}`,
            borderRadius: 8, width: 32, height: 32, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: T.sub, fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {/* Platform */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Platform</label>
            <div style={{ display: "flex", gap: 6 }}>
              {PLAT_OPTIONS_POSTS.map(p => (
                <button key={p} onClick={() => set("platform", p)} style={{
                  padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontFamily: sans,
                  fontSize: F.xs, fontWeight: 700, letterSpacing: "0.04em",
                  border: `1px solid ${form.platform === p ? (PLAT_COLORS[p] + "88") : T.border}`,
                  background: form.platform === p ? (PLAT_COLORS[p] + "14") : T.surface,
                  color: form.platform === p ? PLAT_COLORS[p] : T.sub,
                  transition: "all 0.12s",
                }}>{PLAT_LABEL[p]}</button>
              ))}
            </div>
          </div>
          {/* Post type */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Post type</label>
            <div style={{ display: "flex", gap: 6 }}>
              {POST_TYPE_OPTIONS.map(t => (
                <button key={t} onClick={() => set("post_type", t)} style={{
                  padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontFamily: sans,
                  fontSize: F.xs, fontWeight: 700, letterSpacing: "0.04em",
                  border: `1px solid ${form.post_type === t ? T.accentBorder : T.border}`,
                  background: form.post_type === t ? T.accentBg : T.surface,
                  color: form.post_type === t ? T.accent : T.sub,
                  transition: "all 0.12s",
                }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
              ))}
            </div>
          </div>
          {/* Content */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Content / caption</label>
            <textarea value={form.content} onChange={e => set("content", e.target.value)}
              placeholder="Post caption or description..." rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
              onFocus={e => e.target.style.borderColor = T.accent}
              onBlur={e => e.target.style.borderColor = T.border} />
          </div>
          {/* Permalink */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>URL / permalink</label>
            <input value={form.permalink} onChange={e => set("permalink", e.target.value)}
              placeholder="https://..." style={inputStyle}
              onFocus={e => e.target.style.borderColor = T.accent}
              onBlur={e => e.target.style.borderColor = T.border} />
          </div>
          {/* Date */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Published date</label>
            <input type="date" value={form.published_at} onChange={e => set("published_at", e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = T.accent}
              onBlur={e => e.target.style.borderColor = T.border} />
          </div>
          {/* Stats */}
          <div style={{ fontSize: F.xs, fontWeight: 700, color: T.sub, textTransform: "uppercase",
            letterSpacing: "0.07em", marginBottom: 12 }}>Stats (optional)</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 12px" }}>
            {["likes","comments","impressions","shares","saves","views"].map(k => (
              <div key={k}>
                <label style={{ ...labelStyle, textTransform: "capitalize", marginBottom: 4 }}>{k}</label>
                <input type="number" value={form[k]} onChange={e => set(k, e.target.value)}
                  placeholder="0" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = T.accent}
                  onBlur={e => e.target.style.borderColor = T.border} />
              </div>
            ))}
          </div>
        </div>
        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: `1px solid ${T.border}`, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {error && <div style={{ background: T.redBg, border: `1px solid ${T.redBorder}`, borderRadius: 8,
            padding: "8px 12px", fontSize: F.xs, color: T.red }}>{error}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "10px 0", borderRadius: 9, cursor: "pointer",
              background: T.well, border: `1px solid ${T.border}`, color: T.sub,
              fontFamily: sans, fontSize: F.sm, fontWeight: 600 }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{
              flex: 2, padding: "10px 0", borderRadius: 9, cursor: saving ? "default" : "pointer",
              background: saving ? T.dim : T.accent, border: "none", color: "#fff",
              fontFamily: sans, fontSize: F.sm, fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving…" : "Add post"}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideInRight { from { transform: translateX(100%) } to { transform: translateX(0) } }
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </>
  );
}

// ─── Posts table ──────────────────────────────────────────────────────────────
function PostsTable({ posts, activePlatform, selectedWeek, onImported }) {
  const [sortBy,      setSortBy]      = useState("published_at");
  const [sortDesc,    setSortDesc]    = useState(true);
  const [expanded,    setExpanded]    = useState(null); // { post, typeFilter }
  const [showImport,  setShowImport]  = useState(false);
  const [search,      setSearch]      = useState("");
  const [showAdd,     setShowAdd]     = useState(false);
  const [localPosts,  setLocalPosts]  = useState([]);

  // Merge server posts with any locally added ones
  const allPosts = useMemo(() => {
    const ids = new Set(posts.map(p => p.id));
    return [...localPosts.filter(p => !ids.has(p.id)), ...posts];
  }, [posts, localPosts]);

  const visible = allPosts.filter(p => {
    if (activePlatform.length > 0 && !activePlatform.includes(p.platform)) return false;
    if (p.post_type === "daily_aggregate") return false;
    if (selectedWeek && weekKey(p.published_at) !== selectedWeek) return false;
    if (search) {
      const q = search.toLowerCase();
      return (p.content || "").toLowerCase().includes(q) ||
             (p.permalink || "").toLowerCase().includes(q) ||
             (p.platform || "").toLowerCase().includes(q);
    }
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

  function handleStatClick(post, typeFilter) {
    if (expanded?.post?.id === post.id && expanded?.typeFilter === typeFilter) {
      setExpanded(null);
    } else {
      setExpanded({ post, typeFilter });
    }
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
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
      padding: "20px 24px", marginBottom: 24, boxShadow: T.shadowSm }}>

      <AddPostDrawer open={showAdd} onClose={() => setShowAdd(false)}
        onSaved={post => setLocalPosts(prev => [post, ...prev])} />

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: showImport ? 12 : 14, flexWrap: "wrap" }}>
        <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text, flexShrink: 0 }}>
          All Posts
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginLeft: 8, minWidth: 22, height: 20, padding: "0 7px",
            borderRadius: 10, background: T.well, border: `1px solid ${T.border}`,
            fontFamily: sans, fontSize: F.xs, fontWeight: 600, color: T.sub,
          }}>{sorted.length}</span>
          {selectedWeek && (
            <span style={{ fontFamily: sans, fontSize: F.xs, fontWeight: 400, color: T.sub, marginLeft: 8 }}>
              week of {weekLabel(selectedWeek)}
            </span>
          )}
        </div>
        <input
          value={search}
          placeholder="Search..."
          onChange={e => setSearch(e.target.value)}
          style={{
            marginLeft: "auto", background: T.card, border: `1px solid ${T.border}`,
            color: T.text, borderRadius: 8, padding: "6px 12px", fontFamily: sans,
            fontSize: F.sm, outline: "none", width: 200,
          }}
        />
        <button
          onClick={() => setShowImport(s => !s)}
          style={{
            padding: "6px 14px", borderRadius: 8, cursor: "pointer",
            fontFamily: sans, fontSize: F.xs, fontWeight: 600, border: "1px solid",
            borderColor: showImport ? T.accent : T.border,
            background:  showImport ? T.accent : T.well,
            color:       showImport ? "#fff"   : T.text,
            transition: "all 0.15s", flexShrink: 0,
          }}>
          {showImport ? "✕ Close" : "↑ Import"}
        </button>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 8, cursor: "pointer",
            background: T.accent, border: "none", color: "#fff",
            fontFamily: sans, fontSize: F.sm, fontWeight: 700,
            boxShadow: "0 1px 4px rgba(255,107,53,0.3)",
            transition: "opacity 0.15s, transform 0.1s", flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <span style={{ fontSize: 18, lineHeight: 1, fontWeight: 300 }}>+</span>
          Add post
        </button>
      </div>

      {showImport && (
        <ImportPostsPanel
          activePlatform={activePlatform}
          onImported={onImported}
          onClose={() => setShowImport(false)}
        />
      )}

      <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${T.border}` }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: T.card, minWidth: 700 }}>
          <colgroup>
            <col />
            <col style={{ width: 72 }} />
            <col style={{ width: 80 }} />
            <col style={{ width: 80 }} />
            <col style={{ width: 90 }} />
            <col style={{ width: 90 }} />
          </colgroup>
          <thead>
            <tr style={{ background: T.well }}>
              <th style={{ ...thStyle(), cursor: "default" }}>Content</th>
              <th style={{ ...thStyle(), cursor: "default" }}>Platform</th>
              <th style={thStyle("likes")} onClick={() => toggleSort("likes")}>
                Likes {sortBy === "likes" ? (sortDesc ? "↓" : "↑") : ""}
              </th>
              <th style={thStyle("impressions")} onClick={() => toggleSort("impressions")}>
                Impr. {sortBy === "impressions" ? (sortDesc ? "↓" : "↑") : ""}
              </th>
              <th style={thStyle("comments")} onClick={() => toggleSort("comments")}>
                Comments {sortBy === "comments" ? (sortDesc ? "↓" : "↑") : ""}
              </th>
              <th style={thStyle("published_at")} onClick={() => toggleSort("published_at")}>
                Date {sortBy === "published_at" ? (sortDesc ? "↓" : "↑") : ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr><td colSpan={6} style={{ ...td, textAlign: "center", color: T.dim, padding: 40 }}>
                {selectedWeek ? `No posts for week of ${weekLabel(selectedWeek)}` : "No posts yet — import data above"}
              </td></tr>
            )}
            {sorted.map((p, i) => {
              const likes            = parseInt(p.likes || 0);
              const isHot            = likes >= LIKES_GOAL;
              const isDailyAggregate = p.post_type === "daily_aggregate";
              const isExpanded       = expanded?.post?.id === p.id;

              const statBtn = (typeFilter, label, isActive) => ({
                onClick: (e) => { e.stopPropagation(); handleStatClick(p, typeFilter); },
                style: {
                  background: isActive ? T.accent + "15" : "transparent",
                  border: `1px solid ${isActive ? T.accent : "transparent"}`,
                  borderRadius: 6, padding: "3px 8px", cursor: "pointer",
                  fontFamily: sans, fontSize: F.sm, color: isActive ? T.accent : T.sub,
                  fontWeight: 400, transition: "all 0.1s",
                },
              });

              return (
                <React.Fragment key={p.id || i}>
                  <tr style={{
                    background: i % 2 === 0 ? T.card : T.well + "88",
                    transition: "background 0.1s",
                  }}>
                    {/* Content — link to post if permalink available */}
                    <td style={{ ...td, maxWidth: 0 }}>
                      {p.permalink && !isDailyAggregate ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                          <a href={p.permalink} target="_blank" rel="noreferrer"
                            style={{
                              flex: 1, minWidth: 0, overflow: "hidden",
                              textOverflow: "ellipsis", whiteSpace: "nowrap",
                              fontSize: F.xs, color: T.text, textDecoration: "none",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = T.accent; e.currentTarget.style.textDecoration = "underline"; }}
                            onMouseLeave={e => { e.currentTarget.style.color = T.text; e.currentTarget.style.textDecoration = "none"; }}
                          >{p.content || p.permalink}</a>
                          {p.source === "interactions" && (
                            <span style={{
                              flexShrink: 0, fontSize: 9, fontWeight: 600,
                              color: T.dim, background: T.well,
                              border: `1px solid ${T.border}`, borderRadius: 4,
                              padding: "1px 5px", letterSpacing: "0.02em",
                            }}>interactions only</span>
                          )}
                        </div>
                      ) : (
                        <div style={{
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          fontSize: F.xs, color: isDailyAggregate ? T.dim : T.text,
                          fontStyle: isDailyAggregate ? "italic" : "normal",
                        }}>{p.content || "—"}</div>
                      )}
                    </td>

                    <td style={td}><PlatDot platform={p.platform} size={12} /></td>

                    {/* Likes — clickable stat */}
                    <td style={{ ...td, padding: "11px 6px" }}>
                      {isDailyAggregate ? (
                        <span style={{ padding: "3px 8px", fontWeight: isHot ? 700 : 400,
                          color: isHot ? T.green : T.text }}>
                          {isHot && "🔥 "}{fmt(likes)}
                        </span>
                      ) : (
                        <button {...statBtn("like", fmt(likes), isExpanded && expanded.typeFilter === "like")}
                          style={{
                            ...statBtn("like", fmt(likes), isExpanded && expanded.typeFilter === "like").style,
                            fontWeight: isHot ? 700 : 400,
                            color: isExpanded && expanded.typeFilter === "like"
                              ? T.accent
                              : isHot ? T.green : T.text,
                          }}>
                          {isHot && "🔥 "}{fmt(likes)}
                        </button>
                      )}
                    </td>

                    <td style={{ ...td, color: T.sub }}>{fmt(p.impressions)}</td>

                    {/* Comments — clickable stat */}
                    <td style={{ ...td, padding: "11px 6px" }}>
                      {isDailyAggregate ? (
                        <span style={{ padding: "3px 8px", color: T.sub }}>{fmt(p.comments)}</span>
                      ) : (
                        <button {...statBtn("comment", fmt(p.comments), isExpanded && expanded.typeFilter === "comment")}>
                          {fmt(p.comments)}
                        </button>
                      )}
                    </td>

                    <td style={{ ...td, whiteSpace: "nowrap", color: T.sub, fontSize: F.xs }}>
                      {fmtDate(p.published_at)}
                    </td>
                  </tr>

                  {/* Inline expansion row */}
                  {isExpanded && (
                    <ExpandedInteractions
                      post={p}
                      typeFilter={expanded.typeFilter}
                      onClose={() => setExpanded(null)}
                      colSpan={6}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main page — Engagement tab ──────────────────────────────────────────────
export default function EngagementPage() {
  return (
    <PageShell activeTab="engagement">
      {({ posts, activePlatform, selectedWeek, setSelectedWeek, dateFrom, dateTo, loadPosts }) => (
        <>
          <WeeklyOKR
            posts={posts}
            activePlatform={activePlatform}
            selectedWeek={selectedWeek}
            onWeekSelect={setSelectedWeek}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />

          <Outliers
            posts={posts}
            activePlatform={activePlatform}
            selectedWeek={selectedWeek}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />

          <PostsTable
            posts={posts}
            activePlatform={activePlatform}
            selectedWeek={selectedWeek}
            onImported={() => loadPosts?.(dateFrom, dateTo)}
          />
        </>
      )}
    </PageShell>
  );
}
