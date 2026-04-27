const rateLimit = require('express-rate-limit');

const analyzeRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many battle requests. Wait a moment and try again.',
    },
  },
});

module.exports = {
  analyzeRateLimit,
};
