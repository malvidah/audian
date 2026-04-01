"use client";
import React, { useState, useMemo, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ─── Design tokens (shared with Dashboard & Posts) ───────────────────────────
const T = {
  bg:           "#F8F7F5",
  surface:      "#FFFFFF",
  card:         "#FFFFFF",
  well:         "#F3F2F0",
  border:       "#E8E6E1",
  border2:      "#D6D3CC",
  text:         "#1A1816",
  sub:          "#6B6560",
  dim:          "#A8A39C",
  accent:       "#FF6B35",
  accentBg:     "#FFF3EE",
  accentBorder: "#FFD4C2",
  green:        "#16A34A",
  greenBg:      "#F0FDF4",
  greenBorder:  "#BBF7D0",
  yellow:       "#CA8A04",
  yellowBg:     "#FEFCE8",
  yellowBorder: "#FEF08A",
  red:          "#DC2626",
  redBg:        "#FEF2F2",
  redBorder:    "#FECACA",
  shadow:       "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
  shadowSm:     "0 1px 2px rgba(0,0,0,0.05)",
};

const PLAT_COLORS = { youtube: "#FF0000", x: "#000000", instagram: "#E1306C", linkedin: "#0077B5" };
const PLAT_ICON   = { youtube: "\u25B6", x: "\uD835\uDD4F", instagram: "\u25C9", linkedin: "in" };
const PLAT_LABEL  = { youtube: "YouTube", x: "X", instagram: "Instagram", linkedin: "LinkedIn" };

const sans = "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif";
const F    = { xl: 28, lg: 20, md: 15, sm: 13, xs: 11 };

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n) {
  if (!n && n !== 0) return "\u2014";
  n = parseInt(n);
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Quality tag config ──────────────────────────────────────────────────────
const QUALITY_CFG = {
  THOUGHTFUL: { label: "Thoughtful", bg: T.greenBg,  color: T.green,  border: T.greenBorder  },
  ENGAGED:    { label: "Engaged",    bg: T.yellowBg, color: T.yellow, border: T.yellowBorder },
  SPAM:       { label: "Spam",       bg: T.redBg,    color: T.red,    border: T.redBorder    },
};

// ─── Sample data ─────────────────────────────────────────────────────────────
const SAMPLE_COMMENTS = [
  {
    id: 1, platform: "x", author: "Sarah Chen", handle: "@sarahbuilds",
    followers: 45200, quality: "THOUGHTFUL",
    text: "This is a really important point about compounding content. I've been tracking my own growth and the posts I wrote 6 months ago are now driving 40% of my inbound. The lag effect is real and most people quit before they see it.",
    onPost: "Why most creators underestimate the compounding effect of consistent posting...",
    likes: 89, date: "2026-03-28T14:30:00Z",
  },
  {
    id: 2, platform: "linkedin", author: "James Okafor", handle: "james-okafor",
    followers: 12800, quality: "THOUGHTFUL",
    text: "I ran an experiment on this exact framework with my team last quarter. We saw a 3x improvement in pipeline velocity when we shifted from gated content to ungated insights. The trust-first approach works because it removes friction at the exact moment buyers are evaluating you.",
    onPost: "The counterintuitive reason why giving away your best content generates more revenue...",
    likes: 134, date: "2026-03-25T09:15:00Z",
  },
  {
    id: 3, platform: "instagram", author: "Priya Sharma", handle: "@priya.creates",
    followers: 8900, quality: "ENGAGED",
    text: "Saved this! Going to try implementing the 3-post framework this week. Quick question -- do you recommend batching all three at once or spacing them throughout the week?",
    onPost: "My 3-post content framework that tripled engagement in 30 days",
    likes: 23, date: "2026-03-24T16:45:00Z",
  },
  {
    id: 4, platform: "x", author: "Marcus Reid", handle: "@marcusreid",
    followers: 156000, quality: "THOUGHTFUL",
    text: "Hard agree. The brands winning right now are the ones that treat social like a product -- iterating based on data, not vibes. Your breakdown of the feedback loop between comments and content direction is something I haven't seen articulated this clearly before.",
    onPost: "Stop treating social media like a megaphone. Start treating it like a product.",
    likes: 312, date: "2026-03-22T11:00:00Z",
  },
  {
    id: 5, platform: "linkedin", author: "Elena Vasquez", handle: "elena-vasquez-mktg",
    followers: 34500, quality: "THOUGHTFUL",
    text: "This mirrors what we found at our Series B startup. The founders who build in public attract not just customers but potential hires and investors. It's a compounding trust asset. Would love to see you break down the specific metrics you track for 'audience quality' vs vanity metrics.",
    onPost: "Building in public isn't just a content strategy -- it's a business strategy",
    likes: 87, date: "2026-03-20T08:30:00Z",
  },
  {
    id: 6, platform: "x", author: "Dev Patel", handle: "@devpatel_io",
    followers: 22100, quality: "ENGAGED",
    text: "Just shared this with my entire marketing team. We've been debating this exact topic for weeks. Your data on the 72-hour engagement window is the evidence we needed to change our posting cadence.",
    onPost: "The 72-hour rule: why timing matters less than you think (with data)",
    likes: 56, date: "2026-03-18T13:20:00Z",
  },
  {
    id: 7, platform: "instagram", author: "Ava Thompson", handle: "@ava.strategy",
    followers: 67300, quality: "THOUGHTFUL",
    text: "The part about 'depth over reach' resonates deeply. I pivoted my entire content strategy 6 months ago from chasing impressions to optimizing for saves and meaningful comments. My follower count grew slower but my DM pipeline for consulting doubled. Quality audience > large audience every time.",
    onPost: "Why I stopped optimizing for reach and started optimizing for depth",
    likes: 201, date: "2026-03-15T10:00:00Z",
  },
  {
    id: 8, platform: "linkedin", author: "Tom Nguyen", handle: "tom-nguyen-cmo",
    followers: 89400, quality: "THOUGHTFUL",
    text: "Been following your content for a while and this is your best post yet. The distinction between 'audience building' and 'community building' is subtle but critical. Most B2B marketers conflate the two and end up with a large but disengaged following. Your framework for measuring community health is something I'm going to adapt for our quarterly reviews.",
    onPost: "Audience building vs community building: why the distinction matters for B2B",
    likes: 156, date: "2026-03-12T07:45:00Z",
  },
  {
    id: 9, platform: "x", author: "Lisa Park", handle: "@lisapark_writes",
    followers: 5600, quality: "ENGAGED",
    text: "This thread changed how I think about content repurposing. I used to just cross-post everywhere. Now I rewrite for each platform's native format. Already seeing 2x engagement on LinkedIn after adapting my X threads into carousel-style posts.",
    onPost: "Content repurposing is not cross-posting. Here's the difference...",
    likes: 41, date: "2026-03-10T15:30:00Z",
  },
  {
    id: 10, platform: "instagram", author: "Jordan Blake", handle: "@jordanblake",
    followers: 3200, quality: "ENGAGED",
    text: "Love this breakdown! Do you have a template or worksheet for the audience mapping exercise you mentioned? Would be super helpful for those of us just starting out.",
    onPost: "How to map your audience's actual pain points (not what you think they want)",
    likes: 18, date: "2026-03-08T12:00:00Z",
  },
  {
    id: 11, platform: "x", author: "Rachel Kim", handle: "@rachelkim",
    followers: 118000, quality: "THOUGHTFUL",
    text: "Nuanced take. The part about authenticity fatigue is spot on -- audiences can tell when 'being authentic' becomes a performance. The solution you propose of leading with utility and letting personality emerge naturally is a much healthier framework for sustainable content creation.",
    onPost: "Authenticity fatigue is real. Here's what to do instead.",
    likes: 278, date: "2026-03-05T09:00:00Z",
  },
  {
    id: 12, platform: "linkedin", author: "Carlos Martinez", handle: "carlos-martinez-saas",
    followers: 15700, quality: "ENGAGED",
    text: "Great post. We implemented a similar comment-first strategy at our SaaS company and saw our NPS scores improve alongside social engagement. There's definitely a flywheel between community engagement and product satisfaction that most companies miss.",
    onPost: "Why your social media comments are your best product feedback channel",
    likes: 62, date: "2026-03-02T11:30:00Z",
  },
  {
    id: 13, platform: "x", author: "SpamBot3000", handle: "@crypto_gains_now",
    followers: 150, quality: "SPAM",
    text: "Great post! Check out my profile for 10x returns guaranteed!!!",
    onPost: "Why most creators underestimate the compounding effect of consistent posting...",
    likes: 0, date: "2026-02-28T03:00:00Z",
  },
  {
    id: 14, platform: "instagram", author: "Nina Rodriguez", handle: "@nina.growth",
    followers: 28900, quality: "THOUGHTFUL",
    text: "The data you shared on comment-to-DM conversion rates is eye-opening. We've been tracking a similar metric internally and seeing around 8-12% of thoughtful commenters eventually becoming leads. Would be fascinating to compare notes on what types of content drive the highest quality conversations.",
    onPost: "How to turn your comment section into a pipeline (without being salesy)",
    likes: 94, date: "2026-02-25T14:00:00Z",
  },
  {
    id: 15, platform: "linkedin", author: "Alex Drummond", handle: "alex-drummond",
    followers: 42100, quality: "ENGAGED",
    text: "This is exactly what I needed to read today. I've been so focused on follower count that I forgot to actually engage with the followers I have. Starting a 30-day experiment where I respond to every comment within 2 hours.",
    onPost: "The engagement paradox: why chasing followers kills engagement",
    likes: 73, date: "2026-02-20T08:00:00Z",
  },
  {
    id: 16, platform: "x", author: "DropshipKing", handle: "@ez_money_2026",
    followers: 80, quality: "SPAM",
    text: "Yo this is fire bro follow back for follow lets grow together",
    onPost: "Authenticity fatigue is real. Here's what to do instead.",
    likes: 1, date: "2026-02-15T22:00:00Z",
  },
  {
    id: 17, platform: "instagram", author: "Mei Lin", handle: "@meilin.digital",
    followers: 19400, quality: "THOUGHTFUL",
    text: "I've been in content marketing for 8 years and your point about the shift from 'content as asset' to 'content as conversation' perfectly captures where the industry is heading. The brands that figure this out first will have an enormous competitive moat.",
    onPost: "Content as conversation: the next evolution of content marketing",
    likes: 112, date: "2026-02-10T10:30:00Z",
  },
  {
    id: 18, platform: "x", author: "Andre Williams", handle: "@andrewilliams",
    followers: 71200, quality: "ENGAGED",
    text: "Bookmarked. The framework for categorizing comments by intent (question, validation, debate, share) is incredibly practical. Already implemented it in our community management playbook.",
    onPost: "Not all comments are created equal. Here's how to categorize them for insights.",
    likes: 145, date: "2026-01-28T16:00:00Z",
  },
  {
    id: 19, platform: "linkedin", author: "Samantha Clarke", handle: "samantha-clarke-b2b",
    followers: 53800, quality: "THOUGHTFUL",
    text: "This resonates on multiple levels. At our company, we started treating every comment as a micro-conversation rather than a vanity metric. The result? Our average deal size increased 22% because sales could reference specific community discussions during calls. Social proof from genuine engagement beats any case study.",
    onPost: "How community engagement directly impacts revenue (with real numbers)",
    likes: 189, date: "2026-01-22T09:00:00Z",
  },
  {
    id: 20, platform: "x", author: "Ryan Foster", handle: "@ryanfoster_mktg",
    followers: 9800, quality: "ENGAGED",
    text: "Finally someone said it. The 'post and pray' era is over. Your data showing that reply rate correlates more strongly with growth than posting frequency is a wake-up call for every content team.",
    onPost: "Reply rate > posting frequency. Here's the data.",
    likes: 67, date: "2026-01-15T13:00:00Z",
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────
function PlatDot({ platform, size = 8 }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: size + 8, height: size + 8, borderRadius: "50%",
      background: (PLAT_COLORS[platform] || T.dim) + "18",
      fontSize: size * 0.8, flexShrink: 0,
      color: PLAT_COLORS[platform] || T.dim,
    }}>
      {PLAT_ICON[platform] || "\u00B7"}
    </span>
  );
}

