export default function Privacy() {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "60px 24px", fontFamily: "Georgia, serif", color: "#222" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: "#666", marginBottom: 40 }}>Last updated: March 2026</p>

      <h2 style={{ fontSize: 20, marginTop: 32 }}>What we collect</h2>
      <p>Audian collects social media analytics data from platforms you explicitly connect, including follower counts, engagement metrics, and public interaction data. We store your email address for authentication purposes.</p>

      <h2 style={{ fontSize: 20, marginTop: 32 }}>How we use your data</h2>
      <p>Your data is used solely to provide you with social media analytics and insights within the Audian dashboard. We do not sell, share, or distribute your personal data or social media data to third parties.</p>

      <h2 style={{ fontSize: 20, marginTop: 32 }}>Connected platforms</h2>
      <p>When you connect a social media account, Audian receives an access token from that platform. This token is stored securely and used only to fetch your account analytics. You can disconnect any platform at any time.</p>

      <h2 style={{ fontSize: 20, marginTop: 32 }}>Data retention</h2>
      <p>We retain your analytics data for as long as your account is active. You may request deletion of your account and all associated data at any time by contacting us.</p>

      <h2 style={{ fontSize: 20, marginTop: 32 }}>Contact</h2>
      <p>For privacy-related questions, contact us at <a href="mailto:hello@audian.app">hello@audian.app</a>.</p>
    </div>
  );
}