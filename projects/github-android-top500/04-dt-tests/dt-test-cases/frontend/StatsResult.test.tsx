/**
 * 统计结果展示组件测试
 * 测试文件: StatsResult.test.tsx
 * 组件: StatsResult
 * 创建日期: 2026-03-05
 * 版本: v1.1.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatsResult } from '../../../05-code/frontend/src/components/StatsResult';

describe('StatsResult', () => {
  const mockStats = {
    repoId: 1,
    totalLines: 7500,
    codeLines: 6000,
    commentLines: 1000,
    blankLines: 500,
    languages: [
      { language: 'Java', files: 100, blank: 500, comment: 800, code: 5000 },
      { language: 'Kotlin', files: 50, blank: 200, comment: 200, code: 2000 },
      { language: 'XML', files: 30, blank: 100, comment: 50, code: 500 }
    ],
    statsAt: '2026-03-05T00:00:00Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('渲染测试', () => {
    it('should display total lines', () => {
      render(<StatsResult stats={mockStats} />);

      expect(screen.getByText('7,500')).toBeDefined();
      expect(screen.getByText('总代码行数')).toBeDefined();
    });

    it('should display code lines', () => {
      render(<StatsResult stats={mockStats} />);

      expect(screen.getByText('6,000')).toBeDefined();
      expect(screen.getByText('代码行数')).toBeDefined();
    });

    it('should display comment lines', () => {
      render(<StatsResult stats={mockStats} />);

      expect(screen.getByText('1,000')).toBeDefined();
      expect(screen.getByText('注释行数')).toBeDefined();
    });

    it('should display blank lines', () => {
      render(<StatsResult stats={mockStats} />);

      expect(screen.getByText('500')).toBeDefined();
      expect(screen.getByText('空白行数')).toBeDefined();
    });

    it('should display statistics timestamp', () => {
      render(<StatsResult stats={mockStats} />);

      expect(screen.getByText(/统计时间/)).toBeDefined();
    });

    it('should render with custom className', () => {
      const { container } = render(
        <StatsResult stats={mockStats} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('语言分布展示', () => {
    it('should display language breakdown', () => {
      render(<StatsResult stats={mockStats} />);

      expect(screen.getByText('Java')).toBeDefined();
      expect(screen.getByText('Kotlin')).toBeDefined();
      expect(screen.getByText('XML')).toBeDefined();
    });

    it('should display language file counts', () => {
      render(<StatsResult stats={mockStats} />);

      expect(screen.getByText('100 文件')).toBeDefined();
      expect(screen.getByText('50 文件')).toBeDefined();
      expect(screen.getByText('30 文件')).toBeDefined();
    });

    it('should display language code lines', () => {
      render(<StatsResult stats={mockStats} />);

      expect(screen.getByText('5,000 行')).toBeDefined();
      expect(screen.getByText('2,000 行')).toBeDefined();
      expect(screen.getByText('500 行')).toBeDefined();
    });

    it('should show percentage for each language', () => {
      render(<StatsResult stats={mockStats} />);

      // Java: 5000/7500 = 66.67%
      expect(screen.getByText('66.67%')).toBeDefined();
      // Kotlin: 2000/7500 = 26.67%
      expect(screen.getByText('26.67%')).toBeDefined();
      // XML: 500/7500 = 6.67%
      expect(screen.getByText('6.67%')).toBeDefined();
    });

    it('should display language bars with correct width', () => {
      render(<StatsResult stats={mockStats} />);

      const bars = screen.getAllByRole('progressbar');

      // Java bar: 66.67%
      expect(bars[0]).toHaveStyle({ width: '66.67%' });
      // Kotlin bar: 26.67%
      expect(bars[1]).toHaveStyle({ width: '26.67%' });
      // XML bar: 6.67%
      expect(bars[2]).toHaveStyle({ width: '6.67%' });
    });

    it('should sort languages by code lines', () => {
      const unsortedStats = {
        ...mockStats,
        languages: [
          { language: 'XML', files: 30, blank: 100, comment: 50, code: 500 },
          { language: 'Java', files: 100, blank: 500, comment: 800, code: 5000 },
          { language: 'Kotlin', files: 50, blank: 200, comment: 200, code: 2000 }
        ]
      };

      render(<StatsResult stats={unsortedStats} />);

      const languageElements = screen.getAllByText(/Java|Kotlin|XML/);

      // 应按代码行数降序排列
      expect(languageElements[0]).toHaveTextContent('Java');
      expect(languageElements[1]).toHaveTextContent('Kotlin');
      expect(languageElements[2]).toHaveTextContent('XML');
    });
  });

  describe('数字格式化', () => {
    it('should format numbers with thousand separators', () => {
      const largeStats = {
        ...mockStats,
        totalLines: 1234567,
        codeLines: 1000000
      };

      render(<StatsResult stats={largeStats} />);

      expect(screen.getByText('1,234,567')).toBeDefined();
      expect(screen.getByText('1,000,000')).toBeDefined();
    });

    it('should format small numbers correctly', () => {
      const smallStats = {
        ...mockStats,
        totalLines: 123,
        codeLines: 100
      };

      render(<StatsResult stats={smallStats} />);

      expect(screen.getByText('123')).toBeDefined();
      expect(screen.getByText('100')).toBeDefined();
    });

    it('should handle zero lines', () => {
      const zeroStats = {
        ...mockStats,
        totalLines: 0,
        codeLines: 0,
        commentLines: 0,
        blankLines: 0,
        languages: []
      };

      render(<StatsResult stats={zeroStats} />);

      expect(screen.getByText('0')).toBeDefined();
    });

    it('should format percentage correctly', () => {
      const stats = {
        ...mockStats,
        languages: [
          { language: 'Java', files: 1, blank: 0, comment: 0, code: 1 },
          { language: 'Kotlin', files: 1, blank: 0, comment: 0, code: 1 }
        ]
      };

      render(<StatsResult stats={stats} />);

      // 各占 50%
      expect(screen.getAllByText('50.00%')).toHaveLength(2);
    });
  });

  describe('详细视图展开', () => {
    it('should collapse details by default', () => {
      render(<StatsResult stats={mockStats} defaultExpanded={false} />);

      // 详细信息应该隐藏
      expect(screen.queryByText('文件数')).toBeNull();
    });

    it('should expand details on click', () => {
      render(<StatsResult stats={mockStats} defaultExpanded={false} />);

      const expandButton = screen.getByText('查看详情');
      fireEvent.click(expandButton);

      expect(screen.getByText('文件数')).toBeDefined();
    });

    it('should collapse details on second click', () => {
      render(<StatsResult stats={mockStats} defaultExpanded={false} />);

      const expandButton = screen.getByText('查看详情');

      // 展开
      fireEvent.click(expandButton);
      expect(screen.getByText('文件数')).toBeDefined();

      // 收起
      fireEvent.click(expandButton);
      expect(screen.queryByText('文件数')).toBeNull();
    });

    it('should show expand/collapse icon', () => {
      render(<StatsResult stats={mockStats} defaultExpanded={false} />);

      const expandButton = screen.getByText('查看详情');
      const icon = expandButton.querySelector('svg');

      expect(icon).toBeDefined();
      expect(icon).toHaveClass('chevron-down'); // 展开图标

      fireEvent.click(expandButton);
      expect(icon).toHaveClass('chevron-up'); // 收起图标
    });

    it('should default to expanded if specified', () => {
      render(<StatsResult stats={mockStats} defaultExpanded={true} />);

      expect(screen.getByText('文件数')).toBeDefined();
    });
  });

  describe('详细数据展示', () => {
    it('should display file count for each language', () => {
      render(<StatsResult stats={mockStats} defaultExpanded={true} />);

      expect(screen.getByText('100')).toBeDefined(); // Java files
      expect(screen.getByText('50')).toBeDefined(); // Kotlin files
      expect(screen.getByText('30')).toBeDefined(); // XML files
    });

    it('should display blank/comment/code lines for each language', () => {
      render(<StatsResult stats={mockStats} defaultExpanded={true} />);

      // Java
      expect(screen.getByText('500')).toBeDefined(); // blank
      expect(screen.getByText('800')).toBeDefined(); // comment
      expect(screen.getByText('5,000')).toBeDefined(); // code
    });

    it('should show detailed table headers', () => {
      render(<StatsResult stats={mockStats} defaultExpanded={true} />);

      expect(screen.getByText('语言')).toBeDefined();
      expect(screen.getByText('文件数')).toBeDefined();
      expect(screen.getByText('空白行')).toBeDefined();
      expect(screen.getByText('注释行')).toBeDefined();
      expect(screen.getByText('代码行')).toBeDefined();
      expect(screen.getByText('占比')).toBeDefined();
    });
  });

  describe('空状态处理', () => {
    it('should handle empty languages array', () => {
      const emptyStats = {
        ...mockStats,
        languages: []
      };

      render(<StatsResult stats={emptyStats} />);

      expect(screen.getByText('暂无统计数据')).toBeDefined();
    });

    it('should handle null stats', () => {
      render(<StatsResult stats={null} />);

      expect(screen.getByText('暂无统计数据')).toBeDefined();
    });
  });

  describe('自定义显示选项', () => {
    it('should hide total lines if specified', () => {
      render(<StatsResult stats={mockStats} showTotal={false} />);

      expect(screen.queryByText('总代码行数')).toBeNull();
    });

    it('should hide comment lines if specified', () => {
      render(<StatsResult stats={mockStats} showComments={false} />);

      expect(screen.queryByText('注释行数')).toBeNull();
    });

    it('should hide blank lines if specified', () => {
      render(<StatsResult stats={mockStats} showBlank={false} />);

      expect(screen.queryByText('空白行数')).toBeNull();
    });

    it('should limit number of languages displayed', () => {
      render(<StatsResult stats={mockStats} maxLanguages={2} />);

      expect(screen.getByText('Java')).toBeDefined();
      expect(screen.getByText('Kotlin')).toBeDefined();
      expect(screen.queryByText('XML')).toBeNull();
      expect(screen.getByText('其他 1 种语言')).toBeDefined();
    });
  });

  describe('图表展示', () => {
    it('should render pie chart if enabled', () => {
      render(<StatsResult stats={mockStats} showChart={true} />);

      expect(screen.getByRole('img', { name: '语言分布图' })).toBeDefined();
    });

    it('should not render chart if disabled', () => {
      render(<StatsResult stats={mockStats} showChart={false} />);

      expect(screen.queryByRole('img', { name: '语言分布图' })).toBeNull();
    });
  });

  describe('可访问性', () => {
    it('should have correct heading structure', () => {
      render(<StatsResult stats={mockStats} />);

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('代码统计结果');
    });

    it('should have accessible table', () => {
      render(<StatsResult stats={mockStats} defaultExpanded={true} />);

      const table = screen.getByRole('table');
      expect(table).toBeDefined();
      expect(table).toHaveAttribute('aria-label', '代码统计详情');
    });

    it('should have aria-label for language bars', () => {
      render(<StatsResult stats={mockStats} />);

      const bars = screen.getAllByRole('progressbar');
      bars.forEach((bar, index) => {
        const language = mockStats.languages[index].language;
        expect(bar).toHaveAttribute('aria-label', `${language}占比`);
      });
    });

    it('should be keyboard navigable', () => {
      render(<StatsResult stats={mockStats} defaultExpanded={false} />);

      const expandButton = screen.getByText('查看详情');

      // Tab 聚焦
      expandButton.focus();
      expect(expandButton).toHaveFocus();

      // Enter 展开
      fireEvent.keyDown(expandButton, { key: 'Enter' });
      expect(screen.getByText('文件数')).toBeDefined();
    });
  });

  describe('导出功能', () => {
    it('should show export button if enabled', () => {
      const onExport = vi.fn();

      render(<StatsResult stats={mockStats} showExport={true} onExport={onExport} />);

      expect(screen.getByText('导出报告')).toBeDefined();
    });

    it('should call onExport when export clicked', () => {
      const onExport = vi.fn();

      render(<StatsResult stats={mockStats} showExport={true} onExport={onExport} />);

      const exportButton = screen.getByText('导出报告');
      fireEvent.click(exportButton);

      expect(onExport).toHaveBeenCalledWith(mockStats);
    });
  });

  describe('刷新功能', () => {
    it('should show refresh button', () => {
      const onRefresh = vi.fn();

      render(<StatsResult stats={mockStats} showRefresh={true} onRefresh={onRefresh} />);

      expect(screen.getByText('刷新')).toBeDefined();
    });

    it('should call onRefresh when refresh clicked', () => {
      const onRefresh = vi.fn();

      render(<StatsResult stats={mockStats} showRefresh={true} onRefresh={onRefresh} />);

      const refreshButton = screen.getByText('刷新');
      fireEvent.click(refreshButton);

      expect(onRefresh).toHaveBeenCalled();
    });
  });

  describe('时间显示', () => {
    it('should format timestamp correctly', () => {
      render(<StatsResult stats={mockStats} />);

      // 根据实际时区可能需要调整
      expect(screen.getByText(/2026-03-05/)).toBeDefined();
    });

    it('should show relative time if enabled', () => {
      const recentStats = {
        ...mockStats,
        statsAt: new Date(Date.now() - 3600000).toISOString() // 1小时前
      };

      render(<StatsResult stats={recentStats} showRelativeTime={true} />);

      expect(screen.getByText(/1 小时前/)).toBeDefined();
    });

    it('should hide timestamp if specified', () => {
      render(<StatsResult stats={mockStats} showTimestamp={false} />);

      expect(screen.queryByText(/统计时间/)).toBeNull();
    });
  });
});
