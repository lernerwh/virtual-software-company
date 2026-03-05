/**
 * 统计按钮组件测试
 * 测试文件: StatsButton.test.tsx
 * 组件: StatsButton
 * 创建日期: 2026-03-05
 * 版本: v1.1.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StatsButton } from '../../../05-code/frontend/src/components/StatsButton';
import * as api from '../../../05-code/frontend/src/api/stats';

// Mock API
vi.mock('../../../05-code/frontend/src/api/stats');

describe('StatsButton', () => {
  const mockRepo = {
    id: 1,
    name: 'test-repo',
    fullName: 'owner/test-repo'
  };

  const mockOnStatsStart = vi.fn();
  const mockOnStatsComplete = vi.fn();
  const mockOnStatsError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('渲染测试', () => {
    it('should render button with default state', () => {
      render(
        <StatsButton
          repo={mockRepo}
          onStatsStart={mockOnStatsStart}
          onStatsComplete={mockOnStatsComplete}
          onStatsError={mockOnStatsError}
        />
      );

      expect(screen.getByRole('button')).toHaveTextContent('统计代码');
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    it('should render with custom className', () => {
      render(
        <StatsButton
          repo={mockRepo}
          className="custom-class"
          onStatsStart={mockOnStatsStart}
          onStatsComplete={mockOnStatsComplete}
          onStatsError={mockOnStatsError}
        />
      );

      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('should render icon', () => {
      render(
        <StatsButton
          repo={mockRepo}
          showIcon={true}
          onStatsStart={mockOnStatsStart}
          onStatsComplete={mockOnStatsComplete}
          onStatsError={mockOnStatsError}
        />
      );

      // 验证图标存在（根据实际图标库调整）
      expect(screen.getByRole('button').querySelector('svg')).toBeDefined();
    });
  });

  describe('交互测试', () => {
    it('should trigger stats on click', async () => {
      const mockTriggerStats = vi.mocked(api.triggerStats);
      mockTriggerStats.mockResolvedValue({
        jobId: 'job-123',
        status: 'pending'
      });

      render(
        <StatsButton
          repo={mockRepo}
          onStatsStart={mockOnStatsStart}
          onStatsComplete={mockOnStatsComplete}
          onStatsError={mockOnStatsError}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockTriggerStats).toHaveBeenCalledWith(mockRepo.id);
      });
    });

    it('should call onStatsStart when clicked', async () => {
      const mockTriggerStats = vi.mocked(api.triggerStats);
      mockTriggerStats.mockResolvedValue({
        jobId: 'job-123',
        status: 'pending'
      });

      render(
        <StatsButton
          repo={mockRepo}
          onStatsStart={mockOnStatsStart}
          onStatsComplete={mockOnStatsComplete}
          onStatsError={mockOnStatsError}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockOnStatsStart).toHaveBeenCalledWith(mockRepo.id);
      });
    });

    it('should prevent double-click', async () => {
      const mockTriggerStats = vi.mocked(api.triggerStats);
      mockTriggerStats.mockImplementation(() =>
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <StatsButton
          repo={mockRepo}
          onStatsStart={mockOnStatsStart}
          onStatsComplete={mockOnStatsComplete}
          onStatsError={mockOnStatsError}
        />
      );

      const button = screen.getByRole('button');

      // 快速双击
      fireEvent.click(button);
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockTriggerStats).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('状态测试', () => {
    it('should disable button while stats running', async () => {
      const mockTriggerStats = vi.mocked(api.triggerStats);
      mockTriggerStats.mockImplementation(() =>
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <StatsButton
          repo={mockRepo}
          onStatsStart={mockOnStatsStart}
          onStatsComplete={mockOnStatsComplete}
          onStatsError={mockOnStatsError}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });

    it('should show loading state', async () => {
      const mockTriggerStats = vi.mocked(api.triggerStats);
      mockTriggerStats.mockImplementation(() =>
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <StatsButton
          repo={mockRepo}
          onStatsStart={mockOnStatsStart}
          onStatsComplete={mockOnStatsComplete}
          onStatsError={mockOnStatsError}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByRole('button')).toHaveTextContent('统计中...');
      });
    });

    it('should show different states', async () => {
      const mockTriggerStats = vi.mocked(api.triggerStats);
      mockTriggerStats.mockResolvedValue({
        jobId: 'job-123',
        status: 'pending'
      });

      const { rerender } = render(
        <StatsButton
          repo={mockRepo}
          status="idle"
          onStatsStart={mockOnStatsStart}
          onStatsComplete={mockOnStatsComplete}
          onStatsError={mockOnStatsError}
        />
      );

      expect(screen.getByRole('button')).toHaveTextContent('统计代码');

      // 状态变为 cloning
      rerender(
        <StatsButton
          repo={mockRepo}
          status="cloning"
          onStatsStart={mockOnStatsStart}
          onStatsComplete={mockOnStatsComplete}
          onStatsError={mockOnStatsError}
        />
      );

      expect(screen.getByRole('button')).toHaveTextContent('正在克隆...');

      // 状态变为 analyzing
      rerender(
        <StatsButton
          repo={mockRepo}
          status="analyzing"
          onStatsStart={mockOnStatsStart}
          onStatsComplete={mockOnStatsComplete}
          onStatsError={mockOnStatsError}
        />
      );

      expect(screen.getByRole('button')).toHaveTextContent('正在统计...');

      // 状态变为 completed
      rerender(
        <StatsButton
          repo={mockRepo}
          status="completed"
          onStatsStart={mockOnStatsStart}
          onStatsComplete={mockOnStatsComplete}
          onStatsError={mockOnStatsError}
        />
      );

      expect(screen.getByRole('button')).toHaveTextContent('重新统计');
    });

    it('should re-enable button after completion', async () => {
      const mockTriggerStats = vi.mocked(api.triggerStats);
      mockTriggerStats.mockResolvedValue({
        jobId: 'job-123',
        status: 'completed',
        result: { totalLines: 1000 }
      });

      render(
        <StatsButton
          repo={mockRepo}
          onStatsStart={mockOnStatsStart}
          onStatsComplete={mockOnStatsComplete}
          onStatsError={mockOnStatsError}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('错误处理', () => {
    it('should show error message on failure', async () => {
      const mockTriggerStats = vi.mocked(api.triggerStats);
      mockTriggerStats.mockRejectedValue(new Error('cloc 工具未安装'));

      render(
        <StatsButton
          repo={mockRepo}
          onStatsStart={mockOnStatsStart}
          onStatsComplete={mockOnStatsComplete}
          onStatsError={mockOnStatsError}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockOnStatsError).toHaveBeenCalledWith(
          mockRepo.id,
          'cloc 工具未安装'
        );
      });
    });

    it('should handle network error', async () => {
      const mockTriggerStats = vi.mocked(api.triggerStats);
      mockTriggerStats.mockRejectedValue(new Error('Network error'));

      render(
        <StatsButton
          repo={mockRepo}
          onStatsStart={mockOnStatsStart}
          onStatsComplete={mockOnStatsComplete}
          onStatsError={mockOnStatsError}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockOnStatsError).toHaveBeenCalled();
      });
    });

    it('should handle conflict error (already running)', async () => {
      const mockTriggerStats = vi.mocked(api.triggerStats);
      mockTriggerStats.mockRejectedValue(new Error('已有统计任务正在进行'));

      render(
        <StatsButton
          repo={mockRepo}
          onStatsStart={mockOnStatsStart}
          onStatsComplete={mockOnStatsComplete}
          onStatsError={mockOnStatsError}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockOnStatsError).toHaveBeenCalledWith(
          mockRepo.id,
          '已有统计任务正在进行'
        );
      });
    });

    it('should re-enable button after error', async () => {
      const mockTriggerStats = vi.mocked(api.triggerStats);
      mockTriggerStats.mockRejectedValue(new Error('Error'));

      render(
        <StatsButton
          repo={mockRepo}
          onStatsStart={mockOnStatsStart}
          onStatsComplete={mockOnStatsComplete}
          onStatsError={mockOnStatsError}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('成功完成', () => {
    it('should call onStatsComplete on success', async () => {
      const mockResult = {
        repoId: 1,
        totalLines: 7500,
        codeLines: 6000,
        commentLines: 1000,
        blankLines: 500
      };

      const mockTriggerStats = vi.mocked(api.triggerStats);
      mockTriggerStats.mockResolvedValue({
        jobId: 'job-123',
        status: 'completed',
        result: mockResult
      });

      render(
        <StatsButton
          repo={mockRepo}
          onStatsStart={mockOnStatsStart}
          onStatsComplete={mockOnStatsComplete}
          onStatsError={mockOnStatsError}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockOnStatsComplete).toHaveBeenCalledWith(mockRepo.id, mockResult);
      });
    });
  });

  describe('可访问性', () => {
    it('should have correct aria-label', () => {
      render(
        <StatsButton
          repo={mockRepo}
          onStatsStart={mockOnStatsStart}
          onStatsComplete={mockOnStatsComplete}
          onStatsError={mockOnStatsError}
        />
      );

      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        '统计代码行数'
      );
    });

    it('should have aria-busy when loading', async () => {
      const mockTriggerStats = vi.mocked(api.triggerStats);
      mockTriggerStats.mockImplementation(() =>
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <StatsButton
          repo={mockRepo}
          onStatsStart={mockOnStatsStart}
          onStatsComplete={mockOnStatsComplete}
          onStatsError={mockOnStatsError}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-busy', 'true');
      });
    });

    it('should be keyboard accessible', () => {
      render(
        <StatsButton
          repo={mockRepo}
          onStatsStart={mockOnStatsStart}
          onStatsComplete={mockOnStatsComplete}
          onStatsError={mockOnStatsError}
        />
      );

      const button = screen.getByRole('button');

      // 验证可以通过 Tab 聚焦
      button.focus();
      expect(button).toHaveFocus();

      // 验证可以通过 Enter 触发
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(mockTriggerStats).toHaveBeenCalled();
    });
  });

  describe('Tooltip测试', () => {
    it('should show tooltip on hover', async () => {
      render(
        <StatsButton
          repo={mockRepo}
          showTooltip={true}
          onStatsStart={mockOnStatsStart}
          onStatsComplete={mockOnStatsComplete}
          onStatsError={mockOnStatsError}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);

      await waitFor(() => {
        expect(screen.getByText('统计代码行数')).toBeDefined();
      });
    });

    it('should show error in tooltip when failed', async () => {
      const mockTriggerStats = vi.mocked(api.triggerStats);
      mockTriggerStats.mockRejectedValue(new Error('cloc 未安装'));

      render(
        <StatsButton
          repo={mockRepo}
          showTooltip={true}
          onStatsStart={mockOnStatsStart}
          onStatsComplete={mockOnStatsComplete}
          onStatsError={mockOnStatsError}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.mouseEnter(button);

      await waitFor(() => {
        expect(screen.getByText(/cloc 未安装/)).toBeDefined();
      });
    });
  });
});
