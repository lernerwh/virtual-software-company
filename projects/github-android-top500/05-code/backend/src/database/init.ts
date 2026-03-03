import Database from 'better-sqlite3';
import path from 'path';
import config from '../config';
import logger from '../logger';

let db: Database.Database | null = null;

/**
 * 获取数据库实例
 */
export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = path.resolve(config.database.path);
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    logger.info(`Database initialized at ${dbPath}`);
  }
  return db;
}

/**
 * 初始化数据库表
 */
export function initTables(): void {
  const database = getDatabase();

  // 创建repositories表
  database.exec(`
    CREATE TABLE IF NOT EXISTS repositories (
      id INTEGER PRIMARY KEY,
      rank INTEGER NOT NULL,
      name TEXT NOT NULL,
      fullName TEXT NOT NULL,
      description TEXT,
      url TEXT NOT NULL,
      htmlUrl TEXT NOT NULL,
      stars INTEGER NOT NULL DEFAULT 0,
      forks INTEGER NOT NULL DEFAULT 0,
      language TEXT,
      license TEXT,
      ownerId INTEGER NOT NULL,
      ownerName TEXT NOT NULL,
      ownerAvatar TEXT,
      ownerType TEXT NOT NULL,
      isFork INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      pushedAt TEXT,
      openIssues INTEGER NOT NULL DEFAULT 0,
      watchers INTEGER NOT NULL DEFAULT 0,
      topics TEXT,
      homepage TEXT
    );
  `);

  // 创建索引
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_repos_stars ON repositories(stars);
    CREATE INDEX IF NOT EXISTS idx_repos_forks ON repositories(forks);
    CREATE INDEX IF NOT EXISTS idx_repos_language ON repositories(language);
    CREATE INDEX IF NOT EXISTS idx_repos_pushed_at ON repositories(pushedAt);
    CREATE INDEX IF NOT EXISTS idx_repos_name ON repositories(name);
  `);

  // 创建metadata表
  database.exec(`
    CREATE TABLE IF NOT EXISTS metadata (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  logger.info('Database tables initialized');
}

/**
 * 关闭数据库连接
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    logger.info('Database connection closed');
  }
}

export default { getDatabase, initTables, closeDatabase };
