import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config.js';
import { getRepositories, getRepoById, getMetadata, getAllRepositories, updateMetadata } from './store.js';
import { fetchAndroidRepos, needsRefresh, refreshIfNeeded } from './crawler.js';
import { exportToExcel, generateFilename } from './exporter.js';
import * as statsController from './controllers/statsController.js';
import { initTables } from './database/init.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 中间件
app.use(cors({ origin: config.cors.origin }));
app.use(express.json());

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 获取状态
app.get('/api/status', (req, res) => {
  const metadata = getMetadata();
  res.json({ metadata });
});

// 获取项目列表
app.get('/api/repos', (req, res) => {
  try {
    const query = {
      page: parseInt(req.query.page as string) || 1,
      pageSize: Math.min(100, parseInt(req.query.pageSize as string) || 20),
      search: req.query.search as string || undefined,
      language: req.query.language as any || undefined,
      starRange: req.query.starRange as any || undefined,
      updateRange: req.query.updateRange as any || undefined,
      sortBy: (req.query.sortBy as any) || 'stars',
      sortOrder: (req.query.sortOrder as any) || 'desc',
    };

    const result = getRepositories(query);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// 获取单个项目
app.get('/api/repos/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: { message: 'Invalid repository ID' } });
    }

    const repo = getRepoById(id);
    if (!repo) {
      return res.status(404).json({ error: { message: 'Repository not found' } });
    }

    res.json({ data: repo });
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// 导出Excel
app.get('/api/export', async (req, res) => {
  try {
    const query = {
      search: req.query.search as string || undefined,
      language: req.query.language as any || undefined,
      starRange: req.query.starRange as any || undefined,
      updateRange: req.query.updateRange as any || undefined,
    };

    const fields = req.query.fields
      ? (req.query.fields as string).split(',')
      : undefined;

    const repos = getAllRepositories(query);
    const buffer = await exportToExcel(repos, { fields });
    const filename = generateFilename();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// [v1.1.0] 代码统计相关API
// 触发代码统计
app.post('/api/repos/:id/stats', async (req, res) => {
  try {
    const repoId = parseInt(req.params.id);
    if (isNaN(repoId) || repoId <= 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '无效的仓库ID'
      });
    }

    const job = await statsService.triggerStats(repoId);
    res.status(202).json({
      jobId: job.id,
      status: job.status,
      message: '统计任务已创建'
    });
  } catch (error: any) {
    if (error.message.includes('已有统计任务')) {
      return res.status(409).json({
        error: 'Conflict',
        message: error.message
      });
    }

    if (error.message.includes('仓库不存在')) {
      return res.status(404).json({
        error: 'Not Found',
        message: error.message
      });
    }

    if (error.message.includes('cloc')) {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'cloc 工具未安装',
        hint: '请运行: brew install cloc 或 sudo apt install cloc'
      });
    }

    if (error.message.includes('超时')) {
      return res.status(408).json({
        error: 'Request Timeout',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: '触发代码统计失败'
    });
  }
});

// 获取统计状态
app.get('/api/repos/:id/stats', (req, res) => {
  try {
    const repoId = parseInt(req.params.id);
    if (isNaN(repoId) || repoId <= 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '无效的仓库ID'
      });
    }

    const { job, result } = statsService.getStatsStatus(repoId);

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

    if (!job && !result) {
      return res.status(404).json({
        error: 'Not Found',
        message: '该仓库尚未进行代码统计'
      });
    }

    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: '获取统计状态失败'
    });
  }
});

// 获取整体统计进度
app.get('/api/stats/progress', async (req, res) => {
  try {
    const progress = await statsService.getOverallProgress();
    res.json(progress);
  } catch (error: any) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: '获取统计进度失败'
    });
  }
});

// 触发刷新
app.post('/api/refresh', async (req, res) => {
  try {
    const metadata = getMetadata();
    if (metadata.updateStatus === 'updating') {
      return res.status(400).json({ error: { message: 'Update already in progress' } });
    }

    // 异步执行更新
    fetchAndroidRepos().catch(err => {
      console.error('Refresh failed:', err);
    });

    res.json({
      message: 'Data refresh started',
      metadata: getMetadata(),
    });
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
    },
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: { message: 'Not found' } });
});

// 启动服务器
const server = app.listen(config.server.port, () => {
  console.log(`Server is running on http://localhost:${config.server.port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // 检查是否需要刷新数据
  if (needsRefresh()) {
    console.log('Initial data refresh needed, starting...');
    fetchAndroidRepos().catch(err => {
      console.error('Initial data refresh failed:', err);
    });
  }
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
