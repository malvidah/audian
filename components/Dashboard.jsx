"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";

// ─── Theme ───────────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg: "#141412", surface: "#1C1B19", card: "#222120",
    well: "#1A1918", border: "#2C2A28", border2: "#383532",
    text: "#D8CEC2", muted: "#6E6860", dim: "#363230",
    accent: "#D08828", green: "#4A9A68", blue: "#4878A8",
    purple: "#886088", red: "#B04840",
    shadow: "0 1px 3px rgba(0,0,0,0.5),0 4px 16px rgba(0,0,0,0.3)",
    shadowSm: "0 1px 3px rgba(0,0,0,0.35)",
    chartGrid: "#2C2A28",
  },
  light: {
    bg: "#D4CCB8", surface: "#EAE3D6", card: "#EAE3D6",
    well: "#CBBFB0", border: "#D4CCBE", border2: "#BEB6A8",
    text: "#4A3C2E", muted: "#887870", dim: "#ACA49A",
    accent: "#887018", green: "#38684A", blue: "#386088",
    purple: "#604888", red: "#843830",
    shadow: "0 1px 2px rgba(36,24,12,0.08)",
    shadowSm: "0 1px 2px rgba(36,24,12,0.06)",
    chartGrid: "#C8C0B0",
  },
};

let C = THEMES.dark;
const serif = "Georgia,'Times New Roman',serif";
const mono  = "'SF Mono','Fira Code',ui-monospace,monospace";
const F     = { xl: 32, lg: 20, md: 15, sm: 12, xs: 10 };

const PLAT_COLORS = {
  youtube: "#B04840", x: "#D8CEC2", instagram: "#886088", linkedin: "#4878A8",
};

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
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return "just now";
}

function deltaVal(current, previous) {
  if (!previous || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: "14px 16px", boxShadow: C.shadowSm, ...style }}>
      {children}
    </div>
  );
}

