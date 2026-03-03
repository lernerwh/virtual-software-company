/**
 * Repository - GitHub项目实体
 */
export interface Repository {
  id: number;
  rank: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  htmlUrl: string;
  stars: number;
  forks: number;
  language: string | null;
  license: string | null;
  ownerId: number;
  ownerName: string;
  ownerAvatar: string;
  ownerType: 'User' | 'Organization';
  isFork: boolean;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  openIssues: number;
  watchers: number;
  topics: string[];
  homepage: string | null;
}

/**
 * Metadata - 系统元数据
 */
export interface Metadata {
  lastUpdateTime: string | null;
  updateStatus: 'idle' | 'updating' | 'success' | 'error';
  totalCount: number;
  errorMessage: string | null;
  nextScheduledTime: string | null;
}

/**
 * 分页信息
 */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * 项目列表响应
 */
export interface RepoListResponse {
  data: Repository[];
  pagination: Pagination;
  metadata: Metadata;
}

/**
 * 查询参数
 */
export interface RepoQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  language?: 'Java' | 'Kotlin' | 'Other' | null;
  starRange?: '0-1000' | '1000-5000' | '5000-10000' | '10000+' | null;
  updateRange?: 'week' | 'month' | 'quarter' | 'year' | null;
  sortBy?: 'stars' | 'forks' | 'updatedAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 导出选项
 */
export interface ExportOptions {
  fields?: string[];
  format?: 'xlsx' | 'csv';
}

/**
 * API错误响应
 */
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * 爬虫状态
 */
export interface FetchStatus {
  status: 'idle' | 'updating' | 'success' | 'error';
  lastFetchTime: string | null;
  error: string | null;
  fetchedCount: number;
}

/**
 * 调度器状态
 */
export interface ScheduleStatus {
  isRunning: boolean;
  nextRunTime: string | null;
  lastRunTime: string | null;
  lastRunStatus: 'success' | 'error' | null;
}
