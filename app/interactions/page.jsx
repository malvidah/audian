"use client";
import { useState, useCallback, useRef, useEffect } from "react";

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
const IX_ICON = { follow:"👤", like:"♥", comment:"💬", mention:"@", tag:"🏷", view:"👁" };

function fmt(n) {
  if (!n) return null;
  if (n >= 1_000_000) return (n/1_000_000).toFixed(1).replace(/\.0$/,"")+"M";
  if (n >= 1_000)     return (n/1_000).toFixed(1).replace(/\.0$/,"")+"K";
  return n.toLocaleString();
}

function fmtDate(ts) {
  if (!ts) return null;
  const d = new Date(ts);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff/86400)}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined });
}

function fmtDateTime(ts) {
  if (!ts) return null;
  const d = new Date(ts);
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
    hour12: true,
  });
}

function computeZone(item) {
  if (item.zone === "ELITE" || item.on_watchlist) return "ELITE";
  const followers = parseInt(item.followers) || 0;
  const hasWiki   = !!item._wikiBio;
  const high      = followers >= 100000;
  if (hasWiki && high) return "INFLUENTIAL";
  if (high)            return "SIGNAL";
  if (hasWiki)         return "SIGNAL";
  if (item.bio?.trim()) return "SIGNAL";
  return "IGNORE";
}

// ── Drop Zone ─────────────────────────────────────────────────────────────────
function DropZone({ onImages, onCSV, disabled }) {
  const [drag, setDrag] = useState(false);
  const imgRef = useRef(); const csvRef = useRef();

  const handle = useCallback((files) => {
    const imgs = Array.from(files).filter(f => f.type.startsWith("image/"));
    const csvs = Array.from(files).filter(f => f.name.endsWith(".csv") || f.name.endsWith(".txt"));
    if (imgs.length) onImages(imgs);
    if (csvs.length) onCSV(csvs[0]);
  }, [onImages, onCSV]);

  return (
    <div onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDrag(false); }}
      onDrop={e => { e.preventDefault(); setDrag(false); if (!disabled) handle(e.dataTransfer.files); }}
      style={{ border: `2px dashed ${drag ? T.accent : "#2A2D38"}`, borderRadius: 14,
        padding: "26px 28px", background: drag ? T.accentBg : T.well,
        transition: "all 0.2s", display: "flex", alignItems: "center", gap: 20 }}>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        {[{icon:"📸",l:"Screenshot"},{icon:"📄",l:"CSV"}].map(({icon,l}) => (
          <div key={l} style={{ width: 48, height: 48, borderRadius: 12, background: T.card,
            border: `1px solid ${T.border}`, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 2, boxShadow: T.shadow }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span style={{ fontSize: 8, color: T.dim, fontFamily: sans,
              textTransform: "uppercase", letterSpacing: "0.05em" }}>{l}</span>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: sans, fontSize: F.md, fontWeight: 700, color: T.text, marginBottom: 3 }}>
          {drag ? "Drop to import" : "Drop screenshots or a CSV to import"}
        </div>
        <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>
          Instagram · X · YouTube · LinkedIn — AI parses screenshots, wiki fills bios, web search pulls follower counts
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button onClick={() => !disabled && imgRef.current?.click()} disabled={disabled}
          style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 8,
            padding: "7px 14px", fontFamily: sans, fontSize: F.sm, fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <span>↑</span> Screenshots
        </button>
        <button onClick={() => !disabled && csvRef.current?.click()} disabled={disabled}
          style={{ background: T.card, color: T.sub, border: `1px solid ${T.border}`,
            borderRadius: 8, padding: "7px 14px", fontFamily: sans, fontSize: F.sm,
            fontWeight: 600, cursor: "pointer" }}>
          CSV
        </button>
      </div>
      <input ref={imgRef} type="file" multiple accept="image/*" style={{ display: "none" }}
        onChange={e => handle(e.target.files)} />
      <input ref={csvRef} type="file" accept=".csv,.txt" style={{ display: "none" }}
        onChange={e => handle(e.target.files)} />
    </div>
  );
}

