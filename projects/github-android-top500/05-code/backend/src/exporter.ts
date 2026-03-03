import ExcelJS from 'exceljs';
import dayjs from 'dayjs';
import type { Repository, ExportOptions } from './types.js';

export async function exportToExcel(repositories: Repository[], options?: ExportOptions): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('GitHub Android Top 500');

  const fields = options?.fields || [
    'rank', 'fullName', 'description', 'stars', 'forks',
    'language', 'license', 'ownerName', 'pushedAt', 'createdAt', 'htmlUrl'
  ];

  const headers: Record<string, string> = {
    rank: '排名',
    fullName: '项目名称',
    description: '描述',
    stars: 'Stars',
    forks: 'Forks',
    language: '语言',
    license: '协议',
    ownerName: '作者',
    pushedAt: '更新时间',
    createdAt: '创建时间',
    htmlUrl: 'GitHub地址',
    openIssues: 'Open Issues',
    watchers: 'Watchers',
    homepage: '主页',
  };

  const columns = fields.map(f => ({
    header: headers[f] || f,
    key: f,
    width: Math.max(12, (headers[f] || f).length + 2),
  }));

  worksheet.columns = columns;

  // 设置表头样式
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F46E5' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 25;

  // 添加数据
  for (const repo of repositories) {
    const row: Record<string, any> = {};
    for (const field of fields) {
      let value = (repo as any)[field];
      if (field === 'pushedAt' || field === 'createdAt') {
        value = value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '';
      }
      row[field] = value ?? '';
    }
    worksheet.addRow(row);
  }

  // 设置数字格式
  if (fields.includes('stars')) {
    worksheet.getColumn('stars').numFmt = '#,##0';
  }
  if (fields.includes('forks')) {
    worksheet.getColumn('forks').numFmt = '#,##0';
  }

  // 添加边框
  for (let i = 1; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i);
    for (let j = 1; j <= fields.length; j++) {
      const cell = row.getCell(j);
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
      };
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export function generateFilename(): string {
  return `github-android-top500-${dayjs().format('YYYYMMDD-HHmmss')}.xlsx`;
}
