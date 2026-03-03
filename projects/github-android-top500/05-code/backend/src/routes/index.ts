import { Router } from 'express';
import { createRepoController } from '../controllers/repoController';
import { createStatusController } from '../controllers/statusController';
import { createRefreshController } from '../controllers/refreshController';
import { RepoService } from '../services/repoService';
import { ExportService } from '../services/exportService';

export function createRoutes(repoService: RepoService, exportService: ExportService): Router {
  const router = Router();

  // 注册路由
  router.use('/repos', createRepoController(repoService, exportService));
  router.use('/status', createStatusController(repoService));
  router.use('/refresh', createRefreshController(repoService));

  // 健康检查
  router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return router;
}

export default createRoutes;
