import {pino, type Logger} from 'pino'

export const logger: Logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: process.env.NODE_ENV === "development" ? true : false,
    },
  },
  level: process.env.LOG_LEVEL || 'info',

  redact: ["password"], // prevent logging of sensitive data
});
