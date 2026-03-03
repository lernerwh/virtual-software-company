// 后端数据层测试 - 项目仓库
// File: backend/src/repositories/repoRepository.test.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { RepoRepository } from '../repoRepository';
import type { Repository } from '../../models/types';

describe('RepoRepository', () => {
  let db: Database.Database;
  let repo: RepoRepository;

  beforeEach(() => {
    // 使用内存数据库进行测试
    db = new Database(':memory:');
    repo = new RepoRepository(db);
    repo.initTable();
  });

  afterEach(() => {
    db.close();
  });

  describe('initTable', () => {
    it('should create repositories table', () => {
      const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='repositories'").get();
      expect(table).toBeDefined();
    });
  });

  describe('saveRepositories', () => {
    describe('正常场景', () => {
      it('should save repositories to database', () => {
        const repos = createMockRepos(3);

        repo.saveRepositories(repos);

        const count = db.prepare('SELECT COUNT(*) as count FROM repositories').get() as { count: number };
        expect(count.count).toBe(3);
      });

      it('should replace existing data on save', () => {
        const repos1 = createMockRepos(3);
        const repos2 = createMockRepos(5);

        repo.saveRepositories(repos1);
        repo.saveRepositories(repos2);

        const count = db.prepare('SELECT COUNT(*) as count FROM repositories').get() as { count: number };
        expect(count.count).toBe(5);
      });

      it('should save all repository fields correctly', () => {
        const repos = [createMockRepo()];

        repo.saveRepositories(repos);

        const saved = db.prepare('SELECT * FROM repositories WHERE id = ?').get(repos[0].id) as any;
        expect(saved.name).toBe(repos[0].name);
        expect(saved.stars).toBe(repos[0].stars);
        expect(saved.language).toBe(repos[0].language);
      });
    });

    describe('边界条件', () => {
      it('should handle empty array', () => {
        repo.saveRepositories([]);

        const count = db.prepare('SELECT COUNT(*) as count FROM repositories').get() as { count: number };
        expect(count.count).toBe(0);
      });

      it('should handle null fields', () => {
        const repos = [createMockRepo({
          description: null,
          language: null,
          license: null
        })];

        expect(() => repo.saveRepositories(repos)).not.toThrow();
      });
    });
  });

  describe('getRepositories', () => {
    beforeEach(() => {
      repo.saveRepositories(createMockRepos(20));
    });

    describe('正常场景', () => {
      it('should return all repositories', () => {
        const result = repo.getRepositories({});
        expect(result.data).toHaveLength(20);
      });

      it('should return paginated results', () => {
        const result = repo.getRepositories({ page: 1, pageSize: 10 });
        expect(result.data).toHaveLength(10);
        expect(result.pagination.page).toBe(1);
        expect(result.pagination.totalPages).toBe(2);
      });

      it('should return correct page', () => {
        const result1 = repo.getRepositories({ page: 1, pageSize: 10 });
        const result2 = repo.getRepositories({ page: 2, pageSize: 10 });

        expect(result1.data[0].id).not.toBe(result2.data[0].id);
      });
    });

    describe('搜索功能', () => {
      it('should filter by search keyword in name', () => {
        const repos = [
          createMockRepo({ id: 1, name: 'android-ui', fullName: 'test/android-ui' }),
          createMockRepo({ id: 2, name: 'kotlin-lib', fullName: 'test/kotlin-lib' }),
          createMockRepo({ id: 3, name: 'android-sdk', fullName: 'test/android-sdk' })
        ];
        repo.saveRepositories(repos);

        const result = repo.getRepositories({ search: 'android' });

        expect(result.data).toHaveLength(2);
        expect(result.data.every(r => r.name.includes('android'))).toBe(true);
      });

      it('should filter by search keyword in description', () => {
        const repos = [
          createMockRepo({ id: 1, description: 'Android UI library' }),
          createMockRepo({ id: 2, description: 'Kotlin utilities' })
        ];
        repo.saveRepositories(repos);

        const result = repo.getRepositories({ search: 'UI' });

        expect(result.data).toHaveLength(1);
        expect(result.data[0].id).toBe(1);
      });

      it('should be case-insensitive', () => {
        const repos = [
          createMockRepo({ id: 1, name: 'Android-App' })
        ];
        repo.saveRepositories(repos);

        const result = repo.getRepositories({ search: 'android' });

        expect(result.data).toHaveLength(1);
      });
    });

    describe('筛选功能', () => {
      it('should filter by language', () => {
        const repos = [
          createMockRepo({ id: 1, language: 'Java' }),
          createMockRepo({ id: 2, language: 'Kotlin' }),
          createMockRepo({ id: 3, language: 'Java' })
        ];
        repo.saveRepositories(repos);

        const result = repo.getRepositories({ language: 'Java' });

        expect(result.data).toHaveLength(2);
      });

      it('should filter by star range', () => {
        const repos = [
          createMockRepo({ id: 1, stars: 500 }),
          createMockRepo({ id: 2, stars: 5000 }),
          createMockRepo({ id: 3, stars: 15000 })
        ];
        repo.saveRepositories(repos);

        const result = repo.getRepositories({ starRange: '5000-10000' });

        expect(result.data).toHaveLength(1);
        expect(result.data[0].id).toBe(2);
      });

      it('should filter by update range', () => {
        const now = new Date();
        const repos = [
          createMockRepo({ id: 1, pushedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString() }), // 3 days ago
          createMockRepo({ id: 2, pushedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString() }) // 10 days ago
        ];
        repo.saveRepositories(repos);

        const result = repo.getRepositories({ updateRange: 'week' });

        expect(result.data).toHaveLength(1);
        expect(result.data[0].id).toBe(1);
      });
    });

    describe('排序功能', () => {
      it('should sort by stars descending by default', () => {
        const repos = [
          createMockRepo({ id: 1, stars: 1000 }),
          createMockRepo({ id: 2, stars: 5000 }),
          createMockRepo({ id: 3, stars: 3000 })
        ];
        repo.saveRepositories(repos);

        const result = repo.getRepositories({});

        expect(result.data[0].stars).toBe(5000);
        expect(result.data[1].stars).toBe(3000);
        expect(result.data[2].stars).toBe(1000);
      });

      it('should sort by forks', () => {
        const repos = [
          createMockRepo({ id: 1, forks: 100 }),
          createMockRepo({ id: 2, forks: 500 }),
          createMockRepo({ id: 3, forks: 300 })
        ];
        repo.saveRepositories(repos);

        const result = repo.getRepositories({ sortBy: 'forks', sortOrder: 'desc' });

        expect(result.data[0].forks).toBe(500);
      });

      it('should sort ascending', () => {
        const repos = [
          createMockRepo({ id: 1, stars: 5000 }),
          createMockRepo({ id: 2, stars: 1000 }),
          createMockRepo({ id: 3, stars: 3000 })
        ];
        repo.saveRepositories(repos);

        const result = repo.getRepositories({ sortBy: 'stars', sortOrder: 'asc' });

        expect(result.data[0].stars).toBe(1000);
        expect(result.data[2].stars).toBe(5000);
      });
    });

    describe('组合筛选', () => {
      it('should combine search and filter', () => {
        const repos = [
          createMockRepo({ id: 1, name: 'android-lib', language: 'Java', stars: 5000 }),
          createMockRepo({ id: 2, name: 'android-sdk', language: 'Kotlin', stars: 3000 }),
          createMockRepo({ id: 3, name: 'kotlin-lib', language: 'Kotlin', stars: 4000 })
        ];
        repo.saveRepositories(repos);

        const result = repo.getRepositories({
          search: 'android',
          language: 'Kotlin'
        });

        expect(result.data).toHaveLength(1);
        expect(result.data[0].id).toBe(2);
      });
    });

    describe('边界条件', () => {
      it('should handle page beyond total pages', () => {
        const result = repo.getRepositories({ page: 100, pageSize: 10 });
        expect(result.data).toHaveLength(0);
        expect(result.pagination.totalPages).toBe(2);
      });

      it('should handle invalid page number', () => {
        const result = repo.getRepositories({ page: -1, pageSize: 10 });
        expect(result.pagination.page).toBe(1); // 应该返回第一页
      });

      it('should handle large pageSize', () => {
        const result = repo.getRepositories({ page: 1, pageSize: 1000 });
        expect(result.data).toHaveLength(20); // 最多返回实际数量
      });
    });
  });

  describe('getRepoById', () => {
    it('should return repository by id', () => {
      const repos = [createMockRepo({ id: 123 })];
      repo.saveRepositories(repos);

      const result = repo.getRepoById(123);

      expect(result).toBeDefined();
      expect(result?.id).toBe(123);
    });

    it('should return null for non-existent id', () => {
      const result = repo.getRepoById(99999);
      expect(result).toBeNull();
    });
  });

  describe('getCount', () => {
    it('should return total count', () => {
      repo.saveRepositories(createMockRepos(50));

      expect(repo.getCount({})).toBe(50);
    });

    it('should return filtered count', () => {
      const repos = [
        createMockRepo({ id: 1, language: 'Java' }),
        createMockRepo({ id: 2, language: 'Kotlin' }),
        createMockRepo({ id: 3, language: 'Java' })
      ];
      repo.saveRepositories(repos);

      expect(repo.getCount({ language: 'Java' })).toBe(2);
    });
  });

  describe('clearAll', () => {
    it('should delete all repositories', () => {
      repo.saveRepositories(createMockRepos(10));
      repo.clearAll();

      const count = db.prepare('SELECT COUNT(*) as count FROM repositories').get() as { count: number };
      expect(count.count).toBe(0);
    });
  });
});

// Helper functions
function createMockRepo(overrides?: Partial<Repository>): Repository {
  return {
    id: Math.floor(Math.random() * 100000),
    rank: 1,
    name: 'test-repo',
    fullName: 'owner/test-repo',
    description: 'Test repository',
    url: 'https://api.github.com/repos/owner/test-repo',
    htmlUrl: 'https://github.com/owner/test-repo',
    stars: 1000,
    forks: 100,
    language: 'Java',
    license: 'MIT',
    ownerId: 1,
    ownerName: 'owner',
    ownerAvatar: 'https://avatar.url',
    ownerType: 'User',
    isFork: false,
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    pushedAt: new Date().toISOString(),
    openIssues: 10,
    watchers: 50,
    topics: ['android'],
    homepage: null,
    ...overrides
  };
}

function createMockRepos(count: number): Repository[] {
  return Array.from({ length: count }, (_, i) =>
    createMockRepo({
      id: i + 1,
      rank: i + 1,
      name: `repo-${i + 1}`,
      fullName: `owner/repo-${i + 1}`,
      stars: 10000 - i * 100,
      forks: 1000 - i * 10
    })
  );
}
