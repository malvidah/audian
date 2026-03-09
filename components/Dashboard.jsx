"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  // Neutral scale
  bg:       "#F8F7F5",
  surface:  "#FFFFFF",
  card:     "#FFFFFF",
  well:     "#F3F2F0",
  border:   "#E8E6E1",
  border2:  "#D6D3CC",
  // Text
  text:     "#1A1816",
  sub:      "#6B6560",
  dim:      "#A8A39C",
  // Brand
  accent:   "#FF6B35",   // warm orange — distinctive, not generic blue
  accentBg: "#FFF3EE",
  accentBorder: "#FFD4C2",
  // Semantic
  green:    "#16A34A",
  greenBg:  "#F0FDF4",
  red:      "#DC2626",
  redBg:    "#FEF2F2",
  blue:     "#2563EB",
  blueBg:   "#EFF6FF",
  purple:   "#7C3AED",
  purpleBg: "#F5F3FF",
  // Platform
  yt:    "#FF0000",
  ig:    "#E1306C",
  x:     "#000000",
  li:    "#0077B5",
  // Shadow
  shadow:   "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
  shadowSm: "0 1px 2px rgba(0,0,0,0.05)",
  shadowMd: "0 4px 24px rgba(0,0,0,0.08)",
};

const PLAT_COLORS = { youtube: T.yt, x: T.x, instagram: T.ig, linkedin: T.li };

const sans  = "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif";
const mono  = "'SF Mono', 'Fira Code', ui-monospace, monospace";
const F     = { xl: 36, lg: 22, md: 15, sm: 13, xs: 11 };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n) {
  if (!n && n !== 0) return "—";
  n = parseInt(n);
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toLocaleString();
}
function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "just now";
}
function pctDelta(curr, prev) {
  if (!prev || prev === 0) return null;
  return ((curr - prev) / prev) * 100;
}

// ─── Base components ──────────────────────────────────────────────────────────
function Card({ children, style = {}, hover = false }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => hover && setHov(true)}
      onMouseLeave={() => hover && setHov(false)}
      style={{
        background: T.card, borderRadius: 12, border: `1px solid ${T.border}`,
        boxShadow: hov ? T.shadowMd : T.shadowSm,
        transition: "box-shadow 0.15s, transform 0.15s",
        transform: hov ? "translateY(-1px)" : "none",
        ...style
      }}
    >{children}</div>
  );
}

function Badge({ children, color = T.accent, bg = T.accentBg }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: bg, color, borderRadius: 6, padding: "2px 8px", fontSize: F.xs, fontWeight: 600, fontFamily: sans }}>
      {children}
    </span>
  );
}

function PlatDot({ platform, size = 8 }) {
  return <span style={{ display: "inline-block", width: size, height: size, borderRadius: "50%", background: PLAT_COLORS[platform?.toLowerCase()] || T.dim, flexShrink: 0 }} />;
}

function Divider() {
  return <div style={{ height: 1, background: T.border, margin: "0" }} />;
}

function SectionHeader({ label, count, open, onToggle, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", cursor: "pointer" }} onClick={onToggle}>
      <span style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text, letterSpacing: "-0.01em" }}>{label}</span>
      {count !== undefined && count > 0 && (
        <span style={{ marginLeft: 8, background: T.well, color: T.sub, borderRadius: 20, padding: "1px 8px", fontSize: F.xs, fontFamily: sans, fontWeight: 500 }}>{count}</span>
      )}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        {action && <div onClick={e => e.stopPropagation()}>{action}</div>}
        <span style={{ color: T.dim, fontSize: F.xs, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>▾</span>
      </div>
    </div>
  );
}

function Btn({ children, onClick, disabled, variant = "ghost", size = "sm" }) {
  const [hov, setHov] = useState(false);
  const base = {
    fontFamily: sans, fontWeight: 500, cursor: disabled ? "not-allowed" : "pointer",
    border: "none", outline: "none", borderRadius: 8, transition: "all 0.12s",
    opacity: disabled ? 0.5 : 1, display: "inline-flex", alignItems: "center", gap: 6,
  };
  const sizes = { sm: { fontSize: F.xs, padding: "5px 12px" }, md: { fontSize: F.sm, padding: "8px 16px" }, lg: { fontSize: F.md, padding: "10px 20px" } };
  const variants = {
    primary:  { background: T.accent, color: "#fff", boxShadow: hov ? "0 2px 8px rgba(255,107,53,0.35)" : "none" },
    secondary:{ background: T.well, color: T.text, border: `1px solid ${T.border}` },
    ghost:    { background: hov ? T.well : "transparent", color: T.sub, border: `1px solid ${hov ? T.border : "transparent"}` },
    orange:   { background: hov ? T.accentBg : "transparent", color: T.accent, border: `1px solid ${hov ? T.accentBorder : T.accentBorder}` },
    purple:   { background: hov ? T.purpleBg : "transparent", color: T.purple, border: `1px solid ${T.purple}33` },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ ...base, ...sizes[size], ...variants[variant] }}>
      {children}
    </button>
  );
}


// ─── Profile Menu ─────────────────────────────────────────────────────────────
const PLAT_META = [
  { id: "youtube",   label: "YouTube",   icon: "▶", color: "#FF0000", authUrl: "/api/auth/youtube" },
  { id: "instagram", label: "Instagram", icon: "◉", color: "#E1306C", authUrl: "/api/auth/instagram" },
  { id: "x",        label: "X / Twitter",icon: "𝕏", color: "#000000", authUrl: "/api/auth/x" },
  { id: "linkedin",  label: "LinkedIn",  icon: "in", color: "#0077B5", authUrl: "/api/auth/linkedin" },
];

function Toggle({ on, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
        background: on ? T.accent : (hov ? T.border2 : T.border),
        position: "relative", transition: "background 0.2s", flexShrink: 0,
        boxShadow: on ? `0 0 0 3px ${T.accent}25` : "none",
      }}>
      <span style={{
        position: "absolute", top: 3, left: on ? 21 : 3,
        width: 16, height: 16, borderRadius: "50%", background: "#fff",
        transition: "left 0.18s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        display: "block",
      }} />
    </button>
  );
}

