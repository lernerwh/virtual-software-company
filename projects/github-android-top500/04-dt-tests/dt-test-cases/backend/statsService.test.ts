/**
 * 代码统计服务单元测试
 * 测试文件: statsService.test.ts
 * 模块: StatsService
 * 创建日期: 2026-03-05
 * 版本: v1.1.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StatsService } from '../../../05-code/backend/src/services/statsService';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

// Mock child_process
vi.mock('child_process', () => ({
  exec: vi.fn()
}));

// Mock fs/promises
vi.mock('fs/promises', () => ({
  rm: vi.fn(),
  mkdir: vi.fn(),
  access: vi.fn()
}));

describe('StatsService', () => {
  let statsService: StatsService;
  const mockRepo = {
    id: 1,
    fullName: 'owner/test-repo',
    htmlUrl: 'https://github.com/owner/test-repo'
  };

  beforeEach(() => {
    statsService = new StatsService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Git克隆功能', () => {
    it('should clone repo with --depth 1', async () => {
      const mockExec = vi.mocked(exec);
      mockExec.mockImplementation((cmd, options, callback) => {
        callback(null, { stdout: 'Cloning done', stderr: '' });
      });

      const result = await statsService.cloneRepo(mockRepo);

      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('git clone --depth 1'),
        expect.any(Object),
        expect.any(Function)
      );
      expect(result).toMatchObject({
        success: true,
        tempPath: expect.stringContaining('/tmp/cloc-')
      });
    });

    it('should handle clone timeout', async () => {
      const mockExec = vi.mocked(exec);
      mockExec.mockImplementation((cmd, options, callback) => {
        // 模拟超时
        setTimeout(() => {
          callback(new Error('Command timeout'), { stdout: '', stderr: 'timeout' });
        }, 100);
      });

      await expect(statsService.cloneRepo(mockRepo, 50))
        .rejects.toThrow('克隆仓库超时');
    });

    it('should handle clone failure', async () => {
      const mockExec = vi.mocked(exec);
      mockExec.mockImplementation((cmd, options, callback) => {
        callback(new Error('Repository not found'), { stdout: '', stderr: 'fatal: repository not found' });
      });

      await expect(statsService.cloneRepo(mockRepo))
        .rejects.toThrow('克隆仓库失败');
    });

    it('should generate unique temp directory', async () => {
      const mockExec = vi.mocked(exec);
      mockExec.mockImplementation((cmd, options, callback) => {
        callback(null, { stdout: '', stderr: '' });
      });

      const result1 = await statsService.cloneRepo(mockRepo);
      const result2 = await statsService.cloneRepo(mockRepo);

      expect(result1.tempPath).not.toBe(result2.tempPath);
    });
  });

  describe('cloc调用功能', () => {
    const tempPath = '/tmp/cloc-test-123';

    it('should call cloc with correct path', async () => {
      const mockExec = vi.mocked(exec);
      mockExec.mockImplementation((cmd, options, callback) => {
        callback(null, {
          stdout: JSON.stringify({ Java: { nFiles: 10, blank: 5, comment: 3, code: 100 } }),
          stderr: ''
        });
      });

      const result = await statsService.runCloc(tempPath);

      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining(`cloc "${tempPath}"`),
        expect.any(Object),
        expect.any(Function)
      );
      expect(result).toBeDefined();
    });

    it('should parse cloc JSON output correctly', async () => {
      const mockExec = vi.mocked(exec);
      const clocOutput = {
        Java: { nFiles: 100, blank: 500, comment: 300, code: 5000 },
        Kotlin: { nFiles: 50, blank: 200, comment: 100, code: 2000 }
      };

      mockExec.mockImplementation((cmd, options, callback) => {
        callback(null, { stdout: JSON.stringify(clocOutput), stderr: '' });
      });

      const result = await statsService.runCloc(tempPath);

      expect(result).toEqual(clocOutput);
    });

    it('should handle cloc not installed', async () => {
      const mockExec = vi.mocked(exec);
      mockExec.mockImplementation((cmd, options, callback) => {
        callback(new Error('command not found: cloc'), { stdout: '', stderr: 'cloc: command not found' });
      });

      await expect(statsService.runCloc(tempPath))
        .rejects.toThrow('cloc 工具未安装');
    });

    it('should handle cloc version incompatibility', async () => {
      const mockExec = vi.mocked(exec);
      mockExec.mockImplementation((cmd, options, callback) => {
        callback(new Error('Unsupported version'), { stdout: '', stderr: 'error' });
      });

      await expect(statsService.runCloc(tempPath))
        .rejects.toThrow();
    });

    it('should use --json flag for output', async () => {
      const mockExec = vi.mocked(exec);
      mockExec.mockImplementation((cmd, options, callback) => {
        callback(null, { stdout: '{}', stderr: '' });
      });

      await statsService.runCloc(tempPath);

      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('--json'),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('统计结果解析', () => {
    it('should calculate total lines correctly', () => {
      const clocResult = {
        Java: { nFiles: 100, blank: 500, comment: 300, code: 5000 },
        Kotlin: { nFiles: 50, blank: 200, comment: 100, code: 2000 }
      };

      const stats = statsService.parseStats(clocResult);

      expect(stats.totalLines).toBe(8100); // (500+300+5000) + (200+100+2000)
      expect(stats.codeLines).toBe(7000);
      expect(stats.commentLines).toBe(400);
      expect(stats.blankLines).toBe(700);
    });

    it('should extract language stats', () => {
      const clocResult = {
        Java: { nFiles: 100, blank: 500, comment: 300, code: 5000 },
        Kotlin: { nFiles: 50, blank: 200, comment: 100, code: 2000 }
      };

      const stats = statsService.parseStats(clocResult);

      expect(stats.languages).toHaveLength(2);
      expect(stats.languages[0]).toMatchObject({
        language: 'Java',
        files: 100,
        blank: 500,
        comment: 300,
        code: 5000
      });
    });

    it('should handle empty repository', () => {
      const clocResult = {};

      const stats = statsService.parseStats(clocResult);

      expect(stats.totalLines).toBe(0);
      expect(stats.codeLines).toBe(0);
      expect(stats.languages).toEqual([]);
    });

    it('should handle single language repo', () => {
      const clocResult = {
        Java: { nFiles: 50, blank: 100, comment: 50, code: 1000 }
      };

      const stats = statsService.parseStats(clocResult);

      expect(stats.languages).toHaveLength(1);
      expect(stats.totalLines).toBe(1150);
    });

    it('should sort languages by code lines', () => {
      const clocResult = {
        XML: { nFiles: 20, blank: 50, comment: 10, code: 500 },
        Java: { nFiles: 100, blank: 500, comment: 300, code: 5000 },
        Kotlin: { nFiles: 50, blank: 200, comment: 100, code: 2000 }
      };

      const stats = statsService.parseStats(clocResult);

      expect(stats.languages[0].language).toBe('Java'); // 最多代码行
      expect(stats.languages[1].language).toBe('Kotlin');
      expect(stats.languages[2].language).toBe('XML');
    });
  });

  describe('临时文件清理', () => {
    it('should remove temp directory after stats', async () => {
      const mockRm = vi.mocked(fs.rm);
      const tempPath = '/tmp/cloc-test-123';

      await statsService.cleanup(tempPath);

      expect(mockRm).toHaveBeenCalledWith(tempPath, {
        recursive: true,
        force: true
      });
    });

    it('should cleanup on failure', async () => {
      const mockExec = vi.mocked(exec);
      const mockRm = vi.mocked(fs.rm);

      mockExec.mockImplementation((cmd, options, callback) => {
        callback(new Error('Failed'), { stdout: '', stderr: '' });
      });

      await expect(statsService.triggerStats(mockRepo))
        .rejects.toThrow();

      expect(mockRm).toHaveBeenCalled();
    });

    it('should handle cleanup failure gracefully', async () => {
      const mockRm = vi.mocked(fs.rm);
      mockRm.mockRejectedValue(new Error('Permission denied'));

      // 清理失败不应抛出错误
      await expect(statsService.cleanup('/tmp/test')).resolves.not.toThrow();
    });

    it('should not fail if temp dir does not exist', async () => {
      const mockRm = vi.mocked(fs.rm);
      mockRm.mockRejectedValue(new Error('ENOENT'));

      await expect(statsService.cleanup('/tmp/nonexistent')).resolves.not.toThrow();
    });
  });

  describe('并发控制', () => {
    it('should reject concurrent stats request', async () => {
      const mockExec = vi.mocked(exec);
      mockExec.mockImplementation((cmd, options, callback) => {
        // 模拟长时间运行
        setTimeout(() => {
          callback(null, { stdout: '{}', stderr: '' });
        }, 1000);
      });

      // 第一次请求应该成功
      const promise1 = statsService.triggerStats(mockRepo);

      // 第二次请求应该被拒绝
      await expect(statsService.triggerStats(mockRepo))
        .rejects.toThrow('已有统计任务正在进行');

      await promise1;
    });

    it('should allow new stats after completion', async () => {
      const mockExec = vi.mocked(exec);
      mockExec.mockImplementation((cmd, options, callback) => {
        callback(null, { stdout: '{}', stderr: '' });
      });

      // 第一次统计
      await statsService.triggerStats(mockRepo);

      // 等待完成后，第二次应该成功
      await expect(statsService.triggerStats(mockRepo)).resolves.toBeDefined();
    });
  });

  describe('任务状态管理', () => {
    it('should update job status correctly', async () => {
      const mockExec = vi.mocked(exec);
      mockExec.mockImplementation((cmd, options, callback) => {
        callback(null, { stdout: '{}', stderr: '' });
      });

      const job = await statsService.triggerStats(mockRepo);

      expect(job.status).toBe('completed');
      expect(job.progress).toBe(100);
    });

    it('should track cloning progress', async () => {
      const job = statsService.createJob(mockRepo.id);

      expect(job.status).toBe('pending');

      statsService.updateJobStatus(job.id, 'cloning', 20);
      expect(statsService.getJob(job.id).status).toBe('cloning');
      expect(statsService.getJob(job.id).progress).toBe(20);
    });

    it('should track analyzing progress', async () => {
      const job = statsService.createJob(mockRepo.id);

      statsService.updateJobStatus(job.id, 'analyzing', 60);
      expect(statsService.getJob(job.id).status).toBe('analyzing');
      expect(statsService.getJob(job.id).progress).toBe(60);
    });

    it('should handle failed status', async () => {
      const job = statsService.createJob(mockRepo.id);

      statsService.updateJobStatus(job.id, 'failed', 0, 'cloc not installed');

      const failedJob = statsService.getJob(job.id);
      expect(failedJob.status).toBe('failed');
      expect(failedJob.error).toBe('cloc not installed');
    });

    it('should return null for non-existent job', () => {
      const job = statsService.getJob('non-existent-id');
      expect(job).toBeNull();
    });
  });

  describe('完整统计流程', () => {
    it('should complete full stats workflow', async () => {
      const mockExec = vi.mocked(exec);
      const mockRm = vi.mocked(fs.rm);

      // Mock git clone
      mockExec.mockImplementation((cmd, options, callback) => {
        if (cmd.includes('git clone')) {
          callback(null, { stdout: 'Cloning done', stderr: '' });
        } else if (cmd.includes('cloc')) {
          callback(null, {
            stdout: JSON.stringify({
              Java: { nFiles: 100, blank: 500, comment: 300, code: 5000 }
            }),
            stderr: ''
          });
        }
      });

      const result = await statsService.triggerStats(mockRepo);

      expect(result).toMatchObject({
        repoId: mockRepo.id,
        totalLines: 5800,
        codeLines: 5000,
        commentLines: 300,
        blankLines: 500
      });

      expect(mockRm).toHaveBeenCalled();
    });
  });

  describe('错误处理', () => {
    it('should handle invalid repo URL', async () => {
      const invalidRepo = {
        id: 999,
        fullName: 'invalid/repo',
        htmlUrl: 'invalid-url'
      };

      await expect(statsService.triggerStats(invalidRepo))
        .rejects.toThrow();
    });

    it('should handle network interruption during clone', async () => {
      const mockExec = vi.mocked(exec);
      mockExec.mockImplementation((cmd, options, callback) => {
        callback(new Error('Network error'), { stdout: '', stderr: 'network error' });
      });

      await expect(statsService.triggerStats(mockRepo))
        .rejects.toThrow();
    });

    it('should handle permission denied on temp directory', async () => {
      const mockMkdir = vi.mocked(fs.mkdir);
      mockMkdir.mockRejectedValue(new Error('Permission denied'));

      await expect(statsService.triggerStats(mockRepo))
        .rejects.toThrow();
    });
  });
});
