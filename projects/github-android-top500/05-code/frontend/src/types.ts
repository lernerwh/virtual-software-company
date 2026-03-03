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
  ownerName: string;
  ownerAvatar?: string;
  createdAt: string;
  pushedAt: string;
  openIssues: number;
  watchers: number;
  topics: string[];
  homepage: string | null;
}

export interface Metadata {
  lastUpdateTime: string | null;
  updateStatus: 'idle' | 'updating' | 'success' | 'error';
  totalCount: number;
  errorMessage: string | null;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface RepoListResponse {
  data: Repository[];
  pagination: Pagination;
  metadata: Metadata;
}

export interface RepoQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  language?: string;
  starRange?: string;
  updateRange?: string;
  sortBy?: 'stars' | 'forks' | 'updatedAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface FilterState {
  language: string | null;
  starRange: string | null;
  updateRange: string | null;
}

export interface SortConfig {
  sortBy: 'stars' | 'forks' | 'updatedAt' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}
