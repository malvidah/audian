"use client";
import React, { useState, useRef, useEffect } from "react";
import PageShell, { T, sans, F } from "../../components/PageShell";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

const PLAT_LABEL = { youtube: "YouTube", x: "X / Twitter", instagram: "Instagram", linkedin: "LinkedIn" };

// Accent colours for each insight card (1, 2, 3)
const INSIGHT_COLORS = [
  { border: "#FFD4C2", bg: "#FFF7F4", accent: "#FF6B35", num: "#FF6B35" },
  { border: "#BFDBFE", bg: "#F0F7FF", accent: "#2563EB", num: "#2563EB" },
  { border: "#BBF7D0", bg: "#F0FDF7", accent: "#16A34A", num: "#16A34A" },
];

// ─── Export helpers ──────────────────────────────────────────────────────────
function ExportIconBtn({ wrapperRef, filename }) {
  const [busy, setBusy] = useState(false);
  const [hover, setHover] = useState(false);
  async function handleExport() {
    if (!wrapperRef?.current) return;
    setBusy(true);
    try {
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
    <button onClick={handleExport} disabled={busy} title="Export as image" data-html2canvas-ignore="true"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: 28, height: 28, borderRadius: 7,
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

// ─── Audience Insights ────────────────────────────────────────────────────────

function AudienceInsights({ activePlatform, dateFrom, dateTo }) {
  const [insights,     setInsights]     = useState(null);   // null | [] | error string
  const [loading,      setLoading]      = useState(false);
  const [commentCount, setCommentCount] = useState(null);
  const [lastFilters,  setLastFilters]  = useState(null);   // filters used for last generation
  const [error,        setError]        = useState(null);
  const wrapperRef = useRef(null);

  const currentFilters = JSON.stringify({ activePlatform, dateFrom, dateTo });
  const filtersChanged = lastFilters !== null && lastFilters !== currentFilters;

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/audience/insights", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ dateFrom, dateTo, platform: activePlatform }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed to generate insights");
      setInsights(data.insights || []);
      setCommentCount(data.commentCount || null);
      setLastFilters(currentFilters);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const dateLabel = fmtDateRange(dateFrom, dateTo);
  const platLabel = activePlatform?.length > 0
    ? activePlatform.map(p => PLAT_LABEL[p] || p).join(", ") : null;

  const slug = `audience-insights-${dateFrom || "all"}-to-${dateTo || "all"}${activePlatform?.length ? `-${activePlatform.join("-")}` : ""}`;

  return (
    <div ref={wrapperRef} style={{
      background: T.card, border: `1px solid ${T.border}`,
      borderRadius: 16, padding: "24px 28px",
      boxShadow: T.shadowSm, marginBottom: 24,
    }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 6 }}>
        <div>
          <div style={{ fontFamily: sans, fontSize: F.md, fontWeight: 700, color: T.text, letterSpacing: "-0.01em" }}>
            Audience Insights
          </div>
          <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim, marginTop: 2 }}>
            {dateLabel}{platLabel ? ` · ${platLabel}` : ""}
            {commentCount !== null && !filtersChanged && (
              <span style={{ marginLeft: 8, color: T.sub }}>· {commentCount.toLocaleString()} comments analysed</span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {filtersChanged && (
            <span style={{
              fontFamily: sans, fontSize: 11, fontWeight: 600, color: "#B45309",
              background: "#FFFBEB", border: "1px solid #FDE68A",
              borderRadius: 6, padding: "3px 8px",
            }}>
              Filters changed
            </span>
          )}
          <button
            onClick={generate}
            disabled={loading}
            style={{
              fontFamily: sans, fontSize: F.xs, fontWeight: 600,
              padding: "7px 16px", borderRadius: 8,
              border: "none", cursor: loading ? "default" : "pointer",
              background: loading ? T.well : T.accent,
              color: loading ? T.dim : "#fff",
              display: "flex", alignItems: "center", gap: 7,
              transition: "opacity 0.15s", opacity: loading ? 0.7 : 1,
              boxShadow: loading ? "none" : "0 1px 3px rgba(255,107,53,0.25)",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
          >
            {loading ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Analysing…
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                {insights ? "Regenerate" : "Generate Insights"}
              </>
            )}
          </button>
          {insights && insights.length > 0 && (
            <ExportIconBtn wrapperRef={wrapperRef} filename={slug} />
          )}
        </div>
      </div>

      {/* ── Spinner CSS ── */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* ── Error ── */}
      {error && (
        <div style={{
          marginTop: 20, background: "#FEF2F2", border: "1px solid #FECACA",
          borderRadius: 10, padding: "14px 18px",
          fontFamily: sans, fontSize: F.xs, color: "#DC2626",
        }}>
          {error === "No comment data found for this period"
            ? "No comments or mentions found for this date range and platform. Try widening the filters."
            : `Error: ${error}`}
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && !insights && (
        <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              borderRadius: 12, border: `1px solid ${T.border}`,
              padding: "20px 22px", background: T.well,
              animation: "pulse 1.5s ease-in-out infinite",
            }}>
              <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.45} }`}</style>
              <div style={{ height: 14, background: T.border, borderRadius: 4, width: "60%", marginBottom: 12 }} />
              <div style={{ height: 10, background: T.border, borderRadius: 4, width: "100%", marginBottom: 6 }} />
              <div style={{ height: 10, background: T.border, borderRadius: 4, width: "80%", marginBottom: 6 }} />
              <div style={{ height: 10, background: T.border, borderRadius: 4, width: "90%", marginBottom: 18 }} />
              <div style={{ height: 9, background: T.border, borderRadius: 4, width: "70%", marginBottom: 5 }} />
              <div style={{ height: 9, background: T.border, borderRadius: 4, width: "55%"}} />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty prompt ── */}
      {!loading && !error && !insights && (
        <div style={{
          marginTop: 28, padding: "40px 0", textAlign: "center",
          borderTop: `1px solid ${T.border}`,
        }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>💬</div>
          <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text, marginBottom: 6 }}>
            Discover what your audience is saying
          </div>
          <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim, maxWidth: 360, margin: "0 auto", lineHeight: 1.6 }}>
            Claude reads every comment and mention in the selected date range and surfaces 3 specific insights — with direct quotes as evidence.
          </div>
        </div>
      )}

      {/* ── Insight cards ── */}
      {insights && insights.length > 0 && (
        <div style={{
          marginTop: 24,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
          gap: 16,
        }}>
          {insights.map((ins, idx) => {
            const c = INSIGHT_COLORS[idx % INSIGHT_COLORS.length];
            return (
              <div key={idx} style={{
                borderRadius: 12,
                border: `1px solid ${c.border}`,
                background: c.bg,
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}>
                {/* Number + title */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{
                    fontFamily: sans, fontSize: 11, fontWeight: 800,
                    color: c.accent, letterSpacing: "0.06em", flexShrink: 0,
                    marginTop: 2,
                  }}>
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div style={{
                    fontFamily: sans, fontSize: F.sm, fontWeight: 700,
                    color: T.text, lineHeight: 1.3,
                  }}>
                    {ins.title}
                  </div>
                </div>

                {/* Insight body */}
                <div style={{
                  fontFamily: sans, fontSize: F.xs, color: T.sub,
                  lineHeight: 1.6,
                }}>
                  {ins.insight}
                </div>

                {/* Evidence quotes */}
                {ins.evidence && ins.evidence.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {ins.evidence.map((ev, ei) => (
                      <div key={ei} style={{
                        background: "#fff",
                        border: `1px solid ${c.border}`,
                        borderLeft: `3px solid ${c.accent}`,
                        borderRadius: "0 8px 8px 0",
                        padding: "10px 12px",
                      }}>
                        <div style={{
                          fontFamily: sans, fontSize: F.xs, color: T.text,
                          lineHeight: 1.5, fontStyle: "italic", marginBottom: 5,
                        }}>
                          "{ev.quote}"
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span style={{
                            fontFamily: sans, fontSize: 11, fontWeight: 600, color: T.sub,
                          }}>
                            — {ev.commenter}
                          </span>
                          {ev.followers && ev.followers !== "0" && (
                            <span style={{
                              fontFamily: sans, fontSize: 10, color: T.dim,
                              background: T.well, borderRadius: 4, padding: "1px 6px",
                              border: `1px solid ${T.border}`,
                            }}>
                              {ev.followers} followers
                            </span>
                          )}
                          {ev.type && (
                            <span style={{
                              fontFamily: sans, fontSize: 10, color: c.accent,
                              background: c.bg, borderRadius: 4, padding: "1px 6px",
                              border: `1px solid ${c.border}`, fontWeight: 600,
                              textTransform: "capitalize",
                            }}>
                              {ev.type}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AudiencePage() {
  return (
    <PageShell activeTab="audience">
      {({ activePlatform, dateFrom, dateTo }) => (
        <AudienceInsights
          activePlatform={activePlatform}
          dateFrom={dateFrom}
          dateTo={dateTo}
        />
      )}
    </PageShell>
  );
}
