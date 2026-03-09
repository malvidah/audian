"use client";
import { useState, useCallback, useRef, useEffect } from "react";

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
const sans = "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif";
const F = { xl: 26, lg: 17, md: 14, sm: 12, xs: 11 };

const ZC = {
  ELITE:       { bg: T.purpleBg, color: T.purple,  border: "#3D3060" },
  INFLUENTIAL: { bg: T.accentBg, color: T.accent,   border: T.accentBorder },
  SIGNAL:      { bg: T.well,     color: T.sub,      border: T.border },
  IGNORE:      { bg: T.redBg,    color: "#666",     border: "#3A1A1A" },
};

const PLAT_ICON  = { instagram: "📸", x: "𝕏", youtube: "▶", linkedin: "in" };
const PLAT_COLOR = { instagram: "#E1306C", x: "#fff", youtube: "#FF0000", linkedin: "#0A66C2" };
const PLAT_URL   = {
  instagram: h => `https://instagram.com/${h}`,
  x:         h => `https://x.com/${h}`,
  youtube:   h => `https://youtube.com/@${h}`,
  linkedin:  h => `https://linkedin.com/in/${h}`,
};

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

function fmt(n) {
  if (!n) return null;
  if (n >= 1_000_000) return (n/1_000_000).toFixed(1).replace(/\.0$/,"") + "M";
  if (n >= 1_000)     return (n/1_000).toFixed(1).replace(/\.0$/,"") + "K";
  return n.toLocaleString();
}

