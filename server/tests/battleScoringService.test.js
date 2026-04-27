const { compareFaces, scoreFace } = require('../services/battleScoringService');

function face(overrides = {}) {
  return {
    attributes: {
      qualityForRecognition: 'medium',
      smile: 0.4,
      headPose: { pitch: 1, roll: 1, yaw: 1 },
      occlusion: {
        foreheadOccluded: false,
        eyeOccluded: false,
        mouthOccluded: false,
      },
      ...overrides,
    },
  };
}

describe('battleScoringService', () => {
  test('high quality face scores above low quality face', () => {
    expect(scoreFace(face({ qualityForRecognition: 'high' }))).toBeGreaterThan(
      scoreFace(face({ qualityForRecognition: 'low' })),
    );
  });

  test('occlusion decreases score', () => {
    const clear = scoreFace(face());
    const occluded = scoreFace(face({
      occlusion: {
        foreheadOccluded: true,
        eyeOccluded: true,
        mouthOccluded: false,
      },
    }));

    expect(occluded).toBeLessThan(clear);
  });

  test('bad head pose decreases score', () => {
    const straight = scoreFace(face({ headPose: { pitch: 0, roll: 0, yaw: 0 } }));
    const angled = scoreFace(face({ headPose: { pitch: 20, roll: 15, yaw: 30 } }));

    expect(angled).toBeLessThan(straight);
  });

  test('near equal scores produce tie', () => {
    const result = compareFaces(face({ smile: 0.4 }), face({ smile: 0.45 }));

    expect(result.winner).toBe('tie');
  });

  test('confidence stays in expected range', () => {
    const result = compareFaces(face({ qualityForRecognition: 'high' }), face({ qualityForRecognition: 'low' }));

    expect(result.confidence).toBeGreaterThanOrEqual(0.5);
    expect(result.confidence).toBeLessThanOrEqual(0.95);
  });

  test('score is clamped to 0..100', () => {
    expect(scoreFace(face({
      qualityForRecognition: 'high',
      smile: 5,
      headPose: { pitch: 0, roll: 0, yaw: 0 },
    }))).toBeLessThanOrEqual(100);
  });
});
