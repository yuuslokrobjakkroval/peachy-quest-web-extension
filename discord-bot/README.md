# Peachy Quest Companion Bot

A companion Discord bot for the extension's community. It does **not** automate,
log into, or otherwise touch anyone's Discord account — it's slash commands only,
for status display, onboarding, a self-reported leaderboard, staff announcements,
and issue reporting.

> **Why not have the bot run the quest itself?** Discord quests only exist on real
> human accounts, not bot accounts. The only way to progress one programmatically
> is to act as that specific person using their own personal auth token — that's
> "self-botting," and it's against Discord's Terms of Service / Developer Policy
> (Discord has been actively cracking down on it — see the main [README](../README.md)).
> This bot intentionally never asks for, stores, or uses anyone's account token.

## Commands

| Command | Who | What it does |
|---|---|---|
| `/quest-status [data]` | everyone | Renders a progress embed from JSON copied off the extension panel |
| `/quest-guide` | everyone | Posts install/usage steps + links |
| `/report-completion <quest_name> [note]` | everyone | Honor-system self-report, feeds the leaderboard |
| `/leaderboard` | everyone | Top 10 self-reporters in the server |
| `/quest-announce <title> <message> [channel]` | staff (Manage Server) | Posts a formatted announcement embed |
| `/report-issue <description>` | everyone | Logs a bug report, optionally forwards it to a support channel |

## Setup

1. **Create the Discord application**
   - Go to the [Discord Developer Portal](https://discord.com/developers/applications) → **New Application**.
   - **Bot** tab → **Reset Token** → copy it (this is your `DISCORD_TOKEN`, keep it secret).
   - **General Information** tab → copy the **Application ID** (this is your `CLIENT_ID`).

2. **Invite the bot to your server**
   - **OAuth2 → URL Generator** → scopes: `bot`, `applications.commands`.
   - Bot permissions: `Send Messages`, `Embed Links`, `Read Message History` (that's all it needs).
   - Open the generated URL and add it to your server.

3. **Configure**
   ```bash
   cd discord-bot
   cp .env.example .env
   # fill in DISCORD_TOKEN and CLIENT_ID (and optionally GUILD_ID for instant
   # command sync while testing, ANNOUNCE_CHANNEL_ID, SUPPORT_CHANNEL_ID)
   ```

4. **Install & run**
   ```bash
   npm install
   npm run deploy   # registers the slash commands
   npm start        # logs the bot in
   ```

## Hosting

Anything that can run a long-lived Node process works: a small VPS with `pm2`
(`pm2 start src/index.js --name peachy-quest-bot`), Railway, Render, or a
systemd service. No database server is required — state lives in
`data/db.json`, created automatically on first write.

## Data

`data/db.json` stores only: self-reported completions (`userId`, `quest_name`,
optional note, timestamp) and issue reports (`userId`, `description`,
timestamp). Nothing account-related, nothing that lets the bot act as anyone.
