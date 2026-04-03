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
  ELITE:       { label: "ELITE",       color: T.accent,  bg: T.accentBg, border: T.accentBorder },
  INFLUENTIAL: { label: "INFLUENTIAL", color: T.green,   bg: T.greenBg,  border: T.greenBorder },
  SIGNAL:      { label: "SIGNAL",      color: T.blue,    bg: T.blueBg,   border: T.blueBorder },
  UNASSIGNED:  { label: "UNASSIGNED",  color: "#64748B", bg: "#F1F5F9",  border: "#CBD5E1" },
  IGNORE:      { label: "IGNORE",      color: T.dim,     bg: T.well,     border: T.border },
};
const LIST_ORDER = ["ELITE", "INFLUENTIAL", "SIGNAL", "UNASSIGNED", "IGNORE"];

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
  { value: "SIGNAL", label: "Signal" }, { value: "UNASSIGNED", label: "Unassigned" },
  { value: "IGNORE", label: "Ignore" },
];

const ENTITY_TYPE_OPTIONS = [
  { value: "person",       label: "Person" },
  { value: "organization", label: "Organization" },
  { value: "page",         label: "Page" },
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

function normalizeZone(zone) { return LIST_ORDER.includes(zone) ? zone : "UNASSIGNED"; }
function isCommentType(type) { return ["comment", "commented", "reply"].includes((type || "").toLowerCase()); }
function normalizeType(type) {
  const raw = (type || "").toLowerCase();
  if (raw === "liked") return "like"; if (raw === "followed") return "follow";
  if (raw === "commented") return "comment"; if (raw === "reposted") return "repost";
  if (raw === "mentioned") return "mention"; return raw || "unknown";
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

function TrashIcon({ size = 16, color = T.red }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
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
  const counts = data.reduce((acc, row) => { acc[normalizeZone(row.zone)] = (acc[normalizeZone(row.zone)] || 0) + 1; return acc; }, {});
  const total = data.length;
  const uniquePeople = new Set(data.map(d => `${d.platform}:${d.handle}`)).size;
  const avgFollowers = total > 0 ? Math.round(data.reduce((s, d) => s + (d.followers || 0), 0) / total) : 0;
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
      <StatCard label={commentsOnly ? "Total comments" : "Total interactions"} value={total} />
      <StatCard label="Unique people" value={uniquePeople} />
      <StatCard label="Avg followers" value={fmt(avgFollowers)} />
      {["ELITE", "INFLUENTIAL", "SIGNAL"].map(zone => (
        <StatCard key={zone} label={zone} value={counts[zone] || 0} color={ZONE_CFG[zone].color}
          active={selectedZones.has(zone)} clickable onClick={() => onToggleZone(zone)} />
      ))}
    </div>
  );
}

function ZoneBadge({ zone }) {
  const cfg = ZONE_CFG[zone] || ZONE_CFG.SIGNAL;
  return (
    <span style={{ display: "inline-block", background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`, borderRadius: 6, padding: "2px 8px",
      fontSize: F.xs, fontWeight: 700, fontFamily: sans, letterSpacing: "0.04em" }}>{cfg.label}</span>
  );
}

function TypeBadge({ type }) {
  const cfg = {
    like: { label: "Like", icon: "♥", bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
    follow: { label: "Follow", bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
    comment: { label: "Comment", bg: "#FEFCE8", color: "#CA8A04", border: "#FEF08A" },
    repost: { label: "Repost", bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
    mention: { label: "Mention", bg: "#FFF3EE", color: "#FF6B35", border: "#FFD4C2" },
    tag: { label: "Tag", bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
    reply: { label: "Reply", bg: "#FEFCE8", color: "#CA8A04", border: "#FEF08A" },
  };
  const c = cfg[normalizeType(type)] || { label: type || "Unknown", bg: T.well, color: T.sub, border: T.border };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      borderRadius: 12, padding: "3px 10px", fontSize: F.xs, fontWeight: 600, fontFamily: sans, whiteSpace: "nowrap" }}>
      {c.icon && <span style={{ fontSize: 10 }}>{c.icon}</span>}{c.label}
    </span>
  );
}

// ─── Detail Panel ───────────────────────────────────────────────────────────
const editInput = {
  fontFamily: sans, fontSize: F.sm, background: "transparent", border: "none",
  borderBottom: `1px solid transparent`, outline: "none", padding: "4px 0",
  width: "100%", color: T.text, transition: "border-color 0.15s",
};
const editInputFocus = { borderBottomColor: T.accent };

function DetailField({ label, value, onChange, placeholder = "—", multiline = false, type = "text" }) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(value || "");
  useEffect(() => { setDraft(value || ""); }, [value]);

  function commit() {
    setFocused(false);
    if (draft !== (value || "")) onChange(draft);
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: sans, fontSize: 10, fontWeight: 600, color: T.dim,
        textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</div>
      {multiline ? (
        <textarea value={draft} onChange={e => setDraft(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={commit}
          placeholder={placeholder}
          style={{ ...editInput, ...(focused ? editInputFocus : {}),
            minHeight: 60, resize: "vertical", lineHeight: 1.5 }} />
      ) : (
        <input type={type} value={draft} onChange={e => setDraft(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={commit}
          placeholder={placeholder}
          style={{ ...editInput, ...(focused ? editInputFocus : {}) }} />
      )}
    </div>
  );
}

function DetailSelect({ label, value, options, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: sans, fontSize: 10, fontWeight: 600, color: T.dim,
        textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</div>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ ...editInput, cursor: "pointer", borderBottom: `1px solid ${T.border}` }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

const PLAT_HANDLES = [
  { key: "handle_x", label: "X", plat: "x" },
  { key: "handle_instagram", label: "Instagram", plat: "instagram" },
  { key: "handle_youtube", label: "YouTube", plat: "youtube" },
  { key: "handle_linkedin", label: "LinkedIn", plat: "linkedin" },
];
const FOLLOWER_FIELDS = [
  { key: "followers_x", label: "X" },
  { key: "followers_instagram", label: "Instagram" },
  { key: "followers_youtube", label: "YouTube" },
  { key: "followers_linkedin", label: "LinkedIn" },
];

function DetailPanelBody({ draft, handle, onChange, isCreate }) {
  const set = (field, value) => onChange(field, value);
  return (
    <>
      <div style={{ fontFamily: sans, fontSize: F.xs, fontWeight: 700, color: T.sub,
        textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Interaction</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <DetailSelect label="Platform" value={draft.platform || "x"}
          options={[{ value: "x", label: "X" }, { value: "instagram", label: "Instagram" },
            { value: "youtube", label: "YouTube" }, { value: "linkedin", label: "LinkedIn" }]}
          onChange={v => set("platform", v)} />
        <DetailSelect label="Type" value={normalizeType(draft.type || draft.interaction_type)} options={TYPE_OPTIONS}
          onChange={v => set("interaction_type", v)} />
      </div>

      <DetailField label="Content" value={draft.content} multiline placeholder="No content"
        onChange={v => set("content", v)} />
      <DetailField label="Mention URL" value={draft.mention_url} placeholder="https://..."
        onChange={v => set("mention_url", v)} />
      <DetailField label="Post URL" value={draft.post_url} placeholder="https://..."
        onChange={v => set("post_url", v)} />
      <DetailField label="Date" value={(draft.date || draft.interacted_at || "").slice(0, 10)} type="date"
        onChange={v => set("interacted_at", v)} />

      <div style={{ borderTop: `1px solid ${T.border}`, margin: "20px 0" }} />

      <div style={{ fontFamily: sans, fontSize: F.xs, fontWeight: 700, color: T.sub,
        textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Person</div>

      <DetailField label="Name" value={draft.name} placeholder="Name"
        onChange={v => set("name", v)} />
      <DetailField label="Bio" value={handle.bio || draft.bio} multiline placeholder="No bio"
        onChange={v => set("bio", v)} />
      <DetailSelect label="Label" value={draft.zone || "SIGNAL"} options={ZONE_OPTIONS}
        onChange={v => set("zone", v)} />
      <DetailSelect label="Type" value={draft.entity_type || (isCreate ? "person" : (handle.entity_type || "person"))} options={ENTITY_TYPE_OPTIONS}
        onChange={v => set("entity_type", v)} />

      <div style={{ fontFamily: sans, fontSize: 10, fontWeight: 600, color: T.dim,
        textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, marginTop: 4 }}>Handles</div>
      {PLAT_HANDLES.map(({ key, label, plat }) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 24, height: 24, borderRadius: 6, flexShrink: 0,
            background: (PLAT_COLORS[plat] || T.dim) + "14",
            color: PLAT_COLORS[plat] || T.dim, fontSize: 11, fontWeight: 700 }}>
            {plat === "instagram" ? <IgIcon size={12} color="#E1306C" /> : (PLAT_ICON[plat] || "·")}
          </span>
          <DetailField label="" value={isCreate ? (draft[key] || "") : (handle[key] || "")} placeholder={`${label} handle`}
            onChange={v => set(key, v)} />
        </div>
      ))}

      <div style={{ fontFamily: sans, fontSize: 10, fontWeight: 600, color: T.dim,
        textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, marginTop: 12 }}>Followers</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        {FOLLOWER_FIELDS.map(({ key, label }) => (
          <DetailField key={key} label={label}
            value={isCreate ? (draft[key] || "") : (handle[key] ? String(handle[key]) : "")}
            placeholder="0" onChange={v => set(key, v)} />
        ))}
      </div>
    </>
  );
}

// ─── Edit detail panel (existing interaction) ──────────────────────────────
function DetailPanel({ row, rawData, onClose, onSave }) {
  const rawRow = rawData?.find(r => r.id === row?.id);
  const handle = rawRow?.handles || {};
  const save = useCallback((field, value) => onSave(row.id, field, value), [row?.id, onSave]);
  if (!row) return null;

  return (
    <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 420, zIndex: 1000,
      background: T.bg, borderLeft: `1px solid ${T.border}`, boxShadow: "-4px 0 24px rgba(0,0,0,0.08)",
      overflowY: "auto", padding: "24px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ fontFamily: sans, fontSize: F.lg, fontWeight: 700, color: T.text }}>Detail</div>
        <button onClick={onClose} style={{ fontFamily: sans, fontSize: F.md, background: "none",
          border: "none", color: T.dim, cursor: "pointer", padding: "4px 8px", lineHeight: 1 }}>✕</button>
      </div>
      <DetailPanelBody draft={row} handle={handle} onChange={save} isCreate={false} />
    </div>
  );
}

// ─── Create detail panel (new interaction) ─────────────────────────────────
export function CreatePanel({ onClose, onCreated }) {
  const [draft, setDraft] = useState({
    name: "", platform: "x", interaction_type: "mention", content: "",
    mention_url: "", post_url: "", zone: "SIGNAL", bio: "",
    interacted_at: new Date().toISOString().slice(0, 10),
    handle_x: "", handle_instagram: "", handle_youtube: "", handle_linkedin: "",
    followers_x: "", followers_instagram: "", followers_youtube: "", followers_linkedin: "",
  });
  const [saving, setSaving] = useState(false);

  function onChange(field, value) {
    setDraft(prev => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!draft.name.trim()) return;
    setSaving(true);
    try {
      // Determine handle from the selected platform
      const handle = draft[`handle_${draft.platform}`] || "";
      const followers = draft[`followers_${draft.platform}`];
      const payload = {
        name: draft.name.trim(),
        platform: draft.platform,
        handle: handle.trim(),
        interaction_type: draft.interaction_type,
        content: draft.content,
        mention_url: draft.mention_url,
        post_url: draft.post_url,
        zone: draft.zone,
        interacted_at: draft.interacted_at,
        followers: followers ? parseInt(followers, 10) || null : null,
      };
      const res = await fetch("/api/interactions/add", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      // Merge: send any new non-empty fields that the existing handle doesn't have
      if (result.interaction_id && result.handle) {
        const existing = result.handle;
        const extra = {};
        if (draft.bio && draft.bio.trim() && !existing.bio) extra.bio = draft.bio.trim();
        for (const { key } of PLAT_HANDLES) {
          if (draft[key] && draft[key].trim() && !existing[key]) extra[key] = draft[key].trim();
        }
        for (const { key } of FOLLOWER_FIELDS) {
          const v = parseInt(draft[key], 10);
          if (v > 0 && v > (existing[key] || 0)) extra[key] = v;
        }
        if (Object.keys(extra).length > 0) {
          await fetch("/api/interactions/update", {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: result.interaction_id, updates: extra }),
          });
        }
      }

      onCreated();
    } catch (err) { console.error("Create failed:", err); }
    finally { setSaving(false); }
  }

  return (
    <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 420, zIndex: 1000,
      background: T.bg, borderLeft: `1px solid ${T.border}`, boxShadow: "-4px 0 24px rgba(0,0,0,0.08)",
      overflowY: "auto", padding: "24px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ fontFamily: sans, fontSize: F.lg, fontWeight: 700, color: T.text }}>New Interaction</div>
        <button onClick={onClose} style={{ fontFamily: sans, fontSize: F.md, background: "none",
          border: "none", color: T.dim, cursor: "pointer", padding: "4px 8px", lineHeight: 1 }}>✕</button>
      </div>
      <DetailPanelBody draft={draft} handle={{}} onChange={onChange} isCreate={true} />
      <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600,
          padding: "8px 18px", borderRadius: 8, border: `1px solid ${T.border}`,
          background: T.card, color: T.sub, cursor: "pointer" }}>Cancel</button>
        <button onClick={handleSave} disabled={saving || !draft.name.trim()} style={{
          fontFamily: sans, fontSize: F.sm, fontWeight: 600, padding: "8px 18px",
          borderRadius: 8, border: "none", background: T.accent, color: "#fff",
          cursor: saving ? "wait" : "pointer", opacity: (saving || !draft.name.trim()) ? 0.6 : 1 }}>
          {saving ? "Saving..." : "Save"}</button>
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function InteractionsTable({ platform, weekFilter, refreshKey, commentsOnly = false, dateFrom, dateTo }) {
  const [sortBy, setSortBy] = useState("date");
  const [sortDesc, setSortDesc] = useState(true);
  const [liveData, setLiveData] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZones, setSelectedZones] = useState(new Set());
  const [fetchKey, setFetchKey] = useState(0);
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [detailRow, setDetailRow] = useState(null);

  // Inline edit state
  const [editCell, setEditCell] = useState(null); // { id, field }
  const [editVal, setEditVal] = useState("");

  function startEdit(row, field) {
    setEditCell({ id: row.id, field });
    setEditVal(row[field] ?? "");
  }

  function commitInlineEdit(overrideVal) {
    if (!editCell) return;
    const { id, field } = editCell;
    const val = overrideVal !== undefined ? overrideVal : editVal;
    setEditCell(null);
    saveField(id, field, val);
  }

  function cancelInlineEdit() { setEditCell(null); }

  const saveField = useCallback((rowId, field, value) => {
    const isHandleField = ["name", "bio", "zone"].includes(field) ||
      field.startsWith("handle_") || field.startsWith("followers_");

    // Find the handle_id for this row so we can update all rows sharing it
    const sourceRow = rawData.find(r => r.id === rowId);
    const handleId = sourceRow?.handle_id;

    // Update local state — for handle fields, update ALL rows with same handle_id
    setLiveData(prev => prev.map(r => {
      const isTarget = r.id === rowId;
      const isSameHandle = isHandleField && handleId && rawData.find(raw => raw.id === r.id)?.handle_id === handleId;
      if (!isTarget && !isSameHandle) return r;
      const u = { ...r };
      if (isSameHandle || isTarget) {
        if (field === "name") u.name = value;
        if (field === "bio") u.bio = value;
        if (field === "zone") u.zone = value;
        if (field === "entity_type") u.entity_type = value;
      }
      if (isTarget) {
        if (field === "content") u.content = value;
        if (field === "mention_url") u.mention_url = value;
        if (field === "post_url") u.post_url = value;
        if (field === "interaction_type") u.type = value;
        if (field === "platform") u.platform = value;
        if (field === "interacted_at") u.date = value;
      }
      return u;
    }));
    // Also update rawData for handles fields — update all rows with same handle_id
    setRawData(prev => prev.map(r => {
      const isTarget = r.id === rowId;
      const isSameHandle = isHandleField && handleId && r.handle_id === handleId;
      if (!isTarget && !isSameHandle) return r;
      if (!isSameHandle && !isHandleField && !isTarget) return r;
      const u = { ...r, handles: { ...r.handles } };
      if (isSameHandle) {
        if (["name", "bio", "zone", "entity_type"].includes(field)) u.handles[field] = value;
        if (field.startsWith("handle_") || field.startsWith("followers_"))
          u.handles[field] = field.startsWith("followers_") ? (parseInt(value, 10) || null) : value;
      }
      return u;
    }));
    // Update detailRow if it's the one being edited
    setDetailRow(prev => {
      if (!prev || prev.id !== rowId) return prev;
      const u = { ...prev };
      if (["name", "bio", "zone", "entity_type"].includes(field)) u[field] = value;
      else if (field === "content") u.content = value;
      else if (field === "mention_url") u.mention_url = value;
      else if (field === "post_url") u.post_url = value;
      else if (field === "interaction_type") u.type = value;
      else if (field === "platform") u.platform = value;
      else if (field === "interacted_at") u.date = value;
      return u;
    });
    // Persist to API
    fetch("/api/interactions/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: rowId, updates: { [field]: value } }),
    }).catch(err => console.error("Save failed:", err));
  }, [rawData]);

  useEffect(() => {
    let cancelled = false;
    async function fetchInteractions() {
      setLoading(true);
      try {
        let interactionsQuery = supabase.from("interactions").select("*, handles(*)").order("interacted_at", { ascending: false });
        if (dateFrom) interactionsQuery = interactionsQuery.gte("interacted_at", dateFrom);
        if (dateTo) interactionsQuery = interactionsQuery.lte("interacted_at", dateTo + "T23:59:59Z");
        const [{ data, error }, commentsResult] = await Promise.all([
          interactionsQuery,
          commentsOnly
            ? supabase.from("platform_comments").select("*").order("published_at", { ascending: false })
            : Promise.resolve({ data: [], error: null }),
        ]);
        if (error) throw error;
        if (commentsResult?.error) throw commentsResult.error;

        if (!cancelled) setRawData(data || []);

        const mappedInteractions = (data || []).map((row, i) => {
          const h = row.handles || {};
          const plat = row.platform || "x";
          const handle = plat === "instagram" ? (h.handle_instagram || h.handle_x || h.handle_youtube || h.handle_linkedin || "unknown")
            : plat === "x" ? (h.handle_x || h.handle_instagram || h.handle_youtube || h.handle_linkedin || "unknown")
            : plat === "youtube" ? (h.handle_youtube || h.handle_x || h.handle_instagram || h.handle_linkedin || "unknown")
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
            entity_type: h.entity_type || "person",
            date: row.interacted_at || null,
          };
        });

        const mappedComments = commentsOnly
          ? (commentsResult?.data || []).map((row, i) => ({
              id: row.id || `pc_${i}`, source: "platform_comments",
              name: row.author_name || "Unknown", handle: row.author_handle || "unknown",
              bio: null, platform: row.platform || "instagram", type: "comment",
              content: row.content || null, followers: row.author_followers || 0,
              zone: "SIGNAL", date: row.published_at || null,
            }))
          : [];

        const existingKeys = new Set(
          mappedInteractions.filter(r => isCommentType(r.type))
            .map(r => [r.platform, (r.handle || "").toLowerCase(), (r.content || "").trim().toLowerCase(), r.date || ""].join("|"))
        );
        const merged = commentsOnly
          ? [...mappedInteractions, ...mappedComments.filter(r => !existingKeys.has([r.platform, (r.handle || "").toLowerCase(), (r.content || "").trim().toLowerCase(), r.date || ""].join("|")))]
          : mappedInteractions;

        if (!cancelled) { setLiveData(merged); setSelected(new Set()); }
      } catch (err) { console.error("Fetch failed:", err); if (!cancelled) setLiveData([]); }
      finally { if (!cancelled) setLoading(false); }
    }
    fetchInteractions();
    return () => { cancelled = true; };
  }, [refreshKey, fetchKey, dateFrom, dateTo]);

  const baseFiltered = useMemo(() => {
    let data = liveData;
    if (commentsOnly) data = data.filter(r => isCommentType(r.type));
    if (platform && platform !== "all") data = data.filter(d => d.platform === platform);
    if (weekFilter) {
      const ws = new Date(weekFilter + "T00:00:00Z"), we = new Date(ws);
      we.setDate(we.getDate() + 7);
      data = data.filter(d => { const dd = new Date(d.date); return dd >= ws && dd < we; });
    }
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(d =>
        d.name?.toLowerCase().includes(q) ||
        d.content?.toLowerCase().includes(q) ||
        d.handle?.toLowerCase().includes(q) ||
        d.type?.toLowerCase().includes(q)
      );
    }
    return data;
  }, [commentsOnly, liveData, platform, weekFilter, search]);

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
      return sortDesc ? (av < bv ? 1 : av > bv ? -1 : 0) : (av < bv ? -1 : av > bv ? 1 : 0);
    });
  }, [filtered, sortBy, sortDesc]);

  function toggleSort(col) { if (sortBy === col) setSortDesc(d => !d); else { setSortBy(col); setSortDesc(true); } }
  function toggleZone(zone) { setSelectedZones(prev => { const n = new Set(prev); n.has(zone) ? n.delete(zone) : n.add(zone); return n; }); }
  function toggleSelect(id) { setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function toggleSelectAll() { selected.size === sorted.length ? setSelected(new Set()) : setSelected(new Set(sorted.map(r => r.id))); }

  async function deleteSelected() {
    if (!selected.size) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/interactions/delete", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: [...selected] }) });
      if (!res.ok) throw new Error((await res.json()).error);
      setSelected(new Set()); setDetailRow(null); setFetchKey(k => k + 1);
    } catch (err) { console.error("Delete failed:", err); }
    finally { setDeleting(false); }
  }

  const thStyle = (col) => ({
    fontFamily: sans, fontSize: F.xs, fontWeight: 600, color: sortBy === col ? T.accent : T.sub,
    padding: "10px 12px", textAlign: "left", cursor: "pointer", whiteSpace: "nowrap",
    borderBottom: `1px solid ${T.border}`, userSelect: "none",
  });
  const tdStyle = { padding: "11px 12px", fontFamily: sans, fontSize: F.sm, color: T.text, borderBottom: `1px solid ${T.border}`, verticalAlign: "middle" };
  const arrow = (col) => sortBy === col ? (sortDesc ? " ↓" : " ↑") : "";

  if (loading) {
    return <div style={{ fontFamily: sans, fontSize: F.md, color: T.sub, textAlign: "center", padding: "60px 20px" }}>
      {commentsOnly ? "Loading comments..." : "Loading interactions..."}</div>;
  }

  return (
    <div>
      {showCreate && (
        <CreatePanel onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); setFetchKey(k => k + 1); }} />
      )}

      <SummaryStats data={baseFiltered} selectedZones={selectedZones} onToggleZone={toggleZone} commentsOnly={commentsOnly} />

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ fontFamily: sans, fontSize: F.xs, color: T.sub, fontWeight: 600 }}>
          {selectedZones.size ? `Showing: ${[...selectedZones].join(", ")}` : "Showing: all labels"}
        </div>
        {selectedZones.size > 0 && (
          <button onClick={() => setSelectedZones(new Set())} style={{ background: "transparent", color: T.dim,
            border: `1px solid ${T.border}`, borderRadius: 999, padding: "4px 10px",
            fontFamily: sans, fontSize: F.xs, fontWeight: 600, cursor: "pointer" }}>Clear filters</button>
        )}
        <input
          value={search}
          placeholder="Search..."
          onChange={e => setSearch(e.target.value)}
          style={{
            marginLeft: "auto", background: T.card, border: `1px solid ${T.border}`,
            color: T.text, borderRadius: 8, padding: "6px 12px", fontFamily: sans,
            fontSize: F.sm, outline: "none", width: 200,
          }}
        />
        <button
          onClick={() => setShowCreate(true)}
          title="Add new interaction"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 8, cursor: "pointer",
            background: T.accent, border: "none",
            color: "#fff", fontFamily: sans, fontSize: F.sm, fontWeight: 700,
            boxShadow: "0 1px 4px rgba(255,107,53,0.3)",
            transition: "opacity 0.15s, transform 0.1s",
            flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <span style={{ fontSize: 18, lineHeight: 1, fontWeight: 300 }}>+</span>
          Add interaction
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ fontFamily: sans, fontSize: F.sm, color: T.sub }}>
          {sorted.length} {commentsOnly ? "comment" : "interaction"}{sorted.length !== 1 ? "s" : ""}
          {platform && platform !== "all" ? <span> on {PLAT_LABEL[platform] || platform}</span> : null}
        </div>
        {selected.size > 0 && (
          <button onClick={deleteSelected} disabled={deleting} style={{
            display: "inline-flex", alignItems: "center", gap: 5, fontFamily: sans, fontSize: F.xs,
            fontWeight: 600, padding: "4px 12px", borderRadius: 8, border: `1px solid ${T.redBorder}`,
            background: T.redBg, color: T.red, cursor: deleting ? "wait" : "pointer", opacity: deleting ? 0.6 : 1 }}>
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
            {sorted.map(row => (
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
                  <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim, background: T.well, borderRadius: 4,
                    padding: "1px 6px", border: `1px solid ${T.border}` }}>{fmt(row.followers)} followers</span>
                  <ZoneBadge zone={row.zone} />
                  <span style={{ marginLeft: "auto", fontFamily: sans, fontSize: F.xs, color: T.dim }}>{fmtDate(row.date)}</span>
                </div>
                <div style={{ fontFamily: sans, fontSize: F.sm, color: T.text, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                  {row.content || "—"}</div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${T.border}`, boxShadow: T.shadowSm }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: T.card, minWidth: 900 }}>
            <colgroup>
              <col style={{ width: 36 }} />
              <col style={{ width: 180 }} />
              <col style={{ width: 60 }} />
              <col style={{ width: 100 }} />
              <col />
              <col style={{ width: 80 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: 86 }} />
              <col style={{ width: 44 }} />
            </colgroup>
            <thead>
              <tr style={{ background: T.well }}>
                <th style={{ ...thStyle(""), cursor: "pointer", textAlign: "center", padding: "10px 8px" }} onClick={toggleSelectAll}>
                  <input type="checkbox" checked={sorted.length > 0 && selected.size === sorted.length}
                    onChange={toggleSelectAll} style={{ cursor: "pointer", accentColor: T.accent }} />
                </th>
                <th style={thStyle("name")} onClick={() => toggleSort("name")}>Person{arrow("name")}</th>
                <th style={{ ...thStyle("platform"), textAlign: "center" }} onClick={() => toggleSort("platform")}>Plat{arrow("platform")}</th>
                <th style={thStyle("type")} onClick={() => toggleSort("type")}>Type{arrow("type")}</th>
                <th style={{ ...thStyle("content"), cursor: "default" }}>Content</th>
                <th style={thStyle("followers")} onClick={() => toggleSort("followers")}>Followers{arrow("followers")}</th>
                <th style={thStyle("zone")} onClick={() => toggleSort("zone")}>Label{arrow("zone")}</th>
                <th style={thStyle("date")} onClick={() => toggleSort("date")}>Date{arrow("date")}</th>
                <th style={{ ...thStyle("_detail"), cursor: "default" }} />
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr><td colSpan={9} style={{ ...tdStyle, textAlign: "center", color: T.dim, padding: "40px 12px" }}>
                  No interactions found{platform && platform !== "all" ? ` on ${PLAT_LABEL[platform] || platform}` : ""}{weekFilter ? " for the selected week" : ""}.
                </td></tr>
              )}
              {sorted.map((row, i) => {
                const isSelected = selected.has(row.id);
                const isDetail = detailRow?.id === row.id;
                const isEditingName = editCell?.id === row.id && editCell?.field === "name";
                const isEditingZone = editCell?.id === row.id && editCell?.field === "zone";
                return (
                  <tr key={row.id}
                    style={{
                      background: isDetail ? T.accentBg : isSelected ? T.blueBg : i % 2 === 0 ? T.card : T.well + "88",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={e => {
                      const btn = e.currentTarget.querySelector("[data-detail-btn]");
                      if (btn) btn.style.opacity = "1";
                    }}
                    onMouseLeave={e => {
                      const btn = e.currentTarget.querySelector("[data-detail-btn]");
                      if (btn) btn.style.opacity = "0";
                    }}>
                    <td style={{ ...tdStyle, textAlign: "center", padding: "11px 8px" }}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(row.id)}
                        style={{ cursor: "pointer", accentColor: T.accent }} />
                    </td>
                    {/* Name — inline editable */}
                    <td style={{ ...tdStyle, maxWidth: 180 }}
                      onClick={() => { if (!editCell && row.source === "interactions") startEdit(row, "name"); }}>
                      {isEditingName ? (
                        <input
                          autoFocus
                          value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          onBlur={() => commitInlineEdit()}
                          onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") cancelInlineEdit(); }}
                          style={{
                            width: "100%", border: "none", outline: "none",
                            borderBottom: `2px solid ${T.accent}`,
                            fontFamily: sans, fontSize: F.sm, fontWeight: 600,
                            color: T.text, background: "transparent", padding: "1px 2px",
                          }}
                        />
                      ) : (
                        <div style={{ fontWeight: 600, fontSize: F.sm, color: T.text, lineHeight: 1.3,
                          cursor: row.source === "interactions" ? "text" : "default",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {row.name}
                        </div>
                      )}
                    </td>
                    {/* Platform */}
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <a href={PLAT_URL[row.platform]?.(row.handle) || "#"} target="_blank" rel="noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: 30, height: 30, borderRadius: 8,
                          background: (PLAT_COLORS[row.platform] || T.dim) + "14",
                          color: PLAT_COLORS[row.platform] || T.dim, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                        {row.platform === "instagram" ? <IgIcon size={16} color="#E1306C" /> : (PLAT_ICON[row.platform] || "·")}
                      </a>
                    </td>
                    <td style={tdStyle}><TypeBadge type={row.type} /></td>
                    <td style={{ ...tdStyle, maxWidth: 0 }}>
                      {(() => {
                        const href = row.mention_url || row.post_url;
                        const text = row.content ? truncate(row.content, 100) : "—";
                        const s = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          fontSize: F.xs, color: row.content ? T.sub : T.dim, fontStyle: row.content ? "normal" : "italic", display: "block" };
                        return href && row.content
                          ? <a href={href} target="_blank" rel="noreferrer" style={{ ...s, textDecoration: "none" }} title={href}>{text}</a>
                          : <div style={s}>{text}</div>;
                      })()}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600, whiteSpace: "nowrap" }}>{row.followers ? fmt(row.followers) : "—"}</td>
                    {/* Label — inline editable */}
                    <td style={{ ...tdStyle, cursor: "pointer" }}
                      onClick={() => { if (!editCell && row.source === "interactions") startEdit(row, "zone"); }}>
                      {isEditingZone ? (
                        <select
                          autoFocus
                          value={editVal}
                          onChange={e => { const v = e.target.value; setEditVal(v); commitInlineEdit(v); }}
                          onBlur={() => cancelInlineEdit()}
                          onKeyDown={e => { if (e.key === "Escape") cancelInlineEdit(); }}
                          style={{
                            fontFamily: sans, fontSize: F.xs, fontWeight: 600,
                            border: `1px solid ${T.border}`, borderRadius: 6,
                            padding: "3px 6px", background: T.card, color: T.text,
                            cursor: "pointer", outline: "none",
                          }}
                        >
                          {["ELITE", "INFLUENTIAL", "SIGNAL", "IGNORE"].map(z => (
                            <option key={z} value={z}>{z}</option>
                          ))}
                        </select>
                      ) : (
                        <ZoneBadge zone={row.zone} />
                      )}
                    </td>
                    <td style={{ ...tdStyle, whiteSpace: "nowrap", color: T.sub, fontSize: F.xs }}>{fmtDate(row.date)}</td>
                    {/* Detail button */}
                    <td style={{ ...tdStyle, padding: "10px 8px" }}>
                      {row.source === "interactions" && (
                        <button
                          data-detail-btn
                          onClick={() => setDetailRow(row)}
                          title="More details"
                          style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: 28, height: 28, borderRadius: 7,
                            background: T.well, border: `1px solid ${T.border}`,
                            cursor: "pointer", color: T.sub,
                            opacity: 0, transition: "opacity 0.15s, background 0.1s",
                            fontSize: 13,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = T.accentBg; e.currentTarget.style.color = T.accent; e.currentTarget.style.borderColor = T.accentBorder || T.border; }}
                          onMouseLeave={e => { e.currentTarget.style.background = T.well; e.currentTarget.style.color = T.sub; e.currentTarget.style.borderColor = T.border; }}
                        >
                          ···
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail slide-out panel (edit existing) */}
      {detailRow && (
        <>
          <div onClick={() => setDetailRow(null)} style={{
            position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.15)" }} />
          <DetailPanel row={detailRow} rawData={rawData} onClose={() => setDetailRow(null)}
            onSave={saveField} />
        </>
      )}

    </div>
  );
}