// ── Manual add panel ───────────────────────────────────────────────────────────
function ManualPanel({ onAdd, onClose }) {
  const [v, setV] = useState({ handle:"", name:"", bio:"", followers:"",
    platform:"instagram", interaction_type:"follow", zone:"SIGNAL" });
  const set = (k,val) => setV(p=>({...p,[k]:val}));
  const lbl = t => <div style={{ fontSize:F.xs, color:T.dim, fontFamily:sans,
    textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:5 }}>{t}</div>;
  const inp = (k,ph,type="text") => (
    <input value={v[k]} type={type} placeholder={ph} onChange={e=>set(k,e.target.value)}
      style={{ background:T.well, border:`1px solid ${T.border}`, color:T.text,
        borderRadius:8, padding:"8px 12px", fontFamily:sans, fontSize:F.sm,
        outline:"none", width:"100%" }} />
  );
  const sel = (k,opts) => (
    <select value={v[k]} onChange={e=>set(k,e.target.value)}
      style={{ background:T.well, border:`1px solid ${T.border}`, color:T.text,
        borderRadius:8, padding:"8px 12px", fontFamily:sans, fontSize:F.sm,
        width:"100%", outline:"none" }}>
      {opts.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  );
  return (
    <div style={{ background:T.card, border:`1px solid ${T.border}`,
      borderRadius:14, padding:20, boxShadow:T.shadow }}>
      <div style={{ display:"flex", justifyContent:"space-between",
        alignItems:"center", marginBottom:16 }}>
        <span style={{ fontFamily:sans, fontWeight:700, color:T.text, fontSize:F.md }}>Add manually</span>
        <button onClick={onClose} style={{ background:"none", border:"none",
          color:T.dim, cursor:"pointer", fontSize:18 }}>×</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:12 }}>
        <div>{lbl("Handle *")}{inp("handle","@username")}</div>
        <div>{lbl("Name")}{inp("name","Full name")}</div>
        <div>{lbl("Platform")}{sel("platform",["instagram","x","youtube","linkedin"])}</div>
        <div>{lbl("Type")}{sel("interaction_type",["follow","like","comment","mention","tag","view"])}</div>
        <div>{lbl("Followers")}{inp("followers","125000","number")}</div>
        <div>{lbl("List")}{sel("zone",["ELITE","INFLUENTIAL","SIGNAL","IGNORE"])}</div>
      </div>
      <div style={{ marginBottom:14 }}>{lbl("Bio")}{inp("bio","Short bio…")}</div>
      <button onClick={() => {
        if (!v.handle.trim()) return;
        onAdd({ ...v, handle:v.handle.trim().replace(/^@/,"").toLowerCase(),
          followers:parseInt(v.followers)||null });
        onClose();
      }} style={{ background:T.accent, color:"#fff", border:"none", borderRadius:9,
        padding:10, fontFamily:sans, fontSize:F.sm, fontWeight:700,
        cursor:"pointer", width:"100%" }}>Add interaction</button>
    </div>
  );
}

// ── Staging row (compact list item in split-pane) ─────────────────────────────
function StagingRow({ item, selected, onClick, rowRef }) {
  const zc   = ZC[item.zone] || ZC.SIGNAL;
  const plat = item.platform || "instagram";
  return (
    <div ref={rowRef} onClick={onClick}
      style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 14px",
        borderBottom:`1px solid ${T.border}`,
        background: selected ? T.well : "transparent",
        borderLeft: `3px solid ${selected ? zc.color : "transparent"}`,
        cursor:"pointer", transition:"background 0.1s" }}>
      <span style={{ fontSize:11, color:PLAT_COLOR[plat], flexShrink:0 }}>{PLAT_ICON[plat]}</span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:sans, fontSize:F.sm, fontWeight:600,
          color: selected ? T.text : T.sub,
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          @{item.handle}
          {item.verified && <span style={{ color:"#1D9BF0", fontSize:10, marginLeft:4 }}>✓</span>}
        </div>
        {item.followers && (
          <div style={{ fontFamily:sans, fontSize:F.xs, color:T.dim }}>{fmt(item.followers)} followers</div>
        )}
      </div>
      <span style={{ background:zc.bg, color:zc.color, border:`1px solid ${zc.border}`,
        borderRadius:4, padding:"1px 6px", fontSize:9, fontWeight:700,
        fontFamily:sans, flexShrink:0, letterSpacing:"0.04em" }}>
        {item.zone}
      </span>
    </div>
  );
}

