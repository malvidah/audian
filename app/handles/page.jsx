"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const sans = "'Inter', 'Segoe UI', system-ui, sans-serif";
const T = {
  bg: "#0F1117", card: "#16181E", border: "#1E2028", border2: "#2A2D3A",
  text: "#E8EAF0", sub: "#9095A8", dim: "#555B6E", well: "#1C1F28",
  accent: "#6C6FFF", accentBg: "#6C6FFF18",
  green: "#34D399", red: "#F87171",
};
const F = { xs: 11, sm: 13, md: 15 };
const ZONES = ["ELITE","INFLUENTIAL","SIGNAL","IGNORE"];
const ZC = {
  ELITE:       { color: "#6C6FFF", bg: "#6C6FFF18" },
  INFLUENTIAL: { color: "#F59E0B", bg: "#F59E0B15" },
  SIGNAL:      { color: "#9095A8", bg: "#1C1F28"   },
  IGNORE:      { color: "#555B6E", bg: "#1C1F28"   },
};
const PLAT_ICON = { instagram: "📸", x: "𝕏", youtube: "▶", linkedin: "in" };
const PLAT_URL  = {
  instagram: h => `https://instagram.com/${h}`,
  x:         h => `https://x.com/${h}`,
  youtube:   h => `https://youtube.com/@${h}`,
  linkedin:  h => `https://linkedin.com/in/${h}`,
};

function fmt(n) {
  if (!n) return null;
  if (n >= 1_000_000) return (n/1_000_000).toFixed(1).replace(/\.0$/,"") + "M";
  if (n >= 1_000)     return (n/1_000).toFixed(1).replace(/\.0$/,"") + "K";
  return n.toLocaleString();
}
function timeAgo(ts) {
  if (!ts) return null;
  const d = Math.floor((Date.now() - new Date(ts)) / 86400000);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 30)  return `${d}d ago`;
  if (d < 365) return `${Math.floor(d/30)}mo ago`;
  return `${Math.floor(d/365)}y ago`;
}

