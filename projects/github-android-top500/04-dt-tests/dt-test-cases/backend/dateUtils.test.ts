// 后端工具函数测试 - 日期工具
// File: backend/src/utils/dateUtils.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  formatDate,
  parseDate,
  isWithinRange,
  getTimeAgo,
  isValidISODate
} from '../dateUtils';

describe('dateUtils', () => {
  beforeEach(() => {
    // 固定当前时间用于测试
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatDate', () => {
    describe('正常场景', () => {
      it('should format ISO date to display format', () => {
        const isoDate = '2024-01-15T10:30:00Z';
        expect(formatDate(isoDate, 'YYYY-MM-DD HH:mm')).toBe('2024-01-15 10:30');
      });

      it('should format date with different patterns', () => {
        const isoDate = '2024-01-15T10:30:00Z';
        expect(formatDate(isoDate, 'YYYY/MM/DD')).toBe('2024/01/15');
        expect(formatDate(isoDate, 'MM-DD')).toBe('01-15');
      });
    });

    describe('边界条件', () => {
      it('should handle empty string', () => {
        expect(formatDate('')).toBe('');
      });

      it('should handle null input', () => {
        expect(formatDate(null as any)).toBe('');
      });

      it('should handle undefined input', () => {
        expect(formatDate(undefined as any)).toBe('');
      });
    });

    describe('异常处理', () => {
      it('should return original string for invalid date', () => {
        expect(formatDate('invalid-date')).toBe('invalid-date');
      });
    });
  });

  describe('parseDate', () => {
    describe('正常场景', () => {
      it('should parse ISO date string', () => {
        const result = parseDate('2024-01-15T10:30:00Z');
        expect(result).toBeInstanceOf(Date);
        expect(result.toISOString()).toBe('2024-01-15T10:30:00.000Z');
      });
    });

    describe('边界条件', () => {
      it('should handle null input', () => {
        expect(parseDate(null)).toBeNull();
      });

      it('should handle empty string', () => {
        expect(parseDate('')).toBeNull();
      });
    });
  });

  describe('isWithinRange', () => {
    describe('正常场景', () => {
      it('should return true when date is within range', () => {
        const date = '2024-01-10T00:00:00Z'; // 5 days ago
        expect(isWithinRange(date, 7, 'days')).toBe(true);
      });

      it('should return false when date is outside range', () => {
        const date = '2024-01-01T00:00:00Z'; // 14 days ago
        expect(isWithinRange(date, 7, 'days')).toBe(false);
      });

      it('should handle month range', () => {
        const date = '2024-01-01T00:00:00Z'; // 14 days ago
        expect(isWithinRange(date, 1, 'month')).toBe(true);
      });

      it('should handle year range', () => {
        const date = '2023-06-15T00:00:00Z'; // ~6 months ago
        expect(isWithinRange(date, 1, 'year')).toBe(true);
      });
    });

    describe('边界条件', () => {
      it('should handle exactly on boundary', () => {
        const date = '2024-01-08T12:00:00Z'; // exactly 7 days ago
        expect(isWithinRange(date, 7, 'days')).toBe(true);
      });

      it('should handle null date', () => {
        expect(isWithinRange(null, 7, 'days')).toBe(false);
      });
    });
  });

  describe('getTimeAgo', () => {
    describe('正常场景', () => {
      it('should return "刚刚" for less than 1 minute', () => {
        const date = '2024-01-15T11:59:30Z'; // 30 seconds ago
        expect(getTimeAgo(date)).toBe('刚刚');
      });

      it('should return minutes ago', () => {
        const date = '2024-01-15T11:30:00Z'; // 30 minutes ago
        expect(getTimeAgo(date)).toBe('30分钟前');
      });

      it('should return hours ago', () => {
        const date = '2024-01-15T09:00:00Z'; // 3 hours ago
        expect(getTimeAgo(date)).toBe('3小时前');
      });

      it('should return days ago', () => {
        const date = '2024-01-12T12:00:00Z'; // 3 days ago
        expect(getTimeAgo(date)).toBe('3天前');
      });
    });

    describe('边界条件', () => {
      it('should handle future date', () => {
        const date = '2024-01-16T12:00:00Z'; // tomorrow
        expect(getTimeAgo(date)).toBe('刚刚');
      });

      it('should handle null date', () => {
        expect(getTimeAgo(null)).toBe('未知');
      });
    });
  });

  describe('isValidISODate', () => {
    describe('正常场景', () => {
      it('should return true for valid ISO date', () => {
        expect(isValidISODate('2024-01-15T10:30:00Z')).toBe(true);
        expect(isValidISODate('2024-01-15T10:30:00.000Z')).toBe(true);
      });

      it('should return false for invalid date', () => {
        expect(isValidISODate('2024-13-45T10:30:00Z')).toBe(false);
        expect(isValidISODate('not-a-date')).toBe(false);
      });
    });

    describe('边界条件', () => {
      it('should handle null input', () => {
        expect(isValidISODate(null)).toBe(false);
      });

      it('should handle empty string', () => {
        expect(isValidISODate('')).toBe(false);
      });
    });
  });
});
