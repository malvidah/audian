"use client";
import { useState, useCallback, useRef } from "react";

// ── Design tokens (match Dashboard) ──────────────────────────────────────────
const T = {
  bg: "#F8F7F5", card: "#FFFFFF", well: "#F3F2F0",
  border: "#E8E6E1", border2: "#D6D3CC",
  text: "#1A1816", sub: "#6B6560", dim: "#A8A39C",
  accent: "#FF6B35", accentBg: "#FFF3EE", accentBorder: "#FFD4C2",
  green: "#16A34A", greenBg: "#F0FDF4",
  red: "#DC2626", redBg: "#FEF2F2",
  purple: "#7C3AED", purpleBg: "#F5F3FF",
  shadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 24px rgba(0,0,0,0.08)",
};
const sans = "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif";
const F = { xl: 28, lg: 18, md: 15, sm: 13, xs: 11 };

const ZONE_COLORS = {
  CORE:        { bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
  INFLUENTIAL: { bg: "#FFF3EE", color: "#FF6B35", border: "#FFD4C2" },
  RADAR:       { bg: "#F3F2F0", color: "#6B6560", border: "#E8E6E1" },
};
const INTERACTION_ICONS = {
  like: "♥", follow: "👤", comment: "💬", mention: "@",
  tag: "🏷", view: "👁", unknown: "?",
};

function ZoneBadge({ zone }) {
  const c = ZONE_COLORS[zone] || ZONE_COLORS.RADAR;
  return (
    <span style={{
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      borderRadius: 6, padding: "2px 8px", fontSize: F.xs, fontWeight: 700,
      fontFamily: sans, whiteSpace: "nowrap",
    }}>{zone}</span>
  );
}

function Btn({ onClick, disabled, children, variant = "primary", style = {} }) {
  const [hov, setHov] = useState(false);
  const styles = {
    primary:   { background: T.accent, color: "#fff" },
    secondary: { background: T.well, color: T.text, border: `1px solid ${T.border}` },
    ghost:     { background: hov ? T.well : "transparent", color: T.sub, border: `1px solid ${hov ? T.border : "transparent"}` },
    danger:    { background: hov ? T.redBg : "transparent", color: T.red, border: `1px solid ${T.red}33` },
  };
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        ...styles[variant],
        fontFamily: sans, fontSize: F.sm, fontWeight: 600,
        padding: "7px 14px", borderRadius: 8, border: "none",
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
        transition: "all 0.15s", display: "inline-flex", alignItems: "center", gap: 6,
        ...style,
      }}
    >{children}</button>
  );
}

// ── Drop Zone ─────────────────────────────────────────────────────────────────
function DropZone({ onFiles, disabled }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFiles = useCallback((files) => {
    const imgs = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (imgs.length) onFiles(imgs);
  }, [onFiles]);

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      style={{
        border: `2px dashed ${dragging ? T.accent : T.border2}`,
        borderRadius: 14, padding: "48px 32px", textAlign: "center",
        background: dragging ? T.accentBg : T.well,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s",
      }}
    >
      <div style={{ fontSize: 40, marginBottom: 12 }}>📸</div>
      <div style={{ fontFamily: sans, fontSize: F.md, fontWeight: 600, color: T.text, marginBottom: 6 }}>
        Drop Instagram screenshots here
      </div>
      <div style={{ fontFamily: sans, fontSize: F.sm, color: T.sub, marginBottom: 16, lineHeight: 1.6 }}>
        Notifications, likers, followers, comments, story viewers<br />
        Drop as many as you want — all parsed at once
      </div>
      <div style={{
        display: "inline-block", background: T.accent, color: "#fff",
        borderRadius: 8, padding: "8px 20px", fontFamily: sans,
        fontSize: F.sm, fontWeight: 600,
      }}>
        Or click to browse
      </div>
      <input
        ref={inputRef} type="file" multiple accept="image/*"
        style={{ display: "none" }}
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  );
}

