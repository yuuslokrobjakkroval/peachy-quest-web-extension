'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID) {
  console.error('Missing DISCORD_TOKEN and/or CLIENT_ID in .env — copy .env.example to .env and fill it in.');
  process.exit(1);
}

const commandsDir = path.join(__dirname, 'commands');
const commands = fs
  .readdirSync(commandsDir)
  .filter((f) => f.endsWith('.js'))
  .map((file) => require(path.join(commandsDir, file)).data.toJSON());

const rest = new REST().setToken(DISCORD_TOKEN);

(async () => {
  try {
    const route = GUILD_ID
      ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
      : Routes.applicationCommands(CLIENT_ID);

    const result = await rest.put(route, { body: commands });

    const scope = GUILD_ID ? `guild ${GUILD_ID}` : 'globally';
    console.info(`Registered ${result.length} command(s) ${scope}: ${commands.map((c) => c.name).join(', ')}`);
    if (!GUILD_ID) {
      console.info('Global registration can take up to ~1 hour to propagate to every server.');
    }
  } catch (error) {
    console.error('Failed to register commands:', error);
    process.exit(1);
  }
})();
