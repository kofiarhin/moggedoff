const TIE_DELTA = 1.5;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function roundOne(value) {
  return Math.round(value * 10) / 10;
}

function qualityScore(value) {
  const normalized = String(value || '').toLowerCase();
  if (normalized === 'high') return 20;
  if (normalized === 'medium') return 10;
  if (normalized === 'low') return -10;
  return 0;
}

function headPoseScore(headPose = {}) {
  const pitch = Math.abs(Number(headPose.pitch) || 0);
  const roll = Math.abs(Number(headPose.roll) || 0);
  const yaw = Math.abs(Number(headPose.yaw) || 0);
  const total = pitch + roll + yaw;

  return clamp(12 - total / 3, 0, 12);
}

function occlusionPenalty(occlusion = {}) {
  return ['foreheadOccluded', 'eyeOccluded', 'mouthOccluded'].reduce((total, key) => {
    return total + (occlusion[key] ? 8 : 0);
  }, 0);
}

function qualityPenalty(value, scale) {
  const normalized = String(value || '').toLowerCase();
  if (normalized === 'high' || normalized === 'good') return 0;
  if (normalized === 'medium' || normalized === 'average') return scale / 2;
  if (normalized === 'low' || normalized === 'poor') return scale;
  return 0;
}

function scoreFace(face = {}) {
  const attributes = face.attributes || face.faceAttributes || face;
  let score = 50;

  score += qualityScore(attributes.qualityForRecognition);
  score += clamp((Number(attributes.smile) || 0) * 10, 0, 10);
  score += headPoseScore(attributes.headPose);
  score -= occlusionPenalty(attributes.occlusion);
  score -= qualityPenalty(attributes.blur?.blurLevel, 8);
  score -= qualityPenalty(attributes.exposure?.exposureLevel, 6);
  score -= qualityPenalty(attributes.noise?.noiseLevel, 6);

  return roundOne(clamp(score, 0, 100));
}

function buildVerdict(winner, scoreA, scoreB) {
  if (winner === 'tie') {
    return 'This one is too close to call. Both shots landed in the same range.';
  }

  const label = winner === 'A' ? 'Selfie A' : 'Selfie B';
  const delta = Math.abs(scoreA - scoreB);

  if (delta < 6) {
    return `${label} wins by a narrow margin on cleaner photo signals.`;
  }

  return `${label} takes it with stronger image quality, framing, and face angle.`;
}

function compareFaces(faceA, faceB) {
  const scoreA = scoreFace(faceA);
  const scoreB = scoreFace(faceB);
  const delta = Math.abs(scoreA - scoreB);
  const winner = delta < TIE_DELTA ? 'tie' : scoreA > scoreB ? 'A' : 'B';
  const confidence = winner === 'tie' ? 0.5 : roundOne(clamp(0.5 + delta / 100, 0.5, 0.95));

  return {
    winner,
    confidence,
    verdict: buildVerdict(winner, scoreA, scoreB),
    images: {
      A: { score: scoreA },
      B: { score: scoreB },
    },
  };
}

module.exports = {
  compareFaces,
  scoreFace,
};
