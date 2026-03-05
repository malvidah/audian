"use client";
import { useState, useEffect } from "react";
import { createClient_ } from "../lib/supabase";

const THEMES = {
  dark: {
    bg: "#141412", surface: "#232220", card: "#232220",
    well: "#1A1918", border: "#2C2A28", border2: "#383532",
    text: "#D8CEC2", muted: "#6E6860", dim: "#363230",
    accent: "#D08828", green: "#4A9A68", blue: "#4878A8",
    purple: "#886088", red: "#B04840", orange: "#D08828", yellow: "#BBB828",
    shadow: "0 1px 3px rgba(0,0,0,0.5),0 4px 16px rgba(0,0,0,0.3)",
    shadowSm: "0 1px 3px rgba(0,0,0,0.35)",
  },
  light: {
    bg: "#D4CCB8", surface: "#EAE3D6", card: "#EAE3D6",
    well: "#CBBFB0", border: "#D4CCBE", border2: "#BEB6A8",
    text: "#4A3C2E", muted: "#887870", dim: "#ACA49A",
    accent: "#887018", green: "#38684A", blue: "#386088",
    purple: "#604888", red: "#843830", orange: "#B87018", yellow: "#806818",
    shadow: "0 1px 2px rgba(36,24,12,0.08),0 3px 10px rgba(36,24,12,0.05)",
    shadowSm: "0 1px 2px rgba(36,24,12,0.06)",
  },
};

let C = THEMES.dark;
const serif = "Georgia, 'Times New Roman', serif";
const mono  = "'SF Mono', 'Fira Code', ui-monospace, monospace";
const F     = { lg: 18, md: 15, sm: 12 };

const MOCK_INTERACTIONS = [
  { id:1, platform:"X", handle:"@naval", name:"Naval Ravikant", followers:2100000, engagementRate:4.2, bio:"Founder, investor, philosopher", content:"This Big Think piece on consciousness is the clearest explanation I've read.", type:"quote", influenceScore:94, audienceScore:91, zone:"GOLD", avatar:"N", time:"2h ago", verified:true },
  { id:2, platform:"YouTube", handle:"@veritasium", name:"Veritasium", followers:14800000, engagementRate:3.8, bio:"Science educator", content:"Left a 3-paragraph comment breaking down the physics in your latest video.", type:"comment", influenceScore:98, audienceScore:96, zone:"GOLD", avatar:"V", time:"5h ago", verified:true },
  { id:3, platform:"X", handle:"@paulg", name:"Paul Graham", followers:1600000, engagementRate:5.1, bio:"Essayist. Partner, YC.", content:"Shared your video on curiosity-driven learning.", type:"share", influenceScore:96, audienceScore:88, zone:"GOLD", avatar:"P", time:"1d ago", verified:true },
  { id:4, platform:"X", handle:"@anniekc", name:"Dr. Annie Kato", followers:24000, engagementRate:6.8, bio:"Cognitive neuroscientist @MIT. Curious about consciousness.", content:"Using this in my undergrad seminar this week. Thank you.", type:"reply", influenceScore:62, audienceScore:97, zone:"CORE", avatar:"A", time:"3h ago", verified:false },
  { id:5, platform:"LinkedIn", handle:"Marcus Webb", name:"Marcus Webb", followers:18000, engagementRate:4.4, bio:"Founder @ EdTech startup. Former professor.", content:"Shared to my network with a note about how this changed my thinking.", type:"share", influenceScore:55, audienceScore:89, zone:"CORE", avatar:"M", time:"6h ago", verified:false },
  { id:6, platform:"YouTube", handle:"@thinker_lu", name:"Lu Chen", followers:8200, engagementRate:7.2, bio:"Philosophy PhD student. Reads everything.", content:"This is a genuinely excellent breakdown. The Kant connection in the last third is subtle and correct.", type:"comment", influenceScore:41, audienceScore:95, zone:"CORE", avatar:"L", time:"12h ago", verified:false },
];

const MOCK_COMMENTS = [
  { id:1, platform:"YouTube", handle:"@thinker_lu", name:"Lu Chen", content:"This is a genuinely excellent breakdown. The Kant connection in the last third is subtle and correct. Most science communicators miss this entirely. Would love to see a follow-up on the epistemological implications.", quality:"THOUGHTFUL", likes:847, replies:23, time:"12h ago" },
  { id:2, platform:"X", handle:"@dr_mehta_r", name:"Dr. Rahul Mehta", content:"What strikes me about this framing is how it dissolves the usual mind/body dichotomy without resorting to either hard materialism or mysticism. Rare clarity.", quality:"THOUGHTFUL", likes:312, replies:8, time:"1d ago" },
  { id:3, platform:"YouTube", handle:"@curious_j", name:"Julia H.", content:"I've watched this three times. Sent it to my entire book club. This is what public education should look like.", quality:"ENGAGED", likes:1204, replies:41, time:"2d ago" },
  { id:4, platform:"Instagram", handle:"@philosophyeveryday", name:"Philosophy Everyday", content:"Saving this forever. The moment at 4:32 reframed something I've been thinking about for years.", quality:"ENGAGED", likes:563, replies:12, time:"3d ago" },
];

