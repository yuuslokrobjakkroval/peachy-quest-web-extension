'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed } = require('../lib/embeds');

const REPO_URL = 'https://github.com/yuuslokrobjakkroval/peachy-quest-web-extension';
const SUPPORT_URL = 'https://discord.gg/peachygang';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quest-guide')
    .setDescription('Get install & usage steps for the Peachy Quest extension'),

  async execute(interaction) {
    const embed = baseEmbed({ title: 'Peachy Quest Extension — Quick Guide' })
      .addFields(
        {
          name: 'Install',
          value: [
            '1. Download/clone the repo.',
            '2. `chrome://extensions/` → enable **Developer mode**.',
            '3. **Load unpacked** → select the extension folder.',
          ].join('\n'),
        },
        {
          name: 'Use',
          value: [
            '1. Open `discord.com/quest-home` and accept your quests.',
            '2. Click the **Running Quests** button (bottom-right).',
            '3. Watch progress in the panel or the browser console (F12).',
          ].join('\n'),
        },
        {
          name: 'Links',
          value: `[Repository](${REPO_URL}) · [Support server](${SUPPORT_URL})`,
        },
      )
      .setDescription('This only runs in your own browser using your own session — nothing here touches your account from outside it.');

    await interaction.reply({ embeds: [embed] });
  },
};