function Pill({ children, active, onClick, color }) {
  return (
    <button onClick={onClick} style={{
      background: active ? (color || T.accent) : T.well,
      color:      active ? "#fff" : T.sub,
      border:     `1px solid ${active ? (color || T.accent) : T.border}`,
      borderRadius: 20, padding: "5px 14px", fontSize: F.xs, fontWeight: 600,
      fontFamily: sans, cursor: "pointer", transition: "all 0.12s",
    }}>{children}</button>
  );
}

function QualityBadge({ quality }) {
  const cfg = QUALITY_CFG[quality] || { label: quality, bg: T.well, color: T.dim, border: T.border };
  return (
    <span style={{
      display: "inline-block", background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`, borderRadius: 6, padding: "2px 8px",
      fontSize: F.xs, fontWeight: 600, fontFamily: sans,
    }}>{cfg.label}</span>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function CommentsTable({ platform, weekFilter }) {
  const [qualityFilter, setQualityFilter] = useState("ALL_GOOD"); // ALL_GOOD excludes spam
  const [sortBy, setSortBy]               = useState("date");
  const [comments, setComments]           = useState(SAMPLE_COMMENTS);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchComments() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("platform_comments")
          .select("*")
          .order("published_at", { ascending: false });

        if (error) throw error;

        if (!cancelled && data && data.length > 0) {
          const mapped = data.map((row, idx) => ({
            id:        row.id || idx,
            platform:  row.platform,
            author:    row.author_name,
            handle:    row.author_handle,
            followers: row.author_followers || 0,
            quality:   (row.quality_tag || "").toUpperCase(),
            text:      row.content,
            onPost:    row.video_title || row.post_id || "",
            likes:     row.likes || 0,
            date:      row.published_at,
          }));
          setComments(mapped);
        }
        // If data is empty or null, keep SAMPLE_COMMENTS as fallback
      } catch (err) {
        console.error("Failed to fetch comments:", err);
        // Keep SAMPLE_COMMENTS as fallback on error
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchComments();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let list = [...comments];

    // Platform filter from prop
    if (platform && platform !== "all") {
      list = list.filter(c => c.platform === platform);
    }

    // Week filter from prop
    if (weekFilter) {
      const weekStart = new Date(weekFilter + "T00:00:00Z");
      const weekEnd   = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      list = list.filter(c => {
        const d = new Date(c.date);
        return d >= weekStart && d < weekEnd;
      });
    }

    // Quality filter
    if (qualityFilter === "ALL_GOOD") {
      list = list.filter(c => c.quality !== "SPAM");
    } else if (qualityFilter !== "ALL") {
      list = list.filter(c => c.quality === qualityFilter);
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === "date")      return new Date(b.date) - new Date(a.date);
      if (sortBy === "likes")     return b.likes - a.likes;
      if (sortBy === "followers") return b.followers - a.followers;
      return 0;
    });

    return list;
  }, [comments, platform, weekFilter, qualityFilter, sortBy]);

  // Summary stats (from filtered, excluding spam)
  const nonSpam      = filtered.filter(c => c.quality !== "SPAM");
  const thoughtful   = filtered.filter(c => c.quality === "THOUGHTFUL").length;
  const engaged      = filtered.filter(c => c.quality === "ENGAGED").length;
  const avgFollowers = nonSpam.length > 0
    ? Math.round(nonSpam.reduce((s, c) => s + c.followers, 0) / nonSpam.length)
    : 0;

  return (
    <div>
      {/* Section title */}
      <div style={{
        fontFamily: sans, fontSize: F.lg, fontWeight: 700, color: T.text,
        marginBottom: 18, letterSpacing: "-0.01em",
      }}>
        Comments
      </div>

      {/* Summary stats row */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        {[
          { label: "Total",      value: filtered.length, color: T.text,   bg: T.card,     border: T.border },
          { label: "Thoughtful", value: thoughtful,       color: T.green,  bg: T.greenBg,  border: T.greenBorder },
          { label: "Engaged",    value: engaged,          color: T.yellow, bg: T.yellowBg, border: T.yellowBorder },
          { label: "Avg followers", value: fmt(avgFollowers), color: T.sub, bg: T.card,    border: T.border },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10,
            padding: "10px 16px", flex: "1 1 120px", minWidth: 110, boxShadow: T.shadowSm,
          }}>
            <div style={{ fontFamily: sans, fontSize: F.xs, color: T.dim, marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontFamily: sans, fontSize: F.lg, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters and sort */}
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim, marginRight: 4 }}>Quality:</span>
        <Pill active={qualityFilter === "ALL_GOOD"} onClick={() => setQualityFilter("ALL_GOOD")} color={T.accent}>
          All
        </Pill>
        <Pill active={qualityFilter === "THOUGHTFUL"} onClick={() => setQualityFilter("THOUGHTFUL")} color={T.green}>
          Thoughtful
        </Pill>
        <Pill active={qualityFilter === "ENGAGED"} onClick={() => setQualityFilter("ENGAGED")} color={T.yellow}>
          Engaged
        </Pill>
        <Pill active={qualityFilter === "ALL"} onClick={() => setQualityFilter("ALL")}>
          Include spam
        </Pill>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>Sort:</span>
          {[
            { key: "date",      label: "Date" },
            { key: "likes",     label: "Likes" },
            { key: "followers", label: "Followers" },
          ].map(s => (
            <button key={s.key} onClick={() => setSortBy(s.key)} style={{
              background: sortBy === s.key ? T.accent : "transparent",
              color:      sortBy === s.key ? "#fff" : T.sub,
              border:     `1px solid ${sortBy === s.key ? T.accent : T.border}`,
              borderRadius: 6, padding: "3px 10px", fontSize: F.xs, fontWeight: 600,
              fontFamily: sans, cursor: "pointer", transition: "all 0.12s",
            }}>{s.label}</button>
          ))}
        </div>
      </div>

      {/* Comment cards */}
      {loading ? (
        <div style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
          padding: "40px 24px", textAlign: "center", boxShadow: T.shadowSm,
        }}>
          <div style={{ fontFamily: sans, fontSize: F.sm, color: T.dim }}>
            Loading comments...
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
          padding: "40px 24px", textAlign: "center", boxShadow: T.shadowSm,
        }}>
          <div style={{ fontFamily: sans, fontSize: F.sm, color: T.dim }}>
            No comments match the current filters.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(c => {
            const isSpam = c.quality === "SPAM";
            return (
              <div key={c.id} style={{
                background: isSpam ? T.well : T.card,
                border: `1px solid ${isSpam ? T.border : T.border}`,
                borderRadius: 12, padding: "16px 20px",
                boxShadow: isSpam ? "none" : T.shadowSm,
                opacity: isSpam ? 0.6 : 1,
                transition: "box-shadow 0.15s",
              }}>
                {/* Header row: author + quality + date */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                  <PlatDot platform={c.platform} size={12} />
                  <span style={{ fontFamily: sans, fontSize: F.sm, fontWeight: 600, color: T.text }}>
                    {c.author}
                  </span>
                  <span style={{ fontFamily: sans, fontSize: F.xs, color: T.dim }}>
                    {c.platform === "linkedin" ? c.handle : c.handle}
                  </span>
                  <span style={{
                    fontFamily: sans, fontSize: F.xs, color: T.dim,
                    background: T.well, borderRadius: 4, padding: "1px 6px",
                    border: `1px solid ${T.border}`,
                  }}>
                    {fmt(c.followers)} followers
                  </span>
                  <QualityBadge quality={c.quality} />
                  <span style={{ marginLeft: "auto", fontFamily: sans, fontSize: F.xs, color: T.dim }}>
                    {fmtDate(c.date)}
                  </span>
                </div>

                {/* Comment text */}
                <div style={{
                  fontFamily: sans, fontSize: F.sm, color: T.text, lineHeight: 1.55,
                  marginBottom: 10,
                }}>
                  {c.text}
                </div>

                {/* Footer: on post + likes */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{
                    flex: "1 1 auto", fontFamily: sans, fontSize: F.xs, color: T.dim,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    maxWidth: 500,
                  }}>
                    On: <span style={{ color: T.sub, fontStyle: "italic" }}>
                      {c.onPost.length > 80 ? c.onPost.slice(0, 80) + "\u2026" : c.onPost}
                    </span>
                  </div>
                  <div style={{
                    fontFamily: sans, fontSize: F.xs, fontWeight: 600,
                    color: c.likes >= 100 ? T.green : c.likes >= 30 ? T.text : T.sub,
                    display: "flex", alignItems: "center", gap: 3, flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 11 }}>{"\u2665"}</span> {c.likes}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
