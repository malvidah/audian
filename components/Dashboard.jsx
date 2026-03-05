"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const THEMES = {
  dark: {
    bg:"#141412", surface:"#232220", card:"#232220", well:"#1A1918",
    border:"#2C2A28", border2:"#383532", text:"#D8CEC2", muted:"#6E6860",
    dim:"#363230", accent:"#D08828", green:"#4A9A68", blue:"#4878A8",
    purple:"#886088", red:"#B04840", yellow:"#BBB828",
    shadow:"0 1px 3px rgba(0,0,0,0.5),0 4px 16px rgba(0,0,0,0.3)",
    shadowSm:"0 1px 3px rgba(0,0,0,0.35)",
  },
  light: {
    bg:"#D4CCB8", surface:"#EAE3D6", card:"#EAE3D6", well:"#CBBFB0",
    border:"#D4CCBE", border2:"#BEB6A8", text:"#4A3C2E", muted:"#887870",
    dim:"#ACA49A", accent:"#887018", green:"#38684A", blue:"#386088",
    purple:"#604888", red:"#843830", yellow:"#806818",
    shadow:"0 1px 2px rgba(36,24,12,0.08),0 3px 10px rgba(36,24,12,0.05)",
    shadowSm:"0 1px 2px rgba(36,24,12,0.06)",
  },
};

let C = THEMES.dark;
const serif = "Georgia, 'Times New Roman', serif";
const mono = "'SF Mono', 'Fira Code', ui-monospace, monospace";
const F = { lg: 18, md: 15, sm: 12 };

function fmt(n) {
  if (!n) return "—";
  if (n >= 1000000) return (n/1000000).toFixed(1)+"M";
  if (n >= 1000) return (n/1000).toFixed(1)+"K";
  return String(n);
}

function Card({ children, style={} }) {
  return <div style={{ background:C.card, border:"1px solid "+C.border, borderRadius:6, padding:"14px 16px", marginBottom:8, boxShadow:C.shadowSm, ...style }}>{children}</div>;
}

function SectionHeader({ label, count, open, onToggle, accent }) {
  return (
    <button onClick={onToggle} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, background:"none", border:"none", cursor:"pointer", padding:"14px 0 10px", borderBottom:"1px solid "+C.border }}>
      <span style={{ fontFamily:mono, fontSize:F.sm, letterSpacing:"0.12em", color:accent||C.accent, textTransform:"uppercase", fontWeight:600 }}>{label}</span>
      {count !== undefined && <span style={{ fontFamily:mono, fontSize:F.sm, color:C.muted, background:C.well, padding:"1px 7px", borderRadius:3 }}>{count}</span>}
      <span style={{ marginLeft:"auto", fontFamily:mono, fontSize:F.sm, color:C.muted, transform:open?"rotate(180deg)":"none", transition:"transform 0.2s" }}>▾</span>
    </button>
  );
}

function PlatformDot({ platform }) {
  const colors = { youtube:"#B04840", instagram:"#886088", x:"#D8CEC2", linkedin:"#4878A8", tiktok:"#4A9A68" };
  return <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:colors[platform?.toLowerCase()]||C.muted, marginRight:6, verticalAlign:"middle" }} />;
}

