import Database from 'better-sqlite3';
import type { Repository, RepoQuery, Pagination, Metadata } from '../models/types';

export class RepoRepository {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  /**
   * 初始化表结构
   */
  initTable(): void {
    this.db.exec(`
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

      CREATE INDEX IF NOT EXISTS idx_repos_stars ON repositories(stars);
      CREATE INDEX IF NOT EXISTS idx_repos_forks ON repositories(forks);
      CREATE INDEX IF NOT EXISTS idx_repos_language ON repositories(language);
      CREATE INDEX IF NOT EXISTS idx_repos_pushed_at ON repositories(pushedAt);
      CREATE INDEX IF NOT EXISTS idx_repos_name ON repositories(name);
    `);
  }

  /**
   * 保存项目列表（替换现有数据）
   */
  saveRepositories(repos: Repository[]): void {
    const insert = this.db.prepare(`
      INSERT OR REPLACE INTO repositories (
        id, rank, name, fullName, description, url, htmlUrl,
        stars, forks, language, license, ownerId, ownerName,
        ownerAvatar, ownerType, isFork, createdAt, updatedAt,
        pushedAt, openIssues, watchers, topics, homepage
      ) VALUES (
        @id, @rank, @name, @fullName, @description, @url, @htmlUrl,
        @stars, @forks, @language, @license, @ownerId, @ownerName,
        @ownerAvatar, @ownerType, @isFork, @createdAt, @updatedAt,
        @pushedAt, @openIssues, @watchers, @topics, @homepage
      )
    `);

    const clearAll = this.db.prepare('DELETE FROM repositories');

    const transaction = this.db.transaction(() => {
      clearAll.run();
      for (const repo of repos) {
        insert.run({
          ...repo,
          topics: JSON.stringify(repo.topics || []),
          isFork: repo.isFork ? 1 : 0,
        });
      }
    });

    transaction();
  }

  /**
   * 查询项目列表
   */
  getRepositories(query: RepoQuery): { data: Repository[]; pagination: Pagination } {
    const {
      page = 1,
      pageSize = 20,
      search,
      language,
      starRange,
      updateRange,
      sortBy = 'stars',
      sortOrder = 'desc',
    } = query;

    // 构建WHERE条件
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};

    // 搜索条件
    if (search) {
      conditions.push('(name LIKE @search OR description LIKE @search)');
      params.search = `%${search}%`;
    }

    // 语言筛选
    if (language) {
      if (language === 'Other') {
        conditions.push('(language IS NULL OR (language != "Java" AND language != "Kotlin"))');
      } else {
        conditions.push('language = @language');
        params.language = language;
      }
    }

    // Star范围筛选
    if (starRange) {
      const [min, max] = this.parseStarRange(starRange);
      if (max !== null) {
        conditions.push('stars >= @starMin AND stars < @starMax');
        params.starMin = min;
        params.starMax = max;
      } else {
        conditions.push('stars >= @starMin');
        params.starMin = min;
      }
    }

    // 更新时间范围筛选
    if (updateRange) {
      const days = this.getUpdateRangeDays(updateRange);
      const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      conditions.push('pushedAt >= @updateFromDate');
      params.updateFromDate = date;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 排序
    const validSortFields = ['stars', 'forks', 'updatedAt', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'stars';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // 查询总数
    const countSql = `SELECT COUNT(*) as count FROM repositories ${whereClause}`;
    const countResult = this.db.prepare(countSql).get(params) as { count: number };
    const total = countResult.count;

    // 计算分页
    const validPage = Math.max(1, page);
    const validPageSize = Math.min(100, Math.max(1, pageSize));
    const totalPages = Math.ceil(total / validPageSize);
    const offset = (validPage - 1) * validPageSize;

    // 查询数据
    const dataSql = `
      SELECT * FROM repositories
      ${whereClause}
      ORDER BY ${sortField} ${order}
      LIMIT @limit OFFSET @offset
    `;

    const rows = this.db.prepare(dataSql).all({
      ...params,
      limit: validPageSize,
      offset,
    }) as Record<string, unknown>[];

    const data = rows.map((row) => this.rowToRepository(row));

    return {
      data,
      pagination: {
        page: validPage,
        pageSize: validPageSize,
        total,
        totalPages,
      },
    };
  }

  /**
   * 根据ID获取项目
   */
  getRepoById(id: number): Repository | null {
    const row = this.db.prepare('SELECT * FROM repositories WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    return row ? this.rowToRepository(row) : null;
  }

  /**
   * 获取记录数
   */
  getCount(query: Omit<RepoQuery, 'page' | 'pageSize' | 'sortBy' | 'sortOrder'>): number {
    const { search, language, starRange, updateRange } = query;

    const conditions: string[] = [];
    const params: Record<string, unknown> = {};

    if (search) {
      conditions.push('(name LIKE @search OR description LIKE @search)');
      params.search = `%${search}%`;
    }

    if (language) {
      if (language === 'Other') {
        conditions.push('(language IS NULL OR (language != "Java" AND language != "Kotlin"))');
      } else {
        conditions.push('language = @language');
        params.language = language;
      }
    }

    if (starRange) {
      const [min, max] = this.parseStarRange(starRange);
      if (max !== null) {
        conditions.push('stars >= @starMin AND stars < @starMax');
        params.starMin = min;
        params.starMax = max;
      } else {
        conditions.push('stars >= @starMin');
        params.starMin = min;
      }
    }

    if (updateRange) {
      const days = this.getUpdateRangeDays(updateRange);
      const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      conditions.push('pushedAt >= @updateFromDate');
      params.updateFromDate = date;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT COUNT(*) as count FROM repositories ${whereClause}`;
    const result = this.db.prepare(sql).get(params) as { count: number };
    return result.count;
  }

  /**
   * 清空所有数据
   */
  clearAll(): void {
    this.db.exec('DELETE FROM repositories');
  }

  /**
   * 解析Star范围
   */
  private parseStarRange(range: string): [number, number | null] {
    const ranges: Record<string, [number, number | null]> = {
      '0-1000': [0, 1000],
      '1000-5000': [1000, 5000],
      '5000-10000': [5000, 10000],
      '10000+': [10000, null],
    };
    return ranges[range] || [0, null];
  }

  /**
   * 获取更新时间范围天数
   */
  private getUpdateRangeDays(range: string): number {
    const ranges: Record<string, number> = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365,
    };
    return ranges[range] || 365;
  }

  /**
   * 数据库行转换为Repository对象
   */
  private rowToRepository(row: Record<string, unknown>): Repository {
    return {
      id: row.id as number,
      rank: row.rank as number,
      name: row.name as string,
      fullName: row.fullName as string,
      description: row.description as string | null,
      url: row.url as string,
      htmlUrl: row.htmlUrl as string,
      stars: row.stars as number,
      forks: row.forks as number,
      language: row.language as string | null,
      license: row.license as string | null,
      ownerId: row.ownerId as number,
      ownerName: row.ownerName as string,
      ownerAvatar: row.ownerAvatar as string,
      ownerType: row.ownerType as 'User' | 'Organization',
      isFork: Boolean(row.isFork),
      createdAt: row.createdAt as string,
      updatedAt: row.updatedAt as string,
      pushedAt: row.pushedAt as string,
      openIssues: row.openIssues as number,
      watchers: row.watchers as number,
      topics: JSON.parse(row.topics as string || '[]'),
      homepage: row.homepage as string | null,
    };
  }
}

export default RepoRepository;
