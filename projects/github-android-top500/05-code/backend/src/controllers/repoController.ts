import { Request, Response, NextFunction, Router } from 'express';
import type { RepoQuery } from '../models/types';
import { RepoService } from '../services/repoService';
import { ExportService } from '../services/exportService';
import { createError } from '../middleware/errorHandler';

export function createRepoController(repoService: RepoService, exportService: ExportService): Router {
  const router = Router();

  /**
   * GET /api/repos - 获取项目列表
   */
  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query: RepoQuery = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: Math.min(100, parseInt(req.query.pageSize as string) || 20),
        search: req.query.search as string || undefined,
        language: req.query.language as RepoQuery['language'] || undefined,
        starRange: req.query.starRange as RepoQuery['starRange'] || undefined,
        updateRange: req.query.updateRange as RepoQuery['updateRange'] || undefined,
        sortBy: (req.query.sortBy as RepoQuery['sortBy']) || 'stars',
        sortOrder: (req.query.sortOrder as RepoQuery['sortOrder']) || 'desc',
      };

      // 参数验证
      if (query.page && query.page < 1) {
        throw createError.badRequest('Page must be greater than 0');
      }

      const result = await repoService.getRepos(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/repos/:id - 获取单个项目
   */
  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw createError.badRequest('Invalid repository ID');
      }

      const repo = repoService.getRepoById(id);
      if (!repo) {
        throw createError.notFound('Repository not found');
      }

      res.json({ data: repo });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/export - 导出Excel
   */
  router.get('/export', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query: RepoQuery = {
        search: req.query.search as string || undefined,
        language: req.query.language as RepoQuery['language'] || undefined,
        starRange: req.query.starRange as RepoQuery['starRange'] || undefined,
        updateRange: req.query.updateRange as RepoQuery['updateRange'] || undefined,
      };

      const fields = req.query.fields
        ? (req.query.fields as string).split(',')
        : undefined;

      // 获取所有匹配的数据（不分页）
      const allDataQuery = { ...query, page: 1, pageSize: 1000 };
      const { data } = repoService.getRepos(allDataQuery);

      // 生成Excel
      const buffer = await exportService.exportToExcel(data, { fields });
      const filename = exportService.generateFileName();

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export default createRepoController;
