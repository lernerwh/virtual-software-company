// 前端组件测试 - FilterPanel
// File: frontend/src/components/FilterPanel/FilterPanel.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FilterPanel } from './FilterPanel';
import type { FilterState } from '../../types';

describe('FilterPanel', () => {
  let mockOnFilterChange: ReturnType<typeof vi.fn>;
  let mockOnReset: ReturnType<typeof vi.fn>;

  const defaultFilters: FilterState = {
    language: null,
    starRange: null,
    updateRange: null
  };

  beforeEach(() => {
    mockOnFilterChange = vi.fn();
    mockOnReset = vi.fn();
  });

  describe('渲染测试', () => {
    it('should render filter panel with all options', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('编程语言')).toBeInTheDocument();
      expect(screen.getByText('Star数量')).toBeInTheDocument();
      expect(screen.getByText('更新时间')).toBeInTheDocument();
    });

    it('should render language options', async () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      // Click language dropdown
      const languageSelect = screen.getByRole('combobox', { name: /编程语言/i });
      fireEvent.mouseDown(languageSelect);

      await waitFor(() => {
        expect(screen.getByText('Java')).toBeInTheDocument();
        expect(screen.getByText('Kotlin')).toBeInTheDocument();
        expect(screen.getByText('其他')).toBeInTheDocument();
      });
    });

    it('should render star range options', async () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const starSelect = screen.getByRole('combobox', { name: /star数量/i });
      fireEvent.mouseDown(starSelect);

      await waitFor(() => {
        expect(screen.getByText('1,000 - 5,000')).toBeInTheDocument();
        expect(screen.getByText('5,000 - 10,000')).toBeInTheDocument();
        expect(screen.getByText('10,000+')).toBeInTheDocument();
      });
    });

    it('should render update range options', async () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const updateSelect = screen.getByRole('combobox', { name: /更新时间/i });
      fireEvent.mouseDown(updateSelect);

      await waitFor(() => {
        expect(screen.getByText('最近一周')).toBeInTheDocument();
        expect(screen.getByText('最近一月')).toBeInTheDocument();
        expect(screen.getByText('最近三月')).toBeInTheDocument();
        expect(screen.getByText('最近一年')).toBeInTheDocument();
      });
    });

    it('should display selected filter values', () => {
      const filters: FilterState = {
        language: 'Java',
        starRange: '10000+',
        updateRange: 'week'
      };

      render(
        <FilterPanel
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      // Ant Design Select should show selected value
      expect(screen.getByText('Java')).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('should call onFilterChange when language is selected', async () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const languageSelect = screen.getByRole('combobox', { name: /编程语言/i });
      fireEvent.mouseDown(languageSelect);

      await waitFor(() => {
        const javaOption = screen.getByText('Java');
        fireEvent.click(javaOption);
      });

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...defaultFilters,
        language: 'Java'
      });
    });

    it('should call onFilterChange when star range is selected', async () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const starSelect = screen.getByRole('combobox', { name: /star数量/i });
      fireEvent.mouseDown(starSelect);

      await waitFor(() => {
        const option = screen.getByText('10,000+');
        fireEvent.click(option);
      });

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...defaultFilters,
        starRange: '10000+'
      });
    });

    it('should call onFilterChange when update range is selected', async () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const updateSelect = screen.getByRole('combobox', { name: /更新时间/i });
      fireEvent.mouseDown(updateSelect);

      await waitFor(() => {
        const option = screen.getByText('最近一周');
        fireEvent.click(option);
      });

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...defaultFilters,
        updateRange: 'week'
      });
    });

    it('should call onReset when reset button is clicked', () => {
      const filters: FilterState = {
        language: 'Java',
        starRange: '10000+',
        updateRange: null
      };

      render(
        <FilterPanel
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const resetButton = screen.getByText(/重置/i);
      fireEvent.click(resetButton);

      expect(mockOnReset).toHaveBeenCalled();
    });

    it('should allow clearing a filter', async () => {
      const filters: FilterState = {
        language: 'Java',
        starRange: null,
        updateRange: null
      };

      render(
        <FilterPanel
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      // Find the clear icon and click it
      const clearIcons = screen.getAllByRole('img', { name: /close/i });
      if (clearIcons.length > 0) {
        fireEvent.click(clearIcons[0]);
        expect(mockOnFilterChange).toHaveBeenCalled();
      }
    });
  });

  describe('状态显示测试', () => {
    it('should show active filter count', () => {
      const filters: FilterState = {
        language: 'Java',
        starRange: '10000+',
        updateRange: 'week'
      };

      render(
        <FilterPanel
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      // Should show count badge or indicator
      expect(screen.getByText(/3/)).toBeInTheDocument();
    });

    it('should hide reset button when no filters applied', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const resetButton = screen.queryByText(/重置/i);
      expect(resetButton).not.toBeInTheDocument();
    });

    it('should show reset button when filters applied', () => {
      const filters: FilterState = {
        language: 'Java',
        starRange: null,
        updateRange: null
      };

      render(
        <FilterPanel
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText(/重置/i)).toBeInTheDocument();
    });
  });

  describe('边界条件测试', () => {
    it('should handle rapid filter changes', async () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
        />
      );

      const languageSelect = screen.getByRole('combobox', { name: /编程语言/i });

      // Rapid changes
      fireEvent.mouseDown(languageSelect);
      await waitFor(() => {
        fireEvent.click(screen.getByText('Java'));
      });

      fireEvent.mouseDown(languageSelect);
      await waitFor(() => {
        fireEvent.click(screen.getByText('Kotlin'));
      });

      expect(mockOnFilterChange).toHaveBeenCalledTimes(2);
    });
  });
});
