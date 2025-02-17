const pino = require("pino");

const logger = pino({
  //   transport: {
  //     options: {
  //       colorize: true,
  //     },
  //   },
});
module.exports = logger;
