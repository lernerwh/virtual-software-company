import axios from 'axios';
import type { RepoQuery, RepoListResponse, Repository, Metadata } from './types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

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

export async function fetchRepoById(id: number): Promise<{ data: Repository }> {
  const response = await api.get<{ data: Repository }>(`/repos/${id}`);
  return response.data;
}

export async function fetchStatus(): Promise<{ metadata: Metadata }> {
  const response = await api.get<{ metadata: Metadata }>('/status');
  return response.data;
}

export async function refreshData(): Promise<{ message: string; metadata: Metadata }> {
  const response = await api.post<{ message: string; metadata: Metadata }>('/refresh');
  return response.data;
}

export function getExportUrl(query: Omit<RepoQuery, 'page' | 'pageSize' | 'sortBy' | 'sortOrder'>): string {
  const params = new URLSearchParams();

  if (query.search) params.append('search', query.search);
  if (query.language) params.append('language', query.language);
  if (query.starRange) params.append('starRange', query.starRange);
  if (query.updateRange) params.append('updateRange', query.updateRange);

  return `${API_BASE_URL}/export?${params.toString()}`;
}

export default api;