// ── Profile detail panel ───────────────────────────────────────────────────────
function ProfilePanel({ item, idx, total, onUpdate, onRemove, onPrev, onNext }) {
  const zc   = ZC[item.zone] || ZC.SIGNAL;
  const plat = item.platform || "instagram";
  const profileUrl = PLAT_URL[plat]?.(item.handle);

  const field = (label, key, type = "text", placeholder = "") => (
    <div style={{ marginBottom:12 }}>
      <div style={{ fontFamily:sans, fontSize:F.xs, color:T.dim, fontWeight:600,
        textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:5 }}>{label}</div>
      <input
        type={type}
        value={item[key] ?? ""}
        placeholder={placeholder}
        onChange={e => onUpdate(key, type === "number" ? (parseInt(e.target.value)||null) : e.target.value)}
        style={{ background:T.well, border:`1px solid ${T.border}`, color:T.text,
          borderRadius:8, padding:"7px 11px", fontFamily:sans, fontSize:F.sm,
          outline:"none", width:"100%", boxSizing:"border-box" }} />
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      {/* Nav header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"12px 18px", borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <button onClick={onPrev} disabled={idx === 0}
            title="Previous (↑)"
            style={{ background:"none", border:`1px solid ${T.border}`, color: idx===0 ? T.dim : T.sub,
              borderRadius:6, width:26, height:26, cursor: idx===0 ? "default" : "pointer",
              fontFamily:sans, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center" }}>↑</button>
          <button onClick={onNext} disabled={idx === total - 1}
            title="Next (↓)"
            style={{ background:"none", border:`1px solid ${T.border}`, color: idx===total-1 ? T.dim : T.sub,
              borderRadius:6, width:26, height:26, cursor: idx===total-1 ? "default" : "pointer",
              fontFamily:sans, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center" }}>↓</button>
          <span style={{ fontFamily:sans, fontSize:F.xs, color:T.dim }}>{idx+1} / {total}</span>
        </div>
        <button onClick={onRemove}
          style={{ background:"none", border:`1px solid ${T.red}44`, color:T.red,
            borderRadius:7, padding:"3px 12px", fontFamily:sans, fontSize:F.xs,
            fontWeight:600, cursor:"pointer" }}>Remove</button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex:1, overflowY:"auto", padding:"20px 18px" }}>
        {/* Identity */}
        <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:20 }}>
          {item.avatar_url ? (
            <img src={item.avatar_url} alt="" style={{ width:48, height:48,
              borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
          ) : (
            <div style={{ width:48, height:48, borderRadius:"50%", background:T.well,
              border:`1px solid ${T.border}`, display:"flex", alignItems:"center",
              justifyContent:"center", flexShrink:0, fontSize:18, color:PLAT_COLOR[plat] }}>
              {PLAT_ICON[plat]}
            </div>
          )}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:4 }}>
              <a href={profileUrl} target="_blank" rel="noreferrer"
                style={{ fontFamily:sans, fontSize:F.md, fontWeight:700, color:T.text,
                  textDecoration:"none" }}
                onMouseEnter={e=>e.currentTarget.style.color=T.accent}
                onMouseLeave={e=>e.currentTarget.style.color=T.text}>
                @{item.handle}
              </a>
              {item.verified && <span style={{ color:"#1D9BF0", fontSize:12 }}>✓</span>}
              {item._wikiBio && (
                <span title="Bio sourced from Wikipedia"
                  style={{ fontSize:9, color:T.blue, background:T.blueBg,
                    border:`1px solid ${T.blue}30`, borderRadius:4,
                    padding:"2px 6px", fontFamily:sans, fontWeight:700 }}>WIKI</span>
              )}
            </div>
            {item.name && item.name !== item.handle && (
              <div style={{ fontFamily:sans, fontSize:F.sm, color:T.sub }}>{item.name}</div>
            )}
            {item.followers && (
              <div style={{ fontFamily:sans, fontSize:F.xs, color:T.dim, marginTop:2 }}>
                {fmt(item.followers)} followers
              </div>
            )}
          </div>
        </div>

        {/* Zone selector */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontFamily:sans, fontSize:F.xs, color:T.dim, fontWeight:600,
            textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:7 }}>List</div>
          <div style={{ display:"flex", gap:6 }}>
            {Object.entries(ZC).map(([z, zc2]) => (
              <button key={z} onClick={() => onUpdate("zone", z)}
                style={{ flex:1, padding:"6px 0", fontFamily:sans, fontSize:F.xs,
                  fontWeight:700, letterSpacing:"0.04em", cursor:"pointer",
                  borderRadius:7, border:`1px solid ${item.zone===z ? zc2.border : T.border}`,
                  background: item.zone===z ? zc2.bg : T.well,
                  color: item.zone===z ? zc2.color : T.dim,
                  transition:"all 0.1s" }}>
                {z}
              </button>
            ))}
          </div>
        </div>

        {/* Interaction type + source */}
        {(item.interaction_type || item._source) && (
          <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
            {item.interaction_type && (
              <span style={{ background:T.well, color:T.sub, border:`1px solid ${T.border}`,
                borderRadius:6, padding:"3px 10px", fontSize:F.xs, fontFamily:sans }}>
                {IX_ICON[item.interaction_type] || "•"} {item.interaction_type}
              </span>
            )}
            {item._source && (
              <span style={{ background:T.well, color:T.dim, border:`1px solid ${T.border}`,
                borderRadius:6, padding:"3px 10px", fontSize:F.xs, fontFamily:sans,
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:180 }}
                title={item._source}>
                {item._source}
              </span>
            )}
          </div>
        )}

        {/* Content */}
        {item.content && (
          <div style={{ background:T.well, border:`1px solid ${T.border}`, borderRadius:9,
            padding:"10px 12px", marginBottom:16, fontFamily:sans, fontSize:F.xs,
            color:T.sub, lineHeight:1.5 }}>
            "{item.content}"
          </div>
        )}

        {/* Editable fields */}
        {field("Name", "name", "text", "Display name")}
        {field("Followers", "followers", "number", "125000")}
        <div style={{ marginBottom:12 }}>
          <div style={{ fontFamily:sans, fontSize:F.xs, color:T.dim, fontWeight:600,
            textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:5 }}>Bio</div>
          <textarea
            value={item.bio ?? ""}
            placeholder="Short bio…"
            onChange={e => onUpdate("bio", e.target.value)}
            rows={3}
            style={{ background:T.well, border:`1px solid ${T.border}`, color:T.text,
              borderRadius:8, padding:"7px 11px", fontFamily:sans, fontSize:F.sm,
              outline:"none", width:"100%", resize:"vertical", boxSizing:"border-box",
              lineHeight:1.5 }} />
        </div>

        {/* External link */}
        <a href={profileUrl} target="_blank" rel="noreferrer"
          style={{ display:"inline-flex", alignItems:"center", gap:6,
            color:PLAT_COLOR[plat], fontFamily:sans, fontSize:F.xs,
            fontWeight:600, textDecoration:"none", opacity:0.8 }}
          onMouseEnter={e=>e.currentTarget.style.opacity="1"}
          onMouseLeave={e=>e.currentTarget.style.opacity="0.8"}>
          <span style={{ fontSize:12 }}>{PLAT_ICON[plat]}</span>
          View on {plat}
          <span style={{ fontSize:10 }}>↗</span>
        </a>
      </div>
    </div>
  );
}

