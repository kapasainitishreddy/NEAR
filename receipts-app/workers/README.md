# Receipts backends (Cloudflare Workers)

Two tiny, free-tier Workers power the optional cloud features. The app works
fully without them — these just switch on the AI Co-pilot and aggregated friend
polls. Each takes ~3 minutes to deploy.

Prereqs: a free [Cloudflare account](https://dash.cloudflare.com/sign-up) and
`npx wrangler login`.

## 1. AI Co-pilot proxy (`ai-proxy/`)
Keeps your Anthropic key server-side.

```bash
cd workers/ai-proxy
npx wrangler secret put ANTHROPIC_API_KEY   # paste your Anthropic key
npx wrangler deploy
```
Copy the deployed URL (e.g. `https://receipts-ai-proxy.you.workers.dev`) into
`src/config.js → AI.endpoint`.

> Recommended: set `ALLOWED_ORIGIN` in `wrangler.toml` to your app's URL to lock
> down CORS, and add rate-limiting (Cloudflare dashboard → Security) before going
> wide.

## 2. Friend polls (`polls/`)
Stores anonymous "what would you do?" polls in KV.

```bash
cd workers/polls
npx wrangler kv namespace create POLLS      # copy the printed id…
# …paste it into wrangler.toml -> kv_namespaces.id
npx wrangler deploy
```
Copy the deployed URL into `src/config.js → SOCIAL.pollsEndpoint`, and set
`SOCIAL.webBaseUrl` to wherever the web app is hosted (so shared poll links
resolve, e.g. `https://your-app.netlify.app`).

## After configuring
Rebuild the app (`npm run build`) and redeploy/sync. The AI buttons and a real
poll-creation flow turn on automatically; until then both degrade gracefully
(AI buttons explain they need setup; "Ask for advice" just shares text).
