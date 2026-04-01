"use client";
import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const T = {
  bg: "#F8F7F5", surface: "#FFFFFF", card: "#FFFFFF", well: "#F3F2F0",
  border: "#E8E6E1", border2: "#D6D3CC", text: "#1A1816", sub: "#6B6560",
  dim: "#A8A39C", accent: "#FF6B35", accentBg: "#FFF3EE", accentBorder: "#FFD4C2",
  green: "#16A34A", greenBg: "#F0FDF4", greenBorder: "#BBF7D0",
  yellow: "#CA8A04", yellowBg: "#FEFCE8", yellowBorder: "#FEF08A",
  red: "#DC2626", redBg: "#FEF2F2", redBorder: "#FECACA",
  blue: "#2563EB", blueBg: "#EFF6FF", blueBorder: "#BFDBFE",
  purple: "#7C3AED", purpleBg: "#F5F3FF", purpleBorder: "#DDD6FE",
  shadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
  shadowSm: "0 1px 2px rgba(0,0,0,0.05)",
  shadowMd: "0 4px 24px rgba(0,0,0,0.08)",
};

const PLAT_COLORS = { youtube: "#FF0000", x: "#000000", instagram: "#E1306C", linkedin: "#0077B5" };
const PLAT_LABEL = { youtube: "YouTube", x: "X", instagram: "Instagram", linkedin: "LinkedIn" };
const PLAT_ICON = { youtube: "▶", x: "𝕏", instagram: "◉", linkedin: "in" };
const PLAT_URL = {
  instagram: h => `https://instagram.com/${h}`,
  x: h => `https://x.com/${h}`,
  youtube: h => `https://youtube.com/@${h}`,
  linkedin: h => `https://linkedin.com/in/${h}`,
};

const sans = "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif";
const F = { xl: 28, lg: 20, md: 15, sm: 13, xs: 11 };

const ZONE_CFG = {
  ELITE:       { label: "ELITE", color: T.accent, bg: T.accentBg, border: T.accentBorder },
  INFLUENTIAL: { label: "INFLUENTIAL", color: T.green, bg: T.greenBg, border: T.greenBorder },
  SIGNAL:      { label: "SIGNAL", color: T.blue, bg: T.blueBg, border: T.blueBorder },
  IGNORE:      { label: "IGNORE", color: T.dim, bg: T.well, border: T.border },
};

const LIST_ORDER = ["ELITE", "INFLUENTIAL", "SIGNAL", "IGNORE"];

const PLAT_OPTIONS = [
  { value: "x", label: "X" }, { value: "instagram", label: "IG" },
  { value: "youtube", label: "YT" }, { value: "linkedin", label: "LI" },
];
const TYPE_OPTIONS = [
  { value: "mention", label: "Mention" }, { value: "repost", label: "Repost" },
  { value: "comment", label: "Comment" }, { value: "reply", label: "Reply" },
  { value: "like", label: "Like" }, { value: "follow", label: "Follow" },
  { value: "tag", label: "Tag" },
];
const ZONE_OPTIONS = [
  { value: "ELITE", label: "Elite" }, { value: "INFLUENTIAL", label: "Influential" },
  { value: "SIGNAL", label: "Signal" },
];

const EMPTY_ROW = {
  name: "", platform: "x", handle: "", interaction_type: "mention",
  content: "", mention_url: "", followers: "", zone: "SIGNAL",
  interacted_at: new Date().toISOString().slice(0, 10),
};

function fmt(n) {
  if (!n && n !== 0) return "—";
  n = parseInt(n, 10);
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
}

function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function truncate(str, max) {
  if (!str) return "—";
  return str.length > max ? str.slice(0, max) + "..." : str;
}

function normalizeZone(zone) {
  return LIST_ORDER.includes(zone) ? zone : "UNASSIGNED";
}

function isCommentType(type) {
  return ["comment", "commented", "reply"].includes((type || "").toLowerCase());
}

function normalizeType(type) {
  const raw = (type || "").toLowerCase();
  if (raw === "liked") return "like";
  if (raw === "followed") return "follow";
  if (raw === "commented") return "comment";
  if (raw === "reposted") return "repost";
  if (raw === "mentioned") return "mention";
  return raw || "unknown";
}

