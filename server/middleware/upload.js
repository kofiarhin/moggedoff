const multer = require('multer');
const { config } = require('../config/env');
const { ACCEPTED_IMAGE_TYPES } = require('../constants/faceAttributes');
const { createHttpError } = require('../utils/httpErrors');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: config.uploadMaxMb * 1024 * 1024,
    files: 2,
  },
  fileFilter: (req, file, callback) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.mimetype)) {
      callback(createHttpError(400, 'INVALID_FILE_TYPE', 'Upload JPEG, PNG, or WEBP images only.'));
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
