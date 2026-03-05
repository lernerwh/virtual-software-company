/**
 * 统计按钮组件
 * 文件: StatsButton.tsx
 * 版本: v1.1.0
 */

import React, { useState } from 'react';
import { Button, message } from 'antd';
import { BarChartOutlined, LoadingOutlined } from '@ant-design/icons';
import { triggerStats } from '../api/stats';

interface StatsButtonProps {
  repoId: number;
  onStatsStart?: (repoId: number) => void;
  onStatsComplete?: (repoId: number, result: any) => void;
  onStatsError?: (repoId: number, error: string) => void;
  disabled?: boolean;
}

export const StatsButton: React.FC<StatsButtonProps> = ({
  repoId,
  onStatsStart,
  onStatsComplete,
  onStatsError,
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('idle');

  const handleClick = async () => {
    setLoading(true);
    setStatus('pending');

    if (onStatsStart) {
      onStatsStart(repoId);
    }

    try {
      const result = await triggerStats(repoId);
      message.success('统计任务已创建');

      // 轮询状态（简化版本，实际应使用WebSocket或定期轮询）
      const pollInterval = setInterval(async () => {
        try {
          const statusResult = await fetch(`/api/repos/${repoId}/stats`).then(r => r.json());

          if (statusResult.status === 'completed') {
            clearInterval(pollInterval);
            setLoading(false);
            setStatus('completed');
            message.success('统计完成');

            if (onStatsComplete) {
              onStatsComplete(repoId, statusResult.result);
            }
          } else if (statusResult.status === 'failed') {
            clearInterval(pollInterval);
            setLoading(false);
            setStatus('failed');
            message.error(`统计失败: ${statusResult.error || '未知错误'}`);

            if (onStatsError) {
              onStatsError(repoId, statusResult.error || '未知错误');
            }
          } else {
            setStatus(statusResult.status);
          }
        } catch (error) {
          clearInterval(pollInterval);
          setLoading(false);
          setStatus('failed');
          message.error('获取统计状态失败');
        }
      }, 2000);

      // 超时保护（5分钟）
      setTimeout(() => {
        clearInterval(pollInterval);
        if (loading) {
          setLoading(false);
          setStatus('failed');
          message.warning('统计超时，请稍后查看结果');
        }
      }, 5 * 60 * 1000);

    } catch (error: any) {
      setLoading(false);
      setStatus('failed');

      const errorMsg = error.response?.data?.message || error.message || '触发统计失败';
      message.error(errorMsg);

      if (onStatsError) {
        onStatsError(repoId, errorMsg);
      }
    }
  };

  const getButtonText = () => {
    if (status === 'cloning') return '正在克隆...';
    if (status === 'analyzing') return '正在统计...';
    if (status === 'completed') return '重新统计';
    return '统计代码';
  };

  return (
    <Button
      type="default"
      size="small"
      icon={loading ? <LoadingOutlined /> : <BarChartOutlined />}
      onClick={handleClick}
      disabled={disabled || loading}
      loading={loading}
      aria-label="统计代码行数"
    >
      {getButtonText()}
    </Button>
  );
};

export default StatsButton;
