import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    host: process.env.HOST || 'localhost',
  },

  github: {
    token: process.env.GITHUB_TOKEN || '',
    baseUrl: 'https://api.github.com',
    maxRepos: parseInt(process.env.MAX_REPOS || '500', 10),
  },

  cache: {
    durationHours: parseInt(process.env.CACHE_DURATION_HOURS || '24', 10),
  },

  scheduler: {
    enabled: process.env.SCHEDULER_ENABLED !== 'false',
    cronExpression: process.env.CRON_EXPRESSION || '0 0 * * *',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

export default config;
