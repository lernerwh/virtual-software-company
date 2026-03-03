// 前端组件测试 - RepoTable
// File: frontend/src/components/RepoTable/RepoTable.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RepoTable } from './RepoTable';
import type { Repository, RepoListResponse } from '../../types';

// Mock data
const createMockRepo = (overrides?: Partial<Repository>): Repository => ({
  id: 1,
  rank: 1,
  name: 'test-repo',
  fullName: 'owner/test-repo',
  description: 'Test repository description',
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
});

const createMockRepos = (count: number): Repository[] =>
  Array.from({ length: count }, (_, i) => createMockRepo({
    id: i + 1,
    rank: i + 1,
    name: `repo-${i + 1}`,
    fullName: `owner/repo-${i + 1}`,
    stars: 10000 - i * 100
  }));

const createMockResponse = (repos: Repository[], page = 1, pageSize = 20): RepoListResponse => ({
  data: repos,
  pagination: {
    page,
    pageSize,
    total: repos.length,
    totalPages: Math.ceil(repos.length / pageSize)
  },
  metadata: {
    lastUpdateTime: '2024-01-15T12:00:00Z',
    updateStatus: 'success',
    totalCount: repos.length,
    errorMessage: null,
    nextScheduledTime: null
  }
});

// Wrapper for tests
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('RepoTable', () => {
  let mockOnSort: ReturnType<typeof vi.fn>;
  let mockOnPageChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSort = vi.fn();
    mockOnPageChange = vi.fn();
  });

  describe('渲染测试', () => {
    it('should render table with data', () => {
      const repos = createMockRepos(5);
      const response = createMockResponse(repos);

      render(
        <RepoTable
          data={response}
          isLoading={false}
          onSort={mockOnSort}
          onPageChange={mockOnPageChange}
          sortConfig={{ sortBy: 'stars', sortOrder: 'desc' }}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('owner/repo-1')).toBeInTheDocument();
    });

    it('should render all required columns', () => {
      const repos = [createMockRepo()];
      const response = createMockResponse(repos);

      render(
        <RepoTable
          data={response}
          isLoading={false}
          onSort={mockOnSort}
          onPageChange={mockOnPageChange}
          sortConfig={{ sortBy: 'stars', sortOrder: 'desc' }}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('排名')).toBeInTheDocument();
      expect(screen.getByText('项目名称')).toBeInTheDocument();
      expect(screen.getByText('描述')).toBeInTheDocument();
      expect(screen.getByText('Stars')).toBeInTheDocument();
      expect(screen.getByText('Forks')).toBeInTheDocument();
      expect(screen.getByText('语言')).toBeInTheDocument();
      expect(screen.getByText('更新时间')).toBeInTheDocument();
    });

    it('should render loading state', () => {
      render(
        <RepoTable
          data={null}
          isLoading={true}
          onSort={mockOnSort}
          onPageChange={mockOnPageChange}
          sortConfig={{ sortBy: 'stars', sortOrder: 'desc' }}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('table')).toBeInTheDocument();
      // Ant Design Table should show loading indicator
    });

    it('should render empty state', () => {
      const response = createMockResponse([]);

      render(
        <RepoTable
          data={response}
          isLoading={false}
          onSort={mockOnSort}
          onPageChange={mockOnPageChange}
          sortConfig={{ sortBy: 'stars', sortOrder: 'desc' }}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText(/暂无数据/)).toBeInTheDocument();
    });
  });

  describe('数据展示测试', () => {
    it('should display formatted star count', () => {
      const repos = [createMockRepo({ stars: 12345 })];
      const response = createMockResponse(repos);

      render(
        <RepoTable
          data={response}
          isLoading={false}
          onSort={mockOnSort}
          onPageChange={mockOnPageChange}
          sortConfig={{ sortBy: 'stars', sortOrder: 'desc' }}
        />,
        { wrapper: createWrapper() }
      );

      // Should display as "12,345"
      expect(screen.getByText(/12,345/)).toBeInTheDocument();
    });

    it('should display rank correctly', () => {
      const repos = [createMockRepo({ rank: 1 }), createMockRepo({ id: 2, rank: 2 })];
      const response = createMockResponse(repos);

      render(
        <RepoTable
          data={response}
          isLoading={false}
          onSort={mockOnSort}
          onPageChange={mockOnPageChange}
          sortConfig={{ sortBy: 'stars', sortOrder: 'desc' }}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should display language badge', () => {
      const repos = [createMockRepo({ language: 'Kotlin' })];
      const response = createMockResponse(repos);

      render(
        <RepoTable
          data={response}
          isLoading={false}
          onSort={mockOnSort}
          onPageChange={mockOnPageChange}
          sortConfig={{ sortBy: 'stars', sortOrder: 'desc' }}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Kotlin')).toBeInTheDocument();
    });

    it('should handle null language', () => {
      const repos = [createMockRepo({ language: null })];
      const response = createMockResponse(repos);

      render(
        <RepoTable
          data={response}
          isLoading={false}
          onSort={mockOnSort}
          onPageChange={mockOnPageChange}
          sortConfig={{ sortBy: 'stars', sortOrder: 'desc' }}
        />,
        { wrapper: createWrapper() }
      );

      // Should render without crashing
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('should call onSort when clicking column header', async () => {
      const repos = createMockRepos(3);
      const response = createMockResponse(repos);

      render(
        <RepoTable
          data={response}
          isLoading={false}
          onSort={mockOnSort}
          onPageChange={mockOnPageChange}
          sortConfig={{ sortBy: 'stars', sortOrder: 'desc' }}
        />,
        { wrapper: createWrapper() }
      );

      const starsHeader = screen.getByText('Stars');
      fireEvent.click(starsHeader);

      expect(mockOnSort).toHaveBeenCalledWith('stars', 'asc');
    });

    it('should toggle sort order', async () => {
      const repos = createMockRepos(3);
      const response = createMockResponse(repos);

      const { rerender } = render(
        <RepoTable
          data={response}
          isLoading={false}
          onSort={mockOnSort}
          onPageChange={mockOnPageChange}
          sortConfig={{ sortBy: 'stars', sortOrder: 'desc' }}
        />,
        { wrapper: createWrapper() }
      );

      const starsHeader = screen.getByText('Stars');
      fireEvent.click(starsHeader);

      expect(mockOnSort).toHaveBeenCalledWith('stars', 'asc');

      // Simulate parent updating sortConfig
      rerender(
        <RepoTable
          data={response}
          isLoading={false}
          onSort={mockOnSort}
          onPageChange={mockOnPageChange}
          sortConfig={{ sortBy: 'stars', sortOrder: 'asc' }}
        />
      );

      fireEvent.click(starsHeader);
      expect(mockOnSort).toHaveBeenCalledWith('stars', 'desc');
    });

    it('should call onPageChange when clicking pagination', async () => {
      const repos = createMockRepos(50);
      const response = createMockResponse(repos.slice(0, 20), 1, 20);
      response.pagination.total = 50;
      response.pagination.totalPages = 3;

      render(
        <RepoTable
          data={response}
          isLoading={false}
          onSort={mockOnSort}
          onPageChange={mockOnPageChange}
          sortConfig={{ sortBy: 'stars', sortOrder: 'desc' }}
        />,
        { wrapper: createWrapper() }
      );

      // Find and click next page button
      const nextButton = screen.getByTitle('下一页');
      fireEvent.click(nextButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(2, 20);
    });

    it('should open GitHub in new tab when clicking repo name', () => {
      const repos = [createMockRepo()];
      const response = createMockResponse(repos);

      // Mock window.open
      const mockOpen = vi.fn();
      window.open = mockOpen;

      render(
        <RepoTable
          data={response}
          isLoading={false}
          onSort={mockOnSort}
          onPageChange={mockOnPageChange}
          sortConfig={{ sortBy: 'stars', sortOrder: 'desc' }}
        />,
        { wrapper: createWrapper() }
      );

      const repoLink = screen.getByText('owner/test-repo');
      fireEvent.click(repoLink);

      // Should be a link that opens in new tab
      expect(repoLink.closest('a')).toHaveAttribute('target', '_blank');
    });
  });

  describe('分页测试', () => {
    it('should show pagination when data exceeds page size', () => {
      const repos = createMockRepos(50);
      const response = createMockResponse(repos.slice(0, 20), 1, 20);
      response.pagination.total = 50;
      response.pagination.totalPages = 3;

      render(
        <RepoTable
          data={response}
          isLoading={false}
          onSort={mockOnSort}
          onPageChange={mockOnPageChange}
          sortConfig={{ sortBy: 'stars', sortOrder: 'desc' }}
        />,
        { wrapper: createWrapper() }
      );

      // Pagination should be visible
      expect(screen.getByTitle('下一页')).toBeInTheDocument();
    });

    it('should not show pagination when data fits in one page', () => {
      const repos = createMockRepos(10);
      const response = createMockResponse(repos, 1, 20);
      response.pagination.total = 10;
      response.pagination.totalPages = 1;

      render(
        <RepoTable
          data={response}
          isLoading={false}
          onSort={mockOnSort}
          onPageChange={mockOnPageChange}
          sortConfig={{ sortBy: 'stars', sortOrder: 'desc' }}
        />,
        { wrapper: createWrapper() }
      );

      // Pagination should be hidden or disabled
      expect(screen.queryByTitle('下一页')).not.toBeInTheDocument();
    });
  });

  describe('边界条件测试', () => {
    it('should handle very long description', () => {
      const repos = [createMockRepo({
        description: 'This is a very long description that should be truncated in the table view to prevent layout issues and maintain readability'
      })];
      const response = createMockResponse(repos);

      render(
        <RepoTable
          data={response}
          isLoading={false}
          onSort={mockOnSort}
          onPageChange={mockOnPageChange}
          sortConfig={{ sortBy: 'stars', sortOrder: 'desc' }}
        />,
        { wrapper: createWrapper() }
      );

      // Description should be truncated (ellipsis)
      const description = screen.getByText(/This is a very long description/);
      expect(description).toBeInTheDocument();
    });

    it('should handle special characters in repo name', () => {
      const repos = [createMockRepo({
        name: 'repo-with-special-chars-<>&"\'',
        fullName: 'owner/repo-with-special-chars-<>&"\''
      })];
      const response = createMockResponse(repos);

      render(
        <RepoTable
          data={response}
          isLoading={false}
          onSort={mockOnSort}
          onPageChange={mockOnPageChange}
          sortConfig={{ sortBy: 'stars', sortOrder: 'desc' }}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText(/repo-with-special-chars/)).toBeInTheDocument();
    });
  });
});
