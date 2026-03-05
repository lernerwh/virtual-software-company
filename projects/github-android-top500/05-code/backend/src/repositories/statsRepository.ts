/**
 * 代码统计数据访问层
 * 文件: statsRepository.ts
 * 版本: v1.1.0
 */

import { getDatabase } from '../database/init';
import { CodeStats, StatsJob, OverallProgress } from '../types';
import logger from '../utils/logger';

/**
 * 保存代码统计结果
 */
export function saveStats(stats: CodeStats): void {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO code_stats
    (repo_id, total_lines, code_lines, comment_lines, blank_lines, languages_json, stats_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    stats.repoId,
    stats.totalLines,
    stats.codeLines,
    stats.commentLines,
    stats.blankLines,
    JSON.stringify(stats.languages),
    stats.statsAt
  );

  logger.debug(`Saved code stats for repo ${stats.repoId}`);
}

/**
 * 获取代码统计结果
 */
export function getStats(repoId: number): CodeStats | null {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM code_stats WHERE repo_id = ?
  `);

  const row = stmt.get(repoId) as any;

  if (!row) {
    return null;
  }

  return {
    repoId: row.repo_id,
    totalLines: row.total_lines,
    codeLines: row.code_lines,
    commentLines: row.comment_lines,
    blankLines: row.blank_lines,
    languages: row.languages_json ? JSON.parse(row.languages_json) : [],
    statsAt: row.stats_at
  };
}

/**
 * 删除代码统计结果
 */
export function deleteStats(repoId: number): void {
  const db = getDatabase();

  const stmt = db.prepare(`DELETE FROM code_stats WHERE repo_id = ?`);
  stmt.run(repoId);

  logger.debug(`Deleted code stats for repo ${repoId}`);
}

/**
 * 创建统计任务
 */
export function createJob(job: StatsJob): void {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO stats_jobs
    (id, repo_id, status, progress, error, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    job.id,
    job.repoId,
    job.status,
    job.progress,
    job.error || null,
    job.createdAt,
    job.updatedAt
  );

  logger.debug(`Created stats job ${job.id} for repo ${job.repoId}`);
}

/**
 * 获取统计任务
 */
export function getJob(jobId: string): StatsJob | null {
  const db = getDatabase();

  const stmt = db.prepare(`SELECT * FROM stats_jobs WHERE id = ?`);
  const row = stmt.get(jobId) as any;

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    repoId: row.repo_id,
    status: row.status,
    progress: row.progress,
    error: row.error || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * 获取仓库的最新统计任务
 */
export function getLatestJob(repoId: number): StatsJob | null {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM stats_jobs
    WHERE repo_id = ?
    ORDER BY created_at DESC
    LIMIT 1
  `);

  const row = stmt.get(repoId) as any;

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    repoId: row.repo_id,
    status: row.status,
    progress: row.progress,
    error: row.error || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * 更新统计任务状态
 */
export function updateJobStatus(
  jobId: string,
  status: string,
  progress: number,
  error?: string
): void {
  const db = getDatabase();

  const stmt = db.prepare(`
    UPDATE stats_jobs
    SET status = ?, progress = ?, error = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(status, progress, error || null, jobId);

  logger.debug(`Updated stats job ${jobId}: ${status} (${progress}%)`);
}

/**
 * 删除统计任务
 */
export function deleteJob(jobId: string): void {
  const db = getDatabase();

  const stmt = db.prepare(`DELETE FROM stats_jobs WHERE id = ?`);
  stmt.run(jobId);

  logger.debug(`Deleted stats job ${jobId}`);
}

/**
 * 获取正在运行的统计任务
 */
export function getRunningJob(): StatsJob | null {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM stats_jobs
    WHERE status IN ('pending', 'cloning', 'analyzing')
    ORDER BY created_at DESC
    LIMIT 1
  `);

  const row = stmt.get() as any;

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    repoId: row.repo_id,
    status: row.status,
    progress: row.progress,
    error: row.error || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * 获取整体统计进度
 */
export function getOverallProgress(totalRepos: number): OverallProgress {
  const db = getDatabase();

  const completedStmt = db.prepare(`
    SELECT COUNT(*) as count FROM code_stats
  `);
  const completed = (completedStmt.get() as any)?.count || 0;

  const inProgressStmt = db.prepare(`
    SELECT COUNT(*) as count FROM stats_jobs
    WHERE status IN ('pending', 'cloning', 'analyzing')
  `);
  const inProgress = (inProgressStmt.get() as any)?.count || 0;

  const failedStmt = db.prepare(`
    SELECT COUNT(DISTINCT repo_id) as count FROM stats_jobs
    WHERE status = 'failed'
  `);
  const failed = (failedStmt.get() as any)?.count || 0;

  return {
    total: totalRepos,
    completed,
    inProgress,
    pending: 0, // 暂不统计pending
    failed
  };
}

/**
 * 清理过期的统计任务（超过24小时）
 */
export function cleanOldJobs(): number {
  const db = getDatabase();

  const stmt = db.prepare(`
    DELETE FROM stats_jobs
    WHERE created_at < datetime('now', '-24 hours')
  `);

  const result = stmt.run();

  if (result.changes > 0) {
    logger.info(`Cleaned ${result.changes} old stats jobs`);
  }

  return result.changes;
}

export default {
  saveStats,
  getStats,
  deleteStats,
  createJob,
  getJob,
  getLatestJob,
  updateJobStatus,
  deleteJob,
  getRunningJob,
  getOverallProgress,
  cleanOldJobs
};
