export const metadata = {
  title: "Audian",
  description: "Social intelligence for thoughtful brands.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Audian" },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport = {
  width: "device-width", initialScale: 1, maximumScale: 1,
  userScalable: false, themeColor: "#141412",
};

const THEME_SCRIPT = `(function(){
  try {
    var t = localStorage.getItem("theme") || "dark";
    var bg = t === "light" ? "#D4CCB8" : "#141412";
    var el = document.documentElement;
    el.style.setProperty("background", bg, "important");
    el.style.setProperty("background-color", bg, "important");
    el.setAttribute("data-theme", t);
    if (document.body) {
      document.body.style.setProperty("background", bg, "important");
      document.body.style.setProperty("background-color", bg, "important");
    }
  } catch(e) {}
})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head><script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} /></head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}