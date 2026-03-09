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
  blue: "#60A5FA",
};
const F = { xl: 26, lg: 17, md: 14, sm: 12, xs: 11 };
const LISTS = ["ALL","ELITE","INFLUENTIAL","SIGNAL","IGNORE"];
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
  if (d<30) return `${d}d ago`; if (d<365) return `${Math.floor(d/30)}mo ago`;
  return `${Math.floor(d/365)}y ago`;
}

const Trash = () => (
  <svg width="13" height="14" viewBox="0 0 13 14" fill="none">
    <path d="M1 3.5h11M4.5 3.5V2.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M5.5 6.5v4M7.5 6.5v4M2 3.5l.75 7.5a1 1 0 0 0 1 .9h5.5a1 1 0 0 0 1-.9L11 3.5"
      stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Inline editable cell ─────────────────────────────────────────────────────
function InlineCell({ value, onCommit, type = "text", placeholder = "—", style = {}, display }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal]         = useState(value ?? "");
  const ref = useRef();

  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);
  useEffect(() => { setVal(value ?? ""); }, [value]);

  const commit = () => {
    setEditing(false);
    const parsed = type === "number" ? (val === "" ? null : parseInt(val) || null) : val;
    if (parsed !== (value ?? "")) onCommit(parsed);
  };

  if (editing) return (
    <input ref={ref} type={type} value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setEditing(false); setVal(value ?? ""); } }}
      onClick={e => e.stopPropagation()}
      style={{ width: "100%", background: "#0B0C0F", border: `1.5px solid ${T.accent}`,
        borderRadius: 6, padding: "4px 8px", fontFamily: sans, fontSize: F.xs,
        color: T.text, outline: "none", ...style }} />
  );

  return (
    <div onClick={e => { e.stopPropagation(); setEditing(true); }}
      title="Click to edit"
      style={{ cursor: "text", fontFamily: sans, fontSize: F.xs,
        color: !value ? T.dim : T.sub,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        padding: "4px 8px", borderRadius: 6,
        border: "1.5px solid transparent", transition: "all 0.12s", ...style }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.well; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "transparent"; }}>
      {display ?? (!value ? <span style={{ color: T.dim }}>{placeholder}</span> : value)}
    </div>
  );
}

// ── CSV Drop Zone ────────────────────────────────────────────────────────────
function CSVDrop({ onFile, uploading, uploadMsg }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef();
  const handle = files => {
    const csv = Array.from(files).find(f => f.name.endsWith(".csv") || f.name.endsWith(".txt"));
    if (csv) onFile(csv);
  };
  return (
    <div
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDrag(false); }}
      onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
      onClick={() => !uploading && ref.current?.click()}
      style={{ border: `2px dashed ${drag ? T.accent : "#2A2D38"}`, borderRadius: 14,
        padding: "22px 28px", background: drag ? T.accentBg : T.well,
        cursor: uploading ? "default" : "pointer", transition: "all 0.2s",
        display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: T.card,
        border: `1px solid ${T.border}`, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 20, flexShrink: 0 }}>📄</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: sans, fontSize: F.md, fontWeight: 700, color: T.text, marginBottom: 2 }}>
          {uploading ? "Importing…" : drag ? "Drop to import" : "Drop a CSV to import handles"}
        </div>
        <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>
          {uploadMsg && !uploadMsg.startsWith("Importing")
            ? <span style={{ color: uploadMsg.startsWith("✓") ? T.green : T.red }}>{uploadMsg}</span>
            : "Columns: Name, X handle, Instagram handle, Label"}
        </div>
      </div>
      {!uploading && (
        <div style={{ background: T.accent, color: "#fff", borderRadius: 8,
          padding: "6px 14px", fontFamily: sans, fontSize: F.sm,
          fontWeight: 600, flexShrink: 0 }}>Browse</div>
      )}
      <input ref={ref} type="file" accept=".csv,.txt" style={{ display: "none" }}
        onChange={e => handle(e.target.files)} />
    </div>
  );
}

