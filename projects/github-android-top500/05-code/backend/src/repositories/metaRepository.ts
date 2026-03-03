import Database from 'better-sqlite3';
import type { Metadata } from '../models/types';

export class MetaRepository {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  /**
   * 初始化表结构
   */
  initTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS metadata (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);
  }

  /**
   * 获取元数据
   */
  getMetadata(): Metadata {
    const rows = this.db.prepare('SELECT key, value FROM metadata').all() as Array<{ key: string; value: string | null }>;

    const data: Record<string, string | null> = {};
    for (const row of rows) {
      data[row.key] = row.value;
    }

    return {
      lastUpdateTime: data.lastUpdateTime || null,
      updateStatus: (data.updateStatus as Metadata['updateStatus']) || 'idle',
      totalCount: parseInt(data.totalCount || '0', 10),
      errorMessage: data.errorMessage || null,
      nextScheduledTime: data.nextScheduledTime || null,
    };
  }

  /**
   * 更新单个元数据字段
   */
  setMeta(key: string, value: string | null): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO metadata (key, value) VALUES (@key, @value)
    `);
    stmt.run({ key, value });
  }

  /**
   * 批量更新元数据
   */
  updateMetadata(metadata: Partial<Metadata>): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO metadata (key, value) VALUES (@key, @value)
    `);

    const transaction = this.db.transaction(() => {
      if (metadata.lastUpdateTime !== undefined) {
        stmt.run({ key: 'lastUpdateTime', value: metadata.lastUpdateTime });
      }
      if (metadata.updateStatus !== undefined) {
        stmt.run({ key: 'updateStatus', value: metadata.updateStatus });
      }
      if (metadata.totalCount !== undefined) {
        stmt.run({ key: 'totalCount', value: String(metadata.totalCount) });
      }
      if (metadata.errorMessage !== undefined) {
        stmt.run({ key: 'errorMessage', value: metadata.errorMessage });
      }
      if (metadata.nextScheduledTime !== undefined) {
        stmt.run({ key: 'nextScheduledTime', value: metadata.nextScheduledTime });
      }
    });

    transaction();
  }

  /**
   * 清空所有元数据
   */
  clearAll(): void {
    this.db.exec('DELETE FROM metadata');
  }
}

export default MetaRepository;
