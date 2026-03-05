/**
 * 统计进度组件测试
 * 测试文件: StatsProgress.test.tsx
 * 组件: StatsProgress
 * 创建日期: 2026-03-05
 * 版本: v1.1.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { StatsProgress } from '../../../05-code/frontend/src/components/StatsProgress';
import * as api from '../../../05-code/frontend/src/api/stats';

// Mock API
vi.mock('../../../05-code/frontend/src/api/stats');

describe('StatsProgress', () => {
  const mockRepoId = 1;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('渲染测试', () => {
    it('should render nothing when status is idle', () => {
      const { container } = render(
        <StatsProgress
          repoId={mockRepoId}
          status="idle"
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should show cloning progress', () => {
      render(
        <StatsProgress
          repoId={mockRepoId}
          status="cloning"
          progress={30}
        />
      );

      expect(screen.getByText('正在克隆仓库...')).toBeDefined();
      expect(screen.getByText('30%')).toBeDefined();
    });

    it('should show analyzing progress', () => {
      render(
        <StatsProgress
          repoId={mockRepoId}
          status="analyzing"
          progress={70}
        />
      );

      expect(screen.getByText('正在统计代码...')).toBeDefined();
      expect(screen.getByText('70%')).toBeDefined();
    });

    it('should show completed status', () => {
      render(
        <StatsProgress
          repoId={mockRepoId}
          status="completed"
          progress={100}
        />
      );

      expect(screen.getByText('统计完成')).toBeDefined();
    });

    it('should show failed status', () => {
      render(
        <StatsProgress
          repoId={mockRepoId}
          status="failed"
          error="克隆仓库失败"
        />
      );

      expect(screen.getByText(/统计失败/)).toBeDefined();
      expect(screen.getByText('克隆仓库失败')).toBeDefined();
    });
  });

  describe('进度条动画', () => {
    it('should display progress bar with correct width', () => {
      render(
        <StatsProgress
          repoId={mockRepoId}
          status="cloning"
          progress={50}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveStyle({ width: '50%' });
    });

    it('should animate progress changes', () => {
      const { rerender } = render(
        <StatsProgress
          repoId={mockRepoId}
          status="cloning"
          progress={20}
        />
      );

      let progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveStyle({ width: '20%' });

      rerender(
        <StatsProgress
          repoId={mockRepoId}
          status="cloning"
          progress={80}
        />
      );

      progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveStyle({ width: '80%' });
    });

    it('should show different colors for different statuses', () => {
      const { rerender } = render(
        <StatsProgress
          repoId={mockRepoId}
          status="cloning"
          progress={30}
        />
      );

      let progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('bg-blue-500'); // 克隆中为蓝色

      rerender(
        <StatsProgress
          repoId={mockRepoId}
          status="analyzing"
          progress={60}
        />
      );

      progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('bg-yellow-500'); // 统计中为黄色

      rerender(
        <StatsProgress
          repoId={mockRepoId}
          status="completed"
          progress={100}
        />
      );

      progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('bg-green-500'); // 完成为绿色
    });
  });

  describe('状态轮询', () => {
    it('should poll status periodically', async () => {
      const mockGetStatsStatus = vi.mocked(api.getStatsStatus);
      mockGetStatsStatus.mockResolvedValue({
        jobId: 'job-123',
        repoId: mockRepoId,
        status: 'cloning',
        progress: 20
      });

      render(
        <StatsProgress
          repoId={mockRepoId}
          status="cloning"
          progress={10}
          pollInterval={1000}
        />
      );

      // 等待第一次轮询
      await vi.advanceTimersByTimeAsync(1000);

      expect(mockGetStatsStatus).toHaveBeenCalledWith(mockRepoId);
    });

    it('should stop polling when completed', async () => {
      const mockGetStatsStatus = vi.mocked(api.getStatsStatus);
      mockGetStatsStatus
        .mockResolvedValueOnce({
          jobId: 'job-123',
          status: 'cloning',
          progress: 50
        })
        .mockResolvedValueOnce({
          jobId: 'job-123',
          status: 'completed',
          progress: 100
        });

      const { rerender } = render(
        <StatsProgress
          repoId={mockRepoId}
          status="cloning"
          progress={50}
          pollInterval={1000}
        />
      );

      // 第一次轮询
      await vi.advanceTimersByTimeAsync(1000);
      expect(mockGetStatsStatus).toHaveBeenCalledTimes(1);

      // 第二次轮询返回完成
      await vi.advanceTimersByTimeAsync(1000);
      expect(mockGetStatsStatus).toHaveBeenCalledTimes(2);

      // 更新为完成状态
      rerender(
        <StatsProgress
          repoId={mockRepoId}
          status="completed"
          progress={100}
        />
      );

      // 不应再轮询
      await vi.advanceTimersByTimeAsync(1000);
      expect(mockGetStatsStatus).toHaveBeenCalledTimes(2);
    });

    it('should stop polling when failed', async () => {
      const mockGetStatsStatus = vi.mocked(api.getStatsStatus);
      mockGetStatsStatus.mockResolvedValue({
        jobId: 'job-123',
        status: 'failed',
        error: '克隆失败'
      });

      render(
        <StatsProgress
          repoId={mockRepoId}
          status="cloning"
          progress={20}
          pollInterval={1000}
        />
      );

      await vi.advanceTimersByTimeAsync(1000);

      // 失败后不应再轮询
      mockGetStatsStatus.mockClear();
      await vi.advanceTimersByTimeAsync(2000);
      expect(mockGetStatsStatus).not.toHaveBeenCalled();
    });

    it('should update progress from polling', async () => {
      const mockGetStatsStatus = vi.mocked(api.getStatsStatus);
      mockGetStatsStatus.mockResolvedValue({
        jobId: 'job-123',
        status: 'cloning',
        progress: 80
      });

      const onProgressUpdate = vi.fn();

      render(
        <StatsProgress
          repoId={mockRepoId}
          status="cloning"
          progress={20}
          pollInterval={1000}
          onProgressUpdate={onProgressUpdate}
        />
      );

      await vi.advanceTimersByTimeAsync(1000);

      expect(onProgressUpdate).toHaveBeenCalledWith(80);
    });
  });

  describe('错误处理', () => {
    it('should display error message', () => {
      render(
        <StatsProgress
          repoId={mockRepoId}
          status="failed"
          error="cloc 工具未安装"
        />
      );

      expect(screen.getByText('cloc 工具未安装')).toBeDefined();
    });

    it('should handle polling error gracefully', async () => {
      const mockGetStatsStatus = vi.mocked(api.getStatsStatus);
      mockGetStatsStatus.mockRejectedValue(new Error('Network error'));

      const onError = vi.fn();

      render(
        <StatsProgress
          repoId={mockRepoId}
          status="cloning"
          progress={20}
          pollInterval={1000}
          onError={onError}
        />
      );

      await vi.advanceTimersByTimeAsync(1000);

      expect(onError).toHaveBeenCalledWith('Network error');
    });

    it('should show retry button on error', () => {
      const onRetry = vi.fn();

      render(
        <StatsProgress
          repoId={mockRepoId}
          status="failed"
          error="克隆失败"
          onRetry={onRetry}
          showRetry={true}
        />
      );

      const retryButton = screen.getByText('重试');
      expect(retryButton).toBeDefined();
    });
  });

  describe('取消功能', () => {
    it('should show cancel button', () => {
      const onCancel = vi.fn();

      render(
        <StatsProgress
          repoId={mockRepoId}
          status="cloning"
          progress={30}
          onCancel={onCancel}
          showCancel={true}
        />
      );

      expect(screen.getByText('取消')).toBeDefined();
    });

    it('should call onCancel when cancel clicked', () => {
      const onCancel = vi.fn();

      render(
        <StatsProgress
          repoId={mockRepoId}
          status="cloning"
          progress={30}
          onCancel={onCancel}
          showCancel={true}
        />
      );

      const cancelButton = screen.getByText('取消');
      cancelButton.click();

      expect(onCancel).toHaveBeenCalled();
    });

    it('should hide cancel button when completed', () => {
      const onCancel = vi.fn();

      render(
        <StatsProgress
          repoId={mockRepoId}
          status="completed"
          progress={100}
          onCancel={onCancel}
          showCancel={true}
        />
      );

      expect(screen.queryByText('取消')).toBeNull();
    });
  });

  describe('可访问性', () => {
    it('should have correct ARIA attributes', () => {
      render(
        <StatsProgress
          repoId={mockRepoId}
          status="cloning"
          progress={50}
        />
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '50');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should have aria-label', () => {
      render(
        <StatsProgress
          repoId={mockRepoId}
          status="cloning"
          progress={50}
        />
      );

      expect(screen.getByRole('progressbar')).toHaveAttribute(
        'aria-label',
        '代码统计进度'
      );
    });

    it('should announce status changes to screen readers', () => {
      const { rerender } = render(
        <StatsProgress
          repoId={mockRepoId}
          status="cloning"
          progress={30}
        />
      );

      expect(screen.getByRole('status')).toHaveTextContent('正在克隆仓库...');

      rerender(
        <StatsProgress
          repoId={mockRepoId}
          status="analyzing"
          progress={60}
        />
      );

      expect(screen.getByRole('status')).toHaveTextContent('正在统计代码...');
    });
  });

  describe('性能测试', () => {
    it('should not cause memory leaks with polling', async () => {
      const mockGetStatsStatus = vi.mocked(api.getStatsStatus);
      mockGetStatsStatus.mockResolvedValue({
        jobId: 'job-123',
        status: 'cloning',
        progress: 50
      });

      const { unmount } = render(
        <StatsProgress
          repoId={mockRepoId}
          status="cloning"
          progress={50}
          pollInterval={1000}
        />
      );

      // 启动几次轮询
      await vi.advanceTimersByTimeAsync(3000);

      // 卸载组件
      unmount();

      // 清空调用计数
      mockGetStatsStatus.mockClear();

      // 继续时间前进，不应再调用
      await vi.advanceTimersByTimeAsync(3000);

      expect(mockGetStatsStatus).not.toHaveBeenCalled();
    });
  });
});
