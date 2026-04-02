"use client";
import { useState, useCallback, useRef, useEffect } from "react";

// ── Design tokens (match Dashboard) ──────────────────────────────────────────
const T = {
  bg: "#F8F7F5", card: "#FFFFFF", well: "#F3F2F0",
  border: "#E8E6E1", border2: "#D6D3CC",
  text: "#1A1816", sub: "#6B6560", dim: "#A8A39C",
  accent: "#FF6B35", accentBg: "#FFF3EE", accentBorder: "#FFD4C2",
  green: "#16A34A", greenBg: "#F0FDF4",
  red: "#DC2626", redBg: "#FEF2F2",
  purple: "#7C3AED", purpleBg: "#F5F3FF",
  shadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 24px rgba(0,0,0,0.08)",
};
const sans = "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif";
const F = { xl: 28, lg: 18, md: 15, sm: 13, xs: 11 };

const PLATFORM_ICONS = {
  instagram: "📸",
  x:         "𝕏",
  youtube:   "▶",
  linkedin:  "in",
};
const PLATFORM_LABELS = {
  instagram: "Instagram",
  x:         "X / Twitter",
  youtube:   "YouTube",
  linkedin:  "LinkedIn",
};

const ZONE_COLORS = {
  ELITE:        { bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
  INFLUENTIAL: { bg: "#FFF3EE", color: "#FF6B35", border: "#FFD4C2" },
  SIGNAL:       { bg: "#F3F2F0", color: "#6B6560", border: "#E8E6E1" },
  IGNORE:       { bg: "#FFF1F1", color: "#999", border: "#FECACA" },
};
const INTERACTION_ICONS = {
  like: "♥", follow: "👤", comment: "💬", mention: "@",
  tag: "🏷", view: "👁", unknown: "?",
};

// Zone rules:
// wiki + 100k+  → INFLUENTIAL
// 100k+, no wiki → SIGNAL
// wiki, under 100k → SIGNAL
// manual bio (not wiki), any followers → SIGNAL
// neither → IGNORE
function computeZone(item) {
  if (item.zone === "ELITE" || item.on_watchlist) return "ELITE";
  const followers    = parseInt(item.followers) || 0;
  const hasWiki      = !!item._wikiBio;
  const hasManualBio = !!(item.bio?.trim()) && !item._wikiBio;
  const highFollowers = followers >= 100000;

  if (hasWiki && highFollowers) return "INFLUENTIAL";
  if (highFollowers)            return "SIGNAL";
  if (hasWiki)                  return "SIGNAL";
  if (hasManualBio)             return "SIGNAL";
  return "IGNORE";
}

function ZoneBadge({ zone }) {
  const c = ZONE_COLORS[zone] || ZONE_COLORS.SIGNAL;
  return (
    <span style={{
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      borderRadius: 6, padding: "2px 8px", fontSize: F.xs, fontWeight: 700,
      fontFamily: sans, whiteSpace: "nowrap",
    }}>{zone}</span>
  );
}

function Btn({ onClick, disabled, children, variant = "primary", style = {} }) {
  const [hov, setHov] = useState(false);
  const styles = {
    primary:   { background: T.accent, color: "#fff" },
    secondary: { background: T.well, color: T.text, border: `1px solid ${T.border}` },
    ghost:     { background: hov ? T.well : "transparent", color: T.sub, border: `1px solid ${hov ? T.border : "transparent"}` },
    danger:    { background: hov ? T.redBg : "transparent", color: T.red, border: `1px solid ${T.red}33` },
  };
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        ...styles[variant],
        fontFamily: sans, fontSize: F.sm, fontWeight: 600,
        padding: "7px 14px", borderRadius: 8, border: "none",
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
        transition: "all 0.15s", display: "inline-flex", alignItems: "center", gap: 6,
        ...style,
      }}
    >{children}</button>
  );
}

function HandlesCsvImport({ platform }) {
  const [csvText, setCsvText] = useState("");
  const [category, setCategory] = useState("SIGNAL");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  async function loadFile(file) {
    if (!file) return;
    setCsvText(await file.text());
    setResult(null);
  }

  async function handleImport() {
    if (!csvText.trim()) return;
    setImporting(true);
    setResult(null);
    try {
      const res = await fetch("/api/accounts/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: csvText, category }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "CSV import failed");
      setResult({ ok: true, ...data });
    } catch (e) {
      setResult({ ok: false, error: e.message });
    } finally {
      setImporting(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 22, boxShadow: T.shadow }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: sans, fontSize: F.lg, fontWeight: 700, color: T.text, marginBottom: 4 }}>
              Import handle CSV
            </div>
            <div style={{ fontFamily: sans, fontSize: F.sm, color: T.sub, lineHeight: 1.6 }}>
              Paste a spreadsheet export or upload a CSV with names, bios, labels, and platform handles.
              {platform && platform !== "all" ? ` Current filter: ${PLATFORM_LABELS[platform] || platform}.` : ""}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{
                fontFamily: sans, fontSize: F.sm, color: T.text, background: T.card,
                border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px",
              }}
            >
              {["ELITE", "INFLUENTIAL", "SIGNAL", "IGNORE"].map(zone => (
                <option key={zone} value={zone}>{zone} default</option>
              ))}
            </select>
            <Btn variant="secondary" onClick={() => fileRef.current?.click()}>
              Upload CSV
            </Btn>
            <Btn onClick={handleImport} disabled={importing || !csvText.trim()}>
              {importing ? "Importing…" : "Import handles"}
            </Btn>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              style={{ display: "none" }}
              onChange={e => loadFile(e.target.files?.[0])}
            />
          </div>
        </div>

        <textarea
          value={csvText}
          onChange={e => setCsvText(e.target.value)}
          placeholder="name,instagram handle,x handle,bio,label"
          style={{
            width: "100%",
            minHeight: 320,
            resize: "vertical",
            boxSizing: "border-box",
            borderRadius: 12,
            border: `1px solid ${T.border}`,
            background: T.well,
            color: T.text,
            padding: "14px 16px",
            fontFamily: "'SFMono-Regular', ui-monospace, Menlo, monospace",
            fontSize: 12,
            lineHeight: 1.6,
            outline: "none",
          }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.25fr 0.75fr", gap: 18 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20, boxShadow: T.shadow }}>
          <div style={{ fontFamily: sans, fontSize: F.md, fontWeight: 700, color: T.text, marginBottom: 8 }}>
            Expected columns
          </div>
          <div style={{ fontFamily: sans, fontSize: F.sm, color: T.sub, lineHeight: 1.7 }}>
            `name`, `bio`, `label`, `source list`, `platform`, `handle`
            <br />
            `instagram handle`, `x handle`, `youtube handle`, `linkedin handle`
          </div>
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20, boxShadow: T.shadow }}>
          <div style={{ fontFamily: sans, fontSize: F.md, fontWeight: 700, color: T.text, marginBottom: 8 }}>
            Result
          </div>
          <div style={{ fontFamily: sans, fontSize: F.sm, color: T.sub, lineHeight: 1.7 }}>
            {result?.ok && `Imported ${result.imported || 0} rows`}
            {result?.ok && result.dupes ? `, deduped ${result.dupes}` : ""}
            {result?.ok && result.skipped ? `, skipped ${result.skipped}` : ""}
            {!result && "Import results will show here."}
            {result && !result.ok && result.error}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Drop Zone ─────────────────────────────────────────────────────────────────
function DropZone({ onFiles, disabled }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFiles = useCallback((files) => {
    const imgs = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (imgs.length) onFiles(imgs);
  }, [onFiles]);

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      style={{
        border: `2px dashed ${dragging ? T.accent : T.border2}`,
        borderRadius: 14, padding: "48px 32px", textAlign: "center",
        background: dragging ? T.accentBg : T.well,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s",
      }}
    >
      <div style={{ fontSize: 40, marginBottom: 12 }}>📸</div>
      <div style={{ fontFamily: sans, fontSize: F.md, fontWeight: 600, color: T.text, marginBottom: 6 }}>
        Drop Instagram screenshots here
      </div>
      <div style={{ fontFamily: sans, fontSize: F.sm, color: T.sub, marginBottom: 16, lineHeight: 1.6 }}>
        Notifications, likers, followers, comments, story viewers<br />
        Drop as many as you want — all parsed at once
      </div>
      <div style={{
        display: "inline-block", background: T.accent, color: "#fff",
        borderRadius: 8, padding: "8px 20px", fontFamily: sans,
        fontSize: F.sm, fontWeight: 600,
      }}>
        Or click to browse
      </div>
      <input
        ref={inputRef} type="file" multiple accept="image/*"
        style={{ display: "none" }}
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  );
}

