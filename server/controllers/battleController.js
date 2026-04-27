const crypto = require('crypto');
const azureFaceService = require('../services/azureFaceService');
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

    res.json({
      battleId: `battle_${crypto.randomBytes(5).toString('hex')}`,
      winner: result.winner,
      verdict: result.verdict,
      confidence: result.confidence,
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

module.exports = {
  analyzeBattle,
};
