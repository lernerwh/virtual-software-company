import { Request, Response, NextFunction, Router } from 'express';
import { RepoService } from '../services/repoService';

export function createStatusController(repoService: RepoService): Router {
  const router = Router();

  /**
   * GET /api/status - 获取系统状态
   */
  router.get('/', (req: Request, res: Response) => {
    const metadata = repoService.getMetadata();
    res.json({ metadata });
  });

  return router;
}

export default createStatusController;
