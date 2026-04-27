const app = require('./app');
const { config, validateRequiredEnv } = require('./config/env');

validateRequiredEnv();

app.listen(config.port, () => {
  console.log(`Moggoff API listening on port ${config.port}`);
});
