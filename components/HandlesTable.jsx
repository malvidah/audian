"use client";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { PlatIcon, PlatChip, PLAT_COLORS as PLAT_COLOR } from "./PlatIcon";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ─── Design tokens (shared) ─────────────────────────────────────────────────
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
};

const sans = "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif";
const F = { xl: 28, lg: 20, md: 15, sm: 13, xs: 11 };

// Ghost input: looks exactly like the text it replaces, hairline accent underline only
function ghostInput({ fontSize = F.sm, fontWeight = 400, color = T.text, italic = false } = {}) {
  return {
    width: "100%", border: "none", outline: "none", background: "transparent",
    fontFamily: sans, fontSize, fontWeight, color, fontStyle: italic ? "italic" : "normal",
    padding: "0", margin: "0", boxSizing: "border-box",
    boxShadow: `inset 0 -1px 0 0 ${T.accent}99`,
    borderRadius: 0,
  };
}

const PLAT_URL   = {
  instagram: h => `https://instagram.com/${h}`,
  x:         h => `https://x.com/${h}`,
  youtube:   h => `https://youtube.com/@${h}`,
  linkedin:  h => `https://linkedin.com/in/${h}`,
};

const ZONE_CFG = {
  ELITE:       { label: "ELITE",       color: T.accent, bg: T.accentBg, border: T.accentBorder },
  INFLUENTIAL: { label: "INFLUENTIAL", color: T.green,  bg: T.greenBg,  border: T.greenBorder },
  SIGNAL:      { label: "SIGNAL",      color: T.blue,   bg: T.blueBg,   border: T.blueBorder },
  IGNORE:      { label: "IGNORE",      color: T.dim,    bg: T.well,     border: T.border },
};

const LIST_ORDER = ["ELITE", "INFLUENTIAL", "SIGNAL", "IGNORE"];

const PLATFORMS = ["instagram", "x", "youtube", "linkedin"];

const PLAT_LABEL = { instagram: "Instagram", x: "X (Twitter)", youtube: "YouTube", linkedin: "LinkedIn" };

function normalizeZone(zone) {
  return LIST_ORDER.includes(zone) ? zone : "UNASSIGNED";
}

function fmt(n) {
  if (!n && n !== 0) return "\u2014";
  n = parseInt(n);
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
}

function timeAgo(ts) {
  if (!ts) return null;
  const d = Math.floor((Date.now() - new Date(ts)) / 86400000);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 30) return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

function truncate(str, max) {
  if (!str) return "\u2014";
  return str.length > max ? str.slice(0, max) + "..." : str;
}

// ─── HandleDrawer ────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: "", bio: "", zone: "SIGNAL", entity_type: "person", tags: [],
  handle_instagram: "", handle_x: "", handle_youtube: "", handle_linkedin: "",
  followers_instagram: "", followers_x: "", followers_youtube: "", followers_linkedin: "",
};

const ENTITY_TYPES = [
  { value: "person",       label: "Person" },
  { value: "organization", label: "Organization" },
  { value: "page",         label: "Page" },
];

