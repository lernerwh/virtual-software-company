import winston from 'winston';
import config from '../config';

const { combine, timestamp, printf, colorize } = winston.format;

// 自定义日志格式
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

// 创建logger实例
const logger = winston.createLogger({
  level: config.logging.level,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
    // 错误日志文件
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    // 所有日志文件
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

// 生产环境不输出到控制台
if (config.nodeEnv === 'production') {
  logger.remove(logger.transports[0]);
}

export default logger;
