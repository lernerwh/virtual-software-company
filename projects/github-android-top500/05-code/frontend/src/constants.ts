import type { FilterState } from './types';

export const LANGUAGE_OPTIONS = [
  { value: 'Java', label: 'Java' },
  { value: 'Kotlin', label: 'Kotlin' },
  { value: 'Other', label: '其他' },
];

export const STAR_RANGE_OPTIONS = [
  { value: '0-1000', label: '< 1,000' },
  { value: '1000-5000', label: '1,000 - 5,000' },
  { value: '5000-10000', label: '5,000 - 10,000' },
  { value: '10000+', label: '10,000+' },
];

export const UPDATE_RANGE_OPTIONS = [
  { value: 'week', label: '最近一周' },
  { value: 'month', label: '最近一月' },
  { value: 'quarter', label: '最近三月' },
  { value: 'year', label: '最近一年' },
];

export const DEFAULT_FILTERS: FilterState = {
  language: null,
  starRange: null,
  updateRange: null,
};

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const SORT_OPTIONS = [
  { value: 'stars', label: 'Star 数量' },
  { value: 'forks', label: 'Fork 数量' },
  { value: 'updatedAt', label: '更新时间' },
  { value: 'createdAt', label: '创建时间' },
];
