"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const sans = "'Inter', 'Segoe UI', system-ui, sans-serif";
const T = {
  bg: "#0F1117", card: "#16181E", border: "#1E2028", border2: "#2A2D3A",
  text: "#E8EAF0", sub: "#9095A8", dim: "#555B6E", well: "#1C1F28",
  accent: "#6C6FFF", accentBg: "#6C6FFF18", green: "#34D399", red: "#F87171",
};
const F = { xs: 11, sm: 13, md: 15 };
const ZONES = ["ELITE","INFLUENTIAL","SIGNAL","IGNORE"];
const ZC = {
  ELITE:       { color: "#6C6FFF", bg: "#6C6FFF18" },
  INFLUENTIAL: { color: "#F59E0B", bg: "#FFFBEB20" },
  SIGNAL:      { color: "#9095A8", bg: "#1C1F28"   },
  IGNORE:      { color: "#555B6E", bg: "#1C1F28"   },
};

function fmt(n) {
  if (!n) return "—";
  if (n >= 1_000_000) return (n/1_000_000).toFixed(1).replace(/\.0$/,"") + "M";
  if (n >= 1_000) return (n/1_000).toFixed(1).replace(/\.0$/,"") + "K";
  return n.toLocaleString();
}

const PLATS = ["instagram","x","youtube","linkedin"];
const PLAT_ICON = { instagram:"📸", x:"𝕏", youtube:"▶", linkedin:"in" };

