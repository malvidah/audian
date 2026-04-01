"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ─── Design tokens (shared) ─────────────────────────────────────────────────
const T = {
  bg: "#F8F7F5", surface: "#FFFFFF", card: "#FFFFFF", well: "#F3F2F0",
  border: "#E8E6E1", border2: "#D6D3CC", text: "#1A1816", sub: "#6B6560",
  dim: "#A8A39C", accent: "#FF6B35", accentBg: "#FFF3EE", accentBorder: "#FFD4C2",
  green: "#16A34A", greenBg: "#F0FDF4", greenBorder: "#BBF7D0",
  yellow: "#CA8A04", yellowBg: "#FEFCE8", yellowBorder: "#FEF08A",
  red: "#DC2626", redBg: "#FEF2F2", redBorder: "#FECACA",
  blue: "#2563EB", blueBg: "#EFF6FF", blueBorder: "#BFDBFE",
  purple: "#7C3AED", purpleBg: "#F5F3FF", purpleBorder: "#DDD6FE",
  shadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
  shadowSm: "0 1px 2px rgba(0,0,0,0.05)",
};

const sans = "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif";
const F = { xl: 28, lg: 20, md: 15, sm: 13, xs: 11 };

const PLAT_ICON  = { instagram: "\uD83D\uDCF8", x: "\uD835\uDD4F", youtube: "\u25B6", linkedin: "in" };
const PLAT_COLOR = { instagram: "#E1306C", x: "#000", youtube: "#FF0000", linkedin: "#0A66C2" };
const PLAT_URL   = {
  instagram: h => `https://instagram.com/${h}`,
  x:         h => `https://x.com/${h}`,
  youtube:   h => `https://youtube.com/@${h}`,
  linkedin:  h => `https://linkedin.com/in/${h}`,
};

const ZONE_CFG = {
  ELITE:       { label: "ELITE",       color: T.accent, bg: T.accentBg, border: T.accentBorder },
  INFLUENTIAL: { label: "INFLUENTIAL", color: T.green,  bg: T.greenBg,  border: T.greenBorder },
  SIGNAL:      { label: "SIGNAL",      color: T.blue,   bg: T.blueBg,   border: T.blueBorder },
  IGNORE:      { label: "IGNORE",      color: T.dim,    bg: T.well,     border: T.border },
};

const LIST_ORDER = ["ELITE", "INFLUENTIAL", "SIGNAL", "IGNORE"];

function normalizeZone(zone) {
  return LIST_ORDER.includes(zone) ? zone : "UNASSIGNED";
}

function fmt(n) {
  if (!n && n !== 0) return "\u2014";
  n = parseInt(n);
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
}

function timeAgo(ts) {
  if (!ts) return null;
  const d = Math.floor((Date.now() - new Date(ts)) / 86400000);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 30) return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

