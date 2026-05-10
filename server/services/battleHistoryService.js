const fs = require('fs/promises');
const path = require('path');

function getHistoryFilePath() {
  return process.env.BATTLE_HISTORY_FILE || path.resolve(__dirname, '../data/battleHistory.json');
}

function normalizeRecord(record) {
  return {
    id: record.id,
    winner: record.winner,
    score: record.score,
    createdAt: record.createdAt,
    selfieAName: record.selfieAName,
    selfieBName: record.selfieBName,
    analysisSummary: record.analysisSummary,
  };
}

async function readHistory() {
  try {
    const raw = await fs.readFile(getHistoryFilePath(), 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeRecord) : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeHistory(records) {
  const filePath = getHistoryFilePath();
  const tempPath = `${filePath}.tmp`;

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(tempPath, JSON.stringify(records, null, 2), 'utf8');
  await fs.rename(tempPath, filePath);
}

async function saveBattleHistory(record) {
  const entry = normalizeRecord({
    ...record,
    createdAt: record.createdAt || new Date().toISOString(),
  });
  const history = await readHistory();

  await writeHistory([entry, ...history]);

  return entry;
}

async function listBattleHistory() {
  const history = await readHistory();

  return history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getBattleHistory(battleId) {
  const history = await readHistory();
  return history.find((battle) => battle.id === battleId) || null;
}

async function deleteBattleHistory(battleId) {
  const history = await readHistory();
  const nextHistory = history.filter((battle) => battle.id !== battleId);

  if (nextHistory.length === history.length) {
    return false;
  }

  await writeHistory(nextHistory);
  return true;
}

module.exports = {
  deleteBattleHistory,
  getBattleHistory,
  listBattleHistory,
  saveBattleHistory,
};
