/**
 * 代码统计控制器
 * 文件: statsController.ts
 * 版本: v1.1.0
 */

import { Request, Response } from 'express';
import { statsService } from '../services/statsService';
import logger from '../utils/logger';

/**
 * 触发代码统计
 * POST /api/repos/:id/stats
 */
export async function triggerStats(req: Request, res: Response): Promise<void> {
  try {
    const repoId = parseInt(req.params.id, 10);

    if (isNaN(repoId) || repoId <= 0) {
      res.status(400).json({
        error: 'Bad Request',
        message: '无效的仓库ID'
      });
      return;
    }

    const job = await statsService.triggerStats(repoId);

    res.status(202).json({
      jobId: job.id,
      status: job.status,
      message: '统计任务已创建'
    });
  } catch (error: any) {
    logger.error('Trigger stats error:', error);

    // 处理特定错误
    if (error.message.includes('已有统计任务正在进行')) {
      res.status(409).json({
        error: 'Conflict',
        message: '已有统计任务正在进行'
      });
      return;
    }

    if (error.message.includes('仓库不存在')) {
      res.status(404).json({
        error: 'Not Found',
        message: '仓库不存在'
      });
      return;
    }

    if (error.message.includes('cloc 工具未安装')) {
      res.status(503).json({
        error: 'Service Unavailable',
        message: 'cloc 工具未安装',
        hint: '请运行: brew install cloc 或 sudo apt install cloc'
      });
      return;
    }

    if (error.message.includes('超时')) {
      res.status(408).json({
        error: 'Request Timeout',
        message: error.message
      });
      return;
    }

    // 通用错误处理
    res.status(500).json({
      error: 'Internal Server Error',
      message: '触发代码统计失败'
    });
  }
}

/**
 * 获取统计状态
 * GET /api/repos/:id/stats
 */
export async function getStatsStatus(req: Request, res: Response): Promise<void> {
  try {
    const repoId = parseInt(req.params.id, 10);

    if (isNaN(repoId) || repoId <= 0) {
      res.status(400).json({
        error: 'Bad Request',
        message: '无效的仓库ID'
      });
      return;
    }

    const { job, result } = statsService.getStatsStatus(repoId);

    // 如果没有任务和结果
    if (!job && !result) {
      res.status(404).json({
        error: 'Not Found',
        message: '该仓库尚未进行代码统计'
      });
      return;
    }

    // 返回状态和结果
    const response: any = {};

    if (job) {
      response.jobId = job.id;
      response.status = job.status;
      response.progress = job.progress;

      if (job.error) {
        response.error = job.error;
      }
    }

    if (result) {
      response.result = result;
    }

    res.json(response);
  } catch (error: any) {
    logger.error('Get stats status error:', error);

    res.status(500).json({
      error: 'Internal Server Error',
      message: '获取统计状态失败'
    });
  }
}

/**
 * 获取整体统计进度
 * GET /api/stats/progress
 */
export async function getOverallProgress(req: Request, res: Response): Promise<void> {
  try {
    const progress = await statsService.getOverallProgress();

    res.json(progress);
  } catch (error: any) {
    logger.error('Get overall progress error:', error);

    res.status(500).json({
      error: 'Internal Server Error',
      message: '获取统计进度失败'
    });
  }
}

export default {
  triggerStats,
  getStatsStatus,
  getOverallProgress
};
