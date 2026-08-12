'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');

if (!process.env.DISCORD_TOKEN) {
  console.error('Missing DISCORD_TOKEN in .env — copy .env.example to .env and fill it in.');
  process.exit(1);
}

// Slash-command interactions only — no message content intent needed, which keeps
// this bot out of Discord's privileged-intent verification requirements entirely.
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commandsDir = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsDir).filter((f) => f.endsWith('.js'))) {
  const command = require(path.join(commandsDir, file));
  if (!command?.data || !command?.execute) {
    console.warn(`[commands] Skipping ${file} — missing "data" or "execute" export.`);
    continue;
  }
  client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, (readyClient) => {
  console.info(`Logged in as ${readyClient.user.tag} — ${client.commands.size} command(s) loaded.`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.warn(`[commands] No handler for /${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`[commands] /${interaction.commandName} failed:`, error);
    const payload = { content: 'Something went wrong running that command.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
