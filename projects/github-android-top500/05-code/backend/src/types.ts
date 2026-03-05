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
 * 数据存储结构
 */
export interface DataStore {
  repositories: Repository[];
  metadata: Metadata;
}

/**
 * 代码统计任务状态
 */
export type StatsJobStatus = 'pending' | 'cloning' | 'analyzing' | 'completed' | 'failed';

/**
 * 代码统计任务
 */
export interface StatsJob {
  id: string;
  repoId: number;
  status: StatsJobStatus;
  progress: number;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 单个语言统计
 */
export interface LanguageStats {
  language: string;
  files: number;
  blank: number;
  comment: number;
  code: number;
}

/**
 * 代码统计结果
 */
export interface CodeStats {
  repoId: number;
  totalLines: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  languages: LanguageStats[];
  statsAt: string;
}

/**
 * cloc 输出格式（JSON）
 */
export interface ClocOutput {
  [language: string]: {
    nFiles: number;
    blank: number;
    comment: number;
    code: number;
  };
}

/**
 * 整体统计进度
 */
export interface OverallProgress {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  failed: number;
}