export default function HandlesPage() {
  const [handles, setHandles]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState("ALL");
  const [search, setSearch]           = useState("");
  const [editId, setEditId]           = useState(null);
  const [editVals, setEditVals]       = useState({});
  const [saving, setSaving]           = useState(false);
  const [csvZone, setCsvZone]         = useState("SIGNAL");
  const [uploading, setUploading]     = useState(false);
  const [uploadMsg, setUploadMsg]     = useState("");
  const [expandInteractions, setExpandInteractions] = useState({});
  const [interactions, setInteractions] = useState({});
  const fileRef = useRef();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/handles");
      const d = await res.json();
      setHandles(d.handles || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = handles.filter(h => {
    if (filter !== "ALL" && h.zone !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (h.name||"").toLowerCase().includes(q) ||
             (h.handle_instagram||"").includes(q) ||
             (h.handle_x||"").includes(q) ||
             (h.handle_youtube||"").includes(q) ||
             (h.handle_linkedin||"").includes(q) ||
             (h.bio||"").toLowerCase().includes(q);
    }
    return true;
  });

  const counts = ZONES.reduce((a,z) => ({...a, [z]: handles.filter(h=>h.zone===z).length}), {});

  async function handleCSV(file) {
    if (!file) return;
    setUploading(true); setUploadMsg("");
    try {
      const csv = await file.text();
      const res = await fetch("/api/accounts/csv", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv, category: csvZone }),
      });
      const d = await res.json();
      if (d.error) setUploadMsg("✗ " + d.error);
      else { setUploadMsg(`✓ ${d.imported} handles imported`); load(); }
    } catch { setUploadMsg("✗ Upload failed"); }
    setUploading(false);
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
    if (interactions[handleId]) return; // already loaded
    try {
      const res = await fetch(`/api/interactions/list?handle_id=${handleId}`);
      const d = await res.json();
      setInteractions(prev => ({ ...prev, [handleId]: d.interactions || [] }));
    } catch {}
  }

  function toggleInteractions(handleId) {
    const next = !expandInteractions[handleId];
    setExpandInteractions(prev => ({ ...prev, [handleId]: next }));
    if (next) loadInteractions(handleId);
  }

  // Get primary handle + followers for display
  function primary(h) {
    for (const p of ["instagram","x","youtube","linkedin"]) {
      if (h[`handle_${p}`]) return { platform: p, handle: h[`handle_${p}`], followers: h[`followers_${p}`] };
    }
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: sans }}>
      {/* Header */}
      <div style={{ background: T.card, borderBottom: `1px solid ${T.border}`,
        padding: "0 32px", display: "flex", alignItems: "center", gap: 16, height: 56 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, background: T.accent, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 15, fontWeight: 800 }}>A</div>
          <span style={{ fontSize: F.sm, fontWeight: 700, color: T.text }}>Audian</span>
        </a>
        <span style={{ color: T.border2, fontSize: 16 }}>›</span>
        <span style={{ fontSize: F.sm, color: T.sub, fontWeight: 500 }}>Handles</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: F.xs, color: T.dim }}>{handles.length.toLocaleString()} handles</span>
          <a href="/" style={{ fontSize: F.xs, color: T.sub, textDecoration: "none",
            padding: "6px 12px", borderRadius: 8, border: `1px solid ${T.border}` }}>← Dashboard</a>
        </div>
      </div>

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "28px 32px 80px" }}>

        {/* Title row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          marginBottom: 24, gap: 20, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0, marginBottom: 4 }}>Handles</h1>
            <p style={{ fontSize: F.xs, color: T.dim, margin: 0 }}>
              Everyone you track — people, orgs, brands — across all platforms.
            </p>
          </div>

          {/* CSV import */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
            padding: "14px 18px", minWidth: 300 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.dim, textTransform: "uppercase",
              letterSpacing: "0.06em", marginBottom: 10 }}>Import from CSV</div>
            <div style={{ fontSize: F.xs, color: T.sub, marginBottom: 10, lineHeight: 1.5 }}>
              Supports:{" "}
              <code style={{ background: T.well, padding: "1px 4px", borderRadius: 3 }}>handle</code>,{" "}
              <code style={{ background: T.well, padding: "1px 4px", borderRadius: 3 }}>platform,handle,name,bio</code>
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: T.dim }}>List:</span>
              {ZONES.map(z => {
                const zc = ZC[z]; const active = csvZone === z;
                return (
                  <button key={z} onClick={() => setCsvZone(z)}
                    style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5, cursor: "pointer",
                      border: `1px solid ${active ? zc.color : T.border}`,
                      background: active ? zc.bg : "transparent",
                      color: active ? zc.color : T.dim }}>
                    {z}
                  </button>
                );
              })}
            </div>
            <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display: "none" }}
              onChange={e => handleCSV(e.target.files[0])} />
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                style={{ fontSize: F.xs, fontWeight: 600, padding: "6px 14px", borderRadius: 8,
                  cursor: uploading ? "default" : "pointer",
                  background: T.accent, color: "#fff", border: "none", opacity: uploading ? 0.6 : 1 }}>
                {uploading ? "Importing…" : "↑ Upload CSV"}
              </button>
              {uploadMsg && (
                <span style={{ fontSize: F.xs, color: uploadMsg.startsWith("✓") ? T.green : T.red }}>
                  {uploadMsg}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Zone tabs + search */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          {["ALL", ...ZONES].map(z => {
            const active = filter === z;
            const zc = ZC[z];
            return (
              <button key={z} onClick={() => setFilter(z)}
                style={{ fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 20,
                  cursor: "pointer",
                  border: active ? `1.5px solid ${zc?.color || T.accent}` : `1px solid ${T.border}`,
                  background: active ? (zc?.bg || T.accentBg) : "transparent",
                  color: active ? (zc?.color || T.accent) : T.dim,
                  display: "flex", alignItems: "center", gap: 5 }}>
                {z}
                <span style={{ fontWeight: 400, opacity: 0.7 }}>
                  {z === "ALL" ? handles.length : (counts[z] || 0)}
                </span>
              </button>
            );
          })}
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search handles, names, bios…"
            style={{ marginLeft: "auto", background: T.card, border: `1px solid ${T.border}`,
              borderRadius: 8, padding: "5px 12px", fontFamily: sans, fontSize: F.xs,
              color: T.text, outline: "none", width: 220 }} />
        </div>

        {/* Table */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
          {/* Column headers */}
          <div style={{ display: "grid",
            gridTemplateColumns: "200px 70px 1fr 200px 90px 80px 28px",
            padding: "8px 20px", borderBottom: `1px solid ${T.border}`, alignItems: "center" }}>
            {["Name / Handle", "List", "Bio", "Platforms & Followers", "Interactions", "Last seen", ""].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, color: T.dim,
                textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
            ))}
          </div>

          {loading && (
            <div style={{ padding: "32px", textAlign: "center", color: T.dim, fontSize: F.sm }}>
              Loading…
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>👤</div>
              <div style={{ color: T.dim, fontSize: F.sm }}>
                {search ? `No results for "${search}"` : "No handles in this list yet. Import a CSV to get started."}
              </div>
            </div>
          )}

          {filtered.map(h => {
            const zc = ZC[h.zone] || ZC.SIGNAL;
            const isEditing = editId === h.id;
            const showInt = expandInteractions[h.id];
            const pri = primary(h);
            const followedByArr = (h.followed_by || "").split(",").map(s => s.trim().replace(/^@/,"")).filter(Boolean);

            return (
              <div key={h.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                {/* Main row */}
                <div
                  onClick={() => {
                    if (isEditing) { setEditId(null); return; }
                    setEditId(h.id);
                    setEditVals({
                      name: h.name || "", bio: h.bio || "", zone: h.zone,
                      followed_by: h.followed_by || "",
                      handle_instagram: h.handle_instagram || "",
                      handle_x: h.handle_x || "",
                      handle_youtube: h.handle_youtube || "",
                      handle_linkedin: h.handle_linkedin || "",
                      followers_instagram: h.followers_instagram || "",
                      followers_x: h.followers_x || "",
                      followers_youtube: h.followers_youtube || "",
                      followers_linkedin: h.followers_linkedin || "",
                    });
                  }}
                  style={{ display: "grid",
                    gridTemplateColumns: "200px 70px 1fr 200px 90px 80px 28px",
                    padding: "11px 20px", alignItems: "center", cursor: "pointer",
                    background: isEditing ? `${T.accent}08` : "transparent",
                    transition: "background 0.1s" }}
                  onMouseEnter={e => { if (!isEditing) e.currentTarget.style.background = T.well; }}
                  onMouseLeave={e => { if (!isEditing) e.currentTarget.style.background = "transparent"; }}>

                  {/* Name / primary handle */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: F.sm, fontWeight: 600, color: T.text,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>
                      {h.name || pri?.handle || "—"}
                    </div>
                    {pri && (
                      <a href={PLAT_URL[pri.platform]?.(pri.handle)} target="_blank" rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{ fontSize: F.xs, color: T.dim, textDecoration: "none",
                          display: "flex", alignItems: "center", gap: 3 }}
                        onMouseEnter={e => e.currentTarget.style.color = T.accent}
                        onMouseLeave={e => e.currentTarget.style.color = T.dim}>
                        <span>{PLAT_ICON[pri.platform]}</span>
                        @{pri.handle}
                      </a>
                    )}
                  </div>

                  {/* Zone badge */}
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                      background: zc.bg, color: zc.color, border: `1px solid ${zc.color}30` }}>
                      {h.zone}
                    </span>
                  </div>

                  {/* Bio */}
                  <div style={{ fontSize: F.xs, color: T.sub, overflow: "hidden", textOverflow: "ellipsis",
                    whiteSpace: "nowrap", paddingRight: 12 }}>
                    {h.bio || <span style={{ color: T.dim }}>—</span>}
                  </div>

                  {/* Platform handles + followers */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {["instagram","x","youtube","linkedin"].map(p => {
                      const hdl = h[`handle_${p}`];
                      const fol = h[`followers_${p}`];
                      if (!hdl) return null;
                      return (
                        <div key={p} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ fontSize: 10, color: T.dim, width: 14, flexShrink: 0 }}>
                            {PLAT_ICON[p]}
                          </span>
                          <a href={PLAT_URL[p]?.(hdl)} target="_blank" rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{ fontSize: F.xs, color: T.sub, textDecoration: "none",
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 90 }}
                            onMouseEnter={e => e.currentTarget.style.color = T.accent}
                            onMouseLeave={e => e.currentTarget.style.color = T.sub}>
                            @{hdl}
                          </a>
                          {fol && (
                            <span style={{ fontSize: 10, color: T.dim, flexShrink: 0 }}>{fmt(fol)}</span>
                          )}
                        </div>
                      );
                    })}
                    {!["instagram","x","youtube","linkedin"].some(p => h[`handle_${p}`]) && (
                      <span style={{ fontSize: F.xs, color: T.dim }}>—</span>
                    )}
                  </div>

                  {/* Interaction count + expand */}
                  <div>
                    {h.interaction_count > 0 ? (
                      <button onClick={e => { e.stopPropagation(); toggleInteractions(h.id); }}
                        style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 6,
                          cursor: "pointer", padding: "3px 8px", display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: F.xs, color: T.sub, fontWeight: 500 }}>
                          {h.interaction_count}
                        </span>
                        <span style={{ fontSize: 9, color: T.dim,
                          transform: showInt ? "rotate(180deg)" : "none", display: "inline-block", transition: "0.15s" }}>▾</span>
                      </button>
                    ) : (
                      <span style={{ fontSize: F.xs, color: T.dim }}>—</span>
                    )}
                  </div>

                  {/* Last seen */}
                  <div style={{ fontSize: F.xs, color: T.dim }}>
                    {timeAgo(h.last_interaction) || timeAgo(h.updated_at) || "—"}
                  </div>

                  {/* Delete */}
                  <button onClick={e => { e.stopPropagation(); deleteHandle(h.id); }}
                    style={{ background: "none", border: "none", color: T.dim,
                      cursor: "pointer", fontSize: 15, padding: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = T.red}
                    onMouseLeave={e => e.currentTarget.style.color = T.dim}>×</button>
                </div>

                {/* Interaction timeline */}
                {showInt && interactions[h.id] && (
                  <div style={{ background: "#0F1117", borderTop: `1px solid ${T.border}`,
                    padding: "10px 20px 12px 54px" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: T.dim, textTransform: "uppercase",
                      letterSpacing: "0.06em", marginBottom: 8 }}>Interaction history</div>
                    {interactions[h.id].length === 0 ? (
                      <div style={{ fontSize: F.xs, color: T.dim }}>No interactions linked yet.</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {interactions[h.id].slice(0, 20).map(ix => (
                          <div key={ix.id} style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                            <span style={{ fontSize: F.xs, color: T.dim, flexShrink: 0, width: 70 }}>
                              {timeAgo(ix.interacted_at)}
                            </span>
                            <span style={{ fontSize: F.xs, color: T.sub }}>
                              {ix.interaction_type || "interaction"}
                              {ix.content ? ` — ${ix.content.slice(0, 80)}` : ""}
                            </span>
                          </div>
                        ))}
                        {interactions[h.id].length > 20 && (
                          <div style={{ fontSize: F.xs, color: T.dim }}>
                            +{interactions[h.id].length - 20} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Edit panel */}
                {isEditing && (
                  <div style={{ background: T.well, borderTop: `1px solid ${T.border}`,
                    padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

                    {/* Row 1: name + bio + zone */}
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                      <div style={{ flex: "1 1 140px" }}>
                        <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: T.dim,
                          textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>Name</label>
                        <input value={editVals.name} onChange={e => setEditVals(v => ({...v, name: e.target.value}))}
                          style={inp} />
                      </div>
                      <div style={{ flex: "2 1 220px" }}>
                        <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: T.dim,
                          textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>Bio</label>
                        <textarea value={editVals.bio} onChange={e => setEditVals(v => ({...v, bio: e.target.value}))}
                          rows={2} style={{ ...inp, resize: "vertical" }} />
                      </div>
                      <div style={{ flex: "0 0 120px" }}>
                        <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: T.dim,
                          textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>List</label>
                        <select value={editVals.zone} onChange={e => setEditVals(v => ({...v, zone: e.target.value}))}
                          style={{ ...inp, cursor: "pointer" }}>
                          {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                        </select>
                      </div>
                      <div style={{ flex: "1 1 160px" }}>
                        <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: T.dim,
                          textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>
                          Followed by <span style={{ textTransform: "none", fontWeight: 400 }}>(@handles)</span>
                        </label>
                        <input value={editVals.followed_by}
                          onChange={e => setEditVals(v => ({...v, followed_by: e.target.value}))}
                          placeholder="@handle1, @handle2…" style={inp} />
                      </div>
                    </div>

                    {/* Row 2: per-platform handles + followers */}
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: T.dim, textTransform: "uppercase",
                        letterSpacing: "0.05em", marginBottom: 8 }}>Platforms</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                        {["instagram","x","youtube","linkedin"].map(p => (
                          <div key={p} style={{ background: T.card, borderRadius: 8,
                            border: `1px solid ${T.border}`, padding: "10px 12px" }}>
                            <div style={{ fontSize: 11, color: T.sub, marginBottom: 7, display: "flex",
                              alignItems: "center", gap: 5 }}>
                              <span>{PLAT_ICON[p]}</span>
                              <span style={{ textTransform: "capitalize" }}>{p}</span>
                            </div>
                            <input value={editVals[`handle_${p}`]}
                              onChange={e => setEditVals(v => ({...v, [`handle_${p}`]: e.target.value}))}
                              placeholder="@handle"
                              style={{ ...inp, marginBottom: 6, fontSize: 11 }} />
                            <input type="number" value={editVals[`followers_${p}`]}
                              onChange={e => setEditVals(v => ({...v, [`followers_${p}`]: e.target.value}))}
                              placeholder="Followers"
                              style={{ ...inp, fontSize: 11 }} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Save / cancel */}
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <button onClick={() => saveEdit(h.id)} disabled={saving}
                        style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 8,
                          padding: "7px 18px", fontSize: F.xs, fontWeight: 600, cursor: "pointer" }}>
                        {saving ? "Saving…" : "Save"}
                      </button>
                      <button onClick={() => setEditId(null)}
                        style={{ background: "none", border: "none", color: T.dim, cursor: "pointer", fontSize: F.xs }}>
                        Cancel
                      </button>
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

const inp = {
  width: "100%", boxSizing: "border-box",
  background: "#16181E", border: "1px solid #2A2D3A", borderRadius: 7,
  padding: "6px 10px", fontFamily: sans, fontSize: 11, color: "#E8EAF0",
  outline: "none",
};
