"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const THEMES = {
  dark: {
    bg: "#141412", surface: "#232220", card: "#232220",
    well: "#1A1918", border: "#2C2A28", border2: "#383532",
    text: "#D8CEC2", muted: "#6E6860", dim: "#363230",
    accent: "#D08828", green: "#4A9A68", blue: "#4878A8",
    purple: "#886088", red: "#B04840",
    shadow: "0 1px 3px rgba(0,0,0,0.5),0 4px 16px rgba(0,0,0,0.3)",
    shadowSm: "0 1px 3px rgba(0,0,0,0.35)",
  },
  light: {
    bg: "#D4CCB8", surface: "#EAE3D6", card: "#EAE3D6",
    well: "#CBBFB0", border: "#D4CCBE", border2: "#BEB6A8",
    text: "#4A3C2E", muted: "#887870", dim: "#ACA49A",
    accent: "#887018", green: "#38684A", blue: "#386088",
    purple: "#604888", red: "#843830",
    shadow: "0 1px 2px rgba(36,24,12,0.08)",
    shadowSm: "0 1px 2px rgba(36,24,12,0.06)",
  },
};

let C = THEMES.dark;
const serif = "Georgia,'Times New Roman',serif";
const mono  = "'SF Mono','Fira Code',ui-monospace,monospace";
const F     = { lg: 18, md: 15, sm: 12 };

function fmt(n) {
  if (!n && n !== 0) return "—";
  n = parseInt(n);
  if (n >= 1000000) return (n/1000000).toFixed(1)+"M";
  if (n >= 1000)    return (n/1000).toFixed(1)+"K";
  return n.toLocaleString();
}

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff/3600000);
  const d = Math.floor(diff/86400000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return "just now";
}

function Card({ children, style={} }) {
  return <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:6, padding:"14px 16px", marginBottom:8, boxShadow:C.shadowSm, ...style }}>{children}</div>;
}

function SecHead({ label, count, open, onToggle, accent }) {
  return (
    <button onClick={onToggle} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, background:"none", border:"none", cursor:"pointer", padding:"14px 0 10px", borderBottom:`1px solid ${C.border}` }}>
      <span style={{ fontFamily:mono, fontSize:F.sm, letterSpacing:"0.12em", color:accent||C.accent, textTransform:"uppercase", fontWeight:600 }}>{label}</span>
      {count !== undefined && <span style={{ fontFamily:mono, fontSize:F.sm, color:C.muted, background:C.well, padding:"1px 7px", borderRadius:3 }}>{count}</span>}
      <span style={{ marginLeft:"auto", fontFamily:mono, fontSize:F.sm, color:C.muted, transform:open?"rotate(180deg)":"none", transition:"transform 0.2s" }}>▾</span>
    </button>
  );
}

function Dot({ platform }) {
  const colors = { youtube:"#B04840", x:"#D8CEC2", instagram:"#886088", linkedin:"#4878A8" };
  return <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:colors[platform?.toLowerCase()]||C.muted, marginRight:5, verticalAlign:"middle" }} />;
}

