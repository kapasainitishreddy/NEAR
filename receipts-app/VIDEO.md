# Videos

Two videos are generated from the real app, with no external services.

| File | What | Size |
| --- | --- | --- |
| `promo/receipts-promo.webm` | 24s vertical promo (animated scenes) | 1080×1920 |
| `demo/receipts-demo.webm` | How-to walkthrough (live interactions + captions) | 460×1000 |

## Regenerate the WebM files

```bash
cd receipts-app
npm run build
npm run preview -- --port 4319 &           # serve the build
BASE=http://localhost:4319 node scripts/promo/record.cjs
BASE=http://localhost:4319 node scripts/demo/record-demo.cjs
```

## MP4 + voiceover narration

WebM screen-captures have **no audio track**, so narration is added during MP4
conversion. This runs in CI (`.github/workflows/videos.yml`) — open the Actions
tab → "Render Videos" → Run, then download the `receipts-videos-mp4` artifact.

It produces, for each video:
- `<name>.mp4` — silent, H.264 (universal playback)
- `<name>-narrated.mp4` — with a synthesized voiceover from
  `scripts/narration/*.txt`

To run locally (needs `ffmpeg` + `espeak-ng`):

```bash
cd receipts-app && bash scripts/videos/make-mp4.sh   # → video-out/
```

> The CI narration uses `espeak-ng` (offline, robotic but reliable). For a
> natural voice, swap in [Piper](https://github.com/rhasspy/piper) or the HeyGen
> path below.

## HeyGen HyperFrames (high-quality, hosted) — TODO

When the **HyperFrames by HeyGen** MCP server is reconnected, rebuild both
videos as hosted HyperFrames projects (shareable `app.heygen.com` link + cloud
MP4 render with an avatar/voiceover). The storyboards are ready to drop in:

### Promo (6 scenes)
1. Logo · "Receipts — save what you decided, say what you need."
2. "Find the words when it's hard." (panic scripts)
3. "Remember why you chose." (decision receipts)
4. "See how you decide." (insights)
5. "Make it yours." (themes / keepsakes)
6. "Private by design. Local-first. Yours alone."

Narration: `scripts/narration/promo.txt`

### Demo (5 steps)
1. Generate a calm script in three tones — edit, copy, or listen.
2. Record why you decided (clarity score, decision matrix, pros/cons).
3. See how you decide over time (calibration + your tells).
4. Everything in your Library — search & filter.
5. Make it yours with four themes. Private, local-first.

Narration: `scripts/narration/demo.txt`
