# Receipts

**Save what you decided. Say what you need.**

Receipts is a **local-first personal clarity app** for calm scripts, decision
receipts, saved drafts, reviews, and personal rules. It helps you find the words
for hard messages and remember *why* you made the choices you made.

Everything lives on your device. There is **no backend, no login, no cloud
database, no analytics, and no tracking**.

> Your scripts, decisions, notes, and reviews stay on this device. Nothing is
> uploaded unless you export it yourself.

---

## ✨ Features

- **Onboarding** — a calm, 4-step intro you can skip or explore with sample data.
- **Home dashboard** — greeting, quick actions, stats, “time to review”, and recents.
- **Panic Script generator** — 12 situations (apology, boundary, refund, rent,
  professor extension, sick leave, payment follow-up, support complaint, roommate
  conflict, canceling plans, asking for clarification, negotiating price), each
  generating **three editable tones**: Soft · Direct · Professional. Generated
  **locally from templates — no AI API required**.
- **Decision Receipt creator** — capture title, final decision, options, main
  reason, pros, cons, risks, feelings, evidence, who influenced you, what would
  change your mind, a note to future-you, review date, and category.
- **Library** — every saved item with **search** and **filters** by kind
  (scripts / receipts / favorites / follow-ups / reviews) and status.
- **Review reminders** — set a review date; due items surface on Home.
- **Personal Rules** — the promises you make to yourself, with optional notes.
- **Statuses** — Draft · Sent · Resolved · Follow-up needed · Reviewed.
- **Export / Import** — download a JSON backup you control, or merge one back in.
- **Clear all data / factory reset** — wipe entries or reset the whole app.
- **Settings / privacy** — a transparent summary of how your data is handled.
- **PWA support** — installable, works offline via a service worker.

## 🎨 Design

Calm, rich, minimal, trustworthy — an *emotional productivity* feel somewhere
between Apple Notes, Notion, and Reflectly, but simpler. Deep navy + charcoal
canvas, warm ivory type, muted gold and soft lavender/emerald accents, rounded
cards, soft shadows, large readable serif headings, beautiful empty states,
bottom navigation, and gentle micro-interactions.

## 🧱 Tech stack

- **React 18** + **Vite 5**
- **Tailwind CSS 3**
- **Framer Motion** for transitions and micro-interactions
- **localForage** (IndexedDB with a localStorage fallback) for local-first storage
- **React Router** (hash router, static-host friendly)
- Hand-written **service worker** + web app manifest for PWA/offline

No backend. No environment variables required.

## 🚀 Run locally

```bash
# from the receipts-app/ folder
npm install
npm run dev
```

Then open the URL Vite prints (default http://localhost:5173).

### Build for production

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally
```

## 📁 Project structure

```
receipts-app/
├── index.html
├── public/
│   ├── manifest.webmanifest
│   ├── service-worker.js
│   └── icons/icon.svg
└── src/
    ├── main.jsx                # entry + service worker registration
    ├── App.jsx                 # routes, layout, onboarding gate
    ├── index.css               # Tailwind layers + theme tokens
    ├── context/AppContext.jsx  # global state, storage orchestration, toasts
    ├── lib/
    │   ├── db.js               # localForage CRUD, export/import, wipe
    │   ├── scriptTemplates.js  # 12 categories × 3 tones, local generator
    │   ├── sampleData.js        # removable demo content
    │   ├── constants.js        # statuses, categories, kinds
    │   ├── format.js           # date helpers
    │   ├── id.js               # id generator
    │   └── cn.js               # classnames helper
    ├── components/             # ui.jsx, icons, BottomNav, TopBar, Modal, Toast, ItemCard
    └── screens/                # Onboarding, Home, ScriptGenerator, ReceiptCreator,
                                # Library, Rules, DetailView, Settings
```

## 🔒 Privacy

- All data is stored **only** in your browser via IndexedDB/localStorage.
- The app makes **no network requests** for your content. The only external
  request is loading a web font; remove the `<link>` in `index.html` to make it
  fully offline.
- The service worker caches the app shell so it keeps working offline. It never
  transmits your data.
- Export produces a local file **you** choose to share or keep.

## ⚠️ Safety

Receipts is a writing and reflection tool, **not legal, medical, financial, or
therapy advice**. Review anything before sending or acting on it.

## 📄 License

No license is included yet. All rights reserved until one is added.