// ── Single interaction row (editable) ────────────────────────────────────────
function InteractionRow({ item, index, onChange, onRemove }) {
  const [editing, setEditing] = useState(false);

  const field = (key, value, type = "text", options = null) => {
    if (!editing) {
      if (key === "followers") return value
        ? <span style={{ fontFamily: sans, fontSize: F.sm, color: T.text, fontWeight: 500 }}>
            {value >= 1000000 ? (value/1000000).toFixed(1)+"M" : value >= 1000 ? (value/1000).toFixed(1)+"K" : value}
          </span>
        : <span style={{ color: T.dim, fontSize: F.xs }}>—</span>;
      if (key === "zone") return <ZoneBadge zone={value} />;
      if (key === "interaction_type") return (
        <span style={{ fontFamily: sans, fontSize: F.sm, color: T.sub }}>
          {INTERACTION_ICONS[value] || "?"} {value}
        </span>
      );
      if (key === "verified") return value ?
        <span style={{ color: "#1D9BF0", fontSize: 14 }}>✓</span> :
        <span style={{ color: T.dim, fontSize: 12 }}>—</span>;
      return <span style={{ fontFamily: sans, fontSize: F.sm, color: T.text }}>{value || <span style={{ color: T.dim }}>—</span>}</span>;
    }

    if (options) return (
      <select
        value={value || ""}
        onChange={e => onChange(index, key, e.target.value)}
        style={{ fontFamily: sans, fontSize: F.sm, padding: "3px 6px", borderRadius: 6, border: `1px solid ${T.border2}`, background: T.card, color: T.text }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );

    if (type === "checkbox") return (
      <input type="checkbox" checked={!!value}
        onChange={e => onChange(index, key, e.target.checked)}
        style={{ width: 16, height: 16, cursor: "pointer" }}
      />
    );

    return (
      <input
        type={type} value={value || ""}
        onChange={e => onChange(index, key, type === "number" ? parseInt(e.target.value) || null : e.target.value)}
        style={{
          fontFamily: sans, fontSize: F.sm, padding: "3px 8px",
          borderRadius: 6, border: `1px solid ${T.border2}`,
          background: T.card, color: T.text, width: key === "handle" ? 130 : key === "content" ? 200 : 90,
        }}
      />
    );
  };

  const zoneColor = ZONE_COLORS[item.zone] || ZONE_COLORS.RADAR;

  return (
    <tr style={{ borderBottom: `1px solid ${T.border}`, background: item._removed ? T.redBg : "transparent" }}>
      {/* Zone indicator strip */}
      <td style={{ width: 4, padding: 0, background: zoneColor.color }} />

      {/* Handle */}
      <td style={{ padding: "10px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: T.dim, fontSize: F.xs }}>@</span>
          {field("handle", item.handle)}
        </div>
      </td>

      {/* Name */}
      <td style={{ padding: "10px 12px" }}>{field("name", item.name)}</td>

      {/* Followers */}
      <td style={{ padding: "10px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {field("followers", item.followers, "number")}
          {item._enriched === true && item.followers && (
            <span title="Verified from Instagram" style={{ fontSize: 9, color: T.green }}>✓</span>
          )}
          {item._enriched === false && (
            <span title="Profile not found / private" style={{ fontSize: 9, color: T.dim }}>?</span>
          )}
        </div>
      </td>

      {/* Verified */}
      <td style={{ padding: "10px 12px", textAlign: "center" }}>
        {field("verified", item.verified, "checkbox")}
      </td>

      {/* Interaction */}
      <td style={{ padding: "10px 12px" }}>
        {field("interaction_type", item.interaction_type, "text",
          editing ? ["like","follow","comment","mention","tag","view"] : null)}
      </td>

      {/* Zone */}
      <td style={{ padding: "10px 12px" }}>
        {field("zone", item.zone, "text",
          editing ? ["CORE","INFLUENTIAL","RADAR"] : null)}
      </td>

      {/* Content preview */}
      <td style={{ padding: "10px 12px", maxWidth: 220 }}>
        {item.content ? (
          <span style={{ fontFamily: sans, fontSize: F.xs, color: T.sub,
            overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" }}>
            "{item.content}"
          </span>
        ) : <span style={{ color: T.dim, fontSize: F.xs }}>—</span>}
      </td>

      {/* Actions */}
      <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            onClick={() => setEditing(!editing)}
            style={{ background: editing ? T.accentBg : T.well, border: `1px solid ${editing ? T.accentBorder : T.border}`,
              color: editing ? T.accent : T.sub, borderRadius: 6, padding: "3px 8px",
              fontSize: F.xs, fontFamily: sans, cursor: "pointer", fontWeight: 600 }}>
            {editing ? "Done" : "Edit"}
          </button>
          <button
            onClick={() => onRemove(index)}
            style={{ background: "transparent", border: "none", color: T.dim,
              cursor: "pointer", fontSize: 16, padding: "0 4px", lineHeight: 1 }}>
            ×
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Screenshot card (thumbnail + parsed results) ──────────────────────────────
function ScreenshotCard({ result, onRemoveScreenshot }) {
  const [expanded, setExpanded] = useState(true);
  const count = result.interactions.length;

  return (
    <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.border}`,
      boxShadow: T.shadow, overflow: "hidden", marginBottom: 12 }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
          cursor: "pointer", borderBottom: expanded ? `1px solid ${T.border}` : "none" }}>
        {result.preview && (
          <img src={result.preview} alt="" style={{ width: 48, height: 48, objectFit: "cover",
            borderRadius: 8, border: `1px solid ${T.border}` }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text }}>
            {result.filename}
          </div>
          <div style={{ fontFamily: sans, fontSize: F.xs, color: T.sub, marginTop: 2 }}>
            {result.error ? (
              <span style={{ color: T.red }}>⚠ {result.error}</span>
            ) : (
              `${count} interaction${count !== 1 ? "s" : ""} detected`
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Zone summary pills */}
          {["CORE","INFLUENTIAL","RADAR"].map(z => {
            const n = result.interactions.filter(i => i.zone === z).length;
            if (!n) return null;
            const c = ZONE_COLORS[z];
            return (
              <span key={z} style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`,
                borderRadius: 20, padding: "1px 8px", fontSize: F.xs, fontFamily: sans, fontWeight: 600 }}>
                {n} {z}
              </span>
            );
          })}
          <button onClick={e => { e.stopPropagation(); onRemoveScreenshot(); }}
            style={{ background: "none", border: "none", color: T.dim, cursor: "pointer", fontSize: 18, padding: "0 4px" }}>×</button>
          <span style={{ color: T.dim, fontSize: 12 }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>
      {expanded && result.interactions.length === 0 && (
        <div style={{ padding: "24px 18px", textAlign: "center", color: T.dim,
          fontFamily: sans, fontSize: F.sm }}>
          No interactions detected in this screenshot
        </div>
      )}
    </div>
  );
}

// ── Manual add row ────────────────────────────────────────────────────────────
function ManualAddRow({ onAdd }) {
  const [form, setForm] = useState({
    handle: "", name: "", followers: "", verified: false,
    interaction_type: "like", zone: "RADAR", content: "", platform: "instagram",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.handle.trim()) return;
    onAdd({
      ...form,
      handle: form.handle.replace(/^@/, "").trim(),
      followers: form.followers ? parseInt(form.followers) : null,
    });
    setForm({ handle: "", name: "", followers: "", verified: false,
      interaction_type: "like", zone: "RADAR", content: "", platform: "instagram" });
  };

  const inp = (key, placeholder, type = "text", width = 110) => (
    type === "checkbox" ? (
      <input type="checkbox" checked={form[key]}
        onChange={e => set(key, e.target.checked)}
        style={{ width: 16, height: 16 }} />
    ) : (
      <input
        type={type} placeholder={placeholder} value={form[key]}
        onChange={e => set(key, e.target.value)}
        style={{ fontFamily: sans, fontSize: F.sm, padding: "6px 10px",
          border: `1px solid ${T.border2}`, borderRadius: 8,
          background: T.well, color: T.text, width }} />
    )
  );

  return (
    <tr style={{ borderBottom: `1px solid ${T.border}`, background: T.accentBg }}>
      <td style={{ width: 4, background: T.accentBorder, padding: 0 }} />
      <td style={{ padding: "8px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: T.dim, fontSize: F.xs }}>@</span>
          {inp("handle", "handle", "text", 110)}
        </div>
      </td>
      <td style={{ padding: "8px 12px" }}>{inp("name", "Display name", "text", 120)}</td>
      <td style={{ padding: "8px 12px" }}>{inp("followers", "0", "number", 80)}</td>
      <td style={{ padding: "8px 12px", textAlign: "center" }}>{inp("verified", "", "checkbox")}</td>
      <td style={{ padding: "8px 12px" }}>
        <select value={form.interaction_type} onChange={e => set("interaction_type", e.target.value)}
          style={{ fontFamily: sans, fontSize: F.sm, padding: "6px 8px", borderRadius: 8,
            border: `1px solid ${T.border2}`, background: T.card, color: T.text }}>
          {["like","follow","comment","mention","tag","view"].map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </td>
      <td style={{ padding: "8px 12px" }}>
        <select value={form.zone} onChange={e => set("zone", e.target.value)}
          style={{ fontFamily: sans, fontSize: F.sm, padding: "6px 8px", borderRadius: 8,
            border: `1px solid ${T.border2}`, background: T.card, color: T.text }}>
          {["CORE","INFLUENTIAL","RADAR"].map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </td>
      <td style={{ padding: "8px 12px" }}>{inp("content", "Comment text (optional)", "text", 180)}</td>
      <td style={{ padding: "8px 12px" }}>
        <Btn onClick={handleSubmit} style={{ padding: "6px 12px" }}>+ Add</Btn>
      </td>
    </tr>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ImportPage() {
  const [screenshots, setScreenshots] = useState([]); // { filename, preview, interactions, error, parsing }
  const [allInteractions, setAllInteractions] = useState([]); // flat merged list for review
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);
  const [filterZone, setFilterZone] = useState("ALL");
  const [enriching, setEnriching] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState(null);
  const [showManualAdd, setShowManualAdd] = useState(false);

  // Convert file to base64
  const toBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const toPreview = (file) => new Promise((res) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.readAsDataURL(file);
  });

  const handleFiles = async (files) => {
    if (parsing) return;
    setParsing(true);
    setSaveResult(null);

    // Build image objects
    const images = await Promise.all(
      Array.from(files).map(async (f) => ({
        filename: f.name,
        base64: await toBase64(f),
        preview: await toPreview(f),
        mediaType: f.type || "image/jpeg",
      }))
    );

    // Optimistically add to screenshots list as "parsing"
    const pending = images.map(img => ({
      filename: img.filename,
      preview: img.preview,
      interactions: [],
      parsing: true,
      error: null,
    }));
    setScreenshots(prev => [...prev, ...pending]);

    try {
      const res = await fetch("/api/screenshots/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: images.map(i => ({ base64: i.base64, mediaType: i.mediaType, filename: i.filename }))
        }),
      });
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      // Merge results into screenshots
      const results = data.results || [];
      setScreenshots(prev => {
        const updated = [...prev];
        // Replace the pending entries we just added
        for (let i = 0; i < results.length; i++) {
          const idx = updated.findIndex(s => s.filename === results[i].filename && s.parsing);
          if (idx >= 0) {
            updated[idx] = {
              ...updated[idx],
              interactions: results[i].interactions || [],
              error: results[i].error || null,
              parsing: false,
            };
          }
        }
        return updated;
      });

      // Add unique interactions to the flat review list
      const newInteractions = results.flatMap(r =>
        (r.interactions || []).map((item, idx) => ({
          ...item,
          _id: `${r.filename}_${idx}_${Date.now()}`,
          _source: r.filename,
        }))
      );

      setAllInteractions(prev => {
        // Deduplicate by handle — prefer existing, but update if new data has followers
        const map = new Map(prev.map(i => [i.handle?.toLowerCase(), i]));
        for (const item of newInteractions) {
          const key = item.handle?.toLowerCase();
          if (!key) continue;
          if (!map.has(key)) {
            map.set(key, item);
          } else {
            // Merge: keep higher follower count, merge interaction types
            const existing = map.get(key);
            const existTypes = existing.interaction_type ? [existing.interaction_type] : [];
            const newTypes = item.interaction_type ? [item.interaction_type] : [];
            const allTypes = [...new Set([...existTypes, ...newTypes])].join(",");
            map.set(key, {
              ...existing,
              followers: item.followers || existing.followers,
              verified: item.verified || existing.verified,
              interaction_type: allTypes,
              zone: (item.verified || (item.followers || 0) >= 10000) ? "INFLUENTIAL" : existing.zone,
            });
          }
        }
        return Array.from(map.values());
      });

    } catch (e) {
      setScreenshots(prev => prev.map(s =>
        s.parsing ? { ...s, parsing: false, error: e.message } : s
      ));
    }

    setParsing(false);
  };

  const updateInteraction = (index, key, value) => {
    setAllInteractions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      // Auto-update zone if followers or verified changes
      if (key === "followers" || key === "verified") {
        const item = updated[index];
        const followers = key === "followers" ? value : item.followers;
        const verified = key === "verified" ? value : item.verified;
        updated[index].zone = (verified || (followers || 0) >= 10000) ? "INFLUENTIAL" : "RADAR";
      }
      return updated;
    });
  };

  const removeInteraction = (index) => {
    setAllInteractions(prev => prev.filter((_, i) => i !== index));
  };

  const removeScreenshot = (filename) => {
    setScreenshots(prev => prev.filter(s => s.filename !== filename));
    setAllInteractions(prev => prev.filter(i => i._source !== filename));
  };

  const addManual = (item) => {
    const id = `manual_${Date.now()}`;
    setAllInteractions(prev => [...prev, { ...item, _id: id, _source: "manual" }]);
  };

  const enrichAll = async () => {
    const handles = allInteractions.map(i => i.handle).filter(Boolean);
    if (!handles.length) return;
    setEnriching(true);
    setEnrichProgress(`Looking up ${handles.length} profiles…`);
    try {
      // Batch into groups of 10 to show progress
      const BATCH = 10;
      for (let i = 0; i < handles.length; i += BATCH) {
        const batch = handles.slice(i, i + BATCH);
        setEnrichProgress(`Enriching ${i + 1}–${Math.min(i + BATCH, handles.length)} of ${handles.length}…`);
        const res = await fetch("/api/enrich/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handles: batch }),
        });
        const data = await res.json();
        if (data.results) {
          setAllInteractions(prev => {
            const updated = [...prev];
            for (const r of data.results) {
              const idx = updated.findIndex(i => i.handle?.toLowerCase() === r.handle);
              if (idx >= 0) {
                updated[idx] = {
                  ...updated[idx],
                  followers: r.followers ?? updated[idx].followers,
                  name: r.name || updated[idx].name,
                  verified: r.verified ?? updated[idx].verified,
                  zone: r.zone,
                  on_watchlist: r.on_watchlist,
                  bio: r.bio || updated[idx].bio,
                  avatar_url: r.avatar || updated[idx].avatar_url,
                  _enriched: r.found,
                };
              }
            }
            return updated;
          });
        }
      }
      setEnrichProgress(null);
    } catch (e) {
      setEnrichProgress(`Error: ${e.message}`);
    }
    setEnriching(false);
  };

  const handleSave = async () => {
    const toSave = filtered.filter(i => i.handle);
    if (!toSave.length) return;
    setSaving(true);
    setSaveResult(null);
    try {
      const res = await fetch("/api/screenshots/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interactions: toSave }),
      });
      const data = await res.json();
      setSaveResult(data);
    } catch (e) {
      setSaveResult({ error: e.message });
    }
    setSaving(false);
  };

  const filtered = filterZone === "ALL"
    ? allInteractions
    : allInteractions.filter(i => i.zone === filterZone);

  const zoneCounts = {
    CORE:        allInteractions.filter(i => i.zone === "CORE").length,
    INFLUENTIAL: allInteractions.filter(i => i.zone === "INFLUENTIAL").length,
    RADAR:       allInteractions.filter(i => i.zone === "RADAR").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: sans }}>
      {/* Header */}
      <div style={{ background: T.card, borderBottom: `1px solid ${T.border}`,
        padding: "0 32px", display: "flex", alignItems: "center", gap: 16, height: 56 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10,
          textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, background: T.accent, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 15, fontWeight: 800 }}>A</div>
          <span style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 700,
            color: T.text }}>Audian</span>
        </a>
        <span style={{ color: T.border2 }}>›</span>
        <span style={{ fontFamily: sans, fontSize: F.sm, color: T.sub,
          fontWeight: 500 }}>Screenshot Import</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <a href="/" style={{ fontFamily: sans, fontSize: F.sm, color: T.sub,
            textDecoration: "none", padding: "6px 12px", borderRadius: 8,
            border: `1px solid ${T.border}` }}>← Back to Dashboard</a>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 32px 80px" }}>

        {/* Title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: sans, fontSize: F.xl, fontWeight: 700,
            color: T.text, margin: 0, marginBottom: 6 }}>
            Import from Screenshots
          </h1>
          <p style={{ fontFamily: sans, fontSize: F.sm, color: T.sub, margin: 0, lineHeight: 1.6 }}>
            Drop any Instagram screenshots — notifications, likers, followers, comments.<br />
            Claude reads each one and extracts interactions. Review and edit before saving.
          </p>
        </div>

        {/* Drop zone */}
        <div style={{ marginBottom: 28 }}>
          <DropZone onFiles={handleFiles} disabled={parsing} />
          {parsing && (
            <div style={{ textAlign: "center", marginTop: 16, fontFamily: sans,
              fontSize: F.sm, color: T.sub }}>
              <span style={{ display: "inline-block", animation: "spin 1s linear infinite",
                marginRight: 8 }}>⟳</span>
              Parsing screenshots with Claude Vision…
            </div>
          )}
        </div>

        {/* Screenshot cards */}
        {screenshots.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: sans, fontSize: F.xs, fontWeight: 600,
              color: T.dim, textTransform: "uppercase", letterSpacing: "0.06em",
              marginBottom: 12 }}>
              {screenshots.length} screenshot{screenshots.length !== 1 ? "s" : ""} processed
            </div>
            {screenshots.map(s => (
              <ScreenshotCard
                key={s.filename + s.preview}
                result={s}
                onRemoveScreenshot={() => removeScreenshot(s.filename)}
              />
            ))}
          </div>
        )}

        {/* Review table */}
        {allInteractions.length > 0 && (
          <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`,
            boxShadow: T.shadow, overflow: "hidden" }}>

            {/* Table header */}
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`,
              display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ fontFamily: sans, fontSize: F.lg, fontWeight: 700, color: T.text }}>
                Review Interactions
                <span style={{ marginLeft: 8, background: T.well, color: T.sub,
                  borderRadius: 20, padding: "2px 10px", fontSize: F.xs }}>{allInteractions.length}</span>
              </div>

              {/* Zone filter */}
              <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
                {["ALL", "CORE", "INFLUENTIAL", "RADAR"].map(z => {
                  const active = filterZone === z;
                  const c = z === "ALL" ? null : ZONE_COLORS[z];
                  return (
                    <button key={z} onClick={() => setFilterZone(z)}
                      style={{
                        fontFamily: sans, fontSize: F.xs, fontWeight: 600, cursor: "pointer",
                        border: `1px solid ${active ? (c?.border || T.accent) : T.border}`,
                        background: active ? (c?.bg || T.accentBg) : "transparent",
                        color: active ? (c?.color || T.accent) : T.sub,
                        borderRadius: 20, padding: "3px 10px",
                      }}>
                      {z === "ALL" ? `All ${allInteractions.length}` : `${z} ${zoneCounts[z]}`}
                    </button>
                  );
                })}
              </div>

              <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                <Btn variant="ghost" onClick={() => setShowManualAdd(!showManualAdd)}
                  style={{ fontSize: F.xs }}>
                  {showManualAdd ? "− Manual entry" : "+ Manual entry"}
                </Btn>
                <Btn variant="secondary" onClick={enrichAll} disabled={enriching || allInteractions.length === 0}
                  style={{ fontSize: F.xs }}>
                  {enriching ? enrichProgress || "Enriching…" : `🔍 Lookup ${allInteractions.length} profiles`}
                </Btn>
                {saveResult?.saved > 0 && (
                  <span style={{ fontFamily: sans, fontSize: F.sm, color: T.green, fontWeight: 600 }}>
                    ✓ {saveResult.saved} saved to Audian
                  </span>
                )}
                {saveResult?.error && (
                  <span style={{ fontFamily: sans, fontSize: F.sm, color: T.red }}>
                    ✗ {saveResult.error}
                  </span>
                )}
                <Btn onClick={handleSave} disabled={saving || filtered.length === 0}>
                  {saving ? "Saving…" : `💾 Save ${filtered.length} to Audian`}
                </Btn>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: T.well }}>
                    <th style={{ width: 4, padding: 0 }} />
                    {["Handle","Name","Followers","Verified","Type","Zone","Comment",""].map(h => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "left",
                        fontFamily: sans, fontSize: F.xs, fontWeight: 600,
                        color: T.dim, textTransform: "uppercase", letterSpacing: "0.05em",
                        whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {showManualAdd && (
                    <ManualAddRow onAdd={addManual} />
                  )}
                  {filtered.map((item, i) => (
                    <InteractionRow
                      key={item._id || i}
                      item={item}
                      index={allInteractions.indexOf(item)}
                      onChange={updateInteraction}
                      onRemove={removeInteraction}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div style={{ padding: "12px 20px", borderTop: `1px solid ${T.border}`,
              display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>
                Click any row's Edit button to modify. Remove rows with ×. Add manually with + Manual entry.
              </div>
              <Btn onClick={handleSave} disabled={saving || filtered.length === 0}>
                {saving ? "Saving…" : `💾 Save ${filtered.length} interactions`}
              </Btn>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!parsing && screenshots.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: T.dim }}>
            <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>📱</div>
            <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 500 }}>
              Drop your Instagram screenshots above to get started
            </div>
            <div style={{ fontFamily: sans, fontSize: F.xs, marginTop: 8, lineHeight: 1.6 }}>
              Works best with: Activity/Notifications feed · Post likers · Follower lists · Comment sections
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
