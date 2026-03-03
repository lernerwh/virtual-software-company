import ExcelJS from 'exceljs';
import dayjs from 'dayjs';
import type { Repository, ExportOptions } from '../models/types';

export class ExportService {
  // 默认导出字段
  private defaultFields = [
    { key: 'rank', header: '排名', width: 8 },
    { key: 'fullName', header: '项目名称', width: 30 },
    { key: 'description', header: '描述', width: 50 },
    { key: 'stars', header: 'Stars', width: 12 },
    { key: 'forks', header: 'Forks', width: 10 },
    { key: 'language', header: '语言', width: 10 },
    { key: 'license', header: '协议', width: 12 },
    { key: 'ownerName', header: '作者', width: 15 },
    { key: 'pushedAt', header: '更新时间', width: 18 },
    { key: 'createdAt', header: '创建时间', width: 18 },
    { key: 'htmlUrl', header: 'GitHub地址', width: 40 },
    { key: 'homepage', header: '主页', width: 30 },
  ];

  /**
   * 导出为Excel
   */
  async exportToExcel(repos: Repository[], options?: ExportOptions): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('GitHub Android Top 500');

    // 确定导出字段
    const fields = this.getExportFields(options?.fields);

    // 设置表头
    worksheet.columns = fields.map((f) => ({
      header: f.header,
      key: f.key,
      width: f.width,
    }));

    // 设置表头样式
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // 添加数据
    for (const repo of repos) {
      const rowData: Record<string, unknown> = {};
      for (const field of fields) {
        rowData[field.key] = this.formatFieldValue(repo[field.key as keyof Repository], field.key);
      }
      worksheet.addRow(rowData);
    }

    // 设置数字格式
    worksheet.getColumn('stars').numFmt = '#,##0';
    worksheet.getColumn('forks').numFmt = '#,##0';

    // 生成Buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * 生成文件名
   */
  generateFileName(): string {
    const timestamp = dayjs().format('YYYYMMDD-HHmmss');
    return `github-android-top500-${timestamp}.xlsx`;
  }

  /**
   * 获取导出字段配置
   */
  private getExportFields(selectedFields?: string[]): Array<{ key: string; header: string; width: number }> {
    if (!selectedFields || selectedFields.length === 0) {
      return this.defaultFields;
    }

    return this.defaultFields.filter((f) => selectedFields.includes(f.key));
  }

  /**
   * 格式化字段值
   */
  private formatFieldValue(value: unknown, key: string): unknown {
    if (value === null || value === undefined) {
      return '';
    }

    // 日期字段格式化
    if (key === 'pushedAt' || key === 'createdAt') {
      return dayjs(value as string).format('YYYY-MM-DD HH:mm');
    }

    return value;
  }
}

export default ExportService;
