const multer = require('multer');
const path = require('path');
const { config } = require('../config/env');
const {
  ACCEPTED_IMAGE_EXTENSIONS,
  ACCEPTED_IMAGE_TYPES,
} = require('../constants/faceAttributes');
const { createHttpError } = require('../utils/httpErrors');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: config.uploadMaxMb * 1024 * 1024,
    files: 2,
  },
  fileFilter: (req, file, callback) => {
    const mimetype = file.mimetype?.toLowerCase();
    const extension = path.extname(file.originalname || '').toLowerCase();
    const hasAcceptedType = ACCEPTED_IMAGE_TYPES.includes(mimetype);
    const hasAcceptedExtension = ACCEPTED_IMAGE_EXTENSIONS.includes(extension);
    const hasAmbiguousMobileType = !mimetype || mimetype === 'application/octet-stream';

    if (!hasAcceptedType && !hasAcceptedExtension && !hasAmbiguousMobileType) {
      callback(createHttpError(400, 'INVALID_FILE_TYPE', 'Upload a valid image file.'));
      return;
    }

    callback(null, true);
  },
});

const uploadBattleImages = upload.fields([
  { name: 'selfieA', maxCount: 1 },
  { name: 'selfieB', maxCount: 1 },
]);

module.exports = {
  uploadBattleImages,
};
