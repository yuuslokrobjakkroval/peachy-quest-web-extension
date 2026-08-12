'use strict';

const { EmbedBuilder } = require('discord.js');

// Matches the extension's UI accent (see quest-home.js STYLES).
const BRAND_COLOR = 0xffffff;
const FOOTER_TEXT = 'Peachy Quest Companion';

/**
 * Base embed with consistent branding. Pass any EmbedBuilder-compatible fields.
 */
function baseEmbed({ title, description, color = BRAND_COLOR } = {}) {
  const embed = new EmbedBuilder().setColor(color).setFooter({ text: FOOTER_TEXT }).setTimestamp();
  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);
  return embed;
}

/**
 * Renders a fixed-width text progress bar, e.g. "▰▰▰▰▱▱▱▱▱▱ 42/100".
 */
function progressBar(current, target, { size = 10 } = {}) {
  const safeTarget = Math.max(target, 1);
  const ratio = Math.min(Math.max(current / safeTarget, 0), 1);
  const filled = Math.round(ratio * size);
  const bar = '▰'.repeat(filled) + '▱'.repeat(size - filled);
  return `${bar} ${current}/${target}`;
}

module.exports = { BRAND_COLOR, FOOTER_TEXT, baseEmbed, progressBar };
