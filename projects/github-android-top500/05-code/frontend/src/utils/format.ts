import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

/**
 * 格式化数字（添加千分位）
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '-';
  return num.toLocaleString('en-US');
}

/**
 * 格式化日期
 */
export function formatDate(date: string | null | undefined, format: string = 'YYYY-MM-DD'): string {
  if (!date) return '-';
  const d = dayjs(date);
  return d.isValid() ? d.format(format) : '-';
}

/**
 * 获取相对时间
 */
export function getTimeAgo(date: string | null | undefined): string {
  if (!date) return '-';
  const d = dayjs(date);
  if (!d.isValid()) return '-';
  return d.fromNow();
}

/**
 * 截断文本
 */
export function truncateText(text: string | null | undefined, maxLength: number = 50): string {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
