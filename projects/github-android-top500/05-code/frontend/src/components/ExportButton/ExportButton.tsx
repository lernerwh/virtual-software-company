import React from 'react';
import { Button, Tooltip, message } from 'antd';
import { DownloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import { getExportUrl } from '../../services/api';
import type { FilterState } from '../../types';

interface ExportButtonProps {
  filters: FilterState;
  search?: string;
  disabled?: boolean;
}

/**
 * 导出按钮组件
 */
export const ExportButton: React.FC<ExportButtonProps> = ({
  filters,
  search,
  disabled,
}) => {
  const handleExport = () => {
    const url = getExportUrl({
      search,
      ...filters,
    });

    // 创建隐藏的下载链接
    const link = document.createElement('a');
    link.href = url;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    message.success('正在导出Excel文件...');
  };

  return (
    <Tooltip title="导出当前筛选结果到Excel">
      <Button
        type="primary"
        icon={<FileExcelOutlined />}
        onClick={handleExport}
        disabled={disabled}
      >
        导出Excel
      </Button>
    </Tooltip>
  );
};

export default ExportButton;