// ── Paste-text import (Buffer / Instagram copy-paste) ────────────────────────
function parseRelativeTime(timeAgo) {
  const now = new Date();
  const m = timeAgo.match(/(\d+)\s+(hour|day|week|month|minute|second)/i);
  if (!m) return now.toISOString();
  const num = parseInt(m[1]);
  const unit = m[2].toLowerCase();
  const ms = { second: 1e3, minute: 6e4, hour: 36e5, day: 864e5, week: 6048e5, month: 2592e6 };
  return new Date(now.getTime() - (ms[unit] || 0) * num).toISOString();
}

// Split "username16 hours ago" → { handle, timeAgo }
// Handles edge cases where the handle ends in digits (e.g. tuna_can_333 + "2 days ago")
function splitHandleTime(remainder) {
  const unitRe = /^(\d+)\s+(hours?|days?|weeks?|months?|minutes?|seconds?)\s+ago\s*$/i;
  const maxByUnit = { second: 59, minute: 59, hour: 23, day: 30, week: 8, month: 12 };
  const candidates = [];

  for (let i = 1; i < remainder.length; i++) {
    const suffix = remainder.slice(i);
    const m = suffix.match(unitRe);
    if (!m) continue;
    const timeNum = parseInt(m[1]);
    const unit = m[2].toLowerCase().replace(/s$/, "");
    if (timeNum < 1 || timeNum > (maxByUnit[unit] || 999)) continue;
    const handle = remainder.slice(0, i).trim();
    if (!handle) continue;
    candidates.push({ handle, timeAgo: m[0].trim(), timeNum, endsDigit: /\d$/.test(handle) });
  }

  if (!candidates.length) return null;

  // Prefer handles that don't end in a digit (cleaner boundary)
  const clean = candidates.filter(c => !c.endsDigit);
  if (clean.length) {
    clean.sort((a, b) => a.timeNum - b.timeNum);
    return clean[0];
  }
  // All end in digit: pick smallest time; tie-break by longest handle
  candidates.sort((a, b) => a.timeNum !== b.timeNum
    ? a.timeNum - b.timeNum
    : b.handle.length - a.handle.length);
  return candidates[0];
}

function parseBufferPaste(text, platform = "instagram") {
  // Format: "N. username16 hours ago\nComment text\n2. ..."
  // Handle and time are directly concatenated (no space between them).
  const leadRe = /^(\d+)\.\s+(.+)$/;
  const lines = text.split("\n");
  const entries = [];
  let current = null;

  for (const line of lines) {
    const lead = line.match(leadRe);
    if (lead) {
      const split = splitHandleTime(lead[2]);
      if (split) {
        if (current) entries.push(current);
        current = { num: parseInt(lead[1]), handle: split.handle, timeAgo: split.timeAgo, contentLines: [] };
        continue;
      }
    }
    if (current) current.contentLines.push(line);
  }
  if (current) entries.push(current);

  return entries
    .filter(e => e.handle)
    .map(e => ({
      handle: e.handle.replace(/^@/, "").trim(),
      platform,
      interaction_type: "comment",
      content: e.contentLines.join("\n").trim() || null,
      interacted_at: parseRelativeTime(e.timeAgo),
      zone: "IGNORE",
      verified: false,
      followers: null,
      name: null,
      bio: null,
      _source: "paste",
      _id: `paste_${e.num}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    }));
}

// ── Buffer unnumbered: "handle15 days ago comment text" all on one line ──────
// Scan each line for an inline "N unit ago" marker; split handle, time, content.
// Same digit-boundary disambiguation as splitHandleTime, but allows trailing content.
function splitHandleTimeContent(line) {
  const globalRe = /(\d+)\s+(hours?|days?|weeks?|months?|minutes?|seconds?)\s+ago\s*/gi;
  const maxByUnit = { second: 59, minute: 59, hour: 23, day: 30, week: 8, month: 12 };
  const candidates = [];
  let m;
  while ((m = globalRe.exec(line)) !== null) {
    const timeNum = parseInt(m[1]);
    const unit = m[2].toLowerCase().replace(/s$/, "");
    if (timeNum < 1 || timeNum > (maxByUnit[unit] || 999)) continue;
    const handle = line.slice(0, m.index).trim();
    if (!handle) continue;
    const content = line.slice(m.index + m[0].length).trim() || null;
    candidates.push({ handle, timeAgo: `${m[1]} ${m[2]} ago`, content, timeNum, endsDigit: /\d$/.test(handle) });
  }
  if (!candidates.length) return null;
  const clean = candidates.filter(c => !c.endsDigit);
  if (clean.length) { clean.sort((a, b) => a.timeNum - b.timeNum); return clean[0]; }
  candidates.sort((a, b) => a.timeNum !== b.timeNum ? a.timeNum - b.timeNum : b.handle.length - a.handle.length);
  return candidates[0];
}

function parseBufferUnnumbered(text, platform = "instagram") {
  const entries = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    const result = splitHandleTimeContent(line);
    if (result) entries.push(result);
  }
  return entries.map((e, idx) => ({
    handle: e.handle.replace(/^@/, "").trim(),
    platform,
    interaction_type: "comment",
    content: e.content,
    interacted_at: parseRelativeTime(e.timeAgo),
    zone: "IGNORE",
    verified: false,
    followers: null,
    name: null,
    bio: null,
    _source: "paste",
    _id: `paste_un_${idx}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
  }));
}

