import React from 'react';
import { Space, Select, Button, Badge } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import { LANGUAGE_OPTIONS, STAR_RANGE_OPTIONS, UPDATE_RANGE_OPTIONS } from '../../constants';
import type { FilterState } from '../../types';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
}

/**
 * 筛选面板组件
 */
export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const activeFilterCount = [
    filters.language,
    filters.starRange,
    filters.updateRange,
  ].filter(Boolean).length;

  const handleLanguageChange = (value: FilterState['language']) => {
    onFilterChange({ ...filters, language: value });
  };

  const handleStarRangeChange = (value: FilterState['starRange']) => {
    onFilterChange({ ...filters, starRange: value });
  };

  const handleUpdateRangeChange = (value: FilterState['updateRange']) => {
    onFilterChange({ ...filters, updateRange: value });
  };

  return (
    <Space size="middle" wrap>
      <Select
        placeholder="编程语言"
        allowClear
        style={{ width: 120 }}
        value={filters.language}
        onChange={handleLanguageChange}
        options={LANGUAGE_OPTIONS}
      />
      <Select
        placeholder="Star数量"
        allowClear
        style={{ width: 140 }}
        value={filters.starRange}
        onChange={handleStarRangeChange}
        options={STAR_RANGE_OPTIONS}
      />
      <Select
        placeholder="更新时间"
        allowClear
        style={{ width: 120 }}
        value={filters.updateRange}
        onChange={handleUpdateRangeChange}
        options={UPDATE_RANGE_OPTIONS}
      />
      {activeFilterCount > 0 && (
        <Button
          icon={<ClearOutlined />}
          onClick={onReset}
        >
          重置
          <Badge
            count={activeFilterCount}
            size="small"
            style={{ marginLeft: 6 }}
          />
        </Button>
      )}
    </Space>
  );
};

export default FilterPanel;
