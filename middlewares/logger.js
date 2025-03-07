import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import winston from 'winston';

// Ensure logs directory exists
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({filename: 'logs/error.log', level: 'error'}),
    new winston.transports.File({filename: path.join(logDir, 'warn.log'), level: 'warn'}),
    new winston.transports.File({filename: 'logs/combined.log'})
  ]
});

// Log to the console in development mode
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