const MOCK_METRICS = {
  X:         { followers:412000,   impressions:2840000,  engagements:84200,  shares:6200,  saves:3100,   comments:4800,  growth:+2.1 },
  YouTube:   { followers:5200000,  impressions:18400000, engagements:924000, shares:84000, saves:210000, comments:32000, growth:+4.8 },
  Instagram: { followers:1840000,  impressions:6200000,  engagements:248000, shares:18200, saves:94000,  comments:12400, growth:+1.4 },
  LinkedIn:  { followers:284000,   impressions:1200000,  engagements:36000,  shares:4800,  saves:8200,   comments:2200,  growth:+3.2 },
};

const PLATFORMS = ["All","X","YouTube","Instagram","LinkedIn"];

function fmt(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1)+"M";
  if (n >= 1000) return (n/1000).toFixed(1)+"K";
  return n;
}

function ScoreBadge({ score, color }) {
  return <span style={{ display:"inline-block", padding:"1px 7px", background:color+"22", border:"1px solid "+color+"44", borderRadius:3, fontSize:F.sm, color, fontFamily:mono, letterSpacing:"0.03em" }}>{score}</span>;
}

function ZoneBadge({ zone }) {
  const map = {
    GOLD:  { bg:"#D0882822", border:"#D0882844", color:"#D08828", label:"⬡ GOLD" },
    CORE:  { bg:"#4878A822", border:"#4878A844", color:"#4878A8", label:"◈ CORE" },
    WATCH: { bg:"#88608822", border:"#88608844", color:"#886088", label:"◎ WATCH" },
  };
  const s = map[zone] || map.WATCH;
  return <span style={{ display:"inline-block", padding:"1px 8px", background:s.bg, border:"1px solid "+s.border, borderRadius:3, fontSize:F.sm, color:s.color, fontFamily:mono, letterSpacing:"0.06em", fontWeight:600 }}>{s.label}</span>;
}

function PlatformDot({ platform }) {
  const colors = { X:"#D8CEC2", YouTube:"#B04840", Instagram:"#886088", LinkedIn:"#4878A8" };
  return <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:colors[platform]||C.muted, marginRight:5, verticalAlign:"middle" }} />;
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

