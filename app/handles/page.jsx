"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const sans = "'Inter', 'Segoe UI', system-ui, sans-serif";
const T = {
  bg: "#0F1117", card: "#16181E", border: "#1E2028", border2: "#2A2D3A",
  text: "#E8EAF0", sub: "#9095A8", dim: "#555B6E", well: "#1C1F28",
  accent: "#6C6FFF", accentBg: "#6C6FFF18", green: "#34D399", greenBg: "#34D39914",
  red: "#F87171", redBg: "#F8717114",
};
const F = { xs: 11, sm: 13, md: 15 };
const ZONES = ["ELITE","INFLUENTIAL","SIGNAL","IGNORE"];
const ZONE_COLORS = {
  ELITE:       { color: T.accent,   bg: T.accentBg },
  INFLUENTIAL: { color: "#F59E0B",  bg: "#FFFBEB20" },
  SIGNAL:      { color: T.sub,      bg: T.well },
  IGNORE:      { color: T.dim,      bg: T.well },
};

function fmt(n) {
  if (!n) return "—";
  if (n >= 1_000_000) return (n/1_000_000).toFixed(1).replace(/\.0$/,"") + "M";
  if (n >= 1_000) return (n/1_000).toFixed(1).replace(/\.0$/,"") + "K";
  return n.toLocaleString();
}

