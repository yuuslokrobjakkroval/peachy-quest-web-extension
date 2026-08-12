'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { addReport } = require('../lib/store');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('report-completion')
    .setDescription('Self-report a completed quest for the server leaderboard (honor system)')
    .addStringOption((option) =>
      option.setName('quest_name').setDescription('Name of the quest you completed').setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('note').setDescription('Optional note').setRequired(false),
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      await interaction.reply({ content: 'This command only works inside a server.', ephemeral: true });
      return;
    }

    const questName = interaction.options.getString('quest_name', true).trim();
    const note = interaction.options.getString('note');

    const { added, duplicate } = addReport(interaction.guildId, {
      userId: interaction.user.id,
      questName,
      note,
    });

    if (duplicate) {
      await interaction.reply({
        content: `You've already reported **${questName}** in this server.`,
        ephemeral: true,
      });
      return;
    }

    if (added) {
      await interaction.reply(
        `🎉 <@${interaction.user.id}> completed **${questName}**!${note ? `\n> ${note}` : ''}`,
      );
    }
  },
};
