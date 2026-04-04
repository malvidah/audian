"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
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

function fmtDateTime(isoStr) {
  if (!isoStr) return "";
  return new Date(isoStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

const PLAT_LABEL = { youtube: "YouTube", x: "X", instagram: "Instagram", linkedin: "LinkedIn" };
const PLAT_COLOR = { instagram: "#E1306C", x: "#000000", linkedin: "#0A66C2", youtube: "#FF0000" };

const INSIGHT_COLORS = [
  { border: "#FFD4C2", bg: "#FFF7F4", accent: "#FF6B35", num: "#FF6B35" },
  { border: "#BFDBFE", bg: "#F0F7FF", accent: "#2563EB", num: "#2563EB" },
  { border: "#BBF7D0", bg: "#F0FDF7", accent: "#16A34A", num: "#16A34A" },
];

// ─── Export helper ────────────────────────────────────────────────────────────
function ExportIconBtn({ wrapperRef, filename }) {
  const [busy, setBusy] = useState(false);
  const [hover, setHover] = useState(false);
  async function handleExport() {
    if (!wrapperRef?.current) return;
    setBusy(true);
    try {
      await new Promise(r => setTimeout(r, 150));
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(wrapperRef.current, {
        useCORS: true, scale: 2, backgroundColor: "#FFFFFF", logging: false,
      });
      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally { setBusy(false); }
  }
  return (
    <button onClick={handleExport} disabled={busy} title="Export as image"
      data-html2canvas-ignore="true"
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

// ─── Insight cards ────────────────────────────────────────────────────────────
function InsightCards({ insights }) {
  return (
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
                color: c.accent, letterSpacing: "0.06em", flexShrink: 0, marginTop: 2,
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
            <div style={{ fontFamily: sans, fontSize: F.xs, color: T.sub, lineHeight: 1.6 }}>
              {ins.insight}
            </div>

            {/* Content pieces */}
            {ins.content_pieces && ins.content_pieces.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontFamily: sans, fontSize: 10, fontWeight: 700, color: T.dim,
                  letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>
                  Content
                </div>
                {ins.content_pieces.map((cp, ci) => (
                  <a key={ci} href={cp.permalink || "#"} target="_blank" rel="noreferrer"
                    style={{ textDecoration: "none" }}>
                    <div style={{
                      background: "#fff", border: `1px solid ${T.border}`,
                      borderRadius: 8, padding: "8px 12px",
                      display: "flex", alignItems: "flex-start", gap: 8,
                      transition: "border-color 0.12s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = c.accent}
                      onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
                    >
                      <div style={{
                        width: 6, height: 6, borderRadius: "50%", flexShrink: 0, marginTop: 5,
                        background: PLAT_COLOR[cp.platform] || T.dim,
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: sans, fontSize: F.xs, color: T.text,
                          lineHeight: 1.4, overflow: "hidden", display: "-webkit-box",
                          WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          {cp.snippet}
                        </div>
                        <div style={{ fontFamily: sans, fontSize: 10, color: T.dim, marginTop: 3,
                          display: "flex", gap: 8 }}>
                          <span>{PLAT_LABEL[cp.platform] || cp.platform}</span>
                          {cp.date && <span>{cp.date}</span>}
                          {cp.likes && <span>♥ {cp.likes}</span>}
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* Evidence quotes */}
            {ins.evidence && ins.evidence.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontFamily: sans, fontSize: 10, fontWeight: 700, color: T.dim,
                  letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>
                  Comments
                </div>
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
                      <span style={{ fontFamily: sans, fontSize: 11, fontWeight: 600, color: T.sub }}>
                        — {ev.commenter}
                      </span>
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
  );
}

// ─── Audience Insights ────────────────────────────────────────────────────────

function AudienceInsights({ activePlatform, dateFrom, dateTo }) {
  const [savedReports, setSavedReports] = useState([]);   // array of saved DB records
  const [currentIdx,   setCurrentIdx]   = useState(0);    // index into savedReports (0 = most recent)
  const [loading,      setLoading]      = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [deleting,     setDeleting]     = useState(false);
  const [error,        setError]        = useState(null);
  const wrapperRef = useRef(null);

  const platParam = (activePlatform || []).slice().sort().join(",");

  // ── Load saved reports whenever filters change ────────────────────────────
  const loadSaved = useCallback(async () => {
    setLoadingSaved(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (dateFrom)   params.set("dateFrom",  dateFrom);
      if (dateTo)     params.set("dateTo",    dateTo);
      if (platParam)  params.set("platforms", platParam);
      const res  = await fetch(`/api/audience/saved?${params}`);
      const data = await res.json();
      const reports = data.reports || [];
      setSavedReports(reports);
      setCurrentIdx(0);  // most recent first
    } catch {
      setSavedReports([]);
    } finally {
      setLoadingSaved(false);
    }
  }, [dateFrom, dateTo, platParam]);

  useEffect(() => { loadSaved(); }, [loadSaved]);

  // ── Generate new insights ─────────────────────────────────────────────────
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
      // Reload saved reports and jump to the newest (index 0)
      await loadSaved();
      setCurrentIdx(0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Delete a saved report ─────────────────────────────────────────────────
  async function deleteReport(id) {
    setDeleting(true);
    try {
      await fetch(`/api/audience/saved/${id}`, { method: "DELETE" });
      const updated = savedReports.filter(r => r.id !== id);
      setSavedReports(updated);
      setCurrentIdx(prev => Math.min(prev, Math.max(0, updated.length - 1)));
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  }

  const dateLabel = fmtDateRange(dateFrom, dateTo);
  const platLabel = activePlatform?.length > 0
    ? activePlatform.map(p => PLAT_LABEL[p] || p).join(", ") : null;

  const current     = savedReports[currentIdx] || null;
  const insights    = current?.insights || null;
  const reportCount = savedReports.length;

  const slug = `audience-insights-${dateFrom || "all"}-to-${dateTo || "all"}${activePlatform?.length ? `-${activePlatform.join("-")}` : ""}`;

  return (
    <div ref={wrapperRef} style={{
      background: T.card, border: `1px solid ${T.border}`,
      borderRadius: 16, padding: "24px 28px",
      boxShadow: T.shadowSm, marginBottom: 24,
    }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.45} }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 6 }}>
        <div>
          <div style={{ fontFamily: sans, fontSize: F.md, fontWeight: 700, color: T.text, letterSpacing: "-0.01em" }}>
            Audience Insights
          </div>
          <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim, marginTop: 2 }}>
            {dateLabel}{platLabel ? ` · ${platLabel}` : ""}
            {current?.comment_count && (
              <span style={{ marginLeft: 8, color: T.sub }}>· {current.comment_count.toLocaleString()} comments analysed</span>
            )}
          </div>
        </div>

        <div data-html2canvas-ignore="true" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <button
            onClick={generate}
            disabled={loading || loadingSaved}
            style={{
              fontFamily: sans, fontSize: F.xs, fontWeight: 600,
              padding: "7px 16px", borderRadius: 8,
              border: "none", cursor: (loading || loadingSaved) ? "default" : "pointer",
              background: (loading || loadingSaved) ? T.well : T.accent,
              color: (loading || loadingSaved) ? T.dim : "#fff",
              display: "flex", alignItems: "center", gap: 7,
              transition: "opacity 0.15s", opacity: (loading || loadingSaved) ? 0.7 : 1,
              boxShadow: (loading || loadingSaved) ? "none" : "0 1px 3px rgba(255,107,53,0.25)",
            }}
            onMouseEnter={e => { if (!loading && !loadingSaved) e.currentTarget.style.opacity = "0.85"; }}
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
                {reportCount > 0 ? "Regenerate" : "Generate Insights"}
              </>
            )}
          </button>
          {insights && insights.length > 0 && (
            <ExportIconBtn wrapperRef={wrapperRef} filename={slug} />
          )}
        </div>
      </div>

      {/* ── Carousel nav bar (only when multiple reports) ── */}
      {reportCount > 1 && (
        <div data-html2canvas-ignore="true" style={{
          display: "flex", alignItems: "center", gap: 8,
          marginTop: 14, marginBottom: 2,
          padding: "8px 12px",
          background: T.well, borderRadius: 10,
          border: `1px solid ${T.border}`,
        }}>
          {/* Prev */}
          <button
            onClick={() => setCurrentIdx(i => Math.min(i + 1, reportCount - 1))}
            disabled={currentIdx >= reportCount - 1}
            style={{
              width: 26, height: 26, borderRadius: 6, border: `1px solid ${T.border}`,
              background: "transparent", cursor: currentIdx >= reportCount - 1 ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: currentIdx >= reportCount - 1 ? T.border : T.sub,
              transition: "all 0.12s",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7.5 2.5L4.5 6l3 3.5" />
            </svg>
          </button>

          {/* Label */}
          <div style={{ flex: 1, fontFamily: sans, fontSize: F.xs, color: T.sub, textAlign: "center" }}>
            <span style={{ fontWeight: 600, color: T.text }}>Report {reportCount - currentIdx} of {reportCount}</span>
            {current?.created_at && (
              <span style={{ color: T.dim, marginLeft: 8 }}>· Generated {fmtDateTime(current.created_at)}</span>
            )}
          </div>

          {/* Trash */}
          <button
            onClick={() => current && deleteReport(current.id)}
            disabled={deleting}
            title="Delete this report"
            style={{
              width: 26, height: 26, borderRadius: 6, border: `1px solid ${T.border}`,
              background: "transparent", cursor: deleting ? "wait" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: T.dim, transition: "all 0.12s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#DC2626"; e.currentTarget.style.borderColor = "#FECACA"; }}
            onMouseLeave={e => { e.currentTarget.style.color = T.dim; e.currentTarget.style.borderColor = T.border; }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h8M5 3V2h2v1M4.5 5v4M7.5 5v4M3 3l.5 6.5h5L9 3" />
            </svg>
          </button>

          {/* Next */}
          <button
            onClick={() => setCurrentIdx(i => Math.max(i - 1, 0))}
            disabled={currentIdx <= 0}
            style={{
              width: 26, height: 26, borderRadius: 6, border: `1px solid ${T.border}`,
              background: "transparent", cursor: currentIdx <= 0 ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: currentIdx <= 0 ? T.border : T.sub,
              transition: "all 0.12s",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 2.5L7.5 6l-3 3.5" />
            </svg>
          </button>
        </div>
      )}

      {/* Single-report timestamp + trash (when only one report) */}
      {reportCount === 1 && current?.created_at && (
        <div data-html2canvas-ignore="true" style={{
          display: "flex", alignItems: "center", gap: 8,
          marginTop: 10, marginBottom: 2,
        }}>
          <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>
            Generated {fmtDateTime(current.created_at)}
          </div>
          <button
            onClick={() => deleteReport(current.id)}
            disabled={deleting}
            title="Delete this report"
            style={{
              width: 22, height: 22, borderRadius: 5, border: `1px solid ${T.border}`,
              background: "transparent", cursor: deleting ? "wait" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: T.dim, transition: "all 0.12s", marginLeft: 2,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#DC2626"; e.currentTarget.style.borderColor = "#FECACA"; }}
            onMouseLeave={e => { e.currentTarget.style.color = T.dim; e.currentTarget.style.borderColor = T.border; }}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h8M5 3V2h2v1M4.5 5v4M7.5 5v4M3 3l.5 6.5h5L9 3" />
            </svg>
          </button>
        </div>
      )}

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
      {(loading || loadingSaved) && !insights && (
        <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              borderRadius: 12, border: `1px solid ${T.border}`,
              padding: "20px 22px", background: T.well,
              animation: "pulse 1.5s ease-in-out infinite",
            }}>
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
      {!loading && !loadingSaved && !error && !insights && (
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
      {!loading && insights && insights.length > 0 && (
        <InsightCards insights={insights} />
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
