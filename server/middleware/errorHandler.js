const multer = require('multer');
const { createHttpError } = require('../utils/httpErrors');

function normalizeMulterError(error) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return createHttpError(400, 'FILE_TOO_LARGE', 'Each image must be within the configured size limit.');
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return createHttpError(400, 'MISSING_FILES', 'Upload exactly one file for Selfie A and one file for Selfie B.');
    }
  }

  return error;
}

function errorHandler(error, req, res, next) {
  const normalized = normalizeMulterError(error);
  const status = normalized.status || 500;
  const code = normalized.code || 'INTERNAL_ERROR';
  const message = status === 500
    ? 'Something went wrong while processing the battle.'
    : normalized.message;

  res.status(status).json({
    error: {
      code,
      message,
    },
  });
}

module.exports = errorHandler;
