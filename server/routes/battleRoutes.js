const express = require('express');
const { analyzeBattle } = require('../controllers/battleController');
const { analyzeRateLimit } = require('../middleware/rateLimit');
const { uploadBattleImages } = require('../middleware/upload');
const validateUpload = require('../middleware/validateUpload');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post(
  '/analyze',
  analyzeRateLimit,
  uploadBattleImages,
  validateUpload,
  asyncHandler(analyzeBattle),
);

module.exports = router;
