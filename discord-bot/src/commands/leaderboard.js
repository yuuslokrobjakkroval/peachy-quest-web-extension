'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed } = require('../lib/embeds');
const { getLeaderboard } = require('../lib/store');

const MEDALS = ['🥇', '🥈', '🥉'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show the top self-reported quest completions in this server'),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      await interaction.reply({ content: 'This command only works inside a server.', ephemeral: true });
      return;
    }

    const top = getLeaderboard(interaction.guildId, 10);

    if (top.length === 0) {
      await interaction.reply({
        content: 'No completions reported yet — be the first with `/report-completion`!',
        ephemeral: true,
      });
      return;
    }

    const lines = top.map((entry, i) => {
      const rank = MEDALS[i] ?? `${i + 1}.`;
      return `${rank} <@${entry.userId}> — **${entry.count}** completion${entry.count === 1 ? '' : 's'}`;
    });

    const embed = baseEmbed({
      title: 'Quest Completion Leaderboard',
      description: lines.join('\n'),
    });

    await interaction.reply({ embeds: [embed] });
  },
};
