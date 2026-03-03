import type { Repository, RepoQuery, RepoListResponse, Metadata } from '../models/types';
import { RepoRepository } from '../repositories/repoRepository';
import { MetaRepository } from '../repositories/metaRepository';
import { CrawlerService } from './crawlerService';
import { isCacheExpired } from '../utils/dateUtils';
import config from '../config';
import logger from '../logger';

export class RepoService {
  private repoRepo: RepoRepository;
  private metaRepo: MetaRepository;
  private crawlerService: CrawlerService;

  constructor(
    repoRepo: RepoRepository,
    metaRepo: MetaRepository,
    crawlerService: CrawlerService
  ) {
    this.repoRepo = repoRepo;
    this.metaRepo = metaRepo;
    this.crawlerService = crawlerService;
  }

  /**
   * 获取项目列表
   */
  getRepos(query: RepoQuery): RepoListResponse {
    const { data, pagination } = this.repoRepo.getRepositories(query);
    const metadata = this.getMetadata();

    return {
      data,
      pagination,
      metadata,
    };
  }

  /**
   * 根据ID获取项目
   */
  getRepoById(id: number): Repository | null {
    return this.repoRepo.getRepoById(id);
  }

  /**
   * 获取元数据
   */
  getMetadata(): Metadata {
    return this.metaRepo.getMetadata();
  }

  /**
   * 刷新数据（从GitHub API）
   */
  async refreshData(): Promise<Metadata> {
    logger.info('Starting data refresh...');

    // 更新状态为updating
    this.metaRepo.updateMetadata({
      updateStatus: 'updating',
      errorMessage: null,
    });

    try {
      // 从GitHub获取数据
      const repos = await this.crawlerService.fetchTopAndroidRepos();

      // 保存到数据库
      this.repoRepo.saveRepositories(repos);

      // 更新元数据
      const now = new Date().toISOString();
      this.metaRepo.updateMetadata({
        lastUpdateTime: now,
        updateStatus: 'success',
        totalCount: repos.length,
        errorMessage: null,
      });

      logger.info(`Data refresh completed. Total repos: ${repos.length}`);
      return this.getMetadata();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // 更新错误状态
      this.metaRepo.updateMetadata({
        updateStatus: 'error',
        errorMessage,
      });

      logger.error(`Data refresh failed: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * 检查是否需要刷新数据
   */
  needsRefresh(): boolean {
    const metadata = this.getMetadata();

    // 如果从未更新过，需要刷新
    if (!metadata.lastUpdateTime) {
      return true;
    }

    // 如果正在更新中，不需要刷新
    if (metadata.updateStatus === 'updating') {
      return false;
    }

    // 检查缓存是否过期
    return isCacheExpired(metadata.lastUpdateTime, config.cache.durationHours);
  }

  /**
   * 自动刷新（如果需要）
   */
  async autoRefreshIfNeeded(): Promise<boolean> {
    if (this.needsRefresh()) {
      logger.info('Auto refresh triggered due to cache expiration');
      try {
        await this.refreshData();
        return true;
      } catch (error) {
        logger.error('Auto refresh failed');
        return false;
      }
    }
    return false;
  }
}

export default RepoService;
