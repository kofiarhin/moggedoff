const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function readNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const config = {
  port: readNumber(process.env.PORT, 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  azureFaceApiKey: process.env.AZURE_FACE_API_KEY || '',
  azureFaceApiEndpoint: (process.env.AZURE_FACE_API_ENDPOINT || '').replace(/\/+$/, ''),
  uploadMaxMb: readNumber(process.env.UPLOAD_MAX_MB, 5),
};

function validateRequiredEnv() {
  const missing = [];

  if (!config.azureFaceApiKey) missing.push('AZURE_FACE_API_KEY');
  if (!config.azureFaceApiEndpoint) missing.push('AZURE_FACE_API_ENDPOINT');

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = {
  config,
  validateRequiredEnv,
};