function IgIcon({ size = 16, color = "#E1306C" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4.5"/>
      <circle cx="17.5" cy="6.5" r="1" fill={color} stroke="none"/>
    </svg>
  );
}

function StatCard({ label, value, color = T.text, active = false, onClick, clickable = false }) {
  return (
    <button onClick={onClick} disabled={!clickable} style={{
      flex: "1 1 130px", minWidth: 100, textAlign: "left", borderRadius: 14,
      padding: "18px 18px 16px", border: `1px solid ${active ? color + "44" : T.border}`,
      background: active ? color + "10" : T.card, boxShadow: active ? T.shadowMd : "none",
      cursor: clickable ? "pointer" : "default", transition: "all 0.15s ease", fontFamily: sans,
    }}>
      <div style={{ fontSize: 10, color: clickable ? color : T.dim, fontWeight: clickable ? 700 : 600,
        marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ fontSize: F.xl, lineHeight: 1, fontWeight: 800, color }}>{value}</div>
    </button>
  );
}

function SummaryStats({ data, selectedZones, onToggleZone, commentsOnly }) {
  const counts = data.reduce((acc, row) => {
    const zone = normalizeZone(row.zone);
    acc[zone] = (acc[zone] || 0) + 1;
    return acc;
  }, {});
  const total = data.length;
  const uniquePeople = new Set(data.map(d => `${d.platform}:${d.handle}`)).size;
  const avgFollowers = total > 0 ? Math.round(data.reduce((s, d) => s + (d.followers || 0), 0) / total) : 0;

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
      <StatCard label={commentsOnly ? "Total comments" : "Total interactions"} value={total} />
      <StatCard label="Unique people" value={uniquePeople} />
      <StatCard label="Avg followers" value={fmt(avgFollowers)} />
      {["ELITE", "INFLUENTIAL", "SIGNAL"].map((zone) => (
        <StatCard key={zone} label={zone} value={counts[zone] || 0} color={ZONE_CFG[zone].color}
          active={selectedZones.has(zone)} clickable onClick={() => onToggleZone(zone)} />
      ))}
    </div>
  );
}

// ─── Inline editable cell ───────────────────────────────────────────────────
const editInputBase = {
  fontFamily: sans, background: "transparent", border: "none", outline: "none",
  padding: "2px 0", margin: 0, width: "100%", color: T.text,
};

function EditableText({ value, onChange, fontSize = F.xs, placeholder = "", style = {} }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const ref = useRef(null);

  useEffect(() => { setDraft(value || ""); }, [value]);

  function commit() {
    setEditing(false);
    if (draft !== (value || "")) onChange(draft);
  }

  if (!editing) {
    return (
      <div onClick={() => { setEditing(true); setTimeout(() => ref.current?.focus(), 0); }}
        style={{ cursor: "text", minHeight: 18, fontSize, color: value ? T.text : T.dim,
          fontStyle: value ? "normal" : "italic", ...style }}>
        {value || placeholder || "—"}
      </div>
    );
  }
  return (
    <input ref={ref} value={draft} onChange={e => setDraft(e.target.value)}
      onBlur={commit} onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(value || ""); setEditing(false); } }}
      style={{ ...editInputBase, fontSize, ...style }} autoFocus />
  );
}

