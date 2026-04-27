const { config } = require('../config/env');
const { FACE_DETECT_ATTRIBUTES } = require('../constants/faceAttributes');
const { createHttpError } = require('../utils/httpErrors');

function normalizeFace(face) {
  const attributes = face.faceAttributes || {};

  return {
    faceDetected: true,
    attributes: {
      glasses: attributes.glasses,
      headPose: attributes.headPose || {},
      qualityForRecognition: attributes.qualityForRecognition,
      occlusion: attributes.occlusion || {},
      blur: attributes.blur,
      exposure: attributes.exposure,
      noise: attributes.noise,
    },
  };
}

async function analyzeFace(imageBuffer) {
  const url = new URL('/face/v1.0/detect', config.azureFaceApiEndpoint);
  url.searchParams.set('returnFaceId', 'false');
  url.searchParams.set('returnFaceLandmarks', 'false');
  url.searchParams.set('returnFaceAttributes', FACE_DETECT_ATTRIBUTES.join(','));
  url.searchParams.set('recognitionModel', 'recognition_04');
  url.searchParams.set('detectionModel', 'detection_01');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key': config.azureFaceApiKey,
      },
      body: imageBuffer,
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '(unreadable)');
      console.error('[Azure Face API] HTTP', response.status, response.statusText, '|', errorBody);
      const status = response.status === 400 ? 422 : 502;
      const code = status === 422 ? 'UNSUPPORTED_IMAGE' : 'AI_PROVIDER_ERROR';
      throw createHttpError(status, code, 'The image could not be analyzed right now.');
    }

    const faces = await response.json();
    return Array.isArray(faces) ? faces.map(normalizeFace) : [];
  } catch (error) {
    if (error.status) throw error;

    console.error('[Azure Face API] Network/timeout error:', error.message);
    throw createHttpError(502, 'AI_PROVIDER_ERROR', 'The face analysis provider is unavailable right now.');
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  analyzeFace,
  normalizeFace,
};
