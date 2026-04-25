# Scanner Agent — PWA

Mobile-first document scanner. Capture pages with your camera (or upload images and PDFs), extract text via Gemini + Groq vision models, and download a searchable PDF + plain text file. Installable to your phone's home screen as a real-feeling app.

## What's in this folder

```
scanner-pwa/
├── index.html               ← the app
├── manifest.json            ← PWA app metadata
├── sw.js                    ← service worker (offline shell + installability)
└── icons/
    ├── icon-192.png         ← Android home screen icon
    ├── icon-512.png         ← Android splash screen
    ├── icon-192-maskable.png ← Android adaptive icon
    ├── icon-512-maskable.png ← Android adaptive icon
    ├── apple-touch-icon.png ← iOS home screen icon
    └── favicon-32.png       ← browser tab icon
```

## Prerequisites

You need a deployed Cloudflare Worker that handles the OCR provider fallback (Gemini → Groq). See the deployment guide for setup.

## How to deploy on GitHub Pages

### Option A — Web upload (no Git knowledge needed)

1. Go to https://github.com/new
2. Name the repo: `scanner-agent` (or anything you like)
3. Set visibility to **Public** (required for free Pages)
4. Check **Add a README file**
5. Click **Create repository**
6. On the repo page, click **Add file** → **Upload files**
7. Drag the entire contents of this `scanner-pwa` folder into the upload area:
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - the entire `icons/` folder (drag it as a folder, not individual files)
8. Scroll to bottom, click **Commit changes**
9. Click **Settings** tab in your repo
10. Left sidebar → **Pages**
11. Source: **Deploy from a branch** | Branch: **main** | Folder: **/ (root)**
12. Click **Save**
13. Wait 1–2 minutes for the first deploy
14. Refresh — you'll see "Your site is live at https://<username>.github.io/scanner-agent/"

### Option B — Git CLI

```bash
git clone https://github.com/<username>/scanner-agent.git
cd scanner-agent
# copy this folder's contents into the repo
git add .
git commit -m "Deploy Scanner Agent PWA"
git push origin main
```

Then enable Pages from repo Settings → Pages.

## After deploy — first use

1. Open the GitHub Pages URL in **Chrome** on your Android phone
2. Tap the gear icon (top-right) in the scanner
3. Paste your Cloudflare Worker URL
4. Tap **Save**
5. Go back, capture or upload a page, tap **Process & extract**

## Installing as an app on Android

1. Open the URL in **Chrome** on Android
2. After ~10 seconds, an **"⬇ Install app"** badge appears in the bottom-right
3. Tap it
4. Confirm the install in the system dialog
5. The Scanner icon appears on your home screen
6. Tap the icon — opens in standalone full-screen mode (no Chrome UI)

If the **Install app** badge doesn't appear automatically:

- Make sure you're using Chrome (not Samsung Internet, not Firefox)
- Use the URL with `https://` (the GitHub Pages URL is HTTPS by default)
- Check Chrome's **⋮ menu → Install app** option directly

## Installing as an app on iOS (iPhone)

1. Open the URL in **Safari** (not Chrome — iOS only allows Safari to install PWAs)
2. Tap the **Share** button (square with arrow)
3. Tap **Add to Home Screen**
4. Confirm

Note: iOS PWAs have more limitations than Android — camera permission may need to be granted on every launch.

## Updating the app

When you make changes:

1. Update the file(s) in your GitHub repo (web upload or `git push`)
2. GitHub Pages redeploys in 1–2 minutes
3. Users get the new version on next launch (the service worker fetches fresh HTML)

If users have stale caches, they can:
- Pull-to-refresh inside the app
- Or close and reopen the app

## File-by-file notes

**index.html** — The full app. Self-contained except for CDN-loaded libraries (jsPDF, PDF.js, OpenCV).

**manifest.json** — Tells the browser this is an installable app. Edit `name`, `theme_color`, etc. as you like.

**sw.js** — Service worker. Caches the app shell so the UI loads on flaky connections. Never caches the OCR API calls.

**icons/** — App icons in various sizes. The 192px and 512px PNGs are required for Android installability.

## Troubleshooting

**"Install app" doesn't appear**

Open Chrome DevTools (or chrome://inspect from a connected desktop) on the live URL and check:
- Application tab → Manifest — should show no errors
- Application tab → Service Workers — should show `activated and running`

**Service worker doesn't update**

After deploying changes, force-update by:
- Closing all tabs/instances of the app
- Reopening — sw.js refetches and activates

**Icons don't show after install**

Check that the icon paths in `manifest.json` match the actual file locations. Default is `icons/icon-192.png` etc., relative to the manifest's location.
