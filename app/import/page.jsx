"use client";
import { useState, useCallback, useRef, useEffect } from "react";

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
  ELITE:        { bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
  INFLUENTIAL: { bg: "#FFF3EE", color: "#FF6B35", border: "#FFD4C2" },
  SIGNAL:       { bg: "#F3F2F0", color: "#6B6560", border: "#E8E6E1" },
};
const INTERACTION_ICONS = {
  like: "♥", follow: "👤", comment: "💬", mention: "@",
  tag: "🏷", view: "👁", unknown: "?",
};

function ZoneBadge({ zone }) {
  const c = ZONE_COLORS[zone] || ZONE_COLORS.SIGNAL;
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
// ── Inline editable cell ─────────────────────────────────────────────────────
function EditableCell({ value, onChange, type = "text", placeholder = "—", width, options }) {
  const [focused, setFocused] = useState(false);
  if (options) return (
    <select value={value || ""} onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{ fontFamily: sans, fontSize: F.sm, padding: "4px 6px", borderRadius: 6,
        border: `1px solid ${focused ? T.accent : T.border}`,
        background: T.card, color: T.text, cursor: "pointer" }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
  if (type === "checkbox") return (
    <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)}
      style={{ width: 16, height: 16, cursor: "pointer", accentColor: T.accent }} />
  );
  const empty = value === null || value === undefined || value === "";
  return (
    <input
      type={type} value={value ?? ""} placeholder={placeholder}
      onChange={e => onChange(type === "number"
        ? (e.target.value === "" ? null : parseInt(e.target.value) || null)
        : e.target.value)}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{ fontFamily: sans, fontSize: F.sm, padding: "4px 8px", borderRadius: 6,
        border: `1px solid ${focused ? T.accent : empty ? "transparent" : T.border}`,
        background: focused ? T.card : empty ? "transparent" : T.well,
        color: empty ? T.dim : T.text, width: width || (type === "number" ? 80 : 130),
        outline: "none", transition: "border 0.12s, background 0.12s", cursor: "text" }}
    />
  );
}

