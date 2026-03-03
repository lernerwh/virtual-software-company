import React from 'react';
import { Tag, Tooltip, Space, Spin } from 'antd';
import { SyncOutlined, CheckCircleOutlined, ExclamationCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useStatus } from '../../hooks/useStatus';
import { formatDate } from '../../utils/format';

/**
 * 状态栏组件 - 显示数据更新状态
 */
export const StatusBar: React.FC = () => {
  const { data, isLoading } = useStatus();

  if (isLoading || !data) {
    return <Spin size="small" />;
  }

  const { metadata } = data;

  const getStatusTag = () => {
    switch (metadata.updateStatus) {
      case 'updating':
        return (
          <Tag icon={<SyncOutlined spin />} color="processing">
            数据更新中...
          </Tag>
        );
      case 'success':
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            数据正常
          </Tag>
        );
      case 'error':
        return (
          <Tooltip title={metadata.errorMessage}>
            <Tag icon={<ExclamationCircleOutlined />} color="error">
              更新失败
            </Tag>
          </Tooltip>
        );
      default:
        return (
          <Tag icon={<ClockCircleOutlined />} color="default">
            等待更新
          </Tag>
        );
    }
  };

  return (
    <Space size="middle">
      {getStatusTag()}
      {metadata.lastUpdateTime && (
        <span style={{ color: '#666', fontSize: '13px' }}>
          上次更新: {formatDate(metadata.lastUpdateTime, 'YYYY-MM-DD HH:mm')}
        </span>
      )}
      <span style={{ color: '#666', fontSize: '13px' }}>
        共 {metadata.totalCount} 个项目
      </span>
    </Space>
  );
};

export default StatusBar;
