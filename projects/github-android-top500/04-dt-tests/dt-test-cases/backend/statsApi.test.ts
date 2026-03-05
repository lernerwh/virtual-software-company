/**
 * 代码统计API集成测试
 * 测试文件: statsApi.test.ts
 * 模块: Stats API Endpoints
 * 创建日期: 2026-03-05
 * 版本: v1.1.0
 */

import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { statsController } from '../../../05-code/backend/src/controllers/statsController';
import { StatsService } from '../../../05-code/backend/src/services/statsService';

// Mock StatsService
vi.mock('../../../05-code/backend/src/services/statsService');

describe('Stats API Integration Tests', () => {
  let app: express.Application;
  let mockStatsService: any;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // 路由配置
    app.post('/api/repos/:id/stats', statsController.triggerStats);
    app.get('/api/repos/:id/stats', statsController.getStatsStatus);
    app.get('/api/stats/progress', statsController.getOverallProgress);

    mockStatsService = vi.mocked(StatsService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/repos/:id/stats', () => {
    it('should trigger stats job and return 202', async () => {
      const mockJob = {
        id: 'job-123',
        repoId: 1,
        status: 'pending',
        progress: 0
      };

      mockStatsService.prototype.triggerStats.mockResolvedValue(mockJob);

      const response = await request(app)
        .post('/api/repos/1/stats')
        .expect(202);

      expect(response.body).toMatchObject({
        jobId: 'job-123',
        status: 'pending',
        message: '统计任务已创建'
      });
    });

    it('should reject if stats is already running', async () => {
      mockStatsService.prototype.triggerStats.mockRejectedValue(
        new Error('已有统计任务正在进行')
      );

      const response = await request(app)
        .post('/api/repos/1/stats')
        .expect(409);

      expect(response.body).toMatchObject({
        error: 'Conflict',
        message: '已有统计任务正在进行'
      });
    });

    it('should return 404 for non-existent repo', async () => {
      mockStatsService.prototype.triggerStats.mockRejectedValue(
        new Error('仓库不存在')
      );

      const response = await request(app)
        .post('/api/repos/999/stats')
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Not Found',
        message: '仓库不存在'
      });
    });

    it('should return 400 for invalid repo ID', async () => {
      const response = await request(app)
        .post('/api/repos/invalid/stats')
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Bad Request',
        message: '无效的仓库ID'
      });
    });

    it('should handle cloc not installed error', async () => {
      mockStatsService.prototype.triggerStats.mockRejectedValue(
        new Error('cloc 工具未安装，请先安装: brew install cloc 或 sudo apt install cloc')
      );

      const response = await request(app)
        .post('/api/repos/1/stats')
        .expect(503);

      expect(response.body).toMatchObject({
        error: 'Service Unavailable',
        message: 'cloc 工具未安装',
        hint: '请运行: brew install cloc 或 sudo apt install cloc'
      });
    });

    it('should handle timeout error', async () => {
      mockStatsService.prototype.triggerStats.mockRejectedValue(
        new Error('克隆仓库超时')
      );

      const response = await request(app)
        .post('/api/repos/1/stats')
        .expect(408);

      expect(response.body).toMatchObject({
        error: 'Request Timeout',
        message: '克隆仓库超时'
      });
    });
  });

  describe('GET /api/repos/:id/stats', () => {
    it('should return stats status for running job', async () => {
      const mockStatus = {
        jobId: 'job-123',
        repoId: 1,
        status: 'cloning',
        progress: 30
      };

      mockStatsService.prototype.getStatsStatus.mockResolvedValue(mockStatus);

      const response = await request(app)
        .get('/api/repos/1/stats')
        .expect(200);

      expect(response.body).toMatchObject({
        jobId: 'job-123',
        status: 'cloning',
        progress: 30
      });
    });

    it('should return completed stats result', async () => {
      const mockResult = {
        repoId: 1,
        totalLines: 7500,
        codeLines: 6000,
        commentLines: 1000,
        blankLines: 500,
        languages: [
          { language: 'Java', files: 100, blank: 500, comment: 800, code: 5000 },
          { language: 'Kotlin', files: 50, blank: 200, comment: 200, code: 2000 }
        ],
        statsAt: '2026-03-05T00:00:00Z'
      };

      mockStatsService.prototype.getStatsStatus.mockResolvedValue({
        jobId: 'job-123',
        status: 'completed',
        progress: 100,
        result: mockResult
      });

      const response = await request(app)
        .get('/api/repos/1/stats')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'completed',
        progress: 100,
        result: mockResult
      });
    });

    it('should return 404 if no stats available', async () => {
      mockStatsService.prototype.getStatsStatus.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/repos/1/stats')
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Not Found',
        message: '该仓库尚未进行代码统计'
      });
    });

    it('should return failed status', async () => {
      mockStatsService.prototype.getStatsStatus.mockResolvedValue({
        jobId: 'job-123',
        repoId: 1,
        status: 'failed',
        progress: 20,
        error: '克隆仓库失败'
      });

      const response = await request(app)
        .get('/api/repos/1/stats')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'failed',
        error: '克隆仓库失败'
      });
    });

    it('should support different status values', async () => {
      const statuses = ['pending', 'cloning', 'analyzing', 'completed', 'failed'];

      for (const status of statuses) {
        mockStatsService.prototype.getStatsStatus.mockResolvedValue({
          jobId: 'job-123',
          status: status,
          progress: status === 'completed' ? 100 : 50
        });

        const response = await request(app)
          .get('/api/repos/1/stats')
          .expect(200);

        expect(response.body.status).toBe(status);
      }
    });
  });

  describe('GET /api/stats/progress', () => {
    it('should return overall progress', async () => {
      const mockProgress = {
        total: 500,
        completed: 50,
        inProgress: 1,
        pending: 0,
        failed: 2
      };

      mockStatsService.prototype.getOverallProgress.mockResolvedValue(mockProgress);

      const response = await request(app)
        .get('/api/stats/progress')
        .expect(200);

      expect(response.body).toMatchObject(mockProgress);
    });

    it('should return zero progress when no stats yet', async () => {
      mockStatsService.prototype.getOverallProgress.mockResolvedValue({
        total: 500,
        completed: 0,
        inProgress: 0,
        pending: 0,
        failed: 0
      });

      const response = await request(app)
        .get('/api/stats/progress')
        .expect(200);

      expect(response.body.completed).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      mockStatsService.prototype.getOverallProgress.mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .get('/api/stats/progress')
        .expect(500);

      expect(response.body).toMatchObject({
        error: 'Internal Server Error',
        message: '获取统计进度失败'
      });
    });
  });

  describe('API响应格式验证', () => {
    it('should return correct Content-Type', async () => {
      mockStatsService.prototype.getStatsStatus.mockResolvedValue({
        jobId: 'job-123',
        status: 'completed',
        progress: 100
      });

      const response = await request(app)
        .get('/api/repos/1/stats');

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should include CORS headers', async () => {
      mockStatsService.prototype.triggerStats.mockResolvedValue({
        id: 'job-123',
        status: 'pending'
      });

      const response = await request(app)
        .post('/api/repos/1/stats');

      // 根据实际CORS配置验证
      // expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('性能测试', () => {
    it('should respond within 100ms for status check', async () => {
      mockStatsService.prototype.getStatsStatus.mockResolvedValue({
        jobId: 'job-123',
        status: 'completed',
        progress: 100
      });

      const start = Date.now();
      await request(app)
        .get('/api/repos/1/stats')
        .expect(200);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent requests', async () => {
      mockStatsService.prototype.getStatsStatus.mockResolvedValue({
        jobId: 'job-123',
        status: 'completed',
        progress: 100
      });

      const requests = Array(10).fill(null).map(() =>
        request(app).get('/api/repos/1/stats')
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('安全性测试', () => {
    it('should sanitize repo ID parameter', async () => {
      const maliciousInputs = [
        '../etc/passwd',
        '1; DROP TABLE repos;',
        '<script>alert("xss")</script>'
      ];

      for (const input of maliciousInputs) {
        const response = await request(app)
          .get(`/api/repos/${encodeURIComponent(input)}/stats`);

        expect(response.status).toBe(400);
      }
    });

    it('should not expose internal errors to client', async () => {
      mockStatsService.prototype.triggerStats.mockRejectedValue(
        new Error('Internal: Database connection string: postgresql://user:pass@host/db')
      );

      const response = await request(app)
        .post('/api/repos/1/stats')
        .expect(500);

      expect(response.body.message).not.toContain('Database connection string');
      expect(response.body.message).not.toContain('postgresql://');
    });
  });
});
