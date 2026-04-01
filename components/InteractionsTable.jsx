"use client";
import React, { useState, useMemo, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ─── Design tokens ───────────────────────────────────────────────────────────
const T = {
  bg: "#F8F7F5", surface: "#FFFFFF", card: "#FFFFFF", well: "#F3F2F0",
  border: "#E8E6E1", border2: "#D6D3CC", text: "#1A1816", sub: "#6B6560",
  dim: "#A8A39C", accent: "#FF6B35", accentBg: "#FFF3EE", accentBorder: "#FFD4C2",
  green: "#16A34A", greenBg: "#F0FDF4", greenBorder: "#BBF7D0",
  yellow: "#CA8A04", yellowBg: "#FEFCE8", yellowBorder: "#FEF08A",
  red: "#DC2626", redBg: "#FEF2F2", redBorder: "#FECACA",
  blue: "#2563EB", blueBg: "#EFF6FF", blueBorder: "#BFDBFE",
  shadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
  shadowSm: "0 1px 2px rgba(0,0,0,0.05)",
};

const PLAT_COLORS = { youtube: "#FF0000", x: "#000000", instagram: "#E1306C", linkedin: "#0077B5" };
const PLAT_LABEL = { youtube: "YouTube", x: "X", instagram: "Instagram", linkedin: "LinkedIn" };
const PLAT_ICON = { youtube: "▶", x: "𝕏", instagram: "◉", linkedin: "in" };
const PLAT_URL = {
  instagram: h => `https://instagram.com/${h}`,
  x: h => `https://x.com/${h}`,
  youtube: h => `https://youtube.com/@${h}`,
  linkedin: h => `https://linkedin.com/in/${h}`,
};

const sans = "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif";
const F = { xl: 28, lg: 20, md: 15, sm: 13, xs: 11 };

// ─── Zone config ─────────────────────────────────────────────────────────────
const ZONE_CFG = {
  ELITE:       { label: "ELITE",       color: T.accent, bg: T.accentBg, border: T.accentBorder },
  INFLUENTIAL: { label: "INFLUENTIAL", color: T.green,  bg: T.greenBg,  border: T.greenBorder  },
  SIGNAL:      { label: "SIGNAL",      color: T.blue,   bg: T.blueBg,   border: T.blueBorder   },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n) {
  if (!n && n !== 0) return "—";
  n = parseInt(n);
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
}

function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function truncate(str, max) {
  if (!str) return "—";
  return str.length > max ? str.slice(0, max) + "..." : str;
}

// ─── Sample data ─────────────────────────────────────────────────────────────
const SAMPLE_DATA = [
  { id: 1,  name: "Sarah Chen",        handle: "sarahchen_ai",     platform: "x",         type: "reposted",  content: "Great thread on building LLM-powered workflows in production — the latency tips alone saved us hours",                    followers: 320000, zone: "ELITE",       date: "2026-03-28T14:30:00Z" },
  { id: 2,  name: "Raj Patel",         handle: "rajpatel",         platform: "linkedin",  type: "commented",  content: "This is exactly the framework we needed. Sharing with our eng team.",                                                       followers: 185000, zone: "ELITE",       date: "2026-03-26T09:15:00Z" },
  { id: 3,  name: "Lex Friedman",      handle: "lexfridman",       platform: "x",         type: "liked",      content: "The future of AI agents is collaborative, not autonomous",                                                                  followers: 480000, zone: "ELITE",       date: "2026-03-24T18:45:00Z" },
  { id: 4,  name: "Nina Kowalski",     handle: "ninakowalski",     platform: "instagram", type: "commented",  content: "Love this breakdown! The visual explaining token windows was so clear",                                                      followers: 95000,  zone: "INFLUENTIAL", date: "2026-03-22T11:20:00Z" },
  { id: 5,  name: "Marcus Thompson",   handle: "marcusthompson",   platform: "linkedin",  type: "reposted",   content: "Underrated post on developer experience metrics that actually matter for retention",                                         followers: 67000,  zone: "INFLUENTIAL", date: "2026-03-20T16:00:00Z" },
  { id: 6,  name: "Aisha Johnson",     handle: "aishajohnson_dev", platform: "x",         type: "mentioned",  content: "@audian just published a killer guide on evaluating RAG pipelines — required reading for our team",                          followers: 42000,  zone: "INFLUENTIAL", date: "2026-03-18T08:30:00Z" },
  { id: 7,  name: "Daniel Park",       handle: "danielpark",       platform: "instagram", type: "liked",      content: "Behind the scenes of building our analytics dashboard",                                                                      followers: 28000,  zone: "INFLUENTIAL", date: "2026-03-15T20:10:00Z" },
  { id: 8,  name: "Priya Sharma",      handle: "priyasharma_tech", platform: "x",         type: "commented",  content: "Been saying this for months — context windows are the new bottleneck, not model size",                                       followers: 38000,  zone: "INFLUENTIAL", date: "2026-03-14T13:45:00Z" },
  { id: 9,  name: "James Liu",         handle: "jamesliu",         platform: "linkedin",  type: "liked",      content: "Quarterly OKR retrospective: what worked and what we are changing for H2",                                                   followers: 51000,  zone: "INFLUENTIAL", date: "2026-03-12T10:00:00Z" },
  { id: 10, name: "Olivia Martinez",   handle: "oliviamartinez",   platform: "instagram", type: "followed",   content: null,                                                                                                                          followers: 15000,  zone: "INFLUENTIAL", date: "2026-03-10T22:30:00Z" },
  { id: 11, name: "Tom Wheeler",       handle: "tomwheeler_eng",   platform: "x",         type: "reposted",   content: "Stop building features nobody asked for — how we cut our roadmap in half and doubled velocity",                              followers: 8200,   zone: "SIGNAL",      date: "2026-03-08T17:20:00Z" },
  { id: 12, name: "Emma Davis",        handle: "emmadavis",        platform: "linkedin",  type: "commented",  content: "Solid perspective. The bit about async standups resonated with our remote team.",                                              followers: 4500,   zone: "SIGNAL",      date: "2026-03-06T14:10:00Z" },
  { id: 13, name: "Kevin Nakamura",    handle: "kevinnakamura",    platform: "x",         type: "liked",      content: "Embedding models are quietly becoming the most important part of the AI stack",                                               followers: 3200,   zone: "SIGNAL",      date: "2026-03-04T09:50:00Z" },
  { id: 14, name: "Layla Ahmed",       handle: "laylaahmed",       platform: "instagram", type: "commented",  content: "This carousel was so helpful for understanding vector databases visually!",                                                    followers: 2800,   zone: "SIGNAL",      date: "2026-03-02T19:40:00Z" },
  { id: 15, name: "Chris Walker",      handle: "chriswalker_pm",   platform: "linkedin",  type: "liked",      content: "Product-led growth lessons from scaling a developer tool from zero to 10K users",                                              followers: 1500,   zone: "SIGNAL",      date: "2026-02-28T12:00:00Z" },
  { id: 16, name: "Mia Zhang",         handle: "miazhang",         platform: "x",         type: "mentioned",  content: "@audian's take on agent orchestration is the clearest I've seen — thread worth bookmarking",                                  followers: 5100,   zone: "SIGNAL",      date: "2026-02-25T15:30:00Z" },
  { id: 17, name: "Alex Rivera",       handle: "alexrivera_ux",    platform: "instagram", type: "liked",      content: "Our new onboarding flow — 40% improvement in activation rate",                                                                followers: 3400,   zone: "SIGNAL",      date: "2026-02-20T08:15:00Z" },
  { id: 18, name: "Sophie Turner",     handle: "sophieturner_dev", platform: "x",         type: "reposted",   content: "Why every startup should invest in observability before they think they need it",                                              followers: 2100,   zone: "SIGNAL",      date: "2026-02-15T21:00:00Z" },
  { id: 19, name: "David Kim",         handle: "davidkim",         platform: "linkedin",  type: "commented",  content: "Great write-up. We implemented something similar and saw a 3x improvement in pipeline throughput.",                             followers: 72000,  zone: "INFLUENTIAL", date: "2026-02-10T11:45:00Z" },
  { id: 20, name: "Isabella Rossi",    handle: "isabellarossi",    platform: "instagram", type: "followed",   content: null,                                                                                                                          followers: 145000, zone: "ELITE",       date: "2026-01-28T16:20:00Z" },
  { id: 21, name: "Ryan O'Brien",      handle: "ryanobrien_cto",   platform: "x",         type: "commented",  content: "This is the nuanced take on microservices vs monoliths that the industry needed — saved and sharing",                          followers: 210000, zone: "ELITE",       date: "2026-01-20T10:30:00Z" },
  { id: 22, name: "Hannah Lee",        handle: "hannahlee",        platform: "linkedin",  type: "reposted",   content: "Hiring for culture add, not culture fit — lessons from building a 50-person eng org",                                          followers: 33000,  zone: "INFLUENTIAL", date: "2026-01-15T14:00:00Z" },
];

// ─── Small components ────────────────────────────────────────────────────────
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

function PlatPill({ platform }) {
  const color = PLAT_COLORS[platform] || T.dim;
  return (
    <span style={{
      display: "inline-block", background: color + "14", color,
      border: `1px solid ${color}33`, borderRadius: 12, padding: "2px 10px",
      fontSize: F.xs, fontWeight: 600, fontFamily: sans, whiteSpace: "nowrap",
    }}>
      {PLAT_LABEL[platform] || platform}
    </span>
  );
}

function ZoneBadge({ zone }) {
  const cfg = ZONE_CFG[zone] || ZONE_CFG.SIGNAL;
  return (
    <span style={{
      display: "inline-block", background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`, borderRadius: 6, padding: "2px 8px",
      fontSize: F.xs, fontWeight: 700, fontFamily: sans, letterSpacing: "0.04em",
    }}>
      {cfg.label}
    </span>
  );
}

function TypeBadge({ type }) {
  const icons = {
    liked: "♥", commented: "💬", reposted: "↻", followed: "👤", mentioned: "@",
  };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: T.well, color: T.sub, border: `1px solid ${T.border}`,
      borderRadius: 6, padding: "2px 8px", fontSize: F.xs, fontWeight: 500,
      fontFamily: sans, whiteSpace: "nowrap",
    }}>
      <span style={{ fontSize: 10 }}>{icons[type] || "·"}</span>
      {type}
    </span>
  );
}

// ─── Summary stats ───────────────────────────────────────────────────────────
function SummaryStats({ data }) {
  const total = data.length;
  const uniquePeople = new Set(data.map(d => d.handle)).size;
  const avgFollowers = total > 0
    ? Math.round(data.reduce((s, d) => s + (d.followers || 0), 0) / total)
    : 0;
  const eliteCount = data.filter(d => d.zone === "ELITE").length;
  const influentialCount = data.filter(d => d.zone === "INFLUENTIAL").length;
  const signalCount = data.filter(d => d.zone === "SIGNAL").length;

  const stats = [
    { label: "Total interactions", value: total, color: T.text },
    { label: "Unique people", value: uniquePeople, color: T.text },
    { label: "Avg followers", value: fmt(avgFollowers), color: T.text },
  ];

  const zones = [
    { label: "ELITE", value: eliteCount, ...ZONE_CFG.ELITE },
    { label: "INFLUENTIAL", value: influentialCount, ...ZONE_CFG.INFLUENTIAL },
    { label: "SIGNAL", value: signalCount, ...ZONE_CFG.SIGNAL },
  ];

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
      {stats.map(s => (
        <div key={s.label} style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
          padding: "12px 18px", flex: "1 1 120px", boxShadow: T.shadowSm,
        }}>
          <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim, marginBottom: 4 }}>{s.label}</div>
          <div style={{ fontFamily: sans, fontSize: F.lg, fontWeight: 700, color: s.color }}>{s.value}</div>
        </div>
      ))}
      {zones.map(z => (
        <div key={z.label} style={{
          background: z.bg, border: `1px solid ${z.border}`, borderRadius: 10,
          padding: "12px 18px", flex: "1 1 100px",
        }}>
          <div style={{ fontFamily: sans, fontSize: F.xs, color: z.color, fontWeight: 600, marginBottom: 4 }}>{z.label}</div>
          <div style={{ fontFamily: sans, fontSize: F.lg, fontWeight: 700, color: z.color }}>{z.value}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function InteractionsTable({ platform, weekFilter }) {
  const [sortBy, setSortBy] = useState("date");
  const [sortDesc, setSortDesc] = useState(true);
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchInteractions() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("interactions")
          .select("*, handles(*)");

        if (error) {
          console.error("Failed to fetch interactions:", error);
          if (!cancelled) { setLiveData(null); setLoading(false); }
          return;
        }

        if (!data || data.length === 0) {
          if (!cancelled) { setLiveData(null); setLoading(false); }
          return;
        }

        const mapped = data.map((row, i) => {
          const h = row.handles || {};
          const plat = row.platform || "x";
          const handle = plat === "instagram"
            ? (h.handle_instagram || h.handle_x || "unknown")
            : plat === "x"
            ? (h.handle_x || h.handle_instagram || "unknown")
            : (h.handle_instagram || h.handle_x || "unknown");
          const followers = plat === "instagram"
            ? (h.followers_instagram || 0)
            : plat === "x"
            ? (h.followers_x || 0)
            : (h.followers_instagram || h.followers_x || 0);

          return {
            id: row.id || i + 1,
            name: h.name || "Unknown",
            handle: handle,
            platform: plat,
            type: row.interaction_type || "liked",
            content: row.content || null,
            followers: followers,
            zone: h.zone || "SIGNAL",
            date: row.interacted_at || null,
          };
        });

        if (!cancelled) { setLiveData(mapped); setLoading(false); }
      } catch (err) {
        console.error("Failed to fetch interactions:", err);
        if (!cancelled) { setLiveData(null); setLoading(false); }
      }
    }
    fetchInteractions();
    return () => { cancelled = true; };
  }, []);

  const allData = liveData || SAMPLE_DATA;

  const filtered = useMemo(() => {
    let data = allData;

    // Filter by platform
    if (platform && platform !== "all") {
      data = data.filter(d => d.platform === platform);
    }

    // Filter by week (expects ISO date string of week start, e.g. "2026-03-23")
    if (weekFilter) {
      const weekStart = new Date(weekFilter + "T00:00:00Z");
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      data = data.filter(d => {
        const dd = new Date(d.date);
        return dd >= weekStart && dd < weekEnd;
      });
    }

    return data;
  }, [platform, weekFilter, allData]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av, bv;
      if (sortBy === "date") {
        av = a.date || ""; bv = b.date || "";
      } else if (sortBy === "followers") {
        av = a.followers || 0; bv = b.followers || 0;
      } else if (sortBy === "name") {
        av = (a.name || "").toLowerCase(); bv = (b.name || "").toLowerCase();
      } else if (sortBy === "zone") {
        const order = { ELITE: 0, INFLUENTIAL: 1, SIGNAL: 2 };
        av = order[a.zone] ?? 3; bv = order[b.zone] ?? 3;
      } else if (sortBy === "platform") {
        av = a.platform || ""; bv = b.platform || "";
      } else if (sortBy === "type") {
        av = a.type || ""; bv = b.type || "";
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

  const thStyle = (col) => ({
    fontFamily: sans, fontSize: F.xs, fontWeight: 600,
    color: sortBy === col ? T.accent : T.sub,
    padding: "10px 12px", textAlign: "left", cursor: "pointer",
    whiteSpace: "nowrap", borderBottom: `1px solid ${T.border}`, userSelect: "none",
  });

  const tdStyle = {
    padding: "11px 12px", fontFamily: sans, fontSize: F.sm, color: T.text,
    borderBottom: `1px solid ${T.border}`, verticalAlign: "middle",
  };

  const arrow = (col) => sortBy === col ? (sortDesc ? " ↓" : " ↑") : "";

  if (loading) {
    return (
      <div style={{
        fontFamily: sans, fontSize: F.md, color: T.sub,
        textAlign: "center", padding: "60px 20px",
      }}>
        Loading interactions...
      </div>
    );
  }

  return (
    <div>
      {/* Summary stats */}
      <SummaryStats data={filtered} />

      {/* Table count */}
      <div style={{ fontFamily: sans, fontSize: F.sm, color: T.sub, marginBottom: 10 }}>
        {sorted.length} interaction{sorted.length !== 1 ? "s" : ""}
        {platform && <span> on {PLAT_LABEL[platform] || platform}</span>}
      </div>

      {/* Table wrapper with horizontal scroll */}
      <div style={{
        overflowX: "auto", borderRadius: 12,
        border: `1px solid ${T.border}`, boxShadow: T.shadowSm,
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: T.card, minWidth: 820 }}>
          <thead>
            <tr style={{ background: T.well }}>
              <th style={thStyle("name")} onClick={() => toggleSort("name")}>
                Person{arrow("name")}
              </th>
              <th style={thStyle("platform")} onClick={() => toggleSort("platform")}>
                Platform{arrow("platform")}
              </th>
              <th style={thStyle("type")} onClick={() => toggleSort("type")}>
                Type{arrow("type")}
              </th>
              <th style={{ ...thStyle("content"), cursor: "default", width: "28%" }}>
                Content
              </th>
              <th style={thStyle("followers")} onClick={() => toggleSort("followers")}>
                Followers{arrow("followers")}
              </th>
              <th style={thStyle("zone")} onClick={() => toggleSort("zone")}>
                Zone{arrow("zone")}
              </th>
              <th style={thStyle("date")} onClick={() => toggleSort("date")}>
                Date{arrow("date")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} style={{
                  ...tdStyle, textAlign: "center", color: T.dim, padding: "40px 12px",
                }}>
                  No interactions found{platform ? ` on ${PLAT_LABEL[platform] || platform}` : ""}{weekFilter ? " for the selected week" : ""}. Try adjusting your filters or check back later.
                </td>
              </tr>
            )}
            {sorted.map((row, i) => (
              <tr key={row.id} style={{ background: i % 2 === 0 ? T.card : T.well + "88" }}>
                {/* Person */}
                <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: F.sm, color: T.text, lineHeight: 1.3 }}>
                      {row.name}
                    </div>
                    <div style={{ fontSize: F.xs, color: T.dim }}>
                      @{row.handle}
                    </div>
                  </div>
                </td>
                {/* Platform */}
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  <a href={PLAT_URL[row.platform]?.(row.handle) || "#"}
                    target="_blank" rel="noreferrer"
                    title={`View @${row.handle} on ${PLAT_LABEL[row.platform] || row.platform}`}
                    style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 30, height: 30, borderRadius: 8,
                      background: (PLAT_COLORS[row.platform] || T.dim) + "14",
                      color: PLAT_COLORS[row.platform] || T.dim,
                      fontSize: 14, fontWeight: 700, textDecoration: "none",
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                    {PLAT_ICON[row.platform] || "·"}
                  </a>
                </td>
                {/* Type */}
                <td style={tdStyle}>
                  <TypeBadge type={row.type} />
                </td>
                {/* Content */}
                <td style={{ ...tdStyle, maxWidth: 0 }}>
                  <div style={{
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    fontSize: F.xs, color: row.content ? T.sub : T.dim,
                    fontStyle: row.content ? "normal" : "italic",
                  }}>
                    {row.content ? truncate(row.content, 100) : "—"}
                  </div>
                </td>
                {/* Followers */}
                <td style={{ ...tdStyle, fontWeight: 600, whiteSpace: "nowrap" }}>
                  {fmt(row.followers)}
                </td>
                {/* Zone */}
                <td style={tdStyle}>
                  <ZoneBadge zone={row.zone} />
                </td>
                {/* Date */}
                <td style={{ ...tdStyle, whiteSpace: "nowrap", color: T.sub, fontSize: F.xs }}>
                  {fmtDate(row.date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
