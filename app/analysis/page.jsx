"use client";
import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import PageShell, { T, sans, F } from "../../components/PageShell";
import { ZONE_CFG } from "../../lib/design";
import { PlatDot, PlatChip, PLAT_COLORS } from "../../components/PlatIcon";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLAT_LABEL = { youtube: "YouTube", x: "X / Twitter", instagram: "Instagram", linkedin: "LinkedIn" };
const PLAT_URL   = {
  instagram: h => `https://instagram.com/${h}`,
  x:         h => `https://x.com/${h}`,
  youtube:   h => `https://youtube.com/@${h}`,
  linkedin:  h => `https://linkedin.com/in/${h}`,
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

function fmtDateFull(iso) {
  if (!iso) return "";
  const safe = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso + "T12:00:00" : iso;
  return new Date(safe).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtDateRange(from, to) {
  const f = d => {
    const safe = /^\d{4}-\d{2}-\d{2}$/.test(d) ? d + "T12:00:00" : d;
    return new Date(safe).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };
  if (!from && !to) return "All time";
  if (!from) return `Until ${f(to)}`;
  if (!to)   return `From ${f(from)}`;
  return `${f(from)} – ${f(to)}`;
}

function weekKey(iso) {
  const d = new Date(iso);
  const mon = new Date(d);
  mon.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return mon.toISOString().slice(0, 10);
}

function weekLabel(key) {
  const d = new Date(key + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function normalizeType(type) {
  const t = (type || "").toLowerCase();
  if (t === "liked")     return "like";
  if (t === "followed")  return "follow";
  if (t === "commented") return "comment";
  if (t === "reposted")  return "repost";
  if (t === "mentioned") return "mention";
  return t || "interaction";
}

// ─── Badge configs ────────────────────────────────────────────────────────────

const TYPE_BADGE = {
  like:    { label: "Like",    bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  follow:  { label: "Follow",  bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
  comment: { label: "Comment", bg: "#FEFCE8", color: "#CA8A04", border: "#FEF08A" },
  repost:  { label: "Repost",  bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
  mention: { label: "Mention", bg: "#FFF3EE", color: "#FF6B35", border: "#FFD4C2" },
  tag:     { label: "Tag",     bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
};

// Zone badge config — use ZONE_CFG from lib/design (imported above)

const ZONE_PRIORITY = { ELITE: 0, COLLABORATOR: 0, INFLUENTIAL: 1, SIGNAL: 2 };

// ─── Icon-only export button ──────────────────────────────────────────────────

function ExportIconBtn({ wrapperRef, onBeforeCapture, filename }) {
  const [busy, setBusy] = useState(false);
  const [hover, setHover] = useState(false);

  async function handleExport() {
    if (!wrapperRef.current) return;
    setBusy(true);
    try {
      if (onBeforeCapture) await onBeforeCapture();
      await new Promise(r => setTimeout(r, 150));
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(wrapperRef.current, {
        useCORS: true, scale: 2, backgroundColor: "#FFFFFF", logging: false,
      });
      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={busy}
      title="Save as image"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 28, height: 28,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: hover ? T.well : "none",
        border: `1px solid ${hover ? T.border2 : T.border}`,
        borderRadius: 6, cursor: busy ? "default" : "pointer",
        color: busy ? T.dim : hover ? T.text : T.dim,
        flexShrink: 0,
        transition: "background 0.12s, border-color 0.12s, color 0.12s",
        opacity: busy ? 0.4 : 1,
      }}
    >
      {busy ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
          <circle cx="12" cy="12" r="10"/>
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      )}
    </button>
  );
}

// ─── Context stamp ────────────────────────────────────────────────────────────

function ContextStamp({ dateFrom, dateTo, activePlatform }) {
  const dateLabel = fmtDateRange(dateFrom, dateTo);
  const platLabel = activePlatform && activePlatform !== "all"
    ? PLAT_LABEL[activePlatform] || activePlatform : null;
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      marginTop: 16, paddingTop: 10, borderTop: `1px solid ${T.border}`,
    }}>
      <span style={{ fontFamily: sans, fontSize: 11, color: T.dim, fontWeight: 500 }}>
        {dateLabel}{platLabel ? ` · ${platLabel}` : ""}
      </span>
      <span style={{ fontFamily: sans, fontSize: 11, color: T.dim, fontWeight: 700, letterSpacing: "0.05em" }}>
        AUDIAN
      </span>
    </div>
  );
}

// ─── Section shell (clean wrapper for export capture) ────────────────────────

function Section({ wrapperRef, dateFrom, dateTo, activePlatform, children }) {
  return (
    <div ref={wrapperRef} style={{
      background: "#FFFFFF",
      borderRadius: 16,
      padding: "20px 24px",
      marginBottom: 20,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
    }}>
      {children}
      <ContextStamp dateFrom={dateFrom} dateTo={dateTo} activePlatform={activePlatform} />
    </div>
  );
}

// ─── Active in your network ───────────────────────────────────────────────────

function ActiveInNetwork({ activePlatform, dateFrom, dateTo, expanded, onExpandChange, exportBtn }) {
  const [people, setPeople]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [hoveredId, setHoveredId]       = useState(null);
  const [chevronHover, setChevronHover] = useState(null);
  const scrollRef = useRef(null);

  function scroll(dir) {
    scrollRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        let q = supabase.from("interactions").select("*, handles(*)")
          .order("interacted_at", { ascending: false }).limit(2000);
        if (dateFrom) q = q.gte("interacted_at", dateFrom);
        if (dateTo)   q = q.lte("interacted_at", dateTo + "T23:59:59Z");
        const { data, error } = await q;
        if (error || cancelled) return;

        const filtered = (data || []).filter(row => {
          const h = row.handles || {};
          if (h.zone !== "ELITE" && h.zone !== "COLLABORATOR") return false;
          if (activePlatform && activePlatform !== "all") return row.platform === activePlatform;
          return true;
        });

        const groups = {};
        for (const row of filtered) {
          const key = row.handle_id || row.handles?.id;
          if (!key) continue;
          if (!groups[key]) groups[key] = { latestRow: row, typeCounts: new Map(), count: 0 };
          if ((row.interacted_at || "") > (groups[key].latestRow.interacted_at || ""))
            groups[key].latestRow = row;
          const t = normalizeType(row.interaction_type);
          groups[key].typeCounts.set(t, (groups[key].typeCounts.get(t) || 0) + 1);
          groups[key].count++;
        }

        const cards = Object.values(groups)
          .sort((a, b) => (b.latestRow.interacted_at || "").localeCompare(a.latestRow.interacted_at || ""))
          .map(({ latestRow: row, typeCounts, count }) => {
            const h    = row.handles || {};
            const plat = row.platform || "x";
            const followers = plat === "instagram" ? (h.followers_instagram || 0)
              : plat === "x" ? (h.followers_x || 0)
              : plat === "youtube" ? (h.followers_youtube || 0) : (h.followers_linkedin || 0);
            const handle = plat === "instagram" ? h.handle_instagram
              : plat === "x" ? h.handle_x
              : plat === "youtube" ? h.handle_youtube : h.handle_linkedin;
            const gradIdx = Math.abs((h.name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % AVATAR_GRADIENTS.length;
            return {
              id: row.id, name: h.name || "Unknown", bio: h.bio || null,
              zone: h.zone || "SIGNAL", entity_type: h.entity_type || "person",
              platform: plat, handle, followers,
              types: [...typeCounts.entries()],
              follows: typeCounts.has("follow"),
              count, date: row.interacted_at, gradIdx, avatar_url: h.avatar_url || null,
            };
          });

        if (!cancelled) { setPeople(cards); setLoading(false); }
      } catch { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [activePlatform, dateFrom, dateTo]);

  if (loading || people.length === 0) return null;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text }}>
          Active in your network
        </span>
        <span style={{
          fontFamily: sans, fontSize: 11, fontWeight: 600, color: T.dim,
          background: T.well, borderRadius: 10, padding: "2px 7px",
          border: `1px solid ${T.border}`,
        }}>
          {people.length}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          {exportBtn}
          <button
            onClick={() => onExpandChange(!expanded)}
            style={{
              background: "none", border: `1px solid ${T.border}`, borderRadius: 6,
              cursor: "pointer", padding: "3px 9px", color: T.dim,
              fontSize: F.xs, fontWeight: 600, fontFamily: sans,
              display: "flex", alignItems: "center", gap: 4, transition: "all 0.12s",
              height: 28,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = T.well; e.currentTarget.style.color = T.text; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = T.dim; }}
          >
            {expanded ? "▴ Collapse" : "▾ Show all"}
          </button>
        </div>
      </div>

      {/* Cards */}
      <div style={{ position: "relative" }}>
        {!expanded && (
          <button onClick={() => scroll(-1)} onMouseEnter={() => setChevronHover("left")} onMouseLeave={() => setChevronHover(null)}
            style={{
              position: "absolute", left: -14, top: "50%", transform: "translateY(-50%)",
              zIndex: 10, width: 28, height: 28, borderRadius: "50%",
              border: `1px solid ${T.border}`,
              background: chevronHover === "left" ? T.accent : T.card,
              color: chevronHover === "left" ? "#fff" : T.sub,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 14, fontWeight: 700,
              boxShadow: "0 1px 4px rgba(0,0,0,0.10)", transition: "all 0.15s",
            }}>‹</button>
        )}
        <div ref={expanded ? undefined : scrollRef} style={expanded ? {
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12,
        } : {
          display: "flex", gap: 12, overflowX: "auto", overflowY: "hidden",
          scrollbarWidth: "none", msOverflowStyle: "none", paddingBottom: 4,
        }}>
          {people.map(p => {
            const isHovered = hoveredId === p.id;
            const letter = p.name !== "Unknown" ? p.name.charAt(0).toUpperCase() : null;
            return (
              <div key={p.id}
                onMouseEnter={() => setHoveredId(p.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  ...(expanded ? {} : { flexShrink: 0, width: 260 }),
                  background: T.card, borderRadius: 12, padding: "14px 16px",
                  border: `1px solid ${isHovered ? (T.border2 || T.border) : T.border}`,
                  boxShadow: isHovered ? T.shadowMd : T.shadowSm,
                  transition: "box-shadow 0.15s ease, border-color 0.15s ease, transform 0.15s ease",
                  transform: isHovered ? "translateY(-1px)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt={p.name} crossOrigin="anonymous"
                      style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                      background: letter ? AVATAR_GRADIENTS[p.gradIdx] : T.well,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontFamily: sans, fontSize: 14, fontWeight: 700,
                    }}>{letter || "?"}</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.name}
                    </div>
                    {p.entity_type && p.entity_type !== "person" && (
                      <div style={{ fontFamily: sans, fontSize: 10, fontWeight: 600, color: p.entity_type === "organization" ? "#2563EB" : "#7C3AED", letterSpacing: "0.04em" }}>
                        {p.entity_type === "organization" ? "ORG" : "PAGE"}
                      </div>
                    )}
                  </div>
                  {p.handle && (
                    <a href={PLAT_URL[p.platform]?.(p.handle) || "#"} target="_blank" rel="noreferrer"
                      style={{ textDecoration: "none", flexShrink: 0 }}>
                      <PlatChip platform={p.platform} size={15} radius={7} />
                    </a>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                  {p.followers > 0 && (
                    <span style={{ fontFamily: sans, fontSize: F.xs, color: T.sub, fontWeight: 600, background: T.well, borderRadius: 4, padding: "2px 7px", border: `1px solid ${T.border}` }}>
                      {fmt(p.followers)} followers
                    </span>
                  )}
                  {(() => {
                    const zc = ZONE_CFG[p.zone] || ZONE_CFG.SIGNAL;
                    return <span style={{ fontFamily: sans, fontSize: F.xs, fontWeight: 700, letterSpacing: "0.04em", color: zc.color, background: zc.bg, border: `1px solid ${zc.border}`, borderRadius: 6, padding: "2px 8px" }}>{zc.label}</span>;
                  })()}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: p.follows ? 8 : 0 }}>
                  {(p.types || []).filter(([t]) => t !== "follow").map(([t, n]) => {
                    const cfg = TYPE_BADGE[t] || { label: t, bg: T.well, color: T.sub, border: T.border };
                    const label = n === 1 ? `1 ${cfg.label.toLowerCase()}` : `${n} ${cfg.label.toLowerCase()}s`;
                    return <span key={t} style={{ display: "inline-flex", alignItems: "center", fontFamily: sans, fontSize: F.xs, fontWeight: 600, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: 12, padding: "2px 9px" }}>{label}</span>;
                  })}
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginTop: 6 }}>
                  {p.follows ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: sans, fontSize: F.xs, fontWeight: 700, background: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0", borderRadius: 12, padding: "2px 9px" }}>
                      ✓ Follows you
                    </span>
                  ) : <span />}
                  <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>{fmtDate(p.date)}</span>
                </div>
              </div>
            );
          })}
        </div>
        {!expanded && (
          <button onClick={() => scroll(1)} onMouseEnter={() => setChevronHover("right")} onMouseLeave={() => setChevronHover(null)}
            style={{
              position: "absolute", right: -14, top: "50%", transform: "translateY(-50%)",
              zIndex: 10, width: 28, height: 28, borderRadius: "50%",
              border: `1px solid ${T.border}`,
              background: chevronHover === "right" ? T.accent : T.card,
              color: chevronHover === "right" ? "#fff" : T.sub,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 14, fontWeight: 700,
              boxShadow: "0 1px 4px rgba(0,0,0,0.10)", transition: "all 0.15s",
            }}>›</button>
        )}
      </div>
    </div>
  );
}

