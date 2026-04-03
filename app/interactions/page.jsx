"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import dynamic from "next/dynamic";
import PageShell, { T, sans, F } from "../../components/PageShell";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const InteractionsTable = dynamic(() => import("../../components/InteractionsTable"), {
  ssr: false,
  loading: () => null
});

const CreatePanelDynamic = dynamic(() => import("../../components/InteractionsTable").then(m => ({ default: m.CreatePanel })), {
  ssr: false,
});

// ─── Helpers (shared with EliteMentions) ─────────────────────────────────────
const PLAT_COLORS = { youtube: "#FF0000", x: "#000000", instagram: "#E1306C", linkedin: "#0077B5" };

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

function IgIcon({ size = 16, color = "#E1306C" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4.5"/>
      <circle cx="17.5" cy="6.5" r="1" fill={color} stroke="none"/>
    </svg>
  );
}

// ─── Platform URL builders ───────────────────────────────────────────────────
const PLAT_URL = {
  instagram: h => `https://instagram.com/${h}`,
  x: h => `https://x.com/${h}`,
  youtube: h => `https://youtube.com/@${h}`,
  linkedin: h => `https://linkedin.com/in/${h}`,
};

const PLAT_ICON = { youtube: "\u25B6", x: "\uD835\uDD4F", instagram: "\u25C9", linkedin: "in" };

