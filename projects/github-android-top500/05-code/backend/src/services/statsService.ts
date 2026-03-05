/**
 * 代码统计服务
 * 文件: statsService.ts
 * 版本: v1.1.0
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';
import * as statsRepository from '../repositories/statsRepository';
import { getRepoById, getMetadata } from '../store';
import { CodeStats, StatsJob, ClocOutput, LanguageStats } from '../types';
import logger from '../utils/logger';

const execAsync = promisify(exec);

/**
 * 代码统计服务类
 */
export class StatsService {
  private currentJob: StatsJob | null = null;

  /**
   * 触发代码统计
   */
  async triggerStats(repoId: number): Promise<StatsJob> {
    // 检查是否已有正在运行的统计任务
    const runningJob = statsRepository.getRunningJob();
    if (runningJob) {
      throw new Error('已有统计任务正在进行');
    }

    // 获取仓库信息
    const repo = getRepoById(repoId);
    if (!repo) {
      throw new Error('仓库不存在');
    }

    // 创建任务
    const jobId = this.generateJobId();
    const now = new Date().toISOString();
    const job: StatsJob = {
      id: jobId,
      repoId,
      status: 'pending',
      progress: 0,
      createdAt: now,
      updatedAt: now
    };

    statsRepository.createJob(job);
    this.currentJob = job;

    // 异步执行统计
    this.executeStats(job, repo.htmlUrl)
      .catch(error => {
        logger.error(`Stats job ${jobId} failed:`, error);
      });

    return job;
  }

  /**
   * 执行代码统计
   */
  private async executeStats(job: StatsJob, repoUrl: string): Promise<void> {
    let tempPath = '';

    try {
      // 更新状态：正在克隆
      this.updateJobStatus(job.id, 'cloning', 10);

      // 克隆仓库
      tempPath = await this.cloneRepo(repoUrl);

      // 更新状态：正在统计
      this.updateJobStatus(job.id, 'analyzing', 50);

      // 运行 cloc
      const clocOutput = await this.runCloc(tempPath);

      // 解析结果
      const stats = this.parseStats(clocOutput, job.repoId);

      // 保存结果
      statsRepository.saveStats(stats);

      // 更新状态：完成
      this.updateJobStatus(job.id, 'completed', 100);

      logger.info(`Stats completed for repo ${job.repoId}: ${stats.totalLines} total lines`);
    } catch (error: any) {
      // 更新状态：失败
      const errorMsg = error.message || '未知错误';
      this.updateJobStatus(job.id, 'failed', 0, errorMsg);

      logger.error(`Stats failed for repo ${job.repoId}:`, error);
      throw error;
    } finally {
      // 清理临时文件
      if (tempPath) {
        await this.cleanup(tempPath);
      }

      this.currentJob = null;
    }
  }

  /**
   * 克隆仓库（浅拷贝）
   */
  async cloneRepo(repoUrl: string, timeout = 60000): Promise<string> {
    const timestamp = Date.now();
    const tempPath = path.join('/tmp', `cloc-${timestamp}`);

    try {
      // 创建临时目录
      await fs.mkdir(tempPath, { recursive: true });

      // git clone --depth 1
      const cloneUrl = this.convertToGitUrl(repoUrl);
      const command = `git clone --depth 1 "${cloneUrl}" "${tempPath}"`;

      logger.debug(`Cloning repo: ${cloneUrl}`);

      await execAsync(command, {
        timeout,
        maxBuffer: 10 * 1024 * 1024 // 10MB
      });

      logger.debug(`Repo cloned to ${tempPath}`);

      return tempPath;
    } catch (error: any) {
      // 清理失败的临时目录
      await this.cleanup(tempPath);

      if (error.killed) {
        throw new Error('克隆仓库超时');
      }

      throw new Error(`克隆仓库失败: ${error.message}`);
    }
  }