function SignIn({ supabase }) {
  const [email, setEmail] = useState("");
  const [sent, setSent]   = useState(false);
  const [loading, setLoading] = useState(false);
  async function go() {
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options:{ emailRedirectTo: window.location.origin } });
    if (!error) setSent(true);
    setLoading(false);
  }
  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:"40px 48px", maxWidth:380, width:"100%", boxShadow:C.shadow }}>
        <div style={{ fontFamily:serif, fontSize:28, color:C.text, letterSpacing:"-0.02em", marginBottom:6 }}>Audian</div>
        <div style={{ fontFamily:mono, fontSize:F.sm, color:C.muted, letterSpacing:"0.04em", marginBottom:32 }}>SOCIAL INTELLIGENCE</div>
        {sent ? <div style={{ fontSize:F.md, color:C.green, fontFamily:mono }}>Check your email — magic link sent.</div> : <>
          <input type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} style={{ width:"100%", background:C.well, border:`1px solid ${C.border2}`, borderRadius:4, padding:"10px 12px", color:C.text, fontFamily:mono, fontSize:F.md, outline:"none", boxSizing:"border-box", marginBottom:12 }} />
          <button onClick={go} disabled={loading} style={{ width:"100%", background:C.accent, border:"none", borderRadius:4, padding:"10px 12px", color:C.bg, fontFamily:mono, fontSize:F.sm, fontWeight:700, letterSpacing:"0.08em", cursor:"pointer", textTransform:"uppercase" }}>{loading?"SENDING...":"SIGN IN →"}</button>
        </>}
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
  const [comments, setComments]       = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [syncing, setSyncing]         = useState(false);
  const [syncMsg, setSyncMsg]         = useState("");
  const [lastSynced, setLastSynced]   = useState(null);
  const [urlMsg, setUrlMsg]           = useState("");
  const [open, setOpen]               = useState({ insights:true, channels:true, metrics:true, videos:false, interactions:true, comments:true });
  const [insights, setInsights]       = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [platform, setPlatform]       = useState("All");
  const col = { fontFamily:mono, fontSize:F.sm, color:C.muted, letterSpacing:"0.06em" };

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
    supabase.auth.getSession().then(({ data:{ session } }) => { setSession(session); setAuthLoading(false); });
    const { data:{ subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const conn = params.get("connected"), err = params.get("error");
    if (conn) setUrlMsg(`✓ ${conn} connected successfully`);
    if (err)  setUrlMsg(`✗ ${err.replace(/_/g," ")}`);
    if (conn || err) window.history.replaceState({}, "", "/");
  }, []);

  const loadData = useCallback(async () => {
    if (!session) return;
    const [a,b,c,d] = await Promise.all([
      supabase.from("platform_connections").select("*"),
      supabase.from("platform_metrics").select("*").order("snapshot_at",{ascending:false}).limit(20),
      supabase.from("platform_comments").select("*").order("published_at",{ascending:false}).limit(50),
      supabase.from("platform_interactions").select("*").order("interacted_at",{ascending:false}).limit(50),
    ]);
    if (a.data) setConnections(a.data);
    if (b.data) { setMetrics(b.data); if (b.data[0]) setLastSynced(b.data[0].snapshot_at); }
    if (c.data) setComments(c.data);
    if (d.data) setInteractions(d.data);
  }, [session, supabase]);

  useEffect(() => { loadData(); }, [loadData]);

  async function triggerSync(p) {
    setSyncing(true); setSyncMsg("");
    try {
      const res  = await fetch(`/api/sync/${p}`, { method:"POST" });
      const data = await res.json();
      if (data.error) setSyncMsg(`✗ ${data.error}`);
      else { setSyncMsg(`✓ ${p} synced — ${data.videos_synced||data.tweets_synced||data.posts||0} posts, ${data.comments_synced||data.comments||0} comments`); await loadData(); }
    } catch(e) { setSyncMsg(`✗ ${e.message}`); }
    setSyncing(false);
  }

  const tog = (k) => setOpen(s => ({ ...s, [k]:!s[k] }));

  async function generateInsights() {
    setInsightsLoading(true);
    try {
      const res  = await fetch('/api/insights', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      const data = await res.json();
      if (data.insights) setInsights(data.insights);
      else setInsights({ headline: data.error || 'Could not generate insights', stories: [], recommendation: '' });
    } catch(e) {
      setInsights({ headline: e.message, stories: [], recommendation: '' });
    }
    setInsightsLoading(false);
  }

  // Latest metric per platform
  const latest = {};
  metrics.forEach(m => { if (!latest[m.platform]) latest[m.platform] = m; });

  // Videos from latest youtube snapshot
  const ytVideos = latest["youtube"]?.videos || [];

  const filteredComments     = comments.filter(c => platform==="All" || c.platform===platform);
  const filteredInteractions = interactions.filter(i => platform==="All" || i.platform===platform);

  if (authLoading) return <div style={{ minHeight:"100vh", background:C.bg }} />;
  if (!session)    return <SignIn supabase={supabase} />;

  const PLATS = ["All","youtube","x","instagram","linkedin"];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text }}>

      {/* Nav */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"0 24px", display:"flex", alignItems:"center", height:48, position:"sticky", top:0, zIndex:100 }}>
        <span style={{ fontFamily:serif, fontSize:18, color:C.text, letterSpacing:"-0.01em" }}>Audian</span>
        <span style={{ fontFamily:mono, fontSize:F.sm, color:C.muted, marginLeft:10, letterSpacing:"0.08em" }}>— SOCIAL INTELLIGENCE</span>
        <div style={{ marginLeft:24, display:"flex", gap:4 }}>
          {PLATS.map(p => (
            <button key={p} onClick={()=>setPlatform(p)} style={{ background:platform===p?C.accent+"22":"none", border:`1px solid ${platform===p?C.accent+"66":C.border}`, borderRadius:3, padding:"3px 10px", cursor:"pointer", fontFamily:mono, fontSize:F.sm, color:platform===p?C.accent:C.muted, letterSpacing:"0.06em" }}>
              {p==="All"?"All":p.charAt(0).toUpperCase()+p.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:8, alignItems:"center" }}>
          {lastSynced && <span style={{ fontFamily:mono, fontSize:F.sm, color:C.dim }}>synced {timeAgo(lastSynced)}</span>}
          <button onClick={toggleTheme} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:3, padding:"3px 8px", cursor:"pointer", fontFamily:mono, fontSize:F.sm, color:C.muted }}>{theme==="dark"?"☀":"◑"}</button>
          <button onClick={()=>supabase.auth.signOut()} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:3, padding:"3px 8px", cursor:"pointer", fontFamily:mono, fontSize:F.sm, color:C.muted }}>OUT</button>
        </div>
      </div>

      {/* URL msg */}
      {urlMsg && <div style={{ background:urlMsg.startsWith("✓")?C.green+"18":C.red+"18", border:`1px solid ${urlMsg.startsWith("✓")?C.green+"44":C.red+"44"}`, borderRadius:6, padding:"10px 24px", margin:"16px 24px 0", fontFamily:mono, fontSize:F.sm, color:urlMsg.startsWith("✓")?C.green:C.red }}>{urlMsg}</div>}
      {syncMsg && <div style={{ background:syncMsg.startsWith("✓")?C.green+"18":C.red+"18", border:`1px solid ${syncMsg.startsWith("✓")?C.green+"44":C.red+"44"}`, borderRadius:6, padding:"10px 24px", margin:"8px 24px 0", fontFamily:mono, fontSize:F.sm, color:syncMsg.startsWith("✓")?C.green:C.red }}>{syncMsg}</div>}

      <div style={{ maxWidth:960, margin:"0 auto", padding:"24px 24px 64px" }}>

        {/* ── AI Insights ── */}
        <section style={{ marginBottom:28 }}>
          <div style={{ display:"flex", alignItems:"center", borderBottom:`1px solid ${C.border}`, paddingBottom:10, marginBottom:12 }}>
            <button onClick={()=>tog("insights")} style={{ flex:1, display:"flex", alignItems:"center", gap:10, background:"none", border:"none", cursor:"pointer", padding:"14px 0 0" }}>
              <span style={{ fontFamily:mono, fontSize:F.sm, letterSpacing:"0.12em", color:C.accent, textTransform:"uppercase", fontWeight:600 }}>AI Insights</span>
              <span style={{ fontFamily:mono, fontSize:F.sm, color:C.muted, transform:open.insights?"rotate(180deg)":"none", transition:"transform 0.2s" }}>▾</span>
            </button>
            <button onClick={generateInsights} disabled={insightsLoading} style={{ marginTop:10, fontFamily:mono, fontSize:F.sm, padding:"4px 14px", borderRadius:3, border:`1px solid ${C.accent}66`, background:C.accent+"18", color:C.accent, cursor:insightsLoading?"default":"pointer", letterSpacing:"0.06em" }}>
              {insightsLoading ? "Analyzing..." : insights ? "↻ Refresh" : "✦ Generate Insights"}
            </button>
          </div>
          {open.insights && (
            <div style={{ paddingTop:4 }}>
              {!insights && !insightsLoading && (
                <div style={{ fontFamily:mono, fontSize:F.sm, color:C.muted, padding:"16px 0" }}>
                  Click Generate Insights to get an AI-written narrative of your social data.
                </div>
              )}
              {insightsLoading && (
                <div style={{ fontFamily:mono, fontSize:F.sm, color:C.muted, padding:"16px 0" }}>
                  Analyzing your data...
                </div>
              )}
              {insights && !insightsLoading && (
                <div>
                  {insights.headline && (
                    <div style={{ fontFamily:serif, fontSize:22, color:C.text, lineHeight:1.4, marginBottom:20, paddingBottom:16, borderBottom:`1px solid ${C.border}` }}>
                      {insights.headline}
                    </div>
                  )}
                  {insights.stories?.map((s, i) => (
                    <div key={i} style={{ marginBottom:16, paddingBottom:16, borderBottom:`1px solid ${C.border}` }}>
                      <div style={{ fontFamily:mono, fontSize:F.sm, color:C.accent, letterSpacing:"0.08em", fontWeight:600, marginBottom:6 }}>{s.title?.toUpperCase()}</div>
                      <div style={{ fontFamily:serif, fontSize:F.md, color:C.text, lineHeight:1.65 }}>{s.insight}</div>
                    </div>
                  ))}
                  {insights.recommendation && (
                    <div style={{ background:C.well, border:`1px solid ${C.border2}`, borderRadius:4, padding:"12px 14px" }}>
                      <span style={{ fontFamily:mono, fontSize:F.sm, color:C.muted, letterSpacing:"0.08em" }}>RECOMMENDATION  </span>
                      <span style={{ fontFamily:serif, fontSize:F.md, color:C.text }}>{insights.recommendation}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Channels ── */}
        <section style={{ marginBottom:28 }}>
          <SecHead label="Connected Channels" open={open.channels} onToggle={()=>tog("channels")} accent={C.muted} />
          {open.channels && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, paddingTop:12 }}>
              {[
                { id:"youtube",   label:"YouTube",   color:"#B04840" },
                { id:"x",         label:"X / Twitter",color:"#D8CEC2" },
                { id:"instagram", label:"Instagram", color:"#886088" },
                { id:"linkedin",  label:"LinkedIn",  color:"#4878A8" },
              ].map(({ id, label, color }) => {
                const conn = connections.find(c => c.platform===id);
                return (
                  <Card key={id} style={{ textAlign:"center" }}>
                    <div style={{ fontFamily:mono, fontSize:F.sm, color, letterSpacing:"0.08em", marginBottom:8, fontWeight:600 }}>{label}</div>
                    {conn ? <>
                      <div style={{ fontFamily:mono, fontSize:F.sm, color:C.green, marginBottom:4 }}>✓ Connected</div>
                      {/* Display name: channel_name for YouTube, username for others */}
                      {(conn.channel_name || conn.username) && <div style={{ fontFamily:mono, fontSize:F.sm, color:C.muted, marginBottom:6, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{conn.channel_name || `@${conn.username}`}</div>}
                      {/* Follower count: subscriber_count for YouTube, metadata.followers_count for Instagram */}
                      {(conn.subscriber_count > 0 || conn.metadata?.followers_count > 0) && <div style={{ fontFamily:mono, fontSize:F.sm, color:C.text, marginBottom:10 }}>{fmt(conn.subscriber_count || conn.metadata?.followers_count)} followers</div>}
                      {(id==="youtube"||id==="x"||id==="instagram") && (
                        <button onClick={()=>triggerSync(id)} disabled={syncing} style={{ fontFamily:mono, fontSize:F.sm, padding:"4px 12px", borderRadius:3, border:`1px solid ${C.accent}66`, background:C.accent+"18", color:C.accent, cursor:syncing?"default":"pointer", letterSpacing:"0.06em" }}>
                          {syncing?"Syncing...":"↻ Sync Now"}
                        </button>
                      )}
                    </> : (
                      <a href={`/api/auth/${id}`} style={{ display:"block", marginTop:8, padding:"6px 12px", background:C.well, border:`1px solid ${C.border2}`, borderRadius:3, fontFamily:mono, fontSize:F.sm, color:C.muted, textDecoration:"none", letterSpacing:"0.06em" }}>Connect →</a>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Metrics ── */}
        <section style={{ marginBottom:28 }}>
          <SecHead label="Engagement Metrics" open={open.metrics} onToggle={()=>tog("metrics")} accent={C.green} />
          {open.metrics && (
            <div style={{ paddingTop:12 }}>
              {Object.keys(latest).length===0 ? (
                <div style={{ fontFamily:mono, fontSize:F.sm, color:C.muted, padding:"20px 0" }}>No metrics yet — connect a channel and click Sync Now.</div>
              ) : (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:8 }}>
                  {Object.entries(latest).filter(([p])=>platform==="All"||p===platform).map(([p,m])=>(
                    <Card key={p}>
                      <div style={{ display:"flex", alignItems:"center", marginBottom:10 }}>
                        <Dot platform={p} />
                        <span style={{ fontFamily:mono, fontSize:F.sm, color:C.muted, letterSpacing:"0.06em" }}>{p.toUpperCase()}</span>
                        <span style={{ marginLeft:"auto", fontFamily:mono, fontSize:F.sm, color:C.dim }}>{timeAgo(m.snapshot_at)}</span>
                      </div>
                      {[["FOLLOWERS",m.followers],["TOTAL VIEWS",m.total_views],["VIDEOS",m.video_count]].filter(([,v])=>v!=null).map(([l,v])=>(
                        <div key={l} style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                          <span style={col}>{l}</span>
                          <span style={{ fontFamily:mono, fontSize:F.sm, color:C.text }}>{fmt(v)}</span>
                        </div>
                      ))}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Recent Videos ── */}
        {ytVideos.length > 0 && (platform==="All"||platform==="youtube") && (
          <section style={{ marginBottom:28 }}>
            <SecHead label="Recent Videos" count={ytVideos.length} open={open.videos} onToggle={()=>tog("videos")} accent="#B04840" />
            {open.videos && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:8, paddingTop:12 }}>
                {ytVideos.slice(0,8).map(v=>(
                  <Card key={v.id}>
                    <div style={{ fontFamily:serif, fontSize:F.md, color:C.text, marginBottom:8, lineHeight:1.4 }}>{v.title}</div>
                    <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                      {[["VIEWS",v.views],["LIKES",v.likes],["COMMENTS",v.comments]].map(([l,val])=>(
                        <div key={l} style={{ display:"flex", gap:4 }}>
                          <span style={col}>{l}</span>
                          <span style={{ fontFamily:mono, fontSize:F.sm, color:C.text }}>{fmt(val)}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Interactions ── */}
        <section style={{ marginBottom:28 }}>
          <SecHead label="Influential Interactions" count={filteredInteractions.length} open={open.interactions} onToggle={()=>tog("interactions")} accent={C.accent} />
          {open.interactions && (
            <div style={{ paddingTop:12 }}>
              {filteredInteractions.length===0 ? (
                <div style={{ fontFamily:mono, fontSize:F.sm, color:C.muted, padding:"20px 0" }}>No interactions yet — these populate as the scoring engine processes your synced data.</div>
              ) : filteredInteractions.map(item=>(
                <Card key={item.id}>
                  <div style={{ display:"flex", gap:12 }}>
                    <div style={{ width:38, height:38, borderRadius:"50%", background:C.well, border:`1px solid ${C.border2}`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:mono, fontSize:F.md, color:C.accent, flexShrink:0 }}>
                      {(item.name||item.handle||"?")[0].toUpperCase()}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                        <span style={{ fontFamily:mono, fontSize:F.md, color:C.text, fontWeight:600 }}>{item.name||item.handle}</span>
                        {item.verified && <span style={{ color:C.accent, fontSize:F.sm }}>✓</span>}
                        <Dot platform={item.platform} />
                        <span style={{ fontFamily:mono, fontSize:F.sm, color:C.muted }}>{item.platform}</span>
                        {item.zone && <span style={{ fontFamily:mono, fontSize:F.sm, color:item.zone==="GOLD"?C.accent:item.zone==="CORE"?C.blue:C.purple, background:(item.zone==="GOLD"?C.accent:item.zone==="CORE"?C.blue:C.purple)+"18", border:`1px solid ${(item.zone==="GOLD"?C.accent:item.zone==="CORE"?C.blue:C.purple)}33`, borderRadius:3, padding:"1px 8px", fontWeight:600 }}>{item.zone}</span>}
                        <span style={{ marginLeft:"auto", fontFamily:mono, fontSize:F.sm, color:C.dim }}>{timeAgo(item.interacted_at)}</span>
                      </div>
                      {item.content && <div style={{ fontFamily:serif, fontSize:F.md, color:C.text, lineHeight:1.55, marginBottom:8 }}>"{item.content}"</div>}
                      <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                        {item.followers && <div style={{ display:"flex", gap:4 }}><span style={col}>FOLLOWERS</span><span style={{ fontFamily:mono, fontSize:F.sm, color:C.text }}>{fmt(item.followers)}</span></div>}
                        {item.influence_score && <div style={{ display:"flex", gap:4 }}><span style={col}>INFLUENCE</span><span style={{ fontFamily:mono, fontSize:F.sm, color:C.accent }}>{item.influence_score}</span></div>}
                        {item.audience_score && <div style={{ display:"flex", gap:4 }}><span style={col}>AUDIENCE FIT</span><span style={{ fontFamily:mono, fontSize:F.sm, color:C.blue }}>{item.audience_score}</span></div>}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* ── Comments ── */}
        <section style={{ marginBottom:28 }}>
          <SecHead label="Notable Comments" count={filteredComments.length} open={open.comments} onToggle={()=>tog("comments")} accent={C.blue} />
          {open.comments && (
            <div style={{ paddingTop:12 }}>
              {filteredComments.length===0 ? (
                <div style={{ fontFamily:mono, fontSize:F.sm, color:C.muted, padding:"20px 0" }}>No comments yet — sync YouTube to pull top comments from recent videos.</div>
              ) : filteredComments.map(c=>(
                <Card key={c.id}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, flexWrap:"wrap" }}>
                    <Dot platform={c.platform} />
                    <span style={{ fontFamily:mono, fontSize:F.md, color:C.text, fontWeight:600 }}>{c.author_name}</span>
                    {c.video_title && <span style={{ fontFamily:mono, fontSize:F.sm, color:C.muted }}>on "{c.video_title?.slice(0,40)}{c.video_title?.length>40?"…":""}"</span>}
                    {c.quality_tag && <span style={{ fontFamily:mono, fontSize:F.sm, color:C.accent, background:C.accent+"18", border:`1px solid ${C.accent}33`, borderRadius:3, padding:"1px 7px" }}>{c.quality_tag}</span>}
                    <span style={{ marginLeft:"auto", fontFamily:mono, fontSize:F.sm, color:C.dim }}>{timeAgo(c.published_at)}</span>
                  </div>
                  <div style={{ fontFamily:serif, fontSize:F.md, color:C.text, lineHeight:1.6, marginBottom:8 }}>"{c.content}"</div>
                  <div style={{ display:"flex", gap:16 }}>
                    {c.likes>0 && <div style={{ display:"flex", gap:4 }}><span style={col}>LIKES</span><span style={{ fontFamily:mono, fontSize:F.sm, color:C.text }}>{fmt(c.likes)}</span></div>}
                    {c.reply_count>0 && <div style={{ display:"flex", gap:4 }}><span style={col}>REPLIES</span><span style={{ fontFamily:mono, fontSize:F.sm, color:C.text }}>{c.reply_count}</span></div>}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:16, display:"flex", justifyContent:"space-between" }}>
          <span style={{ fontFamily:mono, fontSize:F.sm, color:C.dim }}>audian.app</span>
          <span style={{ fontFamily:mono, fontSize:F.sm, color:C.dim }}>{connections.length} platform{connections.length!==1?"s":""} connected</span>
        </div>
      </div>
    </div>
  );
}