// ─── Notable Interactions ─────────────────────────────────────────────────────

function NotableInteractions({ activePlatform, dateFrom, dateTo, expanded, onExpandChange, exportBtn }) {
  const [mentions, setMentions]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [hoveredId, setHoveredId]       = useState(null);
  const [chevronHover, setChevronHover] = useState(null);
  const scrollRef = useRef(null);

  function scroll(dir) {
    scrollRef.current?.scrollBy({ left: dir * 360, behavior: "smooth" });
  }

  useEffect(() => {
    let cancelled = false;
    async function fetch_() {
      setLoading(true);
      try {
        let q = supabase.from("interactions").select("*, handles(*)");
        if (dateFrom) q = q.gte("interacted_at", dateFrom);
        if (dateTo)   q = q.lte("interacted_at", dateTo + "T23:59:59Z");
        const { data, error } = await q.order("interacted_at", { ascending: false });
        if (error) throw error;

        const mapped = (data || []).map(row => {
          const h = row.handles || {};
          const plat = row.platform || "x";
          const handle = plat === "instagram" ? (h.handle_instagram || h.handle_x || "unknown")
            : plat === "x"       ? (h.handle_x || h.handle_instagram || "unknown")
            : plat === "youtube" ? (h.handle_youtube || h.handle_x || "unknown")
                                 : (h.handle_linkedin || h.handle_x || "unknown");
          const followers = plat === "instagram" ? (h.followers_instagram || 0)
            : plat === "x"       ? (h.followers_x       || 0)
            : plat === "youtube" ? (h.followers_youtube  || 0) : (h.followers_linkedin || 0);
          return {
            id: row.id, name: h.name || "Unknown", handle, bio: h.bio || null,
            platform: plat, type: normalizeType(row.interaction_type),
            content: row.content || null, mention_url: row.mention_url || null,
            post_url: row.post_url || null, followers,
            zone: h.zone || "SIGNAL", avatar_url: h.avatar_url || null,
            date: row.interacted_at || null,
          };
        });

        let filtered = activePlatform && activePlatform !== "all"
          ? mapped.filter(m => m.platform === activePlatform) : mapped;

        const TYPE_SCORE = { follow: 5, repost: 4, mention: 3, comment: 2, reply: 2, tag: 1, like: 0 };
        const score = m => {
          let s = TYPE_SCORE[m.type] ?? 1;
          if (m.content?.length > 30) s += 3; else if (m.content?.length > 0) s += 1;
          s += (ZONE_PRIORITY[m.zone] != null ? (3 - ZONE_PRIORITY[m.zone]) : 0);
          s += Math.min((m.followers || 0) / 100000, 5);
          return s;
        };
        filtered.sort((a, b) => score(b) - score(a));

        const seenNames = new Set();
        const deduped = [];
        for (const m of filtered) {
          const key = (m.name || "").trim().toLowerCase();
          if (key && seenNames.has(key)) continue;
          if (key) seenNames.add(key);
          deduped.push(m);
        }

        const notable = deduped.filter(m => m.zone === "ELITE" || m.zone === "COLLABORATOR");
        notable.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
        if (!cancelled) setMentions(notable);
      } catch { if (!cancelled) setMentions([]); }
      finally { if (!cancelled) setLoading(false); }
    }
    fetch_();
    return () => { cancelled = true; };
  }, [activePlatform, dateFrom, dateTo]);

  if (loading) return null;
  if (mentions.length === 0) return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text }}>Notable Interactions</span>
      </div>
      <div style={{ background: T.well, borderRadius: 10, padding: "28px 20px", textAlign: "center" }}>
        <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>No notable interactions in this period</span>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text }}>Notable Interactions</span>
        <span style={{
          fontFamily: sans, fontSize: 11, fontWeight: 600, color: T.dim,
          background: T.well, borderRadius: 10, padding: "2px 7px",
          border: `1px solid ${T.border}`,
        }}>
          {mentions.length}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          {exportBtn}
          <button
            onClick={() => onExpandChange(!expanded)}
            style={{
              background: "none", border: `1px solid ${T.border}`, borderRadius: 6,
              cursor: "pointer", padding: "3px 9px", color: T.dim,
              fontSize: F.xs, fontWeight: 600, fontFamily: sans,
              display: "flex", alignItems: "center", gap: 4, transition: "all 0.12s",
              height: 28,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = T.well; e.currentTarget.style.color = T.text; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = T.dim; }}
          >
            {expanded ? "▴ Collapse" : "▾ Show all"}
          </button>
        </div>
      </div>

      {/* Cards */}
      <div style={{ position: "relative" }}>
        {!expanded && (
          <button onClick={() => scroll(-1)} onMouseEnter={() => setChevronHover("left")} onMouseLeave={() => setChevronHover(null)}
            style={{
              position: "absolute", left: -14, top: "50%", transform: "translateY(-50%)",
              zIndex: 10, width: 28, height: 28, borderRadius: "50%",
              border: `1px solid ${T.border}`,
              background: chevronHover === "left" ? T.accent : T.card,
              color: chevronHover === "left" ? "#fff" : T.sub,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 14, fontWeight: 700,
              boxShadow: "0 1px 4px rgba(0,0,0,0.10)", transition: "all 0.15s",
            }}>‹</button>
        )}
        <div ref={expanded ? undefined : scrollRef} style={expanded ? {
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14,
        } : {
          display: "flex", gap: 14, overflowX: "auto", overflowY: "hidden",
          scrollbarWidth: "none", msOverflowStyle: "none", paddingBottom: 4,
        }}>
          {mentions.map(m => {
            const isHovered = hoveredId === m.id;
            const zoneCfg   = ZONE_CFG[m.zone] || ZONE_CFG.SIGNAL;
            const typeCfg   = TYPE_BADGE[m.type] || { label: m.type || "Unknown", bg: T.well, color: T.sub, border: T.border };
            const letter    = (m.name && m.name !== "Unknown") ? m.name.charAt(0).toUpperCase() : null;
            const gradIdx   = Math.abs((m.name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % AVATAR_GRADIENTS.length;

            return (
              <div key={m.id}
                onMouseEnter={() => setHoveredId(m.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  background: T.card, borderRadius: 12, padding: "16px 18px",
                  border: `1px solid ${isHovered ? T.border2 : T.border}`,
                  boxShadow: isHovered ? T.shadowMd : T.shadowSm,
                  transition: "box-shadow 0.15s ease, border-color 0.15s ease, transform 0.15s ease",
                  transform: isHovered ? "translateY(-1px)" : "none",
                  ...(expanded ? {} : { flexShrink: 0, width: 320 }),
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  {m.avatar_url ? (
                    <img src={m.avatar_url} alt={m.name} crossOrigin="anonymous"
                      style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                      background: letter ? AVATAR_GRADIENTS[gradIdx] : (PLAT_COLORS[m.platform] || T.dim) + "22",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: letter ? "#fff" : (PLAT_COLORS[m.platform] || T.dim),
                      fontFamily: sans, fontSize: 15, fontWeight: 700,
                    }}>{letter || <PlatChip platform={m.platform} size={16} radius={6} />}</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.name}
                    </div>
                  </div>
                  <a href={PLAT_URL[m.platform]?.(m.handle) || "#"} target="_blank" rel="noreferrer"
                    style={{ textDecoration: "none", display: "inline-flex" }}>
                    <PlatChip platform={m.platform} size={14} radius={8} />
                  </a>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                  {m.followers > 0 && (
                    <span style={{ fontFamily: sans, fontSize: F.xs, color: T.sub, fontWeight: 600, background: T.well, borderRadius: 4, padding: "2px 7px", border: `1px solid ${T.border}` }}>
                      {fmt(m.followers)} followers
                    </span>
                  )}
                  <span style={{ background: zoneCfg.bg, color: zoneCfg.color, border: `1px solid ${zoneCfg.border}`, borderRadius: 6, padding: "2px 8px", fontSize: F.xs, fontWeight: 700, fontFamily: sans, letterSpacing: "0.04em" }}>
                    {zoneCfg.label}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: typeCfg.bg, color: typeCfg.color, border: `1px solid ${typeCfg.border}`, borderRadius: 12, padding: "2px 9px", fontSize: F.xs, fontWeight: 600, fontFamily: sans }}>
                    {typeCfg.label}
                  </span>
                  <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim, marginLeft: "auto" }}>
                    {fmtDateFull(m.date)}
                  </span>
                </div>

                {m.bio && (
                  <div style={{ fontFamily: sans, fontSize: F.xs, color: T.sub, lineHeight: 1.45, marginBottom: m.content ? 8 : 0 }}>
                    {m.bio.length > 120 ? m.bio.slice(0, 120) + "…" : m.bio}
                  </div>
                )}
                {m.content && (
                  <div style={{ background: T.well, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", borderLeft: `3px solid ${PLAT_COLORS[m.platform] || T.accent}` }}>
                    {(() => {
                      const href = m.mention_url || m.post_url;
                      const cs = { fontFamily: sans, fontSize: F.xs, color: T.text, lineHeight: 1.5, whiteSpace: "pre-wrap" };
                      return href
                        ? <a href={href} target="_blank" rel="noreferrer" style={{ ...cs, textDecoration: "none", display: "block" }}>{m.content}</a>
                        : <div style={cs}>{m.content}</div>;
                    })()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {!expanded && (
          <button onClick={() => scroll(1)} onMouseEnter={() => setChevronHover("right")} onMouseLeave={() => setChevronHover(null)}
            style={{
              position: "absolute", right: -14, top: "50%", transform: "translateY(-50%)",
              zIndex: 10, width: 28, height: 28, borderRadius: "50%",
              border: `1px solid ${T.border}`,
              background: chevronHover === "right" ? T.accent : T.card,
              color: chevronHover === "right" ? "#fff" : T.sub,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 14, fontWeight: 700,
              boxShadow: "0 1px 4px rgba(0,0,0,0.10)", transition: "all 0.15s",
            }}>›</button>
        )}
      </div>
    </div>
  );
}

// ─── Outliers ─────────────────────────────────────────────────────────────────

function Outliers({ posts, activePlatform, selectedWeek, exportBtn }) {
  const filtered = posts.filter(p => {
    if (p.post_type === "daily_aggregate") return false;
    if (activePlatform !== "all" && p.platform !== activePlatform) return false;
    if (selectedWeek && weekKey(p.published_at) !== selectedWeek) return false;
    return true;
  });

  if (filtered.length < 4) return null;

  const withEng = filtered.map(p => ({ ...p, engagement: parseInt(p.likes || 0) }));
  const avg   = withEng.reduce((s, p) => s + p.engagement, 0) / withEng.length;
  const over  = withEng.filter(p => p.engagement > avg * 1.5).sort((a, b) => b.engagement - a.engagement).slice(0, 5);
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const under = withEng.filter(p =>
    p.engagement < avg * 0.5 && p.engagement >= 0 &&
    p.published_at && (Date.now() - new Date(p.published_at).getTime()) >= ONE_WEEK_MS
  ).sort((a, b) => a.engagement - b.engagement).slice(0, 5);

  const Row = ({ p, isOver }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "11px 18px", borderBottom: `1px solid ${T.border}` }}>
      <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: isOver ? T.greenBg : T.well, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
        {isOver ? "🚀" : "📉"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <PlatDot platform={p.platform} size={9} />
          <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>
            {p.published_at ? new Date(p.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
          </span>
        </div>
        <div style={{ fontFamily: sans, fontSize: F.xs, color: T.text, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {p.permalink
            ? <a href={p.permalink} target="_blank" rel="noreferrer" style={{ color: T.text, textDecoration: "none" }}>{p.content || "—"}</a>
            : (p.content || "—")}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <span style={{ fontFamily: sans, fontSize: F.xs, color: T.sub }}>♥ {fmt(p.likes)}</span>
          <span style={{ fontFamily: sans, fontSize: F.xs, color: T.sub }}>✦ {fmt(p.comments)}</span>
        </div>
      </div>
      <span style={{ fontFamily: sans, fontSize: F.xs, fontWeight: 700, flexShrink: 0, color: isOver ? T.green : T.red, background: isOver ? T.greenBg : T.redBg, border: `1px solid ${isOver ? T.greenBorder : T.redBorder}`, borderRadius: 6, padding: "2px 7px" }}>
        {isOver ? "+" : ""}{avg > 0 ? Math.round((p.engagement / avg - 1) * 100) : 0}%
      </span>
    </div>
  );

  const platLabel = activePlatform === "all" ? "all platforms" : (PLAT_LABEL[activePlatform] || activePlatform);
  const weekSuffix = selectedWeek ? ` · week of ${weekLabel(selectedWeek)}` : "";

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text }}>
          Outliers · {platLabel}{weekSuffix}
        </span>
        <span style={{ fontFamily: sans, fontSize: F.xs, fontWeight: 400, color: T.dim }}>
          avg {fmt(Math.round(avg))} likes
        </span>
        <div style={{ marginLeft: "auto" }}>{exportBtn}</div>
      </div>

      {/* Grid — no extra wrapper border, blends into the Section card */}
      <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${T.border}`, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ borderRight: `1px solid ${T.border}` }}>
          <div style={{ padding: "9px 18px 8px", display: "flex", alignItems: "center", gap: 6, borderBottom: `1px solid ${T.border}`, background: T.well }}>
            <span style={{ fontFamily: sans, fontSize: F.xs, fontWeight: 700, color: T.green }}>↑ OVERPERFORMING</span>
            <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>above 1.5× avg</span>
          </div>
          {over.length === 0
            ? <div style={{ padding: "20px 18px", fontFamily: sans, fontSize: F.sm, color: T.dim }}>No posts above 1.5× avg</div>
            : over.map((p, i) => <Row key={i} p={p} isOver={true} />)}
        </div>
        <div>
          <div style={{ padding: "9px 18px 8px", display: "flex", alignItems: "center", gap: 6, borderBottom: `1px solid ${T.border}`, background: T.well }}>
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalysisPage() {
  const [networkExpanded, setNetworkExpanded] = useState(false);
  const [notableExpanded, setNotableExpanded] = useState(false);

  const outliersRef = useRef(null);
  const networkRef  = useRef(null);
  const notableRef  = useRef(null);

  return (
    <PageShell activeTab="analysis">
      {({ posts, activePlatform, selectedWeek, dateFrom, dateTo }) => {
        const slug = `${dateFrom || "all"}-to-${dateTo || "all"}${activePlatform && activePlatform !== "all" ? `-${activePlatform}` : ""}`;

        return (
          <>
            <Section wrapperRef={outliersRef} dateFrom={dateFrom} dateTo={dateTo} activePlatform={activePlatform}>
              <Outliers
                posts={posts}
                activePlatform={activePlatform}
                selectedWeek={selectedWeek}
                exportBtn={<ExportIconBtn wrapperRef={outliersRef} filename={`outliers-${slug}`} />}
              />
            </Section>

            <Section wrapperRef={networkRef} dateFrom={dateFrom} dateTo={dateTo} activePlatform={activePlatform}>
              <ActiveInNetwork
                activePlatform={activePlatform}
                dateFrom={dateFrom}
                dateTo={dateTo}
                expanded={networkExpanded}
                onExpandChange={setNetworkExpanded}
                exportBtn={
                  <ExportIconBtn
                    wrapperRef={networkRef}
                    onBeforeCapture={() => setNetworkExpanded(true)}
                    filename={`active-in-network-${slug}`}
                  />
                }
              />
            </Section>

            <Section wrapperRef={notableRef} dateFrom={dateFrom} dateTo={dateTo} activePlatform={activePlatform}>
              <NotableInteractions
                activePlatform={activePlatform}
                dateFrom={dateFrom}
                dateTo={dateTo}
                expanded={notableExpanded}
                onExpandChange={setNotableExpanded}
                exportBtn={
                  <ExportIconBtn
                    wrapperRef={notableRef}
                    onBeforeCapture={() => setNotableExpanded(true)}
                    filename={`notable-interactions-${slug}`}
                  />
                }
              />
            </Section>
          </>
        );
      }}
    </PageShell>
  );
}
