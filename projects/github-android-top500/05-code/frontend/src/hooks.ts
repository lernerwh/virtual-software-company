import { useQuery } from '@tanstack/react-query';
import { fetchRepos, fetchStatus } from './api';
import type { RepoQuery } from './types';

export function useRepos(query: RepoQuery) {
  return useQuery({
    queryKey: ['repos', query],
    queryFn: () => fetchRepos(query),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useStatus() {
  return useQuery({
    queryKey: ['status'],
    queryFn: fetchStatus,
    staleTime: 30 * 1000,
    gcTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}
