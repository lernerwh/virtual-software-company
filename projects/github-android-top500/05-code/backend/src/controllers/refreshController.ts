import { Request, Response, NextFunction, Router } from 'express';
import { RepoService } from '../services/repoService';
import { createError } from '../middleware/errorHandler';

export function createRefreshController(repoService: RepoService): Router {
  const router = Router();

  /**
   * POST /api/refresh - 触发数据刷新
   */
  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 检查是否已经在更新中
      const metadata = repoService.getMetadata();
      if (metadata.updateStatus === 'updating') {
        throw createError.badRequest('Data refresh is already in progress');
      }

      // 异步触发刷新
      repoService.refreshData().catch((error) => {
        // 错误已在service中记录
      });

      // 立即返回状态
      res.json({
        message: 'Data refresh started',
        metadata: repoService.getMetadata(),
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export default createRefreshController;
