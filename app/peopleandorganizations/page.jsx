"use client";
import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import dynamic from "next/dynamic";
import PageShell, { T, sans, F } from "../../components/PageShell";
import { PlatIcon, PlatChip, PLAT_COLORS } from "../../components/PlatIcon";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const HandlesTable = dynamic(() => import("../../components/HandlesTable"), {
  ssr: false,
  loading: () => null,
});

// ─── Shared constants ─────────────────────────────────────────────────────────
const PLAT_URL    = {
  instagram: h => `https://instagram.com/${h}`,
  x:         h => `https://x.com/${h}`,
  youtube:   h => `https://youtube.com/@${h}`,
  linkedin:  h => `https://linkedin.com/in/${h}`,
};

const TYPE_BADGE = {
  like:    { label: "Like",    bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  follow:  { label: "Follow",  bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
  comment: { label: "Comment", bg: "#FEFCE8", color: "#CA8A04", border: "#FEF08A" },
  repost:  { label: "Repost",  bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
  mention: { label: "Mention", bg: "#FFF3EE", color: "#FF6B35", border: "#FFD4C2" },
  tag:     { label: "Tag",     bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
};

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #FF6B35, #FF9F1C)",
  "linear-gradient(135deg, #E1306C, #F77737)",
  "linear-gradient(135deg, #2563EB, #7C3AED)",
  "linear-gradient(135deg, #16A34A, #22D3EE)",
  "linear-gradient(135deg, #7C3AED, #EC4899)",
  "linear-gradient(135deg, #0077B5, #00B4D8)",
];

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
  const d = new Date(safe);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7)  return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function normalizeType(type) {
  const t = (type || "").toLowerCase();
  if (t === "liked")    return "like";
  if (t === "followed") return "follow";
  if (t === "commented") return "comment";
  if (t === "reposted") return "repost";
  if (t === "mentioned") return "mention";
  return t || "interaction";
}

// ─── Active in your network ───────────────────────────────────────────────────
function ActiveInNetwork({ activePlatform, dateFrom, dateTo }) {
  const [people, setPeople]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [hoveredId, setHoveredId]     = useState(null);
  const [chevronHover, setChevronHover] = useState(null);
  const scrollRef = useRef(null);

  function scroll(dir) {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 340, behavior: "smooth" });
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        // Fetch recent interactions for ELITE handles within date range
        let query = supabase
          .from("interactions")
          .select("*, handles(*)")
          .order("interacted_at", { ascending: false })
          .limit(2000);

        if (dateFrom) query = query.gte("interacted_at", dateFrom);
        if (dateTo)   query = query.lte("interacted_at", dateTo + "T23:59:59Z");

        const { data, error } = await query;
        if (error || cancelled) return;

        // Filter for ELITE handles, optionally by platform
        const filtered = (data || []).filter(row => {
          const h = row.handles || {};
          if (h.zone !== "ELITE") return false;
          if (activePlatform && activePlatform !== "all") {
            return row.platform === activePlatform;
          }
          return true;
        });

        // Group all interactions by handle — collect every type per person
        const groups = {};
        for (const row of filtered) {
          const key = row.handle_id || row.handles?.id;
          if (!key) continue;
          if (!groups[key]) {
            groups[key] = { latestRow: row, typeCounts: new Map(), count: 0 };
          }
          // Track most recent row for sorting + handle data
          if ((row.interacted_at || "") > (groups[key].latestRow.interacted_at || "")) {
            groups[key].latestRow = row;
          }
          const t = normalizeType(row.interaction_type);
          groups[key].typeCounts.set(t, (groups[key].typeCounts.get(t) || 0) + 1);
          groups[key].count++;
        }

        // Sort by most recent interaction date
        const sorted = Object.values(groups).sort(
          (a, b) => (b.latestRow.interacted_at || "").localeCompare(a.latestRow.interacted_at || "")
        );

        // Map to card data
        const cards = sorted.map(({ latestRow: row, typeCounts, count }) => {
          const h    = row.handles || {};
          const plat = row.platform || "x";
          const followers =
            plat === "instagram" ? (h.followers_instagram || 0) :
            plat === "x"         ? (h.followers_x        || 0) :
            plat === "youtube"   ? (h.followers_youtube   || 0) :
                                   (h.followers_linkedin  || 0);
          const handle =
            plat === "instagram" ? h.handle_instagram :
            plat === "x"         ? h.handle_x :
            plat === "youtube"   ? h.handle_youtube :
                                   h.handle_linkedin;
          const gradIdx = Math.abs((h.name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % AVATAR_GRADIENTS.length;
          const typeList = [...typeCounts.entries()]; // [[type, count], ...]
          return {
            id:          row.id,
            handleId:    row.handle_id || h.id,
            name:        h.name || "Unknown",
            bio:         h.bio  || null,
            zone:        h.zone || "SIGNAL",
            entity_type: h.entity_type || "person",
            platform:    plat,
            handle,
            followers,
            types:       typeList,
            follows:     typeCounts.has("follow"),
            count,
            date:        row.interacted_at,
            gradIdx,
          };
        });

        if (!cancelled) { setPeople(cards); setLoading(false); }
      } catch (e) {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [activePlatform, dateFrom, dateTo]);

  if (loading || people.length === 0) return null;

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text }}>
          Active in your network
        </div>
        <span style={{
          fontFamily: sans, fontSize: F.xs, fontWeight: 600, color: T.dim,
          background: T.well, borderRadius: 10, padding: "2px 8px",
          border: `1px solid ${T.border}`,
        }}>
          {people.length}
        </span>
      </div>

      {/* Scroll strip */}
      <div style={{ position: "relative" }}>
        {/* Left chevron */}
        <button
          onClick={() => scroll(-1)}
          onMouseEnter={() => setChevronHover("left")}
          onMouseLeave={() => setChevronHover(null)}
          style={{
            position: "absolute", left: -14, top: "50%", transform: "translateY(-50%)",
            zIndex: 10, width: 28, height: 28, borderRadius: "50%",
            border: `1px solid ${T.border}`,
            background: chevronHover === "left" ? T.accent : T.card,
            color: chevronHover === "left" ? "#fff" : T.sub,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 14, fontWeight: 700,
            boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
            transition: "all 0.15s",
          }}>
          ‹
        </button>

        {/* Cards */}
        <div ref={scrollRef} style={{
          display: "flex", gap: 12, overflowX: "auto", overflowY: "hidden",
          scrollbarWidth: "none", msOverflowStyle: "none",
          paddingBottom: 4,
        }}>
          {people.map(p => {
            const isHovered = hoveredId === p.id;
            const avatarLetter = p.name !== "Unknown" ? p.name.charAt(0).toUpperCase() : null;

            return (
              <div
                key={p.id}
                onMouseEnter={() => setHoveredId(p.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  flexShrink: 0, width: 260,
                  background: T.card,
                  border: `1px solid ${isHovered ? (T.border2 || T.border) : T.border}`,
                  borderRadius: 12, padding: "14px 16px",
                  boxShadow: isHovered ? T.shadowMd : T.shadowSm,
                  transition: "all 0.15s ease",
                  transform: isHovered ? "translateY(-1px)" : "none",
                }}
              >
                {/* Top row: avatar + name + platform link */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  {/* Avatar */}
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                    background: avatarLetter ? AVATAR_GRADIENTS[p.gradIdx] : T.well,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontFamily: sans, fontSize: 14, fontWeight: 700,
                  }}>
                    {avatarLetter || "?"}
                  </div>

                  {/* Name */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {p.name}
                    </div>
                    {p.entity_type && p.entity_type !== "person" && (
                      <div style={{
                        fontFamily: sans, fontSize: 10, fontWeight: 600,
                        color: p.entity_type === "organization" ? "#2563EB" : "#7C3AED",
                        letterSpacing: "0.04em",
                      }}>
                        {p.entity_type === "organization" ? "ORG" : "PAGE"}
                      </div>
                    )}
                  </div>

                  {/* Platform icon link */}
                  {p.handle && (
                    <a
                      href={PLAT_URL[p.platform]?.(p.handle) || "#"}
                      target="_blank" rel="noreferrer"
                      style={{ textDecoration: "none", flexShrink: 0 }}>
                      <PlatChip platform={p.platform} size={15} radius={7} />
                    </a>
                  )}
                </div>

                {/* Stats row: followers + ELITE badge */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                  {p.followers > 0 && (
                    <span style={{
                      fontFamily: sans, fontSize: F.xs, color: T.sub, fontWeight: 600,
                      background: T.well, borderRadius: 4, padding: "2px 7px",
                      border: `1px solid ${T.border}`,
                    }}>
                      {fmt(p.followers)} followers
                    </span>
                  )}
                  <span style={{
                    fontFamily: sans, fontSize: F.xs, fontWeight: 700, letterSpacing: "0.04em",
                    color: T.accent, background: "#FFF3EE",
                    border: "1px solid #FFD4C2", borderRadius: 6, padding: "2px 8px",
                  }}>
                    ELITE
                  </span>
                </div>

                {/* Interaction type pills with counts */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: p.follows ? 8 : 0 }}>
                  {(p.types || []).filter(([t]) => t !== "follow").map(([t, n]) => {
                    const cfg = TYPE_BADGE[t] || { label: t, bg: T.well, color: T.sub, border: T.border };
                    const base = cfg.label.toLowerCase();
                    const label = n === 1 ? `1 ${base}` : `${n} ${base}s`;
                    return (
                      <span key={t} style={{
                        display: "inline-flex", alignItems: "center",
                        fontFamily: sans, fontSize: F.xs, fontWeight: 600,
                        background: cfg.bg, color: cfg.color,
                        border: `1px solid ${cfg.border}`,
                        borderRadius: 12, padding: "2px 9px",
                      }}>
                        {label}
                      </span>
                    );
                  })}
                </div>

                {/* Follows you + last seen */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginTop: 6 }}>
                  {p.follows ? (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      fontFamily: sans, fontSize: F.xs, fontWeight: 700,
                      background: "#F0FDF4", color: "#16A34A",
                      border: "1px solid #BBF7D0",
                      borderRadius: 12, padding: "2px 9px",
                    }}>
                      ✓ Follows you
                    </span>
                  ) : <span />}
                  <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>
                    {fmtDate(p.date)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right chevron */}
        <button
          onClick={() => scroll(1)}
          onMouseEnter={() => setChevronHover("right")}
          onMouseLeave={() => setChevronHover(null)}
          style={{
            position: "absolute", right: -14, top: "50%", transform: "translateY(-50%)",
            zIndex: 10, width: 28, height: 28, borderRadius: "50%",
            border: `1px solid ${T.border}`,
            background: chevronHover === "right" ? T.accent : T.card,
            color: chevronHover === "right" ? "#fff" : T.sub,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 14, fontWeight: 700,
            boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
            transition: "all 0.15s",
          }}>
          ›
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HandlesPage() {
  return (
    <PageShell activeTab="handles">
      {({ activePlatform, refreshKey, dateFrom, dateTo }) => (
        <>
          <ActiveInNetwork
            activePlatform={activePlatform}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />
          <HandlesTable platform={activePlatform} refreshKey={refreshKey} />
        </>
      )}
    </PageShell>
  );
}
