import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

/**
 * 格式化日期
 */
export function formatDate(
  date: string | Date | null | undefined,
  format: string = 'YYYY-MM-DD HH:mm'
): string {
  if (!date) return '';
  const d = dayjs(date);
  if (!d.isValid()) return typeof date === 'string' ? date : '';
  return d.format(format);
}

/**
 * 解析日期字符串
 */
export function parseDate(date: string | null | undefined): Date | null {
  if (!date) return null;
  const d = dayjs(date);
  return d.isValid() ? d.toDate() : null;
}

/**
 * 判断日期是否在指定范围内
 */
export function isWithinRange(
  date: string | Date | null | undefined,
  value: number,
  unit: 'day' | 'week' | 'month' | 'year'
): boolean {
  if (!date) return false;
  const d = dayjs(date);
  if (!d.isValid()) return false;
  const now = dayjs();
  const diff = now.diff(d, unit as dayjs.OpUnitType);
  return diff <= value;
}

/**
 * 获取相对时间描述
 */
export function getTimeAgo(date: string | Date | null | undefined): string {
  if (!date) return '未知';
  const d = dayjs(date);
  if (!d.isValid()) return '未知';
  const now = dayjs();
  const diffSeconds = now.diff(d, 'second');

  if (diffSeconds < 60) return '刚刚';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}分钟前`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}小时前`;
  if (diffSeconds < 2592000) return `${Math.floor(diffSeconds / 86400)}天前`;
  if (diffSeconds < 31536000) return `${Math.floor(diffSeconds / 2592000)}个月前`;
  return `${Math.floor(diffSeconds / 31536000)}年前`;
}

/**
 * 检查是否为有效的ISO日期
 */
export function isValidISODate(date: string | null | undefined): boolean {
  if (!date) return false;
  const d = dayjs(date);
  return d.isValid();
}

/**
 * 检查缓存是否过期
 */
export function isCacheExpired(
  lastUpdateTime: string | null,
  durationHours: number
): boolean {
  if (!lastUpdateTime) return true;
  const lastUpdate = dayjs(lastUpdateTime);
  if (!lastUpdate.isValid()) return true;
  const expirationTime = lastUpdate.add(durationHours, 'hour');
  return dayjs().isAfter(expirationTime);
}
