"use client";
import { useState, useCallback, useRef, useEffect } from "react";

// ─── Design tokens (light theme, matching /posts) ─────────────────────────────
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
  purple:       "#7C3AED",
  purpleBg:     "#F5F3FF",
  purpleBorder: "#DDD6FE",
  blue:         "#2563EB",
  blueBg:       "#EFF6FF",
  shadow:       "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
  shadowSm:     "0 1px 2px rgba(0,0,0,0.05)",
  shadowMd:     "0 4px 24px rgba(0,0,0,0.08)",
};

const PLAT_COLORS = { youtube: "#FF0000", x: "#000000", instagram: "#E1306C", linkedin: "#0077B5" };
const PLAT_LABEL  = { youtube: "YouTube", x: "X", instagram: "Instagram", linkedin: "LinkedIn" };
const PLAT_URL    = {
  instagram: h => `https://instagram.com/${h}`,
  x:         h => `https://x.com/${h}`,
  youtube:   h => `https://youtube.com/@${h}`,
  linkedin:  h => `https://linkedin.com/in/${h}`,
};
const IX_ICON  = { follow: "👤", like: "♥", comment: "💬", mention: "@", tag: "🏷", view: "👁" };
const ZC = {
  ELITE:       { color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  INFLUENTIAL: { color: "#FF6B35", bg: "#FFF3EE", border: "#FFD4C2" },
  SIGNAL:      { color: "#6B6560", bg: "#F3F2F0", border: "#E8E6E1" },
  IGNORE:      { color: "#A8A39C", bg: "#FEF2F2", border: "#FECACA" },
};

// Staging-queue dark theme (kept for import UX coherence)
const DT = {
  bg: "#0B0C0F", card: "#13141A", well: "#1A1C23", border: "#2A2D38",
  text: "#F0EDE8", sub: "#9B9590", dim: "#5A5650",
  accent: "#FF6B35", accentBg: "#1A1108", accentBorder: "#5A2A0C",
  green: "#22C55E", greenBg: "#0A1F10",
  purple: "#A78BFA", purpleBg: "#130E24",
  blue: "#60A5FA", blueBg: "#0A1020",
  shadow: "0 2px 8px rgba(0,0,0,0.4)",
};
const DZC = {
  ELITE:       { color: DT.purple, bg: DT.purpleBg, border: "#3D3060" },
  INFLUENTIAL: { color: DT.accent, bg: DT.accentBg, border: DT.accentBorder },
  SIGNAL:      { color: DT.sub,    bg: DT.well,     border: DT.border },
  IGNORE:      { color: "#555",    bg: "#1F0A0A",   border: "#3A1A1A" },
};
const PLAT_ICON  = { instagram: "📸", x: "𝕏", youtube: "▶", linkedin: "in" };
const PLAT_COLOR = { instagram: "#E1306C", x: "#ccc", youtube: "#FF0000", linkedin: "#0A66C2" };

const sans = "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif";
const F = { xl: 28, lg: 20, md: 15, sm: 13, xs: 11 };

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
function fmtDateTime(ts) {
  if (!ts) return null;
  const d = new Date(ts);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}
function weekKey(iso) {
  const d = new Date(iso);
  const mon = new Date(d);
  mon.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return mon.toISOString().slice(0, 10);
}
function weekLabel(key) {
  return new Date(key + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function weekEnd(key) {
  const d = new Date(key + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 6);
  return d;
}
function computeZone(item) {
  if (item.zone === "ELITE" || item.on_watchlist) return "ELITE";
  const followers = parseInt(item.followers) || 0;
  const high = followers >= 100_000;
  if (high) return "INFLUENTIAL";
  if (item.bio?.trim()) return "SIGNAL";
  return "IGNORE";
}

// ─── Platform stats cards (light theme) ──────────────────────────────────────
function PlatformStats({ interactions, activePlatform, onPlatform }) {
  const plats = [...new Set(interactions.map(i => i.platform))].filter(Boolean);
  const stats = ["all", ...plats].map(p => {
    const items = p === "all" ? interactions : interactions.filter(i => i.platform === p);
    const elite = items.filter(i => i.zone === "ELITE" || i.zone === "INFLUENTIAL").length;
    return { platform: p, count: items.length, elite };
  });

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
      {stats.map(s => {
        const active = activePlatform === s.platform;
        const color  = s.platform === "all" ? T.accent : PLAT_COLORS[s.platform];
        return (
          <div key={s.platform} onClick={() => onPlatform(s.platform)}
            style={{ background: T.card, border: `2px solid ${active ? (color || T.accent) : T.border}`,
              borderRadius: 12, padding: "14px 18px", cursor: "pointer",
              boxShadow: active ? T.shadowMd : T.shadowSm,
              transition: "all 0.15s", minWidth: 120 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              {s.platform !== "all" && (
                <span style={{ color: PLAT_COLORS[s.platform], fontSize: 13 }}>
                  {PLAT_ICON[s.platform]}
                </span>
              )}
              <span style={{ fontFamily: sans, fontSize: F.xs, fontWeight: 600,
                color: active ? (color || T.accent) : T.sub }}>
                {s.platform === "all" ? "All platforms" : PLAT_LABEL[s.platform] || s.platform}
              </span>
            </div>
            <div style={{ fontFamily: sans, fontSize: F.lg, fontWeight: 700, color: T.text }}>
              {s.count.toLocaleString()}
            </div>
            <div style={{ fontFamily: sans, fontSize: F.xs, color: T.sub, marginTop: 2 }}>
              {s.elite > 0 ? `${s.elite} influential` : "interactions"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Weekly overview chips ────────────────────────────────────────────────────
function WeeklyOverview({ interactions, activePlatform, selectedWeek, onWeekSelect }) {
  const filtered = activePlatform === "all"
    ? interactions
    : interactions.filter(i => i.platform === activePlatform);

  const weekMap = {};
  for (const ix of filtered) {
    if (!ix.interacted_at) continue;
    const k = weekKey(ix.interacted_at);
    if (!weekMap[k]) weekMap[k] = { count: 0, elite: 0 };
    weekMap[k].count++;
    if (ix.zone === "ELITE" || ix.zone === "INFLUENTIAL") weekMap[k].elite++;
  }

  const weeks = Object.entries(weekMap).sort((a, b) => a[0].localeCompare(b[0]));
  if (weeks.length === 0) return null;

  const maxCount = Math.max(...weeks.map(([, w]) => w.count), 1);

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
        <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text }}>
          Weekly overview
        </div>
        <div style={{ fontFamily: sans, fontSize: F.xs, color: T.sub }}>
          click a week to filter
          {selectedWeek && (
            <button onClick={() => onWeekSelect(null)}
              style={{ marginLeft: 8, background: "none", border: "none",
                color: T.accent, cursor: "pointer", fontSize: F.xs, fontWeight: 600, padding: 0 }}>
              × clear
            </button>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "flex-end" }}>
        {weeks.map(([key, w]) => {
          const isSelected   = selectedWeek === key;
          const isIncomplete = weekEnd(key) > new Date();
          const hasElite     = w.elite > 0;
          const heightPct    = Math.max(20, (w.count / maxCount) * 100);
          return (
            <div key={key} onClick={() => onWeekSelect(isSelected ? null : key)}
              style={{ cursor: "pointer", display: "flex", flexDirection: "column",
                alignItems: "center", gap: 4 }}>
              <div style={{ width: 40, height: 48, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                <div style={{ width: 28, height: `${heightPct}%`,
                  background: isSelected ? T.accent : hasElite ? T.purple : T.border2,
                  borderRadius: "4px 4px 2px 2px", transition: "all 0.15s",
                  opacity: isIncomplete ? 0.45 : 1 }} />
              </div>
              <div style={{ background: isSelected ? T.accent : T.well,
                color: isSelected ? "#fff" : T.sub,
                border: `1px solid ${isSelected ? T.accent : T.border}`,
                borderRadius: 8, padding: "4px 8px", textAlign: "center", transition: "all 0.12s" }}>
                <div style={{ fontFamily: sans, fontSize: 10, fontWeight: 600 }}>{weekLabel(key)}</div>
                <div style={{ fontFamily: sans, fontSize: 10, opacity: 0.8 }}>{w.count}</div>
                {hasElite && !isSelected && (
                  <div style={{ fontFamily: sans, fontSize: 9, color: T.purple }}>★ {w.elite}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Influential interactions grid ────────────────────────────────────────────
function InfluentialInteractions({ interactions, activePlatform, selectedWeek }) {
  const top = interactions
    .filter(ix => {
      if (ix.zone !== "ELITE" && ix.zone !== "INFLUENTIAL") return false;
      if (activePlatform !== "all" && ix.platform !== activePlatform) return false;
      if (selectedWeek && (!ix.interacted_at || weekKey(ix.interacted_at) !== selectedWeek)) return false;
      return true;
    })
    .sort((a, b) => (parseInt(b.followers) || 0) - (parseInt(a.followers) || 0))
    .slice(0, 12);

  if (top.length === 0) return null;

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text, marginBottom: 12 }}>
        Influential interactions
        <span style={{ marginLeft: 8, fontFamily: sans, fontSize: F.xs, fontWeight: 400, color: T.dim }}>
          elite & influential accounts only · sorted by reach
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
        {top.map(ix => {
          const zc = ZC[ix.zone] || ZC.SIGNAL;
          const initial = (ix.name || ix.handle || "?")[0].toUpperCase();
          return (
            <div key={ix.id} style={{ background: T.card, border: `1px solid ${T.border}`,
              borderRadius: 12, padding: "14px 16px", boxShadow: T.shadowSm }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                  background: zc.bg, border: `1px solid ${zc.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 800, color: zc.color, fontFamily: sans }}>
                  {initial}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                    <a href={PLAT_URL[ix.platform]?.(ix.handle)} target="_blank" rel="noreferrer"
                      style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 700, color: T.text,
                        textDecoration: "none" }}>
                      {ix.name || `@${ix.handle}`}
                    </a>
                    <span style={{ background: zc.bg, color: zc.color, border: `1px solid ${zc.border}`,
                      borderRadius: 4, padding: "1px 6px", fontSize: 9, fontWeight: 700, fontFamily: sans }}>
                      {ix.zone}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                    <span style={{ color: PLAT_COLORS[ix.platform], fontSize: 11 }}>{PLAT_ICON[ix.platform]}</span>
                    <span style={{ fontFamily: sans, fontSize: F.xs, color: T.sub }}>@{ix.handle}</span>
                    {ix.followers && (
                      <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>
                        · {fmt(ix.followers)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12 }}>{IX_ICON[ix.interaction_type] || "•"}</span>
                <span style={{ fontFamily: sans, fontSize: F.xs, color: T.sub, textTransform: "capitalize" }}>
                  {ix.interaction_type || "interaction"}
                </span>
                {ix.content && (
                  <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim, flex: 1,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    · "{ix.content}"
                  </span>
                )}
              </div>
              {ix.interacted_at && (
                <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim, marginTop: 5 }}>
                  {fmtDate(ix.interacted_at)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Interactions table ───────────────────────────────────────────────────────
function InteractionsTable({ interactions, activePlatform, selectedWeek, onDelete }) {
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  const filtered = interactions.filter(ix => {
    if (activePlatform !== "all" && ix.platform !== activePlatform) return false;
    if (selectedWeek && (!ix.interacted_at || weekKey(ix.interacted_at) !== selectedWeek)) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let av, bv;
    if      (sortKey === "date")      { av = a.interacted_at || ""; bv = b.interacted_at || ""; }
    else if (sortKey === "followers") { av = parseInt(a.followers) || 0; bv = parseInt(b.followers) || 0; }
    else if (sortKey === "handle")    { av = (a.handle || "").toLowerCase(); bv = (b.handle || "").toLowerCase(); }
    else if (sortKey === "zone")      { const ord = { ELITE:0, INFLUENTIAL:1, SIGNAL:2, IGNORE:3 };
                                        av = ord[a.zone] ?? 9; bv = ord[b.zone] ?? 9; }
    else if (sortKey === "type")      { av = a.interaction_type || ""; bv = b.interaction_type || ""; }
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });

  const toggleSort = key => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir(key === "date" ? "desc" : key === "followers" ? "desc" : "asc"); }
  };

  const arrow = key => sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  const thS = key => ({
    textAlign: "left", padding: "9px 14px", fontFamily: sans, fontSize: F.xs, fontWeight: 600,
    color: sortKey === key ? T.text : T.sub, background: T.well,
    cursor: "pointer", userSelect: "none", borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap",
  });

  if (sorted.length === 0) {
    return (
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
        padding: "48px 40px", textAlign: "center", boxShadow: T.shadowSm }}>
        <div style={{ fontSize: 28, marginBottom: 10 }}>📭</div>
        <div style={{ fontFamily: sans, fontSize: F.md, fontWeight: 600, color: T.text, marginBottom: 4 }}>
          No interactions for this filter
        </div>
        <div style={{ fontFamily: sans, fontSize: F.sm, color: T.sub }}>
          Try a different platform or date range
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
      overflow: "hidden", boxShadow: T.shadowSm }}>
      <div style={{ padding: "12px 14px", borderBottom: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: sans, fontSize: F.xs, color: T.sub }}>
          {sorted.length.toLocaleString()} interaction{sorted.length !== 1 ? "s" : ""}
          {filtered.length !== interactions.length && ` (filtered from ${interactions.length})`}
        </span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr>
              <th style={thS("handle")} onClick={() => toggleSort("handle")}>Person{arrow("handle")}</th>
              <th style={thS("zone")} onClick={() => toggleSort("zone")}>Zone{arrow("zone")}</th>
              <th style={thS("type")} onClick={() => toggleSort("type")}>Type{arrow("type")}</th>
              <th style={thS("followers")} onClick={() => toggleSort("followers")}>Followers{arrow("followers")}</th>
              <th style={{ ...thS("content"), cursor: "default", width: "30%" }}>Content</th>
              <th style={thS("date")} onClick={() => toggleSort("date")}>Date{arrow("date")}</th>
              {onDelete && <th style={{ ...thS(""), cursor: "default", width: 36 }} />}
            </tr>
          </thead>
          <tbody>
            {sorted.map(ix => {
              const zc = ZC[ix.zone] || ZC.SIGNAL;
              return (
                <tr key={ix.id}
                  style={{ borderBottom: `1px solid ${T.border}`, transition: "background 0.08s" }}
                  onMouseEnter={e => e.currentTarget.style.background = T.well}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: PLAT_COLORS[ix.platform], fontSize: 12 }}>
                        {PLAT_ICON[ix.platform]}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <a href={PLAT_URL[ix.platform]?.(ix.handle)} target="_blank" rel="noreferrer"
                          style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text,
                            textDecoration: "none", display: "block",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
                          {ix.name || `@${ix.handle}`}
                        </a>
                        <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>@{ix.handle}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ background: zc.bg, color: zc.color, border: `1px solid ${zc.border}`,
                      borderRadius: 5, padding: "2px 8px", fontSize: 10, fontWeight: 700, fontFamily: sans }}>
                      {ix.zone}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: sans, fontSize: F.xs, color: T.sub }}>
                      <span>{IX_ICON[ix.interaction_type] || "•"}</span>
                      <span style={{ textTransform: "capitalize" }}>{ix.interaction_type || "—"}</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px", fontFamily: sans, fontSize: F.xs, color: T.sub, whiteSpace: "nowrap" }}>
                    {ix.followers ? fmt(ix.followers) : "—"}
                  </td>
                  <td style={{ padding: "10px 14px", fontFamily: sans, fontSize: F.xs, color: T.dim, maxWidth: 280 }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ix.content || "—"}
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px", fontFamily: sans, fontSize: F.xs, color: T.dim, whiteSpace: "nowrap" }}
                    title={fmtDateTime(ix.interacted_at)}>
                    {fmtDate(ix.interacted_at)}
                  </td>
                  {onDelete && (
                    <td style={{ padding: "10px 8px", textAlign: "center" }}>
                      <button onClick={() => onDelete(ix.id)}
                        style={{ background: "none", border: "none", color: T.dim, cursor: "pointer",
                          fontSize: 14, padding: "2px 6px", borderRadius: 4, transition: "color 0.1s" }}
                        onMouseEnter={e => e.currentTarget.style.color = T.red}
                        onMouseLeave={e => e.currentTarget.style.color = T.dim}>
                        ×
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Drop zone (light theme) ──────────────────────────────────────────────────
function DropZone({ onImages, onCSV, disabled }) {
  const [drag, setDrag] = useState(false);
  const imgRef = useRef(); const csvRef = useRef();
  const handle = useCallback((files) => {
    const imgs = Array.from(files).filter(f => f.type.startsWith("image/"));
    const csvs = Array.from(files).filter(f => f.name.endsWith(".csv") || f.name.endsWith(".txt"));
    if (imgs.length) onImages(imgs);
    if (csvs.length) onCSV(csvs[0]);
  }, [onImages, onCSV]);

  return (
    <div onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDrag(false); }}
      onDrop={e => { e.preventDefault(); setDrag(false); if (!disabled) handle(e.dataTransfer.files); }}
      style={{ border: `2px dashed ${drag ? T.accent : T.border2}`, borderRadius: 12,
        padding: "18px 22px", background: drag ? T.accentBg : T.well,
        transition: "all 0.2s", display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        {[{ icon: "📸", l: "Screenshot" }, { icon: "📄", l: "CSV" }].map(({ icon, l }) => (
          <div key={l} style={{ width: 40, height: 40, borderRadius: 8, background: T.card,
            border: `1px solid ${T.border}`, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 1, boxShadow: T.shadowSm }}>
            <span style={{ fontSize: 16 }}>{icon}</span>
            <span style={{ fontSize: 7, color: T.dim, fontFamily: sans, textTransform: "uppercase", letterSpacing: "0.05em" }}>{l}</span>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 700, color: T.text, marginBottom: 2 }}>
          {drag ? "Drop to import" : "Drop screenshots or CSV to import"}
        </div>
        <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>
          Instagram · X · YouTube · LinkedIn — AI parses screenshots, web search fills follower counts
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button onClick={() => !disabled && imgRef.current?.click()} disabled={disabled}
          style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 8,
            padding: "7px 14px", fontFamily: sans, fontSize: F.sm, fontWeight: 600,
            cursor: "pointer", opacity: disabled ? 0.6 : 1 }}>
          ↑ Screenshots
        </button>
        <button onClick={() => !disabled && csvRef.current?.click()} disabled={disabled}
          style={{ background: T.card, color: T.sub, border: `1px solid ${T.border}`,
            borderRadius: 8, padding: "7px 14px", fontFamily: sans, fontSize: F.sm, fontWeight: 600, cursor: "pointer" }}>
          CSV
        </button>
      </div>
      <input ref={imgRef} type="file" multiple accept="image/*" style={{ display: "none" }} onChange={e => handle(e.target.files)} />
      <input ref={csvRef} type="file" accept=".csv,.txt" style={{ display: "none" }} onChange={e => handle(e.target.files)} />
    </div>
  );
}

// ─── Manual add panel ─────────────────────────────────────────────────────────
function ManualPanel({ onAdd, onClose }) {
  const [v, setV] = useState({
    handle: "", name: "", bio: "", followers: "",
    platform: "instagram", interaction_type: "follow", zone: "SIGNAL",
    interacted_at: new Date().toISOString().slice(0, 10),
  });
  const set = (k, val) => setV(p => ({ ...p, [k]: val }));
  const lbl = t => <div style={{ fontSize: F.xs, color: T.sub, fontFamily: sans, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5, fontWeight: 600 }}>{t}</div>;
  const inp = (k, ph, type = "text") => (
    <input value={v[k]} type={type} placeholder={ph} onChange={e => set(k, e.target.value)}
      style={{ background: T.well, border: `1px solid ${T.border}`, color: T.text,
        borderRadius: 8, padding: "8px 12px", fontFamily: sans, fontSize: F.sm, outline: "none", width: "100%" }} />
  );
  const sel = (k, opts) => (
    <select value={v[k]} onChange={e => set(k, e.target.value)}
      style={{ background: T.well, border: `1px solid ${T.border}`, color: T.text,
        borderRadius: 8, padding: "8px 12px", fontFamily: sans, fontSize: F.sm, width: "100%", outline: "none" }}>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20, boxShadow: T.shadow }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontFamily: sans, fontWeight: 700, color: T.text, fontSize: F.md }}>Add manually</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: T.dim, cursor: "pointer", fontSize: 18 }}>×</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>{lbl("Handle *")}{inp("handle", "@username")}</div>
        <div>{lbl("Name")}{inp("name", "Full name")}</div>
        <div>{lbl("Platform")}{sel("platform", ["instagram", "x", "youtube", "linkedin"])}</div>
        <div>{lbl("Type")}{sel("interaction_type", ["follow", "like", "comment", "mention", "tag", "view"])}</div>
        <div>{lbl("Followers")}{inp("followers", "125000", "number")}</div>
        <div>{lbl("Zone")}{sel("zone", ["ELITE", "INFLUENTIAL", "SIGNAL", "IGNORE"])}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div>{lbl("Bio")}{inp("bio", "Short bio…")}</div>
        <div>{lbl("Date")}{inp("interacted_at", "", "date")}</div>
      </div>
      <button onClick={() => {
        if (!v.handle.trim()) return;
        onAdd({ ...v, handle: v.handle.trim().replace(/^@/, "").toLowerCase(), followers: parseInt(v.followers) || null });
        onClose();
      }} style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 9,
        padding: "9px 20px", fontFamily: sans, fontSize: F.sm, fontWeight: 700, cursor: "pointer" }}>
        Add interaction
      </button>
    </div>
  );
}

// ─── Staging: Person card (dark) ──────────────────────────────────────────────
function PersonCard({ group, selected, onClick, cardRef }) {
  const primaryItem = group.items[0];
  const zone = primaryItem?.zone || "SIGNAL";
  const zc   = DZC[zone] || DZC.SIGNAL;
  const initial = (group.name || group.key || "?")[0].toUpperCase();
  return (
    <div ref={cardRef} onClick={onClick}
      style={{ padding: "14px 16px", borderBottom: `1px solid ${DT.border}`,
        borderLeft: `3px solid ${selected ? zc.color : "transparent"}`,
        background: selected ? "#16181F" : "transparent",
        cursor: "pointer", transition: "background 0.1s" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
          background: zc.bg, border: `1px solid ${zc.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 800, color: zc.color, fontFamily: sans }}>
          {initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {group.name && group.name.toLowerCase() !== group.key && (
            <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 700, color: DT.text,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3 }}>
              {group.name}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
            <span style={{ fontFamily: sans, fontSize: F.xs, color: DT.sub }}>@{group.key}</span>
            <span style={{ background: zc.bg, color: zc.color, border: `1px solid ${zc.border}`,
              borderRadius: 3, padding: "1px 5px", fontSize: 9, fontWeight: 700, fontFamily: sans }}>
              {zone}
            </span>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 3 }}>
            {group.items.map(item => (
              <span key={item._id} style={{ fontFamily: sans, fontSize: F.xs, color: DT.dim,
                display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ color: PLAT_COLOR[item.platform] }}>{PLAT_ICON[item.platform]}</span>
                {item.followers ? fmt(item.followers) : "—"}
              </span>
            ))}
          </div>
        </div>
      </div>
      {group.bio && (
        <div style={{ fontFamily: sans, fontSize: F.xs, color: DT.dim, lineHeight: 1.4,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 6, paddingLeft: 46 }}>
          {group.bio}
        </div>
      )}
      <div style={{ paddingLeft: 46, display: "flex", flexDirection: "column", gap: 3 }}>
        {group.items.flatMap(item =>
          (item.interaction_type || "unknown").split(",").filter(Boolean).map((type, ti) => (
            <div key={`${item._id}-${ti}`}
              style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: sans, fontSize: F.xs, color: DT.dim }}>
              <span style={{ color: PLAT_COLOR[item.platform], fontSize: 10 }}>{PLAT_ICON[item.platform]}</span>
              <span style={{ fontSize: 11 }}>{IX_ICON[type] || "•"}</span>
              <span style={{ color: DT.sub }}>{type}</span>
              {item.content && (
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, color: DT.dim }}>
                  · {item.content}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Staging: Profile preview (dark) ─────────────────────────────────────────
function ProfilePreview({ group, idx, total, onUpdateZone, onRemoveGroup, onPrev, onNext }) {
  const primaryItem = group.items[0];
  const zone = primaryItem?.zone || "SIGNAL";
  const zc   = DZC[zone] || DZC.SIGNAL;
  const platforms = [...new Set(group.items.map(i => i.platform).filter(Boolean))];
  const [activePlat, setActivePlat] = useState(primaryItem?.platform || "instagram");
  const [imgState,   setImgState]   = useState("idle");
  const [screenshotSrc, setScreenshotSrc] = useState(null);
  const ssCache = useRef({});

  useEffect(() => {
    const newPlat = group.items[0]?.platform || "instagram";
    setActivePlat(newPlat);
    setImgState("idle"); setScreenshotSrc(null);
  }, [group.key]);

  useEffect(() => {
    const h = (group.items.find(i => i.platform === activePlat)?.handle || "").toLowerCase().replace(/^@/, "");
    if (!h) { setImgState("error"); return; }
    const cacheKey = `${activePlat}:${h}`;
    // Check for stored thumbnail first
    const stored = group.items.find(i => i.platform === activePlat)?._thumbUrl;
    if (stored) { setScreenshotSrc(stored); setImgState("loaded"); return; }
    if (ssCache.current[cacheKey]) { setScreenshotSrc(ssCache.current[cacheKey]); setImgState("loaded"); return; }
    setImgState("loading"); setScreenshotSrc(null);
    fetch(`/api/screenshot/profile?platform=${activePlat}&handle=${h}`)
      .then(r => r.json())
      .then(d => {
        if (d.url) { ssCache.current[cacheKey] = d.url; setScreenshotSrc(d.url); setImgState("loaded"); }
        else setImgState("error");
      })
      .catch(() => setImgState("error"));
  }, [group.key, activePlat]);

  const profileUrl = PLAT_URL[activePlat]?.(group.items.find(i => i.platform === activePlat)?.handle || group.key) || "#";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: DT.card }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderBottom: `1px solid ${DT.border}`, gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: zc.bg,
            border: `1px solid ${zc.border}`, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 12, fontWeight: 800, color: zc.color, fontFamily: sans, flexShrink: 0 }}>
            {(group.name || group.key || "?")[0].toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 700, color: DT.text,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {group.name || `@${group.key}`}
            </div>
            <div style={{ fontFamily: sans, fontSize: F.xs, color: DT.sub }}>
              {idx + 1} / {total}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
          <button onClick={onPrev} style={{ background: DT.well, border: `1px solid ${DT.border}`,
            borderRadius: 6, padding: "4px 10px", color: DT.sub, cursor: "pointer", fontSize: F.xs }}>↑</button>
          <button onClick={onNext} style={{ background: DT.well, border: `1px solid ${DT.border}`,
            borderRadius: 6, padding: "4px 10px", color: DT.sub, cursor: "pointer", fontSize: F.xs }}>↓</button>
        </div>
      </div>

      {/* Zone selector */}
      <div style={{ display: "flex", gap: 6, padding: "10px 16px", borderBottom: `1px solid ${DT.border}`, flexWrap: "wrap" }}>
        {Object.entries(DZC).map(([z, c]) => (
          <button key={z} onClick={() => onUpdateZone(z)}
            style={{ background: zone === z ? c.bg : "transparent",
              color: zone === z ? c.color : DT.dim,
              border: `1px solid ${zone === z ? c.border : DT.border}`,
              borderRadius: 6, padding: "3px 10px", fontFamily: sans, fontSize: F.xs,
              fontWeight: 700, cursor: "pointer", textTransform: "uppercase" }}>
            {z}
          </button>
        ))}
        <button onClick={onRemoveGroup}
          style={{ marginLeft: "auto", background: "none", border: `1px solid ${DT.border}`,
            borderRadius: 6, padding: "3px 10px", color: DT.dim, cursor: "pointer",
            fontFamily: sans, fontSize: F.xs, fontWeight: 600 }}>
          Remove
        </button>
      </div>

      {/* Platform tabs */}
      {platforms.length > 1 && (
        <div style={{ display: "flex", gap: 4, padding: "8px 16px", borderBottom: `1px solid ${DT.border}` }}>
          {platforms.map(p => (
            <button key={p} onClick={() => { setActivePlat(p); setImgState("idle"); setScreenshotSrc(null); }}
              style={{ background: activePlat === p ? PLAT_COLOR[p] + "22" : "transparent",
                color: activePlat === p ? PLAT_COLOR[p] : DT.dim,
                border: `1px solid ${activePlat === p ? PLAT_COLOR[p] + "44" : DT.border}`,
                borderRadius: 6, padding: "3px 10px", fontFamily: sans, fontSize: F.xs,
                fontWeight: 600, cursor: "pointer" }}>
              {PLAT_ICON[p]} {p}
            </button>
          ))}
        </div>
      )}

      {/* Screenshot window */}
      <div style={{ flex: 1, minHeight: 240, position: "relative", background: DT.well,
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, background: "#1E2028",
          borderBottom: `1px solid ${DT.border}`, padding: "6px 10px",
          display: "flex", alignItems: "center", gap: 6, zIndex: 2 }}>
          <div style={{ display: "flex", gap: 4 }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map(c => (
              <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
            ))}
          </div>
          <div style={{ flex: 1, background: "#13141A", borderRadius: 4, padding: "2px 8px",
            fontFamily: sans, fontSize: 9, color: DT.dim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {profileUrl}
          </div>
          <a href={profileUrl} target="_blank" rel="noreferrer"
            style={{ fontFamily: sans, fontSize: 9, color: DT.sub, textDecoration: "none" }}>
            Open ↗
          </a>
        </div>
        <div style={{ position: "absolute", inset: 0, top: 30, overflow: "hidden" }}>
          {screenshotSrc && (
            <img src={screenshotSrc} alt={`${group.key} on ${activePlat}`}
              onLoad={() => setImgState("loaded")} onError={() => setImgState("error")}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top",
                display: imgState === "loaded" ? "block" : "none" }} />
          )}
          {imgState === "loading" && (
            <div style={{ height: "100%", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 8, color: DT.dim, fontFamily: sans, fontSize: F.xs }}>
              <div style={{ width: 20, height: 20, border: `2px solid ${DT.border}`,
                borderTopColor: DT.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              Loading profile…
            </div>
          )}
          {(imgState === "error" || imgState === "idle") && (
            <div style={{ height: "100%", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 6, color: DT.dim, fontFamily: sans }}>
              <span style={{ fontSize: 24 }}>{PLAT_ICON[activePlat]}</span>
              <a href={profileUrl} target="_blank" rel="noreferrer"
                style={{ color: PLAT_COLOR[activePlat], fontSize: F.xs, fontWeight: 700, textDecoration: "none" }}>
                Open on {activePlat} ↗
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Interactions being imported */}
      <div style={{ background: DT.well, padding: "10px 14px", flexShrink: 0, borderTop: `1px solid ${DT.border}` }}>
        <div style={{ fontFamily: sans, fontSize: F.xs, color: DT.dim, fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
          Interactions
        </div>
        {group.items.flatMap(item =>
          (item.interaction_type || "unknown").split(",").filter(Boolean).map((type, ti) => (
            <div key={`${item._id}-${ti}`}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0",
                borderBottom: `1px solid ${DT.border}`, fontFamily: sans, fontSize: F.xs }}>
              <span style={{ color: PLAT_COLOR[item.platform] }}>{PLAT_ICON[item.platform]}</span>
              <span>{IX_ICON[type] || "•"}</span>
              <span style={{ color: DT.sub, textTransform: "capitalize", minWidth: 60 }}>{type}</span>
              {item.content && (
                <span style={{ color: DT.dim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                  "{item.content}"
                </span>
              )}
              {item.interacted_at && (
                <span style={{ color: DT.dim, flexShrink: 0 }}>{fmtDate(item.interacted_at)}</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function InteractionsPage() {
  // Saved interactions from DB
  const [saved,        setSaved]        = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);

  // Filters
  const [activePlatform, setActivePlatform] = useState("all");
  const [selectedWeek,   setSelectedWeek]   = useState(null);
  const [dateFrom,       setDateFrom]       = useState("2026-01-01");
  const [dateTo,         setDateTo]         = useState("2026-03-31");

  // Staging (pre-save)
  const [items,          setItems]          = useState([]);
  const [selectedIdx,    setSelectedIdx]    = useState(0);
  const [parsing,        setParsing]        = useState(false);
  const [enrichStatus,   setEnrichStatus]   = useState(null);
  const [saveStatus,     setSaveStatus]     = useState(null);
  const [saving,         setSaving]         = useState(false);
  const [showManual,     setShowManual]     = useState(false);
  const [showImport,     setShowImport]     = useState(false);
  const [filterZone,     setFilterZone]     = useState("ALL");
  const [knownProfiles,  setKnownProfiles]  = useState({});

  const loadSaved = useCallback(async () => {
    setLoadingSaved(true);
    try {
      const res = await fetch("/api/interactions/list");
      const d   = await res.json();
      setSaved(d.interactions || []);
    } catch {}
    setLoadingSaved(false);
  }, []);

  useEffect(() => { loadSaved(); }, [loadSaved]);
  useEffect(() => {
    fetch("/api/elite/profiles").then(r => r.json())
      .then(d => { if (d.profiles) setKnownProfiles(d.profiles); }).catch(() => {});
  }, []);

  // Filter saved by date range
  const dateFiltered = saved.filter(ix => {
    if (!ix.interacted_at) return true;
    const d = ix.interacted_at.slice(0, 10);
    if (dateFrom && d < dateFrom) return false;
    if (dateTo   && d > dateTo)   return false;
    return true;
  });

  // Staging zone filtering
  const ZONES = ["ALL", "ELITE", "INFLUENTIAL", "SIGNAL", "IGNORE"];
  const stagingCounts = Object.fromEntries(
    ZONES.map(z => [z, z === "ALL" ? items.length : items.filter(i => i.zone === z).length])
  );
  const filteredStaging = filterZone === "ALL" ? items : items.filter(i => i.zone === filterZone);

  const personGroups = (() => {
    const map = new Map();
    for (const item of filteredStaging) {
      const key = (item.handle || "").toLowerCase().replace(/^@/, "");
      if (!map.has(key)) map.set(key, { key, name: item.name, bio: item.bio, items: [] });
      const g = map.get(key);
      if (item.name && !g.name) g.name = item.name;
      if (item.bio  && !g.bio)  g.bio  = item.bio;
      g.items.push(item);
    }
    return Array.from(map.values());
  })();

  useEffect(() => {
    setSelectedIdx(i => Math.min(i, Math.max(0, personGroups.length - 1)));
  }, [items, filterZone]);

  const listRef = useRef(null);
  const rowRefs = useRef({});
  useEffect(() => {
    function onKey(e) {
      if (!personGroups.length) return;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx(i => { const n = Math.min(i + 1, personGroups.length - 1); rowRefs.current[n]?.scrollIntoView({ block: "nearest" }); return n; });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx(i => { const p = Math.max(i - 1, 0); rowRefs.current[p]?.scrollIntoView({ block: "nearest" }); return p; });
      } else if (e.key === "Backspace" || e.key === "Delete") {
        const group = personGroups[selectedIdx];
        if (group) setItems(prev => prev.filter(i => (i.handle || "").toLowerCase().replace(/^@/, "") !== group.key));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [personGroups, selectedIdx]);

  const autofill = item => {
    const h = (item.handle || "").toLowerCase().replace(/^@/, "");
    const p = (item.platform || "instagram").toLowerCase();
    const k = knownProfiles[`${p}:${h}`]
      || Object.values(knownProfiles).find(x => Object.values(x.handles || {}).map(v => v.toLowerCase()).includes(h));
    if (!k) return item;
    return { ...item, name: k.name || item.name, followers: k.followers ?? item.followers,
      bio: k.bio || item.bio, zone: k.zone || item.zone, on_watchlist: k.on_watchlist || false, _autofilled: true };
  };

  const toDataUrl = f => new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(f); });
  const compress  = (dataUrl, maxW = 1200, q = 0.82) => new Promise(res => {
    const img = new Image(); img.onload = () => {
      const s = Math.min(1, maxW / img.width);
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      res({ base64: c.toDataURL("image/jpeg", q).split(",")[1], mediaType: "image/jpeg" });
    }; img.src = dataUrl;
  });

  const handleImages = async files => {
    if (parsing) return;
    setParsing(true); setSaveStatus(null);
    const images = await Promise.all(Array.from(files).map(async f => {
      const preview = await toDataUrl(f);
      const { base64, mediaType } = await compress(preview);
      return { filename: f.name, base64, mediaType, preview };
    }));
    try {
      const res  = await fetch("/api/screenshots/parse", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: images.map(i => ({ base64: i.base64, mediaType: i.mediaType, filename: i.filename })) }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const results = data.results || [];
      const newItems = results.flatMap(r => {
        const platCounts = {};
        (r.interactions || []).forEach(i => { if (i.platform) platCounts[i.platform] = (platCounts[i.platform] || 0) + 1; });
        const detPlat = Object.entries(platCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "instagram";
        return (r.interactions || []).map((item, idx) => {
          const withPlat = { ...item, platform: item.platform || detPlat };
          return { ...autofill(withPlat), _id: `${r.filename}_${idx}_${Date.now()}`, _source: r.filename, zone: computeZone(withPlat) };
        });
      });
      setItems(prev => {
        const map = new Map(prev.map(i => [`${i.platform}:${i.handle}`, i]));
        for (const item of newItems) {
          const key = `${item.platform}:${item.handle}`;
          if (!map.has(key)) { map.set(key, item); continue; }
          const ex = map.get(key);
          const types = [...new Set([...(ex.interaction_type || "").split(","),
            ...(item.interaction_type || "").split(",")].filter(Boolean))].join(",");
          map.set(key, { ...ex, interaction_type: types, name: item.name || ex.name,
            followers: item.followers || ex.followers });
        }
        return Array.from(map.values());
      });
      setParsing(false);
      const toEnrich = newItems;
      if (toEnrich.length) await autoEnrich(toEnrich);
      for (const img of images) {
        const result = results.find(r => r.filename === img.filename);
        if (!result || result.error) continue;
        try {
          const { base64: thumb } = await compress(img.preview, 300, 0.72);
          const sr = await fetch("/api/screenshots/store", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename: img.filename, thumbnail: thumb, mediaType: "image/jpeg",
              platform: result.interactions?.[0]?.platform || "instagram",
              interactionCount: result.interactions?.length || 0 }),
          });
          const sd = await sr.json();
          if (sd.id) setItems(prev => prev.map(i =>
            i._source === img.filename && !i.screenshot_id ? { ...i, screenshot_id: sd.id, _thumbUrl: sd.thumbnailUrl } : i
          ));
        } catch {}
      }
    } catch (e) { setSaveStatus({ error: e.message }); }
    setParsing(false);
  };

  const handleCSV = async file => {
    if (!file) return; setSaveStatus(null);
    try {
      const text = await file.text();
      const lines = text.trim().split("\n");
      const header = lines[0];
      const dataLines = lines.slice(1).filter(l => l.trim());
      let totalImported = 0;
      for (let i = 0; i < dataLines.length; i += 500) {
        const chunk = [header, ...dataLines.slice(i, i + 500)].join("\n");
        const res = await fetch("/api/accounts/csv", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csv: chunk, category: "SIGNAL" }),
        });
        const d = await res.json();
        if (d.error) { setSaveStatus({ error: d.error }); return; }
        totalImported += d.imported || 0;
      }
      setSaveStatus({ ok: `✓ ${totalImported} handles imported from CSV` });
      loadSaved();
    } catch (e) { setSaveStatus({ error: e.message }); }
  };

  const autoEnrich = async targets => {
    if (!targets?.length) return;
    const WBATCH = 8, FBATCH = 3;
    const noBio = targets.filter(i => i.name && i.name !== i.handle && !i.bio?.trim());
    for (let i = 0; i < noBio.length; i += WBATCH) {
      setEnrichStatus(`Wikipedia bios ${i + 1}–${Math.min(i + WBATCH, noBio.length)} / ${noBio.length}`);
      try {
        const res = await fetch("/api/enrich/wikipedia", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accounts: noBio.slice(i, i + WBATCH).map(t => ({ handle: t.handle, name: t.name })) }),
        });
        const data = await res.json();
        if (data.results) setItems(prev => {
          const u = [...prev];
          data.results.forEach(r => {
            if (!r.found) return;
            const idx = u.findIndex(x => x.handle?.toLowerCase() === r.handle?.toLowerCase());
            if (idx >= 0 && !u[idx].bio?.trim()) { u[idx] = { ...u[idx], bio: r.bio, _wikiBio: true }; if (u[idx].zone !== "ELITE") u[idx].zone = computeZone(u[idx]); }
          }); return u;
        });
      } catch {}
    }
    const noFol = targets.filter(i => !(parseInt(i.followers) > 0));
    for (let i = 0; i < noFol.length; i += FBATCH) {
      setEnrichStatus(`Follower counts ${i + 1}–${Math.min(i + FBATCH, noFol.length)} / ${noFol.length}`);
      try {
        const res = await fetch("/api/enrich/followers", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accounts: noFol.slice(i, i + FBATCH).map(t => ({ handle: t.handle, name: t.name || t.handle, platform: t.platform || "instagram" })) }),
        });
        const data = await res.json();
        if (data.results) setItems(prev => {
          const u = [...prev];
          data.results.forEach(r => {
            if (!r.found || !r.followers) return;
            const idx = u.findIndex(x => x.handle?.toLowerCase() === r.handle?.toLowerCase());
            if (idx >= 0 && !(parseInt(u[idx].followers) > 0)) { u[idx] = { ...u[idx], followers: r.followers }; if (u[idx].zone !== "ELITE") u[idx].zone = computeZone(u[idx]); }
          }); return u;
        });
      } catch {}
    }
    setEnrichStatus(null);
  };

  const handleSave = async () => {
    const toSave = items.filter(i => i.handle);
    if (!toSave.length) return;
    setSaving(true); setSaveStatus(null);
    try {
      const res  = await fetch("/api/screenshots/save", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interactions: toSave }),
      });
      const data = await res.json();
      if (data.error) setSaveStatus({ error: data.error });
      else { setSaveStatus({ ok: data.message || `✓ ${data.saved} saved` }); setItems([]); await loadSaved(); }
    } catch (e) { setSaveStatus({ error: e.message }); }
    setSaving(false);
  };

  const handleDelete = async id => {
    try {
      await fetch("/api/interactions/delete", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      setSaved(prev => prev.filter(i => i.id !== id));
    } catch {}
  };

  const updateGroupZone = (handle, zone) =>
    setItems(prev => prev.map(i => (i.handle || "").toLowerCase().replace(/^@/, "") === handle ? { ...i, zone } : i));
  const removeGroup = (handle) =>
    setItems(prev => prev.filter(i => (i.handle || "").toLowerCase().replace(/^@/, "") !== handle));

  // Summary stats for header
  const elite = dateFiltered.filter(i => i.zone === "ELITE" || i.zone === "INFLUENTIAL").length;

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: sans }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}*{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:${T.border2};border-radius:3px}
        input::placeholder,textarea::placeholder{color:${T.dim}}`}
      </style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <a href="/" style={{ fontFamily: sans, fontSize: F.xs, color: T.dim, textDecoration: "none" }}>
              ← Dashboard
            </a>
            <h1 style={{ fontFamily: sans, fontSize: F.xl, fontWeight: 700, color: T.text, margin: "6px 0 4px", letterSpacing: "-0.02em" }}>
              Interactions
            </h1>
            <div style={{ fontFamily: sans, fontSize: F.sm, color: T.sub }}>
              {loadingSaved
                ? "Loading…"
                : `${dateFiltered.length.toLocaleString()} interactions · ${elite} influential`}
            </div>
          </div>

          {/* Date range + actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: T.card,
              border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 12px" }}>
              <span style={{ fontFamily: sans, fontSize: F.xs, color: T.sub, fontWeight: 500 }}>From</span>
              <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setSelectedWeek(null); }}
                style={{ background: "none", border: "none", fontFamily: sans, fontSize: F.xs,
                  color: T.text, outline: "none", cursor: "pointer" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: T.card,
              border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 12px" }}>
              <span style={{ fontFamily: sans, fontSize: F.xs, color: T.sub, fontWeight: 500 }}>To</span>
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setSelectedWeek(null); }}
                style={{ background: "none", border: "none", fontFamily: sans, fontSize: F.xs,
                  color: T.text, outline: "none", cursor: "pointer" }} />
            </div>
            <button onClick={loadSaved} disabled={loadingSaved}
              style={{ background: T.well, color: T.sub, border: `1px solid ${T.border}`,
                borderRadius: 8, padding: "7px 14px", fontSize: F.xs, fontWeight: 600,
                fontFamily: sans, cursor: "pointer" }}>
              {loadingSaved ? "Loading…" : "↻ Refresh"}
            </button>
            <button onClick={() => setShowImport(p => !p)}
              style={{ background: showImport ? T.accent : T.card, color: showImport ? "#fff" : T.sub,
                border: `1px solid ${showImport ? T.accent : T.border}`,
                borderRadius: 8, padding: "7px 14px", fontSize: F.xs, fontWeight: 600,
                fontFamily: sans, cursor: "pointer" }}>
              ↑ Import
            </button>
          </div>
        </div>

        {/* ── Import panel (collapsible) ──────────────────────────────────── */}
        {showImport && (
          <div style={{ marginBottom: 20 }}>
            <DropZone onImages={handleImages} onCSV={handleCSV} disabled={parsing} />
            <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <button onClick={() => setShowManual(p => !p)}
                style={{ background: T.well, color: T.sub, border: `1px solid ${T.border}`,
                  borderRadius: 8, padding: "6px 14px", fontFamily: sans, fontSize: F.sm,
                  fontWeight: 600, cursor: "pointer" }}>
                + Add manually
              </button>
            </div>
            {showManual && (
              <div style={{ marginTop: 10 }}>
                <ManualPanel onClose={() => setShowManual(false)}
                  onAdd={item => { setItems(prev => [...prev, { ...item, _id: `manual_${Date.now()}`, _source: "manual", zone: item.zone || computeZone(item) }]); setShowManual(false); }} />
              </div>
            )}
          </div>
        )}

        {/* Parsing state */}
        {parsing && (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
            padding: "36px 32px", textAlign: "center", marginBottom: 20, boxShadow: T.shadowSm }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>🔍</div>
            <div style={{ fontSize: F.md, fontWeight: 700, color: T.text, marginBottom: 4 }}>Parsing screenshots…</div>
            <div style={{ fontSize: F.sm, color: T.sub }}>Claude Vision is reading each image</div>
          </div>
        )}

        {/* Status messages */}
        {(enrichStatus || saveStatus) && (
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            {enrichStatus && (
              <div style={{ background: T.blueBg, border: `1px solid ${T.blue}44`, color: T.blue,
                borderRadius: 8, padding: "6px 14px", fontSize: F.sm, fontFamily: sans }}>
                ⟳ {enrichStatus}
              </div>
            )}
            {saveStatus?.ok && (
              <div style={{ background: T.greenBg, border: `1px solid ${T.greenBorder}`,
                color: T.green, borderRadius: 8, padding: "6px 14px", fontSize: F.sm, fontFamily: sans }}>
                {saveStatus.ok}
              </div>
            )}
            {saveStatus?.error && (
              <div style={{ background: T.redBg, border: `1px solid ${T.redBorder}`,
                color: T.red, borderRadius: 8, padding: "6px 14px", fontSize: F.sm, fontFamily: sans }}>
                ✗ {saveStatus.error}
              </div>
            )}
          </div>
        )}

        {/* ── Staging queue ─────────────────────────────────────────────────── */}
        {items.length > 0 && (
          <div style={{ marginBottom: 32, background: DT.bg, borderRadius: 16,
            border: `1px solid #2A2D38`, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px", borderBottom: `1px solid #2A2D38`, flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: sans, fontSize: F.md, fontWeight: 700, color: DT.text }}>
                  Review before saving
                </span>
                <span style={{ fontFamily: sans, fontSize: F.xs, color: DT.dim }}>
                  {items.length} item{items.length !== 1 ? "s" : ""} · ↑↓ to navigate · ⌫ to remove
                </span>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                {ZONES.filter(z => stagingCounts[z] > 0 || z === "ALL").map(z => {
                  const active = filterZone === z;
                  const dzc = DZC[z];
                  return (
                    <button key={z} onClick={() => { setFilterZone(z); setSelectedIdx(0); }}
                      style={{ background: active ? (dzc?.bg || DT.well) : DT.card,
                        color: active ? (dzc?.color || DT.text) : DT.dim,
                        border: `1px solid ${active ? (dzc?.border || DT.border) : DT.border}`,
                        borderRadius: 7, padding: "3px 10px", fontFamily: sans, fontSize: F.xs,
                        fontWeight: 700, cursor: "pointer", textTransform: "uppercase" }}>
                      {z} <span style={{ opacity: 0.6 }}>({stagingCounts[z]})</span>
                    </button>
                  );
                })}
                <button onClick={handleSave} disabled={saving || !items.length}
                  style={{ background: DT.accent, color: "#fff", border: "none", borderRadius: 9,
                    padding: "7px 18px", fontFamily: sans, fontSize: F.sm, fontWeight: 700,
                    cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Saving…" : `Save ${items.length}`}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", minHeight: 520 }}>
              {/* Person cards */}
              <div ref={listRef} style={{ width: 280, minWidth: 240, flexShrink: 0,
                overflowY: "auto", borderRight: `1px solid #2A2D38`, maxHeight: 520 }}>
                {personGroups.map((group, gi) => (
                  <PersonCard key={group.key} group={group} selected={gi === selectedIdx}
                    onClick={() => setSelectedIdx(gi)}
                    cardRef={el => rowRefs.current[gi] = el} />
                ))}
              </div>
              {/* Profile preview */}
              {personGroups[selectedIdx] ? (
                <div style={{ flex: 1, minWidth: 300 }}>
                  <ProfilePreview
                    group={personGroups[selectedIdx]}
                    idx={selectedIdx} total={personGroups.length}
                    onUpdateZone={z => updateGroupZone(personGroups[selectedIdx].key, z)}
                    onRemoveGroup={() => removeGroup(personGroups[selectedIdx].key)}
                    onPrev={() => { const p = Math.max(selectedIdx - 1, 0); setSelectedIdx(p); rowRefs.current[p]?.scrollIntoView({ block: "nearest" }); }}
                    onNext={() => { const n = Math.min(selectedIdx + 1, personGroups.length - 1); setSelectedIdx(n); rowRefs.current[n]?.scrollIntoView({ block: "nearest" }); }}
                  />
                </div>
              ) : (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                  color: DT.dim, fontFamily: sans, fontSize: F.sm }}>
                  No profiles to review
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Analytics: saved interactions ──────────────────────────────────── */}
        {loadingSaved ? (
          <div style={{ textAlign: "center", padding: "80px 0", fontFamily: sans, fontSize: F.sm, color: T.dim }}>
            Loading interactions…
          </div>
        ) : dateFiltered.length === 0 ? (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
            padding: "60px 40px", textAlign: "center", boxShadow: T.shadowSm }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
            <div style={{ fontFamily: sans, fontSize: F.md, fontWeight: 600, color: T.text, marginBottom: 6 }}>
              No interactions yet
            </div>
            <div style={{ fontFamily: sans, fontSize: F.sm, color: T.sub }}>
              Use the ↑ Import button above to add interactions via screenshots or CSV.
            </div>
          </div>
        ) : (
          <>
            {/* Platform stats */}
            <PlatformStats
              interactions={dateFiltered}
              activePlatform={activePlatform}
              onPlatform={p => { setActivePlatform(p); setSelectedWeek(null); }}
            />

            {/* Weekly overview */}
            <WeeklyOverview
              interactions={dateFiltered}
              activePlatform={activePlatform}
              selectedWeek={selectedWeek}
              onWeekSelect={setSelectedWeek}
            />

            {/* Influential interactions */}
            <InfluentialInteractions
              interactions={dateFiltered}
              activePlatform={activePlatform}
              selectedWeek={selectedWeek}
            />

            {/* Full interactions table */}
            <InteractionsTable
              interactions={dateFiltered}
              activePlatform={activePlatform}
              selectedWeek={selectedWeek}
              onDelete={handleDelete}
            />
          </>
        )}
      </div>
    </div>
  );
}
