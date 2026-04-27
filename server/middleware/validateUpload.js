const { ACCEPTED_IMAGE_TYPES } = require('../constants/faceAttributes');
const { createHttpError } = require('../utils/httpErrors');

function hasValidMagicBytes(file) {
  const buffer = file.buffer;

  if (!Buffer.isBuffer(buffer) || buffer.length < 12) {
    return false;
  }

  if (file.mimetype === 'image/jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (file.mimetype === 'image/png') {
    return buffer[0] === 0x89
      && buffer[1] === 0x50
      && buffer[2] === 0x4e
      && buffer[3] === 0x47;
  }

  if (file.mimetype === 'image/webp') {
    return buffer.toString('ascii', 0, 4) === 'RIFF'
      && buffer.toString('ascii', 8, 12) === 'WEBP';
  }

  return false;
}

function validateUpload(req, res, next) {
  const selfieA = req.files?.selfieA?.[0];
  const selfieB = req.files?.selfieB?.[0];

  if (!selfieA || !selfieB) {
    next(createHttpError(400, 'MISSING_FILES', 'Upload exactly one file for Selfie A and one file for Selfie B.'));
    return;
  }

  const files = [selfieA, selfieB];
  const invalidType = files.some((file) => !ACCEPTED_IMAGE_TYPES.includes(file.mimetype));
  const invalidBytes = files.some((file) => !hasValidMagicBytes(file));

  if (invalidType || invalidBytes) {
    next(createHttpError(400, 'INVALID_FILE_TYPE', 'Upload valid JPEG, PNG, or WEBP images only.'));
    return;
  }

  next();
}

module.exports = validateUpload;
