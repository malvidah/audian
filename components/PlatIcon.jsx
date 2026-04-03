"use client";
// Shared platform icon components — single source of truth for all platform icons.
// Import PlatIcon for a bare SVG, PlatChip for icon in a flat-color rounded-square bg,
// PlatDot for icon in a circular bg (used in small indicators).
import { useId } from "react";

export const PLAT_COLORS = {
  instagram: "#E1306C",
  x:         "#000000",
  youtube:   "#FF0000",
  linkedin:  "#0A66C2",
};

export function PlatIcon({ platform, size = 16 }) {
  // useId gives each instance a unique ID so SVG gradient IDs never collide on the page
  const uid = useId().replace(/:/g, "");
  const igGrad = `ig-grad-${uid}`;

  if (platform === "instagram") return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={igGrad} cx="30%" cy="107%" r="130%">
          <stop offset="0%"  stopColor="#fdf497"/>
          <stop offset="5%"  stopColor="#fdf497"/>
          <stop offset="45%" stopColor="#fd5949"/>
          <stop offset="60%" stopColor="#d6249f"/>
          <stop offset="90%" stopColor="#285AEB"/>
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill={`url(#${igGrad})`}/>
      <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none"/>
      <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
    </svg>
  );
  if (platform === "x") return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L2.25 2.25h6.865l4.264 5.632L18.244 2.25ZM17.08 19.77h1.833L7.084 4.126H5.117L17.08 19.77Z"/>
    </svg>
  );
  if (platform === "youtube") return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81ZM9.75 15.5v-7l6.5 3.5-6.5 3.5Z"/>
    </svg>
  );
  if (platform === "linkedin") return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.27V1.73C24 .77 23.2 0 22.22 0Z"/>
    </svg>
  );
  return <span style={{ fontSize: 11, fontWeight: 700 }}>·</span>;
}

// Icon inside a flat-color rounded-square chip — used in tables and cards
export function PlatChip({ platform, size = 15, radius = 7 }) {
  const color = PLAT_COLORS[platform] || "#888";
  const chipSize = size + 10;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: chipSize, height: chipSize, borderRadius: radius,
      background: platform === "instagram" ? "transparent" : color + "14",
      flexShrink: 0, color,
    }}>
      <PlatIcon platform={platform} size={platform === "instagram" ? chipSize : size} />
    </span>
  );
}

// Icon inside a circular bg — used in small dot indicators
export function PlatDot({ platform, size = 8 }) {
  const color = PLAT_COLORS[platform] || "#888";
  const boxSize = size + 8;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: boxSize, height: boxSize, borderRadius: "50%",
      background: platform === "instagram" ? "transparent" : color + "18",
      flexShrink: 0, color,
    }}>
      <PlatIcon platform={platform} size={platform === "instagram" ? boxSize : size + 2} />
    </span>
  );
}