const ZONE_BADGE_CFG = {
  ELITE:       { label: "ELITE",       color: T.accent, bg: "#FFF3EE", border: "#FFD4C2" },
  INFLUENTIAL: { label: "INFLUENTIAL", color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
  SIGNAL:      { label: "SIGNAL",      color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
};

const TYPE_BADGE_CFG = {
  like:    { label: "Like",    icon: "\u2665", bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  follow:  { label: "Follow",  bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
  comment: { label: "Comment", bg: "#FEFCE8", color: "#CA8A04", border: "#FEF08A" },
  repost:  { label: "Repost",  bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
  mention: { label: "Mention", bg: "#FFF3EE", color: "#FF6B35", border: "#FFD4C2" },
  tag:     { label: "Tag",     bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
};

const ZONE_PRIORITY = { ELITE: 0, INFLUENTIAL: 1, SIGNAL: 2 };

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #FF6B35, #FF9F1C)",
  "linear-gradient(135deg, #E1306C, #F77737)",
  "linear-gradient(135deg, #2563EB, #7C3AED)",
  "linear-gradient(135deg, #16A34A, #22D3EE)",
  "linear-gradient(135deg, #7C3AED, #EC4899)",
  "linear-gradient(135deg, #0077B5, #00B4D8)",
];

function normalizeInteractionType(type) {
  const raw = (type || "").toLowerCase();
  if (raw === "liked") return "like";
  if (raw === "followed") return "follow";
  if (raw === "commented") return "comment";
  if (raw === "reposted") return "repost";
  if (raw === "mentioned") return "mention";
  return raw || "unknown";
}

// ─── Notable Interactions ────────────────────────────────────────────────────
function NotableInteractions({ activePlatform, dateFrom, dateTo }) {
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchElite() {
      setLoading(true);
      try {
        let query = supabase
          .from("interactions")
          .select("*, handles(*)");

        if (dateFrom) query = query.gte("interacted_at", dateFrom);
        if (dateTo) query = query.lte("interacted_at", dateTo + "T23:59:59Z");

        const { data, error } = await query.order("interacted_at", { ascending: false });
        if (error) throw error;

        const mapped = (data || []).map((row) => {
          const h = row.handles || {};
          const plat = row.platform || "x";
          const handle = plat === "instagram"
            ? (h.handle_instagram || h.handle_x || h.handle_youtube || h.handle_linkedin || "unknown")
            : plat === "x"
              ? (h.handle_x || h.handle_instagram || h.handle_youtube || h.handle_linkedin || "unknown")
              : plat === "youtube"
                ? (h.handle_youtube || h.handle_x || h.handle_instagram || h.handle_linkedin || "unknown")
                : (h.handle_linkedin || h.handle_x || h.handle_instagram || h.handle_youtube || "unknown");
          const followers = plat === "instagram"
            ? (h.followers_instagram || 0)
            : plat === "x"
              ? (h.followers_x || 0)
              : plat === "youtube"
                ? (h.followers_youtube || 0)
                : (h.followers_linkedin || 0);

          return {
            id: row.id,
            name: h.name || "Unknown",
            handle,
            bio: h.bio || null,
            platform: plat,
            type: normalizeInteractionType(row.interaction_type),
            content: row.content || null,
            mention_url: row.mention_url || null,
            post_url: row.post_url || null,
            followers,
            zone: h.zone || "SIGNAL",
            date: row.interacted_at || null,
          };
        });

        // Filter by platform
        let filtered = mapped;
        if (activePlatform && activePlatform !== "all") {
          filtered = filtered.filter(m => m.platform === activePlatform);
        }

        // Score interactions for ranking — prefer meaningful types and content
        const TYPE_SCORE = { follow: 5, repost: 4, mention: 3, comment: 2, reply: 2, tag: 1, like: 0 };
        function interactionScore(m) {
          let s = TYPE_SCORE[m.type] ?? 1;
          if (m.content && m.content.length > 30) s += 3;
          else if (m.content && m.content.length > 0) s += 1;
          s += (ZONE_PRIORITY[m.zone] != null ? (3 - ZONE_PRIORITY[m.zone]) : 0);
          s += Math.min((m.followers || 0) / 100000, 5);
          return s;
        }

        // Sort by score descending
        filtered.sort((a, b) => interactionScore(b) - interactionScore(a));

        // Deduplicate: 1 interaction per person (best one first)
        // Match by name (case-insensitive) — covers cross-platform dupes
        const seenNames = new Set();
        const deduped = [];
        for (const m of filtered) {
          const nameKey = (m.name || "").trim().toLowerCase();
          if (nameKey && seenNames.has(nameKey)) continue;
          if (nameKey) seenNames.add(nameKey);
          deduped.push(m);
        }

        // Only keep ELITE interactions, sorted most recent first
        const notable = deduped.filter(m => m.zone === "ELITE");
        notable.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

        if (!cancelled) setMentions(notable);
      } catch (err) {
        console.error("Failed to fetch elite mentions:", err);
        if (!cancelled) setMentions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchElite();
    return () => { cancelled = true; };
  }, [activePlatform, dateFrom, dateTo]);

  if (loading) return null;
  if (mentions.length === 0) {
    return (
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text, marginBottom: 12 }}>
          Notable Interactions
        </div>
        <div style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
          padding: "32px 24px", textAlign: "center", boxShadow: T.shadowSm,
        }}>
          <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>
            No notable interactions in this period
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text }}>
          Notable Interactions
        </div>
        <span style={{
          fontFamily: sans, fontSize: F.xs, fontWeight: 600, color: T.dim,
          background: T.well, borderRadius: 10, padding: "2px 8px",
          border: `1px solid ${T.border}`,
        }}>
          {mentions.length}
        </span>
      </div>

      {/* Card grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
        gap: 14,
      }}>
        {mentions.map((m) => {
          const isHovered = hoveredId === m.id;
          const zoneCfg = ZONE_BADGE_CFG[m.zone] || ZONE_BADGE_CFG.SIGNAL;
          const typeCfg = TYPE_BADGE_CFG[m.type] || { label: m.type || "Unknown", bg: T.well, color: T.sub, border: T.border };
          const avatarLetter = (m.name && m.name !== "Unknown") ? m.name.charAt(0).toUpperCase() : null;
          const gradientIdx = Math.abs((m.name || "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % AVATAR_GRADIENTS.length;
          const hasContent = m.content;

          return (
            <div
              key={m.id}
              onMouseEnter={() => setHoveredId(m.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                background: T.card,
                border: `1px solid ${isHovered ? T.border2 : T.border}`,
                borderRadius: 12,
                padding: "16px 18px",
                boxShadow: isHovered ? T.shadowMd : T.shadowSm,
                transition: "all 0.15s ease",
                transform: isHovered ? "translateY(-1px)" : "none",
              }}
            >
              {/* Top row: avatar + name + platform */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                {/* Avatar */}
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: avatarLetter ? AVATAR_GRADIENTS[gradientIdx] : (PLAT_COLORS[m.platform] || T.dim) + "22",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: avatarLetter ? "#fff" : (PLAT_COLORS[m.platform] || T.dim),
                  fontFamily: sans, fontSize: 15, fontWeight: 700,
                }}>
                  {avatarLetter || (m.platform === "instagram"
                    ? <IgIcon size={16} color={PLAT_COLORS.instagram} />
                    : (PLAT_ICON[m.platform] || "\u00B7"))}
                </div>

                {/* Name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {m.name}
                  </div>
                </div>

                {/* Platform link */}
                <a
                  href={PLAT_URL[m.platform]?.(m.handle) || "#"}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: (PLAT_COLORS[m.platform] || T.dim) + "14",
                    color: PLAT_COLORS[m.platform] || T.dim,
                    fontSize: 13, fontWeight: 700, textDecoration: "none",
                  }}
                >
                  {m.platform === "instagram"
                    ? <IgIcon size={14} color={PLAT_COLORS.instagram} />
                    : (PLAT_ICON[m.platform] || "\u00B7")}
                </a>
              </div>

              {/* Badges row: followers + zone + type */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {/* Follower count */}
                {m.followers > 0 && (
                  <span style={{
                    fontFamily: sans, fontSize: F.xs, color: T.sub, fontWeight: 600,
                    background: T.well, borderRadius: 4, padding: "2px 7px",
                    border: `1px solid ${T.border}`,
                  }}>
                    {fmt(m.followers)} followers
                  </span>
                )}

                {/* Zone badge */}
                <span style={{
                  display: "inline-block", background: zoneCfg.bg, color: zoneCfg.color,
                  border: `1px solid ${zoneCfg.border}`, borderRadius: 6, padding: "2px 8px",
                  fontSize: F.xs, fontWeight: 700, fontFamily: sans, letterSpacing: "0.04em",
                }}>
                  {zoneCfg.label}
                </span>

                {/* Type badge */}
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 3,
                  background: typeCfg.bg, color: typeCfg.color,
                  border: `1px solid ${typeCfg.border}`, borderRadius: 12,
                  padding: "2px 9px", fontSize: F.xs, fontWeight: 600, fontFamily: sans,
                }}>
                  {typeCfg.icon && <span style={{ fontSize: 9 }}>{typeCfg.icon}</span>}
                  {typeCfg.label}
                </span>

                {/* Date */}
                <span style={{
                  fontFamily: sans, fontSize: F.xs, color: T.dim, marginLeft: "auto",
                }}>
                  {fmtDate(m.date)}
                </span>
              </div>

              {/* Bio */}
              {m.bio && (
                <div style={{
                  fontFamily: sans, fontSize: F.xs, color: T.sub, lineHeight: 1.45,
                  marginBottom: hasContent ? 8 : 0,
                }}>
                  {m.bio.length > 120 ? m.bio.slice(0, 120) + "\u2026" : m.bio}
                </div>
              )}

              {/* Comment / mention content */}
              {hasContent && (
                <div style={{
                  marginTop: m.bio ? 0 : 0,
                  background: T.well,
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  padding: "10px 12px",
                  borderLeft: `3px solid ${PLAT_COLORS[m.platform] || T.accent}`,
                }}>
                  {(() => {
                    const href = m.mention_url || m.post_url;
                    const contentStyle = {
                      fontFamily: sans, fontSize: F.xs, color: T.text, lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                    };
                    return href ? (
                      <a href={href} target="_blank" rel="noreferrer" style={{ ...contentStyle, textDecoration: "none", display: "block" }}>
                        {m.content}
                      </a>
                    ) : (
                      <div style={contentStyle}>{m.content}</div>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function InteractionsPage() {
  const [creating, setCreating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-merge duplicate handles on page load
  useEffect(() => {
    fetch("/api/handles/merge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dry_run: false }),
    })
      .then(r => r.json())
      .then(d => { if (d.groups > 0) setRefreshKey(k => k + 1); })
      .catch(() => {});
  }, []);

  return (
    <PageShell activeTab="interactions">
      {({ activePlatform, weekFilter, dateFrom, dateTo }) => (
        <>
          <NotableInteractions
            activePlatform={activePlatform}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />

          <InteractionsTable platform={activePlatform} weekFilter={weekFilter} refreshKey={refreshKey} />

          {creating && (
            <>
              <div onClick={() => setCreating(false)} style={{
                position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.15)" }} />
              <CreatePanelDynamic
                onClose={() => setCreating(false)}
                onCreated={() => { setCreating(false); setRefreshKey(k => k + 1); }}
              />
            </>
          )}
        </>
      )}
    </PageShell>
  );
}
