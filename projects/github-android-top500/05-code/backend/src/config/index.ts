import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // 服务器配置
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // GitHub API配置
  github: {
    token: process.env.GITHUB_TOKEN || '',
    baseUrl: 'https://api.github.com',
  },

  // 数据爬取配置
  crawler: {
    repoLimit: parseInt(process.env.REPO_LIMIT || '500', 10),
    maxRetries: 3,
    retryDelay: 1000, // 1秒
    requestTimeout: 30000, // 30秒
  },

  // 缓存配置
  cache: {
    durationHours: parseInt(process.env.CACHE_DURATION_HOURS || '24', 10),
  },

  // 定时任务配置
  scheduler: {
    cronSchedule: process.env.CRON_SCHEDULE || '0 0 * * *', // 每天凌晨
    enabled: process.env.SCHEDULER_ENABLED !== 'false',
  },

  // 数据库配置
  database: {
    path: process.env.DATABASE_PATH || './data.db',
  },

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // CORS配置
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
};

export default config;