function ProfileMenu({ session, supabase, connections, onDisconnect, watchlist = [], watchlistTotal = 0, onWatchlistUpdate }) {
  const [open, setOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(null);
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const [uploading, setUploading]         = useState(false);
  const [uploadMsg, setUploadMsg]         = useState("");
  const fileRef = useRef(null);
  const menuRef = useRef(null);
  const email = session?.user?.email || "";
  const initial = email[0]?.toUpperCase() || "?";

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  async function disconnect(platformId) {
    setDisconnecting(platformId);
    try {
      await onDisconnect(platformId);
    } catch(e) {
      console.error("Disconnect error:", e);
    }
    setDisconnecting(null);
  }

  async function handleCSV(file) {
    if (!file) return;
    setUploading(true); setUploadMsg("");
    const text = await file.text();
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const entries = [];

    // Detect header row and skip it
    const firstLine = lines[0]?.toLowerCase() || "";
    const startIdx = (firstLine.includes("handle") || firstLine.includes("name") || firstLine.includes("platform")) ? 1 : 0;

    for (const line of lines.slice(startIdx, 5000)) {
      // Handle quoted CSV fields
      const parts = line.match(/("([^"]*)"|[^,]+|(?<=,)(?=,)|^(?=,))/g)
        ?.map(p => p.replace(/^"|"$/g, "").trim()) || line.split(",").map(p => p.trim());

      if (parts.length === 0 || !parts.some(p => p)) continue;

      // Format: Name, @handle, Source List, Status, ..., Label  (Big Think export)
      // Detect by: has @ in one of the first 3 columns
      const handleIdx = parts.findIndex((p, i) => i < 4 && p.startsWith("@"));
      if (handleIdx >= 0) {
        const handle = parts[handleIdx].replace(/^@/, "").toLowerCase().trim();
        const label  = parts[parts.length - 1] || parts[2] || null;
        const platform = "x"; // Big Think list is X handles
        if (handle) entries.push({ platform, handle, label });
        continue;
      }

      // Generic formats: handle | platform,handle | platform,handle,label
      const knownPlat = ["instagram","youtube","x","twitter","linkedin"].includes(parts[0]?.toLowerCase());
      if (parts.length === 1) {
        entries.push({ platform: "instagram", handle: parts[0].replace(/^@/, "").toLowerCase() });
      } else if (parts.length === 2) {
        if (knownPlat) entries.push({ platform: parts[0] === "twitter" ? "x" : parts[0].toLowerCase(), handle: parts[1].replace(/^@/, "").toLowerCase() });
        else           entries.push({ platform: "instagram", handle: parts[0].replace(/^@/, "").toLowerCase(), label: parts[1] });
      } else if (parts.length >= 3) {
        if (knownPlat) entries.push({ platform: parts[0] === "twitter" ? "x" : parts[0].toLowerCase(), handle: parts[1].replace(/^@/, "").toLowerCase(), label: parts[2] });
        else           entries.push({ platform: "instagram", handle: parts[0].replace(/^@/, "").toLowerCase(), label: parts[parts.length - 1] });
      }
    }
    // Deduplicate by platform+handle
    const seen = new Set();
    const deduped = entries.filter(e => {
      const key = `${e.platform}:${e.handle}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    try {
      const sess = await supabase.auth.getSession();
      const tok = sess.data?.session?.access_token;
      const res = await fetch("/api/watchlist", { method: "POST", headers: { "Content-Type": "application/json", ...(tok ? { Authorization: `Bearer ${tok}` } : {}) }, body: JSON.stringify({ entries: deduped }) });
      const data = await res.json();
      if (data.error) setUploadMsg("✗ " + data.error);
      else { setUploadMsg(`✓ ${(data.added || deduped.length).toLocaleString()} accounts added`); onWatchlistUpdate?.(); }
    } catch { setUploadMsg("✗ Upload failed"); }
    setUploading(false);
  }

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      {/* Avatar badge */}
      <button onClick={() => setOpen(o => !o)}
        style={{
          width: 32, height: 32, borderRadius: "50%",
          background: open ? T.accent : `linear-gradient(135deg, ${T.accent} 0%, #ff9060 100%)`,
          border: open ? `2px solid ${T.accent}` : "2px solid transparent",
          boxShadow: open ? `0 0 0 3px ${T.accent}30` : "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "all 0.15s",
          fontFamily: sans, fontSize: 13, fontWeight: 700, color: "#fff",
        }}>
        {initial}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 10px)", right: 0,
          width: 280, background: T.card,
          border: `1px solid ${T.border}`, borderRadius: 14,
          boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
          zIndex: 500, overflow: "hidden",
          animation: "fadeSlideDown 0.12s ease-out",
        }}>
          <style>{`
            @keyframes fadeSlideDown {
              from { opacity: 0; transform: translateY(-6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Header */}
          <div style={{ padding: "16px 18px 14px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: `linear-gradient(135deg, ${T.accent} 0%, #ff9060 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: sans, fontSize: 15, fontWeight: 700, color: "#fff", flexShrink: 0,
              }}>{initial}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email.split("@")[0]}</div>
                <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email}</div>
              </div>
            </div>
          </div>

          {/* Platform connections */}
          <div style={{ padding: "10px 0" }}>
            <div style={{ padding: "4px 18px 8px", fontFamily: sans, fontSize: 10, fontWeight: 600, color: T.dim, letterSpacing: "0.06em", textTransform: "uppercase" }}>Connections</div>
            {PLAT_META.map(p => {
              const conn = connections.find(c => c.platform === p.id);
              const isConnected = !!conn;
              const isLoading = disconnecting === p.id;
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 18px" }}>
                  {/* Platform icon */}
                  <div style={{
                    width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                    background: p.color + "14",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, color: p.color, fontWeight: 700,
                  }}>{p.icon}</div>
                  {/* Label + handle */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 500, color: T.text }}>{p.label}</div>
                    {conn?.channel_name && (
                      <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{conn.channel_name}</div>
                    )}
                  </div>
                  {/* Toggle — connects or disconnects */}
                  {isLoading ? (
                    <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>…</span>
                  ) : isConnected ? (
                    <Toggle on={true} onClick={() => disconnect(p.id)} />
                  ) : (
                    <Toggle on={false} onClick={() => { window.location.href = p.authUrl; }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Watchlist */}
          <div style={{ borderTop: `1px solid ${T.border}` }}>
            <button onClick={() => setWatchlistOpen(o => !o)}
              style={{ width: "100%", padding: "11px 18px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, textAlign: "left" }}>
              <span style={{ fontFamily: sans, fontSize: F.sm, color: T.text, fontWeight: 500 }}>👁 Watch core accounts</span>
              <span style={{ marginLeft: "auto", fontFamily: sans, fontSize: F.xs, color: T.dim }}>{watchlistTotal > 0 ? `${watchlistTotal.toLocaleString()} accounts` : "Upload CSV"}</span>
              <span style={{ color: T.dim, fontSize: F.xs, transform: watchlistOpen ? "rotate(180deg)" : "none", display: "inline-block", transition: "transform 0.15s" }}>▾</span>
            </button>
            {watchlistOpen && (
              <div style={{ padding: "0 18px 14px" }}>
                <div style={{ fontFamily: sans, fontSize: F.xs, color: T.sub, marginBottom: 10, lineHeight: 1.5 }}>
                  Upload a CSV of your core accounts to watch. When they interact with your content they'll be marked <strong>CORE</strong>. Others with high follower counts are <strong>INFLUENTIAL</strong>. Promising accounts are <strong>RADAR</strong>.
                </div>
                <div style={{ fontFamily: sans, fontSize: 10, color: T.dim, marginBottom: 8 }}>
                  CSV format: <code style={{ background: T.well, padding: "1px 4px", borderRadius: 3 }}>handle</code> or <code style={{ background: T.well, padding: "1px 4px", borderRadius: 3 }}>platform,handle</code> or <code style={{ background: T.well, padding: "1px 4px", borderRadius: 3 }}>platform,handle,label</code>
                </div>
                <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display: "none" }} onChange={e => handleCSV(e.target.files[0])} />
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <Btn variant="orange" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    {uploading ? "Uploading…" : "↑ Upload CSV"}
                  </Btn>
                  {watchlistTotal > 0 && (
                    <Btn variant="ghost" size="sm" onClick={async () => {
                      if (!confirm(`Remove all ${watchlistTotal.toLocaleString()} accounts from watchlist?`)) return;
                      const sess = await supabase.auth.getSession();
                      const tok = sess.data?.session?.access_token;
                      await fetch("/api/watchlist", { method: "DELETE", headers: { "Content-Type": "application/json", ...(tok ? { Authorization: `Bearer ${tok}` } : {}) } });
                      setUploadMsg("✓ Watchlist cleared");
                      onWatchlistUpdate?.();
                    }}>
                      ✕ Clear all
                    </Btn>
                  )}
                  {uploadMsg && <span style={{ fontFamily: sans, fontSize: F.xs, color: uploadMsg.startsWith("✓") ? T.green : T.red }}>{uploadMsg}</span>}
                </div>
                {watchlist.length > 0 && (
                  <div style={{ marginTop: 10, maxHeight: 120, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                    {watchlist.slice(0, 20).map((w, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
                        <PlatDot platform={w.platform} size={6} />
                        <span style={{ fontFamily: sans, fontSize: F.xs, color: T.sub, flex: 1 }}>@{w.handle}</span>
                        {w.label && <span style={{ fontFamily: sans, fontSize: 10, color: T.dim }}>{w.label}</span>}
                        <button onClick={async () => { const s = await supabase.auth.getSession(); const t = s.data?.session?.access_token; await fetch("/api/watchlist", { method: "DELETE", headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) }, body: JSON.stringify({ platform: w.platform, handle: w.handle }) }); onWatchlistUpdate?.(); }}
                          style={{ background: "none", border: "none", cursor: "pointer", color: T.dim, fontSize: 12, padding: "0 2px", lineHeight: 1 }}>×</button>
                      </div>
                    ))}
                    {watchlist.length > 20 && <div style={{ fontFamily: sans, fontSize: 10, color: T.dim }}>+{watchlist.length - 20} more</div>}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ borderTop: `1px solid ${T.border}`, padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <a href="https://audian.app" target="_blank" rel="noreferrer"
              style={{ fontFamily: sans, fontSize: F.xs, color: T.sub, textDecoration: "none", fontWeight: 500 }}>
              Learn more ↗
            </a>
            <button onClick={() => supabase.auth.signOut()}
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: sans, fontSize: F.xs, color: T.sub, fontWeight: 500 }}>
              Sign out →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sign In ──────────────────────────────────────────────────────────────────
function SignIn({ supabase }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  async function go() {
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    if (!error) setSent(true);
    setLoading(false);
  }
  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sans }}>
      <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, padding: "40px 44px", maxWidth: 380, width: "100%", boxShadow: T.shadowMd }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>A</span>
          </div>
          <div>
            <div style={{ fontSize: F.md, fontWeight: 700, color: T.text, letterSpacing: "-0.02em" }}>Audian</div>
            <div style={{ fontSize: F.xs, color: T.sub }}>Social Intelligence</div>
          </div>
        </div>
        <div style={{ fontSize: F.lg, fontWeight: 600, color: T.text, marginBottom: 6, letterSpacing: "-0.02em" }}>Welcome back</div>
        <div style={{ fontSize: F.sm, color: T.sub, marginBottom: 24 }}>Sign in to your workspace</div>
        {sent ? (
          <div style={{ background: T.greenBg, border: `1px solid #BBF7D0`, borderRadius: 8, padding: "12px 14px", fontSize: F.sm, color: T.green }}>
            ✓ Check your email — magic link sent.
          </div>
        ) : (
          <>
            <input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && go()}
              style={{ width: "100%", background: T.well, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", color: T.text, fontFamily: sans, fontSize: F.sm, outline: "none", boxSizing: "border-box", marginBottom: 10 }} />
            <button onClick={go} disabled={loading}
              style={{ width: "100%", background: T.accent, border: "none", borderRadius: 8, padding: "11px", color: "#fff", fontFamily: sans, fontSize: F.sm, fontWeight: 600, cursor: "pointer", letterSpacing: "-0.01em" }}>
              {loading ? "Sending…" : "Continue with email →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ label, value, prev, color, icon, selected, onClick }) {
  const d = pctDelta(value, prev);
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, minWidth: 140, background: selected ? color + "0A" : T.card,
        border: `1.5px solid ${selected ? color + "40" : (hov ? T.border2 : T.border)}`,
        borderRadius: 12, padding: "16px 18px", cursor: "pointer", textAlign: "left",
        boxShadow: selected ? `0 0 0 3px ${color}15` : T.shadowSm, transition: "all 0.12s",
      }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontFamily: sans, fontSize: F.xs, fontWeight: 500, color: selected ? color : T.sub, letterSpacing: "0.01em" }}>{label}</span>
        <span style={{ fontSize: 16, opacity: 0.7 }}>{icon}</span>
      </div>
      <div style={{ fontFamily: sans, fontSize: F.xl, fontWeight: 700, color: selected ? color : T.text, letterSpacing: "-0.03em", lineHeight: 1 }}>{fmt(value)}</div>
      {d !== null && (
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: F.xs, fontWeight: 600, color: d >= 0 ? T.green : T.red }}>{d >= 0 ? "↑" : "↓"} {Math.abs(d).toFixed(1)}%</span>
          <span style={{ fontSize: F.xs, color: T.dim }}>vs prev</span>
        </div>
      )}
    </button>
  );
}

// ─── Chart ────────────────────────────────────────────────────────────────────
function MetricsChart({ allMetrics, activeMetric, activePlatform }) {
  const extract = {
    followers:   m => m.followers || 0,
    impressions: m => m.impressions || m.total_views || 0,
    reach:       m => m.reach || 0,
    likes:       m => m.likes || 0,
    comments:    m => m.comments_count || 0,
  }[activeMetric] || (m => m.followers || 0);

  const filtered = allMetrics
    .filter(m => activePlatform === "All" || m.platform === activePlatform)
    .sort((a, b) => new Date(a.snapshot_at) - new Date(b.snapshot_at));

  const platforms = [...new Set(filtered.map(m => m.platform))];

  const grouped = {};
  filtered.forEach(m => {
    const key = fmtDate(m.snapshot_at);
    if (!grouped[key]) grouped[key] = { date: key };
    grouped[key][m.platform] = (grouped[key][m.platform] || 0) + extract(m);
  });
  const data = Object.values(grouped);

  if (data.length === 0) return (
    <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
      <span style={{ fontSize: 32 }}>📊</span>
      <span style={{ fontFamily: sans, fontSize: F.sm, color: T.dim }}>Sync a platform to start tracking</span>
    </div>
  );

  if (data.length === 1) {
    const val = platforms.reduce((s, p) => s + (data[0][p] || 0), 0);
    return (
      <div style={{ height: 120, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <div style={{ fontFamily: sans, fontSize: 42, fontWeight: 700, color: T.text, letterSpacing: "-0.03em" }}>{fmt(val)}</div>
        <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>Sync again tomorrow to build your trend line</div>
      </div>
    );
  }

  const TT = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 14px", boxShadow: T.shadowMd }}>
        <div style={{ fontFamily: sans, fontSize: F.xs, color: T.sub, marginBottom: 6, fontWeight: 500 }}>{label}</div>
        {payload.map(p => (
          <div key={p.dataKey} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: sans, fontSize: F.sm }}>
            <PlatDot platform={p.dataKey} size={6} />
            <span style={{ color: T.sub }}>{p.dataKey}:</span>
            <span style={{ color: T.text, fontWeight: 600 }}>{fmt(p.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 4, left: 0, bottom: 0 }}>
        <defs>
          {platforms.map(p => (
            <linearGradient key={p} id={`g_${p}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PLAT_COLORS[p] || T.accent} stopOpacity={0.2} />
              <stop offset="100%" stopColor={PLAT_COLORS[p] || T.accent} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
        <XAxis dataKey="date" tick={{ fontFamily: sans, fontSize: 11, fill: T.dim }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontFamily: sans, fontSize: 11, fill: T.dim }} axisLine={false} tickLine={false} tickFormatter={fmt} width={44} />
        <Tooltip content={<TT />} />
        {platforms.map(p => (
          <Area key={p} type="monotone" dataKey={p} stroke={PLAT_COLORS[p] || T.accent}
            strokeWidth={2.5} fill={`url(#g_${p})`} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Outliers ─────────────────────────────────────────────────────────────────
function OutlierContent({ latestMetrics, activePlatform }) {
  const allPosts = [];
  latestMetrics.forEach(m => {
    if (activePlatform !== "All" && m.platform !== activePlatform) return;
    if (m.videos) {
      m.videos.forEach(v => {
        const isYT = m.platform === "youtube";
        allPosts.push({
          platform: m.platform,
          title: isYT ? v.title?.slice(0, 80) : (v.caption?.slice(0, 80) || `[${v.type || "post"}]`),
          engagement: (v.likes || 0) + (v.comments || 0),
          likes: v.likes || 0,
          comments: v.comments || 0,
          views: v.views || 0,
          url: isYT ? `https://youtube.com/watch?v=${v.id}` : v.permalink,
        });
      });
    }
  });

  if (allPosts.length < 3) return (
    <div style={{ padding: "24px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>📈</div>
      <div style={{ fontFamily: sans, fontSize: F.sm, color: T.dim }}>Sync YouTube or Instagram to detect content outliers</div>
    </div>
  );

  const avg = allPosts.reduce((s, p) => s + p.engagement, 0) / allPosts.length;
  const over  = allPosts.filter(p => p.engagement > avg * 1.5).sort((a, b) => b.engagement - a.engagement).slice(0, 5);
  const under = allPosts.filter(p => p.engagement < avg * 0.5).sort((a, b) => a.engagement - b.engagement).slice(0, 5);

  const Row = ({ post, isOver }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 20px", borderBottom: `1px solid ${T.border}` }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: isOver ? T.greenBg : T.well, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>
        {isOver ? "🚀" : "📉"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: sans, fontSize: F.sm, color: T.text, fontWeight: 500, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {post.url ? <a href={post.url} target="_blank" rel="noreferrer" style={{ color: T.text, textDecoration: "none" }}>{post.title || "Untitled"}</a> : (post.title || "Untitled")}
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <PlatDot platform={post.platform} size={6} />
          <span style={{ fontFamily: sans, fontSize: F.xs, color: T.sub }}>♥ {fmt(post.likes)}</span>
          <span style={{ fontFamily: sans, fontSize: F.xs, color: T.sub }}>✦ {fmt(post.comments)}</span>
          {post.views > 0 && <span style={{ fontFamily: sans, fontSize: F.xs, color: T.sub }}>▶ {fmt(post.views)}</span>}
        </div>
      </div>
      <Badge color={isOver ? T.green : T.red} bg={isOver ? T.greenBg : T.redBg}>
        {isOver ? "+" : ""}{avg > 0 ? Math.round((post.engagement / avg - 1) * 100) : 0}%
      </Badge>
    </div>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
      <div style={{ borderRight: `1px solid ${T.border}` }}>
        <div style={{ padding: "12px 20px 8px", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: sans, fontSize: F.xs, fontWeight: 600, color: T.green }}>↑ OVERPERFORMING</span>
          <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>{over.length} posts</span>
        </div>
        {over.length === 0 ? <div style={{ padding: "12px 20px", fontFamily: sans, fontSize: F.sm, color: T.dim }}>No outliers above 1.5× avg yet</div>
          : over.map((p, i) => <Row key={i} post={p} isOver={true} />)}
      </div>
      <div>
        <div style={{ padding: "12px 20px 8px", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: sans, fontSize: F.xs, fontWeight: 600, color: T.red }}>↓ UNDERPERFORMING</span>
          <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>{under.length} posts</span>
        </div>
        {under.length === 0 ? <div style={{ padding: "12px 20px", fontFamily: sans, fontSize: F.sm, color: T.dim }}>No outliers below 0.5× avg yet</div>
          : under.map((p, i) => <Row key={i} post={p} isOver={false} />)}
      </div>
    </div>
  );
}

// ─── Stories ──────────────────────────────────────────────────────────────────
function StoriesSection({ open, onToggle }) {
  const [stories, setStories] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/stories", { method: "POST" });
      const data = await res.json();
      setStories(data.stories || []);
    } catch { setStories([]); }
    setLoading(false);
  }

  return (
    <Card style={{ marginBottom: 12, overflow: "hidden" }}>
      <SectionHeader label="Audience Stories" open={open} onToggle={onToggle}
        action={<Btn variant="purple" onClick={load} disabled={loading}>{loading ? "Analyzing…" : stories ? "↻ Refresh" : "✦ Generate"}</Btn>}
      />
      {open && (
        <>
          <Divider />
          <div style={{ padding: "16px 20px" }}>
            {!stories && !loading && <div style={{ fontFamily: sans, fontSize: F.sm, color: T.dim, padding: "8px 0" }}>Click Generate to surface audience themes from your comments — what they loved, debated, and found most valuable.</div>}
            {loading && <div style={{ fontFamily: sans, fontSize: F.sm, color: T.sub, padding: "8px 0" }}>Reading your audience…</div>}
            {stories?.length === 0 && !loading && <div style={{ fontFamily: sans, fontSize: F.sm, color: T.dim, padding: "8px 0" }}>Not enough comments yet — sync platforms to build your comment history.</div>}
            {stories?.map((s, i) => (
              <div key={i} style={{ background: T.well, borderRadius: 10, padding: "16px", marginBottom: 12 }}>
                <Badge color={T.purple} bg={T.purpleBg}>{s.theme}</Badge>
                <div style={{ fontFamily: sans, fontSize: F.md, fontWeight: 600, color: T.text, letterSpacing: "-0.01em", margin: "10px 0 6px", lineHeight: 1.4 }}>{s.headline}</div>
                <div style={{ fontFamily: sans, fontSize: F.sm, color: T.sub, lineHeight: 1.6, marginBottom: 14 }}>{s.insight}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {s.evidence?.map((c, j) => (
                    <div key={j} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                        <PlatDot platform={c.platform} size={6} />
                        <span style={{ fontFamily: sans, fontSize: F.xs, fontWeight: 500, color: T.sub }}>{c.author_name}</span>
                        {c.video_title && <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>on "{c.video_title?.slice(0, 40)}"</span>}
                      </div>
                      <div style={{ fontFamily: sans, fontSize: F.sm, color: T.text, lineHeight: 1.55 }}>"{c.content}"</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

// ─── AI Bar ───────────────────────────────────────────────────────────────────
function AudianAIBar() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  async function ask() {
    if (!q.trim() || loading) return;
    const question = q.trim();
    setQ("");
    setMsgs(m => [...m, { role: "user", content: question }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question }) });
      const data = await res.json();
      setMsgs(m => [...m, { role: "assistant", content: data.answer || data.error || "No response." }]);
    } catch { setMsgs(m => [...m, { role: "assistant", content: "Something went wrong." }]); }
    setLoading(false);
  }

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 300, background: T.card, borderTop: `1px solid ${T.border}`, boxShadow: "0 -4px 20px rgba(0,0,0,0.07)" }}>
      {open && (
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "16px 24px 0", height: 300, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingBottom: 8 }}>
            {msgs.length === 0 && (
              <div style={{ padding: "12px 0" }}>
                <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text, marginBottom: 4 }}>Ask Audian AI anything</div>
                <div style={{ fontFamily: sans, fontSize: F.sm, color: T.sub }}>Performance trends, content strategy, audience insights — powered by your real data.</div>
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  {["What's my best-performing content?", "How is my Instagram growing?", "What topics resonate most?"].map(s => (
                    <button key={s} onClick={() => { setQ(s); inputRef.current?.focus(); }}
                      style={{ background: T.well, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 12px", fontFamily: sans, fontSize: F.xs, color: T.sub, cursor: "pointer" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "75%",
                background: m.role === "user" ? T.accent : T.well,
                color: m.role === "user" ? "#fff" : T.text,
                borderRadius: m.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
                padding: "10px 14px", fontFamily: sans, fontSize: F.sm, lineHeight: 1.6,
              }}>{m.content}</div>
            ))}
            {loading && (
              <div style={{ alignSelf: "flex-start", background: T.well, borderRadius: "12px 12px 12px 3px", padding: "10px 14px" }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: T.dim, display: "inline-block", animation: `pulse 1.2s ${i * 0.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>
      )}
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "10px 24px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>A</span>
        </div>
        <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && ask()}
          onFocus={() => setOpen(true)}
          placeholder="Ask about your social data…"
          style={{ flex: 1, background: open ? T.well : "transparent", border: `1px solid ${open ? T.border : "transparent"}`, borderRadius: 8, padding: "8px 12px", color: T.text, fontFamily: sans, fontSize: F.sm, outline: "none", transition: "all 0.15s" }} />
        {open && q.trim() && (
          <button onClick={ask} disabled={loading}
            style={{ background: T.accent, border: "none", borderRadius: 8, padding: "8px 14px", color: "#fff", fontFamily: sans, fontSize: F.sm, cursor: "pointer", fontWeight: 500 }}>↑</button>
        )}
        <button onClick={() => setOpen(o => !o)}
          style={{ background: T.well, border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 10px", cursor: "pointer", fontFamily: sans, fontSize: F.xs, color: T.sub, fontWeight: 500 }}>
          {open ? "✕ Close" : "▲ Expand"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [supabase] = useState(() => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));

  async function authHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ? { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  }
  const [session, setSession]       = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const [metrics, setMetrics]       = useState([]);
  const [allMetrics, setAllMetrics] = useState([]);
  const [comments, setComments]     = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [syncing, setSyncing]       = useState(null);
  const [scoring, setScoring]         = useState(false);
  const [scraping, setScraping]       = useState(false);
  const [watchlist, setWatchlist]     = useState([]);
  const [watchlistTotal, setWatchlistTotal] = useState(0);
  const [syncMsg, setSyncMsg]       = useState("");
  const [lastSynced, setLastSynced] = useState(null);
  const [urlMsg, setUrlMsg]         = useState("");
  const [platform, setPlatform]     = useState("All");
  const [activeMetric, setActiveMetric] = useState("followers");
  const [open, setOpen]             = useState({ metrics: true, outliers: true, stories: true, channels: true, interactions: true, comments: true, videos: false });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setAuthLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const conn = params.get("connected"), err = params.get("error");
    if (conn) setSyncMsg(`✓ ${conn} connected`);
    if (err)  setSyncMsg(`✗ ${err.replace(/_/g, " ")}`);
    if (conn || err) window.history.replaceState({}, "", "/");
  }, []);

  const loadData = useCallback(async () => {
    if (!session) return;
    const [a, b, b2, c, d] = await Promise.all([
      supabase.from("platform_connections").select("*"),
      supabase.from("platform_metrics").select("*").order("snapshot_at", { ascending: false }).limit(10),
      supabase.from("platform_metrics").select("*").order("snapshot_at", { ascending: true }).limit(200),
      supabase.from("platform_comments").select("*").order("published_at", { ascending: false }).limit(100),
      supabase.from("platform_interactions").select("*").order("interacted_at", { ascending: false }).limit(50),
    ]);
    if (a.data) setConnections(a.data);
    if (b.data) { setMetrics(b.data); if (b.data[0]) setLastSynced(b.data[0].snapshot_at); }
    if (b2.data) setAllMetrics(b2.data);
    if (c.data) setComments(c.data);
    if (d.data) setInteractions(d.data);
  }, [session, supabase]);

  // Watchlist fetched separately — only on mount and after explicit changes
  const loadWatchlist = useCallback(async () => {
    if (!session) return;
    try {
      const { data: { session: s } } = await supabase.auth.getSession();
      const r = await fetch("/api/watchlist", { headers: s?.access_token ? { Authorization: `Bearer ${s.access_token}` } : {} });
      const wl = await r.json();
      if (wl?.entries) setWatchlist(wl.entries);
      if (wl?.total !== undefined) setWatchlistTotal(wl.total);
    } catch {}
  }, [session, supabase]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { loadWatchlist(); }, [loadWatchlist]);

  async function triggerSync(p) {
    setSyncing(p); setSyncMsg("");
    try {
      const res = await fetch(`/api/sync/${p}`, { method: "POST" });
      const data = await res.json();
      if (data.error) setSyncMsg(`✗ ${data.error}`);
      else {
        setSyncMsg(`✓ ${p} synced — ${data.videos_synced || data.tweets_synced || data.posts || 0} posts`);
        await loadData();
        // Auto-score after sync (non-blocking)
        fetch("/api/score", { method: "POST" }).then(r => r.json()).then(d => {
          if (d.scored?.total > 0) setSyncMsg(prev => prev + ` · ${d.scored.total} interactions scored`);
          loadData();
        }).catch(() => {});
      }
    } catch (e) { setSyncMsg(`✗ ${e.message}`); }
    setSyncing(null);
  }

  async function triggerScore() {
    setScoring(true); setSyncMsg("");
    try {
      const res = await fetch("/api/score", { method: "POST" });
      const data = await res.json();
      if (data.error) setSyncMsg(`✗ ${data.error}`);
      else { setSyncMsg(`✓ ${data.message}`); await loadData(); }
    } catch (e) { setSyncMsg(`✗ ${e.message}`); }
    setScoring(false);
  }

  async function triggerScrape() {
    setScraping(true); setSyncMsg("");
    try {
      const res  = await fetch("/api/apify/trigger", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ types: ["followers", "likers", "mentions"] }) });
      const data = await res.json();
      if (data.error) setSyncMsg("✗ " + data.error);
      else setSyncMsg(`✓ ${data.message} — results arrive via webhook in ~2 min`);
    } catch (e) { setSyncMsg("✗ " + e.message); }
    setScraping(false);
  }

  const tog = k => setOpen(s => ({ ...s, [k]: !s[k] }));

  const latestPerPlatform = {};
  metrics.forEach(m => { if (!latestPerPlatform[m.platform]) latestPerPlatform[m.platform] = m; });
  const prevPerPlatform = {};
  const seen = {};
  metrics.forEach(m => { if (!seen[m.platform]) { seen[m.platform] = true; return; } if (!prevPerPlatform[m.platform]) prevPerPlatform[m.platform] = m; });

  const kpis = { followers: { v: 0, p: 0 }, impressions: { v: 0, p: 0 }, reach: { v: 0, p: 0 }, likes: { v: 0, p: 0 }, comments: { v: 0, p: 0 } };
  const toAgg = platform === "All" ? Object.keys(latestPerPlatform) : [platform].filter(p => latestPerPlatform[p]);
  toAgg.forEach(p => {
    const m = latestPerPlatform[p], prev = prevPerPlatform[p];
    if (!m) return;
    kpis.followers.v += m.followers || 0;     kpis.followers.p += prev?.followers || 0;
    kpis.impressions.v += m.impressions || m.total_views || 0; kpis.impressions.p += prev?.impressions || prev?.total_views || 0;
    kpis.reach.v    += m.reach || 0;           kpis.reach.p += prev?.reach || 0;
    kpis.likes.v    += m.likes || 0;           kpis.likes.p += prev?.likes || 0;
    kpis.comments.v += m.comments_count || 0;  kpis.comments.p += prev?.comments_count || 0;
  });

  const ytVideos = latestPerPlatform["youtube"]?.videos || [];
  const filteredComments = comments.filter(c => platform === "All" || c.platform === platform);
  const filteredInteractions = interactions.filter(i => platform === "All" || i.platform === platform);

  const KPIS_DEF = [
    { key: "followers",   label: "Followers",   icon: "👥", color: T.accent },
    { key: "impressions", label: "Impressions", icon: "👁",  color: T.blue },
    { key: "reach",       label: "Reach",       icon: "📡", color: T.purple },
    { key: "likes",       label: "Likes",       icon: "♥",  color: T.red },
    { key: "comments",    label: "Comments",    icon: "💬", color: T.green },
  ];

  const PLATS = ["All", "youtube", "x", "instagram", "linkedin"];

  if (authLoading) return <div style={{ minHeight: "100vh", background: T.bg }} />;
  if (!session) return <SignIn supabase={supabase} />;

  const Banner = ({ msg }) => {
    if (!msg) return null;
    const ok = msg.startsWith("✓");
    return (
      <div style={{ background: ok ? T.greenBg : T.redBg, border: `1px solid ${ok ? "#BBF7D0" : "#FECACA"}`, borderRadius: 8, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, fontFamily: sans, fontSize: F.sm, color: ok ? T.green : T.red, marginBottom: 12 }}>
        {msg}
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: sans, paddingBottom: 120 }}>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <div style={{ background: T.card, borderBottom: `1px solid ${T.border}`, height: 56, display: "flex", alignItems: "center", padding: "0 24px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 32 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>A</span>
          </div>
          <span style={{ fontSize: F.md, fontWeight: 700, color: T.text, letterSpacing: "-0.02em" }}>Audian</span>
        </div>
        {/* Platform tabs */}
        <div style={{ display: "flex", gap: 2, background: T.well, borderRadius: 8, padding: 3 }}>
          {PLATS.map(p => (
            <button key={p} onClick={() => setPlatform(p)} style={{
              background: platform === p ? T.card : "transparent",
              color: platform === p ? T.text : T.sub,
              border: "none", borderRadius: 6, padding: "4px 12px",
              fontFamily: sans, fontSize: F.xs, fontWeight: platform === p ? 600 : 400,
              cursor: "pointer", boxShadow: platform === p ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.12s",
            }}>
              {p === "All" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        {/* Right side */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          {lastSynced && <span style={{ fontSize: F.xs, color: T.dim }}>synced {timeAgo(lastSynced)}</span>}
          <ProfileMenu session={session} supabase={supabase} connections={connections}
            watchlist={watchlist}
            watchlistTotal={watchlistTotal}
            onWatchlistUpdate={loadWatchlist}
            onDisconnect={async (platformId) => {
              const res = await fetch(`/api/disconnect/${platformId}`, { method: "DELETE", headers: await authHeaders() });
              const data = await res.json();
              if (!res.ok) console.error("Disconnect error:", data.error);
              await loadData();
            }} />
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px 20px 0" }}>
        <Banner msg={urlMsg || syncMsg} />

        {/* ── Engagement Overview ───────────────────────────────────────────── */}
        <Card style={{ marginBottom: 12, overflow: "hidden" }}>
          <SectionHeader label="Engagement Overview" open={open.metrics} onToggle={() => tog("metrics")} />
          {open.metrics && (
            <>
              <Divider />
              <div style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                  {KPIS_DEF.map(k => (
                    <KPICard key={k.key} label={k.label} value={kpis[k.key].v} prev={kpis[k.key].p || null}
                      color={k.color} icon={k.icon} selected={activeMetric === k.key} onClick={() => setActiveMetric(k.key)} />
                  ))}
                </div>
                <div style={{ background: T.well, borderRadius: 10, padding: "16px 16px 8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: F.xs, fontWeight: 500, color: T.sub, textTransform: "uppercase", letterSpacing: "0.05em" }}>{activeMetric} trend</span>
                    <span style={{ fontSize: F.xs, color: T.dim }}>{allMetrics.length} snapshots</span>
                  </div>
                  <MetricsChart allMetrics={allMetrics} activeMetric={activeMetric} activePlatform={platform} />
                </div>
              </div>
            </>
          )}
        </Card>

        {/* ── Content Outliers ─────────────────────────────────────────────── */}
        <Card style={{ marginBottom: 12, overflow: "hidden" }}>
          <SectionHeader label="Content Outliers" open={open.outliers} onToggle={() => tog("outliers")} />
          {open.outliers && (
            <>
              <Divider />
              <OutlierContent latestMetrics={Object.values(latestPerPlatform)} activePlatform={platform} />
            </>
          )}
        </Card>

        {/* ── Audience Stories ─────────────────────────────────────────────── */}
        <StoriesSection open={open.stories} onToggle={() => tog("stories")} />

        {/* ── Connected Channels ───────────────────────────────────────────── */}
        <Card style={{ marginBottom: 12, overflow: "hidden" }}>
          <SectionHeader label="Connected Channels" open={open.channels} onToggle={() => tog("channels")} />
          {open.channels && (
            <>
              <Divider />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0 }}>
                {[{ id: "youtube", label: "YouTube", icon: "▶", color: T.yt }, { id: "x", label: "X / Twitter", icon: "𝕏", color: T.x }, { id: "instagram", label: "Instagram", icon: "◉", color: T.ig }, { id: "linkedin", label: "LinkedIn", icon: "in", color: T.li }].map(({ id, label, icon, color }, idx) => {
                  const conn = connections.find(c => c.platform === id);
                  return (
                    <div key={id} style={{ padding: "20px", borderRight: idx < 3 ? `1px solid ${T.border}` : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color }}>{icon}</div>
                        <span style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text }}>{label}</span>
                      </div>
                      {conn ? (
                        <>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, display: "inline-block" }} />
                            <span style={{ fontFamily: sans, fontSize: F.xs, color: T.green, fontWeight: 500 }}>Connected</span>
                          </div>
                          {(conn.channel_name || conn.username) && <div style={{ fontFamily: sans, fontSize: F.xs, color: T.sub, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conn.channel_name || `@${conn.username}`}</div>}
                          {(conn.subscriber_count > 0) && <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text, marginBottom: 10 }}>{fmt(conn.subscriber_count)}<span style={{ fontWeight: 400, color: T.sub, fontSize: F.xs }}> followers</span></div>}
                          {(id === "youtube" || id === "x" || id === "instagram") && (
                            <Btn variant="secondary" size="sm" onClick={() => triggerSync(id)} disabled={syncing !== null}>
                              {syncing === id ? "Syncing…" : "↻ Sync"}
                            </Btn>
                          )}
                        </>
                      ) : (
                        <a href={`/api/auth/${id}`} style={{ display: "inline-block", background: T.well, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 12px", fontFamily: sans, fontSize: F.xs, color: T.sub, textDecoration: "none", fontWeight: 500 }}>Connect →</a>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </Card>

        {/* ── Recent Videos (YT only) ──────────────────────────────────────── */}
        {ytVideos.length > 0 && (platform === "All" || platform === "youtube") && (
          <Card style={{ marginBottom: 12, overflow: "hidden" }}>
            <SectionHeader label="Recent Videos" count={ytVideos.length} open={open.videos} onToggle={() => tog("videos")} />
            {open.videos && (
              <>
                <Divider />
                <div style={{ padding: "12px 8px" }}>
                  {ytVideos.slice(0, 8).map(v => (
                    <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8, cursor: "pointer" }}>
                      <div style={{ flex: 1, fontFamily: sans, fontSize: F.sm, color: T.text, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.title}</div>
                      <div style={{ display: "flex", gap: 14, flexShrink: 0 }}>
                        {[["▶", v.views], ["♥", v.likes], ["✦", v.comments]].map(([icon, val]) => (
                          <span key={icon} style={{ fontFamily: sans, fontSize: F.xs, color: T.sub }}>{icon} {fmt(val)}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        )}

        {/* ── Influential Interactions ─────────────────────────────────────── */}
        <Card style={{ marginBottom: 12, overflow: "hidden" }}>
          <SectionHeader label="Influential Interactions" count={filteredInteractions.length} open={open.interactions} onToggle={() => tog("interactions")} action={
              <div style={{ display: "flex", gap: 6 }}>
                {connections.some(c => c.platform === "instagram") && (
                  <Btn variant="secondary" size="sm" onClick={triggerScrape} disabled={scraping}>
                    {scraping ? "Syncing…" : "↻ Sync"}
                  </Btn>
                )}
                <Btn variant="orange" onClick={triggerScore} disabled={scoring}>{scoring ? "Scoring…" : "⚡ Score Now"}</Btn>
              </div>
            } />
          {open.interactions && (
            <>
              <Divider />
              <div style={{ padding: filteredInteractions.length === 0 ? "24px 20px" : "8px 0" }}>
                {filteredInteractions.length === 0 ? (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>⭐</div>
                    <div style={{ fontFamily: sans, fontSize: F.sm, color: T.dim, marginBottom: 4 }}>Hit ⚡ Score Now after syncing to surface your most engaged audience members.</div>
                    <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>Ranked by comment engagement, repeat visits, and niche alignment. Click ↗ to vet each profile manually.</div>
                  </div>
                ) : (
                  <>
                    <div style={{ padding: "10px 20px 6px", display: "flex", gap: 16, alignItems: "center" }}>
                      {[["CORE", T.accent, T.accentBg], ["INFLUENTIAL", "#F59E0B", "#FFFBEB"], ["RADAR", T.sub, T.well]].map(([zone, color, bg]) => (
                        <div key={zone} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ background: bg, color, border: `1px solid ${color}30`, borderRadius: 4, padding: "1px 6px", fontFamily: sans, fontSize: 10, fontWeight: 700 }}>{zone}</span>
                          <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>{filteredInteractions.filter(i => i.zone === zone).length}</span>
                        </div>
                      ))}
                      <span style={{ marginLeft: "auto", fontFamily: sans, fontSize: F.xs, color: T.dim }}>Click ↗ to manually vet each profile</span>
                    </div>
                    <Divider />
                    {filteredInteractions
                      .sort((a, b) => (b.influence_score || 0) - (a.influence_score || 0))
                      .map(item => {
                        const zoneColor = item.zone === "CORE" ? T.accent : item.zone === "INFLUENTIAL" ? "#F59E0B" : item.zone === "RADAR" ? T.sub : T.dim;
                        const zoneBg    = item.zone === "CORE" ? T.accentBg : item.zone === "INFLUENTIAL" ? "#FFFBEB" : T.well;
                        return (
                          <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 20px", borderBottom: `1px solid ${T.border}` }}>
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: zoneBg, border: `1.5px solid ${zoneColor}40`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sans, fontSize: F.sm, color: zoneColor, fontWeight: 700, flexShrink: 0 }}>
                              {(item.name || item.handle || "?")[0].toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                                {item.profile_url ? (
                                  <a href={item.profile_url} target="_blank" rel="noreferrer" style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text, textDecoration: "none" }}>{item.name || item.handle} ↗</a>
                                ) : (
                                  <span style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text }}>{item.name || item.handle}</span>
                                )}
                                <PlatDot platform={item.platform} size={6} />
                                <span style={{ background: zoneBg, color: zoneColor, border: `1px solid ${zoneColor}30`, borderRadius: 4, padding: "1px 6px", fontFamily: sans, fontSize: 10, fontWeight: 700 }}>{item.zone}</span>
                                {/* Interaction type badge */}
                                {item.interaction_type && (
                                  <span style={{ background: T.well, color: T.sub, border: `1px solid ${T.border}`, borderRadius: 4, padding: "1px 6px", fontFamily: sans, fontSize: 10, fontWeight: 600 }}>
                                    {item.interaction_type === "follow" ? "👤 follow" : item.interaction_type === "like" ? "♥ like" : item.interaction_type === "mention" ? "@ mention" : "💬 comment"}
                                  </span>
                                )}
                                {item.verified && <span style={{ fontSize: 11 }} title="Verified">✓</span>}
                                {item.followers > 0 && <span style={{ fontFamily: sans, fontSize: F.xs, color: T.sub }}>{fmt(item.followers)} followers</span>}
                                {item.comment_count > 1 && <span style={{ fontFamily: sans, fontSize: F.xs, color: T.green, fontWeight: 500 }}>✦ {item.comment_count}×</span>}
                                <span style={{ marginLeft: "auto", fontFamily: sans, fontSize: F.xs, color: T.dim }}>{timeAgo(item.interacted_at)}</span>
                              </div>
                              {item.content && (
                                <div style={{ fontFamily: sans, fontSize: F.sm, color: T.sub, lineHeight: 1.55, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                                  "{item.content}"
                                </div>
                              )}
                            </div>
                            <div style={{ flexShrink: 0, background: zoneBg, border: `1px solid ${zoneColor}30`, borderRadius: 8, padding: "4px 10px", textAlign: "center", minWidth: 44 }}>
                              <div style={{ fontFamily: sans, fontSize: 18, fontWeight: 700, color: zoneColor, lineHeight: 1 }}>{item.influence_score || 0}</div>
                              <div style={{ fontFamily: sans, fontSize: 9, color: T.dim, marginTop: 2 }}>SCORE</div>
                            </div>
                          </div>
                        );
                      })}
                  </>
                )}
              </div>
            </>
          )}
        </Card>

        {/* ── Notable Comments ─────────────────────────────────────────────── */}
        <Card style={{ marginBottom: 12, overflow: "hidden" }}>
          <SectionHeader label="Notable Comments" count={filteredComments.length} open={open.comments} onToggle={() => tog("comments")} />
          {open.comments && (
            <>
              <Divider />
              <div style={{ padding: filteredComments.length === 0 ? "24px 20px" : "8px 0" }}>
                {filteredComments.length === 0 ? (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
                    <div style={{ fontFamily: sans, fontSize: F.sm, color: T.dim }}>Sync YouTube or Instagram to pull recent comments.</div>
                  </div>
                ) : filteredComments.map(c => (
                  <div key={c.id} style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <PlatDot platform={c.platform} size={7} />
                      <span style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text }}>{c.author_name}</span>
                      {c.video_title && <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>on "{c.video_title?.slice(0, 45)}{c.video_title?.length > 45 ? "…" : ""}"</span>}
                      <span style={{ marginLeft: "auto", fontFamily: sans, fontSize: F.xs, color: T.dim }}>{timeAgo(c.published_at)}</span>
                    </div>
                    <div style={{ fontFamily: sans, fontSize: F.sm, color: T.sub, lineHeight: 1.6, marginBottom: c.likes > 0 ? 8 : 0 }}>"{c.content}"</div>
                    {c.likes > 0 && <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>♥ {fmt(c.likes)}</span>}
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        <div style={{ padding: "16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>Audian · Social Intelligence</span>
          <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>{connections.length} platform{connections.length !== 1 ? "s" : ""} connected</span>
        </div>
      </div>

      <AudianAIBar />
    </div>
  );
}