function EntityTypeSelect({ value, onChange }) {
  const active = value || "person";
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {ENTITY_TYPES.map(t => (
        <button key={t.value} onClick={() => onChange(t.value)} style={{
          fontFamily: sans, fontSize: F.xs, fontWeight: 600,
          padding: "5px 14px", borderRadius: 999, cursor: "pointer",
          border: active === t.value ? "none" : `1px solid ${T.border}`,
          background: active === t.value ? T.accent : T.well,
          color: active === t.value ? "#fff" : T.sub,
          transition: "all 0.12s",
        }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── TagInput ────────────────────────────────────────────────────────────────
// Controlled multi-tag input with autocomplete from existing tags.
// value: string[]   onChange: (string[]) => void   allTags: string[]
function TagInput({ value = [], onChange, allTags = [] }) {
  const [inputVal, setInputVal] = useState("");
  const [open, setOpen] = useState(false);
  const [focusIdx, setFocusIdx] = useState(-1);
  const inputRef = useRef(null);
  const dropRef  = useRef(null);

  const query = inputVal.trim().toLowerCase();
  const suggestions = allTags.filter(t =>
    t.toLowerCase().includes(query) && !value.includes(t)
  );
  const canCreate = query.length > 0 && !allTags.some(t => t.toLowerCase() === query) && !value.includes(inputVal.trim());
  const dropItems = canCreate ? [`+ Add "${inputVal.trim()}"`, ...suggestions] : suggestions;

  function addTag(tag) {
    const clean = tag.startsWith('+ Add "') ? inputVal.trim() : tag;
    if (!clean || value.includes(clean)) return;
    onChange([...value, clean]);
    setInputVal("");
    setOpen(false);
    setFocusIdx(-1);
    inputRef.current?.focus();
  }

  function removeTag(tag) {
    onChange(value.filter(t => t !== tag));
  }

  function handleKeyDown(e) {
    if (e.key === "Backspace" && !inputVal && value.length > 0) {
      removeTag(value[value.length - 1]);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIdx(i => Math.min(i + 1, dropItems.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIdx(i => Math.max(i - 1, -1));
      return;
    }
    if ((e.key === "Enter" || e.key === "Tab" || e.key === ",") && open) {
      e.preventDefault();
      if (focusIdx >= 0 && dropItems[focusIdx]) {
        addTag(dropItems[focusIdx]);
      } else if (inputVal.trim()) {
        addTag(inputVal.trim());
      }
      return;
    }
    if (e.key === "Escape") { setOpen(false); setFocusIdx(-1); }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (!dropRef.current?.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setOpen(false);
        setFocusIdx(-1);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div style={{ position: "relative" }}>
      {/* Tag pills + input */}
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center",
          minHeight: 38, padding: "5px 10px",
          border: `1px solid ${T.border}`, borderRadius: 8,
          background: T.surface, cursor: "text",
          transition: "border-color 0.15s",
        }}
        onFocus={() => {}}
      >
        {value.map(tag => (
          <span key={tag} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            background: T.purpleBg, color: T.purple,
            border: `1px solid ${T.purpleBorder}`,
            borderRadius: 999, padding: "2px 8px 2px 10px",
            fontSize: F.xs, fontWeight: 600, fontFamily: sans,
            whiteSpace: "nowrap",
          }}>
            {tag}
            <button
              onClick={e => { e.stopPropagation(); removeTag(tag); }}
              style={{
                background: "none", border: "none", cursor: "pointer", padding: 0,
                color: T.purple, fontSize: 13, lineHeight: 1, opacity: 0.6,
                display: "flex", alignItems: "center",
              }}
            >×</button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={inputVal}
          onChange={e => { setInputVal(e.target.value); setOpen(true); setFocusIdx(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? "Add tags…" : ""}
          style={{
            border: "none", outline: "none", background: "transparent",
            fontFamily: sans, fontSize: F.sm, color: T.text,
            flex: 1, minWidth: 80,
          }}
        />
      </div>

      {/* Dropdown */}
      {open && dropItems.length > 0 && (
        <div ref={dropRef} style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: T.surface, border: `1px solid ${T.border}`, borderRadius: 9,
          boxShadow: T.shadow, zIndex: 200,
          maxHeight: 200, overflowY: "auto",
          fontFamily: sans,
        }}>
          {dropItems.map((item, i) => (
            <div
              key={item}
              onMouseDown={e => { e.preventDefault(); addTag(item); }}
              onMouseEnter={() => setFocusIdx(i)}
              style={{
                padding: "8px 12px", cursor: "pointer",
                fontSize: F.sm, color: i === 0 && canCreate ? T.accent : T.text,
                fontWeight: i === 0 && canCreate ? 600 : 400,
                background: focusIdx === i ? T.well : "transparent",
                borderBottom: i < dropItems.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HandleDrawer({ open, mode, handle, onClose, onSaved, allTags = [] }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Populate form when editing
  useEffect(() => {
    if (mode === "edit" && handle) {
      setForm({
        name:               handle.name               || "",
        bio:                handle.bio                || "",
        zone:               handle.zone               || "SIGNAL",
        entity_type:        handle.entity_type        || "person",
        tags:               Array.isArray(handle.tags) ? handle.tags : [],
        handle_instagram:   handle.handle_instagram   || "",
        handle_x:           handle.handle_x           || "",
        handle_youtube:     handle.handle_youtube     || "",
        handle_linkedin:    handle.handle_linkedin    || "",
        followers_instagram: handle.followers_instagram != null ? String(handle.followers_instagram) : "",
        followers_x:         handle.followers_x        != null ? String(handle.followers_x)        : "",
        followers_youtube:   handle.followers_youtube  != null ? String(handle.followers_youtube)  : "",
        followers_linkedin:  handle.followers_linkedin != null ? String(handle.followers_linkedin) : "",
      });
    } else if (mode === "create") {
      setForm(EMPTY_FORM);
    }
    setError(null);
  }, [mode, handle, open]);

  if (!open) return null;

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      // Build payload – omit empty follower counts (keep null, not "")
      const payload = { ...form };
      for (const p of PLATFORMS) {
        const fk = `followers_${p}`;
        payload[fk] = payload[fk] !== "" ? parseInt(payload[fk]) || null : null;
      }
      for (const p of PLATFORMS) {
        const hk = `handle_${p}`;
        // strip leading @
        if (payload[hk]) payload[hk] = payload[hk].replace(/^@/, "");
        if (!payload[hk]) payload[hk] = null;
      }
      if (!payload.name && !PLATFORMS.some(p => payload[`handle_${p}`])) {
        setError("Please enter a name or at least one platform handle.");
        setSaving(false);
        return;
      }

      if (mode === "create") {
        const res = await fetch("/api/handles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const d = await res.json();
        if (d.error) throw new Error(d.error);
        onSaved(d.handle, "create");
      } else {
        const res = await fetch("/api/handles", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: handle.id, updates: payload }),
        });
        const d = await res.json();
        if (d.error) throw new Error(d.error);
        onSaved(d.handle, "edit");
      }
      onClose();
    } catch (e) {
      setError(e.message || "Save failed");
    }
    setSaving(false);
  }

  const title = mode === "create" ? "Add person / org" : "Edit person / org";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(26,24,22,0.35)",
          zIndex: 999, backdropFilter: "blur(2px)",
          animation: "fadeIn 0.15s ease",
        }}
      />
      {/* Drawer panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 460,
        background: T.surface, zIndex: 1000,
        boxShadow: "-4px 0 32px rgba(0,0,0,0.14)",
        display: "flex", flexDirection: "column",
        animation: "slideInRight 0.2s cubic-bezier(0.16,1,0.3,1)",
        fontFamily: sans,
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px 16px", borderBottom: `1px solid ${T.border}`,
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: F.lg, fontWeight: 700, color: T.text, lineHeight: 1.2 }}>
              {title}
            </div>
            {mode === "edit" && handle?.name && (
              <div style={{ fontSize: F.xs, color: T.dim, marginTop: 3 }}>
                {handle.name}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: T.well, border: `1px solid ${T.border}`, borderRadius: 8,
              width: 32, height: 32, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
              color: T.sub, fontSize: 18, lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {/* Name */}
          <Field label="Display name">
            <Input
              value={form.name}
              onChange={v => set("name", v)}
              placeholder="e.g. Jane Doe"
            />
          </Field>

          {/* Bio */}
          <Field label="Bio">
            <Textarea
              value={form.bio}
              onChange={v => set("bio", v)}
              placeholder="Short bio or description..."
            />
          </Field>

          {/* Zone */}
          <Field label="Label">
            <ZoneSelect value={form.zone} onChange={v => set("zone", v)} />
          </Field>

          {/* Entity type */}
          <Field label="Type">
            <EntityTypeSelect value={form.entity_type} onChange={v => set("entity_type", v)} />
          </Field>

          {/* Tags */}
          <Field label="Tags">
            <TagInput
              value={form.tags}
              onChange={v => set("tags", v)}
              allTags={allTags}
            />
          </Field>

          {/* Platform handles */}
          <div style={{ marginTop: 24, marginBottom: 6 }}>
            <div style={{
              fontSize: F.xs, fontWeight: 700, color: T.sub, textTransform: "uppercase",
              letterSpacing: "0.07em", marginBottom: 14,
            }}>
              Platform handles
            </div>
            {PLATFORMS.map(p => (
              <div key={p} style={{ marginBottom: 14 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  marginBottom: 6,
                }}>
                  <PlatChip platform={p} size={13} radius={6} />
                  <span style={{ fontSize: F.sm, fontWeight: 600, color: T.text }}>
                    {PLAT_LABEL[p]}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Input
                    value={form[`handle_${p}`]}
                    onChange={v => set(`handle_${p}`, v)}
                    placeholder={`@username`}
                    style={{ flex: 2 }}
                  />
                  <Input
                    value={form[`followers_${p}`]}
                    onChange={v => set(`followers_${p}`, v.replace(/[^\d]/g, ""))}
                    placeholder="Followers"
                    inputMode="numeric"
                    style={{ flex: 1, minWidth: 0 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px", borderTop: `1px solid ${T.border}`,
          flexShrink: 0, display: "flex", flexDirection: "column", gap: 8,
        }}>
          {error && (
            <div style={{
              background: T.redBg, border: `1px solid ${T.redBorder}`,
              borderRadius: 8, padding: "8px 12px",
              fontSize: F.xs, color: T.red, fontFamily: sans,
            }}>
              {error}
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: "10px 0", borderRadius: 9, cursor: "pointer",
              background: T.well, border: `1px solid ${T.border}`,
              color: T.sub, fontFamily: sans, fontSize: F.sm, fontWeight: 600,
            }}>
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 2, padding: "10px 0", borderRadius: 9, cursor: saving ? "default" : "pointer",
                background: saving ? T.dim : T.accent, border: "none",
                color: "#fff", fontFamily: sans, fontSize: F.sm, fontWeight: 700,
                opacity: saving ? 0.7 : 1, transition: "opacity 0.15s",
              }}
            >
              {saving ? "Saving…" : mode === "create" ? "Add person / org" : "Save changes"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideInRight { from { transform: translateX(100%) } to { transform: translateX(0) } }
      `}</style>
    </>
  );
}

// ─── Small form primitives ────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "block", fontSize: F.xs, fontWeight: 700, color: T.sub,
        textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6,
        fontFamily: sans,
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", style = {} }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", boxSizing: "border-box",
        padding: "8px 12px", borderRadius: 8,
        border: `1px solid ${T.border}`, background: T.surface,
        color: T.text, fontFamily: sans, fontSize: F.sm,
        outline: "none", transition: "border-color 0.15s",
        ...style,
      }}
      onFocus={e => e.target.style.borderColor = T.accent}
      onBlur={e => e.target.style.borderColor = T.border}
    />
  );
}

function Textarea({ value, onChange, placeholder }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      style={{
        width: "100%", boxSizing: "border-box",
        padding: "8px 12px", borderRadius: 8,
        border: `1px solid ${T.border}`, background: T.surface,
        color: T.text, fontFamily: sans, fontSize: F.sm,
        outline: "none", resize: "vertical", transition: "border-color 0.15s",
      }}
      onFocus={e => e.target.style.borderColor = T.accent}
      onBlur={e => e.target.style.borderColor = T.border}
    />
  );
}

function ZoneSelect({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {LIST_ORDER.map(zone => {
        const cfg = ZONE_CFG[zone];
        const active = value === zone;
        return (
          <button
            key={zone}
            onClick={() => onChange(zone)}
            style={{
              padding: "5px 12px", borderRadius: 6,
              border: `1px solid ${active ? cfg.border : T.border}`,
              background: active ? cfg.bg : T.surface,
              color: active ? cfg.color : T.sub,
              fontFamily: sans, fontSize: F.xs, fontWeight: 700,
              letterSpacing: "0.04em", cursor: "pointer",
              transition: "all 0.12s",
            }}
          >
            {zone}
          </button>
        );
      })}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function ZoneBadge({ zone, onClick }) {
  const cfg = ZONE_CFG[zone] || ZONE_CFG.SIGNAL;
  return (
    <span onClick={onClick} title={onClick ? "Click to change list" : undefined}
      style={{
        display: "inline-block", background: cfg.bg, color: cfg.color,
        border: `1px solid ${cfg.border}`, borderRadius: 6, padding: "2px 8px",
        fontSize: F.xs, fontWeight: 700, fontFamily: sans, letterSpacing: "0.04em",
        cursor: onClick ? "pointer" : "default", userSelect: "none",
        transition: "opacity 0.1s",
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.opacity = "0.7"; }}
      onMouseLeave={e => { if (onClick) e.currentTarget.style.opacity = "1"; }}>
      {cfg.label}
    </span>
  );
}

function StatCard({ label, value, color = T.text, active = false, onClick, clickable = false }) {
  return (
    <button
      onClick={onClick}
      disabled={!clickable}
      style={{
        flex: "1 1 180px",
        minWidth: 150,
        textAlign: "left",
        borderRadius: 14,
        padding: "18px 18px 16px",
        border: `1px solid ${active ? color + "44" : T.border}`,
        background: active ? color + "10" : T.card,
        boxShadow: active ? T.shadowMd : T.shadowSm,
        cursor: clickable ? "pointer" : "default",
        transition: "all 0.15s ease",
        fontFamily: sans,
      }}
    >
      <div style={{
        fontSize: 10,
        color: clickable ? color : T.dim,
        fontWeight: clickable ? 700 : 600,
        marginBottom: 6,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}>
        {label}
      </div>
      <div style={{ fontSize: F.xl, lineHeight: 1, fontWeight: 800, color }}>
        {value}
      </div>
    </button>
  );
}

function SummaryStats({ handles, selectedZones, onToggleZone }) {
  const counts = handles.reduce((acc, handle) => {
    const zone = normalizeZone(handle.zone);
    acc[zone] = (acc[zone] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
      <StatCard label="Total" value={handles.length} />
      <StatCard label="With bio" value={handles.filter(h => h.bio).length} />
      {["ELITE", "INFLUENTIAL", "SIGNAL"].map((zone) => (
        <StatCard
          key={zone}
          label={zone}
          value={counts[zone] || 0}
          color={ZONE_CFG[zone].color}
          active={selectedZones.has(zone)}
          clickable
          onClick={() => onToggleZone(zone)}
        />
      ))}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function HandlesTable({ platform, refreshKey }) {
  const [handles, setHandles] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZones, setSelectedZones] = useState(new Set());
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDesc, setSortDesc] = useState(false);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("create"); // "create" | "edit"
  const [drawerHandle, setDrawerHandle] = useState(null);

  // Inline edit state
  const [editCell, setEditCell] = useState(null); // { id, field }
  const [editVal, setEditVal] = useState("");

  const loadTags = useCallback(async () => {
    try {
      const res = await fetch("/api/tags");
      const d = await res.json();
      setAllTags(d.tags || []);
    } catch {}
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [handlesRes, tagsRes] = await Promise.all([
        fetch("/api/handles"),
        fetch("/api/tags"),
      ]);
      const [hd, td] = await Promise.all([handlesRes.json(), tagsRes.json()]);
      setHandles(hd.handles || []);
      setAllTags(td.tags || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const saveField = async (id, updates) => {
    try {
      await fetch("/api/handles", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, updates }),
      });
      setHandles(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
    } catch (e) { alert("Save failed: " + e.message); }
  };

  function startEdit(h, field) {
    setEditCell({ id: h.id, field });
    setEditVal(h[field] ?? "");
  }

  function commitEdit(overrideVal) {
    if (!editCell) return;
    const { id, field } = editCell;
    const val = overrideVal !== undefined ? overrideVal : editVal;
    setEditCell(null);
    setHandles(prev => prev.map(h => h.id === id ? { ...h, [field]: val } : h));
    saveField(id, { [field]: val });
  }

  function cancelEdit() { setEditCell(null); }

  function openCreate() {
    setDrawerMode("create");
    setDrawerHandle(null);
    setDrawerOpen(true);
  }

  function openEdit(handle) {
    setDrawerMode("edit");
    setDrawerHandle(handle);
    setDrawerOpen(true);
  }

  function handleDrawerSaved(savedHandle, mode) {
    if (mode === "create") {
      setHandles(prev => [savedHandle, ...prev]);
    } else {
      setHandles(prev => prev.map(h => h.id === savedHandle.id ? { ...h, ...savedHandle } : h));
    }
    // Refresh tag list in case new tags were added
    loadTags();
  }

  function primaryHandle(h) {
    for (const p of ["instagram", "x", "youtube", "linkedin"]) {
      if (h[`handle_${p}`]) return { p, handle: h[`handle_${p}`], followers: h[`followers_${p}`] };
    }
    return null;
  }

  function totalFollowers(h) {
    let t = 0;
    for (const p of ["instagram", "x", "youtube", "linkedin"]) {
      t += parseInt(h[`followers_${p}`] || 0);
    }
    return t;
  }

  const baseFiltered = useMemo(() => {
    let list = handles;

    // Platform filter
    if (platform && platform !== "all") {
      list = list.filter(h => h[`handle_${platform}`]);
    }

    // Search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(h =>
        h.name?.toLowerCase().includes(q)
        || h.handle_x?.toLowerCase().includes(q)
        || h.handle_instagram?.toLowerCase().includes(q)
        || h.bio?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [handles, platform, search]);

  const filtered = useMemo(() => {
    if (!selectedZones.size) return baseFiltered;
    return baseFiltered.filter(h => selectedZones.has(normalizeZone(h.zone)));
  }, [baseFiltered, selectedZones]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av, bv;
      if (sortBy === "name") {
        av = (a.name || "").toLowerCase(); bv = (b.name || "").toLowerCase();
      } else if (sortBy === "followers") {
        av = totalFollowers(a); bv = totalFollowers(b);
      } else if (sortBy === "zone") {
        const order = { ELITE: 0, INFLUENTIAL: 1, SIGNAL: 2, IGNORE: 3 };
        av = order[a.zone] ?? 4; bv = order[b.zone] ?? 4;
      } else if (sortBy === "interactions") {
        av = a.interaction_count || 0; bv = b.interaction_count || 0;
      } else if (sortBy === "last_seen") {
        av = a.last_interaction || a.updated_at || ""; bv = b.last_interaction || b.updated_at || "";
      } else {
        av = a[sortBy] ?? ""; bv = b[sortBy] ?? "";
      }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDesc ? -cmp : cmp;
    });
  }, [filtered, sortBy, sortDesc]);

  function toggleSort(col) {
    if (sortBy === col) setSortDesc(d => !d);
    else { setSortBy(col); setSortDesc(true); }
  }

  function toggleZone(zone) {
    setSelectedZones(prev => {
      const next = new Set(prev);
      if (next.has(zone)) next.delete(zone);
      else next.add(zone);
      return next;
    });
  }

  const thStyle = (col) => ({
    fontFamily: sans, fontSize: F.xs, fontWeight: 600,
    color: sortBy === col ? T.accent : T.sub,
    padding: "10px 12px", textAlign: "left", cursor: "pointer",
    whiteSpace: "nowrap", borderBottom: `1px solid ${T.border}`, userSelect: "none",
  });

  const tdStyle = {
    padding: "10px 12px", fontFamily: sans, fontSize: F.sm, color: T.text,
    borderBottom: `1px solid ${T.border}`, verticalAlign: "middle",
  };

  const arrow = (col) => sortBy === col ? (sortDesc ? " \u2193" : " \u2191") : "";

  if (loading) {
    return (
      <div style={{ fontFamily: sans, fontSize: F.md, color: T.sub, textAlign: "center", padding: "60px 20px" }}>
        Loading...
      </div>
    );
  }

  return (
    <div>
      {/* Drawer */}
      <HandleDrawer
        open={drawerOpen}
        mode={drawerMode}
        handle={drawerHandle}
        onClose={() => setDrawerOpen(false)}
        onSaved={handleDrawerSaved}
        allTags={allTags}
      />

      <SummaryStats handles={baseFiltered} selectedZones={selectedZones} onToggleZone={toggleZone} />

      {/* Filters row + Add button */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ fontFamily: sans, fontSize: F.xs, color: T.sub, fontWeight: 600 }}>
          {selectedZones.size
            ? `Showing: ${[...selectedZones].join(", ")}`
            : "Showing: all labels"}
        </div>

        {selectedZones.size > 0 && (
          <button onClick={() => setSelectedZones(new Set())} style={{
            background: "transparent",
            color: T.dim,
            border: `1px solid ${T.border}`,
            borderRadius: 999,
            padding: "4px 10px",
            fontFamily: sans,
            fontSize: F.xs,
            fontWeight: 600,
            cursor: "pointer",
          }}>
            Clear filters
          </button>
        )}

        <input value={search} placeholder="Search..." onChange={e => setSearch(e.target.value)}
          style={{
            marginLeft: "auto", background: T.card, border: `1px solid ${T.border}`,
            color: T.text, borderRadius: 8, padding: "6px 12px", fontFamily: sans,
            fontSize: F.sm, outline: "none", width: 200,
          }} />

        {/* Add new handle button */}
        <button
          onClick={openCreate}
          title="Add new handle"
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
          Add person / org
        </button>
      </div>

      {/* Count */}
      <div style={{ fontFamily: sans, fontSize: F.sm, color: T.sub, marginBottom: 10 }}>
        {sorted.length} {sorted.length !== 1 ? "people" : "person"}
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${T.border}` }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: T.card, minWidth: 780 }}>
          <colgroup>
            <col style={{ width: 180 }} />
            <col style={{ width: 130 }} />
            <col />
            <col style={{ width: 88 }} />
            <col style={{ width: 96 }} />
            <col style={{ width: 86 }} />
            <col style={{ width: 44 }} />
          </colgroup>
          <thead>
            <tr style={{ background: T.well }}>
              <th style={thStyle("name")} onClick={() => toggleSort("name")}>
                Name{arrow("name")}
              </th>
              <th style={{ ...thStyle("platforms"), cursor: "default" }}>
                Platforms
              </th>
              <th style={{ ...thStyle("bio"), cursor: "default" }}>
                Bio
              </th>
              <th style={thStyle("followers")} onClick={() => toggleSort("followers")}>
                Followers{arrow("followers")}
              </th>
              <th style={thStyle("zone")} onClick={() => toggleSort("zone")}>
                Label{arrow("zone")}
              </th>
              <th style={{ ...thStyle("last_seen") }} onClick={() => toggleSort("last_seen")}>
                Last seen{arrow("last_seen")}
              </th>
              {/* Detail column */}
              <th style={{ ...thStyle("_edit"), cursor: "default" }} />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} style={{
                  ...tdStyle, textAlign: "center", color: T.dim, padding: "40px 12px",
                }}>
                  {search
                    ? `No people matching "${search}"`
                    : selectedZones.size
                      ? "No people match the selected label filters."
                      : "No people yet. Click \"Add person / org\" or import a CSV to get started."}
                </td>
              </tr>
            )}
            {sorted.map((h) => {
              const pri = primaryHandle(h);
              return (
                <tr key={h.id}
                  style={{ transition: "background 0.1s" }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = T.well + "88";
                    const editBtn = e.currentTarget.querySelector("[data-edit-btn]");
                    if (editBtn) editBtn.style.opacity = "1";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "transparent";
                    const editBtn = e.currentTarget.querySelector("[data-edit-btn]");
                    if (editBtn) editBtn.style.opacity = "0";
                  }}>
                  {/* Name */}
                  <td style={{ ...tdStyle, maxWidth: 180, cursor: "text" }}
                    onClick={() => { if (!editCell) startEdit(h, "name"); }}>
                    {editCell?.id === h.id && editCell?.field === "name" ? (
                      <input
                        autoFocus
                        value={editVal}
                        onChange={e => setEditVal(e.target.value)}
                        onBlur={() => commitEdit()}
                        onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") cancelEdit(); }}
                        style={ghostInput({ fontSize: F.sm, fontWeight: 600 })}
                      />
                    ) : (
                      <div style={{
                        fontWeight: 600, fontSize: F.sm, color: T.text, lineHeight: 1.3,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {h.name || pri?.handle || "\u2014"}
                      </div>
                    )}
                    {h.entity_type && h.entity_type !== "person" && (
                      <span style={{
                        display: "inline-block", marginTop: 2,
                        fontSize: 10, fontWeight: 700, letterSpacing: "0.04em",
                        color: h.entity_type === "organization" ? "#2563EB" : "#7C3AED",
                        background: h.entity_type === "organization" ? "#EFF6FF" : "#F5F3FF",
                        border: `1px solid ${h.entity_type === "organization" ? "#BFDBFE" : "#DDD6FE"}`,
                        borderRadius: 4, padding: "1px 5px", fontFamily: sans,
                      }}>
                        {h.entity_type === "organization" ? "ORG" : "PAGE"}
                      </span>
                    )}
                    {Array.isArray(h.tags) && h.tags.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 4 }}>
                        {h.tags.map(tag => (
                          <span key={tag} style={{
                            display: "inline-block",
                            fontSize: 10, fontWeight: 600,
                            color: T.purple, background: T.purpleBg,
                            border: `1px solid ${T.purpleBorder}`,
                            borderRadius: 999, padding: "1px 6px",
                            fontFamily: sans, whiteSpace: "nowrap",
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  {/* Platforms */}
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {["instagram", "x", "youtube", "linkedin"].map(p => {
                        const hdl = h[`handle_${p}`];
                        if (!hdl) return null;
                        return (
                          <a key={p} href={PLAT_URL[p]?.(hdl)} target="_blank" rel="noreferrer"
                            title={`@${hdl}`}
                            style={{ textDecoration: "none", transition: "opacity 0.15s", display: "inline-flex" }}
                            onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
                            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                            <PlatChip platform={p} size={14} radius={6} />
                          </a>
                        );
                      })}
                      {!["instagram", "x", "youtube", "linkedin"].some(p => h[`handle_${p}`]) && (
                        <span style={{ fontSize: F.xs, color: T.dim }}>\u2014</span>
                      )}
                    </div>
                  </td>
                  {/* Bio */}
                  <td style={{ ...tdStyle, maxWidth: 0, cursor: "text" }}
                    onClick={() => { if (!editCell) startEdit(h, "bio"); }}>
                    {editCell?.id === h.id && editCell?.field === "bio" ? (
                      <input
                        autoFocus
                        value={editVal}
                        onChange={e => setEditVal(e.target.value)}
                        onBlur={() => commitEdit()}
                        onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") cancelEdit(); }}
                        style={ghostInput({ fontSize: F.xs, color: T.sub })}
                      />
                    ) : (
                      <div style={{
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        fontSize: F.xs, color: h.bio ? T.sub : T.dim,
                        fontStyle: h.bio ? "normal" : "italic",
                      }}>
                        {h.bio ? truncate(h.bio, 80) : "—"}
                      </div>
                    )}
                  </td>
                  {/* Followers */}
                  {(() => {
                    const isEditingFollowers = editCell?.id === h.id && editCell?.field?.startsWith("followers_");
                    const followerField = pri ? `followers_${pri.p}` : null;
                    return (
                      <td style={{ ...tdStyle, fontWeight: 600, whiteSpace: "nowrap", cursor: followerField ? "text" : "default" }}
                        onClick={() => { if (!editCell && followerField) startEdit(h, followerField); }}>
                        {isEditingFollowers ? (
                          <input
                            autoFocus
                            type="text"
                            inputMode="numeric"
                            value={editVal}
                            onChange={e => setEditVal(e.target.value.replace(/[^\d]/g, ""))}
                            onBlur={() => { commitEdit(editVal === "" ? null : parseInt(editVal, 10) || null); }}
                            onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") cancelEdit(); }}
                            style={{ ...ghostInput({ fontSize: F.sm, fontWeight: 600 }), width: 80 }}
                          />
                        ) : (
                          totalFollowers(h) > 0 ? fmt(totalFollowers(h)) : "\u2014"
                        )}
                      </td>
                    );
                  })()}
                  {/* Zone / Label — overlay select on badge so badge stays visible */}
                  <td style={{ ...tdStyle }}>
                    <div style={{ position: "relative", display: "inline-block" }}>
                      <ZoneBadge zone={editCell?.id === h.id && editCell?.field === "zone" ? editVal : h.zone} />
                      <select
                        value={editCell?.id === h.id && editCell?.field === "zone" ? editVal : (h.zone || "SIGNAL")}
                        onChange={e => { const v = e.target.value; setEditVal(v); if (!editCell) startEdit(h, "zone"); commitEdit(v); }}
                        onFocus={() => { if (!editCell) startEdit(h, "zone"); }}
                        onBlur={() => cancelEdit()}
                        onKeyDown={e => { if (e.key === "Escape") cancelEdit(); }}
                        style={{
                          position: "absolute", inset: 0, opacity: 0,
                          cursor: "pointer", width: "100%", height: "100%",
                        }}
                      >
                        {["ELITE", "INFLUENTIAL", "SIGNAL", "IGNORE"].map(z => (
                          <option key={z} value={z}>{z}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  {/* Last seen */}
                  <td style={{ ...tdStyle, whiteSpace: "nowrap", color: T.dim, fontSize: F.xs }}>
                    {timeAgo(h.last_interaction) || timeAgo(h.updated_at) || "\u2014"}
                  </td>
                  {/* Detail button */}
                  <td style={{ ...tdStyle, padding: "10px 8px" }}>
                    <button
                      data-edit-btn
                      onClick={() => openEdit(h)}
                      title="More details"
                      style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 28, height: 28, borderRadius: 7,
                        background: T.well, border: `1px solid ${T.border}`,
                        cursor: "pointer", color: T.sub,
                        opacity: 0, transition: "opacity 0.15s, background 0.1s",
                        fontSize: 13,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = T.accentBg; e.currentTarget.style.color = T.accent; e.currentTarget.style.borderColor = T.accentBorder; }}
                      onMouseLeave={e => { e.currentTarget.style.background = T.well; e.currentTarget.style.color = T.sub; e.currentTarget.style.borderColor = T.border; }}
                    >
                      ···
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