// ── YouTube / generic @handle format parser ───────────────────────────────────
// Format: "@handle\nN unit ago\ncomment text\nlikeCount\nReply\nN replies"
function parseYouTubePaste(text, platform = "youtube") {
  const timeRe = /^(\d+)\s+(hours?|days?|weeks?|months?|minutes?|seconds?|years?)\s+ago$/i;
  const replyMetaRe = /^\d+\s+repl(y|ies)$/i;
  const standaloneNumRe = /^\d+$/;

  const lines = text.split("\n").map(l => l.trim());
  const entries = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!/^@\S/.test(line)) { i++; continue; }

    const handle = line.slice(1).trim();
    i++;
    let timeAgo = null;
    const contentLines = [];

    // Next non-empty line should be the timestamp
    if (i < lines.length && timeRe.test(lines[i])) {
      timeAgo = lines[i];
      i++;
    }

    // Collect body lines until the next @handle entry
    while (i < lines.length && !/^@\S/.test(lines[i])) {
      const l = lines[i];
      // Skip "Reply" and "N replies" — they're YouTube UI chrome
      if (l === "Reply" || replyMetaRe.test(l)) { i++; continue; }
      contentLines.push(l);
      i++;
    }

    // Strip trailing standalone like-count numbers and blank lines
    while (contentLines.length > 0) {
      const last = contentLines[contentLines.length - 1];
      if (standaloneNumRe.test(last) || last === "") contentLines.pop();
      else break;
    }

    if (handle) {
      entries.push({ handle, timeAgo, contentLines });
    }
  }

  return entries.map((e, idx) => ({
    handle: e.handle,
    platform,
    interaction_type: "comment",
    content: e.contentLines.join("\n").trim() || null,
    interacted_at: e.timeAgo ? parseRelativeTime(e.timeAgo) : null,
    zone: "IGNORE",
    verified: false,
    followers: null,
    name: null,
    bio: null,
    _source: "paste",
    _id: `paste_yt_${idx}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
  }));
}

// Auto-detect paste format
function detectPasteFormat(text) {
  const lines = text.split("\n");
  const inlineTimeRe = /\d+\s+(?:hours?|days?|weeks?|months?|minutes?|seconds?)\s+ago/i;
  const numberedCount   = lines.filter(l => /^\d+\.\s+\S/.test(l)).length;
  const handleCount     = lines.filter(l => /^@\S/.test(l.trim())).length;
  // Unnumbered: line has inline time but isn't a numbered or @handle line
  const unnumberedCount = lines.filter(l => {
    const t = l.trim();
    return t && !(/^\d+\.\s+/.test(t)) && !(/^@\S/.test(t)) && inlineTimeRe.test(t);
  }).length;
  const best = Math.max(numberedCount, handleCount, unnumberedCount);
  if (best === 0) return "unknown";
  if (handleCount === best)     return "handle";
  if (numberedCount === best)   return "buffer";
  return "unnumbered";
}

function parsePaste(text, platform) {
  const fmt = detectPasteFormat(text);
  if (fmt === "handle")     return { items: parseYouTubePaste(text, platform), fmt };
  if (fmt === "buffer")     return { items: parseBufferPaste(text, platform), fmt };
  if (fmt === "unnumbered") return { items: parseBufferUnnumbered(text, platform), fmt };
  // Unknown — try all three, return whichever yields most results
  const results = [
    { items: parseBufferPaste(text, platform),      fmt: "buffer" },
    { items: parseYouTubePaste(text, platform),     fmt: "handle" },
    { items: parseBufferUnnumbered(text, platform), fmt: "unnumbered" },
  ];
  return results.reduce((best, r) => r.items.length > best.items.length ? r : best, results[0]);
}

const FORMAT_LABELS = {
  buffer:     "Buffer / Instagram numbered",
  handle:     "@handle (YouTube / generic)",
  unnumbered: "Buffer unnumbered (inline timestamp)",
  unknown:    "auto-detected",
};

function PasteTextImport({ onImport, platform, postUrl }) {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState(null);
  const [detectedFmt, setDetectedFmt] = useState(null);
  const [error, setError] = useState(null);

  // Re-parse automatically when platform changes while text is already entered
  useEffect(() => { if (parsed) setParsed(null); }, [platform]);

  function handleParse() {
    setError(null);
    if (!text.trim()) return;
    try {
      const { items, fmt } = parsePaste(text, platform);
      if (!items.length) {
        setError('No comments detected. Try pasting Buffer numbered comments (1. username16 hours ago) or YouTube comments (@handle on its own line).');
        return;
      }
      setParsed(items);
      setDetectedFmt(fmt);
    } catch (e) {
      setError(e.message);
    }
  }

  function handleImport() {
    if (!parsed?.length) return;
    onImport(parsed.map(p => ({ ...p, post_url: postUrl?.trim() || null })));
    setText("");
    setParsed(null);
    setDetectedFmt(null);
    setError(null);
  }

  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
      padding: 22, boxShadow: T.shadow }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: sans, fontSize: F.lg, fontWeight: 700, color: T.text, marginBottom: 4 }}>
            📋 Paste comment text
          </div>
          <div style={{ fontFamily: sans, fontSize: F.sm, color: T.sub, lineHeight: 1.6 }}>
            Paste comments from Buffer, Instagram, YouTube, or anywhere else. Auto-detects format:{" "}
            <code style={{ background: T.well, padding: "1px 5px", borderRadius: 4,
              fontSize: F.xs, fontFamily: "ui-monospace, monospace", color: T.text }}>
              1. username16 hours ago
            </code>{" "}(Buffer) or{" "}
            <code style={{ background: T.well, padding: "1px 5px", borderRadius: 4,
              fontSize: F.xs, fontFamily: "ui-monospace, monospace", color: T.text }}>
              @handle / 13 hours ago / comment
            </code>{" "}(YouTube).
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          {!parsed ? (
            <Btn onClick={handleParse} disabled={!text.trim()}>Parse comments</Btn>
          ) : (
            <Btn onClick={handleImport}>✓ Add {parsed.length} to review</Btn>
          )}
        </div>
      </div>

      {!parsed ? (
        <textarea
          value={text}
          onChange={e => { setText(e.target.value); setParsed(null); setError(null); }}
          placeholder={"Buffer numbered:  1. username16 hours ago  Comment text...\nBuffer plain:     username15 days ago  Comment text...\nYouTube:          @handle\n                  13 hours ago\n                  Comment text"}
          style={{
            width: "100%", minHeight: 220, resize: "vertical", boxSizing: "border-box",
            borderRadius: 12, border: `1px solid ${error ? T.red : T.border}`,
            background: T.well, color: T.text, padding: "14px 16px",
            fontFamily: "'SFMono-Regular', ui-monospace, Menlo, monospace",
            fontSize: 12, lineHeight: 1.6, outline: "none",
          }}
        />
      ) : (
        <div style={{ background: T.well, borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: sans, fontSize: F.sm, color: T.green, fontWeight: 600 }}>
              ✓ Parsed {parsed.length} comments{postUrl?.trim() ? ` · post URL set` : ""}
            </span>
            {detectedFmt && (
              <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim,
                background: T.card, border: `1px solid ${T.border}`,
                borderRadius: 6, padding: "2px 8px" }}>
                {FORMAT_LABELS[detectedFmt] || detectedFmt}
              </span>
            )}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {parsed.slice(0, 10).map((p, i) => (
              <span key={i} style={{ fontFamily: sans, fontSize: F.xs, background: T.card,
                border: `1px solid ${T.border}`, borderRadius: 6, padding: "3px 8px", color: T.sub }}>
                @{p.handle}
              </span>
            ))}
            {parsed.length > 10 && (
              <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim, padding: "3px 0" }}>
                +{parsed.length - 10} more
              </span>
            )}
          </div>
          <button onClick={() => { setParsed(null); setDetectedFmt(null); }}
            style={{ marginTop: 10, background: "none", border: "none", fontFamily: sans,
              fontSize: F.xs, color: T.sub, cursor: "pointer", padding: 0 }}>
            ← Edit text
          </button>
        </div>
      )}

      {error && (
        <div style={{ fontFamily: sans, fontSize: F.sm, color: T.red, marginTop: 8 }}>{error}</div>
      )}
    </div>
  );
}

// ── CSV import (interactions) ─────────────────────────────────────────────────
// Robust quoted-field CSV parser
function parseCsvText(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false, i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i += 2; continue; }
      if (ch === '"') { inQuotes = false; i++; continue; }
      field += ch; i++;
    } else {
      if (ch === '"') { inQuotes = true; i++; continue; }
      if (ch === ',') { row.push(field); field = ""; i++; continue; }
      if (ch === '\n' || ch === '\r') {
        row.push(field); field = "";
        if (row.some(f => f.trim())) rows.push(row);
        row = [];
        i += (ch === '\r' && text[i + 1] === '\n') ? 2 : 1;
        continue;
      }
      field += ch; i++;
    }
  }
  row.push(field);
  if (row.some(f => f.trim())) rows.push(row);
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return rows.slice(1).map(cells => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (cells[idx] || "").trim(); });
    return obj;
  });
}

function parseInteractionsCsv(text, platform = "instagram", postUrl = "") {
  const rows = parseCsvText(text);
  if (!rows.length) return [];
  const BOOL_TRUE = new Set(["true", "yes", "1", "y"]);
  const VALID_ZONES = new Set(["ELITE", "INFLUENTIAL", "SIGNAL", "IGNORE"]);

  return rows.map((row, idx) => {
    const handle = (
      row.handle || row.username || row.instagram_handle ||
      row.x_handle || row.youtube_handle || row.linkedin_handle || ""
    ).replace(/^@/, "").trim();
    if (!handle) return null;

    const rowPlatform = row.platform || platform;
    const rawDate = row.interacted_at || row.date || row.timestamp || row.created_at || "";
    let interacted_at = null;
    if (rawDate) {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) interacted_at = d.toISOString();
    }
    const followers = row.followers
      ? parseInt(row.followers.replace(/[,_\s]/g, ""), 10) || null : null;
    const rowZone = (row.zone || "").toUpperCase();

    return {
      handle,
      platform: rowPlatform,
      interaction_type: row.interaction_type || row.type || "comment",
      content: row.content || row.comment || row.text || null,
      interacted_at,
      followers,
      verified: BOOL_TRUE.has((row.verified || "").toLowerCase()),
      name: row.name || row.display_name || null,
      bio: row.bio || row.description || null,
      post_url: row.post_url || row.url || postUrl?.trim() || null,
      zone: VALID_ZONES.has(rowZone) ? rowZone : "IGNORE",
      notes: row.notes || null,
      _source: "csv",
      _id: `csv_${idx}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    };
  }).filter(Boolean);
}

