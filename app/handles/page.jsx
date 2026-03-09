"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const sans = "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif";
const T = {
  bg: "#0B0C0F", card: "#13141A", well: "#1A1C23", border: "#2A2D38",
  text: "#F0EDE8", sub: "#9B9590", dim: "#5A5650",
  accent: "#FF6B35", accentBg: "#1A1108", accentBorder: "#5A2A0C",
  green: "#22C55E", greenBg: "#0A1F10",
  red: "#EF4444", redBg: "#1F0A0A",
  purple: "#A78BFA", purpleBg: "#130E24",
  blue: "#60A5FA", blueBg: "#0A1020",
  shadow: "0 2px 8px rgba(0,0,0,0.4)",
};
const F = { xl: 26, lg: 17, md: 14, sm: 12, xs: 11 };
const ZONES = ["ALL","ELITE","INFLUENTIAL","SIGNAL","IGNORE"];
const ZC = {
  ELITE:       { color: T.purple, bg: T.purpleBg, border: "#3D3060" },
  INFLUENTIAL: { color: T.accent, bg: T.accentBg, border: T.accentBorder },
  SIGNAL:      { color: T.sub,    bg: T.well,     border: T.border },
  IGNORE:      { color: "#555",   bg: T.redBg,    border: "#3A1A1A" },
};
const PLAT_ICON  = { instagram: "📸", x: "𝕏", youtube: "▶", linkedin: "in" };
const PLAT_COLOR = { instagram: "#E1306C", x: "#ccc", youtube: "#FF0000", linkedin: "#0A66C2" };
const PLAT_URL   = {
  instagram: h => `https://instagram.com/${h}`,
  x:         h => `https://x.com/${h}`,
  youtube:   h => `https://youtube.com/@${h}`,
  linkedin:  h => `https://linkedin.com/in/${h}`,
};

function fmt(n) {
  if (!n) return null;
  if (n >= 1_000_000) return (n/1_000_000).toFixed(1).replace(/\.0$/,"")+"M";
  if (n >= 1_000)     return (n/1_000).toFixed(1).replace(/\.0$/,"")+"K";
  return n.toLocaleString();
}
function timeAgo(ts) {
  if (!ts) return null;
  const d = Math.floor((Date.now()-new Date(ts))/86400000);
  if (d===0) return "today"; if (d===1) return "yesterday";
  if (d<30)  return `${d}d ago`; if (d<365) return `${Math.floor(d/30)}mo ago`;
  return `${Math.floor(d/365)}y ago`;
}

// ── CSV Drop Zone ────────────────────────────────────────────────────────────
function CSVDrop({ onFile, uploading, uploadMsg }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef();
  const handle = (files) => {
    const csv = Array.from(files).find(f => f.name.endsWith(".csv") || f.name.endsWith(".txt"));
    if (csv) onFile(csv);
  };
  return (
    <div
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDrag(false); }}
      onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
      onClick={() => !uploading && ref.current?.click()}
      style={{
        border: `2px dashed ${drag ? T.accent : uploading ? T.border : "#2A2D38"}`,
        borderRadius: 14, padding: "28px 32px",
        background: drag ? T.accentBg : T.well,
        cursor: uploading ? "default" : "pointer",
        transition: "all 0.2s",
        display: "flex", alignItems: "center", gap: 20,
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12, background: T.card,
        border: `1px solid ${T.border}`, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 22, flexShrink: 0,
      }}>📄</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: sans, fontSize: F.md, fontWeight: 700, color: T.text, marginBottom: 3 }}>
          {uploading ? "Importing…" : drag ? "Drop to import" : "Drop a CSV here to import handles"}
        </div>
        <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>
          {uploadMsg || "Columns: Name, X handle, Instagram handle, Label (Elite/Influential/Signal/Ignore)"}
        </div>
      </div>
      {!uploading && (
        <div style={{
          background: T.accent, color: "#fff", borderRadius: 8,
          padding: "7px 16px", fontFamily: sans, fontSize: F.sm,
          fontWeight: 600, flexShrink: 0,
        }}>Browse</div>
      )}
      {uploadMsg && uploadMsg.startsWith("✓") && (
        <div style={{ color: T.green, fontFamily: sans, fontSize: F.sm, fontWeight: 600, flexShrink: 0 }}>
          {uploadMsg}
        </div>
      )}
      {uploadMsg && uploadMsg.startsWith("✗") && (
        <div style={{ color: T.red, fontFamily: sans, fontSize: F.sm, flexShrink: 0 }}>{uploadMsg}</div>
      )}
      <input ref={ref} type="file" accept=".csv,.txt" style={{ display: "none" }}
        onChange={e => handle(e.target.files)} />
    </div>
  );
}

