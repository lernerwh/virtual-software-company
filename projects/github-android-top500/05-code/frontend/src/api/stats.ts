/**
 * 代码统计API客户端
 * 文件: stats.ts
 * 版本: v1.1.0
 */

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export interface StatsJob {
  jobId: string;
  status: 'pending' | 'cloning' | 'analyzing' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

export interface CodeStats {
  repoId: number;
  totalLines: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  languages: LanguageStats[];
  statsAt: string;
}

export interface LanguageStats {
  language: string;
  files: number;
  blank: number;
  comment: number;
  code: number;
}

export interface OverallProgress {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  failed: number;
}

/**
 * 触发代码统计
 */
export async function triggerStats(repoId: number): Promise<StatsJob> {
  const response = await axios.post(`${API_BASE}/api/repos/${repoId}/stats`);
  return response.data;
}

/**
 * 获取统计状态
 */
export async function getStatsStatus(repoId: number): Promise<{
  jobId?: string;
  status: string;
  progress: number;
  error?: string;
  result?: CodeStats;
}> {
  const response = await axios.get(`${API_BASE}/api/repos/${repoId}/stats`);
  return response.data;
}

/**
 * 获取整体统计进度
 */
export async function getOverallProgress(): Promise<OverallProgress> {
  const response = await axios.get(`${API_BASE}/api/stats/progress`);
  return response.data;
}
