const crypto = require('crypto');
const azureFaceService = require('../services/azureFaceService');
const {
  deleteBattleHistory,
  getBattleHistory,
  listBattleHistory,
  saveBattleHistory,
} = require('../services/battleHistoryService');
const { compareFaces } = require('../services/battleScoringService');
const { cleanupUploadedFiles } = require('../services/fileCleanupService');
const { normalizeImageForFaceApi } = require('../services/imageProcessingService');
const { createHttpError } = require('../utils/httpErrors');

function publicImageResult(score, face) {
  return {
    score,
    faceDetected: true,
    attributes: face.attributes,
  };
}

function validateFaceCount(faces) {
  if (!Array.isArray(faces) || faces.length === 0) {
    throw createHttpError(400, 'NO_FACE_DETECTED', 'One of the images does not contain a detectable face.');
  }

  if (faces.length > 1) {
    throw createHttpError(400, 'MULTIPLE_FACES_DETECTED', 'Each image must contain exactly one detectable face.');
  }
}

function headlineScore(result) {
  const scoreA = result.images.A.score;
  const scoreB = result.images.B.score;
  const score = result.winner === 'A' ? scoreA : result.winner === 'B' ? scoreB : Math.max(scoreA, scoreB);

  return Math.round(score * 10) / 10;
}

async function analyzeBattle(req, res, next) {
  const selfieA = req.files.selfieA[0];
  const selfieB = req.files.selfieB[0];

  try {
    const [imageA, imageB] = await Promise.all([
      normalizeImageForFaceApi(selfieA),
      normalizeImageForFaceApi(selfieB),
    ]);

    const [facesA, facesB] = await Promise.all([
      azureFaceService.analyzeFace(imageA),
      azureFaceService.analyzeFace(imageB),
    ]);

    validateFaceCount(facesA);
    validateFaceCount(facesB);

    const faceA = facesA[0];
    const faceB = facesB[0];
    const result = compareFaces(faceA, faceB);
    const battleId = `battle_${crypto.randomBytes(5).toString('hex')}`;
    const historyRecord = await saveBattleHistory({
      id: battleId,
      winner: result.winner,
      score: headlineScore(result),
      createdAt: new Date().toISOString(),
      selfieAName: selfieA.originalname,
      selfieBName: selfieB.originalname,
      analysisSummary: result.verdict,
    });

    res.json({
      id: historyRecord.id,
      battleId: historyRecord.id,
      createdAt: historyRecord.createdAt,
      winner: result.winner,
      verdict: result.verdict,
      analysisSummary: historyRecord.analysisSummary,
      score: historyRecord.score,
      confidence: result.confidence,
      selfieAName: historyRecord.selfieAName,
      selfieBName: historyRecord.selfieBName,
      images: {
        A: publicImageResult(result.images.A.score, faceA),
        B: publicImageResult(result.images.B.score, faceB),
      },
    });
  } catch (error) {
    next(error);
  } finally {
    await cleanupUploadedFiles(req.files);
  }
}

async function listBattles(req, res) {
  const battles = await listBattleHistory();
  res.json({ battles });
}

async function getBattle(req, res) {
  const battle = await getBattleHistory(req.params.battleId);

  if (!battle) {
    throw createHttpError(404, 'BATTLE_NOT_FOUND', 'Battle result not found.');
  }

  res.json({ battle });
}

async function deleteBattle(req, res) {
  const deleted = await deleteBattleHistory(req.params.battleId);

  if (!deleted) {
    throw createHttpError(404, 'BATTLE_NOT_FOUND', 'Battle result not found.');
  }

  res.status(204).send();
}

module.exports = {
  analyzeBattle,
  deleteBattle,
  getBattle,
  listBattles,
};