// ── Drop Zone ──────────────────────────────────────────────────────────────
function DropZone({ onImages, onCSV, disabled }) {
  const [drag, setDrag] = useState(false);
  const imgRef = useRef();
  const csvRef = useRef();

  const handle = useCallback((files) => {
    const imgs = Array.from(files).filter(f => f.type.startsWith("image/"));
    const csvs = Array.from(files).filter(f => f.name.endsWith(".csv") || f.name.endsWith(".txt"));
    if (imgs.length) onImages(imgs);
    if (csvs.length) onCSV(csvs[0]);
  }, [onImages, onCSV]);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDrag(false); }}
      onDrop={e => { e.preventDefault(); setDrag(false); if (!disabled) handle(e.dataTransfer.files); }}
      style={{
        border: `2px dashed ${drag ? T.accent : "#2A2D38"}`,
        borderRadius: 18, padding: "56px 40px", textAlign: "center",
        background: drag ? T.accentBg : T.well,
        transition: "all 0.2s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 22 }}>
        {[
          { icon: "📸", label: "Screenshot" },
          { icon: "📄", label: "CSV" },
        ].map(({ icon, label }) => (
          <div key={label} style={{
            width: 64, height: 64, borderRadius: 16, background: T.card,
            border: `1px solid ${T.border}`, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 4,
            boxShadow: T.shadow,
          }}>
            <span style={{ fontSize: 26 }}>{icon}</span>
            <span style={{ fontSize: 9, color: T.dim, fontFamily: sans,
              textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: sans, fontSize: F.lg, fontWeight: 700, color: T.text, marginBottom: 8 }}>
        {drag ? "Drop to import" : "Drop screenshots or a CSV here"}
      </div>
      <div style={{ fontFamily: sans, fontSize: F.sm, color: T.sub, lineHeight: 1.8, marginBottom: 28 }}>
        Instagram · X · YouTube · LinkedIn<br />
        Screenshots parsed by AI — bios from Wikipedia — follower counts from web search
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button onClick={() => !disabled && imgRef.current?.click()} disabled={disabled}
          style={{
            background: T.accent, color: "#fff", border: "none",
            borderRadius: 10, padding: "10px 22px", fontFamily: sans,
            fontSize: F.sm, fontWeight: 700, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 7,
          }}>
          <span style={{ fontSize: 15 }}>↑</span> Upload screenshots
        </button>
        <button onClick={() => !disabled && csvRef.current?.click()} disabled={disabled}
          style={{
            background: T.card, color: T.sub, border: `1px solid ${T.border}`,
            borderRadius: 10, padding: "10px 22px", fontFamily: sans,
            fontSize: F.sm, fontWeight: 600, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 7,
          }}>
          <span>📄</span> Import CSV
        </button>
      </div>

      <input ref={imgRef} type="file" multiple accept="image/*"
        style={{ display: "none" }} onChange={e => handle(e.target.files)} />
      <input ref={csvRef} type="file" accept=".csv,.txt"
        style={{ display: "none" }} onChange={e => handle(e.target.files)} />
    </div>
  );
}

// ── Manual add ─────────────────────────────────────────────────────────────
function ManualPanel({ onAdd, onClose }) {
  const [v, setV] = useState({
    handle: "", name: "", bio: "", followers: "",
    platform: "instagram", interaction_type: "follow", zone: "SIGNAL",
  });
  const set = (k, val) => setV(p => ({ ...p, [k]: val }));
  const fld = (k, ph, type = "text") => (
    <input value={v[k]} type={type} placeholder={ph} onChange={e => set(k, e.target.value)}
      style={{ background: T.well, border: `1px solid ${T.border}`, color: T.text,
        borderRadius: 8, padding: "8px 12px", fontFamily: sans,
        fontSize: F.sm, outline: "none", width: "100%" }} />
  );
  const lbl = (text) => (
    <div style={{ fontSize: F.xs, color: T.dim, fontFamily: sans,
      textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>{text}</div>
  );
  const sel = (k, opts) => (
    <select value={v[k]} onChange={e => set(k, e.target.value)}
      style={{ background: T.well, border: `1px solid ${T.border}`, color: T.text,
        borderRadius: 8, padding: "8px 12px", fontFamily: sans,
        fontSize: F.sm, width: "100%", outline: "none" }}>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`,
      borderRadius: 14, padding: 20, boxShadow: T.shadow }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontFamily: sans, fontWeight: 700, color: T.text, fontSize: F.md }}>Add manually</span>
        <button onClick={onClose} style={{ background: "none", border: "none",
          color: T.dim, cursor: "pointer", fontSize: 18 }}>×</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>{lbl("Handle *")}{fld("handle", "@username")}</div>
        <div>{lbl("Name")}{fld("name", "Full name")}</div>
        <div>{lbl("Platform")}{sel("platform", ["instagram","x","youtube","linkedin"])}</div>
        <div>{lbl("Type")}{sel("interaction_type", ["follow","like","comment","mention","tag","view"])}</div>
        <div>{lbl("Followers")}{fld("followers", "125000", "number")}</div>
        <div>{lbl("List")}{sel("zone", ["ELITE","INFLUENTIAL","SIGNAL","IGNORE"])}</div>
      </div>
      <div style={{ marginBottom: 14 }}>{lbl("Bio")}{fld("bio", "Short description…")}</div>
      <button
        onClick={() => {
          if (!v.handle.trim()) return;
          onAdd({ ...v, handle: v.handle.trim().replace(/^@/,"").toLowerCase(),
            followers: parseInt(v.followers) || null });
          onClose();
        }}
        style={{ background: T.accent, color: "#fff", border: "none",
          borderRadius: 9, padding: "10px", fontFamily: sans,
          fontSize: F.sm, fontWeight: 700, cursor: "pointer", width: "100%" }}>
        Add interaction
      </button>
    </div>
  );
}

// ── Interaction card ────────────────────────────────────────────────────────
function ICard({ item, onUpdate, onRemove }) {
  const zc   = ZC[item.zone] || ZC.SIGNAL;
  const plat = item.platform || "instagram";

  return (
    <div style={{
      background: T.card, borderRadius: 12,
      border: `1px solid ${T.border}`,
      borderTop: `2px solid ${zc.color}`,
      padding: "14px 16px",
    }}>
      {/* Top row: platform icon + handle + badges */}
      <div style={{ display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", minWidth: 0 }}>
          <span style={{ fontSize: 13, color: PLAT_COLOR[plat], flexShrink: 0 }}>
            {PLAT_ICON[plat]}
          </span>
          <a href={PLAT_URL[plat]?.(item.handle)} target="_blank" rel="noreferrer"
            style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 700, color: T.text,
              textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis",
              whiteSpace: "nowrap" }}
            onMouseEnter={e => e.currentTarget.style.color = T.accent}
            onMouseLeave={e => e.currentTarget.style.color = T.text}>
            @{item.handle}
          </a>
          {item.verified && <span style={{ color: "#1D9BF0", fontSize: 11, flexShrink: 0 }}>✓</span>}
          <span style={{
            background: zc.bg, color: zc.color, border: `1px solid ${zc.border}`,
            borderRadius: 5, padding: "2px 8px", fontSize: 10, fontWeight: 700,
            fontFamily: sans, flexShrink: 0,
          }}>{item.zone}</span>
          {item.interaction_type && (
            <span style={{
              background: T.well, color: T.sub, border: `1px solid ${T.border}`,
              borderRadius: 5, padding: "2px 8px", fontSize: 10, fontFamily: sans, flexShrink: 0,
            }}>{item.interaction_type}</span>
          )}
          {item._wikiBio && (
            <span title="Bio from Wikipedia"
              style={{ fontSize: 9, color: T.blue, background: T.blueBg,
                border: `1px solid ${T.blue}30`, borderRadius: 4, padding: "1px 5px",
                fontFamily: sans, flexShrink: 0 }}>W</span>
          )}
        </div>
        {/* Actions */}
        <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
          {item.zone !== "ELITE" && (
            <button onClick={() => onUpdate("zone", "ELITE")}
              title="Mark as Elite"
              style={{ background: "none", border: `1px solid ${T.purple}44`, color: T.purple,
                borderRadius: 6, padding: "2px 8px", fontSize: 11, cursor: "pointer",
                fontFamily: sans, fontWeight: 600 }}>★</button>
          )}
          <button onClick={onRemove}
            style={{ background: "none", border: "none", color: T.dim,
              cursor: "pointer", fontSize: 17, lineHeight: 1, padding: "0 2px" }}
            onMouseEnter={e => e.currentTarget.style.color = T.red}
            onMouseLeave={e => e.currentTarget.style.color = T.dim}>×</button>
        </div>
      </div>

      {/* Name + followers */}
      {(item.name && item.name !== item.handle || item.followers) && (
        <div style={{ fontFamily: sans, fontSize: F.xs, color: T.sub, marginBottom: 4,
          display: "flex", gap: 8, alignItems: "center" }}>
          {item.name && item.name !== item.handle && <span>{item.name}</span>}
          {item.followers && (
            <span style={{ color: T.dim }}>{fmt(item.followers)} followers</span>
          )}
        </div>
      )}

      {/* Bio */}
      {item.bio && (
        <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.bio}
        </div>
      )}
    </div>
  );
}

// ── Pulse indicator ────────────────────────────────────────────────────────
function Pulse({ label, color }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8,
      background: T.well, border: `1px solid ${T.border}`, borderRadius: 20,
      padding: "5px 14px", fontFamily: sans, fontSize: F.xs, color }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: color,
        display: "inline-block", animation: "pulse 1.4s ease-in-out infinite" }} />
      {label}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function InteractionsPage() {
  const [items,         setItems]         = useState([]);
  const [parsing,       setParsing]       = useState(false);
  const [enrichStatus,  setEnrichStatus]  = useState(null);
  const [saveStatus,    setSaveStatus]    = useState(null);
  const [saving,        setSaving]        = useState(false);
  const [showManual,    setShowManual]    = useState(false);
  const [filterZone,    setFilterZone]    = useState("ALL");
  const [knownProfiles, setKnownProfiles] = useState({});

  useEffect(() => {
    fetch("/api/elite/profiles").then(r => r.json())
      .then(d => { if (d.profiles) setKnownProfiles(d.profiles); }).catch(() => {});
  }, []);

  const autofill = item => {
    const h = (item.handle || "").toLowerCase().replace(/^@/, "");
    const p = (item.platform || "instagram").toLowerCase();
    const k = knownProfiles[`${p}:${h}`]
      || Object.values(knownProfiles).find(x =>
          Object.values(x.handles || {}).map(v => v.toLowerCase()).includes(h));
    if (!k) return item;
    return { ...item, name: k.name || item.name, followers: k.followers ?? item.followers,
      verified: k.verified ?? item.verified, bio: k.bio || item.bio,
      zone: k.zone || item.zone, on_watchlist: k.on_watchlist || false, _autofilled: true };
  };

  const toDataUrl  = f => new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(f); });
  const compress   = (dataUrl, maxW = 1200, q = 0.82) => new Promise(res => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, maxW / img.width);
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      const full = c.toDataURL("image/jpeg", q);
      res({ base64: full.split(",")[1], mediaType: "image/jpeg" });
    };
    img.src = dataUrl;
  });

  const handleImages = async files => {
    if (parsing) return;
    setParsing(true); setSaveStatus(null);
    const images = await Promise.all(Array.from(files).map(async f => {
      const preview = await toDataUrl(f);
      const { base64, mediaType } = await compress(preview);
      return { filename: f.name, base64, mediaType, preview };
    }));
    try {
      const res  = await fetch("/api/screenshots/parse", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: images.map(i => ({
          base64: i.base64, mediaType: i.mediaType, filename: i.filename })) }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const results = data.results || [];

      // Detect platform per result
      const newItems = results.flatMap(r => {
        const platCounts = {};
        (r.interactions || []).forEach(i => { if (i.platform) platCounts[i.platform] = (platCounts[i.platform]||0)+1; });
        const detPlat = Object.entries(platCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || "instagram";
        return (r.interactions || []).map((item, idx) => {
          const withPlat = { ...item, platform: item.platform || detPlat };
          return {
            ...autofill(withPlat),
            _id: `${r.filename}_${idx}_${Date.now()}`,
            _source: r.filename,
            zone: computeZone(withPlat),
          };
        });
      });

      setItems(prev => {
        const map = new Map(prev.map(i => [`${i.platform}:${i.handle}`, i]));
        for (const item of newItems) {
          const key = `${item.platform}:${item.handle}`;
          if (!map.has(key)) { map.set(key, item); continue; }
          const ex    = map.get(key);
          const types = [...new Set([...(ex.interaction_type||"").split(","),
            ...(item.interaction_type||"").split(",")].filter(Boolean))].join(",");
          map.set(key, { ...ex, interaction_type: types,
            followers: item.followers || ex.followers,
            verified: item.verified || ex.verified });
        }
        return Array.from(map.values());
      });
      setParsing(false);
      if (newItems.length) await autoEnrich(newItems);

      // Thumbnails
      for (const img of images) {
        const result = results.find(r => r.filename === img.filename);
        if (!result || result.error) continue;
        try {
          const { base64: thumb } = await compress(img.preview, 300, 0.72);
          const sr   = await fetch("/api/screenshots/store", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename: img.filename, thumbnail: thumb,
              mediaType: "image/jpeg",
              platform: result.interactions?.[0]?.platform || "instagram",
              interactionCount: result.interactions?.length || 0 }),
          });
          const sd = await sr.json();
          if (sd.id) {
            setItems(prev => prev.map(i =>
              i._source === img.filename && !i.screenshot_id
                ? { ...i, screenshot_id: sd.id, _thumbUrl: sd.thumbnailUrl } : i));
          }
        } catch {}
      }
    } catch (e) { setSaveStatus({ error: e.message }); }
    setParsing(false);
  };

  const handleCSV = async file => {
    if (!file) return;
    setSaveStatus(null);
    try {
      const text = await file.text();
      const res  = await fetch("/api/accounts/csv", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: text, category: "SIGNAL" }),
      });
      const d = await res.json();
      setSaveStatus(d.error
        ? { error: d.error }
        : { ok: `✓ ${d.imported} handles imported${d.skipped ? `, ${d.skipped} skipped` : ""}` });
    } catch (e) { setSaveStatus({ error: e.message }); }
  };

  const autoEnrich = async targets => {
    if (!targets?.length) return;
    const WBATCH = 8, FBATCH = 3;
    const noBio = targets.filter(i => i.name && i.name !== i.handle && !i.bio?.trim());
    for (let i = 0; i < noBio.length; i += WBATCH) {
      setEnrichStatus(`Wikipedia bios ${i+1}–${Math.min(i+WBATCH,noBio.length)} / ${noBio.length}`);
      try {
        const res  = await fetch("/api/enrich/wikipedia", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accounts: noBio.slice(i,i+WBATCH).map(t => ({ handle: t.handle, name: t.name })) }),
        });
        const data = await res.json();
        if (data.results) setItems(prev => {
          const u = [...prev];
          data.results.forEach(r => {
            if (!r.found) return;
            const idx = u.findIndex(x => x.handle?.toLowerCase() === r.handle?.toLowerCase());
            if (idx >= 0 && !u[idx].bio?.trim()) {
              u[idx] = { ...u[idx], bio: r.bio, _wikiBio: true };
              if (u[idx].zone !== "ELITE") u[idx].zone = computeZone(u[idx]);
            }
          });
          return u;
        });
      } catch {}
    }
    const noFol = targets.filter(i => !(parseInt(i.followers) > 0));
    for (let i = 0; i < noFol.length; i += FBATCH) {
      setEnrichStatus(`Follower counts ${i+1}–${Math.min(i+FBATCH,noFol.length)} / ${noFol.length}`);
      try {
        const res  = await fetch("/api/enrich/followers", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accounts: noFol.slice(i,i+FBATCH).map(t => ({
            handle: t.handle, name: t.name||t.handle, platform: t.platform||"instagram" })) }),
        });
        const data = await res.json();
        if (data.results) setItems(prev => {
          const u = [...prev];
          data.results.forEach(r => {
            if (!r.found || !r.followers) return;
            const idx = u.findIndex(x => x.handle?.toLowerCase() === r.handle?.toLowerCase());
            if (idx >= 0 && !(parseInt(u[idx].followers) > 0)) {
              u[idx] = { ...u[idx], followers: r.followers };
              if (u[idx].zone !== "ELITE") u[idx].zone = computeZone(u[idx]);
            }
          });
          return u;
        });
      } catch {}
    }
    setEnrichStatus(null);
  };

  const handleSave = async () => {
    const toSave = items.filter(i => i.handle);
    if (!toSave.length) return;
    setSaving(true); setSaveStatus(null);
    try {
      const res  = await fetch("/api/screenshots/save", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interactions: toSave }),
      });
      const data = await res.json();
      setSaveStatus(data.error ? { error: data.error } : { ok: data.message || `✓ ${data.saved} saved` });
      if (!data.error) setItems([]);
    } catch (e) { setSaveStatus({ error: e.message }); }
    setSaving(false);
  };

  const ZONES   = ["ALL","ELITE","INFLUENTIAL","SIGNAL","IGNORE"];
  const counts  = Object.fromEntries(ZONES.map(z => [z, z === "ALL" ? items.length : items.filter(i => i.zone === z).length]));
  const filtered = filterZone === "ALL" ? items : items.filter(i => i.zone === filterZone);

  const updateItem = (id, k, v) => setItems(prev => prev.map(i => {
    if (i._id !== id) return i;
    const n = { ...i, [k]: v };
    if (k !== "zone" && ["name","bio","followers"].includes(k)) n.zone = computeZone(n);
    return n;
  }));

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: sans, padding: "36px 40px" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.35} }
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:#2A2D38;border-radius:3px}
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 32, gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: F.xl, fontWeight: 800, color: T.text,
            letterSpacing: "-0.02em" }}>Interactions</h1>
          <p style={{ margin: "5px 0 0", fontSize: F.sm, color: T.sub }}>
            Import screenshots or CSV · AI parses, wiki enriches bios, web search pulls follower counts
          </p>
        </div>
        <button onClick={() => setShowManual(p => !p)}
          style={{
            background: showManual ? T.well : T.accent,
            color: showManual ? T.sub : "#fff",
            border: `1px solid ${showManual ? T.border : "transparent"}`,
            borderRadius: 10, padding: "9px 18px", fontFamily: sans,
            fontSize: F.sm, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
            transition: "all 0.15s",
          }}>
          <span style={{ fontSize: 20, lineHeight: 1, fontWeight: 300 }}>+</span>
          Add manually
        </button>
      </div>

      {/* Manual panel */}
      {showManual && (
        <div style={{ marginBottom: 24 }}>
          <ManualPanel
            onClose={() => setShowManual(false)}
            onAdd={item => {
              setItems(prev => [...prev, { ...item, _id: `manual_${Date.now()}`,
                _source: "manual", zone: item.zone || computeZone(item) }]);
              setShowManual(false);
            }}
          />
        </div>
      )}

      {/* Drop zone — shown when empty and not parsing */}
      {!parsing && items.length === 0 && (
        <div style={{ marginBottom: 24 }}>
          <DropZone onImages={handleImages} onCSV={handleCSV} disabled={false} />
        </div>
      )}

      {/* Parsing */}
      {parsing && (
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16,
          padding: "48px 32px", textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>🔍</div>
          <div style={{ fontSize: F.md, fontWeight: 700, color: T.text, marginBottom: 6 }}>
            Parsing screenshots…
          </div>
          <div style={{ fontSize: F.sm, color: T.sub }}>
            Claude Vision is reading each image and extracting interactions
          </div>
        </div>
      )}

      {/* Status */}
      {(enrichStatus || saveStatus) && (
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          {enrichStatus && <Pulse label={enrichStatus} color={T.blue} />}
          {saveStatus?.ok && (
            <div style={{ background: T.greenBg, border: `1px solid ${T.green}44`,
              color: T.green, borderRadius: 8, padding: "6px 14px",
              fontSize: F.sm, fontFamily: sans }}>{saveStatus.ok}</div>
          )}
          {saveStatus?.error && (
            <div style={{ background: T.redBg, border: `1px solid ${T.red}44`,
              color: T.red, borderRadius: 8, padding: "6px 14px",
              fontSize: F.sm, fontFamily: sans }}>✗ {saveStatus.error}</div>
          )}
        </div>
      )}

      {/* Items */}
      {items.length > 0 && (
        <>
          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: 16,
            flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {ZONES.filter(z => counts[z] > 0 || z === "ALL").map(z => {
                const active = filterZone === z;
                const zc     = ZC[z];
                return (
                  <button key={z} onClick={() => setFilterZone(z)} style={{
                    background: active ? (zc?.bg || T.well) : T.card,
                    color:      active ? (zc?.color || T.text) : T.dim,
                    border: `1px solid ${active ? (zc?.border || T.border) : T.border}`,
                    borderRadius: 7, padding: "4px 12px", fontFamily: sans,
                    fontSize: F.xs, fontWeight: 700, cursor: "pointer",
                    textTransform: "uppercase", letterSpacing: "0.05em",
                    transition: "all 0.12s",
                  }}>
                    {z} <span style={{ opacity: 0.6 }}>({counts[z]})</span>
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <label style={{ background: T.card, border: `1px solid ${T.border}`,
                borderRadius: 8, padding: "7px 14px", cursor: "pointer",
                fontFamily: sans, fontSize: F.sm, color: T.sub, fontWeight: 600,
                display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span>↑</span> Add more
                <input type="file" multiple accept="image/*,.csv,.txt" style={{ display: "none" }}
                  onChange={e => {
                    const fs = Array.from(e.target.files);
                    const imgs = fs.filter(f => f.type.startsWith("image/"));
                    const csvs = fs.filter(f => f.name.endsWith(".csv") || f.name.endsWith(".txt"));
                    if (imgs.length) handleImages(imgs);
                    if (csvs.length) handleCSV(csvs[0]);
                  }} />
              </label>
              <button onClick={handleSave} disabled={saving || !items.length} style={{
                background: T.accent, color: "#fff", border: "none",
                borderRadius: 9, padding: "7px 20px", fontFamily: sans,
                fontSize: F.sm, fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1, transition: "opacity 0.15s",
              }}>
                {saving ? "Saving…" : `Save ${items.length}`}
              </button>
            </div>
          </div>

          {/* Cards grid */}
          <div style={{ display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
            {filtered.map(item => (
              <ICard key={item._id} item={item}
                onUpdate={(k, v) => updateItem(item._id, k, v)}
                onRemove={() => setItems(prev => prev.filter(i => i._id !== item._id))} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px", color: T.dim,
              fontSize: F.sm, fontFamily: sans }}>No {filterZone} interactions</div>
          )}
        </>
      )}
    </div>
  );
}
