const pino = require("pino");
const { logger } = require("./config");

module.exports = pino({
  level: logger.level,
});
