const express = require('express');
const {
  analyzeBattle,
  deleteBattle,
  getBattle,
  listBattles,
} = require('../controllers/battleController');
const { analyzeRateLimit } = require('../middleware/rateLimit');
const { uploadBattleImages } = require('../middleware/upload');
const validateUpload = require('../middleware/validateUpload');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(listBattles));

router.post(
  '/analyze',
  analyzeRateLimit,
  uploadBattleImages,
  validateUpload,
  asyncHandler(analyzeBattle),
);

router.get('/:battleId', asyncHandler(getBattle));

router.delete('/:battleId', asyncHandler(deleteBattle));

module.exports = router;
