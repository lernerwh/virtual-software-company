import axios from 'axios';
import type { RepoQuery, RepoListResponse, Repository, Metadata } from '../types';
import { API_BASE_URL } from '../constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 获取项目列表
 */
export async function fetchRepos(query: RepoQuery): Promise<RepoListResponse> {
  const params = new URLSearchParams();

  if (query.page) params.append('page', String(query.page));
  if (query.pageSize) params.append('pageSize', String(query.pageSize));
  if (query.search) params.append('search', query.search);
  if (query.language) params.append('language', query.language);
  if (query.starRange) params.append('starRange', query.starRange);
  if (query.updateRange) params.append('updateRange', query.updateRange);
  if (query.sortBy) params.append('sortBy', query.sortBy);
  if (query.sortOrder) params.append('sortOrder', query.sortOrder);

  const response = await api.get<RepoListResponse>(`/repos?${params.toString()}`);
  return response.data;
}

/**
 * 获取单个项目
 */
export async function fetchRepoById(id: number): Promise<Repository> {
  const response = await api.get<{ data: Repository }>(`/repos/${id}`);
  return response.data.data;
}

/**
 * 获取系统状态
 */
export async function fetchStatus(): Promise<{ metadata: Metadata }> {
  const response = await api.get<{ metadata: Metadata }>('/status');
  return response.data;
}

/**
 * 触发数据刷新
 */
export async function refreshData(): Promise<{ message: string; metadata: Metadata }> {
  const response = await api.post<{ message: string; metadata: Metadata }>('/refresh');
  return response.data;
}

/**
 * 导出Excel
 */
export function getExportUrl(query: Omit<RepoQuery, 'page' | 'pageSize' | 'sortBy' | 'sortOrder'>): string {
  const params = new URLSearchParams();

  if (query.search) params.append('search', query.search);
  if (query.language) params.append('language', query.language);
  if (query.starRange) params.append('starRange', query.starRange);
  if (query.updateRange) params.append('updateRange', query.updateRange);

  return `${API_BASE_URL}/repos/export?${params.toString()}`;
}

export default api;