function SecHead({ label, count, open, onToggle, accent, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${C.border}` }}>
      <button onClick={onToggle} style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: "14px 0 10px" }}>
        <span style={{ fontFamily: mono, fontSize: F.sm, letterSpacing: "0.12em", color: accent || C.accent, textTransform: "uppercase", fontWeight: 600 }}>{label}</span>
        {count !== undefined && <span style={{ fontFamily: mono, fontSize: F.sm, color: C.muted, background: C.well, padding: "1px 7px", borderRadius: 3 }}>{count}</span>}
        <span style={{ marginLeft: "auto", fontFamily: mono, fontSize: F.sm, color: C.muted, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
      </button>
      {action && <div style={{ paddingBottom: 10, paddingLeft: 12 }}>{action}</div>}
    </div>
  );
}

function Dot({ platform }) {
  return <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: PLAT_COLORS[platform?.toLowerCase()] || C.muted, marginRight: 5, verticalAlign: "middle" }} />;
}

function DeltaBadge({ value }) {
  if (value === null || value === undefined) return null;
  const up = value >= 0;
  return <span style={{ fontFamily: mono, fontSize: F.xs, color: up ? C.green : C.red, marginLeft: 6 }}>{up ? "▲" : "▼"} {Math.abs(value).toFixed(1)}%</span>;
}

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
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "40px 48px", maxWidth: 380, width: "100%", boxShadow: C.shadow }}>
        <div style={{ fontFamily: serif, fontSize: 28, color: C.text, letterSpacing: "-0.02em", marginBottom: 6 }}>Audian</div>
        <div style={{ fontFamily: mono, fontSize: F.sm, color: C.muted, letterSpacing: "0.04em", marginBottom: 32 }}>SOCIAL INTELLIGENCE</div>
        {sent ? <div style={{ fontSize: F.md, color: C.green, fontFamily: mono }}>Check your email — magic link sent.</div> : <>
          <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && go()} style={{ width: "100%", background: C.well, border: `1px solid ${C.border2}`, borderRadius: 4, padding: "10px 12px", color: C.text, fontFamily: mono, fontSize: F.md, outline: "none", boxSizing: "border-box", marginBottom: 12 }} />
          <button onClick={go} disabled={loading} style={{ width: "100%", background: C.accent, border: "none", borderRadius: 4, padding: "10px 12px", color: C.bg, fontFamily: mono, fontSize: F.sm, fontWeight: 700, letterSpacing: "0.08em", cursor: "pointer", textTransform: "uppercase" }}>{loading ? "SENDING..." : "SIGN IN →"}</button>
        </>}
      </div>
    </div>
  );
}

function KPICard({ label, value, prev, color, selected, onClick }) {
  const d = deltaVal(value, prev);
  return (
    <button onClick={onClick} style={{ flex: 1, minWidth: 120, background: selected ? (color + "18") : C.card, border: `1px solid ${selected ? color + "55" : C.border}`, borderRadius: 6, padding: "14px 16px", cursor: "pointer", textAlign: "left", boxShadow: C.shadowSm }}>
      <div style={{ fontFamily: mono, fontSize: F.xs, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontFamily: mono, fontSize: 28, color: selected ? color : C.text, fontWeight: 700, letterSpacing: "-0.02em" }}>{fmt(value)}</span>
        {d !== null && <DeltaBadge value={d} />}
      </div>
    </button>
  );
}

function MetricsChart({ allMetrics, activeMetric, activePlatform }) {
  const metricExtract = {
    followers: m => m.followers || 0,
    impressions: m => m.metadata?.impressions || (m.platform === "youtube" ? m.total_views : 0) || 0,
    reach: m => m.metadata?.reach || 0,
    likes: m => m.metadata?.total_likes || 0,
    comments: m => m.metadata?.total_comments || 0,
  };

  const extract = metricExtract[activeMetric] || metricExtract.followers;
  const filtered = allMetrics.filter(m => activePlatform === "All" || m.platform === activePlatform)
    .sort((a, b) => new Date(a.snapshot_at) - new Date(b.snapshot_at));

  const platforms = [...new Set(filtered.map(m => m.platform))];

  // Group by date
  const grouped = {};
  filtered.forEach(m => {
    const key = fmtDate(m.snapshot_at);
    if (!grouped[key]) grouped[key] = { date: key };
    grouped[key][m.platform] = (grouped[key][m.platform] || 0) + extract(m);
  });
  const chartData = Object.values(grouped);

  if (chartData.length === 0) {
    return <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontFamily: mono, fontSize: F.sm, color: C.muted }}>No data yet — sync a platform.</span></div>;
  }
  if (chartData.length === 1) {
    const val = platforms.reduce((s, p) => s + (chartData[0][p] || 0), 0);
    return (
      <div style={{ height: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <div style={{ fontFamily: mono, fontSize: 36, color: C.text, fontWeight: 700 }}>{fmt(val)}</div>
        <div style={{ fontFamily: mono, fontSize: F.xs, color: C.muted, letterSpacing: "0.06em" }}>SYNC REGULARLY TO BUILD TREND HISTORY</div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: C.surface, border: `1px solid ${C.border2}`, borderRadius: 4, padding: "8px 12px" }}>
        <div style={{ fontFamily: mono, fontSize: F.xs, color: C.muted, marginBottom: 4 }}>{label}</div>
        {payload.map(p => <div key={p.dataKey} style={{ fontFamily: mono, fontSize: F.sm, color: p.color }}>{p.dataKey}: {fmt(p.value)}</div>)}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
        <defs>
          {platforms.map(p => (
            <linearGradient key={p} id={`grad_${p}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={PLAT_COLORS[p] || C.accent} stopOpacity={0.35} />
              <stop offset="95%" stopColor={PLAT_COLORS[p] || C.accent} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={C.chartGrid} vertical={false} />
        <XAxis dataKey="date" tick={{ fontFamily: mono, fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontFamily: mono, fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} tickFormatter={fmt} width={42} />
        <Tooltip content={<CustomTooltip />} />
        {platforms.map(p => (
          <Area key={p} type="monotone" dataKey={p} stroke={PLAT_COLORS[p] || C.accent} strokeWidth={2} fill={`url(#grad_${p})`} dot={false} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

function OutlierContent({ latestMetrics, activePlatform }) {
  const allPosts = [];
  latestMetrics.forEach(m => {
    if (activePlatform !== "All" && m.platform !== activePlatform) return;
    if (m.videos) {
      m.videos.forEach(v => allPosts.push({ platform: "youtube", title: v.title?.slice(0, 80), engagement: (v.likes || 0) + (v.comments || 0), likes: v.likes || 0, comments: v.comments || 0, views: v.views || 0, url: `https://youtube.com/watch?v=${v.id}` }));
    }
    if (m.metadata?.recent_posts) {
      m.metadata.recent_posts.forEach(p => allPosts.push({ platform: "instagram", title: p.caption?.slice(0, 80) || `[${p.type || "post"}]`, engagement: (p.likes || 0) + (p.comments || 0), likes: p.likes || 0, comments: p.comments || 0, url: p.permalink }));
    }
  });

  if (allPosts.length < 3) return <div style={{ fontFamily: mono, fontSize: F.sm, color: C.muted, padding: "20px 0" }}>Not enough posts to detect outliers — sync YouTube or Instagram.</div>;

  const avg = allPosts.reduce((s, p) => s + p.engagement, 0) / allPosts.length;
  const over  = allPosts.filter(p => p.engagement > avg * 1.5).sort((a, b) => b.engagement - a.engagement).slice(0, 4);
  const under = allPosts.filter(p => p.engagement < avg * 0.5 && p.engagement >= 0).sort((a, b) => a.engagement - b.engagement).slice(0, 4);

  const Row = ({ post, isOver }) => (
    <div style={{ background: C.well, border: `1px solid ${isOver ? C.green + "33" : C.border}`, borderRadius: 5, padding: "10px 12px", marginBottom: 6 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 6 }}>
        <Dot platform={post.platform} />
        <div style={{ flex: 1, fontFamily: serif, fontSize: F.sm, color: C.text, lineHeight: 1.4 }}>
          {post.url ? <a href={post.url} target="_blank" rel="noreferrer" style={{ color: C.text, textDecoration: "none" }}>{post.title || "Untitled"}</a> : (post.title || "Untitled")}
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <span style={{ fontFamily: mono, fontSize: F.xs, color: C.muted }}>♥ {fmt(post.likes)}</span>
        <span style={{ fontFamily: mono, fontSize: F.xs, color: C.muted }}>✦ {fmt(post.comments)}</span>
        {post.views > 0 && <span style={{ fontFamily: mono, fontSize: F.xs, color: C.muted }}>▶ {fmt(post.views)}</span>}
        <span style={{ marginLeft: "auto", fontFamily: mono, fontSize: F.xs, color: isOver ? C.green : C.red, fontWeight: 600 }}>
          {isOver ? "+" : ""}{avg > 0 ? Math.round((post.engagement / avg - 1) * 100) : 0}% vs avg
        </span>
      </div>
    </div>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, paddingTop: 12 }}>
      <div>
        <div style={{ fontFamily: mono, fontSize: F.xs, color: C.green, letterSpacing: "0.1em", marginBottom: 10, textTransform: "uppercase" }}>▲ Overperforming ({over.length})</div>
        {over.length === 0 ? <div style={{ fontFamily: mono, fontSize: F.sm, color: C.muted }}>No outliers above 1.5× average.</div> : over.map((p, i) => <Row key={i} post={p} isOver={true} />)}
      </div>
      <div>
        <div style={{ fontFamily: mono, fontSize: F.xs, color: C.muted, letterSpacing: "0.1em", marginBottom: 10, textTransform: "uppercase" }}>▼ Underperforming ({under.length})</div>
        {under.length === 0 ? <div style={{ fontFamily: mono, fontSize: F.sm, color: C.muted }}>No outliers below 0.5× average.</div> : under.map((p, i) => <Row key={i} post={p} isOver={false} />)}
      </div>
    </div>
  );
}

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

  const action = (
    <button onClick={load} disabled={loading} style={{ fontFamily: mono, fontSize: F.sm, padding: "3px 12px", borderRadius: 3, border: `1px solid ${C.purple}66`, background: C.purple + "18", color: C.purple, cursor: loading ? "default" : "pointer", letterSpacing: "0.06em" }}>
      {loading ? "Analyzing…" : stories ? "↻ Refresh" : "✦ Generate"}
    </button>
  );

  return (
    <section style={{ marginBottom: 28 }}>
      <SecHead label="Audience Stories" open={open} onToggle={onToggle} accent={C.purple} action={action} />
      {open && (
        <div style={{ paddingTop: 12 }}>
          {!stories && !loading && <div style={{ fontFamily: mono, fontSize: F.sm, color: C.muted, padding: "16px 0" }}>Click Generate to surface themes from your audience comments — what they loved, debated, and found valuable.</div>}
          {loading && <div style={{ fontFamily: mono, fontSize: F.sm, color: C.muted, padding: "16px 0" }}>Reading your audience…</div>}
          {stories?.length === 0 && !loading && <div style={{ fontFamily: mono, fontSize: F.sm, color: C.muted, padding: "16px 0" }}>Not enough comments yet — sync platforms to build your comment history.</div>}
          {stories?.map((story, i) => (
            <Card key={i} style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: mono, fontSize: F.xs, color: C.purple, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{story.theme}</div>
              <div style={{ fontFamily: serif, fontSize: F.lg, color: C.text, lineHeight: 1.4, marginBottom: 8, fontStyle: "italic" }}>"{story.headline}"</div>
              <div style={{ fontFamily: serif, fontSize: F.sm, color: C.muted, lineHeight: 1.6, marginBottom: 14 }}>{story.insight}</div>
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                {story.evidence?.map((c, j) => (
                  <div key={j} style={{ background: C.well, borderRadius: 4, padding: "8px 10px" }}>
                    <span style={{ fontFamily: mono, fontSize: F.xs, color: C.muted }}><Dot platform={c.platform} />{c.author_name} · </span>
                    <span style={{ fontFamily: serif, fontSize: F.sm, color: C.text, lineHeight: 1.5 }}>"{c.content}"</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

function AudianAIBar() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function ask() {
    if (!question.trim() || loading) return;
    const q = question.trim();
    setQuestion("");
    setMessages(m => [...m, { role: "user", content: q }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: q }) });
      const data = await res.json();
      setMessages(m => [...m, { role: "assistant", content: data.answer || data.error || "No response." }]);
    } catch { setMessages(m => [...m, { role: "assistant", content: "Something went wrong." }]); }
    setLoading(false);
  }

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200, background: C.surface, borderTop: `1px solid ${C.border}`, boxShadow: "0 -4px 24px rgba(0,0,0,0.4)" }}>
      {open && (
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "12px 24px 0", height: 280, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingBottom: 8 }}>
            {messages.length === 0 && <div style={{ fontFamily: mono, fontSize: F.sm, color: C.muted, padding: "16px 0" }}>Ask anything about your social data — performance, trends, what's working, what to try next.</div>}
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "80%", background: m.role === "user" ? C.accent + "22" : C.well, border: `1px solid ${m.role === "user" ? C.accent + "44" : C.border}`, borderRadius: 5, padding: "8px 12px", fontFamily: m.role === "user" ? mono : serif, fontSize: F.sm, color: C.text, lineHeight: 1.6 }}>
                {m.content}
              </div>
            ))}
            {loading && <div style={{ alignSelf: "flex-start", fontFamily: mono, fontSize: F.sm, color: C.muted }}>Thinking…</div>}
            <div ref={endRef} />
          </div>
        </div>
      )}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "10px 24px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: mono, fontSize: F.xs, color: C.accent, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>✦ AUDIAN AI</span>
        <input ref={inputRef} value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === "Enter" && ask()} onFocus={() => setOpen(true)} placeholder={open ? "Ask about your data…" : "Ask Audian anything about your social performance…"} style={{ flex: 1, background: "none", border: `1px solid ${C.border2}`, borderRadius: 4, padding: "7px 12px", color: C.text, fontFamily: mono, fontSize: F.sm, outline: "none" }} />
        {open && <button onClick={ask} disabled={loading || !question.trim()} style={{ fontFamily: mono, fontSize: F.sm, padding: "6px 14px", borderRadius: 3, border: `1px solid ${C.accent}66`, background: C.accent + "18", color: C.accent, cursor: "pointer" }}>→</button>}
        <button onClick={() => setOpen(o => !o)} style={{ fontFamily: mono, fontSize: F.sm, color: C.muted, background: "none", border: `1px solid ${C.border}`, borderRadius: 3, padding: "6px 10px", cursor: "pointer" }}>{open ? "✕" : "▲"}</button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [supabase] = useState(() => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
  const [session, setSession]         = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [theme, setTheme]             = useState("dark");
  const [connections, setConnections] = useState([]);
  const [metrics, setMetrics]         = useState([]);
  const [allMetrics, setAllMetrics]   = useState([]);
  const [comments, setComments]       = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [syncing, setSyncing]         = useState(false);
  const [syncMsg, setSyncMsg]         = useState("");
  const [lastSynced, setLastSynced]   = useState(null);
  const [urlMsg, setUrlMsg]           = useState("");
  const [platform, setPlatform]       = useState("All");
  const [activeMetric, setActiveMetric] = useState("followers");
  const [open, setOpen]               = useState({ metrics: true, outliers: true, channels: true, stories: true, interactions: true, comments: true, videos: false });

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    setTheme(saved); C = THEMES[saved] || THEMES.dark;
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next); C = THEMES[next];
    localStorage.setItem("theme", next);
    window.location.reload();
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setAuthLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const conn = params.get("connected"), err = params.get("error");
    if (conn) setUrlMsg(`✓ ${conn} connected successfully`);
    if (err)  setUrlMsg(`✗ ${err.replace(/_/g, " ")}`);
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

  useEffect(() => { loadData(); }, [loadData]);

  async function triggerSync(p) {
    setSyncing(true); setSyncMsg("");
    try {
      const res = await fetch(`/api/sync/${p}`, { method: "POST" });
      const data = await res.json();
      if (data.error) setSyncMsg(`✗ ${data.error}`);
      else { setSyncMsg(`✓ ${p} synced — ${data.videos_synced || data.tweets_synced || data.posts || 0} posts, ${data.comments_synced || data.comments || 0} comments`); await loadData(); }
    } catch (e) { setSyncMsg(`✗ ${e.message}`); }
    setSyncing(false);
  }

  const tog = k => setOpen(s => ({ ...s, [k]: !s[k] }));

  const latestPerPlatform = {};
  metrics.forEach(m => { if (!latestPerPlatform[m.platform]) latestPerPlatform[m.platform] = m; });

  const prevPerPlatform = {};
  const seen = {};
  metrics.forEach(m => {
    if (!seen[m.platform]) { seen[m.platform] = true; return; }
    if (!prevPerPlatform[m.platform]) prevPerPlatform[m.platform] = m;
  });

  const kpis = { followers: { v: 0, p: 0 }, impressions: { v: 0, p: 0 }, reach: { v: 0, p: 0 }, likes: { v: 0, p: 0 }, comments: { v: 0, p: 0 } };
  const toAgg = platform === "All" ? Object.keys(latestPerPlatform) : [platform].filter(p => latestPerPlatform[p]);
  toAgg.forEach(p => {
    const m = latestPerPlatform[p], prev = prevPerPlatform[p];
    if (!m) return;
    kpis.followers.v   += m.followers || 0;    kpis.followers.p   += prev?.followers || 0;
    kpis.impressions.v += m.metadata?.impressions || (p === "youtube" ? m.total_views : 0) || 0;
    kpis.impressions.p += prev?.metadata?.impressions || (p === "youtube" ? prev?.total_views : 0) || 0;
    kpis.reach.v       += m.metadata?.reach || 0;          kpis.reach.p += prev?.metadata?.reach || 0;
    kpis.likes.v       += m.metadata?.total_likes || 0;    kpis.likes.p += prev?.metadata?.total_likes || 0;
    kpis.comments.v    += m.metadata?.total_comments || 0; kpis.comments.p += prev?.metadata?.total_comments || 0;
  });

  const ytVideos = latestPerPlatform["youtube"]?.videos || [];
  const filteredComments = comments.filter(c => platform === "All" || c.platform === platform);
  const filteredInteractions = interactions.filter(i => platform === "All" || i.platform === platform);

  const KPIS_DEF = [
    { key: "followers",   label: "Followers",   color: C.accent },
    { key: "impressions", label: "Impressions", color: C.blue },
    { key: "reach",       label: "Reach",       color: C.purple },
    { key: "likes",       label: "Likes",       color: C.green },
    { key: "comments",    label: "Comments",    color: C.red },
  ];

  const PLATS = ["All", "youtube", "x", "instagram", "linkedin"];
  const col = { fontFamily: mono, fontSize: F.sm, color: C.muted, letterSpacing: "0.06em" };

  if (authLoading) return <div style={{ minHeight: "100vh", background: C.bg }} />;
  if (!session) return <SignIn supabase={supabase} />;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, paddingBottom: 120 }}>
      {/* Nav */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 24px", display: "flex", alignItems: "center", height: 48, position: "sticky", top: 0, zIndex: 100 }}>
        <span style={{ fontFamily: serif, fontSize: 18, color: C.text, letterSpacing: "-0.01em" }}>Audian</span>
        <span style={{ fontFamily: mono, fontSize: F.sm, color: C.muted, marginLeft: 10, letterSpacing: "0.08em" }}>— SOCIAL INTELLIGENCE</span>
        <div style={{ marginLeft: 24, display: "flex", gap: 4 }}>
          {PLATS.map(p => (
            <button key={p} onClick={() => setPlatform(p)} style={{ background: platform === p ? C.accent + "22" : "none", border: `1px solid ${platform === p ? C.accent + "66" : C.border}`, borderRadius: 3, padding: "3px 10px", cursor: "pointer", fontFamily: mono, fontSize: F.sm, color: platform === p ? C.accent : C.muted, letterSpacing: "0.06em" }}>
              {p === "All" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          {lastSynced && <span style={{ fontFamily: mono, fontSize: F.sm, color: C.dim }}>synced {timeAgo(lastSynced)}</span>}
          <button onClick={toggleTheme} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 3, padding: "3px 8px", cursor: "pointer", fontFamily: mono, fontSize: F.sm, color: C.muted }}>{theme === "dark" ? "☀" : "◑"}</button>
          <button onClick={() => supabase.auth.signOut()} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 3, padding: "3px 8px", cursor: "pointer", fontFamily: mono, fontSize: F.sm, color: C.muted }}>OUT</button>
        </div>
      </div>

      {urlMsg && <div style={{ background: urlMsg.startsWith("✓") ? C.green + "18" : C.red + "18", border: `1px solid ${urlMsg.startsWith("✓") ? C.green + "44" : C.red + "44"}`, borderRadius: 6, padding: "10px 24px", margin: "16px 24px 0", fontFamily: mono, fontSize: F.sm, color: urlMsg.startsWith("✓") ? C.green : C.red }}>{urlMsg}</div>}
      {syncMsg && <div style={{ background: syncMsg.startsWith("✓") ? C.green + "18" : C.red + "18", border: `1px solid ${syncMsg.startsWith("✓") ? C.green + "44" : C.red + "44"}`, borderRadius: 6, padding: "10px 24px", margin: "8px 24px 0", fontFamily: mono, fontSize: F.sm, color: syncMsg.startsWith("✓") ? C.green : C.red }}>{syncMsg}</div>}

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 24px 0" }}>

        {/* Engagement Overview */}
        <section style={{ marginBottom: 28 }}>
          <SecHead label="Engagement Overview" open={open.metrics} onToggle={() => tog("metrics")} accent={C.green} />
          {open.metrics && (
            <div style={{ paddingTop: 12 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                {KPIS_DEF.map(k => (
                  <KPICard key={k.key} label={k.label} value={kpis[k.key].v} prev={kpis[k.key].p || null} color={k.color} selected={activeMetric === k.key} onClick={() => setActiveMetric(k.key)} />
                ))}
              </div>
              <Card style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontFamily: mono, fontSize: F.xs, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>{activeMetric} over time</span>
                  <span style={{ fontFamily: mono, fontSize: F.xs, color: C.dim }}>{allMetrics.length} snapshot{allMetrics.length !== 1 ? "s" : ""}</span>
                </div>
                <MetricsChart allMetrics={allMetrics} activeMetric={activeMetric} activePlatform={platform} />
              </Card>
            </div>
          )}
        </section>

        {/* Content Outliers */}
        <section style={{ marginBottom: 28 }}>
          <SecHead label="Content Outliers" open={open.outliers} onToggle={() => tog("outliers")} accent={C.accent} />
          {open.outliers && <OutlierContent latestMetrics={Object.values(latestPerPlatform)} activePlatform={platform} />}
        </section>

        {/* Audience Stories */}
        <StoriesSection open={open.stories} onToggle={() => tog("stories")} />

        {/* Connected Channels */}
        <section style={{ marginBottom: 28 }}>
          <SecHead label="Connected Channels" open={open.channels} onToggle={() => tog("channels")} accent={C.muted} />
          {open.channels && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, paddingTop: 12 }}>
              {[{ id: "youtube", label: "YouTube", color: "#B04840" }, { id: "x", label: "X / Twitter", color: "#D8CEC2" }, { id: "instagram", label: "Instagram", color: "#886088" }, { id: "linkedin", label: "LinkedIn", color: "#4878A8" }].map(({ id, label, color }) => {
                const conn = connections.find(c => c.platform === id);
                return (
                  <Card key={id} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: mono, fontSize: F.sm, color, letterSpacing: "0.08em", marginBottom: 8, fontWeight: 600 }}>{label}</div>
                    {conn ? <>
                      <div style={{ fontFamily: mono, fontSize: F.sm, color: C.green, marginBottom: 4 }}>✓ Connected</div>
                      {(conn.channel_name || conn.username) && <div style={{ fontFamily: mono, fontSize: F.sm, color: C.muted, marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{conn.channel_name || `@${conn.username}`}</div>}
                      {(conn.subscriber_count > 0 || conn.metadata?.followers_count > 0) && <div style={{ fontFamily: mono, fontSize: F.sm, color: C.text, marginBottom: 10 }}>{fmt(conn.subscriber_count || conn.metadata?.followers_count)} followers</div>}
                      {(id === "youtube" || id === "x" || id === "instagram") && <button onClick={() => triggerSync(id)} disabled={syncing} style={{ fontFamily: mono, fontSize: F.sm, padding: "4px 12px", borderRadius: 3, border: `1px solid ${C.accent}66`, background: C.accent + "18", color: C.accent, cursor: syncing ? "default" : "pointer", letterSpacing: "0.06em" }}>{syncing ? "Syncing..." : "↻ Sync Now"}</button>}
                    </> : <a href={`/api/auth/${id}`} style={{ display: "block", marginTop: 8, padding: "6px 12px", background: C.well, border: `1px solid ${C.border2}`, borderRadius: 3, fontFamily: mono, fontSize: F.sm, color: C.muted, textDecoration: "none", letterSpacing: "0.06em" }}>Connect →</a>}
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent Videos */}
        {ytVideos.length > 0 && (platform === "All" || platform === "youtube") && (
          <section style={{ marginBottom: 28 }}>
            <SecHead label="Recent Videos" count={ytVideos.length} open={open.videos} onToggle={() => tog("videos")} accent="#B04840" />
            {open.videos && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 8, paddingTop: 12 }}>
                {ytVideos.slice(0, 8).map(v => (
                  <Card key={v.id}>
                    <div style={{ fontFamily: serif, fontSize: F.md, color: C.text, marginBottom: 8, lineHeight: 1.4 }}>{v.title}</div>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      {[["VIEWS", v.views], ["LIKES", v.likes], ["COMMENTS", v.comments]].map(([l, val]) => (
                        <div key={l} style={{ display: "flex", gap: 4 }}><span style={col}>{l}</span><span style={{ fontFamily: mono, fontSize: F.sm, color: C.text }}>{fmt(val)}</span></div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Influential Interactions */}
        <section style={{ marginBottom: 28 }}>
          <SecHead label="Influential Interactions" count={filteredInteractions.length} open={open.interactions} onToggle={() => tog("interactions")} accent={C.accent} />
          {open.interactions && (
            <div style={{ paddingTop: 12 }}>
              {filteredInteractions.length === 0
                ? <div style={{ fontFamily: mono, fontSize: F.sm, color: C.muted, padding: "20px 0" }}>No interactions yet — these populate as the scoring engine processes your synced data.</div>
                : filteredInteractions.map(item => (
                  <Card key={item.id}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.well, border: `1px solid ${C.border2}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: mono, fontSize: F.md, color: C.accent, flexShrink: 0 }}>{(item.name || item.handle || "?")[0].toUpperCase()}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{ fontFamily: mono, fontSize: F.md, color: C.text, fontWeight: 600 }}>{item.name || item.handle}</span>
                          <Dot platform={item.platform} />
                          <span style={{ marginLeft: "auto", fontFamily: mono, fontSize: F.sm, color: C.dim }}>{timeAgo(item.interacted_at)}</span>
                        </div>
                        {item.content && <div style={{ fontFamily: serif, fontSize: F.md, color: C.text, lineHeight: 1.55 }}>"{item.content}"</div>}
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </section>

        {/* Notable Comments */}
        <section style={{ marginBottom: 28 }}>
          <SecHead label="Notable Comments" count={filteredComments.length} open={open.comments} onToggle={() => tog("comments")} accent={C.blue} />
          {open.comments && (
            <div style={{ paddingTop: 12 }}>
              {filteredComments.length === 0
                ? <div style={{ fontFamily: mono, fontSize: F.sm, color: C.muted, padding: "20px 0" }}>No comments yet — sync YouTube or Instagram.</div>
                : filteredComments.map(c => (
                  <Card key={c.id}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                      <Dot platform={c.platform} />
                      <span style={{ fontFamily: mono, fontSize: F.md, color: C.text, fontWeight: 600 }}>{c.author_name}</span>
                      {c.video_title && <span style={{ fontFamily: mono, fontSize: F.sm, color: C.muted }}>on "{c.video_title?.slice(0, 40)}{c.video_title?.length > 40 ? "…" : ""}"</span>}
                      <span style={{ marginLeft: "auto", fontFamily: mono, fontSize: F.sm, color: C.dim }}>{timeAgo(c.published_at)}</span>
                    </div>
                    <div style={{ fontFamily: serif, fontSize: F.md, color: C.text, lineHeight: 1.6 }}>"{c.content}"</div>
                    <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                      {c.likes > 0 && <div style={{ display: "flex", gap: 4 }}><span style={col}>LIKES</span><span style={{ fontFamily: mono, fontSize: F.sm, color: C.text }}>{fmt(c.likes)}</span></div>}
                      {c.reply_count > 0 && <div style={{ display: "flex", gap: 4 }}><span style={col}>REPLIES</span><span style={{ fontFamily: mono, fontSize: F.sm, color: C.text }}>{c.reply_count}</span></div>}
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </section>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: mono, fontSize: F.sm, color: C.dim }}>audian.app</span>
          <span style={{ fontFamily: mono, fontSize: F.sm, color: C.dim }}>{connections.length} platform{connections.length !== 1 ? "s" : ""} connected</span>
        </div>
      </div>

      <AudianAIBar />
    </div>
  );
}
