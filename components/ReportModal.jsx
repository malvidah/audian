"use client";
import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const sans = "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif";
const ACCENT = "#FF6B35";

const ZONE_CFG = {
  ELITE:        { label: "ELITE",       color: "#FF6B35", bg: "#FFF3EE", border: "#FFD4C2" },
  COLLABORATOR: { label: "COLLABORATOR",color: "#DB2777", bg: "#FFF1F2", border: "#FECDD3" },
  INFLUENTIAL:  { label: "INFLUENTIAL", color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
  SIGNAL:       { label: "SIGNAL",      color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
};

const TYPE_CFG = {
  like:          { label: "Like",          color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
  follow:        { label: "Follow",        color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  comment:       { label: "Comment",       color: "#CA8A04", bg: "#FEFCE8", border: "#FEF08A" },
  repost:        { label: "Repost",        color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
  mention:       { label: "Mention",       color: "#FF6B35", bg: "#FFF3EE", border: "#FFD4C2" },
  tag:           { label: "Tag",           color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  collaboration: { label: "Collaboration", color: "#0369A1", bg: "#F0F9FF", border: "#BAE6FD" },
};

const PLAT_COLOR = { instagram: "#E1306C", x: "#000000", youtube: "#FF0000", linkedin: "#0077B5" };
const PLAT_ICON  = { instagram: "IG", x: "𝕏", youtube: "▶", linkedin: "in" };

const GRADIENTS = [
  "linear-gradient(135deg,#FF6B35,#FF9F1C)",
  "linear-gradient(135deg,#E1306C,#F77737)",
  "linear-gradient(135deg,#2563EB,#7C3AED)",
  "linear-gradient(135deg,#16A34A,#22D3EE)",
  "linear-gradient(135deg,#7C3AED,#EC4899)",
  "linear-gradient(135deg,#0077B5,#00B4D8)",
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
  return new Date(safe).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtRange(from, to) {
  if (from && to) return `${fmtDate(from)} – ${fmtDate(to)}`;
  if (from) return `From ${fmtDate(from)}`;
  if (to)   return `Through ${fmtDate(to)}`;
  return "All time";
}

function normType(type) {
  const t = (type || "").toLowerCase().trim();
  const map = { liked: "like", followed: "follow", commented: "comment", reposted: "repost", mentioned: "mention", tagged: "tag" };
  return map[t] ?? (t || "interaction");
}

function gradIdx(name) {
  return (name || "?").split("").reduce((s, c) => s + c.charCodeAt(0), 0) % GRADIENTS.length;
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: sans, fontSize: 10, fontWeight: 800, letterSpacing: "0.12em",
      textTransform: "uppercase", color: ACCENT, marginBottom: 14,
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <div style={{ flex: 1, height: 1, background: "#FFD4C2" }} />
      {children}
      <div style={{ flex: 1, height: 1, background: "#FFD4C2" }} />
    </div>
  );
}

// ── Interaction card ──────────────────────────────────────────────────────────
function InteractionCard({ item }) {
  const zc = ZONE_CFG[item.zone] || ZONE_CFG.SIGNAL;
  const tc = TYPE_CFG[item.type] || { label: item.type, color: "#6B7280", bg: "#F3F4F6", border: "#E5E7EB" };
  const letter = (item.name && item.name !== "Unknown") ? item.name.charAt(0).toUpperCase() : null;
  return (
    <div style={{
      background: "#fff", border: "1px solid #E8E6E1", borderRadius: 12,
      padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10,
      pageBreakInside: "avoid",
    }}>
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {item.avatar_url ? (
          <img crossOrigin="anonymous" src={item.avatar_url} alt={item.name}
            style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <div style={{
            width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
            background: GRADIENTS[gradIdx(item.name)],
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: sans, fontSize: 14, fontWeight: 700, color: "#fff",
          }}>
            {letter || "?"}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 700, color: "#1A1816",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.name}
          </div>
          {item.followers > 0 && (
            <div style={{ fontFamily: sans, fontSize: 11, color: "#A8A39C", fontWeight: 500 }}>
              {fmt(item.followers)} followers
            </div>
          )}
        </div>
        {/* Platform icon */}
        <div style={{
          width: 26, height: 26, borderRadius: 7, flexShrink: 0,
          background: (PLAT_COLOR[item.platform] || "#666") + "18",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: sans, fontSize: 10, fontWeight: 800,
          color: PLAT_COLOR[item.platform] || "#666",
        }}>
          {PLAT_ICON[item.platform] || "?"}
        </div>
      </div>

      {/* Badges */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span style={{
          fontFamily: sans, fontSize: 9, fontWeight: 800, letterSpacing: "0.06em",
          color: zc.color, background: zc.bg, border: `1px solid ${zc.border}`,
          borderRadius: 5, padding: "2px 7px",
        }}>{zc.label}</span>
        <span style={{
          fontFamily: sans, fontSize: 9, fontWeight: 700,
          color: tc.color, background: tc.bg, border: `1px solid ${tc.border}`,
          borderRadius: 10, padding: "2px 8px",
        }}>{tc.label}</span>
        <span style={{ fontFamily: sans, fontSize: 10, color: "#A8A39C", marginLeft: "auto" }}>
          {fmtDate(item.date)}
        </span>
      </div>

      {/* Content snippet */}
      {item.content && (
        <div style={{
          fontFamily: sans, fontSize: 11, color: "#4B4845", lineHeight: 1.5,
          background: "#F8F7F5", borderRadius: 7, padding: "8px 10px",
          borderLeft: `3px solid ${PLAT_COLOR[item.platform] || ACCENT}`,
          display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {item.content}
        </div>
      )}

      {/* Bio fallback if no content */}
      {!item.content && item.bio && (
        <div style={{
          fontFamily: sans, fontSize: 11, color: "#6B6560", lineHeight: 1.45,
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {item.bio}
        </div>
      )}
    </div>
  );
}

// ── Post card ─────────────────────────────────────────────────────────────────
function PostCard({ post }) {
  const pc = PLAT_COLOR[post.platform] || "#6B6560";
  const pi = PLAT_ICON[post.platform]  || "?";
  return (
    <div style={{
      background: "#fff", border: "1px solid #E8E6E1", borderRadius: 12,
      padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10,
    }}>
      {/* Platform + date */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: pc + "18",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: sans, fontSize: 11, fontWeight: 800, color: pc, flexShrink: 0,
        }}>{pi}</div>
        <span style={{ fontFamily: sans, fontSize: 11, color: "#A8A39C", fontWeight: 500 }}>
          {fmtDate(post.published_at)}
        </span>
      </div>

      {/* Content */}
      {post.content && (
        <div style={{
          fontFamily: sans, fontSize: 12, color: "#1A1816", lineHeight: 1.55,
          display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical",
          overflow: "hidden", flex: 1,
        }}>
          {post.content}
        </div>
      )}

      {/* Metrics */}
      <div style={{ display: "flex", gap: 12, marginTop: "auto" }}>
        {[
          { icon: "♥", val: post.likes_count,    label: "likes" },
          { icon: "💬", val: post.comments_count, label: "comments" },
          { icon: "↺",  val: post.shares_count,   label: "shares" },
          { icon: "👁",  val: post.views_count,    label: "views" },
        ].filter(m => parseInt(m.val) > 0).map(m => (
          <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 11 }}>{m.icon}</span>
            <span style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, color: "#1A1816" }}>{fmt(m.val)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function ReportModal({ dateFrom, dateTo, accountName, onClose }) {
  const [interactions, setInteractions] = useState([]);
  const [posts,        setPosts]        = useState([]);
  const [insights,     setInsights]     = useState(null);
  const [dataLoading,  setDataLoading]  = useState(true);
  const [insLoading,   setInsLoading]   = useState(true);
  const [exporting,    setExporting]    = useState(false);
  const reportRef = useRef(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      // Interactions
      let iQ = supabase.from("interactions").select("*, handles(*)")
        .order("interacted_at", { ascending: false }).limit(500);
      if (dateFrom) iQ = iQ.gte("interacted_at", dateFrom);
      if (dateTo)   iQ = iQ.lte("interacted_at", dateTo + "T23:59:59Z");
      const { data: iData } = await iQ;

      const TYPE_SCORE = { follow: 5, repost: 4, mention: 3, collaboration: 4, comment: 2, tag: 1, like: 0 };
      const seenNames = new Set();
      const notable = (iData || [])
        .filter(row => { const z = (row.handles || {}).zone; return z === "ELITE" || z === "COLLABORATOR"; })
        .map(row => {
          const h    = row.handles || {};
          const plat = row.platform || "x";
          const fol  = parseInt(plat === "instagram" ? h.followers_instagram : plat === "x" ? h.followers_x : plat === "youtube" ? h.followers_youtube : h.followers_linkedin) || 0;
          const type = normType(row.interaction_type);
          return {
            id: row.id, name: h.name || "Unknown",
            bio: h.bio, zone: h.zone, platform: plat, type,
            content: row.content, followers: fol,
            date: row.interacted_at, avatar_url: h.avatar_url || null,
            score: (TYPE_SCORE[type] ?? 1) + Math.min(fol / 100000, 5) + (row.content?.length > 20 ? 2 : 0),
          };
        })
        .sort((a, b) => b.score - a.score)
        .filter(m => {
          const k = m.name.toLowerCase();
          if (seenNames.has(k)) return false;
          seenNames.add(k); return true;
        })
        .slice(0, 6);

      setInteractions(notable);

      // Posts
      let pQ = supabase.from("posts").select("*")
        .order("published_at", { ascending: false }).limit(300);
      if (dateFrom) pQ = pQ.gte("published_at", dateFrom);
      if (dateTo)   pQ = pQ.lte("published_at", dateTo + "T23:59:59Z");
      const { data: pData } = await pQ;

      const topPosts = (pData || [])
        .map(p => ({ ...p, _score: (parseInt(p.likes_count)||0) + (parseInt(p.comments_count)||0)*2 + (parseInt(p.shares_count)||0)*3 + (parseInt(p.views_count)||0)*0.005 }))
        .sort((a, b) => b._score - a._score)
        .slice(0, 3);

      setPosts(topPosts);
      setDataLoading(false);

      // AI insights
      const interactionsSummary = notable.map(m =>
        `- ${m.name} (${fmt(m.followers)} followers, ${m.zone}): ${m.type} on ${fmtDate(m.date)}${m.content ? `. Comment/mention: "${m.content.slice(0, 120)}"` : ""}`
      ).join("\n");

      const commentContent = (iData || [])
        .filter(r => r.content && r.content.length > 15)
        .slice(0, 25)
        .map(r => `"${r.content.slice(0, 100)}"`)
        .join("\n");

      const postsSummary = topPosts.map(p =>
        `- ${p.platform || "unknown"}: ♥${p.likes_count||0} comments:${p.comments_count||0} shares:${p.shares_count||0}${p.content ? ` | "${p.content.slice(0,80)}"` : ""}`
      ).join("\n");

      const res = await fetch("/api/report/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateFrom, dateTo, accountName, interactionsSummary, commentContent, postsSummary, totalInteractions: (iData || []).length }),
      });
      const d = await res.json();
      if (d.insights) setInsights(d.insights);
    } catch (e) {
      console.error("Report load error:", e);
    } finally {
      setDataLoading(false);
      setInsLoading(false);
    }
  }

  async function downloadPNG() {
    if (!reportRef.current || exporting) return;
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(reportRef.current, {
        useCORS: true, scale: 2, backgroundColor: "#ffffff", logging: false,
      });
      const a = document.createElement("a");
      const name = (accountName || "report").replace(/\s+/g, "-").toLowerCase();
      a.download = `${name}-${dateFrom || "report"}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    } catch (e) { console.error("Export failed:", e); }
    finally { setExporting(false); }
  }

  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const loading = dataLoading || insLoading;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "24px 16px", overflowY: "auto",
    }}>
      {/* Action bar */}
      <div style={{
        width: "100%", maxWidth: 980, display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 16, flexShrink: 0,
      }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={downloadPNG}
            disabled={loading || exporting}
            style={{
              fontFamily: sans, fontSize: 13, fontWeight: 600,
              background: ACCENT, color: "#fff", border: "none",
              borderRadius: 8, padding: "9px 18px", cursor: (loading || exporting) ? "default" : "pointer",
              opacity: (loading || exporting) ? 0.6 : 1, display: "flex", alignItems: "center", gap: 6,
            }}>
            {exporting ? "Exporting…" : loading ? "Loading…" : "⬇ Download PNG"}
          </button>
        </div>
        <button onClick={onClose} style={{
          fontFamily: sans, fontSize: 20, color: "#fff", background: "none",
          border: "none", cursor: "pointer", lineHeight: 1, padding: 4,
        }}>✕</button>
      </div>

      {/* ── THE REPORT ─────────────────────────────────────────────────────── */}
      <div ref={reportRef} style={{
        width: 980, background: "#ffffff", borderRadius: 16,
        overflow: "hidden", fontFamily: sans,
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
      }}>

        {/* Header */}
        <div style={{ background: ACCENT, padding: "28px 40px 24px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.75)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                Social Intelligence Report
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                {accountName || "Social Report"}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                {fmtRange(dateFrom, dateTo)}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>
                Generated {today}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "32px 40px", display: "flex", flexDirection: "column", gap: 32 }}>

          {/* Notable Interactions */}
          {(interactions.length > 0 || dataLoading) && (
            <div>
              <SectionLabel>Active in your network</SectionLabel>
              {dataLoading ? (
                <div style={{ textAlign: "center", padding: "32px", color: "#A8A39C", fontFamily: sans, fontSize: 13 }}>
                  Loading interactions…
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {interactions.map(item => <InteractionCard key={item.id} item={item} />)}
                </div>
              )}
            </div>
          )}

          {/* Top Posts */}
          {(posts.length > 0 || dataLoading) && (
            <div>
              <SectionLabel>Top posts this period</SectionLabel>
              {dataLoading ? (
                <div style={{ textAlign: "center", padding: "32px", color: "#A8A39C", fontFamily: sans, fontSize: 13 }}>
                  Loading posts…
                </div>
              ) : posts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#A8A39C", fontFamily: sans, fontSize: 13 }}>
                  No posts in this date range
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {posts.map(p => <PostCard key={p.id} post={p} />)}
                </div>
              )}
            </div>
          )}

          {/* AI Insights */}
          <div>
            <SectionLabel>AI-generated insights</SectionLabel>
            {insLoading ? (
              <div style={{ textAlign: "center", padding: "20px", color: "#A8A39C", fontFamily: sans, fontSize: 13 }}>
                Generating insights…
              </div>
            ) : !insights ? (
              <div style={{ textAlign: "center", padding: "20px", color: "#A8A39C", fontFamily: sans, fontSize: 13 }}>
                Could not generate insights
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {insights.map((item, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 14, alignItems: "flex-start",
                    background: "#FFF8F5", border: "1px solid #FFD4C2",
                    borderRadius: 10, padding: "14px 18px",
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                      background: ACCENT, display: "flex", alignItems: "center",
                      justifyContent: "center", fontFamily: sans, fontSize: 13,
                      fontWeight: 800, color: "#fff", marginTop: 1,
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ fontFamily: sans, fontSize: 13, color: "#1A1816", lineHeight: 1.6, flex: 1 }}>
                      {item.insight}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            borderTop: "1px solid #E8E6E1", paddingTop: 16,
            display: "flex", alignItems: "center", justifyContent: "flex-end",
          }}>
            <div style={{ fontFamily: sans, fontSize: 11, color: "#A8A39C", fontWeight: 600, letterSpacing: "0.04em" }}>
              AUDIAN
            </div>
          </div>

        </div>
      </div>

      {/* bottom padding */}
      <div style={{ height: 40, flexShrink: 0 }} />
    </div>
  );
}
