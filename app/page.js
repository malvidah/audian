"use client";
import React, { useState, useEffect } from "react";
import PageShell, { T, sans, F } from "../components/PageShell";

const PLAT_COLORS = { youtube: "#FF0000", x: "#000000", instagram: "#E1306C", linkedin: "#0077B5" };
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
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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

// ─── Weekly OKR tracker (also acts as week filter) ────────────────────────────
function WeeklyOKR({ posts, activePlatform, selectedWeek, onWeekSelect, dateFrom, dateTo }) {
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

  const filtered = activePlatform && activePlatform !== "all"
    ? snapshots.filter(s => s.platform === activePlatform)
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
                {d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
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

// ─── Outliers ─────────────────────────────────────────────────────────────────
function Outliers({ posts, activePlatform, selectedWeek }) {
  const filtered = posts.filter(p => {
    if (p.post_type === "daily_aggregate") return false;
    if (activePlatform !== "all" && p.platform !== activePlatform) return false;
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

  const platLabel = activePlatform === "all" ? "all platforms" : (PLAT_LABEL[activePlatform] || activePlatform);
  const weekSuffix = selectedWeek ? ` · week of ${weekLabel(selectedWeek)}` : "";

  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
      padding: "20px 24px", marginBottom: 24, boxShadow: T.shadowSm }}>
      <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text, marginBottom: 12 }}>
        Outliers · {platLabel}{weekSuffix}
        <span style={{ fontWeight: 400, color: T.dim, marginLeft: 8 }}>avg {fmt(Math.round(avg))} likes</span>
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

  // Sync when parent switches stat button
  useEffect(() => { setActiveType(typeFilter || null); }, [typeFilter]);

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
            <a href={importHref} style={{
              fontSize: F.xs, fontWeight: 600, color: T.accent, textDecoration: "none",
              background: "#FFF3EE", border: "1px solid #FFD4C2",
              borderRadius: 6, padding: "3px 10px", flexShrink: 0,
            }}>+ Import</a>
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
                  <a href={importHref} style={{
                    display: "inline-block", fontSize: F.xs, fontWeight: 600,
                    color: "#fff", background: T.accent, textDecoration: "none",
                    borderRadius: 8, padding: "6px 14px",
                  }}>Import interactions →</a>
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

        </div>
      </td>
    </tr>
  );
}

// ─── Posts table ──────────────────────────────────────────────────────────────
function PostsTable({ posts, activePlatform, selectedWeek }) {
  const [sortBy,   setSortBy]   = useState("published_at");
  const [sortDesc, setSortDesc] = useState(true);
  const [expanded, setExpanded] = useState(null); // { post, typeFilter }

  const visible = posts.filter(p => {
    if (activePlatform !== "all" && p.platform !== activePlatform) return false;
    if (p.post_type === "daily_aggregate") return false;
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
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text }}>
          All Content
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginLeft: 8, minWidth: 22, height: 20, padding: "0 7px",
            borderRadius: 10, background: T.well, border: `1px solid ${T.border}`,
            fontFamily: sans, fontSize: F.xs, fontWeight: 600, color: T.sub,
          }}>{sorted.length}</span>
        </div>
        {selectedWeek && (
          <div style={{ fontFamily: sans, fontSize: F.xs, color: T.sub }}>
            week of {weekLabel(selectedWeek)}
          </div>
        )}
      </div>

      <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${T.border}` }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: T.card }}>
          <thead>
            <tr style={{ background: T.well }}>
              <th style={{ ...thStyle(), width: "50%", cursor: "default" }}>Content</th>
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
                        <a href={p.permalink} target="_blank" rel="noreferrer"
                          style={{
                            display: "block", overflow: "hidden",
                            textOverflow: "ellipsis", whiteSpace: "nowrap",
                            fontSize: F.xs, color: T.text, textDecoration: "none",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = T.accent; e.currentTarget.style.textDecoration = "underline"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = T.text; e.currentTarget.style.textDecoration = "none"; }}
                        >{p.content || "—"}</a>
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
      {({ posts, activePlatform, selectedWeek, setSelectedWeek, dateFrom, dateTo, followerSnaps }) => (
        <>
          <FollowersChart snapshots={followerSnaps} activePlatform={activePlatform} />

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
          />

          <PostsTable
            posts={posts}
            activePlatform={activePlatform}
            selectedWeek={selectedWeek}
          />
        </>
      )}
    </PageShell>
  );
}
