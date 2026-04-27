const heicConvert = require('heic-convert');
const path = require('path');
const sharp = require('sharp');
const { createHttpError } = require('../utils/httpErrors');

function hasIsoBrand(buffer, brands) {
  return Buffer.isBuffer(buffer)
    && buffer.length >= 12
    && buffer.toString('ascii', 4, 8) === 'ftyp'
    && brands.includes(buffer.toString('ascii', 8, 12));
}

function isHeicLike(file) {
  const mimetype = file.mimetype?.toLowerCase();
  const extension = path.extname(file.originalname || '').toLowerCase();

  return mimetype === 'image/heic'
    || mimetype === 'image/heif'
    || extension === '.heic'
    || extension === '.heif'
    || hasIsoBrand(file.buffer, ['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1']);
}

async function convertHeicToJpeg(file) {
  const output = await heicConvert({
    buffer: file.buffer,
    format: 'JPEG',
    quality: 0.9,
  });

  return Buffer.from(output);
}

async function normalizeImageForFaceApi(file) {
  try {
    if (isHeicLike(file)) {
      return await convertHeicToJpeg(file);
    }

    return await sharp(file.buffer, {
      animated: false,
      failOn: 'none',
    })
      .rotate()
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer();
  } catch (error) {
    console.error('[Image Processing] Unable to normalize upload:', error.message);
    throw createHttpError(
      422,
      'UNSUPPORTED_IMAGE',
      'This image format could not be processed. Try saving it as JPEG or PNG.',
    );
  }
}

module.exports = {
  normalizeImageForFaceApi,
};
