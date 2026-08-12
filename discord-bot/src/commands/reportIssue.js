'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed } = require('../lib/embeds');
const { addIssue } = require('../lib/store');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('report-issue')
    .setDescription('Report a bug or problem with the extension to the team')
    .addStringOption((option) =>
      option.setName('description').setDescription('What went wrong?').setRequired(true),
    ),

  async execute(interaction) {
    const description = interaction.options.getString('description', true);

    addIssue({
      guildId: interaction.guildId ?? null,
      userId: interaction.user.id,
      description,
    });

    let posted = false;
    if (process.env.SUPPORT_CHANNEL_ID) {
      const supportChannel = await interaction.client.channels
        .fetch(process.env.SUPPORT_CHANNEL_ID)
        .catch(() => null);

      if (supportChannel?.isTextBased()) {
        const embed = baseEmbed({ title: 'New issue report', description }).setAuthor({
          name: interaction.user.username,
          iconURL: interaction.user.displayAvatarURL(),
        });
        await supportChannel.send({ embeds: [embed] });
        posted = true;
      }
    }

    const followUp = posted
      ? 'Thanks — the team has been notified. 🛠️'
      : "Thanks, that's been logged. Consider also posting in the support server for a faster response.";

    await interaction.reply({ content: followUp, ephemeral: true });
  },
};
