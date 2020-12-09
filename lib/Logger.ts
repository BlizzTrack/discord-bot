const consola = require('consola');

const MODE = (process.env.NODE_ENV ? (process.env.NODE_ENV.toLowerCase() == "debug" ? 4 : (process.env.NODE_ENV.toLowerCase() == "verbose" ? 6 : 3)) : 3);
// If no MODE, mode = 3, if MODE = debug, mode = 4, if MODE = verbose, mode = 6. Anything else also 3.

const _logger = consola.create({
	level: MODE
});

export const logger = _logger;