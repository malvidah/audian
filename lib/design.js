// ─── Audian Design System ─────────────────────────────────────────────────────
// Single source of truth for all design tokens, typography, shared configs,
// and utility functions. Import from here — never redefine locally.

// ─── Tokens ──────────────────────────────────────────────────────────────────
export const T = {
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

// ─── Typography ───────────────────────────────────────────────────────────────
export const sans = "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif";
export const F    = { xl: 28, lg: 20, md: 15, sm: 13, xs: 11 };

// ─── Zone badge config ────────────────────────────────────────────────────────
export const ZONE_CFG = {
  ELITE:       { label: "ELITE",       color: T.accent,   bg: T.accentBg,  border: T.accentBorder },
  COLLABORATOR: { label: "COLLABORATOR", color: "#DB2777",  bg: "#FFF1F2",   border: "#FECDD3" },
  INFLUENTIAL: { label: "INFLUENTIAL", color: T.green,    bg: T.greenBg,   border: T.greenBorder },
  SIGNAL:      { label: "SIGNAL",      color: T.blue,     bg: T.blueBg,    border: T.blueBorder },
  IGNORE:      { label: "IGNORE",      color: T.dim,      bg: T.well,      border: T.border },
  UNASSIGNED:  { label: "UNASSIGNED",  color: "#64748B",  bg: "#F1F5F9",   border: "#CBD5E1" },
};
export const ZONE_ORDER = ["ELITE", "COLLABORATOR", "INFLUENTIAL", "SIGNAL", "IGNORE"];

// ─── Interaction type badge config ────────────────────────────────────────────
export const TYPE_BADGE = {
  like:        { label: "Like",        bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  follow:      { label: "Follow",      bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
  comment:     { label: "Comment",     bg: "#FEFCE8", color: "#CA8A04", border: "#FEF08A" },
  repost:      { label: "Repost",      bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
  mention:     { label: "Mention",     bg: "#FFF3EE", color: "#FF6B35", border: "#FFD4C2" },
  tag:         { label: "Tag",         bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
  collaboration: { label: "Collaboration", bg: "#F0F9FF", color: "#0369A1", border: "#BAE6FD" },
};

// ─── Platform config ──────────────────────────────────────────────────────────
export const PLAT_URL = {
  instagram: h => `https://instagram.com/${h}`,
  x:         h => `https://x.com/${h}`,
  youtube:   h => `https://youtube.com/@${h}`,
  linkedin:  h => `https://linkedin.com/in/${h}`,
};

export const PLAT_LABEL = {
  instagram: "Instagram",
  x:         "X (Twitter)",
  youtube:   "YouTube",
  linkedin:  "LinkedIn",
};

export const PLATFORMS = ["instagram", "x", "youtube", "linkedin"];

// ─── Avatar gradients ─────────────────────────────────────────────────────────
export const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #FF6B35, #FF9F1C)",
  "linear-gradient(135deg, #E1306C, #F77737)",
  "linear-gradient(135deg, #2563EB, #7C3AED)",
  "linear-gradient(135deg, #16A34A, #22D3EE)",
  "linear-gradient(135deg, #7C3AED, #EC4899)",
  "linear-gradient(135deg, #0077B5, #00B4D8)",
];

// ─── Entity types ─────────────────────────────────────────────────────────────
export const ENTITY_TYPES = [
  { value: "person",       label: "Person" },
  { value: "organization", label: "Organization" },
  { value: "page",         label: "Page" },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Format a number as 1.2K, 3.4M, etc. Returns "—" for null/undefined. */
export function fmt(n) {
  if (n == null || n === "") return "—";
  n = parseInt(n, 10);
  if (isNaN(n)) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
}

/** Human-relative date: "today", "yesterday", "3d ago", "2w ago", "Mar 15". */
export function timeAgo(ts) {
  if (!ts) return null;
  // Treat date-only strings as local noon to avoid UTC-midnight off-by-one
  const safe = /^\d{4}-\d{2}-\d{2}$/.test(ts) ? ts + "T12:00:00" : ts;
  const d = Math.floor((Date.now() - new Date(safe)) / 86400000);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 7)  return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

/** Alias of timeAgo — use for interaction/post dates. */
export const fmtDate = timeAgo;

/** Truncate a string to max characters, appending "…". Returns "—" for empty. */
export function truncate(str, max = 80) {
  if (!str) return "—";
  return str.length > max ? str.slice(0, max) + "…" : str;
}

/** Normalise raw interaction_type values to canonical lowercase keys. */
export function normalizeType(type) {
  const t = (type || "").toLowerCase().trim();
  const map = {
    liked: "like", followed: "follow", commented: "comment",
    reposted: "repost", mentioned: "mention", tagged: "tag",
  };
  return map[t] ?? (t || "interaction");
}

/** Ghost-input style — makes an <input> look identical to the text it replaces.
 *  Only indicator is a hairline accent underline. */
export function ghostInputStyle({ fontSize = F.sm, fontWeight = 400, color = T.text, italic = false } = {}) {
  return {
    width: "100%", border: "none", outline: "none", background: "transparent",
    fontFamily: sans, fontSize, fontWeight, color,
    fontStyle: italic ? "italic" : "normal",
    padding: "0", margin: "0", boxSizing: "border-box",
    boxShadow: `inset 0 -1px 0 0 ${T.accent}99`,
    borderRadius: 0,
  };
}