// ── Saved interaction row ──────────────────────────────────────────────────────
function SavedRow({ ix }) {
  const zc   = ZC[ix.zone] || ZC.SIGNAL;
  const plat = ix.platform || "instagram";
  return (
    <div style={{ display:"grid",
      gridTemplateColumns:"24px minmax(140px,200px) 100px 80px 1fr 110px",
      gap:0, padding:"10px 20px", borderBottom:`1px solid ${T.border}`,
      alignItems:"center", background:"transparent",
      transition:"background 0.1s" }}
      onMouseEnter={e=>e.currentTarget.style.background="#16181D"}
      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>

      {/* Platform icon */}
      <span style={{ fontSize:12, color:PLAT_COLOR[plat] }}>{PLAT_ICON[plat]}</span>

      {/* Handle + name */}
      <div style={{ minWidth:0 }}>
        <a href={PLAT_URL[plat]?.(ix.handle)} target="_blank" rel="noreferrer"
          style={{ fontFamily:sans, fontSize:F.sm, fontWeight:600, color:T.text,
            textDecoration:"none", display:"block",
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}
          onMouseEnter={e=>e.currentTarget.style.color=T.accent}
          onMouseLeave={e=>e.currentTarget.style.color=T.text}>
          @{ix.handle}
        </a>
        {ix.name && ix.name !== ix.handle && (
          <div style={{ fontFamily:sans, fontSize:F.xs, color:T.dim,
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ix.name}</div>
        )}
      </div>

      {/* Zone badge */}
      <div>
        <span style={{ background:zc.bg, color:zc.color, border:`1px solid ${zc.border}`,
          borderRadius:5, padding:"2px 8px", fontSize:10, fontWeight:700, fontFamily:sans }}>
          {ix.zone}
        </span>
      </div>

      {/* Interaction type */}
      <div style={{ fontFamily:sans, fontSize:F.xs, color:T.sub,
        display:"flex", alignItems:"center", gap:4 }}>
        <span style={{ fontSize:11 }}>{IX_ICON[ix.interaction_type] || "•"}</span>
        <span style={{ textTransform:"capitalize" }}>{ix.interaction_type || "—"}</span>
      </div>

      {/* Content snippet */}
      <div style={{ fontFamily:sans, fontSize:F.xs, color:T.dim,
        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
        paddingRight:12 }}>{ix.content || "—"}</div>

      {/* Date */}
      <div style={{ fontFamily:sans, fontSize:F.xs, color:T.dim,
        textAlign:"right" }} title={fmtDateTime(ix.interacted_at)}>
        {fmtDate(ix.interacted_at)}
      </div>
    </div>
  );
}

// ── Pulse ─────────────────────────────────────────────────────────────────────
function Pulse({ label, color }) {
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:8,
      background:T.well, border:`1px solid ${T.border}`, borderRadius:20,
      padding:"5px 14px", fontFamily:sans, fontSize:F.xs, color }}>
      <span style={{ width:7, height:7, borderRadius:"50%", background:color,
        display:"inline-block", animation:"pulse 1.4s ease-in-out infinite" }} />
      {label}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function InteractionsPage() {
  // Saved interactions from DB
  const [saved,          setSaved]          = useState([]);
  const [loadingSaved,   setLoadingSaved]   = useState(true);
  const [savedFilter,    setSavedFilter]    = useState("ALL");
  const [savedSearch,    setSavedSearch]    = useState("");

  // Staging (pre-save)
  const [items,          setItems]          = useState([]);
  const [selectedIdx,    setSelectedIdx]    = useState(0);
  const [parsing,        setParsing]        = useState(false);
  const [enrichStatus,   setEnrichStatus]   = useState(null);
  const [saveStatus,     setSaveStatus]     = useState(null);
  const [saving,         setSaving]         = useState(false);
  const [showManual,     setShowManual]     = useState(false);
  const [filterZone,     setFilterZone]     = useState("ALL");
  const [knownProfiles,  setKnownProfiles]  = useState({});

  // Load saved interactions on mount
  const loadSaved = useCallback(async () => {
    setLoadingSaved(true);
    try {
      const res = await fetch("/api/interactions/list");
      const d   = await res.json();
      setSaved(d.interactions || []);
    } catch {}
    setLoadingSaved(false);
  }, []);

  useEffect(() => { loadSaved(); }, [loadSaved]);
  useEffect(() => {
    fetch("/api/elite/profiles").then(r=>r.json())
      .then(d=>{ if(d.profiles) setKnownProfiles(d.profiles); }).catch(()=>{});
  }, []);

  // Clamp selectedIdx when items change
  useEffect(() => {
    setSelectedIdx(i => Math.min(i, Math.max(0, filteredStaging.length - 1)));
  }, [items, filterZone]);

  // Keyboard navigation for staging queue
  const listRef = useRef(null);
  const rowRefs = useRef({});
  useEffect(() => {
    function onKey(e) {
      if (!filteredStaging.length) return;
      // Don't hijack when user is typing in an input/textarea
      if (["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName)) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx(i => {
          const next = Math.min(i + 1, filteredStaging.length - 1);
          rowRefs.current[next]?.scrollIntoView({ block:"nearest" });
          return next;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx(i => {
          const prev = Math.max(i - 1, 0);
          rowRefs.current[prev]?.scrollIntoView({ block:"nearest" });
          return prev;
        });
      } else if (e.key === "Backspace" || e.key === "Delete") {
        const item = filteredStaging[selectedIdx];
        if (item) setItems(prev => prev.filter(i => i._id !== item._id));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filteredStaging, selectedIdx]);

  const autofill = item => {
    const h = (item.handle||"").toLowerCase().replace(/^@/,"");
    const p = (item.platform||"instagram").toLowerCase();
    const k = knownProfiles[`${p}:${h}`]
      || Object.values(knownProfiles).find(x=>Object.values(x.handles||{}).map(v=>v.toLowerCase()).includes(h));
    if (!k) return item;
    return { ...item, name:k.name||item.name, followers:k.followers??item.followers,
      verified:k.verified??item.verified, bio:k.bio||item.bio,
      zone:k.zone||item.zone, on_watchlist:k.on_watchlist||false, _autofilled:true };
  };

  const toDataUrl  = f => new Promise(res=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(f); });
  const compress   = (dataUrl,maxW=1200,q=0.82) => new Promise(res=>{
    const img=new Image(); img.onload=()=>{
      const s=Math.min(1,maxW/img.width);
      const c=document.createElement("canvas");
      c.width=Math.round(img.width*s); c.height=Math.round(img.height*s);
      c.getContext("2d").drawImage(img,0,0,c.width,c.height);
      const full=c.toDataURL("image/jpeg",q); res({base64:full.split(",")[1],mediaType:"image/jpeg"});
    }; img.src=dataUrl;
  });

  const handleImages = async files => {
    if (parsing) return;
    setParsing(true); setSaveStatus(null);
    const images = await Promise.all(Array.from(files).map(async f=>{
      const preview=await toDataUrl(f);
      const {base64,mediaType}=await compress(preview);
      return {filename:f.name,base64,mediaType,preview};
    }));
    try {
      const res  = await fetch("/api/screenshots/parse",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({images:images.map(i=>({base64:i.base64,mediaType:i.mediaType,filename:i.filename}))}),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const results = data.results||[];
      const newItems = results.flatMap(r=>{
        const platCounts={};
        (r.interactions||[]).forEach(i=>{ if(i.platform) platCounts[i.platform]=(platCounts[i.platform]||0)+1; });
        const detPlat=Object.entries(platCounts).sort((a,b)=>b[1]-a[1])[0]?.[0]||"instagram";
        return (r.interactions||[]).map((item,idx)=>{
          const withPlat={...item,platform:item.platform||detPlat};
          return { ...autofill(withPlat), _id:`${r.filename}_${idx}_${Date.now()}`,
            _source:r.filename, zone:computeZone(withPlat) };
        });
      });
      setItems(prev=>{
        const map=new Map(prev.map(i=>[`${i.platform}:${i.handle}`,i]));
        for (const item of newItems) {
          const key=`${item.platform}:${item.handle}`;
          if (!map.has(key)) { map.set(key,item); continue; }
          const ex=map.get(key);
          const types=[...new Set([...(ex.interaction_type||"").split(","),
            ...(item.interaction_type||"").split(",")].filter(Boolean))].join(",");
          map.set(key,{...ex,interaction_type:types,
            followers:item.followers||ex.followers, verified:item.verified||ex.verified});
        }
        return Array.from(map.values());
      });
      setParsing(false);
      const toEnrich=newItems;
      if (toEnrich.length) await autoEnrich(toEnrich);
      // Thumbnails
      for (const img of images) {
        const result=results.find(r=>r.filename===img.filename);
        if (!result||result.error) continue;
        try {
          const {base64:thumb}=await compress(img.preview,300,0.72);
          const sr=await fetch("/api/screenshots/store",{
            method:"POST",headers:{"Content-Type":"application/json"},
            body:JSON.stringify({filename:img.filename,thumbnail:thumb,
              mediaType:"image/jpeg",platform:result.interactions?.[0]?.platform||"instagram",
              interactionCount:result.interactions?.length||0}),
          });
          const sd=await sr.json();
          if (sd.id) setItems(prev=>prev.map(i=>
            i._source===img.filename&&!i.screenshot_id
              ?{...i,screenshot_id:sd.id,_thumbUrl:sd.thumbnailUrl}:i));
        } catch {}
      }
    } catch(e) { setSaveStatus({error:e.message}); }
    setParsing(false);
  };

  const handleCSV = async file => {
    if (!file) return; setSaveStatus(null);
    try {
      const text=await file.text();
      const lines=text.trim().split("\n");
      const header=lines[0];
      const dataLines=lines.slice(1).filter(l=>l.trim());
      let totalImported=0;
      for (let i=0;i<dataLines.length;i+=500) {
        const chunk=[header,...dataLines.slice(i,i+500)].join("\n");
        const res=await fetch("/api/accounts/csv",{
          method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({csv:chunk,category:"SIGNAL"}),
        });
        const d=await res.json();
        if (d.error){setSaveStatus({error:d.error});return;}
        totalImported+=d.imported||0;
      }
      setSaveStatus({ok:`✓ ${totalImported} handles imported from CSV`});
      loadSaved();
    } catch(e) { setSaveStatus({error:e.message}); }
  };

  const autoEnrich = async targets => {
    if (!targets?.length) return;
    const WBATCH=8, FBATCH=3;
    const noBio=targets.filter(i=>i.name&&i.name!==i.handle&&!i.bio?.trim());
    for (let i=0;i<noBio.length;i+=WBATCH) {
      setEnrichStatus(`Wikipedia bios ${i+1}–${Math.min(i+WBATCH,noBio.length)} / ${noBio.length}`);
      try {
        const res=await fetch("/api/enrich/wikipedia",{
          method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({accounts:noBio.slice(i,i+WBATCH).map(t=>({handle:t.handle,name:t.name}))}),
        });
        const data=await res.json();
        if (data.results) setItems(prev=>{
          const u=[...prev];
          data.results.forEach(r=>{
            if (!r.found) return;
            const idx=u.findIndex(x=>x.handle?.toLowerCase()===r.handle?.toLowerCase());
            if (idx>=0&&!u[idx].bio?.trim()){
              u[idx]={...u[idx],bio:r.bio,_wikiBio:true};
              if (u[idx].zone!=="ELITE") u[idx].zone=computeZone(u[idx]);
            }
          }); return u;
        });
      } catch {}
    }
    const noFol=targets.filter(i=>!(parseInt(i.followers)>0));
    for (let i=0;i<noFol.length;i+=FBATCH) {
      setEnrichStatus(`Follower counts ${i+1}–${Math.min(i+FBATCH,noFol.length)} / ${noFol.length}`);
      try {
        const res=await fetch("/api/enrich/followers",{
          method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({accounts:noFol.slice(i,i+FBATCH).map(t=>({
            handle:t.handle,name:t.name||t.handle,platform:t.platform||"instagram"}))}),
        });
        const data=await res.json();
        if (data.results) setItems(prev=>{
          const u=[...prev];
          data.results.forEach(r=>{
            if (!r.found||!r.followers) return;
            const idx=u.findIndex(x=>x.handle?.toLowerCase()===r.handle?.toLowerCase());
            if (idx>=0&&!(parseInt(u[idx].followers)>0)){
              u[idx]={...u[idx],followers:r.followers};
              if (u[idx].zone!=="ELITE") u[idx].zone=computeZone(u[idx]);
            }
          }); return u;
        });
      } catch {}
    }
    setEnrichStatus(null);
  };

  const handleSave = async () => {
    const toSave=items.filter(i=>i.handle);
    if (!toSave.length) return;
    setSaving(true); setSaveStatus(null);
    try {
      const res=await fetch("/api/screenshots/save",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({interactions:toSave}),
      });
      const data=await res.json();
      if (data.error) setSaveStatus({error:data.error});
      else {
        setSaveStatus({ok:data.message||`✓ ${data.saved} saved`});
        setItems([]);
        await loadSaved(); // Refresh the saved list
      }
    } catch(e) { setSaveStatus({error:e.message}); }
    setSaving(false);
  };

  const updateItem = (id,k,v) => setItems(prev=>prev.map(i=>{
    if (i._id!==id) return i;
    const n={...i,[k]:v};
    if (k!=="zone"&&["name","bio","followers"].includes(k)) n.zone=computeZone(n);
    return n;
  }));

  // Saved interactions filtering
  const ZONES=["ALL","ELITE","INFLUENTIAL","SIGNAL","IGNORE"];
  const savedCounts=Object.fromEntries(ZONES.map(z=>[z,
    z==="ALL"?saved.length:saved.filter(i=>i.zone===z).length]));
  const filteredSaved=saved.filter(i=>{
    if (savedFilter!=="ALL"&&i.zone!==savedFilter) return false;
    if (!savedSearch) return true;
    const q=savedSearch.toLowerCase();
    return i.handle?.toLowerCase().includes(q)||i.name?.toLowerCase().includes(q)||
      i.content?.toLowerCase().includes(q)||i.interaction_type?.toLowerCase().includes(q);
  });

  // Staging filtering
  const stagingCounts=Object.fromEntries(ZONES.map(z=>[z,
    z==="ALL"?items.length:items.filter(i=>i.zone===z).length]));
  const filteredStaging=filterZone==="ALL"?items:items.filter(i=>i.zone===filterZone);

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:sans, padding:"36px 40px" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}*{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#2A2D38;border-radius:3px}
        input::placeholder{color:${T.dim}}`}</style>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between",
        alignItems:"flex-start", marginBottom:24, gap:16 }}>
        <div>
          <h1 style={{ margin:0, fontSize:F.xl, fontWeight:800, color:T.text,
            letterSpacing:"-0.02em" }}>Interactions</h1>
          <p style={{ margin:"5px 0 0", fontSize:F.sm, color:T.sub }}>
            {loadingSaved ? "Loading…" : `${saved.length.toLocaleString()} interactions saved · import screenshots or CSV to add more`}
          </p>
        </div>
        <button onClick={() => setShowManual(p=>!p)}
          style={{ background:showManual?T.well:T.accent, color:showManual?T.sub:"#fff",
            border:`1px solid ${showManual?T.border:"transparent"}`,
            borderRadius:10, padding:"9px 18px", fontFamily:sans, fontSize:F.sm,
            fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center",
            gap:8, transition:"all 0.15s", flexShrink:0 }}>
          <span style={{ fontSize:20, lineHeight:1, fontWeight:300 }}>+</span>
          Add manually
        </button>
      </div>

      {/* Manual panel */}
      {showManual && (
        <div style={{ marginBottom:20 }}>
          <ManualPanel onClose={()=>setShowManual(false)}
            onAdd={item=>{ setItems(prev=>[...prev,{...item,
              _id:`manual_${Date.now()}`,_source:"manual",
              zone:item.zone||computeZone(item)}]); setShowManual(false); }} />
        </div>
      )}

      {/* Drop zone */}
      <div style={{ marginBottom:20 }}>
        <DropZone onImages={handleImages} onCSV={handleCSV} disabled={parsing} />
      </div>

      {/* Parsing state */}
      {parsing && (
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14,
          padding:"36px 32px", textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:32, marginBottom:12 }}>🔍</div>
          <div style={{ fontSize:F.md, fontWeight:700, color:T.text, marginBottom:6 }}>Parsing screenshots…</div>
          <div style={{ fontSize:F.sm, color:T.sub }}>Claude Vision is reading each image</div>
        </div>
      )}

      {/* Status */}
      {(enrichStatus||saveStatus) && (
        <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
          {enrichStatus && <Pulse label={enrichStatus} color={T.blue} />}
          {saveStatus?.ok && (
            <div style={{ background:T.greenBg, border:`1px solid ${T.green}44`,
              color:T.green, borderRadius:8, padding:"6px 14px", fontSize:F.sm, fontFamily:sans }}>
              {saveStatus.ok}
            </div>
          )}
          {saveStatus?.error && (
            <div style={{ background:T.redBg, border:`1px solid ${T.red}44`,
              color:T.red, borderRadius:8, padding:"6px 14px", fontSize:F.sm, fontFamily:sans }}>
              ✗ {saveStatus.error}
            </div>
          )}
        </div>
      )}

      {/* ── STAGING QUEUE ──────────────────────────────────────────────────── */}
      {items.length > 0 && (
        <div style={{ marginBottom:32 }}>
          <div style={{ display:"flex", alignItems:"center",
            justifyContent:"space-between", marginBottom:12, flexWrap:"wrap", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontFamily:sans, fontSize:F.md, fontWeight:700, color:T.text }}>
                Review before saving
              </span>
              <span style={{ fontFamily:sans, fontSize:F.xs, color:T.dim }}>
                {items.length} item{items.length!==1?"s":""} · ↑↓ to navigate · ⌫ to remove
              </span>
            </div>
            <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
              {ZONES.filter(z=>stagingCounts[z]>0||z==="ALL").map(z=>{
                const active=filterZone===z; const zc=ZC[z];
                return (
                  <button key={z} onClick={()=>{ setFilterZone(z); setSelectedIdx(0); }} style={{
                    background:active?(zc?.bg||T.well):T.card,
                    color:active?(zc?.color||T.text):T.dim,
                    border:`1px solid ${active?(zc?.border||T.border):T.border}`,
                    borderRadius:7, padding:"3px 10px", fontFamily:sans, fontSize:F.xs,
                    fontWeight:700, cursor:"pointer", textTransform:"uppercase",
                    letterSpacing:"0.05em" }}>
                    {z} <span style={{ opacity:0.6 }}>({stagingCounts[z]})</span>
                  </button>
                );
              })}
              <label style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8,
                padding:"5px 12px", cursor:"pointer", fontFamily:sans, fontSize:F.sm,
                color:T.sub, fontWeight:600, display:"inline-flex", alignItems:"center", gap:5 }}>
                <span>↑</span> Add more
                <input type="file" multiple accept="image/*,.csv,.txt" style={{ display:"none" }}
                  onChange={e=>{
                    const fs=Array.from(e.target.files);
                    const imgs=fs.filter(f=>f.type.startsWith("image/"));
                    const csvs=fs.filter(f=>f.name.endsWith(".csv")||f.name.endsWith(".txt"));
                    if (imgs.length) handleImages(imgs);
                    if (csvs.length) handleCSV(csvs[0]);
                  }} />
              </label>
              <button onClick={handleSave} disabled={saving||!items.length} style={{
                background:T.accent, color:"#fff", border:"none", borderRadius:9,
                padding:"7px 18px", fontFamily:sans, fontSize:F.sm, fontWeight:700,
                cursor:saving?"not-allowed":"pointer", opacity:saving?0.7:1 }}>
                {saving?`Saving…`:`Save ${items.length}`}
              </button>
            </div>
          </div>

          {/* Split pane */}
          <div style={{ display:"flex", background:T.card,
            border:`1px solid ${T.border}`, borderRadius:14, overflow:"hidden",
            height:480 }}>

            {/* Left: scrollable list */}
            <div ref={listRef} style={{ width:260, flexShrink:0, overflowY:"auto",
              borderRight:`1px solid ${T.border}` }}>
              {filteredStaging.map((item, idx) => (
                <StagingRow
                  key={item._id}
                  item={item}
                  selected={idx === selectedIdx}
                  onClick={() => setSelectedIdx(idx)}
                  rowRef={el => rowRefs.current[idx] = el}
                />
              ))}
            </div>

            {/* Right: detail panel */}
            {filteredStaging[selectedIdx] ? (
              <div style={{ flex:1, minWidth:0 }}>
                <ProfilePanel
                  item={filteredStaging[selectedIdx]}
                  idx={selectedIdx}
                  total={filteredStaging.length}
                  onUpdate={(k,v) => updateItem(filteredStaging[selectedIdx]._id, k, v)}
                  onRemove={() => {
                    const id = filteredStaging[selectedIdx]._id;
                    setItems(prev => prev.filter(i => i._id !== id));
                  }}
                  onPrev={() => {
                    const prev = Math.max(selectedIdx - 1, 0);
                    setSelectedIdx(prev);
                    rowRefs.current[prev]?.scrollIntoView({ block:"nearest" });
                  }}
                  onNext={() => {
                    const next = Math.min(selectedIdx + 1, filteredStaging.length - 1);
                    setSelectedIdx(next);
                    rowRefs.current[next]?.scrollIntoView({ block:"nearest" });
                  }}
                />
              </div>
            ) : (
              <div style={{ flex:1, display:"flex", alignItems:"center",
                justifyContent:"center", color:T.dim, fontFamily:sans, fontSize:F.sm }}>
                Select a profile to review
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SAVED INTERACTIONS TABLE ──────────────────────────────────────── */}
      <div>
        <div style={{ display:"flex", alignItems:"center",
          justifyContent:"space-between", marginBottom:14, flexWrap:"wrap", gap:10 }}>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {ZONES.filter(z=>savedCounts[z]>0||z==="ALL").map(z=>{
              const active=savedFilter===z; const zc=ZC[z];
              return (
                <button key={z} onClick={()=>setSavedFilter(z)} style={{
                  background:active?(zc?.bg||T.well):T.card,
                  color:active?(zc?.color||T.text):T.dim,
                  border:`1px solid ${active?(zc?.border||T.border):T.border}`,
                  borderRadius:7, padding:"4px 12px", fontFamily:sans, fontSize:F.xs,
                  fontWeight:700, cursor:"pointer", textTransform:"uppercase",
                  letterSpacing:"0.05em", transition:"all 0.12s" }}>
                  {z} <span style={{ opacity:0.6 }}>({savedCounts[z]})</span>
                </button>
              );
            })}
          </div>
          <input value={savedSearch} placeholder="Search…"
            onChange={e=>setSavedSearch(e.target.value)}
            style={{ background:T.card, border:`1px solid ${T.border}`, color:T.text,
              borderRadius:8, padding:"6px 14px", fontFamily:sans, fontSize:F.sm,
              outline:"none", width:200 }} />
        </div>

        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, overflow:"hidden" }}>
          {/* Table header */}
          <div style={{ display:"grid",
            gridTemplateColumns:"24px minmax(140px,200px) 100px 80px 1fr 110px",
            padding:"9px 20px", borderBottom:`1px solid ${T.border}` }}>
            {["","Handle","List","Type","Content","When"].map((h,i)=>(
              <div key={i} style={{ fontSize:F.xs, fontWeight:700, color:T.dim,
                textTransform:"uppercase", letterSpacing:"0.06em" }}>{h}</div>
            ))}
          </div>

          {loadingSaved && (
            <div style={{ padding:40, textAlign:"center", color:T.dim, fontSize:F.sm }}>Loading…</div>
          )}
          {!loadingSaved && filteredSaved.length===0 && (
            <div style={{ padding:"48px 32px", textAlign:"center" }}>
              <div style={{ fontSize:28, marginBottom:10 }}>💬</div>
              <div style={{ color:T.dim, fontSize:F.sm }}>
                {savedSearch||savedFilter!=="ALL"
                  ? "No interactions match that filter."
                  : "No interactions saved yet — drop some screenshots above to get started."}
              </div>
            </div>
          )}
          {filteredSaved.map(ix=><SavedRow key={ix.id} ix={ix} />)}
        </div>
      </div>
    </div>
  );
}
