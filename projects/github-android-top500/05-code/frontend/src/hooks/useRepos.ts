import { useQuery } from '@tanstack/react-query';
import { fetchRepos } from '../services/api';
import type { RepoQuery } from '../types';

/**
 * 获取项目列表的Hook
 */
export function useRepos(query: RepoQuery) {
  return useQuery({
    queryKey: ['repos', query],
    queryFn: () => fetchRepos(query),
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 10 * 60 * 1000, // 10分钟
  });
}

export default useRepos;
