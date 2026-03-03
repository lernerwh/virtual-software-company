import { Octokit } from 'octokit';
import type { Repository, FetchStatus } from '../models/types';
import config from '../config';
import logger from '../logger';

export class CrawlerService {
  private octokit: Octokit;
  private fetchStatus: FetchStatus = {
    status: 'idle',
    lastFetchTime: null,
    error: null,
    fetchedCount: 0,
  };

  constructor() {
    this.octokit = new Octokit({
      auth: config.github.token,
      request: {
        timeout: config.crawler.requestTimeout,
      },
    });
  }

  /**
   * 获取Top Android项目
   */
  async fetchTopAndroidRepos(limit: number = config.crawler.repoLimit): Promise<Repository[]> {
    this.fetchStatus.status = 'updating';
    this.fetchStatus.error = null;

    try {
      logger.info(`Starting to fetch top ${limit} Android repositories...`);

      // 使用GitHub Search API搜索Android项目
      const query = 'language:java OR language:kotlin topic:android';
      const allRepos: Array<Record<string, unknown>> = [];

      // GitHub Search API每次最多返回100条，需要分页
      const perPage = 100;
      const pages = Math.ceil(limit / perPage);

      for (let page = 1; page <= pages; page++) {
        const repos = await this.fetchWithRetry(async () => {
          const response = await this.octokit.rest.search.repos({
            q: query,
            sort: 'stars',
            order: 'desc',
            per_page: perPage,
            page,
          });
          return response.data.items;
        });

        allRepos.push(...repos);
        logger.info(`Fetched ${allRepos.length} repos (page ${page}/${pages})`);

        if (repos.length < perPage) {
          break; // 没有更多数据
        }
      }

      // 转换并排序
      const repositories = allRepos
        .slice(0, limit)
        .map((item, index) => this.transformRepo(item, index + 1))
        .sort((a, b) => b.stars - a.stars)
        .map((repo, index) => ({ ...repo, rank: index + 1 }));

      this.fetchStatus.status = 'success';
      this.fetchStatus.lastFetchTime = new Date().toISOString();
      this.fetchStatus.fetchedCount = repositories.length;

      logger.info(`Successfully fetched ${repositories.length} repositories`);
      return repositories;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.fetchStatus.status = 'error';
      this.fetchStatus.error = errorMessage;
      logger.error(`Failed to fetch repositories: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * 带重试的请求
   */
  private async fetchWithRetry<T>(
    fn: () => Promise<T>,
    retries: number = config.crawler.maxRetries
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i <= retries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        // 检查是否是速率限制错误
        if (this.isRateLimitError(error)) {
          const waitTime = this.getRateLimitWaitTime(error);
          logger.warn(`Rate limit exceeded, waiting ${waitTime}ms...`);
          await this.sleep(waitTime);
          continue;
        }

        if (i < retries) {
          logger.warn(`Request failed, retrying (${i + 1}/${retries})...`);
          await this.sleep(config.crawler.retryDelay);
        }
      }
    }

    throw lastError;
  }

  /**
   * 获取当前爬取状态
   */
  getFetchStatus(): FetchStatus {
    return { ...this.fetchStatus };
  }

  /**
   * 转换GitHub API响应为Repository格式
   */
  private transformRepo(item: Record<string, unknown>, rank: number): Repository {
    const owner = item.owner as Record<string, unknown>;
    const license = item.license as Record<string, unknown> | null;

    return {
      id: item.id as number,
      rank,
      name: item.name as string,
      fullName: item.full_name as string,
      description: item.description as string | null,
      url: item.url as string,
      htmlUrl: item.html_url as string,
      stars: item.stargazers_count as number,
      forks: item.forks_count as number,
      language: item.language as string | null,
      license: license?.spdx_id as string | null || null,
      ownerId: owner?.id as number,
      ownerName: owner?.login as string,
      ownerAvatar: owner?.avatar_url as string,
      ownerType: owner?.type as 'User' | 'Organization',
      isFork: item.fork as boolean,
      createdAt: item.created_at as string,
      updatedAt: item.updated_at as string,
      pushedAt: item.pushed_at as string,
      openIssues: item.open_issues_count as number,
      watchers: item.watchers_count as number,
      topics: (item.topics as string[]) || [],
      homepage: item.homepage as string | null,
    };
  }

  /**
   * 检查是否是速率限制错误
   */
  private isRateLimitError(error: unknown): boolean {
    if (error && typeof error === 'object' && 'status' in error) {
      return (error as { status: number }).status === 403;
    }
    return false;
  }

  /**
   * 获取速率限制等待时间
   */
  private getRateLimitWaitTime(error: unknown): number {
    if (error && typeof error === 'object' && 'response' in error) {
      const response = (error as { response?: { headers?: Record<string, string> } }).response;
      const resetTime = response?.headers?.['x-ratelimit-reset'];
      if (resetTime) {
        const resetTimestamp = parseInt(resetTime, 10) * 1000;
        return Math.max(0, resetTimestamp - Date.now());
      }
    }
    return 60000; // 默认等待1分钟
  }

  /**
   * 睡眠函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default CrawlerService;