// ── Manual add panel ─────────────────────────────────────────────────────────
function ManualPanel({ onAdd, onClose }) {
  const [v, setV] = useState({ name:"", handle_x:"", handle_instagram:"",
    handle_youtube:"", handle_linkedin:"", bio:"", zone:"SIGNAL", followed_by:"" });
  const set = (k, val) => setV(p => ({...p,[k]:val}));
  const lbl = t => <div style={{ fontSize:F.xs, color:T.dim, fontFamily:sans,
    textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{t}</div>;
  const inp = (k, ph) => (
    <input value={v[k]} placeholder={ph} onChange={e => set(k, e.target.value)}
      style={{ background:T.well, border:`1px solid ${T.border}`, color:T.text,
        borderRadius:8, padding:"7px 11px", fontFamily:sans, fontSize:F.sm,
        outline:"none", width:"100%" }} />
  );
  return (
    <div style={{ background:T.card, border:`1px solid ${T.border}`,
      borderRadius:14, padding:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between",
        alignItems:"center", marginBottom:14 }}>
        <span style={{ fontFamily:sans, fontWeight:700, color:T.text, fontSize:F.md }}>Add handle</span>
        <button onClick={onClose} style={{ background:"none", border:"none",
          color:T.dim, cursor:"pointer", fontSize:18, lineHeight:1 }}>×</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:10 }}>
        <div>{lbl("Name")}{inp("name","Full name")}</div>
        <div>{lbl("X handle")}{inp("handle_x","@username")}</div>
        <div>{lbl("Instagram")}{inp("handle_instagram","@username")}</div>
        <div>{lbl("YouTube")}{inp("handle_youtube","@channel")}</div>
        <div>{lbl("LinkedIn")}{inp("handle_linkedin","profile-slug")}</div>
        <div>
          {lbl("List")}
          <select value={v.zone} onChange={e => set("zone",e.target.value)}
            style={{ background:T.well, border:`1px solid ${T.border}`, color:T.text,
              borderRadius:8, padding:"7px 11px", fontFamily:sans, fontSize:F.sm,
              width:"100%", outline:"none" }}>
            {["ELITE","INFLUENTIAL","SIGNAL","IGNORE"].map(z=>(
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ marginBottom:10 }}>{lbl("Bio")}{inp("bio","Short bio…")}</div>
      <button onClick={() => {
        const clean = k => v[k]?.trim().replace(/^@/,"").toLowerCase()||null;
        const primary = clean("handle_x")||clean("handle_instagram")||clean("handle_youtube")||clean("handle_linkedin");
        if (!primary) return;
        onAdd({ name:v.name?.trim()||primary, bio:v.bio?.trim()||null, zone:v.zone,
          followed_by:v.followed_by?.trim()||null,
          handle_x:clean("handle_x"), handle_instagram:clean("handle_instagram"),
          handle_youtube:clean("handle_youtube"), handle_linkedin:clean("handle_linkedin") });
        onClose();
      }} style={{ background:T.accent, color:"#fff", border:"none", borderRadius:9,
        padding:10, fontFamily:sans, fontSize:F.sm, fontWeight:700,
        cursor:"pointer", width:"100%" }}>Add to handles</button>
    </div>
  );
}

// ── Interaction timeline ─────────────────────────────────────────────────────
function Timeline({ handleId, ixMap, loadInteractions }) {
  useEffect(() => { loadInteractions(handleId); }, [handleId]);
  const list = ixMap[handleId];
  if (!list) return <div style={{ fontSize:F.xs, color:T.dim, padding:"10px 0" }}>Loading…</div>;
  if (!list.length) return <div style={{ fontSize:F.xs, color:T.dim, padding:"10px 0" }}>No interactions yet.</div>;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6, paddingTop:4 }}>
      {list.slice(0,30).map(ix => (
        <div key={ix.id} style={{ display:"flex", alignItems:"baseline", gap:10 }}>
          <span style={{ fontSize:F.xs, color:T.dim, flexShrink:0, width:68 }}>{timeAgo(ix.interacted_at)}</span>
          <span style={{ fontSize:10, color:PLAT_COLOR[ix.platform]||T.dim, flexShrink:0 }}>
            {PLAT_ICON[ix.platform]||""}
          </span>
          <span style={{ fontSize:F.xs, color:T.sub, textTransform:"capitalize", flexShrink:0 }}>
            {ix.interaction_type||"interaction"}
          </span>
          {ix.content && (
            <span style={{ fontSize:F.xs, color:T.dim, overflow:"hidden",
              textOverflow:"ellipsis", whiteSpace:"nowrap" }}>— {ix.content.slice(0,80)}</span>
          )}
        </div>
      ))}
      {list.length > 30 && <div style={{ fontSize:F.xs, color:T.dim }}>+{list.length-30} more</div>}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function HandlesPage() {
  const [handles,    setHandles]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState("ALL");
  const [search,     setSearch]     = useState("");
  const [uploading,  setUploading]  = useState(false);
  const [uploadMsg,  setUploadMsg]  = useState("");
  const [showManual, setShowManual] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [ixMap,      setIxMap]      = useState({});
  const [selected,   setSelected]   = useState(new Set());
  const [saving,     setSaving]     = useState(null); // handleId being saved

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

  const loadInteractions = useCallback(async (handleId) => {
    if (ixMap[handleId] !== undefined) return;
    setIxMap(p => ({...p, [handleId]: null})); // null = loading
    try {
      const res = await fetch(`/api/interactions/list?handle_id=${handleId}`);
      const d   = await res.json();
      setIxMap(p => ({...p, [handleId]: d.interactions || []}));
    } catch { setIxMap(p => ({...p, [handleId]: []})); }
  }, [ixMap]);

  const saveField = async (id, updates) => {
    setSaving(id);
    try {
      await fetch("/api/handles", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, updates }),
      });
      setHandles(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
    } catch (e) { alert("Save failed: " + e.message); }
    setSaving(null);
  };

  async function handleCSV(file) {
    setUploading(true); setUploadMsg("Importing…");
    try {
      const text = await file.text();
      const lines = text.trim().split("\n");
      const header = lines[0];
      const dataLines = lines.slice(1).filter(l => l.trim());
      let totalImported = 0;
      for (let i = 0; i < dataLines.length; i += 500) {
        const chunk = [header, ...dataLines.slice(i, i+500)].join("\n");
        const pct = Math.round((i / dataLines.length) * 100);
        setUploadMsg(`Importing… ${pct}%`);
        const res = await fetch("/api/accounts/csv", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csv: chunk, category: "SIGNAL" }),
        });
        const d = await res.json();
        if (d.error) { setUploadMsg("✗ "+d.error); setUploading(false); return; }
        totalImported += d.imported || 0;
      }
      setUploadMsg(`✓ ${totalImported} imported`);
      load();
    } catch { setUploadMsg("✗ Upload failed"); }
    setUploading(false);
  }

  async function addManual(data) {
    const now = new Date().toISOString();
    await fetch("/api/handles", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle: { ...data, added_at: now, updated_at: now } }),
    });
    load();
  }

  async function deleteHandle(id) {
    if (!confirm("Remove this handle?")) return;
    await fetch("/api/handles", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setHandles(prev => prev.filter(h => h.id !== id));
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
  }

  async function bulkDelete() {
    const ids = [...selected];
    if (!confirm(`Delete ${ids.length} handle${ids.length!==1?"s":""}?`)) return;
    await Promise.all(ids.map(id =>
      fetch("/api/handles", { method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }) })
    ));
    setHandles(prev => prev.filter(h => !ids.includes(h.id)));
    setSelected(new Set());
  }

  function primary(h) {
    for (const p of ["instagram","x","youtube","linkedin"]) {
      if (h[`handle_${p}`]) return { p, handle: h[`handle_${p}`], followers: h[`followers_${p}`] };
    }
    return null;
  }

  const counts = Object.fromEntries(
    ["ALL",...Object.keys(ZC)].map(z => [z,
      z==="ALL" ? handles.length : handles.filter(h => h.zone===z).length])
  );

  const filtered = handles.filter(h => {
    if (filter !== "ALL" && h.zone !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return h.name?.toLowerCase().includes(q)
      || h.handle_x?.toLowerCase().includes(q)
      || h.handle_instagram?.toLowerCase().includes(q)
      || h.bio?.toLowerCase().includes(q);
  });

  const allSelected = selected.size === filtered.length && filtered.length > 0;
  const anySelected = selected.size > 0;

  const toggleSelect = id => setSelected(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const LIST_ORDER = ["ELITE","INFLUENTIAL","SIGNAL","IGNORE"];

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:sans, padding:"36px 40px" }}>
      <style>{`
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#2A2D38;border-radius:3px}
        input::placeholder{color:${T.dim}}
        input[type=checkbox]{accent-color:${T.accent}}
      `}</style>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between",
        alignItems:"flex-start", marginBottom:22, gap:16 }}>
        <div>
          <h1 style={{ margin:0, fontSize:F.xl, fontWeight:800, color:T.text,
            letterSpacing:"-0.02em" }}>Handles</h1>
          <p style={{ margin:"5px 0 0", fontSize:F.sm, color:T.sub }}>
            {loading ? "Loading…" : `${handles.length.toLocaleString()} handles · click any cell to edit inline`}
          </p>
        </div>
        <button onClick={() => setShowManual(p=>!p)}
          style={{ background:showManual?T.well:T.accent, color:showManual?T.sub:"#fff",
            border:`1px solid ${showManual?T.border:"transparent"}`,
            borderRadius:10, padding:"9px 18px", fontFamily:sans, fontSize:F.sm,
            fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center",
            gap:8, flexShrink:0, transition:"all 0.15s" }}>
          <span style={{ fontSize:20, lineHeight:1, fontWeight:300 }}>+</span>
          Add manually
        </button>
      </div>

      {showManual && <div style={{ marginBottom:18 }}><ManualPanel onClose={()=>setShowManual(false)} onAdd={async d=>{await addManual(d);setShowManual(false);}}/></div>}

      <div style={{ marginBottom:18 }}>
        <CSVDrop onFile={handleCSV} uploading={uploading} uploadMsg={uploadMsg} />
      </div>

      {/* Filters + search + bulk actions */}
      <div style={{ display:"flex", gap:10, marginBottom:14, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          {LISTS.map(z => {
            const active = filter===z; const zc = ZC[z];
            return (
              <button key={z} onClick={()=>setFilter(z)} style={{
                background:active?(zc?.bg||T.well):T.card,
                color:active?(zc?.color||T.text):T.dim,
                border:`1px solid ${active?(zc?.border||T.border):T.border}`,
                borderRadius:7, padding:"4px 11px", fontFamily:sans, fontSize:F.xs,
                fontWeight:700, cursor:"pointer", textTransform:"uppercase",
                letterSpacing:"0.05em", transition:"all 0.12s" }}>
                {z} <span style={{ opacity:0.6 }}>({counts[z]})</span>
              </button>
            );
          })}
        </div>

        {anySelected && (
          <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:4 }}>
            <span style={{ fontFamily:sans, fontSize:F.xs, color:T.sub }}>
              {selected.size} selected
            </span>
            <button onClick={bulkDelete}
              style={{ display:"flex", alignItems:"center", gap:5,
                background:T.redBg, color:T.red, border:`1px solid ${T.red}30`,
                borderRadius:7, padding:"5px 12px", fontFamily:sans,
                fontSize:F.xs, fontWeight:600, cursor:"pointer" }}>
              <Trash /> Delete {selected.size}
            </button>
            <button onClick={()=>setSelected(new Set())}
              style={{ background:"none", border:"none", color:T.dim,
                cursor:"pointer", fontSize:F.xs, fontFamily:sans }}>Clear</button>
          </div>
        )}

        <input value={search} placeholder="Search…" onChange={e=>setSearch(e.target.value)}
          style={{ marginLeft:"auto", background:T.card, border:`1px solid ${T.border}`,
            color:T.text, borderRadius:8, padding:"6px 14px", fontFamily:sans,
            fontSize:F.sm, outline:"none", width:220 }} />
      </div>

      {/* Table */}
      <div style={{ background:T.card, border:`1px solid ${T.border}`,
        borderRadius:14, overflow:"hidden" }}>

        {/* Header row */}
        <div style={{ display:"grid",
          gridTemplateColumns:"32px minmax(150px,220px) 88px 1fr minmax(160px,220px) 100px 80px 44px",
          padding:"7px 16px 7px 8px", borderBottom:`1px solid ${T.border}`,
          alignItems:"center" }}>
          <div style={{ display:"flex", justifyContent:"center" }}>
            <input type="checkbox" checked={allSelected}
              onChange={() => setSelected(allSelected ? new Set() : new Set(filtered.map(h=>h.id)))}
              style={{ width:13, height:13, cursor:"pointer" }} />
          </div>
          {["Name / Handle","List","Bio","Platforms","Interactions","Last seen",""].map((h,i) => (
            <div key={i} style={{ fontSize:F.xs, fontWeight:700, color:T.dim,
              textTransform:"uppercase", letterSpacing:"0.06em", padding:"0 6px" }}>{h}</div>
          ))}
        </div>

        {loading && (
          <div style={{ padding:40, textAlign:"center", color:T.dim, fontSize:F.sm }}>Loading…</div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ padding:48, textAlign:"center" }}>
            <div style={{ fontSize:28, marginBottom:8 }}>👤</div>
            <div style={{ color:T.dim, fontSize:F.sm }}>
              {search ? `No results for "${search}"` : "No handles here yet."}
            </div>
          </div>
        )}

        {filtered.map(h => {
          const sel     = selected.has(h.id);
          const isOpen  = expandedId === h.id;
          const zc      = ZC[h.zone] || ZC.SIGNAL;
          const pri     = primary(h);

          return (
            <div key={h.id} style={{ borderBottom:`1px solid ${T.border}` }}>
              {/* Main row */}
              <div
                style={{ display:"grid",
                  gridTemplateColumns:"32px minmax(150px,220px) 88px 1fr minmax(160px,220px) 100px 80px 44px",
                  padding:"0 16px 0 8px", alignItems:"center", minHeight:48,
                  background: sel ? `${T.accent}10` : "transparent",
                  transition:"background 0.1s", cursor:"default" }}
                onMouseEnter={e => { if (!sel) e.currentTarget.style.background = "#16181D"; }}
                onMouseLeave={e => { if (!sel) e.currentTarget.style.background = "transparent"; }}>

                {/* Checkbox */}
                <div style={{ display:"flex", justifyContent:"center", alignItems:"center" }}>
                  <input type="checkbox" checked={sel} onChange={()=>toggleSelect(h.id)}
                    onClick={e=>e.stopPropagation()}
                    style={{ width:13, height:13, cursor:"pointer" }} />
                </div>

                {/* Name / handle — click opens timeline */}
                <div style={{ padding:"10px 6px", minWidth:0, cursor:"pointer" }}
                  onClick={() => setExpandedId(isOpen ? null : h.id)}>
                  <div style={{ fontSize:F.sm, fontWeight:600, color:T.text,
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                    marginBottom:2 }}>
                    {h.name || pri?.handle || "—"}
                  </div>
                  {pri && (
                    <a href={PLAT_URL[pri.p]?.(pri.handle)} target="_blank" rel="noreferrer"
                      onClick={e=>e.stopPropagation()}
                      style={{ fontSize:F.xs, color:T.dim, textDecoration:"none",
                        display:"inline-flex", alignItems:"center", gap:3 }}
                      onMouseEnter={e=>e.currentTarget.style.color=T.accent}
                      onMouseLeave={e=>e.currentTarget.style.color=T.dim}>
                      <span style={{ color:PLAT_COLOR[pri.p] }}>{PLAT_ICON[pri.p]}</span>
                      @{pri.handle}
                    </a>
                  )}
                </div>

                {/* List — click to cycle */}
                <div style={{ padding:"0 6px" }}>
                  <span
                    onClick={e => {
                      e.stopPropagation();
                      const next = LIST_ORDER[(LIST_ORDER.indexOf(h.zone)+1) % LIST_ORDER.length];
                      saveField(h.id, { zone: next });
                    }}
                    title="Click to change list"
                    style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:5,
                      background:zc.bg, color:zc.color, border:`1px solid ${zc.border}`,
                      fontFamily:sans, cursor:"pointer", userSelect:"none",
                      display:"inline-block", transition:"opacity 0.1s" }}
                    onMouseEnter={e=>e.currentTarget.style.opacity="0.7"}
                    onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                    {h.zone}
                  </span>
                </div>

                {/* Bio — inline edit */}
                <InlineCell value={h.bio} placeholder="Add bio…"
                  onCommit={v => saveField(h.id, { bio: v })} />

                {/* Platforms */}
                <div style={{ padding:"6px 6px", display:"flex", flexDirection:"column", gap:3 }}>
                  {["instagram","x","youtube","linkedin"].map(p => {
                    const hdl = h[`handle_${p}`]; const fol = h[`followers_${p}`];
                    if (!hdl) return null;
                    return (
                      <div key={p} style={{ display:"flex", alignItems:"center", gap:5 }}>
                        <span style={{ fontSize:10, color:PLAT_COLOR[p], width:14, flexShrink:0 }}>
                          {PLAT_ICON[p]}
                        </span>
                        <a href={PLAT_URL[p]?.(hdl)} target="_blank" rel="noreferrer"
                          onClick={e=>e.stopPropagation()}
                          style={{ fontSize:F.xs, color:T.sub, textDecoration:"none",
                            maxWidth:90, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}
                          onMouseEnter={e=>e.currentTarget.style.color=T.accent}
                          onMouseLeave={e=>e.currentTarget.style.color=T.sub}>
                          @{hdl}
                        </a>
                        {fol && <span style={{ fontSize:10, color:T.dim }}>{fmt(fol)}</span>}
                      </div>
                    );
                  })}
                  {!["instagram","x","youtube","linkedin"].some(p=>h[`handle_${p}`]) && (
                    <span style={{ fontSize:F.xs, color:T.dim }}>—</span>
                  )}
                </div>

                {/* Interactions */}
                <div style={{ padding:"0 6px" }}>
                  {h.interaction_count > 0 ? (
                    <div>
                      <div style={{ fontSize:F.xs, color:T.sub, textTransform:"capitalize", fontWeight:500 }}>
                        {h.last_interaction_type || "interaction"}
                      </div>
                      <div style={{ fontSize:10, color:T.dim }}>{h.interaction_count} total</div>
                    </div>
                  ) : <span style={{ fontSize:F.xs, color:T.dim }}>—</span>}
                </div>

                {/* Last seen */}
                <div style={{ padding:"0 6px", fontSize:F.xs, color:T.dim }}>
                  {timeAgo(h.last_interaction) || timeAgo(h.updated_at) || "—"}
                </div>

                {/* Trash */}
                <div style={{ display:"flex", justifyContent:"center" }}>
                  <button onClick={e=>{e.stopPropagation();deleteHandle(h.id);}}
                    title="Delete handle"
                    style={{ background:"none", border:"none", color:T.dim,
                      cursor:"pointer", padding:6, borderRadius:6,
                      display:"flex", alignItems:"center", opacity:0,
                      transition:"opacity 0.15s, color 0.1s" }}
                    className="trash-btn"
                    onMouseEnter={e=>{e.currentTarget.style.color=T.red;e.currentTarget.style.opacity="1";}}
                    onMouseLeave={e=>{e.currentTarget.style.color=T.dim;e.currentTarget.style.opacity="0.3";}}>
                    <Trash />
                  </button>
                </div>
              </div>

              {/* Interaction timeline */}
              {isOpen && (
                <div style={{ background:"#0E0F14", borderTop:`1px solid ${T.border}`,
                  padding:"12px 20px 14px 44px" }}>
                  <div style={{ fontSize:F.xs, fontWeight:700, color:T.dim,
                    textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>
                    Interaction history
                  </div>
                  <Timeline handleId={h.id} ixMap={ixMap} loadInteractions={loadInteractions} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Row hover reveals trash — CSS approach */}
      <style>{`
        div[style*="minHeight: 48"]:hover .trash-btn { opacity: 0.35 !important; }
      `}</style>
    </div>
  );
}
