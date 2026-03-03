import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Repository, Metadata, DataStore, RepoQuery, Pagination } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'data.json');

// 确保数据目录存在
function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 初始化空数据
function getEmptyData(): DataStore {
  return {
    repositories: [],
    metadata: {
      lastUpdateTime: null,
      updateStatus: 'idle',
      totalCount: 0,
      errorMessage: null,
      nextScheduledTime: null,
    },
  };
}

// 读取数据
export function readData(): DataStore {
  ensureDataDir();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error reading data file:', error);
  }
  return getEmptyData();
}

// 写入数据
export function writeData(data: DataStore): void {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// 更新元数据
export function updateMetadata(metadata: Partial<Metadata>): Metadata {
  const data = readData();
  data.metadata = { ...data.metadata, ...metadata };
  writeData(data);
  return data.metadata;
}

// 保存仓库列表
export function saveRepositories(repositories: Repository[]): void {
  const data = readData();
  data.repositories = repositories;
  data.metadata.totalCount = repositories.length;
  data.metadata.lastUpdateTime = new Date().toISOString();
  data.metadata.updateStatus = 'success';
  data.metadata.errorMessage = null;
  writeData(data);
}

// 获取仓库列表（带查询）
export function getRepositories(query: RepoQuery): { data: Repository[]; pagination: Pagination; metadata: Metadata } {
  const store = readData();
  let repos = [...store.repositories];

  const {
    page = 1,
    pageSize = 20,
    search,
    language,
    starRange,
    updateRange,
    sortBy = 'stars',
    sortOrder = 'desc',
  } = query;

  // 搜索
  if (search) {
    const searchLower = search.toLowerCase();
    repos = repos.filter(r =>
      r.name.toLowerCase().includes(searchLower) ||
      (r.description && r.description.toLowerCase().includes(searchLower)) ||
      r.fullName.toLowerCase().includes(searchLower)
    );
  }

  // 语言筛选
  if (language) {
    if (language === 'Other') {
      repos = repos.filter(r => r.language !== 'Java' && r.language !== 'Kotlin');
    } else {
      repos = repos.filter(r => r.language === language);
    }
  }

  // Star范围筛选
  if (starRange) {
    const ranges: Record<string, [number, number | null]> = {
      '0-1000': [0, 1000],
      '1000-5000': [1000, 5000],
      '5000-10000': [5000, 10000],
      '10000+': [10000, null],
    };
    const [min, max] = ranges[starRange] || [0, null];
    repos = repos.filter(r => r.stars >= min && (max === null || r.stars < max));
  }

  // 更新时间筛选
  if (updateRange) {
    const days: Record<string, number> = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365,
    };
    const daysAgo = days[updateRange] || 365;
    const cutoff = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    repos = repos.filter(r => new Date(r.pushedAt) >= cutoff);
  }

  // 排序
  repos.sort((a, b) => {
    let aVal: number = 0;
    let bVal: number = 0;

    switch (sortBy) {
      case 'stars':
        aVal = a.stars;
        bVal = b.stars;
        break;
      case 'forks':
        aVal = a.forks;
        bVal = b.forks;
        break;
      case 'updatedAt':
        aVal = new Date(a.pushedAt).getTime();
        bVal = new Date(b.pushedAt).getTime();
        break;
      case 'createdAt':
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
        break;
    }

    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  // 分页
  const total = repos.length;
  const totalPages = Math.ceil(total / pageSize);
  const validPage = Math.min(Math.max(1, page), totalPages || 1);
  const start = (validPage - 1) * pageSize;
  const pagedRepos = repos.slice(start, start + pageSize);

  return {
    data: pagedRepos,
    pagination: {
      page: validPage,
      pageSize,
      total,
      totalPages,
    },
    metadata: store.metadata,
  };
}

// 根据ID获取仓库
export function getRepoById(id: number): Repository | null {
  const store = readData();
  return store.repositories.find(r => r.id === id) || null;
}

// 获取元数据
export function getMetadata(): Metadata {
  return readData().metadata;
}

// 获取所有仓库（用于导出）
export function getAllRepositories(query: Omit<RepoQuery, 'page' | 'pageSize' | 'sortBy' | 'sortOrder'>): Repository[] {
  const result = getRepositories({ ...query, page: 1, pageSize: 10000 });
  return result.data;
}