  /**
   * 运行 cloc 工具
   */
  async runCloc(tempPath: string, timeout = 120000): Promise<ClocOutput> {
    try {
      // 检查 cloc 是否安装
      await execAsync('which cloc');
    } catch {
      throw new Error('cloc 工具未安装，请先安装: brew install cloc 或 sudo apt install cloc');
    }

    try {
      const command = `cloc "${tempPath}" --json --exclude-dir=node_modules,.git,dist,build`;

      logger.debug(`Running cloc: ${command}`);

      const { stdout } = await execAsync(command, {
        timeout,
        maxBuffer: 10 * 1024 * 1024
      });

      const result = JSON.parse(stdout);

      logger.debug(`cloc output parsed successfully`);

      return result;
    } catch (error: any) {
      if (error.killed) {
        throw new Error('统计代码超时');
      }

      if (error.message.includes('command not found')) {
        throw new Error('cloc 工具未安装');
      }

      throw new Error(`统计代码失败: ${error.message}`);
    }
  }

  /**
   * 解析 cloc 输出
   */
  parseStats(clocOutput: ClocOutput, repoId: number): CodeStats {
    const languages: LanguageStats[] = [];
    let totalLines = 0;
    let codeLines = 0;
    let commentLines = 0;
    let blankLines = 0;

    // 遍历各语言统计
    for (const [language, stats] of Object.entries(clocOutput)) {
      // 跳过header字段
      if (language === 'header' || language === 'SUM') {
        continue;
      }

      languages.push({
        language,
        files: stats.nFiles,
        blank: stats.blank,
        comment: stats.comment,
        code: stats.code
      });

      totalLines += stats.blank + stats.comment + stats.code;
      codeLines += stats.code;
      commentLines += stats.comment;
      blankLines += stats.blank;
    }

    // 按代码行数排序
    languages.sort((a, b) => b.code - a.code);

    return {
      repoId,
      totalLines,
      codeLines,
      commentLines,
      blankLines,
      languages,
      statsAt: new Date().toISOString()
    };
  }

  /**
   * 清理临时文件
   */
  async cleanup(tempPath: string): Promise<void> {
    try {
      await fs.rm(tempPath, {
        recursive: true,
        force: true
      });

      logger.debug(`Cleaned up temp directory: ${tempPath}`);
    } catch (error: any) {
      // 清理失败不抛出错误，只记录日志
      logger.warn(`Failed to cleanup temp directory ${tempPath}:`, error.message);
    }
  }

  /**
   * 更新任务状态
   */
  private updateJobStatus(jobId: string, status: string, progress: number, error?: string): void {
    statsRepository.updateJobStatus(jobId, status, progress, error);

    if (this.currentJob && this.currentJob.id === jobId) {
      this.currentJob.status = status as any;
      this.currentJob.progress = progress;
      if (error) {
        this.currentJob.error = error;
      }
      this.currentJob.updatedAt = new Date().toISOString();
    }
  }

  /**
   * 获取统计状态
   */
  getStatsStatus(repoId: number): {
    job: StatsJob | null;
    result: CodeStats | null;
  } {
    const job = statsRepository.getLatestJob(repoId);
    const result = statsRepository.getStats(repoId);

    return { job, result };
  }

  /**
   * 获取整体统计进度
   */
  getOverallProgress(): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    failed: number;
  }> {
    const metadata = getMetadata();
    const total = metadata.totalCount;
    const progress = statsRepository.getOverallProgress(total);
    return Promise.resolve(progress);
  }

  /**
   * 生成任务ID
   */
  private generateJobId(): string {
    return `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 转换 GitHub URL 为 Git URL
   */
  private convertToGitUrl(htmlUrl: string): string {
    // https://github.com/owner/repo -> https://github.com/owner/repo.git
    if (htmlUrl.endsWith('.git')) {
      return htmlUrl;
    }
    return `${htmlUrl}.git`;
  }
}

// 导出单例
export const statsService = new StatsService();

export default statsService;