function EditableSelect({ value, options, onChange, render }) {
  const [editing, setEditing] = useState(false);
  const ref = useRef(null);

  useEffect(() => { if (editing && ref.current) ref.current.focus(); }, [editing]);

  if (!editing) {
    return <div onClick={() => setEditing(true)} style={{ cursor: "pointer" }}>{render(value)}</div>;
  }
  return (
    <select ref={ref} value={value} onChange={e => { onChange(e.target.value); setEditing(false); }}
      onBlur={() => setEditing(false)}
      style={{ ...editInputBase, fontSize: F.xs, cursor: "pointer" }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ─── Trash icon SVG ─────────────────────────────────────────────────────────
function TrashIcon({ size = 16, color = T.red }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function InteractionsTable({ platform, weekFilter, refreshKey, commentsOnly = false }) {
  const [sortBy, setSortBy] = useState("date");
  const [sortDesc, setSortDesc] = useState(true);
  const [liveData, setLiveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZones, setSelectedZones] = useState(new Set());
  const [addingRow, setAddingRow] = useState(false);
  const [newRow, setNewRow] = useState({ ...EMPTY_ROW });
  const [saving, setSaving] = useState(false);
  const [fetchKey, setFetchKey] = useState(0);
  const [selected, setSelected] = useState(new Set());
  const [deleting, setDeleting] = useState(false);

  // Debounced save for inline edits
  const pendingEdits = useRef({});
  const saveTimers = useRef({});

  const flushEdit = useCallback((rowId) => {
    const updates = pendingEdits.current[rowId];
    if (!updates || Object.keys(updates).length === 0) return;
    delete pendingEdits.current[rowId];
    fetch("/api/interactions/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: rowId, updates }),
    }).catch(err => console.error("Edit save failed:", err));
  }, []);

  const queueEdit = useCallback((rowId, field, value) => {
    if (!pendingEdits.current[rowId]) pendingEdits.current[rowId] = {};
    pendingEdits.current[rowId][field] = value;
    // Also update local state immediately for responsiveness
    setLiveData(prev => prev.map(r => {
      if (r.id !== rowId) return r;
      const updated = { ...r };
      if (field === "name" || field === "bio" || field === "zone") updated[field] = value;
      else if (field === "content") updated.content = value;
      else if (field === "mention_url") updated.mention_url = value;
      else if (field === "interaction_type") { updated.type = value; }
      else if (field === "followers") updated.followers = parseInt(value, 10) || 0;
      else if (field === "interacted_at") updated.date = value;
      return updated;
    }));
    clearTimeout(saveTimers.current[rowId]);
    saveTimers.current[rowId] = setTimeout(() => flushEdit(rowId), 800);
  }, [flushEdit]);

  useEffect(() => {
    let cancelled = false;
    async function fetchInteractions() {
      setLoading(true);
      try {
        const [{ data, error }, commentsResult] = await Promise.all([
          supabase.from("interactions").select("*, handles(*)").order("interacted_at", { ascending: false }),
          commentsOnly
            ? supabase.from("platform_comments").select("*").order("published_at", { ascending: false })
            : Promise.resolve({ data: [], error: null }),
        ]);
        if (error) throw error;
        if (commentsResult?.error) throw commentsResult.error;

        const mappedInteractions = (data || []).map((row, i) => {
          const h = row.handles || {};
          const plat = row.platform || "x";
          const handle = plat === "instagram"
            ? (h.handle_instagram || h.handle_x || h.handle_youtube || h.handle_linkedin || "unknown")
            : plat === "x"
              ? (h.handle_x || h.handle_instagram || h.handle_youtube || h.handle_linkedin || "unknown")
              : plat === "youtube"
                ? (h.handle_youtube || h.handle_x || h.handle_instagram || h.handle_linkedin || "unknown")
                : (h.handle_linkedin || h.handle_x || h.handle_instagram || h.handle_youtube || "unknown");
          const followers = plat === "instagram" ? (h.followers_instagram || 0)
            : plat === "x" ? (h.followers_x || 0)
            : plat === "youtube" ? (h.followers_youtube || 0)
            : (h.followers_linkedin || 0);

          return {
            id: row.id || i + 1, source: "interactions",
            name: h.name || "Unknown", handle, bio: h.bio || null,
            platform: plat, type: row.interaction_type || "like",
            content: row.content || null, mention_url: row.mention_url || null,
            post_url: row.post_url || null, followers, zone: h.zone || "SIGNAL",
            date: row.interacted_at || null,
          };
        });

        const mappedPlatformComments = commentsOnly
          ? (commentsResult?.data || []).map((row, i) => ({
              id: row.id || `platform_comment_${i + 1}`, source: "platform_comments",
              name: row.author_name || "Unknown", handle: row.author_handle || "unknown",
              bio: null, platform: row.platform || "instagram", type: "comment",
              content: row.content || null, followers: row.author_followers || 0,
              zone: "SIGNAL", date: row.published_at || null,
            }))
          : [];

        const existingKeys = new Set(
          mappedInteractions.filter(r => isCommentType(r.type))
            .map(r => [r.platform || "", (r.handle || "").toLowerCase(), (r.content || "").trim().toLowerCase(), r.date || ""].join("|"))
        );
        const merged = commentsOnly
          ? [...mappedInteractions, ...mappedPlatformComments.filter(r => {
              const key = [r.platform || "", (r.handle || "").toLowerCase(), (r.content || "").trim().toLowerCase(), r.date || ""].join("|");
              return !existingKeys.has(key);
            })]
          : mappedInteractions;

        if (!cancelled) { setLiveData(merged); setSelected(new Set()); }
      } catch (err) {
        console.error("Failed to fetch interactions:", err);
        if (!cancelled) setLiveData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchInteractions();
    return () => { cancelled = true; };
  }, [refreshKey, fetchKey]);

  const baseFiltered = useMemo(() => {
    let data = liveData;
    if (commentsOnly) data = data.filter(r => isCommentType(r.type));
    if (platform && platform !== "all") data = data.filter(d => d.platform === platform);
    if (weekFilter) {
      const weekStart = new Date(weekFilter + "T00:00:00Z");
      const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7);
      data = data.filter(d => { const dd = new Date(d.date); return dd >= weekStart && dd < weekEnd; });
    }
    return data;
  }, [commentsOnly, liveData, platform, weekFilter]);

  const filtered = useMemo(() => {
    if (!selectedZones.size) return baseFiltered;
    return baseFiltered.filter(r => selectedZones.has(normalizeZone(r.zone)));
  }, [baseFiltered, selectedZones]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av, bv;
      if (sortBy === "date") { av = a.date || ""; bv = b.date || ""; }
      else if (sortBy === "followers") { av = a.followers || 0; bv = b.followers || 0; }
      else if (sortBy === "name") { av = (a.name || "").toLowerCase(); bv = (b.name || "").toLowerCase(); }
      else if (sortBy === "zone") { const o = { ELITE: 0, INFLUENTIAL: 1, SIGNAL: 2, IGNORE: 3 }; av = o[a.zone] ?? 4; bv = o[b.zone] ?? 4; }
      else if (sortBy === "platform") { av = a.platform || ""; bv = b.platform || ""; }
      else if (sortBy === "type") { av = normalizeType(a.type); bv = normalizeType(b.type); }
      else { av = a[sortBy] ?? ""; bv = b[sortBy] ?? ""; }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDesc ? -cmp : cmp;
    });
  }, [filtered, sortBy, sortDesc]);

  function toggleSort(col) {
    if (sortBy === col) setSortDesc(d => !d);
    else { setSortBy(col); setSortDesc(true); }
  }
  function toggleZone(zone) {
    setSelectedZones(prev => { const next = new Set(prev); next.has(zone) ? next.delete(zone) : next.add(zone); return next; });
  }
  function cancelAdd() { setAddingRow(false); setNewRow({ ...EMPTY_ROW }); }

  async function saveNewRow() {
    if (!newRow.name.trim()) return;
    setSaving(true);
    try {
      const payload = { ...newRow, name: newRow.name.trim(), handle: newRow.handle.trim() };
      payload.followers = payload.followers ? parseInt(payload.followers, 10) || null : null;
      const res = await fetch("/api/interactions/add", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      cancelAdd();
      setFetchKey(k => k + 1);
    } catch (err) { console.error("Failed to save:", err); }
    finally { setSaving(false); }
  }

  function toggleSelect(id) {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }
  function toggleSelectAll() {
    if (selected.size === sorted.length) setSelected(new Set());
    else setSelected(new Set(sorted.map(r => r.id)));
  }

  async function deleteSelected() {
    if (!selected.size) return;
    setDeleting(true);
    try {
      const ids = [...selected];
      const res = await fetch("/api/interactions/delete", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setSelected(new Set());
      setFetchKey(k => k + 1);
    } catch (err) { console.error("Delete failed:", err); }
    finally { setDeleting(false); }
  }

  const thStyle = (col) => ({
    fontFamily: sans, fontSize: F.xs, fontWeight: 600,
    color: sortBy === col ? T.accent : T.sub,
    padding: "10px 12px", textAlign: "left", cursor: "pointer",
    whiteSpace: "nowrap", borderBottom: `1px solid ${T.border}`, userSelect: "none",
  });
  const tdStyle = {
    padding: "11px 12px", fontFamily: sans, fontSize: F.sm, color: T.text,
    borderBottom: `1px solid ${T.border}`, verticalAlign: "middle",
  };
  const arrow = (col) => sortBy === col ? (sortDesc ? " ↓" : " ↑") : "";

  // Shared inline input style for the add row
  const addInputStyle = {
    fontFamily: sans, fontSize: F.xs, padding: "5px 7px", borderRadius: 6,
    border: "none", background: T.accentBg, color: T.text, width: "100%", outline: "none",
  };

  if (loading) {
    return (
      <div style={{ fontFamily: sans, fontSize: F.md, color: T.sub, textAlign: "center", padding: "60px 20px" }}>
        {commentsOnly ? "Loading comments..." : "Loading interactions..."}
      </div>
    );
  }

  return (
    <div>
      <SummaryStats data={baseFiltered} selectedZones={selectedZones} onToggleZone={toggleZone} commentsOnly={commentsOnly} />

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ fontFamily: sans, fontSize: F.xs, color: T.sub, fontWeight: 600 }}>
          {selectedZones.size ? `Showing: ${[...selectedZones].join(", ")}` : `Showing: all labels`}
        </div>
        {selectedZones.size > 0 && (
          <button onClick={() => setSelectedZones(new Set())} style={{
            background: "transparent", color: T.dim, border: `1px solid ${T.border}`,
            borderRadius: 999, padding: "4px 10px", fontFamily: sans, fontSize: F.xs, fontWeight: 600, cursor: "pointer",
          }}>Clear filters</button>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ fontFamily: sans, fontSize: F.sm, color: T.sub }}>
          {sorted.length} {commentsOnly ? "comment" : "interaction"}{sorted.length !== 1 ? "s" : ""}
          {platform && platform !== "all" ? <span> on {PLAT_LABEL[platform] || platform}</span> : null}
        </div>
        {!commentsOnly && !addingRow && (
          <button onClick={() => setAddingRow(true)} style={{
            fontFamily: sans, fontSize: F.xs, fontWeight: 600, padding: "4px 12px",
            borderRadius: 8, border: `1px solid ${T.border}`, background: T.card,
            color: T.accent, cursor: "pointer",
          }}>+ Add</button>
        )}
        {selected.size > 0 && (
          <button onClick={deleteSelected} disabled={deleting}
            title={`Delete ${selected.size} interaction${selected.size !== 1 ? "s" : ""}`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontFamily: sans, fontSize: F.xs, fontWeight: 600, padding: "4px 12px",
              borderRadius: 8, border: `1px solid ${T.redBorder}`, background: T.redBg,
              color: T.red, cursor: deleting ? "wait" : "pointer", opacity: deleting ? 0.6 : 1,
            }}>
            <TrashIcon size={13} color={T.red} />
            {deleting ? "Deleting..." : `Delete (${selected.size})`}
          </button>
        )}
      </div>

      {commentsOnly ? (
        sorted.length === 0 ? (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
            padding: "40px 24px", textAlign: "center", boxShadow: T.shadowSm }}>
            <div style={{ fontFamily: sans, fontSize: F.sm, color: T.dim }}>No comments match the current filters.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sorted.map((row) => (
              <div key={row.id} style={{ background: T.card, border: `1px solid ${T.border}`,
                borderRadius: 12, padding: "16px 20px", boxShadow: T.shadowSm }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 30, height: 30, borderRadius: "50%",
                    background: (PLAT_COLORS[row.platform] || T.dim) + "18",
                    color: PLAT_COLORS[row.platform] || T.dim, fontSize: 13, fontWeight: 700 }}>
                    {row.platform === "instagram" ? <IgIcon size={16} color="#E1306C" /> : (PLAT_ICON[row.platform] || "·")}
                  </span>
                  <span style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text }}>{row.name}</span>
                  <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim,
                    background: T.well, borderRadius: 4, padding: "1px 6px", border: `1px solid ${T.border}` }}>
                    {fmt(row.followers)} followers
                  </span>
                  <span style={{ display: "inline-block", background: (ZONE_CFG[row.zone] || ZONE_CFG.SIGNAL).bg,
                    color: (ZONE_CFG[row.zone] || ZONE_CFG.SIGNAL).color,
                    border: `1px solid ${(ZONE_CFG[row.zone] || ZONE_CFG.SIGNAL).border}`,
                    borderRadius: 6, padding: "2px 8px", fontSize: F.xs, fontWeight: 700, fontFamily: sans }}>
                    {(ZONE_CFG[row.zone] || ZONE_CFG.SIGNAL).label}
                  </span>
                  <span style={{ marginLeft: "auto", fontFamily: sans, fontSize: F.xs, color: T.dim }}>
                    {fmtDate(row.date)}
                  </span>
                </div>
                <div style={{ fontFamily: sans, fontSize: F.sm, color: T.text, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                  {row.content || "—"}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${T.border}`, boxShadow: T.shadowSm }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: T.card, minWidth: 880 }}>
            <thead>
              <tr style={{ background: T.well }}>
                <th style={{ ...thStyle(""), cursor: "pointer", width: 36, textAlign: "center", padding: "10px 8px" }}
                  onClick={toggleSelectAll}>
                  <input type="checkbox" checked={sorted.length > 0 && selected.size === sorted.length}
                    onChange={toggleSelectAll}
                    style={{ cursor: "pointer", accentColor: T.accent }} />
                </th>
                <th style={thStyle("name")} onClick={() => toggleSort("name")}>Person{arrow("name")}</th>
                <th style={thStyle("platform")} onClick={() => toggleSort("platform")}>Platform{arrow("platform")}</th>
                <th style={thStyle("type")} onClick={() => toggleSort("type")}>Type{arrow("type")}</th>
                <th style={{ ...thStyle("content"), cursor: "default", width: "28%" }}>Content</th>
                <th style={thStyle("followers")} onClick={() => toggleSort("followers")}>Followers{arrow("followers")}</th>
                <th style={thStyle("zone")} onClick={() => toggleSort("zone")}>Label{arrow("zone")}</th>
                <th style={thStyle("date")} onClick={() => toggleSort("date")}>Date{arrow("date")}</th>
              </tr>
            </thead>
            <tbody>
              {/* ── Add new row ── */}
              {addingRow && (
                <tr style={{ background: T.accentBg + "66" }}>
                  <td style={{ ...tdStyle, textAlign: "center" }} />
                  <td style={{ ...tdStyle, verticalAlign: "top" }}>
                    <input value={newRow.name} onChange={e => setNewRow(r => ({ ...r, name: e.target.value }))}
                      placeholder="Name" autoFocus
                      onKeyDown={e => { if (e.key === "Enter") saveNewRow(); if (e.key === "Escape") cancelAdd(); }}
                      style={addInputStyle} />
                  </td>
                  <td style={{ ...tdStyle, verticalAlign: "top" }}>
                    <select value={newRow.platform} onChange={e => setNewRow(r => ({ ...r, platform: e.target.value }))}
                      style={addInputStyle}>{PLAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                  </td>
                  <td style={{ ...tdStyle, verticalAlign: "top" }}>
                    <select value={newRow.interaction_type} onChange={e => setNewRow(r => ({ ...r, interaction_type: e.target.value }))}
                      style={addInputStyle}>{TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                  </td>
                  <td style={{ ...tdStyle, verticalAlign: "top" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <input value={newRow.content} onChange={e => setNewRow(r => ({ ...r, content: e.target.value }))}
                        placeholder="Content" onKeyDown={e => { if (e.key === "Enter") saveNewRow(); if (e.key === "Escape") cancelAdd(); }}
                        style={addInputStyle} />
                      <input value={newRow.mention_url} onChange={e => setNewRow(r => ({ ...r, mention_url: e.target.value }))}
                        placeholder="Mention URL" onKeyDown={e => { if (e.key === "Enter") saveNewRow(); if (e.key === "Escape") cancelAdd(); }}
                        style={{ ...addInputStyle, fontSize: 10 }} />
                    </div>
                  </td>
                  <td style={{ ...tdStyle, verticalAlign: "top" }}>
                    <input value={newRow.followers} onChange={e => setNewRow(r => ({ ...r, followers: e.target.value }))}
                      placeholder="0" onKeyDown={e => { if (e.key === "Enter") saveNewRow(); if (e.key === "Escape") cancelAdd(); }}
                      style={{ ...addInputStyle, width: 70 }} />
                  </td>
                  <td style={{ ...tdStyle, verticalAlign: "top" }}>
                    <select value={newRow.zone} onChange={e => setNewRow(r => ({ ...r, zone: e.target.value }))}
                      style={addInputStyle}>{ZONE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                  </td>
                  <td style={{ ...tdStyle, verticalAlign: "top", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <input type="date" value={newRow.interacted_at}
                        onChange={e => setNewRow(r => ({ ...r, interacted_at: e.target.value }))}
                        onKeyDown={e => { if (e.key === "Enter") saveNewRow(); if (e.key === "Escape") cancelAdd(); }}
                        style={{ ...addInputStyle, width: 110 }} />
                      <button onClick={saveNewRow} disabled={saving} style={{
                        fontFamily: sans, fontSize: 10, fontWeight: 700, padding: "4px 8px",
                        borderRadius: 6, border: "none", background: T.accent, color: "#fff",
                        cursor: saving ? "wait" : "pointer", opacity: saving ? 0.6 : 1, whiteSpace: "nowrap",
                      }}>{saving ? "..." : "Save"}</button>
                      <button onClick={cancelAdd} style={{
                        fontFamily: sans, fontSize: 10, fontWeight: 600, padding: "4px 6px",
                        borderRadius: 6, border: `1px solid ${T.border}`, background: T.card,
                        color: T.dim, cursor: "pointer", whiteSpace: "nowrap",
                      }}>Esc</button>
                    </div>
                  </td>
                </tr>
              )}

              {sorted.length === 0 && !addingRow && (
                <tr>
                  <td colSpan={8} style={{ ...tdStyle, textAlign: "center", color: T.dim, padding: "40px 12px" }}>
                    No interactions found{platform && platform !== "all" ? ` on ${PLAT_LABEL[platform] || platform}` : ""}{weekFilter ? " for the selected week" : ""}.
                  </td>
                </tr>
              )}

              {/* ── Data rows (inline editable) ── */}
              {sorted.map((row, i) => {
                const isSelected = selected.has(row.id);
                const isEditable = row.source === "interactions";
                return (
                  <tr key={row.id} style={{ background: isSelected ? T.blueBg : i % 2 === 0 ? T.card : T.well + "88" }}>
                    <td style={{ ...tdStyle, textAlign: "center", padding: "11px 8px" }}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(row.id)}
                        style={{ cursor: "pointer", accentColor: T.accent }} />
                    </td>
                    <td style={tdStyle}>
                      <div style={{ maxWidth: 260 }}>
                        {isEditable ? (
                          <EditableText value={row.name} fontSize={F.sm}
                            style={{ fontWeight: 600, lineHeight: 1.3 }}
                            onChange={v => queueEdit(row.id, "name", v)} />
                        ) : (
                          <div style={{ fontWeight: 600, fontSize: F.sm, color: T.text, lineHeight: 1.3 }}>{row.name}</div>
                        )}
                        {row.bio && (
                          <div style={{ marginTop: 4, fontSize: F.xs, color: T.sub, lineHeight: 1.45, whiteSpace: "normal" }}>
                            {truncate(row.bio, 120)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <a href={PLAT_URL[row.platform]?.(row.handle) || "#"} target="_blank" rel="noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: 30, height: 30, borderRadius: 8,
                          background: (PLAT_COLORS[row.platform] || T.dim) + "14",
                          color: PLAT_COLORS[row.platform] || T.dim,
                          fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                        {row.platform === "instagram" ? <IgIcon size={16} color="#E1306C" /> : (PLAT_ICON[row.platform] || "·")}
                      </a>
                    </td>
                    <td style={tdStyle}>
                      {isEditable ? (
                        <EditableSelect value={normalizeType(row.type)} options={TYPE_OPTIONS}
                          onChange={v => queueEdit(row.id, "interaction_type", v)}
                          render={v => {
                            const cfg = { like: { label: "Like", icon: "♥", bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
                              follow: { label: "Follow", bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
                              comment: { label: "Comment", bg: "#FEFCE8", color: "#CA8A04", border: "#FEF08A" },
                              repost: { label: "Repost", bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
                              mention: { label: "Mention", bg: "#FFF3EE", color: "#FF6B35", border: "#FFD4C2" },
                              tag: { label: "Tag", bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
                              reply: { label: "Reply", bg: "#FEFCE8", color: "#CA8A04", border: "#FEF08A" },
                            };
                            const c = cfg[v] || { label: v, bg: T.well, color: T.sub, border: T.border };
                            return (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 4,
                                background: c.bg, color: c.color, border: `1px solid ${c.border}`,
                                borderRadius: 12, padding: "3px 10px", fontSize: F.xs, fontWeight: 600,
                                fontFamily: sans, whiteSpace: "nowrap", cursor: "pointer" }}>
                                {c.icon && <span style={{ fontSize: 10 }}>{c.icon}</span>}{c.label}
                              </span>
                            );
                          }} />
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4,
                          background: T.well, color: T.sub, border: `1px solid ${T.border}`,
                          borderRadius: 12, padding: "3px 10px", fontSize: F.xs, fontWeight: 600, fontFamily: sans }}>
                          {normalizeType(row.type)}
                        </span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, maxWidth: 0 }}>
                      {isEditable ? (
                        <EditableText value={row.content} fontSize={F.xs} placeholder="—"
                          style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          onChange={v => queueEdit(row.id, "content", v)} />
                      ) : (
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          fontSize: F.xs, color: row.content ? T.sub : T.dim, fontStyle: row.content ? "normal" : "italic" }}>
                          {row.content ? truncate(row.content, 100) : "—"}
                        </div>
                      )}
                    </td>
                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                      {isEditable ? (
                        <EditableText value={row.followers ? String(row.followers) : ""} fontSize={F.sm}
                          placeholder="—" style={{ fontWeight: 600 }}
                          onChange={v => queueEdit(row.id, "followers", v)} />
                      ) : (
                        <span style={{ fontWeight: 600 }}>{row.followers ? fmt(row.followers) : "—"}</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {isEditable ? (
                        <EditableSelect value={row.zone || "SIGNAL"} options={ZONE_OPTIONS}
                          onChange={v => queueEdit(row.id, "zone", v)}
                          render={v => {
                            const cfg = ZONE_CFG[v] || ZONE_CFG.SIGNAL;
                            return (
                              <span style={{ display: "inline-block", background: cfg.bg, color: cfg.color,
                                border: `1px solid ${cfg.border}`, borderRadius: 6, padding: "2px 8px",
                                fontSize: F.xs, fontWeight: 700, fontFamily: sans, letterSpacing: "0.04em", cursor: "pointer" }}>
                                {cfg.label}
                              </span>
                            );
                          }} />
                      ) : (
                        <span style={{ display: "inline-block", background: (ZONE_CFG[row.zone] || ZONE_CFG.SIGNAL).bg,
                          color: (ZONE_CFG[row.zone] || ZONE_CFG.SIGNAL).color,
                          border: `1px solid ${(ZONE_CFG[row.zone] || ZONE_CFG.SIGNAL).border}`,
                          borderRadius: 6, padding: "2px 8px", fontSize: F.xs, fontWeight: 700, fontFamily: sans }}>
                          {(ZONE_CFG[row.zone] || ZONE_CFG.SIGNAL).label}
                        </span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, whiteSpace: "nowrap", color: T.sub, fontSize: F.xs }}>
                      {fmtDate(row.date)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
