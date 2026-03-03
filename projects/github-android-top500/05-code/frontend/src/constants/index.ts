import type { FilterState } from '../types';

/**
 * 语言选项
 */
export const LANGUAGE_OPTIONS = [
  { value: 'Java', label: 'Java' },
  { value: 'Kotlin', label: 'Kotlin' },
  { value: 'Other', label: '其他' },
];

/**
 * Star数量范围选项
 */
export const STAR_RANGE_OPTIONS = [
  { value: '0-1000', label: '< 1,000' },
  { value: '1000-5000', label: '1,000 - 5,000' },
  { value: '5000-10000', label: '5,000 - 10,000' },
  { value: '10000+', label: '10,000+' },
];

/**
 * 更新时间范围选项
 */
export const UPDATE_RANGE_OPTIONS = [
  { value: 'week', label: '最近一周' },
  { value: 'month', label: '最近一月' },
  { value: 'quarter', label: '最近三月' },
  { value: 'year', label: '最近一年' },
];

/**
 * 默认筛选状态
 */
export const DEFAULT_FILTERS: FilterState = {
  language: null,
  starRange: null,
  updateRange: null,
};

/**
 * 表格列定义
 */
export const TABLE_COLUMNS = [
  { key: 'rank', title: '排名', width: 70 },
  { key: 'fullName', title: '项目名称', width: 200 },
  { key: 'description', title: '描述', width: 300 },
  { key: 'stars', title: 'Stars', width: 100, sortable: true },
  { key: 'forks', title: 'Forks', width: 90, sortable: true },
  { key: 'language', title: '语言', width: 90 },
  { key: 'pushedAt', title: '更新时间', width: 120, sortable: true },
];

/**
 * API基础URL
 */
export const API_BASE_URL = '/api';

/**
 * 分页大小选项
 */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

/**
 * 默认分页大小
 */
export const DEFAULT_PAGE_SIZE = 20;
