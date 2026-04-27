const path = require('path');
const {
  ACCEPTED_IMAGE_EXTENSIONS,
  ACCEPTED_IMAGE_TYPES,
} = require('../constants/faceAttributes');
const { createHttpError } = require('../utils/httpErrors');

function hasIsoBrand(buffer, brands) {
  if (buffer.length < 12 || buffer.toString('ascii', 4, 8) !== 'ftyp') {
    return false;
  }

  const brand = buffer.toString('ascii', 8, 12);
  return brands.includes(brand);
}

function hasValidMagicBytes(file) {
  const buffer = file.buffer;

  if (!Buffer.isBuffer(buffer) || buffer.length < 12) {
    return false;
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (
    buffer[0] === 0x89
    && buffer[1] === 0x50
    && buffer[2] === 0x4e
    && buffer[3] === 0x47
  ) {
    return buffer[0] === 0x89
      && buffer[1] === 0x50
      && buffer[2] === 0x4e
      && buffer[3] === 0x47;
  }

  if (
    buffer.toString('ascii', 0, 4) === 'RIFF'
    && buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return buffer.toString('ascii', 0, 4) === 'RIFF'
      && buffer.toString('ascii', 8, 12) === 'WEBP';
  }

  if (buffer.toString('ascii', 0, 3) === 'GIF') {
    return true;
  }

  if (buffer.toString('ascii', 0, 2) === 'BM') {
    return true;
  }

  if (hasIsoBrand(buffer, ['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1', 'avif', 'avis'])) {
    return true;
  }

  return false;
}

function hasAcceptedDeclaredType(file) {
  const mimetype = file.mimetype?.toLowerCase();
  const extension = path.extname(file.originalname || '').toLowerCase();

  return ACCEPTED_IMAGE_TYPES.includes(mimetype)
    || ACCEPTED_IMAGE_EXTENSIONS.includes(extension)
    || !mimetype
    || mimetype === 'application/octet-stream';
}

function validateUpload(req, res, next) {
  const selfieA = req.files?.selfieA?.[0];
  const selfieB = req.files?.selfieB?.[0];

  if (!selfieA || !selfieB) {
    next(createHttpError(400, 'MISSING_FILES', 'Upload exactly one file for Selfie A and one file for Selfie B.'));
    return;
  }

  const files = [selfieA, selfieB];
  const invalidType = files.some((file) => !hasAcceptedDeclaredType(file));
  const invalidBytes = files.some((file) => !hasValidMagicBytes(file));

  if (invalidType || invalidBytes) {
    next(createHttpError(400, 'INVALID_FILE_TYPE', 'Upload a valid image file.'));
    return;
  }

  next();
}

module.exports = validateUpload;
