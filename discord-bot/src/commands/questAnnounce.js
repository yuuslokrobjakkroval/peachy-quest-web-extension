'use strict';

const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { baseEmbed } = require('../lib/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quest-announce')
    .setDescription('Post a staff announcement embed (e.g. new quests are live)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((option) => option.setName('title').setDescription('Announcement title').setRequired(true))
    .addStringOption((option) => option.setName('message').setDescription('Announcement body').setRequired(true))
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Channel to post in (defaults to ANNOUNCE_CHANNEL_ID, else this channel)')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(false),
    ),

  async execute(interaction) {
    const title = interaction.options.getString('title', true);
    const message = interaction.options.getString('message', true);
    const explicitChannel = interaction.options.getChannel('channel');

    let targetChannel = explicitChannel;
    if (!targetChannel && process.env.ANNOUNCE_CHANNEL_ID) {
      targetChannel = await interaction.client.channels
        .fetch(process.env.ANNOUNCE_CHANNEL_ID)
        .catch(() => null);
    }
    if (!targetChannel) {
      targetChannel = interaction.channel;
    }

    if (!targetChannel?.isTextBased()) {
      await interaction.reply({ content: "Couldn't resolve a text channel to post in.", ephemeral: true });
      return;
    }

    const embed = baseEmbed({ title, description: message }).setAuthor({
      name: `Announcement by ${interaction.user.username}`,
      iconURL: interaction.user.displayAvatarURL(),
    });

    await targetChannel.send({ embeds: [embed] });

    if (targetChannel.id === interaction.channelId) {
      await interaction.reply({ content: 'Announcement posted above. ✅', ephemeral: true });
    } else {
      await interaction.reply({ content: `Announcement posted in <#${targetChannel.id}>. ✅`, ephemeral: true });
    }
  },
};