function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null;
  const w = 80, h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ display:"block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function SignIn({ supabase }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    if (!error) setSent(true);
    setLoading(false);
  }

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:C.card, border:"1px solid "+C.border, borderRadius:8, padding:"40px 48px", maxWidth:380, width:"100%", boxShadow:C.shadow }}>
        <div style={{ marginBottom:32 }}>
          <div style={{ fontFamily:serif, fontSize:28, color:C.text, letterSpacing:"-0.02em", marginBottom:6 }}>Audian</div>
          <div style={{ fontFamily:mono, fontSize:F.sm, color:C.muted, letterSpacing:"0.04em" }}>SOCIAL INTELLIGENCE</div>
        </div>
        {sent ? (
          <div style={{ fontSize:F.md, color:C.green, lineHeight:1.6, fontFamily:mono }}>Check your email — magic link sent.</div>
        ) : (
          <>
            <input type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSignIn()} style={{ width:"100%", background:C.well, border:"1px solid "+C.border2, borderRadius:4, padding:"10px 12px", color:C.text, fontFamily:mono, fontSize:F.md, outline:"none", boxSizing:"border-box", marginBottom:12 }} />
            <button onClick={handleSignIn} disabled={loading} style={{ width:"100%", background:C.accent, border:"none", borderRadius:4, padding:"10px 12px", color:C.bg, fontFamily:mono, fontSize:F.sm, fontWeight:700, letterSpacing:"0.08em", cursor:"pointer", textTransform:"uppercase" }}>{loading?"SENDING...":"SIGN IN →"}</button>
          </>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [theme, setTheme] = useState("dark");

  // Data state
  const [connections, setConnections] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [comments, setComments] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState(null);
  const [insight, setInsight] = useState(null);
  const [generatingInsight, setGeneratingInsight] = useState(false);

  // UI state
  const [openSections, setOpenSections] = useState({ channels:true, metrics:true, comments:true, insight:true });
  const [dateRange, setDateRange] = useState("30d");

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
  }, []);

  useEffect(() => {
    if (!session) return;
    loadData();
    // Check for just-connected platform
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected")) {
      setSyncMsg("✓ " + params.get("connected") + " connected! Syncing data...");
      handleSync();
      window.history.replaceState({}, "", "/");
    }
  }, [session]);

  async function loadData() {
    const { data: conns } = await supabase.from("platform_connections").select("*");
    setConnections(conns || []);

    const { data: met } = await supabase.from("platform_metrics").select("*").order("snapshot_at", { ascending: false }).limit(50);
    setMetrics(met || []);

    const { data: comms } = await supabase.from("platform_comments").select("*").order("likes", { ascending: false }).limit(20);
    setComments(comms || []);
  }

  async function handleSync() {
    setSyncing(true);
    setSyncMsg("Syncing YouTube...");
    try {
      const res = await fetch("/api/sync/youtube", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSyncMsg(`✓ Synced ${data.channel} — ${fmt(data.subscribers)} subscribers, ${data.videos_synced} videos, ${data.comments_synced} comments`);
        await loadData();
      } else {
        setSyncMsg("⚠ Sync error: " + (data.error || "unknown"));
      }
    } catch(e) {
      setSyncMsg("⚠ Sync failed: " + e.message);
    }
    setSyncing(false);
  }

  async function generateInsight() {
    setGeneratingInsight(true);
    setInsight(null);
    try {
      const latestMetric = metrics[0];
      const topComments = comments.slice(0, 5).map(c => c.content).join("\n---\n");
      const prompt = `You are a social media analyst for Big Think, a media company focused on big ideas, science, philosophy, and culture.

Here is recent YouTube data:
- Channel: ${connections.find(c=>c.platform==="youtube")?.channel_name || "Big Think"}
- Subscribers: ${fmt(connections.find(c=>c.platform==="youtube")?.subscriber_count)}
- Recent videos: ${latestMetric?.videos?.slice(0,3).map(v => `"${v.title}" — ${fmt(v.views)} views, ${fmt(v.likes)} likes`).join("; ") || "No data"}

Top comments from viewers:
${topComments || "No comments yet"}

Write a concise 2-3 sentence monthly insight that identifies patterns, notable interactions, and what content is resonating. Sound like a smart analyst, not a bot. Focus on what's interesting and actionable.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const d = await res.json();
      setInsight(d.content?.[0]?.text || "Could not generate insight.");
    } catch(e) {
      setInsight("Error generating insight: " + e.message);
    }
    setGeneratingInsight(false);
  }

  function toggleSection(key) { setOpenSections(s => ({ ...s, [key]: !s[key] })); }

  const ytConnection = connections.find(c => c.platform === "youtube");
  const latestMetrics = metrics[0];
  const col = { fontFamily:mono, fontSize:F.sm, color:C.muted, letterSpacing:"0.06em" };

  if (authLoading) return <div style={{ minHeight:"100vh", background:C.bg }} />;
  if (!session) return <SignIn supabase={supabase} />;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text }}>

      {/* Nav */}
      <div style={{ background:C.surface, borderBottom:"1px solid "+C.border, padding:"0 24px", display:"flex", alignItems:"center", height:48, position:"sticky", top:0, zIndex:100 }}>
        <span style={{ fontFamily:serif, fontSize:18, color:C.text, letterSpacing:"-0.01em" }}>Audian</span>
        <span style={{ fontFamily:mono, fontSize:F.sm, color:C.muted, marginLeft:10, letterSpacing:"0.08em" }}>— SOCIAL INTELLIGENCE</span>
        <div style={{ marginLeft:"auto", display:"flex", gap:8, alignItems:"center" }}>
          <select value={dateRange} onChange={e=>setDateRange(e.target.value)} style={{ background:C.well, border:"1px solid "+C.border2, borderRadius:3, padding:"3px 8px", color:C.muted, fontFamily:mono, fontSize:F.sm, cursor:"pointer", outline:"none" }}>
            {["7d","30d","90d","365d"].map(r=><option key={r} value={r}>{r}</option>)}
          </select>
          <button onClick={handleSync} disabled={syncing} style={{ background:C.accent+"22", border:"1px solid "+C.accent+"44", borderRadius:3, padding:"3px 12px", cursor:"pointer", fontFamily:mono, fontSize:F.sm, color:C.accent, letterSpacing:"0.06em" }}>
            {syncing ? "SYNCING..." : "↻ SYNC"}
          </button>
          <button onClick={toggleTheme} style={{ background:"none", border:"1px solid "+C.border, borderRadius:3, padding:"3px 8px", cursor:"pointer", fontFamily:mono, fontSize:F.sm, color:C.muted }}>{theme==="dark"?"☀":"◑"}</button>
          <button onClick={()=>supabase.auth.signOut()} style={{ background:"none", border:"1px solid "+C.border, borderRadius:3, padding:"3px 8px", cursor:"pointer", fontFamily:mono, fontSize:F.sm, color:C.muted }}>OUT</button>
        </div>
      </div>

      <div style={{ maxWidth:960, margin:"0 auto", padding:"24px 24px 64px" }}>

        {/* Sync message */}
        {syncMsg && (
          <div style={{ background:C.green+"18", border:"1px solid "+C.green+"44", borderRadius:6, padding:"10px 16px", marginBottom:16, fontFamily:mono, fontSize:F.sm, color:C.green }}>
            {syncMsg}
          </div>
        )}

        {/* ── AI Insight ── */}
        <section style={{ marginBottom:24 }}>
          <SectionHeader label="AI Insight" open={openSections.insight} onToggle={()=>toggleSection("insight")} accent={C.accent} />
          {openSections.insight && (
            <div style={{ paddingTop:12 }}>
              <div style={{ background:C.accent+"11", border:"1px solid "+C.accent+"33", borderRadius:6, padding:"16px 20px" }}>
                {insight ? (
                  <div style={{ fontFamily:serif, fontSize:F.lg, color:C.text, lineHeight:1.6 }}>{insight}</div>
                ) : (
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div style={{ fontFamily:serif, fontSize:F.md, color:C.muted, lineHeight:1.5 }}>
                      {metrics.length > 0 ? "Sync complete — generate an AI insight from your data." : "Connect a platform and sync data to generate insights."}
                    </div>
                    {metrics.length > 0 && (
                      <button onClick={generateInsight} disabled={generatingInsight} style={{ background:C.accent, border:"none", borderRadius:4, padding:"8px 16px", color:C.bg, fontFamily:mono, fontSize:F.sm, fontWeight:700, letterSpacing:"0.08em", cursor:"pointer", whiteSpace:"nowrap", marginLeft:16 }}>
                        {generatingInsight ? "GENERATING..." : "✦ GENERATE"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ── Connected Channels ── */}
        <section style={{ marginBottom:24 }}>
          <SectionHeader label="Connected Channels" count={connections.length} open={openSections.channels} onToggle={()=>toggleSection("channels")} accent={C.green} />
          {openSections.channels && (
            <div style={{ paddingTop:12 }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:8, marginBottom:12 }}>
                {connections.map(conn => (
                  <Card key={conn.id}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                      {conn.channel_thumbnail && <img src={conn.channel_thumbnail} alt="" style={{ width:28, height:28, borderRadius:"50%", border:"1px solid "+C.border2 }} />}
                      <div>
                        <div style={{ fontFamily:mono, fontSize:F.sm, color:C.text, fontWeight:600 }}>{conn.channel_name}</div>
                        <div style={{ display:"flex", alignItems:"center" }}>
                          <PlatformDot platform={conn.platform} />
                          <span style={{ fontFamily:mono, fontSize:F.sm, color:C.muted }}>{conn.platform}</span>
                        </div>
                      </div>
                    </div>
                    {conn.subscriber_count > 0 && (
                      <div style={{ display:"flex", justifyContent:"space-between" }}>
                        <span style={col}>SUBSCRIBERS</span>
                        <span style={{ fontFamily:mono, fontSize:F.sm, color:C.green }}>{fmt(conn.subscriber_count)}</span>
                      </div>
                    )}
                  </Card>
                ))}

                {/* Connect buttons for unconnected platforms */}
                {!connections.find(c=>c.platform==="youtube") && (
                  <a href="/api/auth/youtube" style={{ textDecoration:"none" }}>
                    <Card style={{ cursor:"pointer", borderStyle:"dashed", opacity:0.6, display:"flex", alignItems:"center", gap:8 }}>
                      <PlatformDot platform="youtube" />
                      <span style={{ fontFamily:mono, fontSize:F.sm, color:C.muted }}>Connect YouTube</span>
                    </Card>
                  </a>
                )}
                {!connections.find(c=>c.platform==="instagram") && (
                  <a href="/api/auth/instagram" style={{ textDecoration:"none" }}>
                    <Card style={{ cursor:"pointer", borderStyle:"dashed", opacity:0.6, display:"flex", alignItems:"center", gap:8 }}>
                      <PlatformDot platform="instagram" />
                      <span style={{ fontFamily:mono, fontSize:F.sm, color:C.muted }}>Connect Instagram</span>
                    </Card>
                  </a>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ── Metrics ── */}
        <section style={{ marginBottom:24 }}>
          <SectionHeader label="Channel Metrics" open={openSections.metrics} onToggle={()=>toggleSection("metrics")} accent={C.blue} />
          {openSections.metrics && (
            <div style={{ paddingTop:12 }}>
              {ytConnection ? (
                <Card>
                  <div style={{ display:"flex", alignItems:"center", marginBottom:16 }}>
                    {ytConnection.channel_thumbnail && <img src={ytConnection.channel_thumbnail} alt="" style={{ width:36, height:36, borderRadius:"50%", border:"1px solid "+C.border2, marginRight:10 }} />}
                    <div>
                      <div style={{ fontFamily:mono, fontSize:F.md, color:C.text, fontWeight:600 }}>{ytConnection.channel_name}</div>
                      <div style={{ fontFamily:mono, fontSize:F.sm, color:C.muted }}>YouTube</div>
                    </div>
                    <div style={{ marginLeft:"auto", fontFamily:mono, fontSize:F.sm, color:C.muted }}>
                      Last synced {latestMetrics ? new Date(latestMetrics.snapshot_at).toLocaleDateString() : "never"}
                    </div>
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12 }}>
                    {[
                      { label:"SUBSCRIBERS", value:fmt(ytConnection.subscriber_count), color:C.green },
                      { label:"TOTAL VIEWS", value:fmt(latestMetrics?.total_views), color:C.blue },
                      { label:"VIDEOS", value:fmt(latestMetrics?.video_count), color:C.accent },
                    ].map(({label, value, color}) => (
                      <div key={label} style={{ background:C.well, borderRadius:4, padding:"12px 14px" }}>
                        <div style={{ fontFamily:mono, fontSize:F.sm, color:C.muted, letterSpacing:"0.08em", marginBottom:6 }}>{label}</div>
                        <div style={{ fontFamily:mono, fontSize:22, color, fontWeight:600 }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Recent videos */}
                  {latestMetrics?.videos && latestMetrics.videos.length > 0 && (
                    <div style={{ marginTop:16 }}>
                      <div style={{ fontFamily:mono, fontSize:F.sm, color:C.muted, letterSpacing:"0.08em", marginBottom:8 }}>RECENT VIDEOS</div>
                      {latestMetrics.videos.slice(0, 5).map(v => (
                        <div key={v.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 0", borderBottom:"1px solid "+C.border }}>
                          {v.thumbnail && <img src={v.thumbnail} alt="" style={{ width:64, height:36, objectFit:"cover", borderRadius:3, flexShrink:0 }} />}
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontFamily:mono, fontSize:F.sm, color:C.text, marginBottom:4, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{v.title}</div>
                            <div style={{ display:"flex", gap:12 }}>
                              <span style={col}>{fmt(v.views)} views</span>
                              <span style={col}>{fmt(v.likes)} likes</span>
                              <span style={col}>{fmt(v.comments)} comments</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ) : (
                <Card style={{ textAlign:"center", padding:"32px" }}>
                  <div style={{ fontFamily:mono, fontSize:F.sm, color:C.muted }}>No platforms connected yet. Connect YouTube or Instagram to see metrics.</div>
                </Card>
              )}
            </div>
          )}
        </section>

        {/* ── Comments ── */}
        <section style={{ marginBottom:24 }}>
          <SectionHeader label="Notable Comments" count={comments.length} open={openSections.comments} onToggle={()=>toggleSection("comments")} accent={C.purple} />
          {openSections.comments && (
            <div style={{ paddingTop:12 }}>
              {comments.length > 0 ? comments.map(c => (
                <Card key={c.id}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, flexWrap:"wrap" }}>
                    <PlatformDot platform={c.platform} />
                    <span style={{ fontFamily:mono, fontSize:F.sm, color:C.muted }}>{c.platform}</span>
                    <span style={{ fontFamily:mono, fontSize:F.md, color:C.text, fontWeight:600 }}>{c.author_name}</span>
                    {c.video_title && <span style={{ fontFamily:mono, fontSize:F.sm, color:C.muted }}>on "{c.video_title?.substring(0,40)}..."</span>}
                    <span style={{ marginLeft:"auto", fontFamily:mono, fontSize:F.sm, color:C.dim }}>{c.likes > 0 ? fmt(c.likes)+" likes" : ""}</span>
                  </div>
                  <div style={{ fontFamily:serif, fontSize:F.md, color:C.text, lineHeight:1.6 }} dangerouslySetInnerHTML={{ __html: c.content }} />
                </Card>
              )) : (
                <Card style={{ textAlign:"center", padding:"32px" }}>
                  <div style={{ fontFamily:mono, fontSize:F.sm, color:C.muted }}>Sync your channels to pull in comments.</div>
                </Card>
              )}
            </div>
          )}
        </section>

        {/* Footer */}
        <div style={{ borderTop:"1px solid "+C.border, paddingTop:16, marginTop:32, display:"flex", justifyContent:"space-between" }}>
          <span style={{ fontFamily:mono, fontSize:F.sm, color:C.dim }}>audian.app — social intelligence</span>
          <span style={{ fontFamily:mono, fontSize:F.sm, color:C.dim }}>{dateRange} window</span>
        </div>

      </div>
    </div>
  );
}