export default function HandlesPage() {
  const [people, setPeople]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState("ALL");
  const [search, setSearch]         = useState("");
  const [csvCategory, setCsvCat]    = useState("SIGNAL");
  const [uploading, setUploading]   = useState(false);
  const [uploadMsg, setUploadMsg]   = useState("");
  const [editId, setEditId]         = useState(null);
  const [editVals, setEditVals]     = useState({});
  const [saving, setSaving]         = useState(false);
  const fileRef = useRef();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/accounts");
      const d = await r.json();
      setPeople(d.people || d.accounts || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Derive "primary" handle + followers for display
  function primaryHandle(p) {
    for (const plat of PLATS) if (p[`handle_${plat}`]) return { handle: p[`handle_${plat}`], platform: plat };
    return null;
  }
  function totalFollowers(p) {
    return PLATS.reduce((sum, pl) => sum + (p[`followers_${pl}`] || 0), 0);
  }

  const filtered = people.filter(p => {
    if (filter !== "ALL" && p.category !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return PLATS.some(pl => p[`handle_${pl}`]?.includes(q)) ||
        p.name?.toLowerCase().includes(q) || p.bio?.toLowerCase().includes(q);
    }
    return true;
  });

  const counts = ZONES.reduce((a, z) => ({ ...a, [z]: people.filter(p => p.category === z).length }), {});

  async function handleCSV(file) {
    if (!file) return;
    setUploading(true); setUploadMsg("");
    try {
      const csv = await file.text();
      const res = await fetch("/api/accounts/csv", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv, category: csvCategory }),
      });
      const data = await res.json();
      if (data.error) setUploadMsg("✗ " + data.error);
      else { setUploadMsg(`✓ ${data.imported} people imported as ${csvCategory}`); load(); }
    } catch { setUploadMsg("✗ Upload failed"); }
    setUploading(false);
  }

  async function saveEdit(id) {
    setSaving(true);
    try {
      await fetch("/api/accounts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...editVals }),
      });
      setPeople(prev => prev.map(p => p.id === id ? { ...p, ...editVals } : p));
      setEditId(null);
    } catch {}
    setSaving(false);
  }

  async function deletePerson(id) {
    if (!confirm("Remove this person? This will also delete all their interactions.")) return;
    await fetch("/api/accounts", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setPeople(prev => prev.filter(p => p.id !== id));
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: sans }}>
      {/* Header */}
      <div style={{ background: T.card, borderBottom: `1px solid ${T.border}`, padding: "0 32px", display: "flex", alignItems: "center", gap: 16, height: 56 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, background: T.accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, fontWeight: 800 }}>A</div>
          <span style={{ fontSize: F.sm, fontWeight: 700, color: T.text }}>Audian</span>
        </a>
        <span style={{ color: T.border2 }}>›</span>
        <span style={{ fontSize: F.sm, color: T.sub, fontWeight: 500 }}>Handles</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: F.xs, color: T.dim }}>{people.length} people tracked</span>
          <a href="/" style={{ fontSize: F.xs, color: T.sub, textDecoration: "none", padding: "6px 12px", borderRadius: 8, border: `1px solid ${T.border}` }}>← Dashboard</a>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 32px 80px" }}>

        {/* Title + CSV Import */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0, marginBottom: 4 }}>Handles</h1>
            <p style={{ fontSize: F.xs, color: T.dim, margin: 0 }}>All tracked people and organizations across platforms.</p>
          </div>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 18px", minWidth: 290 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.dim, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Import from CSV</div>
            <div style={{ fontSize: F.xs, color: T.sub, marginBottom: 10, lineHeight: 1.5 }}>
              Formats: <code style={{ background: T.well, padding: "1px 4px", borderRadius: 3 }}>handle</code>,{" "}
              <code style={{ background: T.well, padding: "1px 4px", borderRadius: 3 }}>platform,handle,name,bio</code>
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
              <span style={{ fontSize: 10, color: T.dim, alignSelf: "center" }}>List:</span>
              {ZONES.map(z => {
                const zc = ZC[z]; const active = csvCategory === z;
                return (
                  <button key={z} onClick={() => setCsvCat(z)}
                    style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5, cursor: "pointer",
                      border: `1px solid ${active ? zc.color : T.border}`,
                      background: active ? zc.bg : "transparent", color: active ? zc.color : T.dim }}>
                    {z}
                  </button>
                );
              })}
            </div>
            <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display: "none" }} onChange={e => handleCSV(e.target.files[0])} />
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                style={{ fontSize: F.xs, fontWeight: 600, padding: "6px 14px", borderRadius: 8, cursor: "pointer", background: T.accent, color: "#fff", border: "none" }}>
                {uploading ? "Importing…" : "↑ Upload CSV"}
              </button>
              {uploadMsg && <span style={{ fontSize: F.xs, color: uploadMsg.startsWith("✓") ? T.green : T.red }}>{uploadMsg}</span>}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          {["ALL", ...ZONES].map(z => {
            const active = filter === z; const zc = ZC[z];
            return (
              <button key={z} onClick={() => setFilter(z)}
                style={{ fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 20, cursor: "pointer",
                  border: active ? `1.5px solid ${zc?.color || T.accent}` : `1px solid ${T.border}`,
                  background: active ? (zc?.bg || T.accentBg) : "transparent",
                  color: active ? (zc?.color || T.accent) : T.dim,
                  display: "flex", alignItems: "center", gap: 5 }}>
                {z} <span style={{ fontWeight: 400, opacity: 0.7 }}>{z === "ALL" ? people.length : counts[z] || 0}</span>
              </button>
            );
          })}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
            style={{ marginLeft: "auto", background: T.card, border: `1px solid ${T.border}`, borderRadius: 8,
              padding: "5px 12px", fontFamily: sans, fontSize: F.xs, color: T.text, outline: "none", width: 180 }} />
        </div>

        {/* Table */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.8fr 80px 1.8fr 1.2fr 90px 28px", padding: "8px 20px", borderBottom: `1px solid ${T.border}` }}>
            {["Person", "List", "Bio", "Handles", "Followers", ""].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, color: T.dim, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
            ))}
          </div>

          {loading && <div style={{ padding: "32px", textAlign: "center", color: T.dim, fontSize: F.sm }}>Loading…</div>}
          {!loading && filtered.length === 0 && (
            <div style={{ padding: "32px", textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>👤</div>
              <div style={{ color: T.dim, fontSize: F.sm }}>{search ? `No matches for "${search}"` : "No people in this list."}</div>
            </div>
          )}

          {filtered.map(person => {
            const zc = ZC[person.category] || ZC.SIGNAL;
            const isEditing = editId === person.id;
            const ph = primaryHandle(person);
            const totalF = totalFollowers(person);

            return (
              <div key={person.id}>
                <div onClick={() => { setEditId(isEditing ? null : person.id); setEditVals({ name: person.name || "", bio: person.bio || "", category: person.category || "SIGNAL", followed_by: person.followed_by || "", notes: person.notes || "" }); }}
                  style={{ display: "grid", gridTemplateColumns: "1.8fr 80px 1.8fr 1.2fr 90px 28px", padding: "11px 20px",
                    borderBottom: `1px solid ${T.border}`, alignItems: "center", cursor: "pointer",
                    background: isEditing ? `${T.accent}08` : "transparent" }}
                  onMouseEnter={e => { if (!isEditing) e.currentTarget.style.background = T.well; }}
                  onMouseLeave={e => { if (!isEditing) e.currentTarget.style.background = "transparent"; }}>

                  {/* Name + primary handle */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: F.sm, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {person.name || ph?.handle || "—"}
                    </div>
                    {ph && (
                      <div style={{ fontSize: F.xs, color: T.dim, marginTop: 1 }}>
                        {PLAT_ICON[ph.platform]} @{ph.handle}
                      </div>
                    )}
                  </div>

                  {/* Category badge */}
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: zc.bg, color: zc.color, border: `1px solid ${zc.color}30` }}>
                      {person.category || "—"}
                    </span>
                  </div>

                  {/* Bio */}
                  <div style={{ fontSize: F.xs, color: T.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>
                    {person.bio || <span style={{ color: T.dim }}>—</span>}
                  </div>

                  {/* All handles */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                    {PLATS.filter(pl => person[`handle_${pl}`]).map(pl => (
                      <a key={pl} href={`https://${pl === 'x' ? 'x' : pl === 'instagram' ? 'instagram' : pl === 'youtube' ? 'youtube' : 'linkedin'}.com/${pl === 'youtube' ? '@' : ''}${person[`handle_${pl}`]}`}
                        target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                        style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4, background: T.well, border: `1px solid ${T.border}`, color: T.sub, textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
                        {PLAT_ICON[pl]} @{person[`handle_${pl}`]}
                      </a>
                    ))}
                    {!PLATS.some(pl => person[`handle_${pl}`]) && <span style={{ color: T.dim, fontSize: F.xs }}>—</span>}
                  </div>

                  {/* Total followers */}
                  <div style={{ fontSize: F.sm, color: totalF ? T.text : T.dim, fontWeight: totalF ? 500 : 400 }}>
                    {totalF > 0 ? fmt(totalF) : "—"}
                  </div>

                  {/* Delete */}
                  <button onClick={e => { e.stopPropagation(); deletePerson(person.id); }}
                    style={{ background: "none", border: "none", color: T.dim, cursor: "pointer", fontSize: 15, padding: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = T.red}
                    onMouseLeave={e => e.currentTarget.style.color = T.dim}>×</button>
                </div>

                {/* Edit panel */}
                {isEditing && (
                  <div style={{ background: T.well, borderBottom: `1px solid ${T.border}`, padding: "14px 20px" }}>
                    {/* Row 1: Name + Category + Followed by */}
                    <div style={{ display: "flex", gap: 14, marginBottom: 12, flexWrap: "wrap" }}>
                      <div style={{ flex: "1 1 140px" }}>
                        <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: T.dim, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>Name</label>
                        <input value={editVals.name} onChange={e => setEditVals(v => ({ ...v, name: e.target.value }))}
                          style={{ width: "100%", background: T.card, border: `1px solid ${T.border2}`, borderRadius: 7, padding: "6px 10px", fontFamily: sans, fontSize: F.xs, color: T.text, outline: "none", boxSizing: "border-box" }} />
                      </div>
                      <div style={{ flex: "0 0 130px" }}>
                        <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: T.dim, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>List</label>
                        <select value={editVals.category} onChange={e => setEditVals(v => ({ ...v, category: e.target.value }))}
                          style={{ width: "100%", background: T.card, border: `1px solid ${T.border2}`, borderRadius: 7, padding: "6px 10px", fontFamily: sans, fontSize: F.xs, color: T.text, outline: "none" }}>
                          {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                        </select>
                      </div>
                      <div style={{ flex: "1 1 180px" }}>
                        <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: T.dim, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>Followed by <span style={{ textTransform: "none", fontWeight: 400 }}>(@handles)</span></label>
                        <input value={editVals.followed_by} onChange={e => setEditVals(v => ({ ...v, followed_by: e.target.value }))}
                          placeholder="@handle1, @handle2…"
                          style={{ width: "100%", background: T.card, border: `1px solid ${T.border2}`, borderRadius: 7, padding: "6px 10px", fontFamily: sans, fontSize: F.xs, color: T.text, outline: "none", boxSizing: "border-box" }} />
                      </div>
                    </div>
                    {/* Row 2: Followers per platform */}
                    <div style={{ display: "flex", gap: 14, marginBottom: 12, flexWrap: "wrap" }}>
                      {PLATS.map(pl => (
                        <div key={pl} style={{ flex: "1 1 90px" }}>
                          <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: T.dim, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 5 }}>
                            {PLAT_ICON[pl]} followers
                          </label>
                          <input type="number" value={editVals[`followers_${pl}`] ?? person[`followers_${pl}`] ?? ""} 
                            onChange={e => setEditVals(v => ({ ...v, [`followers_${pl}`]: e.target.value }))}
                            placeholder="0"
                            style={{ width: "100%", background: T.card, border: `1px solid ${T.border2}`, borderRadius: 7, padding: "6px 10px", fontFamily: sans, fontSize: F.xs, color: T.text, outline: "none", boxSizing: "border-box" }} />
                        </div>
                      ))}
                    </div>
                    {/* Row 3: Bio */}
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: T.dim, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>Bio</label>
                      <textarea value={editVals.bio} onChange={e => setEditVals(v => ({ ...v, bio: e.target.value }))}
                        placeholder="Short bio or description…" rows={2}
                        style={{ width: "100%", background: T.card, border: `1px solid ${T.border2}`, borderRadius: 7, padding: "6px 10px", fontFamily: sans, fontSize: F.xs, color: T.text, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <button onClick={() => saveEdit(person.id)} disabled={saving}
                        style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 7, padding: "7px 18px", fontSize: F.xs, fontWeight: 600, cursor: "pointer" }}>
                        {saving ? "Saving…" : "Save"}
                      </button>
                      <button onClick={() => setEditId(null)}
                        style={{ background: "none", border: "none", color: T.dim, cursor: "pointer", fontSize: F.xs }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