// ── Manual add panel ─────────────────────────────────────────────────────────
function ManualPanel({ onAdd, onClose }) {
  const [v, setV] = useState({
    name:"", handle_x:"", handle_instagram:"", handle_youtube:"", handle_linkedin:"",
    bio:"", zone:"SIGNAL", followed_by:"",
  });
  const set = (k, val) => setV(p => ({...p, [k]: val}));
  const inp = (k, ph) => (
    <input value={v[k]} placeholder={ph} onChange={e => set(k, e.target.value)}
      style={{ background: T.well, border: `1px solid ${T.border}`, color: T.text,
        borderRadius: 8, padding: "8px 12px", fontFamily: sans,
        fontSize: F.sm, outline: "none", width: "100%" }} />
  );
  const lbl = t => (
    <div style={{ fontSize: F.xs, color: T.dim, fontFamily: sans,
      textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>{t}</div>
  );
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`,
      borderRadius: 14, padding: 20, boxShadow: T.shadow }}>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontFamily: sans, fontWeight: 700, color: T.text, fontSize: F.md }}>
          Add handle manually
        </span>
        <button onClick={onClose} style={{ background: "none", border: "none",
          color: T.dim, cursor: "pointer", fontSize: 18 }}>×</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>{lbl("Name")}{inp("name", "Full name")}</div>
        <div>{lbl("X handle")}{inp("handle_x", "@username")}</div>
        <div>{lbl("Instagram")}{inp("handle_instagram", "@username")}</div>
        <div>{lbl("YouTube")}{inp("handle_youtube", "@channel")}</div>
        <div>{lbl("LinkedIn")}{inp("handle_linkedin", "profile-slug")}</div>
        <div>
          {lbl("List")}
          <select value={v.zone} onChange={e => set("zone", e.target.value)}
            style={{ background: T.well, border: `1px solid ${T.border}`, color: T.text,
              borderRadius: 8, padding: "8px 12px", fontFamily: sans,
              fontSize: F.sm, width: "100%", outline: "none" }}>
            {["ELITE","INFLUENTIAL","SIGNAL","IGNORE"].map(z => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>{lbl("Bio")}{inp("bio", "Short bio…")}</div>
      <div style={{ marginBottom: 14 }}>{lbl("Followed by")}{inp("followed_by", "e.g. @bigthink, @mit")}</div>
      <button onClick={() => {
        const clean = k => v[k]?.trim().replace(/^@/,"").toLowerCase() || null;
        const name  = v.name?.trim();
        const primary = clean("handle_x") || clean("handle_instagram") || clean("handle_youtube") || clean("handle_linkedin");
        if (!primary) return;
        onAdd({
          name: name || primary, bio: v.bio?.trim() || null,
          zone: v.zone, followed_by: v.followed_by?.trim() || null,
          handle_x: clean("handle_x"), handle_instagram: clean("handle_instagram"),
          handle_youtube: clean("handle_youtube"), handle_linkedin: clean("handle_linkedin"),
        });
        onClose();
      }} style={{
        background: T.accent, color: "#fff", border: "none", borderRadius: 9,
        padding: 10, fontFamily: sans, fontSize: F.sm, fontWeight: 700,
        cursor: "pointer", width: "100%",
      }}>Add to handles</button>
    </div>
  );
}

// ── Edit panel ───────────────────────────────────────────────────────────────
function EditPanel({ h, onSave, onClose, saving }) {
  const [v, setV] = useState({
    name: h.name||"", bio: h.bio||"", zone: h.zone||"SIGNAL",
    followed_by: h.followed_by||"",
    handle_x: h.handle_x||"", handle_instagram: h.handle_instagram||"",
    handle_youtube: h.handle_youtube||"", handle_linkedin: h.handle_linkedin||"",
    followers_x: h.followers_x||"", followers_instagram: h.followers_instagram||"",
    followers_youtube: h.followers_youtube||"", followers_linkedin: h.followers_linkedin||"",
  });
  const set = (k, val) => setV(p => ({...p, [k]: val}));
  const inp = (k, ph, type="text") => (
    <input value={v[k]} type={type} placeholder={ph} onChange={e => set(k, e.target.value)}
      style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.text,
        borderRadius: 7, padding: "7px 10px", fontFamily: sans,
        fontSize: F.sm, outline: "none", width: "100%" }} />
  );
  const lbl = t => (
    <div style={{ fontSize: F.xs, color: T.dim, fontFamily: sans,
      textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{t}</div>
  );
  return (
    <div style={{ background: T.well, borderTop: `1px solid ${T.border}`, padding: "16px 20px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 10 }}>
        <div style={{ gridColumn: "span 2" }}>{lbl("Name")}{inp("name","Full name")}</div>
        <div>
          {lbl("List")}
          <select value={v.zone} onChange={e => set("zone", e.target.value)}
            style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.text,
              borderRadius: 7, padding: "7px 10px", fontFamily: sans, fontSize: F.sm,
              width: "100%", outline: "none" }}>
            {["ELITE","INFLUENTIAL","SIGNAL","IGNORE"].map(z => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>
        <div>{lbl("Followed by")}{inp("followed_by","@account1, @account2")}</div>
      </div>
      <div style={{ marginBottom: 10 }}>{lbl("Bio")}{inp("bio","Short bio…")}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
        {["instagram","x","youtube","linkedin"].map(p => (
          <div key={p} style={{ background: T.card, border: `1px solid ${T.border}`,
            borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: F.xs, color: PLAT_COLOR[p], fontFamily: sans,
              fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
              <span>{PLAT_ICON[p]}</span> {p}
            </div>
            <div style={{ marginBottom: 6 }}>
              {lbl("Handle")}
              <input value={v[`handle_${p}`]} placeholder={`@${p}handle`}
                onChange={e => set(`handle_${p}`, e.target.value.replace(/^@/,"").toLowerCase())}
                style={{ background: T.well, border: `1px solid ${T.border}`, color: T.text,
                  borderRadius: 6, padding: "6px 9px", fontFamily: sans,
                  fontSize: F.xs, outline: "none", width: "100%" }} />
            </div>
            <div>
              {lbl("Followers")}
              <input type="number" value={v[`followers_${p}`]} placeholder="—"
                onChange={e => set(`followers_${p}`, e.target.value)}
                style={{ background: T.well, border: `1px solid ${T.border}`, color: T.text,
                  borderRadius: 6, padding: "6px 9px", fontFamily: sans,
                  fontSize: F.xs, outline: "none", width: "100%" }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onSave(v)} disabled={saving}
          style={{ background: T.accent, color: "#fff", border: "none",
            borderRadius: 8, padding: "8px 20px", fontFamily: sans,
            fontSize: F.sm, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving…" : "Save"}
        </button>
        <button onClick={onClose}
          style={{ background: "none", border: `1px solid ${T.border}`, color: T.sub,
            borderRadius: 8, padding: "8px 16px", fontFamily: sans,
            fontSize: F.sm, cursor: "pointer" }}>Cancel</button>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function HandlesPage() {
  const [handles,   setHandles]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState("ALL");
  const [search,    setSearch]    = useState("");
  const [editId,    setEditId]    = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [ixMap,  setIxMap]  = useState({});
  const [editVals, setEditVals] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/handles");
      const d   = await res.json();
      setHandles(d.handles || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCSV(file) {
    if (!file) return;
    setUploading(true); setUploadMsg("Importing…");
    try {
      const text = await file.text();
      const lines = text.trim().split("\n");
      const header = lines[0];
      const dataLines = lines.slice(1).filter(l => l.trim());
      const CHUNK = 500;
      let totalImported = 0, totalErrors = 0;
      for (let i = 0; i < dataLines.length; i += CHUNK) {
        const chunk = [header, ...dataLines.slice(i, i + CHUNK)].join("\n");
        const pct = Math.round((i / dataLines.length) * 100);
        setUploadMsg(`Importing… ${pct}%`);
        const res = await fetch("/api/accounts/csv", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csv: chunk, category: "SIGNAL" }),
        });
        const d = await res.json();
        if (d.error) { setUploadMsg("✗ " + d.error); setUploading(false); return; }
        totalImported += d.imported || 0;
        totalErrors   += d.errors  || 0;
      }
      setUploadMsg(`✓ ${totalImported} handles imported${totalErrors ? ` (${totalErrors} errors)` : ""}`);
      load();
    } catch (e) { setUploadMsg("✗ Upload failed"); }
    setUploading(false);
  }

  async function addManual(data) {
    const now = new Date().toISOString();
    const res = await fetch("/api/handles", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle: { ...data, added_at: now, updated_at: now } }),
    });
    load();
  }

  async function saveEdit(id) {
    setSaving(true);
    try {
      await fetch("/api/handles", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, updates: editVals }),
      });
      setHandles(prev => prev.map(h => h.id === id ? { ...h, ...editVals } : h));
      setEditId(null);
    } catch {}
    setSaving(false);
  }

  async function deleteHandle(id) {
    if (!confirm("Remove this handle?")) return;
    await fetch("/api/handles", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setHandles(prev => prev.filter(h => h.id !== id));
  }

  async function loadInteractions(handleId) {
    if (ixMap[handleId]) return;
    try {
      const res = await fetch(`/api/interactions/list?handle_id=${handleId}`);
      const d   = await res.json();
      setIxMap(prev => ({ ...prev, [handleId]: d.interactions || [] }));
    } catch {}
  }

  function toggleExpand(handleId) {
    const next = expandedId === handleId ? null : handleId;
    setExpandedId(next);
    if (next) loadInteractions(next);
  }

  // primary platform display
  function primary(h) {
    for (const p of ["instagram","x","youtube","linkedin"]) {
      if (h[`handle_${p}`]) return { p, handle: h[`handle_${p}`], followers: h[`followers_${p}`] };
    }
    return null;
  }

  const counts = Object.fromEntries(
    ["ALL",...Object.keys(ZC)].map(z => [z,
      z === "ALL" ? handles.length : handles.filter(h => h.zone === z).length])
  );
  const filtered = handles.filter(h => {
    if (filter !== "ALL" && h.zone !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return h.name?.toLowerCase().includes(q)
      || h.handle_x?.toLowerCase().includes(q)
      || h.handle_instagram?.toLowerCase().includes(q)
      || h.handle_youtube?.toLowerCase().includes(q)
      || h.handle_linkedin?.toLowerCase().includes(q)
      || h.bio?.toLowerCase().includes(q);
  });

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: sans, padding: "36px 40px" }}>
      <style>{`
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#2A2D38;border-radius:3px}
        input::placeholder{color:${T.dim}}
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 24, gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: F.xl, fontWeight: 800, color: T.text,
            letterSpacing: "-0.02em" }}>Handles</h1>
          <p style={{ margin: "5px 0 0", fontSize: F.sm, color: T.sub }}>
            Everyone you track — {handles.length.toLocaleString()} handles across all platforms
          </p>
        </div>
        <button onClick={() => setShowManual(p => !p)}
          style={{
            background: showManual ? T.well : T.accent,
            color: showManual ? T.sub : "#fff",
            border: `1px solid ${showManual ? T.border : "transparent"}`,
            borderRadius: 10, padding: "9px 18px", fontFamily: sans,
            fontSize: F.sm, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
            transition: "all 0.15s", flexShrink: 0,
          }}>
          <span style={{ fontSize: 20, lineHeight: 1, fontWeight: 300 }}>+</span>
          Add manually
        </button>
      </div>

      {/* Manual panel */}
      {showManual && (
        <div style={{ marginBottom: 20 }}>
          <ManualPanel
            onClose={() => setShowManual(false)}
            onAdd={async data => { await addManual(data); setShowManual(false); }}
          />
        </div>
      )}

      {/* CSV drop zone */}
      <div style={{ marginBottom: 20 }}>
        <CSVDrop onFile={handleCSV} uploading={uploading} uploadMsg={uploadMsg} />
      </div>

      {/* Filters + search */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16,
        alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {ZONES.map(z => {
            const active = filter === z;
            const zc     = ZC[z];
            return (
              <button key={z} onClick={() => setFilter(z)} style={{
                background: active ? (zc?.bg || T.well) : T.card,
                color:      active ? (zc?.color || T.text) : T.dim,
                border: `1px solid ${active ? (zc?.border || T.border) : T.border}`,
                borderRadius: 7, padding: "4px 12px", fontFamily: sans,
                fontSize: F.xs, fontWeight: 700, cursor: "pointer",
                textTransform: "uppercase", letterSpacing: "0.05em", transition: "all 0.12s",
              }}>
                {z} <span style={{ opacity: 0.6 }}>({counts[z]})</span>
              </button>
            );
          })}
        </div>
        <input
          value={search} placeholder="Search handles, names, bios…"
          onChange={e => setSearch(e.target.value)}
          style={{ marginLeft: "auto", background: T.card, border: `1px solid ${T.border}`,
            color: T.text, borderRadius: 8, padding: "6px 14px", fontFamily: sans,
            fontSize: F.sm, outline: "none", width: 240 }} />
      </div>

      {/* Table */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 14, overflow: "hidden" }}>
        {/* Headers */}
        <div style={{ display: "grid",
          gridTemplateColumns: "minmax(160px,240px) 80px 1fr minmax(160px,220px) 90px 70px 52px",
          padding: "9px 20px", borderBottom: `1px solid ${T.border}` }}>
          {["Name / Handle","List","Bio","Platforms","Interactions","Last seen",""].map((h,i) => (
            <div key={i} style={{ fontSize: F.xs, fontWeight: 700, color: T.dim,
              textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
          ))}
        </div>

        {loading && (
          <div style={{ padding: 40, textAlign: "center", color: T.dim, fontSize: F.sm }}>
            Loading…
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>👤</div>
            <div style={{ color: T.dim, fontSize: F.sm }}>
              {search ? `No results for "${search}"` : "No handles in this list yet."}
            </div>
          </div>
        )}

        {filtered.map(h => {
          const zc      = ZC[h.zone] || ZC.SIGNAL;
          const isEdit  = editId === h.id;
          const isOpen  = expandedId === h.id;
          const pri     = primary(h);

          return (
            <div key={h.id} style={{ borderBottom: `1px solid ${T.border}` }}>
              {/* Main row */}
              <div
                onClick={() => {
                  if (isEdit) return;
                  toggleExpand(h.id);
                }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(160px,240px) 80px 1fr minmax(160px,220px) 90px 70px 52px",
                  padding: "11px 20px", alignItems: "center", cursor: "pointer",
                  background: isEdit ? `${T.accent}08` : isOpen ? T.well : "transparent",
                  transition: "background 0.12s",
                }}
                onMouseEnter={e => { if (!isEdit && !isOpen) e.currentTarget.style.background = "#16181D"; }}
                onMouseLeave={e => { if (!isEdit && !isOpen) e.currentTarget.style.background = "transparent"; }}
              >
                {/* Name / handle */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: F.sm, fontWeight: 600, color: T.text,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>
                    {h.name || pri?.handle || "—"}
                  </div>
                  {pri && (
                    <a href={PLAT_URL[pri.p]?.(pri.handle)} target="_blank" rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{ fontSize: F.xs, color: T.dim, textDecoration: "none",
                        display: "inline-flex", alignItems: "center", gap: 3 }}
                      onMouseEnter={e => e.currentTarget.style.color = T.accent}
                      onMouseLeave={e => e.currentTarget.style.color = T.dim}>
                      <span style={{ color: PLAT_COLOR[pri.p] }}>{PLAT_ICON[pri.p]}</span>
                      @{pri.handle}
                    </a>
                  )}
                </div>

                {/* Zone badge */}
                <div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
                    background: zc.bg, color: zc.color, border: `1px solid ${zc.border}`,
                    fontFamily: sans,
                  }}>{h.zone}</span>
                </div>

                {/* Bio */}
                <div style={{ fontSize: F.xs, color: T.sub, overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 10 }}>
                  {h.bio || <span style={{ color: T.dim }}>—</span>}
                </div>

                {/* Platforms */}
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {["instagram","x","youtube","linkedin"].map(p => {
                    const hdl = h[`handle_${p}`];
                    const fol = h[`followers_${p}`];
                    if (!hdl) return null;
                    return (
                      <div key={p} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ fontSize: 10, color: PLAT_COLOR[p], width: 14, flexShrink: 0 }}>
                          {PLAT_ICON[p]}
                        </span>
                        <a href={PLAT_URL[p]?.(hdl)} target="_blank" rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ fontSize: F.xs, color: T.sub, textDecoration: "none",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            maxWidth: 90 }}
                          onMouseEnter={e => e.currentTarget.style.color = T.accent}
                          onMouseLeave={e => e.currentTarget.style.color = T.sub}>
                          @{hdl}
                        </a>
                        {fol && <span style={{ fontSize: 10, color: T.dim }}>{fmt(fol)}</span>}
                      </div>
                    );
                  })}
                  {!["instagram","x","youtube","linkedin"].some(p => h[`handle_${p}`]) && (
                    <span style={{ fontSize: F.xs, color: T.dim }}>—</span>
                  )}
                </div>

                {/* Interactions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {h.interaction_count > 0 ? (
                    <>
                      <span style={{ fontSize: F.xs, color: T.sub, fontWeight: 500,
                        textTransform: "capitalize" }}>
                        {h.last_interaction_type || "interaction"}
                      </span>
                      <span style={{ fontSize: 10, color: T.dim }}>{h.interaction_count} total</span>
                    </>
                  ) : (
                    <span style={{ fontSize: F.xs, color: T.dim }}>—</span>
                  )}
                </div>

                {/* Last seen */}
                <div style={{ fontSize: F.xs, color: T.dim }}>
                  {timeAgo(h.last_interaction) || timeAgo(h.updated_at) || "—"}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}
                  onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      if (isEdit) { setEditId(null); return; }
                      setEditId(h.id);
                      setEditVals({
                        name: h.name||"", bio: h.bio||"", zone: h.zone,
                        followed_by: h.followed_by||"",
                        handle_instagram: h.handle_instagram||"",
                        handle_x: h.handle_x||"",
                        handle_youtube: h.handle_youtube||"",
                        handle_linkedin: h.handle_linkedin||"",
                        followers_instagram: h.followers_instagram||"",
                        followers_x: h.followers_x||"",
                        followers_youtube: h.followers_youtube||"",
                        followers_linkedin: h.followers_linkedin||"",
                      });
                    }}
                    style={{ background: "none", border: "none",
                      color: isEdit ? T.accent : T.dim,
                      cursor: "pointer", fontSize: 13, padding: 0, lineHeight: 1 }}
                    onMouseEnter={e => e.currentTarget.style.color = T.accent}
                    onMouseLeave={e => e.currentTarget.style.color = isEdit ? T.accent : T.dim}>✎</button>
                  <button onClick={() => deleteHandle(h.id)}
                    style={{ background: "none", border: "none", color: T.dim,
                      cursor: "pointer", fontSize: 15, padding: 0, lineHeight: 1 }}
                    onMouseEnter={e => e.currentTarget.style.color = T.red}
                    onMouseLeave={e => e.currentTarget.style.color = T.dim}>×</button>
                </div>
              </div>

              {/* Interaction timeline */}
              {isOpen && (
                <div style={{ background: "#0E0F14", borderTop: `1px solid ${T.border}`,
                  padding: "12px 20px 14px 28px" }}>
                  <div style={{ fontSize: F.xs, fontWeight: 700, color: T.dim,
                    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                    Interaction history
                  </div>
                  {!ixMap[h.id] ? (
                    <div style={{ fontSize: F.xs, color: T.dim }}>Loading…</div>
                  ) : ixMap[h.id].length === 0 ? (
                    <div style={{ fontSize: F.xs, color: T.dim }}>No interactions recorded yet.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {ixMap[h.id].slice(0, 30).map(ix => (
                        <div key={ix.id} style={{ display: "flex", alignItems: "baseline",
                          gap: 12 }}>
                          <span style={{ fontSize: F.xs, color: T.dim,
                            flexShrink: 0, width: 72 }}>{timeAgo(ix.interacted_at)}</span>
                          <span style={{ fontSize: 10, color: PLAT_COLOR[ix.platform] || T.dim,
                            flexShrink: 0 }}>{PLAT_ICON[ix.platform] || ""}</span>
                          <span style={{ fontSize: F.xs, color: T.sub,
                            textTransform: "capitalize", flexShrink: 0 }}>
                            {ix.interaction_type || "interaction"}
                          </span>
                          {ix.content && (
                            <span style={{ fontSize: F.xs, color: T.dim, overflow: "hidden",
                              textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              — {ix.content.slice(0, 80)}
                            </span>
                          )}
                        </div>
                      ))}
                      {ixMap[h.id].length > 30 && (
                        <div style={{ fontSize: F.xs, color: T.dim }}>
                          +{ixMap[h.id].length - 30} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Edit panel */}
              {isEdit && (
                <EditPanel
                  h={h}
                  saving={saving}
                  onSave={async vals => {
                    setEditVals(vals);
                    setSaving(true);
                    await fetch("/api/handles", {
                      method: "PATCH", headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: h.id, updates: vals }),
                    });
                    setHandles(prev => prev.map(x => x.id === h.id ? { ...x, ...vals } : x));
                    setEditId(null);
                    setSaving(false);
                  }}
                  onClose={() => setEditId(null)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
