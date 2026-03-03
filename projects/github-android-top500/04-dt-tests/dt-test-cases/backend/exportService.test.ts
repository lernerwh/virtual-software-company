// 后端服务层测试 - 导出服务
// File: backend/src/services/exportService.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { ExportService } from '../exportService';
import type { Repository } from '../../models/types';
import ExcelJS from 'exceljs';

describe('ExportService', () => {
  let exportService: ExportService;

  beforeEach(() => {
    exportService = new ExportService();
  });

  describe('exportToExcel', () => {
    describe('正常场景', () => {
      it('should generate Excel buffer with repos', async () => {
        const repos = createMockRepos(10);

        const buffer = await exportService.exportToExcel(repos);

        expect(buffer).toBeInstanceOf(Buffer);
        expect(buffer.length).toBeGreaterThan(0);
      });

      it('should include all required columns', async () => {
        const repos = createMockRepos(5);

        const buffer = await exportService.exportToExcel(repos);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];

        const headerRow = worksheet.getRow(1);
        const headers = headerRow.values as string[];

        expect(headers).toContain('排名');
        expect(headers).toContain('项目名称');
        expect(headers).toContain('描述');
        expect(headers).toContain('Stars');
        expect(headers).toContain('Forks');
        expect(headers).toContain('语言');
        expect(headers).toContain('更新时间');
        expect(headers).toContain('GitHub地址');
      });

      it('should contain correct data rows', async () => {
        const repos = createMockRepos(3);

        const buffer = await exportService.exportToExcel(repos);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];

        // Row 1 is header, Row 2-4 are data
        expect(worksheet.rowCount).toBe(4);

        const dataRow = worksheet.getRow(2);
        expect(dataRow.getCell(1).value).toBe(repos[0].rank);
        expect(dataRow.getCell(2).value).toBe(repos[0].fullName);
      });

      it('should format numbers correctly', async () => {
        const repos = [createMockRepo({ stars: 12345, forks: 6789 })];

        const buffer = await exportService.exportToExcel(repos);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];

        const dataRow = worksheet.getRow(2);
        // Excel should store numbers as numbers
        expect(dataRow.getCell(4).value).toBe(12345);
        expect(dataRow.getCell(5).value).toBe(6789);
      });
    });

    describe('边界条件', () => {
      it('should handle empty repos array', async () => {
        const buffer = await exportService.exportToExcel([]);

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];

        // Should have only header row
        expect(worksheet.rowCount).toBe(1);
      });

      it('should handle repos with null fields', async () => {
        const repos = [createMockRepo({
          description: null,
          language: null,
          license: null
        })];

        const buffer = await exportService.exportToExcel(repos);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);

        // Should not throw
        expect(buffer).toBeInstanceOf(Buffer);
      });

      it('should handle large dataset (500 repos)', async () => {
        const repos = createMockRepos(500);

        const buffer = await exportService.exportToExcel(repos);

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];

        expect(worksheet.rowCount).toBe(501); // 1 header + 500 data
      });

      it('should handle special characters in description', async () => {
        const repos = [createMockRepo({
          description: 'Test <script>alert("xss")</script> & "quotes"'
        })];

        const buffer = await exportService.exportToExcel(repos);

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];

        const dataRow = worksheet.getRow(2);
        expect(dataRow.getCell(3).value).toBe('Test <script>alert("xss")</script> & "quotes"');
      });

      it('should handle Chinese characters', async () => {
        const repos = [createMockRepo({
          description: '这是一个中文描述测试'
        })];

        const buffer = await exportService.exportToExcel(repos);

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];

        const dataRow = worksheet.getRow(2);
        expect(dataRow.getCell(3).value).toBe('这是一个中文描述测试');
      });
    });

    describe('性能测试', () => {
      it('should export 500 repos in under 5 seconds', async () => {
        const repos = createMockRepos(500);

        const startTime = Date.now();
        await exportService.exportToExcel(repos);
        const endTime = Date.now();

        expect(endTime - startTime).toBeLessThan(5000);
      });
    });
  });

  describe('generateFileName', () => {
    it('should generate correct file name format', () => {
      const fileName = exportService.generateFileName();

      // Format: github-android-top500-YYYYMMDD-HHmmss.xlsx
      expect(fileName).toMatch(/^github-android-top500-\d{8}-\d{6}\.xlsx$/);
    });

    it('should generate unique file names for different times', async () => {
      const fileName1 = exportService.generateFileName();

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 1100));

      const fileName2 = exportService.generateFileName();

      expect(fileName1).not.toBe(fileName2);
    });
  });

  describe('exportWithFields', () => {
    it('should export only selected fields', async () => {
      const repos = createMockRepos(3);
      const fields = ['rank', 'fullName', 'stars'];

      const buffer = await exportService.exportToExcel(repos, { fields });
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      const headerRow = worksheet.getRow(1);
      const headers = headerRow.values as string[];

      expect(headers).toHaveLength(4); // includes Excel's 1-indexed empty first element
      expect(headers).toContain('排名');
      expect(headers).toContain('项目名称');
      expect(headers).toContain('Stars');
      expect(headers).not.toContain('Forks');
    });

    it('should handle invalid field names gracefully', async () => {
      const repos = createMockRepos(3);
      const fields = ['rank', 'invalidField', 'stars'];

      // Should not throw
      const buffer = await exportService.exportToExcel(repos, { fields });
      expect(buffer).toBeInstanceOf(Buffer);
    });
  });
});

// Helper functions
function createMockRepo(overrides?: Partial<Repository>): Repository {
  return {
    id: 1,
    rank: 1,
    name: 'test-repo',
    fullName: 'owner/test-repo',
    description: 'Test repository',
    url: 'https://api.github.com/repos/owner/test-repo',
    htmlUrl: 'https://github.com/owner/test-repo',
    stars: 1000,
    forks: 100,
    language: 'Java',
    license: 'MIT',
    ownerId: 1,
    ownerName: 'owner',
    ownerAvatar: 'https://avatar.url',
    ownerType: 'User',
    isFork: false,
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    pushedAt: '2024-01-15T00:00:00Z',
    openIssues: 10,
    watchers: 50,
    topics: ['android'],
    homepage: null,
    ...overrides
  };
}

function createMockRepos(count: number): Repository[] {
  return Array.from({ length: count }, (_, i) =>
    createMockRepo({
      id: i + 1,
      rank: i + 1,
      name: `repo-${i + 1}`,
      fullName: `owner/repo-${i + 1}`,
      stars: 10000 - i * 100,
      forks: 1000 - i * 10
    })
  );
}
