import { useQuery } from '@tanstack/react-query';
import { fetchStatus } from '../services/api';

/**
 * 获取系统状态的Hook
 */
export function useStatus() {
  return useQuery({
    queryKey: ['status'],
    queryFn: fetchStatus,
    staleTime: 30 * 1000, // 30秒
    gcTime: 60 * 1000, // 1分钟
    refetchInterval: 60 * 1000, // 每分钟刷新一次
  });
}

export default useStatus;