function truncate(str, max) {
  if (!str) return "\u2014";
  return str.length > max ? str.slice(0, max) + "..." : str;
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function ZoneBadge({ zone, onClick }) {
  const cfg = ZONE_CFG[zone] || ZONE_CFG.SIGNAL;
  return (
    <span onClick={onClick} title={onClick ? "Click to change list" : undefined}
      style={{
        display: "inline-block", background: cfg.bg, color: cfg.color,
        border: `1px solid ${cfg.border}`, borderRadius: 6, padding: "2px 8px",
        fontSize: F.xs, fontWeight: 700, fontFamily: sans, letterSpacing: "0.04em",
        cursor: onClick ? "pointer" : "default", userSelect: "none",
        transition: "opacity 0.1s",
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.opacity = "0.7"; }}
      onMouseLeave={e => { if (onClick) e.currentTarget.style.opacity = "1"; }}>
      {cfg.label}
    </span>
  );
}

function StatCard({ label, value, color = T.text, active = false, onClick, clickable = false }) {
  return (
    <button
      onClick={onClick}
      disabled={!clickable}
      style={{
        flex: "1 1 180px",
        minWidth: 150,
        textAlign: "left",
        borderRadius: 14,
        padding: "18px 18px 16px",
        border: `1px solid ${active ? color + "44" : T.border}`,
        background: active ? color + "10" : T.card,
        boxShadow: active ? T.shadowMd : T.shadowSm,
        cursor: clickable ? "pointer" : "default",
        transition: "all 0.15s ease",
        fontFamily: sans,
      }}
    >
      <div style={{
        fontSize: 10,
        color: clickable ? color : T.dim,
        fontWeight: clickable ? 700 : 600,
        marginBottom: 6,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}>
        {label}
      </div>
      <div style={{ fontSize: F.xl, lineHeight: 1, fontWeight: 800, color }}>
        {value}
      </div>
    </button>
  );
}

function SummaryStats({ handles, selectedZones, onToggleZone }) {
  const counts = handles.reduce((acc, handle) => {
    const zone = normalizeZone(handle.zone);
    acc[zone] = (acc[zone] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
      <StatCard label="Total handles" value={handles.length} />
      <StatCard label="With bio" value={handles.filter(h => h.bio).length} />
      {["ELITE", "INFLUENTIAL", "SIGNAL"].map((zone) => (
        <StatCard
          key={zone}
          label={zone}
          value={counts[zone] || 0}
          color={ZONE_CFG[zone].color}
          active={selectedZones.has(zone)}
          clickable
          onClick={() => onToggleZone(zone)}
        />
      ))}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function HandlesTable({ platform, refreshKey }) {
  const [handles, setHandles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZones, setSelectedZones] = useState(new Set());
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDesc, setSortDesc] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/handles");
      const d = await res.json();
      setHandles(d.handles || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const saveField = async (id, updates) => {
    try {
      await fetch("/api/handles", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, updates }),
      });
      setHandles(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
    } catch (e) { alert("Save failed: " + e.message); }
  };

  function primaryHandle(h) {
    for (const p of ["instagram", "x", "youtube", "linkedin"]) {
      if (h[`handle_${p}`]) return { p, handle: h[`handle_${p}`], followers: h[`followers_${p}`] };
    }
    return null;
  }

  function totalFollowers(h) {
    let t = 0;
    for (const p of ["instagram", "x", "youtube", "linkedin"]) {
      t += parseInt(h[`followers_${p}`] || 0);
    }
    return t;
  }

  const baseFiltered = useMemo(() => {
    let list = handles;

    // Platform filter
    if (platform && platform !== "all") {
      list = list.filter(h => h[`handle_${platform}`]);
    }

    // Search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(h =>
        h.name?.toLowerCase().includes(q)
        || h.handle_x?.toLowerCase().includes(q)
        || h.handle_instagram?.toLowerCase().includes(q)
        || h.bio?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [handles, platform, search]);

  const filtered = useMemo(() => {
    if (!selectedZones.size) return baseFiltered;
    return baseFiltered.filter(h => selectedZones.has(normalizeZone(h.zone)));
  }, [baseFiltered, selectedZones]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av, bv;
      if (sortBy === "name") {
        av = (a.name || "").toLowerCase(); bv = (b.name || "").toLowerCase();
      } else if (sortBy === "followers") {
        av = totalFollowers(a); bv = totalFollowers(b);
      } else if (sortBy === "zone") {
        const order = { ELITE: 0, INFLUENTIAL: 1, SIGNAL: 2, IGNORE: 3 };
        av = order[a.zone] ?? 4; bv = order[b.zone] ?? 4;
      } else if (sortBy === "interactions") {
        av = a.interaction_count || 0; bv = b.interaction_count || 0;
      } else if (sortBy === "last_seen") {
        av = a.last_interaction || a.updated_at || ""; bv = b.last_interaction || b.updated_at || "";
      } else {
        av = a[sortBy] ?? ""; bv = b[sortBy] ?? "";
      }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDesc ? -cmp : cmp;
    });
  }, [filtered, sortBy, sortDesc]);

  function toggleSort(col) {
    if (sortBy === col) setSortDesc(d => !d);
    else { setSortBy(col); setSortDesc(true); }
  }

  function toggleZone(zone) {
    setSelectedZones(prev => {
      const next = new Set(prev);
      if (next.has(zone)) next.delete(zone);
      else next.add(zone);
      return next;
    });
  }

  const thStyle = (col) => ({
    fontFamily: sans, fontSize: F.xs, fontWeight: 600,
    color: sortBy === col ? T.accent : T.sub,
    padding: "10px 12px", textAlign: "left", cursor: "pointer",
    whiteSpace: "nowrap", borderBottom: `1px solid ${T.border}`, userSelect: "none",
  });

  const tdStyle = {
    padding: "10px 12px", fontFamily: sans, fontSize: F.sm, color: T.text,
    borderBottom: `1px solid ${T.border}`, verticalAlign: "middle",
  };

  const arrow = (col) => sortBy === col ? (sortDesc ? " \u2193" : " \u2191") : "";

  if (loading) {
    return (
      <div style={{ fontFamily: sans, fontSize: F.md, color: T.sub, textAlign: "center", padding: "60px 20px" }}>
        Loading handles...
      </div>
    );
  }

  return (
    <div>
      <SummaryStats handles={baseFiltered} selectedZones={selectedZones} onToggleZone={toggleZone} />

      {/* Filters row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ fontFamily: sans, fontSize: F.xs, color: T.sub, fontWeight: 600 }}>
          {selectedZones.size
            ? `Showing: ${[...selectedZones].join(", ")}`
            : "Showing: all labels"}
        </div>

        {selectedZones.size > 0 && (
          <button onClick={() => setSelectedZones(new Set())} style={{
            background: "transparent",
            color: T.dim,
            border: `1px solid ${T.border}`,
            borderRadius: 999,
            padding: "4px 10px",
            fontFamily: sans,
            fontSize: F.xs,
            fontWeight: 600,
            cursor: "pointer",
          }}>
            Clear filters
          </button>
        )}

        <input value={search} placeholder="Search..." onChange={e => setSearch(e.target.value)}
          style={{
            marginLeft: "auto", background: T.card, border: `1px solid ${T.border}`,
            color: T.text, borderRadius: 8, padding: "6px 12px", fontFamily: sans,
            fontSize: F.sm, outline: "none", width: 200,
          }} />
      </div>

      {/* Count */}
      <div style={{ fontFamily: sans, fontSize: F.sm, color: T.sub, marginBottom: 10 }}>
        {sorted.length} handle{sorted.length !== 1 ? "s" : ""}
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${T.border}` }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: T.card, minWidth: 780 }}>
          <thead>
            <tr style={{ background: T.well }}>
              <th style={thStyle("name")} onClick={() => toggleSort("name")}>
                Name{arrow("name")}
              </th>
              <th style={{ ...thStyle("platforms"), cursor: "default" }}>
                Platforms
              </th>
              <th style={{ ...thStyle("bio"), cursor: "default", width: "25%" }}>
                Bio
              </th>
              <th style={thStyle("followers")} onClick={() => toggleSort("followers")}>
                Followers{arrow("followers")}
              </th>
              <th style={thStyle("zone")} onClick={() => toggleSort("zone")}>
                Label{arrow("zone")}
              </th>
              <th style={thStyle("last_seen")} onClick={() => toggleSort("last_seen")}>
                Last seen{arrow("last_seen")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} style={{
                  ...tdStyle, textAlign: "center", color: T.dim, padding: "40px 12px",
                }}>
                  {search
                    ? `No handles matching "${search}"`
                    : selectedZones.size
                      ? "No handles match the selected label filters."
                      : "No handles yet. Import a CSV to get started."}
                </td>
              </tr>
            )}
            {sorted.map((h, i) => {
              const pri = primaryHandle(h);
              return (
                <tr key={h.id}
                  style={{ transition: "background 0.1s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.well + "88"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                  {/* Name */}
                  <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: F.sm, color: T.text, lineHeight: 1.3 }}>
                        {h.name || pri?.handle || "\u2014"}
                      </div>
                      {pri && (
                        <a href={PLAT_URL[pri.p]?.(pri.handle)} target="_blank" rel="noreferrer"
                          style={{ fontSize: F.xs, color: T.dim, textDecoration: "none",
                            display: "inline-flex", alignItems: "center", gap: 3 }}
                          onMouseEnter={e => e.currentTarget.style.color = T.accent}
                          onMouseLeave={e => e.currentTarget.style.color = T.dim}>
                          <span style={{ color: PLAT_COLOR[pri.p], fontSize: 10 }}>{PLAT_ICON[pri.p]}</span>
                          @{pri.handle}
                        </a>
                      )}
                    </div>
                  </td>
                  {/* Platforms */}
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {["instagram", "x", "youtube", "linkedin"].map(p => {
                        const hdl = h[`handle_${p}`];
                        if (!hdl) return null;
                        return (
                          <a key={p} href={PLAT_URL[p]?.(hdl)} target="_blank" rel="noreferrer"
                            title={`@${hdl}`}
                            style={{
                              display: "inline-flex", alignItems: "center", justifyContent: "center",
                              width: 26, height: 26, borderRadius: 6,
                              background: PLAT_COLOR[p] + "14",
                              color: PLAT_COLOR[p], fontSize: 11, fontWeight: 700,
                              textDecoration: "none", transition: "opacity 0.15s",
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
                            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                            {PLAT_ICON[p]}
                          </a>
                        );
                      })}
                      {!["instagram", "x", "youtube", "linkedin"].some(p => h[`handle_${p}`]) && (
                        <span style={{ fontSize: F.xs, color: T.dim }}>\u2014</span>
                      )}
                    </div>
                  </td>
                  {/* Bio */}
                  <td style={{ ...tdStyle, maxWidth: 0 }}>
                    <div style={{
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      fontSize: F.xs, color: h.bio ? T.sub : T.dim,
                      fontStyle: h.bio ? "normal" : "italic",
                    }}>
                      {h.bio ? truncate(h.bio, 80) : "\u2014"}
                    </div>
                  </td>
                  {/* Followers */}
                  <td style={{ ...tdStyle, fontWeight: 600, whiteSpace: "nowrap" }}>
                    {totalFollowers(h) > 0 ? fmt(totalFollowers(h)) : "\u2014"}
                  </td>
                  {/* Zone / Label */}
                  <td style={tdStyle}>
                    <ZoneBadge zone={h.zone} onClick={() => {
                      const next = LIST_ORDER[(LIST_ORDER.indexOf(h.zone) + 1) % LIST_ORDER.length];
                      saveField(h.id, { zone: next });
                    }} />
                  </td>
                  {/* Last seen */}
                  <td style={{ ...tdStyle, whiteSpace: "nowrap", color: T.dim, fontSize: F.xs }}>
                    {timeAgo(h.last_interaction) || timeAgo(h.updated_at) || "\u2014"}
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
