const request = require('supertest');
const app = require('../app');
const azureFaceService = require('../services/azureFaceService');
const { createHttpError } = require('../utils/httpErrors');

jest.mock('../services/azureFaceService');

const pngBuffer = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
]);

function normalizedFace(overrides = {}) {
  return {
    faceDetected: true,
    attributes: {
      smile: 0.5,
      glasses: 'NoGlasses',
      headPose: { pitch: 1, roll: 1, yaw: 1 },
      qualityForRecognition: 'high',
      occlusion: {
        foreheadOccluded: false,
        eyeOccluded: false,
        mouthOccluded: false,
      },
      ...overrides,
    },
  };
}

function postWithImages() {
  return request(app)
    .post('/api/battles/analyze')
    .attach('selfieA', pngBuffer, { filename: 'a.png', contentType: 'image/png' })
    .attach('selfieB', pngBuffer, { filename: 'b.png', contentType: 'image/png' });
}

describe('battle routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('health route responds', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });

  test('missing files returns MISSING_FILES', async () => {
    const response = await request(app).post('/api/battles/analyze');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('MISSING_FILES');
  });

  test('one file returns MISSING_FILES', async () => {
    const response = await request(app)
      .post('/api/battles/analyze')
      .attach('selfieA', pngBuffer, { filename: 'a.png', contentType: 'image/png' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('MISSING_FILES');
  });

  test('invalid file type returns INVALID_FILE_TYPE', async () => {
    const response = await request(app)
      .post('/api/battles/analyze')
      .attach('selfieA', Buffer.from('bad'), { filename: 'a.txt', contentType: 'text/plain' })
      .attach('selfieB', pngBuffer, { filename: 'b.png', contentType: 'image/png' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_FILE_TYPE');
  });

  test('no face result returns NO_FACE_DETECTED', async () => {
    azureFaceService.analyzeFace.mockResolvedValueOnce([]);
    azureFaceService.analyzeFace.mockResolvedValueOnce([normalizedFace()]);

    const response = await postWithImages();

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('NO_FACE_DETECTED');
  });

  test('multiple face result returns MULTIPLE_FACES_DETECTED', async () => {
    azureFaceService.analyzeFace.mockResolvedValueOnce([normalizedFace(), normalizedFace()]);
    azureFaceService.analyzeFace.mockResolvedValueOnce([normalizedFace()]);

    const response = await postWithImages();

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('MULTIPLE_FACES_DETECTED');
  });

  test('provider failure returns AI_PROVIDER_ERROR', async () => {
    azureFaceService.analyzeFace.mockRejectedValue(createHttpError(502, 'AI_PROVIDER_ERROR', 'Provider failed.'));

    const response = await postWithImages();

    expect(response.status).toBe(502);
    expect(response.body.error.code).toBe('AI_PROVIDER_ERROR');
  });

  test('successful analysis returns winner payload', async () => {
    azureFaceService.analyzeFace.mockResolvedValueOnce([normalizedFace({ qualityForRecognition: 'high' })]);
    azureFaceService.analyzeFace.mockResolvedValueOnce([normalizedFace({ qualityForRecognition: 'low' })]);

    const response = await postWithImages();

    expect(response.status).toBe(200);
    expect(response.body.battleId).toMatch(/^battle_/);
    expect(response.body.winner).toBe('A');
    expect(response.body.images.A.score).toEqual(expect.any(Number));
    expect(response.body.images.B.score).toEqual(expect.any(Number));
    expect(response.body.images.A.attributes).toBeDefined();
  });
});