export default function HandlesPage() {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState("ALL");
  const [search, setSearch]             = useState("");
  const [csvCategory, setCsvCategory]   = useState("SIGNAL");
  const [uploading, setUploading]       = useState(false);
  const [uploadMsg, setUploadMsg]       = useState("");
  const [editId, setEditId]             = useState(null);
  const [editValues, setEditValues]     = useState({});
  const [saving, setSaving]             = useState(false);
  const fileRef = useRef();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/interactions/list");
      const data = await res.json();
      setInteractions(data.interactions || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = interactions.filter(i => {
    if (filter !== "ALL" && i.zone !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return i.handle?.toLowerCase().includes(q) || i.name?.toLowerCase().includes(q) || i.bio?.toLowerCase().includes(q);
    }
    return true;
  });

  const counts = ZONES.reduce((a,z) => ({ ...a, [z]: interactions.filter(i => i.zone === z).length }), {});

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
      else { setUploadMsg(`✓ ${data.imported} handles imported as ${csvCategory}`); load(); }
    } catch { setUploadMsg("✗ Upload failed"); }
    setUploading(false);
  }

  async function saveEdit(id) {
    setSaving(true);
    try {
      await fetch("/api/interactions/update", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, updates: editValues }),
      });
      setInteractions(prev => prev.map(i => i.id === id ? { ...i, ...editValues } : i));
      setEditId(null);
    } catch {}
    setSaving(false);
  }

  async function deleteHandle(id) {
    if (!confirm("Remove this handle?")) return;
    await fetch("/api/interactions/delete", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
    setInteractions(prev => prev.filter(i => i.id !== id));
  }

  const platIcon = { instagram:"📸", x:"𝕏", youtube:"▶", linkedin:"in" };

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
        <span style={{ color: T.border2 }}>›</span>
        <span style={{ fontSize: F.sm, color: T.sub, fontWeight: 500 }}>Handles</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: F.xs, color: T.dim }}>{interactions.length} total handles</span>
          <a href="/" style={{ fontSize: F.xs, color: T.sub, textDecoration: "none",
            padding: "6px 12px", borderRadius: 8, border: `1px solid ${T.border}` }}>← Dashboard</a>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 32px 80px" }}>

        {/* Title + Import row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0, marginBottom: 4 }}>Handles</h1>
            <p style={{ fontSize: F.xs, color: T.dim, margin: 0 }}>All tracked accounts across platforms, organized by list.</p>
          </div>

          {/* CSV Import card */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 18px", minWidth: 280 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.dim, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Import from CSV</div>
            <div style={{ fontSize: F.xs, color: T.sub, marginBottom: 10, lineHeight: 1.5 }}>
              Supports: <code style={{ background: T.well, padding: "1px 4px", borderRadius: 3 }}>handle</code>,{" "}
              <code style={{ background: T.well, padding: "1px 4px", borderRadius: 3 }}>platform,handle,name,bio</code>
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
              <span style={{ fontSize: 10, color: T.dim, alignSelf: "center" }}>List:</span>
              {ZONES.map(z => {
                const zc = ZONE_COLORS[z];
                const active = csvCategory === z;
                return (
                  <button key={z} onClick={() => setCsvCategory(z)}
                    style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5, cursor: "pointer",
                      border: `1px solid ${active ? zc.color : T.border}`,
                      background: active ? zc.bg : "transparent",
                      color: active ? zc.color : T.dim }}>
                    {z}
                  </button>
                );
              })}
            </div>
            <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display: "none" }} onChange={e => handleCSV(e.target.files[0])} />
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                style={{ fontSize: F.xs, fontWeight: 600, padding: "6px 14px", borderRadius: 8, cursor: "pointer",
                  background: T.accent, color: "#fff", border: "none" }}>
                {uploading ? "Importing…" : "↑ Upload CSV"}
              </button>
              {uploadMsg && <span style={{ fontSize: F.xs, color: uploadMsg.startsWith("✓") ? T.green : T.red }}>{uploadMsg}</span>}
            </div>
          </div>
        </div>

        {/* Zone filter + search */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          {["ALL", ...ZONES].map(z => {
            const active = filter === z;
            const zc = ZONE_COLORS[z];
            return (
              <button key={z} onClick={() => setFilter(z)}
                style={{ fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 20, cursor: "pointer",
                  border: active ? `1.5px solid ${zc?.color || T.accent}` : `1px solid ${T.border}`,
                  background: active ? (zc?.bg || T.accentBg) : "transparent",
                  color: active ? (zc?.color || T.accent) : T.dim,
                  display: "flex", alignItems: "center", gap: 5 }}>
                {z}
                {z !== "ALL" && <span style={{ fontWeight: 400, opacity: 0.7 }}>{counts[z] || 0}</span>}
                {z === "ALL" && <span style={{ fontWeight: 400, opacity: 0.7 }}>{interactions.length}</span>}
              </button>
            );
          })}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search handles…"
            style={{ marginLeft: "auto", background: T.card, border: `1px solid ${T.border}`, borderRadius: 8,
              padding: "5px 12px", fontFamily: sans, fontSize: F.xs, color: T.text, outline: "none", width: 180 }} />
        </div>

        {/* Table */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 80px 2fr 90px 100px 28px",
            padding: "8px 20px", borderBottom: `1px solid ${T.border}`, alignItems: "center" }}>
            {["Handle", "List", "Bio", "Followers", "Followed by", ""].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, color: T.dim, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
            ))}
          </div>

          {loading && (
            <div style={{ padding: "32px", textAlign: "center", color: T.dim, fontSize: F.sm }}>Loading handles…</div>
          )}
          {!loading && filtered.length === 0 && (
            <div style={{ padding: "32px", textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>👤</div>
              <div style={{ color: T.dim, fontSize: F.sm }}>
                {search ? `No handles matching "${search}"` : "No handles in this list yet."}
              </div>
            </div>
          )}

          {filtered.map(item => {
            const zc = ZONE_COLORS[item.zone] || ZONE_COLORS.SIGNAL;
            const isEditing = editId === item.id;
            const profileUrl = item.profile_url ||
              (item.platform === "instagram" ? `https://instagram.com/${item.handle}` :
               item.platform === "x" ? `https://x.com/${item.handle}` : null);
            const followedByArr = (item.followed_by || "").split(",").map(s => s.trim()).filter(Boolean);

            return (
              <div key={item.id}>
                {/* Row */}
                <div onClick={() => { setEditId(isEditing ? null : item.id); setEditValues({ bio: item.bio || "", followers: item.followers || "", followed_by: item.followed_by || "" }); }}
                  style={{ display: "grid", gridTemplateColumns: "1.6fr 80px 2fr 90px 100px 28px",
                    padding: "11px 20px", borderBottom: `1px solid ${T.border}`,
                    alignItems: "center", cursor: "pointer",
                    background: isEditing ? `${T.accent}08` : "transparent",
                    transition: "background 0.1s" }}
                  onMouseEnter={e => { if (!isEditing) e.currentTarget.style.background = T.well; }}
                  onMouseLeave={e => { if (!isEditing) e.currentTarget.style.background = "transparent"; }}>

                  {/* Handle */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                      {item.platform && <span style={{ fontSize: 9 }}>{platIcon[item.platform] || item.platform}</span>}
                      {profileUrl ? (
                        <a href={profileUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                          style={{ fontSize: F.sm, fontWeight: 600, color: T.text, textDecoration: "none",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          onMouseEnter={e => e.currentTarget.style.color = T.accent}
                          onMouseLeave={e => e.currentTarget.style.color = T.text}>
                          @{item.handle}
                        </a>
                      ) : (
                        <span style={{ fontSize: F.sm, fontWeight: 600, color: T.text }}>@{item.handle}</span>
                      )}
                      {item.verified && <span style={{ color: "#1D9BF0", fontSize: 11 }}>✓</span>}
                    </div>
                    {item.name && item.name !== item.handle && (
                      <div style={{ fontSize: F.xs, color: T.dim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                    )}
                  </div>

                  {/* List/Zone badge */}
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                      background: zc.bg, color: zc.color, border: `1px solid ${zc.color}30` }}>
                      {item.zone || "—"}
                    </span>
                  </div>

                  {/* Bio */}
                  <div style={{ fontSize: F.xs, color: T.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>
                    {item.bio || <span style={{ color: T.dim }}>—</span>}
                  </div>

                  {/* Followers */}
                  <div style={{ fontSize: F.sm, color: item.followers ? T.text : T.dim, fontWeight: item.followers ? 500 : 400 }}>
                    {fmt(item.followers)}
                  </div>

                  {/* Followed by */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                    {followedByArr.slice(0,2).map(h => (
                      <span key={h} style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4,
                        background: T.well, border: `1px solid ${T.border}`, color: T.sub }}>@{h}</span>
                    ))}
                    {followedByArr.length > 2 && <span style={{ fontSize: 9, color: T.dim }}>+{followedByArr.length-2}</span>}
                    {followedByArr.length === 0 && <span style={{ color: T.dim, fontSize: F.xs }}>—</span>}
                  </div>

                  {/* Delete */}
                  <button onClick={e => { e.stopPropagation(); deleteHandle(item.id); }}
                    style={{ background: "none", border: "none", color: T.dim, cursor: "pointer",
                      fontSize: 14, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                    onMouseEnter={e => e.currentTarget.style.color = T.red}
                    onMouseLeave={e => e.currentTarget.style.color = T.dim}>×</button>
                </div>

                {/* Expanded edit panel */}
                {isEditing && (
                  <div style={{ background: T.well, borderBottom: `1px solid ${T.border}`,
                    padding: "16px 20px", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>

                    {/* Bio */}
                    <div style={{ flex: "2 1 200px" }}>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: T.dim, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>Bio</label>
                      <textarea value={editValues.bio} onChange={e => setEditValues(v => ({ ...v, bio: e.target.value }))}
                        placeholder="Short bio or description…"
                        rows={2}
                        style={{ width: "100%", background: T.card, border: `1px solid ${T.border2}`, borderRadius: 8,
                          padding: "7px 10px", fontFamily: sans, fontSize: F.xs, color: T.text,
                          resize: "vertical", outline: "none", boxSizing: "border-box" }} />
                    </div>

                    {/* Followers */}
                    <div style={{ flex: "0 0 120px" }}>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: T.dim, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>Followers</label>
                      <input type="number" value={editValues.followers} onChange={e => setEditValues(v => ({ ...v, followers: e.target.value }))}
                        placeholder="0"
                        style={{ width: "100%", background: T.card, border: `1px solid ${T.border2}`, borderRadius: 8,
                          padding: "7px 10px", fontFamily: sans, fontSize: F.xs, color: T.text, outline: "none", boxSizing: "border-box" }} />
                    </div>

                    {/* Followed by */}
                    <div style={{ flex: "1 1 180px" }}>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: T.dim, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>Followed by <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(comma-separated @handles)</span></label>
                      <input value={editValues.followed_by} onChange={e => setEditValues(v => ({ ...v, followed_by: e.target.value }))}
                        placeholder="@handle1, @handle2…"
                        style={{ width: "100%", background: T.card, border: `1px solid ${T.border2}`, borderRadius: 8,
                          padding: "7px 10px", fontFamily: sans, fontSize: F.xs, color: T.text, outline: "none", boxSizing: "border-box" }} />
                    </div>

                    {/* Save */}
                    <div style={{ flex: "0 0 auto", paddingTop: 18 }}>
                      <button onClick={() => saveEdit(item.id)} disabled={saving}
                        style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 8,
                          padding: "7px 18px", fontSize: F.xs, fontWeight: 600, cursor: "pointer" }}>
                        {saving ? "Saving…" : "Save"}
                      </button>
                      <button onClick={() => setEditId(null)}
                        style={{ background: "none", border: "none", color: T.dim, cursor: "pointer",
                          fontSize: F.xs, marginLeft: 8 }}>Cancel</button>
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
