import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '-';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toLocaleString();
}

export function formatDate(date: string | null | undefined, format: string = 'YYYY-MM-DD'): string {
  if (!date) return '-';
  const d = dayjs(date);
  return d.isValid() ? d.format(format) : '-';
}

export function getTimeAgo(date: string | null | undefined): string {
  if (!date) return '-';
  const d = dayjs(date);
  if (!d.isValid()) return '-';
  return d.fromNow();
}

export function truncateText(text: string | null | undefined, maxLength: number = 50): string {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getLanguageColor(language: string | null): string {
  const colors: Record<string, string> = {
    Java: '#b07219',
    Kotlin: '#F18E33',
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Python: '#3572A5',
    Go: '#00ADD8',
    Rust: '#dea584',
    C: '#555555',
    'C++': '#f34b7d',
  };
  return colors[language || ''] || '#8e8e8e';
}
