// 后端服务层测试 - 爬虫服务
// File: backend/src/services/crawlerService.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CrawlerService } from '../crawlerService';
import type { Repository } from '../../models/types';

// Mock Octokit
vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn(() => ({
    rest: {
      search: {
        repos: vi.fn()
      }
    },
    paginate: vi.fn()
  }))
}));

describe('CrawlerService', () => {
  let crawlerService: CrawlerService;
  let mockOctokit: any;

  beforeEach(() => {
    vi.clearAllMocks();
    crawlerService = new CrawlerService();
    mockOctokit = (crawlerService as any).octokit;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchTopAndroidRepos', () => {
    describe('正常场景', () => {
      it('should fetch repos with default limit', async () => {
        const mockRepos = createMockRepos(10);
        mockOctokit.paginate.mockResolvedValueOnce(mockRepos);

        const result = await crawlerService.fetchTopAndroidRepos();

        expect(result).toHaveLength(10);
        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('name');
        expect(result[0]).toHaveProperty('stars');
      });

      it('should fetch repos with custom limit', async () => {
        const mockRepos = createMockRepos(50);
        mockOctokit.paginate.mockResolvedValueOnce(mockRepos);

        const result = await crawlerService.fetchTopAndroidRepos(50);

        expect(result).toHaveLength(50);
      });

      it('should transform GitHub API response to Repository format', async () => {
        const mockApiResponse = [{
          id: 12345,
          name: 'test-repo',
          full_name: 'owner/test-repo',
          description: 'A test repo',
          html_url: 'https://github.com/owner/test-repo',
          url: 'https://api.github.com/repos/owner/test-repo',
          stargazers_count: 5000,
          forks_count: 500,
          language: 'Kotlin',
          license: { spdx_id: 'MIT' },
          owner: {
            id: 1,
            login: 'owner',
            avatar_url: 'https://avatar.url',
            type: 'User'
          },
          fork: false,
          created_at: '2020-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          pushed_at: '2024-01-15T00:00:00Z',
          open_issues_count: 10,
          watchers_count: 100,
          topics: ['android', 'kotlin'],
          homepage: 'https://homepage.url'
        }];

        mockOctokit.paginate.mockResolvedValueOnce(mockApiResponse);

        const result = await crawlerService.fetchTopAndroidRepos(1);

        expect(result[0]).toEqual({
          id: 12345,
          rank: 1,
          name: 'test-repo',
          fullName: 'owner/test-repo',
          description: 'A test repo',
          htmlUrl: 'https://github.com/owner/test-repo',
          url: 'https://api.github.com/repos/owner/test-repo',
          stars: 5000,
          forks: 500,
          language: 'Kotlin',
          license: 'MIT',
          ownerId: 1,
          ownerName: 'owner',
          ownerAvatar: 'https://avatar.url',
          ownerType: 'User',
          isFork: false,
          createdAt: '2020-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          pushedAt: '2024-01-15T00:00:00Z',
          openIssues: 10,
          watchers: 100,
          topics: ['android', 'kotlin'],
          homepage: 'https://homepage.url'
        });
      });

      it('should sort repos by stars descending', async () => {
        const mockRepos = [
          createMockRepoItem({ stargazers_count: 1000 }),
          createMockRepoItem({ stargazers_count: 5000 }),
          createMockRepoItem({ stargazers_count: 3000 })
        ];
        mockOctokit.paginate.mockResolvedValueOnce(mockRepos);

        const result = await crawlerService.fetchTopAndroidRepos(3);

        expect(result[0].stars).toBe(5000);
        expect(result[1].stars).toBe(3000);
        expect(result[2].stars).toBe(1000);
      });

      it('should assign correct rank based on sorted position', async () => {
        const mockRepos = [
          createMockRepoItem({ stargazers_count: 5000 }),
          createMockRepoItem({ stargazers_count: 3000 }),
          createMockRepoItem({ stargazers_count: 1000 })
        ];
        mockOctokit.paginate.mockResolvedValueOnce(mockRepos);

        const result = await crawlerService.fetchTopAndroidRepos(3);

        expect(result[0].rank).toBe(1);
        expect(result[1].rank).toBe(2);
        expect(result[2].rank).toBe(3);
      });
    });

    describe('边界条件', () => {
      it('should handle empty response', async () => {
        mockOctokit.paginate.mockResolvedValueOnce([]);

        const result = await crawlerService.fetchTopAndroidRepos();

        expect(result).toEqual([]);
      });

      it('should handle repos with null fields', async () => {
        const mockRepos = [{
          id: 1,
          name: 'test',
          full_name: 'test/test',
          description: null,
          html_url: 'https://github.com/test/test',
          url: 'https://api.github.com/repos/test/test',
          stargazers_count: 100,
          forks_count: 0,
          language: null,
          license: null,
          owner: {
            id: 1,
            login: 'test',
            avatar_url: null,
            type: 'User'
          },
          fork: false,
          created_at: '2020-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          pushed_at: null,
          open_issues_count: 0,
          watchers_count: 0,
          topics: [],
          homepage: null
        }];

        mockOctokit.paginate.mockResolvedValueOnce(mockRepos);

        const result = await crawlerService.fetchTopAndroidRepos(1);

        expect(result[0].description).toBeNull();
        expect(result[0].language).toBeNull();
        expect(result[0].license).toBeNull();
      });

      it('should limit results to requested count', async () => {
        const mockRepos = createMockRepos(600);
        mockOctokit.paginate.mockResolvedValueOnce(mockRepos);

        const result = await crawlerService.fetchTopAndroidRepos(500);

        expect(result).toHaveLength(500);
      });
    });

    describe('错误处理', () => {
      it('should retry on network error', async () => {
        mockOctokit.paginate
          .mockRejectedValueOnce(new Error('Network error'))
          .mockRejectedValueOnce(new Error('Network error'))
          .mockResolvedValueOnce(createMockRepos(10));

        const result = await crawlerService.fetchTopAndroidRepos(10);

        expect(mockOctokit.paginate).toHaveBeenCalledTimes(3);
        expect(result).toHaveLength(10);
      });

      it('should throw after max retries', async () => {
        mockOctokit.paginate.mockRejectedValue(new Error('Network error'));

        await expect(crawlerService.fetchTopAndroidRepos()).rejects.toThrow('Network error');
        expect(mockOctokit.paginate).toHaveBeenCalledTimes(3); // initial + 2 retries
      });

      it('should handle rate limit error', async () => {
        const rateLimitError = new Error('API rate limit exceeded');
        (rateLimitError as any).status = 403;

        mockOctokit.paginate.mockRejectedValue(rateLimitError);

        await expect(crawlerService.fetchTopAndroidRepos()).rejects.toThrow('rate limit');
      });
    });
  });

  describe('getFetchStatus', () => {
    it('should return idle status initially', () => {
      const status = crawlerService.getFetchStatus();

      expect(status.status).toBe('idle');
      expect(status.lastFetchTime).toBeNull();
      expect(status.error).toBeNull();
    });

    it('should return updating status during fetch', async () => {
      mockOctokit.paginate.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve(createMockRepos(10)), 100);
      }));

      const fetchPromise = crawlerService.fetchTopAndroidRepos(10);

      // Check status during fetch
      const status = crawlerService.getFetchStatus();
      expect(status.status).toBe('updating');

      await fetchPromise;
    });

    it('should return success status after successful fetch', async () => {
      mockOctokit.paginate.mockResolvedValueOnce(createMockRepos(10));

      await crawlerService.fetchTopAndroidRepos(10);

      const status = crawlerService.getFetchStatus();
      expect(status.status).toBe('success');
      expect(status.lastFetchTime).not.toBeNull();
    });

    it('should return error status after failed fetch', async () => {
      mockOctokit.paginate.mockRejectedValue(new Error('Fetch failed'));

      try {
        await crawlerService.fetchTopAndroidRepos();
      } catch (e) {
        // expected
      }

      const status = crawlerService.getFetchStatus();
      expect(status.status).toBe('error');
      expect(status.error).toBe('Fetch failed');
    });
  });
});

// Helper functions
function createMockRepoItem(overrides?: Partial<any>): any {
  return {
    id: Math.floor(Math.random() * 100000),
    name: `repo-${Math.random()}`,
    full_name: `owner/repo-${Math.random()}`,
    description: 'Test repository',
    html_url: 'https://github.com/owner/repo',
    url: 'https://api.github.com/repos/owner/repo',
    stargazers_count: 1000,
    forks_count: 100,
    language: 'Java',
    license: { spdx_id: 'MIT' },
    owner: {
      id: 1,
      login: 'owner',
      avatar_url: 'https://avatar.url',
      type: 'User'
    },
    fork: false,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    pushed_at: '2024-01-15T00:00:00Z',
    open_issues_count: 10,
    watchers_count: 50,
    topics: ['android'],
    homepage: null,
    ...overrides
  };
}

function createMockRepos(count: number): any[] {
  return Array.from({ length: count }, (_, i) =>
    createMockRepoItem({ stargazers_count: count - i })
  );
}
