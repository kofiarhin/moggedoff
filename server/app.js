const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { config } = require('./config/env');
const battleRoutes = require('./routes/battleRoutes');
const errorHandler = require('./middleware/errorHandler');
const { createHttpError } = require('./utils/httpErrors');

const app = express();

app.use(helmet());
app.use(cors({ origin: config.clientOrigin }));
app.use(express.json({ limit: '128kb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/battles', battleRoutes);

app.use('/api', (req, res, next) => {
  next(createHttpError(404, 'NOT_FOUND', 'API route not found.'));
});

app.use(errorHandler);

module.exports = app;
