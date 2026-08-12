# Deploying this project

Two independent pieces, deployed differently:

- **The extension** runs entirely inside each user's own browser. There is nothing to "host" — deploying it means *distributing* it so people can load it.
- **The companion bot** (`discord-bot/`) is a normal Node.js process that needs a server to stay online and connected to Discord 24/7. This is the part that needs "hosting."

They don't share a deploy pipeline — the only link between them is manual (copy JSON from the extension panel → paste into `/quest-status`).

---

## 1. Extension — distribution, not hosting

| Option | Effort | Notes |
|---|---|---|
| **Load unpacked** (current README flow) | none | Fine for you and anyone comfortable with `chrome://extensions` + Developer mode. |
| **Zip + GitHub Release** | low | Best default for sharing with others. |
| **Chrome Web Store** | high, $5 one-time | Not recommended here — see below. |

**Zip + GitHub Release** (recommended for sharing):
```bash
cd "F:/Project/Website/peachy-quest-web-extension"
zip -r peachy-quest-extension.zip manifest.json background.js quest-code.js quest-home.js \
  rules.json user-agent-check.js user-agent-override.js assets LICENSE PRIVACY.md
```
Attach the zip to a [GitHub Release](https://github.com/yuuslokrobjakkroval/peachy-quest-web-extension/releases). Users download → unzip → `chrome://extensions` → Developer mode → **Load unpacked**.

**Why not the Chrome Web Store:** the Web Store review process (and Discord itself, via takedown requests) actively targets extensions that automate Discord account actions — your own README already documents Discord's April 2026 crackdown. A store listing is more likely to get pulled after the fact than to stay up, and a $5 fee for something likely to be delisted isn't worth it. Self-distribution via GitHub/your Discord server is the realistic path.

---

## 2. Companion bot — needs a host

The bot just needs a place to run `node src/index.js` (or the provided `Dockerfile`/`ecosystem.config.js`) continuously. Comparison of realistic options as of Aug 2026:

| Option | Cost | Effort | Uptime reliability | Best for |
|---|---|---|---|---|
| **Your own PC + pm2** | $0 | lowest | tied to your PC being on | testing right now |
| **Oracle Cloud Always Free (ARM VM)** | $0 forever | medium (SSH/Linux) | high, but signup can get rejected | real 24/7 hosting |
| **Free Discord-bot panel host** (Bot-Hosting.net, Wispbyte, etc.) | $0 | lowest | variable — some require periodic renewal/voting, ad-supported | quick & easy, low-stakes |
| **Fly.io** | free allowance, card required | medium | good | if Oracle signup fails |
| **Railway** | ~$5/mo (free trial credit only) | lowest | good | if you don't mind paying |

### Recommended path: start local, graduate to Oracle Cloud

**Step 1 — run it locally right now** (you already have Node 24 installed):
```bash
cd discord-bot
npm install -g pm2
npx pm2 start ecosystem.config.js
npx pm2 save
npx pm2 logs peachy-quest-bot   # watch it come online
```
This keeps the bot running (and auto-restarting on crash) as long as your PC is on. Good enough to test everything end-to-end today.

**Step 2 — move to Oracle Cloud Always Free for real 24/7 uptime** (genuinely free forever, not a trial — 4 ARM OCPUs / 24GB RAM tier, though signup approval can occasionally be rejected on first try):

1. Sign up at [oracle.com/cloud/free](https://www.oracle.com/cloud/free/) (card required for identity verification only; nothing is charged while you stay in Always Free limits).
2. Create a VM instance → shape: **VM.Standard.A1.Flex** (Ampere/ARM, Always Free-eligible) → Ubuntu image.
3. SSH in, then:
   ```bash
   sudo apt update && sudo apt install -y nodejs npm git
   git clone https://github.com/yuuslokrobjakkroval/peachy-quest-web-extension.git
   cd peachy-quest-web-extension/discord-bot
   npm install
   cp .env.example .env
   nano .env            # paste your DISCORD_TOKEN / CLIENT_ID etc.
   npm run deploy       # registers slash commands
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup          # follow its printed command so pm2 survives a reboot
   ```
4. Open the security list/NSG for outbound traffic (usually open by default — the bot only makes outbound connections, no inbound port needed).

Alternative if you'd rather use containers (also works on Fly.io, Railway's Docker deploy, or the same Oracle VM):
```bash
cd discord-bot
docker build -t peachy-quest-bot .
docker run -d --name peachy-quest-bot --restart unless-stopped --env-file .env -v "$(pwd)/data:/app/data" peachy-quest-bot
```

**Fallback — dedicated free bot-hosting panels** (zero server management, upload-and-click): Bot-Hosting.net, Wispbyte, or Kerit Cloud all currently advertise free, no-credit-card, always-on Node.js hosting aimed specifically at Discord bots. Treat these as "good enough to get started," not guaranteed-forever — they're smaller operations, some require periodic re-activation or joining their Discord for support. Upload the `discord-bot/` folder (after `npm install` locally, or let their panel run `npm install`), set the entry point to `src/index.js`, and paste your `.env` values into their panel's environment-variable UI (never commit `.env` to git).

---

## 3. End-to-end verification checklist

1. Bot host: `pm2 logs peachy-quest-bot` (or your panel's log viewer) shows `Logged in as <YourBot>#0000 — 6 command(s) loaded.`
2. In your Discord server, type `/` and confirm all six commands autocomplete (`quest-status`, `quest-guide`, `report-completion`, `leaderboard`, `quest-announce`, `report-issue`).
3. Run `/quest-guide` — should reply with the install/usage embed.
4. Load the extension (unpacked or from your zip), go to `discord.com/quest-home`, click **Running Quests**, expand the panel, click **Copy JSON**.
5. Run `/quest-status data:<pasted JSON>` — should reply ephemerally with your quest progress bars.
6. Run `/report-completion quest_name:Test` then `/leaderboard` — should show you with 1 completion.
7. As a server admin, run `/quest-announce` — should post the embed (non-admins shouldn't see this command at all in their `/` list).
