const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const request = require('supertest');
const app = require('../app');
const azureFaceService = require('../services/azureFaceService');
const { normalizeImageForFaceApi } = require('../services/imageProcessingService');
const { createHttpError } = require('../utils/httpErrors');

jest.mock('../services/azureFaceService');
jest.mock('../services/imageProcessingService', () => ({
  normalizeImageForFaceApi: jest.fn((file) => Promise.resolve(file.buffer)),
}));

const pngBuffer = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
]);

const heicBuffer = Buffer.from([
  0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70,
  0x68, 0x65, 0x69, 0x63, 0x00, 0x00, 0x00, 0x00,
]);

const historyFile = path.join(os.tmpdir(), 'moggoff-battle-history-test.json');

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
  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.BATTLE_HISTORY_FILE = historyFile;
    await fs.rm(historyFile, { force: true });
    normalizeImageForFaceApi.mockImplementation((file) => Promise.resolve(file.buffer));
  });

  afterAll(async () => {
    await fs.rm(historyFile, { force: true });
    delete process.env.BATTLE_HISTORY_FILE;
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

  test('mobile HEIC uploads are accepted and normalized before analysis', async () => {
    azureFaceService.analyzeFace.mockResolvedValue([normalizedFace()]);

    const response = await request(app)
      .post('/api/battles/analyze')
      .attach('selfieA', heicBuffer, { filename: 'a.heic', contentType: 'image/heic' })
      .attach('selfieB', pngBuffer, { filename: 'b.png', contentType: 'image/png' });

    expect(response.status).toBe(200);
    expect(normalizeImageForFaceApi).toHaveBeenCalledTimes(2);
    expect(azureFaceService.analyzeFace).toHaveBeenCalledTimes(2);
  });

  test('ambiguous mobile upload MIME is accepted when image bytes are valid', async () => {
    azureFaceService.analyzeFace.mockResolvedValue([normalizedFace()]);

    const response = await request(app)
      .post('/api/battles/analyze')
      .attach('selfieA', pngBuffer, { filename: 'a', contentType: 'application/octet-stream' })
      .attach('selfieB', pngBuffer, { filename: 'b', contentType: 'application/octet-stream' });

    expect(response.status).toBe(200);
    expect(normalizeImageForFaceApi).toHaveBeenCalledTimes(2);
  });

  test('no face result returns NO_FACE_DETECTED', async () => {
    azureFaceService.analyzeFace.mockResolvedValueOnce([]);
    azureFaceService.analyzeFace.mockResolvedValueOnce([normalizedFace()]);

    const response = await postWithImages();

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('NO_FACE_DETECTED');
  });

  test('failed analysis does not save history', async () => {
    azureFaceService.analyzeFace.mockResolvedValueOnce([]);
    azureFaceService.analyzeFace.mockResolvedValueOnce([normalizedFace()]);

    await postWithImages();

    const historyResponse = await request(app).get('/api/battles');

    expect(historyResponse.status).toBe(200);
    expect(historyResponse.body.battles).toEqual([]);
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
    expect(response.body.id).toBe(response.body.battleId);
    expect(response.body.battleId).toMatch(/^battle_/);
    expect(response.body.winner).toBe('A');
    expect(response.body.loser).toBe('B');
    expect(response.body.score).toEqual(expect.any(Number));
    expect(response.body.createdAt).toEqual(expect.any(String));
    expect(response.body.selfieAName).toBe('a.png');
    expect(response.body.selfieBName).toBe('b.png');
    expect(response.body.analysisSummary).toEqual(expect.any(String));
    expect(response.body.battleType).toBe('selfie');
    expect(response.body.images.A.score).toEqual(expect.any(Number));
    expect(response.body.images.B.score).toEqual(expect.any(Number));
    expect(response.body.images.A.attributes).toBeDefined();
  });

  test('successful analysis saves history for list and detail routes', async () => {
    azureFaceService.analyzeFace.mockResolvedValueOnce([normalizedFace({ qualityForRecognition: 'high' })]);
    azureFaceService.analyzeFace.mockResolvedValueOnce([normalizedFace({ qualityForRecognition: 'low' })]);

    const analyzeResponse = await postWithImages();
    const historyResponse = await request(app).get('/api/battles');
    const detailResponse = await request(app).get(`/api/battles/${analyzeResponse.body.id}`);

    expect(historyResponse.status).toBe(200);
    expect(historyResponse.body.battles).toHaveLength(1);
    expect(historyResponse.body.battles[0]).toEqual({
      id: analyzeResponse.body.id,
      winner: 'A',
      loser: 'B',
      score: analyzeResponse.body.score,
      createdAt: analyzeResponse.body.createdAt,
      selfieAName: 'a.png',
      selfieBName: 'b.png',
      analysisSummary: analyzeResponse.body.analysisSummary,
      battleType: 'selfie',
    });

    expect(detailResponse.status).toBe(200);
    expect(detailResponse.body.battle).toEqual(historyResponse.body.battles[0]);
  });

  test('missing battle detail returns BATTLE_NOT_FOUND', async () => {
    const response = await request(app).get('/api/battles/battle_missing');

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('BATTLE_NOT_FOUND');
  });

  test('delete removes one saved battle result', async () => {
    azureFaceService.analyzeFace.mockResolvedValueOnce([normalizedFace({ qualityForRecognition: 'high' })]);
    azureFaceService.analyzeFace.mockResolvedValueOnce([normalizedFace({ qualityForRecognition: 'low' })]);

    const analyzeResponse = await postWithImages();
    const deleteResponse = await request(app).delete(`/api/battles/${analyzeResponse.body.id}`);
    const historyResponse = await request(app).get('/api/battles');
    const secondDeleteResponse = await request(app).delete(`/api/battles/${analyzeResponse.body.id}`);

    expect(deleteResponse.status).toBe(204);
    expect(historyResponse.body.battles).toEqual([]);
    expect(secondDeleteResponse.status).toBe(404);
    expect(secondDeleteResponse.body.error.code).toBe('BATTLE_NOT_FOUND');
  });
});
