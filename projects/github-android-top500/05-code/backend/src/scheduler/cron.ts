import cron from 'node-cron';
import type { ScheduleStatus } from '../models/types';
import { RepoService } from '../services/repoService';
import config from '../config';
import logger from '../logger';

export class SchedulerService {
  private repoService: RepoService;
  private task: cron.ScheduledTask | null = null;
  private scheduleStatus: ScheduleStatus = {
    isRunning: false,
    nextRunTime: null,
    lastRunTime: null,
    lastRunStatus: null,
  };

  constructor(repoService: RepoService) {
    this.repoService = repoService;
  }

  /**
   * 启动定时任务
   */
  start(): void {
    if (!config.scheduler.enabled) {
      logger.info('Scheduler is disabled');
      return;
    }

    if (this.task) {
      logger.warn('Scheduler is already running');
      return;
    }

    this.task = cron.schedule(config.scheduler.cronSchedule, async () => {
      await this.runScheduledTask();
    });

    // 计算下次运行时间
    this.updateNextRunTime();

    logger.info(`Scheduler started with cron: ${config.scheduler.cronSchedule}`);
    this.scheduleStatus.isRunning = true;
  }

  /**
   * 停止定时任务
   */
  stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
      this.scheduleStatus.isRunning = false;
      logger.info('Scheduler stopped');
    }
  }

  /**
   * 获取调度器状态
   */
  getStatus(): ScheduleStatus {
    return { ...this.scheduleStatus };
  }

  /**
   * 执行定时任务
   */
  private async runScheduledTask(): Promise<void> {
    logger.info('Running scheduled data refresh...');
    this.scheduleStatus.lastRunTime = new Date().toISOString();

    try {
      await this.repoService.refreshData();
      this.scheduleStatus.lastRunStatus = 'success';
      logger.info('Scheduled data refresh completed successfully');
    } catch (error) {
      this.scheduleStatus.lastRunStatus = 'error';
      logger.error('Scheduled data refresh failed:', error);
    }

    this.updateNextRunTime();
  }

  /**
   * 更新下次运行时间
   */
  private updateNextRunTime(): void {
    // 简单实现：基于cron表达式计算下次运行时间
    // 实际项目中可使用 cron-parser 库
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setHours(0, 0, 0, 0);
    nextRun.setDate(nextRun.getDate() + 1);
    this.scheduleStatus.nextRunTime = nextRun.toISOString();
  }
}

export default SchedulerService;