function Card({ children, style={} }) {
  return <div style={{ background:C.card, border:"1px solid "+C.border, borderRadius:6, padding:"14px 16px", marginBottom:8, boxShadow:C.shadowSm, ...style }}>{children}</div>;
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
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:mono }}>
      <div style={{ background:C.card, border:"1px solid "+C.border, borderRadius:8, padding:"40px 48px", maxWidth:380, width:"100%", boxShadow:C.shadow }}>
        <div style={{ marginBottom:32 }}>
          <div style={{ fontFamily:serif, fontSize:28, color:C.text, letterSpacing:"-0.02em", marginBottom:6 }}>Audian</div>
          <div style={{ fontSize:F.sm, color:C.muted, letterSpacing:"0.04em" }}>SOCIAL INTELLIGENCE</div>
        </div>
        {sent ? (
          <div style={{ fontSize:F.md, color:C.green, lineHeight:1.6 }}>Check your email — magic link sent.</div>
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
  const [supabase] = useState(() => createClient_());
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [openSections, setOpenSections] = useState({ influential:true, comments:true, metrics:true });
  const [platform, setPlatform] = useState("All");
  const [zone, setZone] = useState("All");
  const [dateRange, setDateRange] = useState("7d");

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    setTheme(saved);
    C = THEMES[saved] || THEMES.dark;
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

  function toggleSection(key) { setOpenSections(s => ({ ...s, [key]: !s[key] })); }

  const filteredInteractions = MOCK_INTERACTIONS.filter(i => {
    if (platform !== "All" && i.platform !== platform) return false;
    if (zone !== "All" && i.zone !== zone) return false;
    return true;
  });

  const filteredComments = MOCK_COMMENTS.filter(c => platform === "All" || c.platform === platform);

  if (authLoading) return <div style={{ minHeight:"100vh", background:C.bg }} />;
  if (!session) return <SignIn supabase={supabase} />;

  const col = { fontFamily:mono, fontSize:F.sm, color:C.muted, letterSpacing:"0.06em" };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text }}>
      <div style={{ background:C.surface, borderBottom:"1px solid "+C.border, padding:"0 24px", display:"flex", alignItems:"center", height:48, position:"sticky", top:0, zIndex:100 }}>
        <span style={{ fontFamily:serif, fontSize:18, color:C.text, letterSpacing:"-0.01em" }}>Audian</span>
        <span style={{ fontFamily:mono, fontSize:F.sm, color:C.muted, marginLeft:10, letterSpacing:"0.08em" }}>— SOCIAL INTELLIGENCE</span>
        <div style={{ marginLeft:"auto", display:"flex", gap:4, alignItems:"center" }}>
          {PLATFORMS.map(p => (
            <button key={p} onClick={()=>setPlatform(p)} style={{ background:platform===p?C.accent+"22":"none", border:"1px solid "+(platform===p?C.accent+"66":C.border), borderRadius:3, padding:"3px 10px", cursor:"pointer", fontFamily:mono, fontSize:F.sm, color:platform===p?C.accent:C.muted, letterSpacing:"0.06em" }}>{p}</button>
          ))}
          <select value={dateRange} onChange={e=>setDateRange(e.target.value)} style={{ marginLeft:8, background:C.well, border:"1px solid "+C.border2, borderRadius:3, padding:"3px 8px", color:C.muted, fontFamily:mono, fontSize:F.sm, cursor:"pointer", outline:"none" }}>
            {["24h","7d","30d","90d"].map(r=><option key={r} value={r}>{r}</option>)}
          </select>
          <button onClick={toggleTheme} style={{ marginLeft:8, background:"none", border:"1px solid "+C.border, borderRadius:3, padding:"3px 8px", cursor:"pointer", fontFamily:mono, fontSize:F.sm, color:C.muted }}>{theme==="dark"?"☀":"◑"}</button>
          <button onClick={()=>supabase.auth.signOut()} style={{ marginLeft:4, background:"none", border:"1px solid "+C.border, borderRadius:3, padding:"3px 8px", cursor:"pointer", fontFamily:mono, fontSize:F.sm, color:C.muted }}>OUT</button>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"24px 24px 64px" }}>

        <div style={{ background:C.accent+"11", border:"1px solid "+C.accent+"33", borderRadius:6, padding:"16px 20px", marginBottom:24 }}>
          <div style={{ fontFamily:mono, fontSize:F.sm, color:C.accent, letterSpacing:"0.1em", marginBottom:8 }}>✦ MONTHLY INSIGHT — MARCH 2026</div>
          <div style={{ fontFamily:serif, fontSize:F.lg, color:C.text, lineHeight:1.5 }}>Your consciousness content drove 3 GOLD interactions this week — Naval, Veritasium, and Paul Graham all engaged within 48 hours of publish. Long-form YouTube comments are 4× more substantive than X replies this period.</div>
        </div>

        <section style={{ marginBottom:28 }}>
          <SectionHeader label="Engagement Metrics" open={openSections.metrics} onToggle={()=>toggleSection("metrics")} accent={C.green} />
          {openSections.metrics && (
            <div style={{ paddingTop:12 }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                {Object.entries(MOCK_METRICS).filter(([p])=>platform==="All"||p===platform).map(([p,m]) => (
                  <Card key={p}>
                    <div style={{ display:"flex", alignItems:"center", marginBottom:10 }}>
                      <PlatformDot platform={p} />
                      <span style={{ fontFamily:mono, fontSize:F.sm, color:C.muted, letterSpacing:"0.06em" }}>{p.toUpperCase()}</span>
                      <span style={{ marginLeft:"auto", fontFamily:mono, fontSize:F.sm, color:m.growth>0?C.green:C.red }}>{m.growth>0?"+":""}{m.growth}%</span>
                    </div>
                    {[["FOLLOWERS",fmt(m.followers)],["IMPRESSIONS",fmt(m.impressions)],["ENGAGEMENTS",fmt(m.engagements)],["SAVES",fmt(m.saves)],["SHARES",fmt(m.shares)]].map(([label,value]) => (
                      <div key={label} style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={col}>{label}</span>
                        <span style={{ fontFamily:mono, fontSize:F.sm, color:C.text }}>{value}</span>
                      </div>
                    ))}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </section>

        <section style={{ marginBottom:28 }}>
          <SectionHeader label="Influential Interactions" count={filteredInteractions.length} open={openSections.influential} onToggle={()=>toggleSection("influential")} accent={C.accent} />
          {openSections.influential && (
            <div style={{ paddingTop:12 }}>
              <div style={{ display:"flex", gap:6, marginBottom:12 }}>
                {["All","GOLD","CORE","WATCH"].map(z => (
                  <button key={z} onClick={()=>setZone(z)} style={{ background:zone===z?C.well:"none", border:"1px solid "+(zone===z?C.border2:C.border), borderRadius:3, padding:"2px 10px", cursor:"pointer", fontFamily:mono, fontSize:F.sm, color:zone===z?C.text:C.muted, letterSpacing:"0.06em" }}>{z}</button>
                ))}
              </div>
              {filteredInteractions.map(item => (
                <Card key={item.id}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                    <div style={{ width:38, height:38, borderRadius:"50%", background:C.well, border:"1px solid "+C.border2, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:mono, fontSize:F.md, color:C.accent, flexShrink:0 }}>{item.avatar}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                        <span style={{ fontFamily:mono, fontSize:F.md, color:C.text, fontWeight:600 }}>{item.name}</span>
                        {item.verified && <span style={{ color:C.accent, fontSize:F.sm }}>✓</span>}
                        <span style={{ fontFamily:mono, fontSize:F.sm, color:C.muted }}>{item.handle}</span>
                        <PlatformDot platform={item.platform} />
                        <span style={{ fontFamily:mono, fontSize:F.sm, color:C.muted }}>{item.platform}</span>
                        <ZoneBadge zone={item.zone} />
                        <span style={{ marginLeft:"auto", fontFamily:mono, fontSize:F.sm, color:C.dim }}>{item.time}</span>
                      </div>
                      <div style={{ fontFamily:serif, fontSize:F.md, color:C.text, lineHeight:1.55, marginBottom:10 }}>"{item.content}"</div>
                      <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                        {[["FOLLOWERS",fmt(item.followers)],["ENG RATE",item.engagementRate+"%"],["TYPE",item.type.toUpperCase()]].map(([l,v])=>(
                          <div key={l} style={{ display:"flex", gap:4, alignItems:"center" }}>
                            <span style={col}>{l}</span>
                            <span style={{ fontFamily:mono, fontSize:F.sm, color:C.text }}>{v}</span>
                          </div>
                        ))}
                        <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                          <span style={col}>INFLUENCE</span><ScoreBadge score={item.influenceScore} color={C.accent} />
                        </div>
                        <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                          <span style={col}>AUDIENCE FIT</span><ScoreBadge score={item.audienceScore} color={C.blue} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section style={{ marginBottom:28 }}>
          <SectionHeader label="Notable Comments" count={filteredComments.length} open={openSections.comments} onToggle={()=>toggleSection("comments")} accent={C.blue} />
          {openSections.comments && (
            <div style={{ paddingTop:12 }}>
              {filteredComments.map(c => (
                <Card key={c.id}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, flexWrap:"wrap" }}>
                    <PlatformDot platform={c.platform} />
                    <span style={{ fontFamily:mono, fontSize:F.sm, color:C.muted }}>{c.platform}</span>
                    <span style={{ fontFamily:mono, fontSize:F.md, color:C.text }}>{c.name}</span>
                    <span style={{ fontFamily:mono, fontSize:F.sm, color:C.muted }}>{c.handle}</span>
                    <span style={{ fontFamily:mono, fontSize:F.sm, color:c.quality==="THOUGHTFUL"?C.accent:C.blue, background:(c.quality==="THOUGHTFUL"?C.accent:C.blue)+"18", border:"1px solid "+(c.quality==="THOUGHTFUL"?C.accent:C.blue)+"33", borderRadius:3, padding:"1px 7px", letterSpacing:"0.06em" }}>{c.quality}</span>
                    <span style={{ marginLeft:"auto", fontFamily:mono, fontSize:F.sm, color:C.dim }}>{c.time}</span>
                  </div>
                  <div style={{ fontFamily:serif, fontSize:F.md, color:C.text, lineHeight:1.6, marginBottom:10 }}>"{c.content}"</div>
                  <div style={{ display:"flex", gap:16 }}>
                    <div style={{ display:"flex", gap:4 }}><span style={col}>LIKES</span><span style={{ fontFamily:mono, fontSize:F.sm, color:C.text }}>{fmt(c.likes)}</span></div>
                    <div style={{ display:"flex", gap:4 }}><span style={col}>REPLIES</span><span style={{ fontFamily:mono, fontSize:F.sm, color:C.text }}>{c.replies}</span></div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <div style={{ borderTop:"1px solid "+C.border, paddingTop:16, marginTop:32, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontFamily:mono, fontSize:F.sm, color:C.dim }}>audian.co — social intelligence</span>
          <span style={{ fontFamily:mono, fontSize:F.sm, color:C.dim }}>{dateRange} window · {platform==="All"?"all platforms":platform.toLowerCase()}</span>
        </div>

      </div>
    </div>
  );
}