function CsvInteractionsImport({ onImport, platform, postUrl }) {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => { if (parsed) setParsed(null); }, [platform]);

  async function loadFile(file) {
    if (!file) return;
    setText(await file.text());
    setParsed(null);
    setError(null);
  }

  function handleParse() {
    setError(null);
    if (!text.trim()) return;
    try {
      const items = parseInteractionsCsv(text, platform, postUrl);
      if (!items.length) {
        setError("No rows parsed. Make sure the CSV has a header row with a 'handle' column.");
        return;
      }
      setParsed(items);
    } catch (e) {
      setError(e.message);
    }
  }

  function handleImport() {
    if (!parsed?.length) return;
    onImport(parsed);
    setText("");
    setParsed(null);
    setError(null);
  }

  const codeStyle = {
    background: T.well, padding: "1px 5px", borderRadius: 4,
    fontSize: F.xs, fontFamily: "ui-monospace, monospace", color: T.text,
  };

  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
      padding: 22, boxShadow: T.shadow }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: sans, fontSize: F.lg, fontWeight: 700, color: T.text, marginBottom: 4 }}>
            📄 Import interactions CSV
          </div>
          <div style={{ fontFamily: sans, fontSize: F.sm, color: T.sub, lineHeight: 1.6 }}>
            Upload or paste a CSV — needs a <code style={codeStyle}>handle</code> column.
            Optional: <code style={codeStyle}>platform</code>, <code style={codeStyle}>interaction_type</code>,{" "}
            <code style={codeStyle}>content</code>, <code style={codeStyle}>interacted_at</code>,{" "}
            <code style={codeStyle}>followers</code>, <code style={codeStyle}>verified</code>,{" "}
            <code style={codeStyle}>name</code>, <code style={codeStyle}>bio</code>,{" "}
            <code style={codeStyle}>post_url</code>. Session defaults fill in any gaps.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          <Btn variant="secondary" onClick={() => fileRef.current?.click()}>Upload CSV</Btn>
          {!parsed ? (
            <Btn onClick={handleParse} disabled={!text.trim()}>Parse CSV</Btn>
          ) : (
            <Btn onClick={handleImport}>✓ Add {parsed.length} to review</Btn>
          )}
          <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: "none" }}
            onChange={e => loadFile(e.target.files?.[0])} />
        </div>
      </div>

      {!parsed ? (
        <textarea
          value={text}
          onChange={e => { setText(e.target.value); setParsed(null); setError(null); }}
          placeholder={"handle,platform,interaction_type,content,followers,interacted_at\njanedoe,instagram,comment,\"Love this!\",5200,2026-03-15\njohnsmith,instagram,like,,1200,"}
          style={{
            width: "100%", minHeight: 160, resize: "vertical", boxSizing: "border-box",
            borderRadius: 12, border: `1px solid ${error ? T.red : T.border}`,
            background: T.well, color: T.text, padding: "14px 16px",
            fontFamily: "'SFMono-Regular', ui-monospace, Menlo, monospace",
            fontSize: 12, lineHeight: 1.6, outline: "none",
          }}
        />
      ) : (
        <div style={{ background: T.well, borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontFamily: sans, fontSize: F.sm, color: T.green, fontWeight: 600, marginBottom: 8 }}>
            ✓ Parsed {parsed.length} rows{postUrl?.trim() ? ` · post URL set` : ""} — click "Add {parsed.length} to review" above to continue
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {parsed.slice(0, 10).map((p, i) => (
              <span key={i} style={{ fontFamily: sans, fontSize: F.xs, background: T.card,
                border: `1px solid ${T.border}`, borderRadius: 6, padding: "3px 8px", color: T.sub }}>
                @{p.handle}
              </span>
            ))}
            {parsed.length > 10 && (
              <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim, padding: "3px 0" }}>
                +{parsed.length - 10} more
              </span>
            )}
          </div>
          <button onClick={() => setParsed(null)}
            style={{ marginTop: 10, background: "none", border: "none", fontFamily: sans,
              fontSize: F.xs, color: T.sub, cursor: "pointer", padding: 0 }}>
            ← Edit CSV
          </button>
        </div>
      )}

      {error && (
        <div style={{ fontFamily: sans, fontSize: F.sm, color: T.red, marginTop: 8 }}>{error}</div>
      )}
    </div>
  );
}

// ── Single interaction row (editable) ────────────────────────────────────────
// ── Inline editable cell ─────────────────────────────────────────────────────
function EditableCell({ value, onChange, type = "text", placeholder = "—", width, options }) {
  const [focused, setFocused] = useState(false);
  if (options) return (
    <select value={value || ""} onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{ fontFamily: sans, fontSize: F.sm, padding: "4px 6px", borderRadius: 6,
        border: `1px solid ${focused ? T.accent : T.border}`,
        background: T.card, color: T.text, cursor: "pointer" }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
  if (type === "checkbox") return (
    <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)}
      style={{ width: 16, height: 16, cursor: "pointer", accentColor: T.accent }} />
  );
  const empty = value === null || value === undefined || value === "";
  return (
    <input
      type={type} value={value ?? ""} placeholder={placeholder}
      onChange={e => onChange(type === "number"
        ? (e.target.value === "" ? null : parseInt(e.target.value) || null)
        : e.target.value)}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{ fontFamily: sans, fontSize: F.sm, padding: "4px 8px", borderRadius: 6,
        border: `1px solid ${focused ? T.accent : empty ? "transparent" : T.border}`,
        background: focused ? T.card : empty ? "transparent" : T.well,
        color: empty ? T.dim : T.text, width: width || (type === "number" ? 80 : 130),
        outline: "none", transition: "border 0.12s, background 0.12s", cursor: "text" }}
    />
  );
}

// ── Single interaction row — Handle, Category, Followers, Type, Bio ─────────
function InteractionRow({ item, index, onChange, onRemove }) {
  const zoneColor = ZONE_COLORS[item.zone] || ZONE_COLORS.SIGNAL;
  const isIgnored = item.zone === "IGNORE";
  return (
    <tr style={{ borderBottom: `1px solid ${T.border}`, opacity: isIgnored ? 0.5 : 1 }}>
      <td style={{ width: 4, padding: 0, background: zoneColor.color }} />

      {/* Handle — link + verified badge + display name + bio below */}
      <td style={{ padding: "9px 12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <a href={`https://instagram.com/${item.handle}`} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.accent, textDecoration: "none" }}
              onMouseEnter={e => e.target.style.textDecoration = "underline"}
              onMouseLeave={e => e.target.style.textDecoration = "none"}>
              @{item.handle}
            </a>
            {item.verified && <span title="Verified" style={{ color: "#1D9BF0", fontSize: 12 }}>✓</span>}
            {item._autofilled && <span title="Autofilled from previous import" style={{ color: T.accent, fontSize: 11, fontWeight: 700 }}>★</span>}
            {item._thumbnailUrl && (
              <span style={{ position: "relative", display: "inline-block" }}
                onMouseEnter={e => { const t = e.currentTarget.querySelector(".thumb-pop"); if(t) t.style.display="block"; }}
                onMouseLeave={e => { const t = e.currentTarget.querySelector(".thumb-pop"); if(t) t.style.display="none"; }}>
                <span title="View source screenshot"
                  style={{ background: T.well, border: `1px solid ${T.border}`, borderRadius: 3,
                    padding: "1px 4px", fontSize: 9, color: T.dim, cursor: "default", userSelect: "none" }}>
                  📸
                </span>
                <div className="thumb-pop" style={{
                  display: "none", position: "absolute", zIndex: 100,
                  bottom: "calc(100% + 6px)", left: 0,
                  background: T.card, border: `1px solid ${T.border2}`,
                  borderRadius: 8, padding: 6, boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                  width: 180,
                }}>
                  <img src={item._thumbnailUrl} alt="source screenshot"
                    style={{ width: "100%", borderRadius: 4, display: "block" }} />
                  <div style={{ fontFamily: sans, fontSize: 9, color: T.dim, marginTop: 4,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item._source}
                  </div>
                </div>
              </span>
            )}
          </div>
          {/* Display name + bio inline editable */}
          <EditableCell value={item.name} placeholder="add name"
            onChange={v => onChange(index, "name", v)} width={150} />
          <EditableCell value={item.bio} placeholder="add bio"
            onChange={v => onChange(index, "bio", v)} width={220} />
          {/* Show other known platform handles for merged accounts */}
          {item._knownHandles && Object.keys(item._knownHandles).filter(p => p !== item.platform).length > 0 && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 2 }}>
              {Object.entries(item._knownHandles).filter(([p]) => p !== item.platform).map(([p, h]) => (
                <span key={p} style={{ fontFamily: sans, fontSize: 9, color: T.dim,
                  background: T.well, border: `1px solid ${T.border}`, borderRadius: 3,
                  padding: "1px 5px" }}>
                  {PLATFORM_ICONS[p] || p} @{h}
                </span>
              ))}
            </div>
          )}
        </div>
      </td>

      {/* Category — computed badge + Elite button */}
      <td style={{ padding: "9px 12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <ZoneBadge zone={item.zone} />
          {item.zone !== "ELITE" && (
            <button
              onClick={() => onChange(index, "zone", "ELITE")}
              title="Add to Elite list"
              style={{ fontFamily: sans, fontSize: 10, padding: "2px 7px", borderRadius: 5,
                border: `1px solid ${T.accent}`, background: "transparent", color: T.accent,
                cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap", width: "fit-content" }}>
              ★ Elite
            </button>
          )}
        </div>
      </td>

      {/* Followers — inline editable number */}
      <td style={{ padding: "9px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <EditableCell value={item.followers} type="number" placeholder="—"
            onChange={v => onChange(index, "followers", v)} width={75} />
          {item._enriched === true && item.followers &&
            <span title="Looked up from Instagram" style={{ fontSize: 9, color: T.green }}>✓</span>}
          {item._enriched === false &&
            <span title="Profile not found / private" style={{ fontSize: 9, color: T.dim }}>?</span>}
        </div>
      </td>

      {/* Type — dropdown */}
      <td style={{ padding: "9px 12px" }}>
        <EditableCell value={item.interaction_type}
          onChange={v => onChange(index, "interaction_type", v)}
          options={["follow","like","mention","comment","tag","view"]} />
      </td>

      {/* Remove */}
      <td style={{ padding: "9px 12px" }}>
        <button onClick={() => onRemove(index)}
          onMouseEnter={e => e.currentTarget.style.color = T.red}
          onMouseLeave={e => e.currentTarget.style.color = T.dim}
          style={{ background: "transparent", border: "none", color: T.dim,
            cursor: "pointer", fontSize: 18, padding: "0 4px", lineHeight: 1,
            transition: "color 0.1s" }}>×</button>
      </td>
    </tr>
  );
}

function ScreenshotCard({ result, onRemoveScreenshot }) {
  const [expanded, setExpanded] = useState(true);
  const count = result.interactions.length;

  return (
    <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.border}`,
      boxShadow: T.shadow, overflow: "hidden", marginBottom: 12 }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
          cursor: "pointer", borderBottom: expanded ? `1px solid ${T.border}` : "none" }}>
        {result.preview && (
          <img src={result.preview} alt="" style={{ width: 48, height: 48, objectFit: "cover",
            borderRadius: 8, border: `1px solid ${T.border}` }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text }}>
            {result.filename}
          </div>
          <div style={{ fontFamily: sans, fontSize: F.xs, color: T.sub, marginTop: 2 }}>
            {result.error ? (
              <span style={{ color: T.red }}>⚠ {result.error}</span>
            ) : (
              `${count} interaction${count !== 1 ? "s" : ""} detected`
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Zone summary pills */}
          {["ELITE","INFLUENTIAL","SIGNAL"].map(z => {
            const n = result.interactions.filter(i => i.zone === z).length;
            if (!n) return null;
            const c = ZONE_COLORS[z];
            return (
              <span key={z} style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`,
                borderRadius: 20, padding: "1px 8px", fontSize: F.xs, fontFamily: sans, fontWeight: 600 }}>
                {n} {z}
              </span>
            );
          })}
          <button onClick={e => { e.stopPropagation(); onRemoveScreenshot(); }}
            style={{ background: "none", border: "none", color: T.dim, cursor: "pointer", fontSize: 18, padding: "0 4px" }}>×</button>
          <span style={{ color: T.dim, fontSize: 12 }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>
      {expanded && result.interactions.length === 0 && (
        <div style={{ padding: "24px 18px", textAlign: "center", color: T.dim,
          fontFamily: sans, fontSize: F.sm }}>
          No interactions detected in this screenshot
        </div>
      )}
    </div>
  );
}

