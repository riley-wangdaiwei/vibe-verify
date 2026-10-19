# Vibe &amp; Verify

A personal engineering learning companion — a working set, not an archive.

Learn it → ✕ it → it's gone. No history, no undo, on purpose.

## What it is

Five tabs, two tracks (startup engineering / economics & math research):

- **feed** — short records of real coding sessions (task, files, why, decisions, tests, concepts)
- **concepts** — searchable bite-size lessons with code, why/when, common mistakes
- **reading** — small curated resource list (official docs / academic / practitioner)
- **quiz** — answer first, explanation reveals after; self-rate, no proficiency claims
- **practice** — exercises with hidden hints/solutions and a scratch pad
- **roadmap** — the 8 AI-era priorities + 8 engineering-mindset principles (static reference)

## Data

Everything lives in the browser's `localStorage` (`vibe-verify-v1`). Nothing leaves
the device. Clicking ✕ on any card deletes it permanently — there is no trash,
no archive. Seed items are tagged EXAMPLE.

## Run / deploy

Any static host. Deployed with GitHub Pages from `main`.

## Edit

- Content seeds live in `app.js` (`SEED`, `ROADMAP`, `PRINCIPLES`).
- After changing `app.js`, bump `?v=` in `index.html` so phones don't hold a stale copy.
- Push to `main`; Pages redeploys automatically.
