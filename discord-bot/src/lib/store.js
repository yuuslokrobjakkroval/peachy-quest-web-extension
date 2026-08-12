'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

const EMPTY_DB = { reports: {}, issues: [] };

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Loads the JSON store from disk, creating it with an empty shape if missing
 * or unreadable. Never throws.
 */
function load() {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      reports: parsed.reports ?? {},
      issues: parsed.issues ?? [],
    };
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('[store] Failed to read data/db.json, starting fresh:', error.message);
    }
    return { ...EMPTY_DB, reports: {}, issues: [] };
  }
}

/**
 * Persists the store to disk atomically (write to a temp file, then rename)
 * so a crash mid-write can never corrupt db.json.
 */
function save(data) {
  ensureDataDir();
  const tmpPath = `${DB_PATH}.${process.pid}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmpPath, DB_PATH);
}

/**
 * Records a self-reported quest completion for a guild.
 * Returns { added: boolean, duplicate: boolean } — duplicate is true when this
 * exact user + quest name was already reported in this guild (honor-system dedupe).
 */
function addReport(guildId, entry) {
  const data = load();
  const list = data.reports[guildId] ?? [];

  const isDuplicate = list.some(
    (r) => r.userId === entry.userId && r.questName.toLowerCase() === entry.questName.toLowerCase(),
  );
  if (isDuplicate) {
    return { added: false, duplicate: true };
  }

  list.push({
    userId: entry.userId,
    questName: entry.questName,
    note: entry.note ?? null,
    timestamp: entry.timestamp ?? Date.now(),
  });
  data.reports[guildId] = list;
  save(data);
  return { added: true, duplicate: false };
}

/**
 * Returns [{ userId, count }] sorted by count descending for a guild.
 */
function getLeaderboard(guildId, limit = 10) {
  const data = load();
  const list = data.reports[guildId] ?? [];

  const counts = new Map();
  for (const r of list) {
    counts.set(r.userId, (counts.get(r.userId) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([userId, count]) => ({ userId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Logs a bug/issue report. Purely for tracking — does not post anywhere itself.
 */
function addIssue(entry) {
  const data = load();
  data.issues.push({
    guildId: entry.guildId,
    userId: entry.userId,
    description: entry.description,
    timestamp: entry.timestamp ?? Date.now(),
  });
  save(data);
}

module.exports = { load, save, addReport, getLeaderboard, addIssue };