// ── Manual add row ────────────────────────────────────────────────────────────
function ManualAddRow({ onAdd }) {
  const [form, setForm] = useState({
    handle: "", name: "", bio: "", followers: "", verified: false,
    interaction_type: "follow", zone: "IGNORE", content: "", platform: "instagram",
  });
  const set = (k, v) => setForm(f => {
    const next = { ...f, [k]: v };
    // Recompute zone live as user types (unless they clicked Elite)
    if (["name","bio","followers","verified"].includes(k) && next.zone !== "ELITE") {
      next.zone = computeZone({ ...next, followers: k === "followers" ? (parseInt(v)||0) : (parseInt(next.followers)||0) });
    }
    return next;
  });

  const handleSubmit = () => {
    if (!form.handle.trim()) return;
    const base = {
      ...form,
      handle: form.handle.replace(/^@/, "").trim(),
      followers: form.followers ? parseInt(form.followers) : null,
    };
    onAdd({ ...base, zone: computeZone(base) });
    setForm({ handle: "", name: "", bio: "", followers: "", verified: false,
      interaction_type: "follow", zone: "IGNORE", content: "", platform: "instagram" });
  };

  const inp = (key, placeholder, type = "text", width = 110) => (
    type === "checkbox" ? (
      <input type="checkbox" checked={form[key]}
        onChange={e => set(key, e.target.checked)}
        style={{ width: 16, height: 16 }} />
    ) : (
      <input
        type={type} placeholder={placeholder} value={form[key]}
        onChange={e => set(key, e.target.value)}
        style={{ fontFamily: sans, fontSize: F.sm, padding: "6px 10px",
          border: `1px solid ${T.border2}`, borderRadius: 8,
          background: T.well, color: T.text, width }} />
    )
  );

  return (
    <tr style={{ borderBottom: `1px solid ${T.border}`, background: T.accentBg }}>
      <td style={{ width: 4, background: T.accentBorder, padding: 0 }} />
      {/* Handle */}
      <td style={{ padding: "8px 12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: T.dim, fontSize: F.xs }}>@</span>
            {inp("handle", "handle", "text", 110)}
          </div>
          {inp("name", "Display name", "text", 150)}
          {inp("bio", "Bio (optional)", "text", 220)}
        </div>
      </td>
      {/* Category — auto-computed, shown as badge */}
      <td style={{ padding: "8px 12px" }}>
        <ZoneBadge zone={form.zone} />
      </td>
      {/* Followers */}
      <td style={{ padding: "8px 12px" }}>{inp("followers", "—", "number", 80)}</td>
      {/* Type */}
      <td style={{ padding: "8px 12px" }}>
        <select value={form.interaction_type} onChange={e => set("interaction_type", e.target.value)}
          style={{ fontFamily: sans, fontSize: F.sm, padding: "6px 8px", borderRadius: 8,
            border: `1px solid ${T.border2}`, background: T.card, color: T.text }}>
          {["follow","like","mention","comment","tag","view"].map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </td>
      {/* Add */}
      <td style={{ padding: "8px 12px" }}>
        <Btn onClick={handleSubmit} style={{ padding: "6px 12px" }}>+ Add</Btn>
      </td>
    </tr>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ImportPage() {
  const [mode, setMode] = useState("interactions");
  const [platform, setPlatform] = useState("all");
  const [screenshots, setScreenshots] = useState([]); // { filename, preview, interactions, error, parsing }
  const [allInteractions, setAllInteractions] = useState([]); // flat merged list for review
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);
  const [filterZone, setFilterZone] = useState("ALL");
  const [includeIgnore, setIncludeIgnore] = useState(false);
  const [autoEnrichStatus, setAutoEnrichStatus] = useState(null);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [knownProfiles, setKnownProfiles] = useState({}); // handle → all previously seen accounts
  // Global session defaults — apply to both screenshot and paste imports
  const [sessionPlatform, setSessionPlatform] = useState("instagram");
  const [sessionPostUrl, setSessionPostUrl] = useState("");
  const [sessionDefaultZone, setSessionDefaultZone] = useState("IGNORE");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setMode(params.get("mode") === "handles" ? "handles" : "interactions");
    setPlatform(params.get("platform") || "all");
  }, []);

  // Load known elite profiles on mount for autofill
  useEffect(() => {
    if (mode !== "interactions") return;
    fetch("/api/elite/profiles")
      .then(r => r.json())
      .then(d => { if (d.profiles) setKnownProfiles(d.profiles); })
      .catch(() => {});
  }, [mode]);

  // Autofill helper — looks up by "platform:handle" key, falls back to any platform match
  const autofillKnown = (interaction) => {
    const h    = (interaction.handle || "").toLowerCase().replace(/^@/, "");
    const plat = (interaction.platform || "instagram").toLowerCase();
    // Try exact platform match first, then any platform
    const known = knownProfiles[`${plat}:${h}`]
      || Object.values(knownProfiles).find(p =>
          Object.values(p.handles || {}).map(v => v.toLowerCase()).includes(h)
         );
    if (!known) return interaction;
    return {
      ...interaction,
      name:         known.name      || interaction.name,
      followers:    known.followers  ?? interaction.followers,
      verified:     known.verified   ?? interaction.verified,
      bio:          known.bio        || interaction.bio,
      avatar_url:   known.avatar_url || interaction.avatar_url,
      zone:         known.zone || interaction.zone,
      on_watchlist: known.on_watchlist || false,
      ignored:      known.ignored || false,
      account_id:   known.account_id || null,
      _autofilled:  true,
      _knownHandles: known.handles || {},
    };
  };

  // Convert file to base64
  const toBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const toPreview = (file) => new Promise((res) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.readAsDataURL(file);
  });

  // Compress image for sending to Claude Vision — max 1200px wide, keeps detail
  const compressForParse = (dataUrl) => new Promise((res) => {
    const img = new Image();
    img.onload = () => {
      const MAX_W = 1200;
      const scale = Math.min(1, MAX_W / img.width);
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      const full = canvas.toDataURL("image/jpeg", 0.82);
      res({ base64: full.split(",")[1], mediaType: "image/jpeg" });
    };
    img.src = dataUrl;
  });

  // Compress image to ~300px wide JPEG thumbnail (~15-25KB)
  const compressThumbnail = (dataUrl) => new Promise((res) => {
    const img = new Image();
    img.onload = () => {
      const MAX_W = 300;
      const scale = Math.min(1, MAX_W / img.width);
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      // Strip data URL prefix, return raw base64
      const full = canvas.toDataURL("image/jpeg", 0.72);
      res(full.split(",")[1]);
    };
    img.src = dataUrl;
  });

  const handleFiles = async (files) => {
    if (parsing) return;
    setParsing(true);
    setSaveResult(null);

    // Build image objects — compress before sending to stay under Vercel 4.5MB body limit
    const images = await Promise.all(
      Array.from(files).map(async (f) => {
        const preview = await toPreview(f);
        const compressed = await compressForParse(preview);
        return {
          filename: f.name,
          base64:    compressed.base64,
          mediaType: compressed.mediaType,
          preview,   // full res kept locally for thumbnail generation
        };
      })
    );

    // Optimistically add to screenshots list as "parsing"
    const pending = images.map(img => ({
      filename: img.filename,
      preview: img.preview,
      interactions: [],
      parsing: true,
      error: null,
    }));
    setScreenshots(prev => [...prev, ...pending]);

    try {
      const res = await fetch("/api/screenshots/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: images.map(i => ({ base64: i.base64, mediaType: i.mediaType, filename: i.filename })),
          platformHint: sessionPlatform,
        }),
      });

      let data;
      const rawText = await res.text();
      try {
        data = JSON.parse(rawText);
      } catch {
        // Non-JSON response — likely Vercel size limit or server error
        const preview = rawText.slice(0, 120);
        if (!res.ok) throw new Error(`Server error ${res.status}: ${preview}`);
        throw new Error(`Unexpected response: ${preview}`);
      }

      if (data.error) throw new Error(data.error);

      // Merge results into screenshots
      const results = data.results || [];
      setScreenshots(prev => {
        const updated = [...prev];
        // Replace the pending entries we just added
        for (let i = 0; i < results.length; i++) {
          const idx = updated.findIndex(s => s.filename === results[i].filename && s.parsing);
          if (idx >= 0) {
            updated[idx] = {
              ...updated[idx],
              interactions: results[i].interactions || [],
              error: results[i].error || null,
              parsing: false,
            };
          }
        }
        return updated;
      });

      // Add unique interactions to the flat review list
      const newInteractions = results.flatMap(r =>
        (r.interactions || []).map((item, idx) => ({
          ...item,
          _id: `${r.filename}_${idx}_${Date.now()}`,
          _source: r.filename,
        }))
      );

      // Detect dominant platform from this batch
      const platCounts = {};
      for (const i of newInteractions) {
        if (i.platform) platCounts[i.platform] = (platCounts[i.platform] || 0) + 1;
      }
      const detectedPlatform = Object.entries(platCounts).sort((a,b) => b[1]-a[1])[0]?.[0] || sessionPlatform;

      const newHandles = new Set(newInteractions.map(i =>
        `${(i.platform || detectedPlatform)}:${i.handle?.toLowerCase()}`).filter(Boolean));

      // Build merged list synchronously so autoEnrich gets the real data immediately
      const buildMergedList = (prev) => {
        const map = new Map(prev.map(i => [`${i.platform||"instagram"}:${i.handle?.toLowerCase()}`, i]));
        for (const rawItem of newInteractions) {
          const withPlat = {
            ...rawItem,
            platform: rawItem.platform || detectedPlatform,
            post_url: rawItem.post_url || sessionPostUrl?.trim() || null,
          };
          const item = autofillKnown(withPlat);
          const key = `${item.platform||"instagram"}:${item.handle?.toLowerCase()}`;
          if (!key) continue;
          if (!map.has(key)) {
            map.set(key, { ...item, zone: computeZone(item) });
          } else {
            const existing = map.get(key);
            const existTypes = existing.interaction_type ? [existing.interaction_type] : [];
            const newTypes = item.interaction_type ? [item.interaction_type] : [];
            const allTypes = [...new Set([...existTypes, ...newTypes])].join(",");
            const merged = {
              ...existing,
              followers: item.followers || existing.followers,
              verified: item.verified || existing.verified,
              interaction_type: allTypes,
            };
            merged.zone = computeZone({ ...merged,
              on_watchlist: item.on_watchlist || existing.on_watchlist });
            merged.ignored = item.ignored || false;
            merged.account_id = item.account_id || existing.account_id || null;
            merged._knownHandles = item._knownHandles || existing._knownHandles || {};
            map.set(key, merged);
          }
        }
        return Array.from(map.values());
      };

      // Use functional update to get current state, build new list, set it
      let freshList = [];
      setAllInteractions(prev => {
        freshList = buildMergedList(prev);
        return freshList;
      });

      // Wait one tick for setState to flush, then enrich only the newly added items
      await new Promise(r => setTimeout(r, 50));
      const toEnrich = freshList.filter(i =>
        newHandles.has(`${i.platform||"instagram"}:${i.handle?.toLowerCase()}`));
      if (toEnrich.length) autoEnrich(toEnrich);

      // Store compressed thumbnails for each successfully-parsed screenshot
      for (const img of images) {
        const result = results.find(r => r.filename === img.filename);
        if (!result || result.error) continue;
        try {
          const thumbnail = await compressThumbnail(img.preview);
          const storeRes = await fetch("/api/screenshots/store", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: img.filename,
              thumbnail,
              mediaType: "image/jpeg",
              platform: "instagram",
              interactionCount: result.interactions?.length || 0,
            }),
          });
          const storeData = await storeRes.json();
          if (storeData.id) {
            // Attach screenshot_id to all interactions from this file
            setAllInteractions(prev => prev.map(i =>
              i._source === img.filename && !i.screenshot_id
                ? { ...i, screenshot_id: storeData.id, _thumbnailUrl: storeData.thumbnailUrl }
                : i
            ));
            // Also store thumbnailUrl in screenshots state for the card preview
            setScreenshots(prev => prev.map(s =>
              s.filename === img.filename
                ? { ...s, screenshot_id: storeData.id, thumbnailUrl: storeData.thumbnailUrl }
                : s
            ));
          }
        } catch (_) { /* thumbnail storage is non-critical */ }
      }

    } catch (e) {
      setScreenshots(prev => prev.map(s =>
        s.parsing ? { ...s, parsing: false, error: e.message } : s
      ));
    }

    setParsing(false);
  };

  const updateInteraction = (index, key, value) => {
    setAllInteractions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      if (key === "zone") {
        // Explicit zone override (Elite button) — mark on_watchlist
        updated[index].on_watchlist = value === "ELITE";
      } else if (["name","bio","followers","verified"].includes(key)) {
        // Recompute zone from data (unless already Elite)
        if (updated[index].zone !== "ELITE") {
          updated[index].zone = computeZone(updated[index]);
        }
      }
      return updated;
    });
  };

  const removeInteraction = (index) => {
    setAllInteractions(prev => prev.filter((_, i) => i !== index));
  };

  const removeScreenshot = (filename) => {
    setScreenshots(prev => prev.filter(s => s.filename !== filename));
    setAllInteractions(prev => prev.filter(i => i._source !== filename));
  };

  const addManual = (item) => {
    const id = `manual_${Date.now()}`;
    setAllInteractions(prev => [...prev, { ...item, _id: id, _source: "manual" }]);
  };

  const autoEnrich = async (targets) => {
    if (!targets?.length) return;
    const WIKI_BATCH = 8;    // Wikipedia is fast, free, sequential is fine
    const FOLLOW_BATCH = 3;  // Each does a web search — run in parallel batches of 3

    // --- Wiki bios FIRST (fast, no AI cost) ---
    const noBio = targets.filter(i => i.name && i.name !== i.handle && !i.bio?.trim());
    for (let i = 0; i < noBio.length; i += WIKI_BATCH) {
      const batch = noBio.slice(i, i + WIKI_BATCH);
      setAutoEnrichStatus(`Bios: ${i + 1}–${Math.min(i + WIKI_BATCH, noBio.length)} of ${noBio.length}…`);
      try {
        const res = await fetch("/api/enrich/wikipedia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accounts: batch.map(t => ({ handle: t.handle, name: t.name })) }),
        });
        const data = await res.json();
        if (data.results) {
          setAllInteractions(prev => {
            const updated = [...prev];
            data.results.forEach(r => {
              if (!r.found) return;
              const idx = updated.findIndex(u => u.handle?.toLowerCase() === r.handle?.toLowerCase());
              if (idx >= 0 && !updated[idx].bio?.trim()) {
                updated[idx] = { ...updated[idx], bio: r.bio, _wikiBio: true };
                if (updated[idx].zone !== "ELITE") updated[idx].zone = computeZone(updated[idx]);
              }
            });
            return updated;
          });
        }
      } catch (_) {}
    }

    // --- Follower counts (AI web search, parallel per batch) ---
    const noFollowers = targets.filter(i => !(parseInt(i.followers) > 0));
    for (let i = 0; i < noFollowers.length; i += FOLLOW_BATCH) {
      const batch = noFollowers.slice(i, i + FOLLOW_BATCH);
      setAutoEnrichStatus(`Followers: ${i + 1}–${Math.min(i + FOLLOW_BATCH, noFollowers.length)} of ${noFollowers.length}…`);
      try {
        const res = await fetch("/api/enrich/followers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accounts: batch.map(t => ({ handle: t.handle, name: t.name || t.handle, platform: t.platform || "instagram" })) }),
        });
        const data = await res.json();
        if (data.results) {
          setAllInteractions(prev => {
            const updated = [...prev];
            data.results.forEach(r => {
              if (!r.found || !r.followers) return;
              const idx = updated.findIndex(u => u.handle?.toLowerCase() === r.handle?.toLowerCase());
              if (idx >= 0 && !(parseInt(updated[idx].followers) > 0)) {
                updated[idx] = { ...updated[idx], followers: r.followers, _followerSource: "web" };
                if (updated[idx].zone !== "ELITE") updated[idx].zone = computeZone(updated[idx]);
              }
            });
            return updated;
          });
        }
      } catch (e) { console.error("followers batch error", e); }
    }

    setAutoEnrichStatus(null);
  };

  // ── Paste import: merge parsed comments into the review table ───────────────
  const handlePasteImport = (items) => {
    const withFill = items.map(item => autofillKnown({ ...item }));
    const withZone = withFill.map(item => {
      const computed = computeZone(item);
      // For paste items with no enrichment data yet, computeZone returns IGNORE.
      // Apply the session default zone instead so the user's choice is respected.
      const zone = (computed === "IGNORE" && item._source === "paste") ? sessionDefaultZone : computed;
      return { ...item, zone };
    });
    const newKeys  = new Set(withZone.map(i => `${i.platform}:${i.handle?.toLowerCase()}`));

    let freshList = [];
    setAllInteractions(prev => {
      const map = new Map(prev.map(i => [`${i.platform || "instagram"}:${i.handle?.toLowerCase()}`, i]));
      for (const item of withZone) {
        const key = `${item.platform}:${item.handle?.toLowerCase()}`;
        if (!key || !item.handle) continue;
        if (!map.has(key)) {
          map.set(key, item);
        } else {
          const existing = map.get(key);
          const allTypes = [...new Set([
            ...(existing.interaction_type ? existing.interaction_type.split(",") : []),
            ...(item.interaction_type ? item.interaction_type.split(",") : []),
          ])].join(",");
          const merged = {
            ...existing,
            interaction_type: allTypes,
            // Prefer whichever has a value — incoming import may add post_url/content
            // that the earlier entry was missing
            post_url: item.post_url || existing.post_url || null,
            content:  item.content  || existing.content  || null,
          };
          merged.zone = computeZone({ ...merged, on_watchlist: item.on_watchlist || existing.on_watchlist });
          map.set(key, merged);
        }
      }
      freshList = Array.from(map.values());
      return freshList;
    });

    // Trigger enrichment for newly added handles
    setTimeout(() => {
      const toEnrich = freshList.filter(i => newKeys.has(`${i.platform}:${i.handle?.toLowerCase()}`));
      if (toEnrich.length) autoEnrich(toEnrich);
    }, 50);
  };

    const handleSave = async () => {
    const toSave = allInteractions.filter(i => i.handle);
    if (!toSave.length) return;
    setSaving(true);
    setSaveResult(null);
    try {
      const res = await fetch("/api/screenshots/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interactions: toSave, includeIgnore }),
      });
      const data = await res.json();
      setSaveResult(data);
      if (data.saved > 0) {
        // Remove saved items from the list; keep IGNORE if they weren't included
        setAllInteractions(prev =>
          includeIgnore ? [] : prev.filter(i => i.zone === 'IGNORE')
        );
      }
    } catch (e) {
      setSaveResult({ error: e.message });
    }
    setSaving(false);
  };

  const filtered = filterZone === "ALL"
    ? allInteractions
    : allInteractions.filter(i => i.zone === filterZone);

  const zoneCounts = {
    ELITE:       allInteractions.filter(i => i.zone === "ELITE").length,
    INFLUENTIAL: allInteractions.filter(i => i.zone === "INFLUENTIAL").length,
    SIGNAL:      allInteractions.filter(i => i.zone === "SIGNAL").length,
    IGNORE:      allInteractions.filter(i => i.zone === "IGNORE").length,
  };
  const saveableCount = includeIgnore
    ? allInteractions.filter(i => i.handle).length
    : allInteractions.filter(i => i.handle && i.zone !== "IGNORE").length;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: sans }}>
      {/* Header */}
      <div style={{ background: T.card, borderBottom: `1px solid ${T.border}`,
        padding: "0 32px", display: "flex", alignItems: "center", gap: 16, height: 56 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10,
          textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, background: T.accent, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 15, fontWeight: 800 }}>A</div>
          <span style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 700,
            color: T.text }}>Audian</span>
        </a>
        <span style={{ color: T.border2 }}>›</span>
        <span style={{ fontFamily: sans, fontSize: F.sm, color: T.sub,
          fontWeight: 500 }}>{mode === "handles" ? "Handle Import" : "Screenshot Import"}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <div style={{ display: "flex", background: T.well, borderRadius: 999, padding: 4, gap: 4 }}>
            {[
              { key: "interactions", label: "🤝 Interactions", href: `/import?mode=interactions${platform !== "all" ? `&platform=${platform}` : ""}` },
              { key: "handles", label: "👤 Handles", href: `/import?mode=handles${platform !== "all" ? `&platform=${platform}` : ""}` },
            ].map(tab => (
              <a key={tab.key} href={tab.href} style={{
                fontFamily: sans, fontSize: F.xs, fontWeight: 600, textDecoration: "none",
                color: mode === tab.key ? T.text : T.sub,
                background: mode === tab.key ? T.card : "transparent",
                border: mode === tab.key ? `1px solid ${T.border}` : "1px solid transparent",
                borderRadius: 999, padding: "6px 10px",
              }}>
                {tab.label}
              </a>
            ))}
          </div>
          <a href={mode === "handles" ? "/handles" : "/interactions"} style={{ fontFamily: sans, fontSize: F.sm, color: T.sub,
            textDecoration: "none", padding: "6px 12px", borderRadius: 8,
            border: `1px solid ${T.border}` }}>← Back</a>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 32px 80px" }}>

        {/* Title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: sans, fontSize: F.xl, fontWeight: 700,
            color: T.text, margin: 0, marginBottom: 6 }}>
            {mode === "handles" ? "Import Handle Lists" : "Import from Screenshots"}
          </h1>
          <p style={{ fontFamily: sans, fontSize: F.sm, color: T.sub, margin: 0, lineHeight: 1.6 }}>
            {mode === "handles"
              ? "Bring in your curated handle lists, bios, and labels so the Handles tab stays in sync with your existing spreadsheets."
              : <>Drop any Instagram screenshots — notifications, likers, followers, comments.<br />Claude reads each one and extracts interactions. Review and edit before saving.</>}
          </p>
        </div>

        {mode === "handles" ? (
          <HandlesCsvImport platform={platform} />
        ) : (
          <>
            {/* ── Global session settings ───────────────────────────────── */}
            <div style={{
              background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
              padding: "14px 18px", marginBottom: 20, display: "flex",
              alignItems: "center", gap: 14, flexWrap: "wrap", boxShadow: T.shadow,
            }}>
              <span style={{ fontFamily: sans, fontSize: F.xs, fontWeight: 700,
                color: T.dim, textTransform: "uppercase", letterSpacing: "0.06em",
                whiteSpace: "nowrap" }}>Session defaults</span>

              {/* Platform */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label style={{ fontFamily: sans, fontSize: F.xs, fontWeight: 600,
                  color: T.sub, whiteSpace: "nowrap" }}>Platform</label>
                <select value={sessionPlatform} onChange={e => setSessionPlatform(e.target.value)}
                  style={{ fontFamily: sans, fontSize: F.sm, color: T.text, background: T.well,
                    border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px",
                    cursor: "pointer" }}>
                  {Object.entries(PLATFORM_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{PLATFORM_ICONS[k]} {v}</option>
                  ))}
                </select>
              </div>

              {/* Default zone (paste imports only) */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label style={{ fontFamily: sans, fontSize: F.xs, fontWeight: 600,
                  color: T.sub, whiteSpace: "nowrap" }}>Default zone</label>
                <select value={sessionDefaultZone} onChange={e => setSessionDefaultZone(e.target.value)}
                  style={{ fontFamily: sans, fontSize: F.sm, color: T.text, background: T.well,
                    border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px",
                    cursor: "pointer" }}>
                  <option value="IGNORE">IGNORE</option>
                  <option value="SIGNAL">SIGNAL</option>
                  <option value="INFLUENTIAL">INFLUENTIAL</option>
                </select>
                <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>paste imports</span>
              </div>

              {/* Post URL */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 240 }}>
                <label style={{ fontFamily: sans, fontSize: F.xs, fontWeight: 600,
                  color: T.sub, whiteSpace: "nowrap" }}>Post URL</label>
                <input
                  type="url"
                  value={sessionPostUrl}
                  onChange={e => setSessionPostUrl(e.target.value)}
                  placeholder={`https://${sessionPlatform === "youtube" ? "youtube.com/watch?v=…" : sessionPlatform === "x" ? "x.com/user/status/…" : sessionPlatform === "linkedin" ? "linkedin.com/posts/…" : "instagram.com/p/…"} (optional)`}
                  style={{
                    flex: 1, fontFamily: sans, fontSize: F.sm, color: T.text,
                    background: T.well, border: `1px solid ${T.border}`,
                    borderRadius: 8, padding: "6px 12px", outline: "none",
                  }}
                />
                {sessionPostUrl.trim() && (
                  <button onClick={() => setSessionPostUrl("")}
                    style={{ background: "none", border: "none", color: T.dim,
                      cursor: "pointer", fontSize: 16, padding: "0 2px", lineHeight: 1 }}
                    title="Clear post URL">×</button>
                )}
              </div>

              <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim, lineHeight: 1.5 }}>
                Applies to all screenshots and paste imports this session.
              </div>
            </div>

            {/* Drop zone */}
            <div style={{ marginBottom: 28 }}>
              <DropZone onFiles={handleFiles} disabled={parsing} />
              {parsing && (
                <div style={{ textAlign: "center", marginTop: 16, fontFamily: sans,
                  fontSize: F.sm, color: T.sub }}>
                  <span style={{ display: "inline-block", animation: "spin 1s linear infinite",
                    marginRight: 8 }}>⟳</span>
                  Parsing {PLATFORM_LABELS[sessionPlatform] || "screenshots"} with Claude Vision…
                </div>
              )}
            </div>

            {/* Paste text import */}
            <div style={{ marginBottom: 28 }}>
              <PasteTextImport
                onImport={handlePasteImport}
                platform={sessionPlatform}
                postUrl={sessionPostUrl}
              />
            </div>

            {/* CSV import */}
            <div style={{ marginBottom: 28 }}>
              <CsvInteractionsImport
                onImport={handlePasteImport}
                platform={sessionPlatform}
                postUrl={sessionPostUrl}
              />
            </div>

            {/* Screenshot cards */}
            {screenshots.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontFamily: sans, fontSize: F.xs, fontWeight: 600,
                  color: T.dim, textTransform: "uppercase", letterSpacing: "0.06em",
                  marginBottom: 12 }}>
                  {screenshots.length} screenshot{screenshots.length !== 1 ? "s" : ""} processed
                </div>
                {screenshots.map(s => (
                  <ScreenshotCard
                    key={s.filename + s.preview}
                    result={s}
                    onRemoveScreenshot={() => removeScreenshot(s.filename)}
                  />
                ))}
              </div>
            )}

            {/* Review table */}
            {allInteractions.length > 0 && (
              <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`,
                boxShadow: T.shadow, overflow: "hidden" }}>

            {/* Table header */}
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`,
              display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ fontFamily: sans, fontSize: F.lg, fontWeight: 700, color: T.text }}>
                Review Interactions
                <span style={{ marginLeft: 8, background: T.well, color: T.sub,
                  borderRadius: 20, padding: "2px 10px", fontSize: F.xs }}>{allInteractions.length}</span>
              </div>

              {/* Zone filter */}
              <div style={{ display: "flex", gap: 6, marginLeft: 8, flexWrap: "wrap" }}>
                {["ALL", "ELITE", "INFLUENTIAL", "SIGNAL", "IGNORE"].map(z => {
                  const active = filterZone === z;
                  const c = z === "ALL" ? null : ZONE_COLORS[z];
                  return (
                    <button key={z} onClick={() => setFilterZone(z)}
                      style={{
                        fontFamily: sans, fontSize: F.xs, fontWeight: 600, cursor: "pointer",
                        border: `1px solid ${active ? (c?.border || T.accent) : T.border}`,
                        background: active ? (c?.bg || T.accentBg) : "transparent",
                        color: active ? (c?.color || T.accent) : T.sub,
                        borderRadius: 20, padding: "3px 10px",
                      }}>
                      {z === "ALL" ? `All ${allInteractions.length}` : `${z} ${zoneCounts[z]}`}
                    </button>
                  );
                })}
              </div>

              <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <Btn variant="ghost" onClick={() => setShowManualAdd(!showManualAdd)}
                  style={{ fontSize: F.xs }}>
                  {showManualAdd ? "− Manual entry" : "+ Manual entry"}
                </Btn>
                {autoEnrichStatus && (
                  <span style={{ fontFamily: sans, fontSize: F.xs, color: T.sub,
                    display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.accent,
                      display: "inline-block", opacity: 0.8 }} />
                    {autoEnrichStatus}
                  </span>
                )}
                {(saveResult?.saved > 0 || saveResult?.patched > 0) && (
                  <span style={{ fontFamily: sans, fontSize: F.sm, color: T.green, fontWeight: 600 }}>
                    ✓ {saveResult.saved > 0 ? `${saveResult.saved} saved` : ""}
                    {saveResult.patched > 0 ? `${saveResult.saved > 0 ? " · " : ""}${saveResult.patched} updated` : ""}
                    {saveResult.ignoreSkipped > 0 && !includeIgnore
                      ? ` · ${saveResult.ignoreSkipped} IGNORE skipped`
                      : ""}
                  </span>
                )}
                {saveResult?.error && (
                  <span style={{ fontFamily: sans, fontSize: F.sm, color: T.red }}>
                    ✗ {saveResult.error}
                  </span>
                )}
                {/* Include IGNORE toggle */}
                {zoneCounts.IGNORE > 0 && (
                  <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer",
                    fontFamily: sans, fontSize: F.xs, color: T.sub, userSelect: "none" }}>
                    <input type="checkbox" checked={includeIgnore}
                      onChange={e => setIncludeIgnore(e.target.checked)}
                      style={{ accentColor: T.accent, cursor: "pointer" }} />
                    incl. {zoneCounts.IGNORE} IGNORE
                  </label>
                )}
                <Btn onClick={handleSave} disabled={saving || saveableCount === 0}>
                  {saving ? "Saving…" : `💾 Save ${saveableCount}`}
                </Btn>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: T.well }}>
                    <th style={{ width: 4, padding: 0 }} />
                    {["Handle","List","Followers","Type",""].map(h => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "left",
                        fontFamily: sans, fontSize: F.xs, fontWeight: 600,
                        color: T.dim, textTransform: "uppercase", letterSpacing: "0.05em",
                        whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {showManualAdd && (
                    <ManualAddRow onAdd={addManual} />
                  )}
                  {filtered.map((item, i) => (
                    <InteractionRow
                      key={item._id || i}
                      item={item}
                      index={allInteractions.indexOf(item)}
                      onChange={updateInteraction}
                      onRemove={removeInteraction}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div style={{ padding: "12px 20px", borderTop: `1px solid ${T.border}`,
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>
                IGNORE zone entries are not saved by default — tick "incl. IGNORE" above to include them.
              </div>
              <Btn onClick={handleSave} disabled={saving || saveableCount === 0}>
                {saving ? "Saving…" : `💾 Save ${saveableCount}`}
              </Btn>
            </div>
              </div>
            )}

            {/* Empty state */}
            {!parsing && screenshots.length === 0 && allInteractions.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 0", color: T.dim }}>
                <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>📱</div>
                <div style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 500 }}>
                  Drop screenshots above — or paste comment text directly
                </div>
                <div style={{ fontFamily: sans, fontSize: F.xs, marginTop: 8, lineHeight: 1.6 }}>
                  Screenshots: Activity feed · Post likers · Follower lists · Comment sections<br />
                  Paste text: Copy comments from Buffer or Instagram
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
