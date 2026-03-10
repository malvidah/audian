# audian-playwright

Private Playwright screenshot + scrape service for Audian. Runs authenticated Chrome sessions using your own Instagram session cookies — nothing leaves your own infrastructure.

## Endpoints

All endpoints require `x-auth-token: <AUTH_TOKEN>` header.

### `POST /screenshot`
Returns a JPEG screenshot of any URL as base64.
```json
{
  "url": "https://www.instagram.com/annakaofficial/",
  "cookies": [...],
  "waitFor": 2500
}
```
Response: `{ "image": "<base64 jpeg>" }`

### `POST /scrape`
Extracts structured data from a page.
```json
{
  "url": "https://www.instagram.com/annakaofficial/",
  "cookies": [...],
  "extract": "profile"
}
```
`extract` options: `profile` | `mentions` | `post_interactions` | `raw_text`

### `POST /scroll-scrape`
Scrolls a feed page and collects items across multiple scroll steps.
```json
{
  "url": "https://www.instagram.com/accounts/activity/",
  "cookies": [...],
  "scrolls": 10
}
```

### `GET /health`
Returns `{ "ok": true }`.

## Deploy to Railway

1. Push this repo to GitHub
2. Go to railway.app → New Project → Deploy from GitHub repo
3. Add environment variables:
   - `AUTH_TOKEN` — a secret string you choose (e.g. a random UUID)
   - `PORT` — Railway sets this automatically
4. Railway will build the Docker image and deploy

## Environment variables in Audian (Vercel)

Once deployed, add to Vercel:
- `PLAYWRIGHT_SERVICE_URL` — your Railway URL e.g. `https://audian-playwright.up.railway.app`
- `PLAYWRIGHT_AUTH_TOKEN` — same value as `AUTH_TOKEN` above
- `INSTAGRAM_COOKIES` — JSON array from Cookie-Editor on instagram.com

## Cookie refresh

Instagram session cookies last ~6 months. When they expire, re-export from Cookie-Editor
on instagram.com and update the `INSTAGRAM_COOKIES` env var in Vercel.
