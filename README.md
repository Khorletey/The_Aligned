# The Aligned · O'Merlin Academy

Offline-first web app: the 66-Day Total Alignment Challenge and the 28-week Powerhouse Programme.

## Deploy
Upload this folder's contents (index.html at the top level) to any static host:
Cloudflare Pages, Netlify, Vercel or GitHub Pages. No build step and no server needed.
The site must be served over HTTPS for install and offline mode to work.

`_headers` stops hosts that read it (Cloudflare Pages, Netlify) from caching the service worker,
so updates reach people promptly.

## Updating
After changing any file, regenerate sw.js's asset list so phones pick up the new version.
Members then see "A new version is ready · Update".

## Data
Everything is stored on each person's device (localStorage). Members back up and restore
with a .json file under Settings & backup. Nothing is sent to a server.