// ── Single interaction row — 4 columns: Handle, Category, Followers, Type ────
function InteractionRow({ item, index, onChange, onRemove }) {
  const zoneColor = ZONE_COLORS[item.zone] || ZONE_COLORS.SIGNAL;
  return (
    <tr style={{ borderBottom: `1px solid ${T.border}` }}>
      <td style={{ width: 4, padding: 0, background: zoneColor.color }} />

      {/* Handle — link + verified badge + display name below */}
      <td style={{ padding: "9px 12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <a href={`https://instagram.com/${item.handle}`} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.accent, textDecoration: "none" }}
              onMouseEnter={e => e.target.style.textDecoration = "underline"}
              onMouseLeave={e => e.target.style.textDecoration = "none"}>
              @{item.handle}
            </a>
            {item.verified && <span title="Verified" style={{ color: "#1D9BF0", fontSize: 12 }}>✓</span>}
            {item._autofilled && <span title="Known from your Elite list" style={{ color: T.accent, fontSize: 11, fontWeight: 700 }}>★</span>}
          </div>
          {/* Display name inline editable */}
          <EditableCell value={item.name} placeholder="add name"
            onChange={v => onChange(index, "name", v)} width={130} />
        </div>
      </td>

      {/* Category — dropdown */}
      <td style={{ padding: "9px 12px" }}>
        <EditableCell value={item.zone}
          onChange={v => onChange(index, "zone", v)}
          options={["ELITE","INFLUENTIAL","SIGNAL"]} />
      </td>

      {/* Followers — inline editable number */}
      <td style={{ padding: "9px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <EditableCell value={item.followers} type="number" placeholder="—"
            onChange={v => onChange(index, "followers", v)} width={75} />
          {item._enriched === true && item.followers &&
            <span title="Looked up from Instagram" style={{ fontSize: 9, color: T.green }}>✓</span>}
          {item._enriched === false &&
            <span title="Profile not found / private" style={{ fontSize: 9, color: T.dim }}>?</span>}
        </div>
      </td>

      {/* Type — dropdown */}
      <td style={{ padding: "9px 12px" }}>
        <EditableCell value={item.interaction_type}
          onChange={v => onChange(index, "interaction_type", v)}
          options={["follow","like","mention","comment","tag","view"]} />
      </td>

      {/* Remove */}
      <td style={{ padding: "9px 12px" }}>
        <button onClick={() => onRemove(index)}
          onMouseEnter={e => e.currentTarget.style.color = T.red}
          onMouseLeave={e => e.currentTarget.style.color = T.dim}
          style={{ background: "transparent", border: "none", color: T.dim,
            cursor: "pointer", fontSize: 18, padding: "0 4px", lineHeight: 1,
            transition: "color 0.1s" }}>×</button>
      </td>
    </tr>
  );
}

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
          {["ELITE","INFLUENTIAL","SIGNAL"].map(z => {
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
    interaction_type: "like", zone: "SIGNAL", content: "", platform: "instagram",
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
      interaction_type: "like", zone: "SIGNAL", content: "", platform: "instagram" });
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
      {/* Handle */}
      <td style={{ padding: "8px 12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: T.dim, fontSize: F.xs }}>@</span>
            {inp("handle", "handle", "text", 110)}
          </div>
          {inp("name", "Display name", "text", 120)}
        </div>
      </td>
      {/* Category */}
      <td style={{ padding: "8px 12px" }}>
        <select value={form.zone} onChange={e => set("zone", e.target.value)}
          style={{ fontFamily: sans, fontSize: F.sm, padding: "6px 8px", borderRadius: 8,
            border: `1px solid ${T.border2}`, background: T.card, color: T.text }}>
          {["ELITE","INFLUENTIAL","SIGNAL"].map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </td>
      {/* Followers */}
      <td style={{ padding: "8px 12px" }}>{inp("followers", "—", "number", 80)}</td>
      {/* Type */}
      <td style={{ padding: "8px 12px" }}>
        <select value={form.interaction_type} onChange={e => set("interaction_type", e.target.value)}
          style={{ fontFamily: sans, fontSize: F.sm, padding: "6px 8px", borderRadius: 8,
            border: `1px solid ${T.border2}`, background: T.card, color: T.text }}>
          {["follow","like","mention","comment","tag","view"].map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </td>
      {/* Add */}
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
  const [eliteProfiles, setEliteProfiles] = useState({}); // handle → profile data

  // Load known elite profiles on mount for autofill
  useEffect(() => {
    fetch("/api/elite/profiles")
      .then(r => r.json())
      .then(d => { if (d.profiles) setEliteProfiles(d.profiles); })
      .catch(() => {});
  }, []);

  // Autofill helper — merges elite profile data into a parsed interaction
  const autofillElite = (interaction) => {
    const h = (interaction.handle || "").toLowerCase().replace(/^@/, "");
    const known = eliteProfiles[h];
    if (!known) return interaction;
    return {
      ...interaction,
      name:        known.name     || interaction.name,
      followers:   known.followers ?? interaction.followers,
      verified:    known.verified  ?? interaction.verified,
      avatar_url:  known.avatar_url || interaction.avatar_url,
      zone:        "ELITE",          // always ELITE if on the list
      on_watchlist: true,
      _autofilled: true,
    };
  };

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
        for (const rawItem of newInteractions) {
          // Autofill known elite profile data before merging
          const item = autofillElite(rawItem);
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
            const merged = {
              ...existing,
              followers: item.followers || existing.followers,
              verified: item.verified || existing.verified,
              interaction_type: allTypes,
            };
            // Zone: elite list wins, then follower threshold
            merged.zone = item.on_watchlist ? "ELITE" :
              ((merged.followers || 0) >= 10000 || (merged.verified && (merged.followers || 0) >= 1000))
                ? "INFLUENTIAL" : existing.zone;
            map.set(key, merged);
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
        const followers = parseInt(key === "followers" ? value : item.followers) || 0;
        const verified = key === "verified" ? value : item.verified;
        // Follower count is primary; verified alone (with tiny audience) = SIGNAL
        updated[index].zone = followers >= 10000 ? "INFLUENTIAL" :
          (verified && followers >= 1000) ? "INFLUENTIAL" : "SIGNAL";
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
    ELITE:        allInteractions.filter(i => i.zone === "ELITE").length,
    INFLUENTIAL: allInteractions.filter(i => i.zone === "INFLUENTIAL").length,
    SIGNAL:       allInteractions.filter(i => i.zone === "SIGNAL").length,
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
                {["ALL", "ELITE", "INFLUENTIAL", "SIGNAL"].map(z => {
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
                    {["Handle","Category","Followers","Type",""].map(h => (
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
