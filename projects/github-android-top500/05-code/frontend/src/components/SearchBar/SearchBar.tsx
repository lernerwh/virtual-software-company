import React, { useState, useCallback } from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * 搜索栏组件
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = '搜索项目名称或描述...',
  value,
  onChange,
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <Input
      placeholder={placeholder}
      prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
      value={value}
      onChange={handleChange}
      allowClear
      style={{ width: 300 }}
    />
  );
};

export default SearchBar;
