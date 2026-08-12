'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed, progressBar } = require('../lib/embeds');

const HOW_TO = [
  '1. Go to `discord.com/quest-home` with the extension enabled and click **Running Quests**.',
  '2. Expand the panel (▾) and click **Copy JSON**.',
  '3. Run `/quest-status data:<paste>` here.',
].join('\n');

/**
 * Validates the pasted payload is an array of quest-state objects shaped like
 * what quest-home.js caches: { id, name, progress, target, completed }.
 */
function parseQuestData(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "That doesn't look like valid JSON. Make sure you copied the whole thing." };
  }

  if (!Array.isArray(parsed)) {
    return { error: 'Expected a JSON array of quests.' };
  }

  const valid = parsed.every(
    (q) => q && typeof q.name === 'string' && typeof q.progress === 'number' && typeof q.target === 'number',
  );
  if (!valid) {
    return { error: "That JSON isn't in the expected quest format." };
  }

  return { quests: parsed };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quest-status')
    .setDescription('Show a quest progress summary from the extension panel')
    .addStringOption((option) =>
      option
        .setName('data')
        .setDescription('The JSON you copied from the extension\'s "Copy JSON" button')
        .setRequired(false),
    ),

  async execute(interaction) {
    const raw = interaction.options.getString('data');

    if (!raw) {
      const embed = baseEmbed({
        title: 'How to check your quest status',
        description: HOW_TO,
      });
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    const result = parseQuestData(raw);
    if (result.error) {
      await interaction.reply({ content: `⚠️ ${result.error}`, ephemeral: true });
      return;
    }

    if (result.quests.length === 0) {
      await interaction.reply({ content: 'No quests in that data — nothing to show.', ephemeral: true });
      return;
    }

    const lines = result.quests.map((q) => {
      const mark = q.completed ? '✅' : '▶️';
      return `${mark} **${q.name}**\n${progressBar(Math.floor(q.progress), q.target)}`;
    });

    const embed = baseEmbed({
      title: `Quest status for ${interaction.user.username}`,
      description: lines.join('\n\n'),
    });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
