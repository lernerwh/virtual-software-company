import { useState, useCallback, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, Layout, Typography, Card, Space, Tag, Button, Input, Select, Table, message, Tooltip, Badge } from 'antd';
import { SearchOutlined, DownloadOutlined, SyncOutlined, CheckCircleOutlined, ExclamationCircleOutlined, StarOutlined, ForkOutlined, LinkOutlined } from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';
import { useRepos, useStatus } from './hooks';
import { getExportUrl } from './api';
import { DEFAULT_FILTERS, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, LANGUAGE_OPTIONS, STAR_RANGE_OPTIONS, UPDATE_RANGE_OPTIONS } from './constants';
import { formatNumber, getTimeAgo, truncateText, getLanguageColor } from './utils';
import type { FilterState, SortConfig, Repository } from './types';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import './styles/global.css';

dayjs.locale('zh-cn');

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    sortBy: 'stars',
    sortOrder: 'desc',
  });

  const query = useMemo(() => ({
    page,
    pageSize,
    search: search || undefined,
    ...filters,
    ...sortConfig,
  }), [page, pageSize, search, filters, sortConfig]);

  const { data, isLoading, error } = useRepos(query);
  const { data: statusData } = useStatus();

  if (error) {
    message.error('加载数据失败，请稍后重试');
  }

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((key: keyof FilterState, value: string | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const handleFilterReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearch('');
    setPage(1);
  }, []);

  const handleSort = useCallback((sortBy: SortConfig['sortBy'], sortOrder: SortConfig['sortOrder']) => {
    setSortConfig({ sortBy, sortOrder });
  }, []);

  const handlePageChange = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  }, []);

  const handleExport = useCallback(() => {
    const url = getExportUrl({ ...filters, search });
    const link = document.createElement('a');
    link.href = url;
    link.download = `github-android-top500-${dayjs().format('YYYYMMDD-HHmmss')}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('正在导出Excel文件...');
  }, [filters, search]);

  const activeFilterCount = [filters.language, filters.starRange, filters.updateRange].filter(Boolean).length;

  const columns: ColumnsType<Repository> = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 70,
      align: 'center',
      render: (rank: number) => (
        <span style={{ fontWeight: 'bold', color: rank <= 10 ? '#faad14' : '#1890ff' }}>#{rank}</span>
      ),
    },
    {
      title: '项目名称',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 200,
      render: (fullName: string, record: Repository) => (
        <a href={record.htmlUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff' }}>
          {fullName}
        </a>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 300,
      render: (description: string | null) => (
        <Tooltip title={description}>
          <span>{truncateText(description, 60)}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Stars',
      dataIndex: 'stars',
      key: 'stars',
      width: 100,
      sorter: true,
      sortOrder: sortConfig.sortBy === 'stars' ? (sortConfig.sortOrder === 'asc' ? 'ascend' : 'descend') : null,
      render: (stars: number) => (
        <Space>
          <StarOutlined style={{ color: '#faad14' }} />
          <span>{formatNumber(stars)}</span>
        </Space>
      ),
    },
    {
      title: 'Forks',
      dataIndex: 'forks',
      key: 'forks',
      width: 90,
      sorter: true,
      sortOrder: sortConfig.sortBy === 'forks' ? (sortConfig.sortOrder === 'asc' ? 'ascend' : 'descend') : null,
      render: (forks: number) => (
        <Space>
          <ForkOutlined />
          <span>{formatNumber(forks)}</span>
        </Space>
      ),
    },
    {
      title: '语言',
      dataIndex: 'language',
      key: 'language',
      width: 90,
      render: (language: string | null) => {
        if (!language) return '-';
        const color = getLanguageColor(language);
        return <Tag color={color}>{language}</Tag>;
      },
    },
    {
      title: '更新时间',
      dataIndex: 'pushedAt',
      key: 'pushedAt',
      width: 120,
      sorter: true,
      sortOrder: sortConfig.sortBy === 'updatedAt' ? (sortConfig.sortOrder === 'asc' ? 'ascend' : 'descend') : null,
      render: (pushedAt: string) => (
        <Tooltip title={pushedAt}>
          <span>{getTimeAgo(pushedAt)}</span>
        </Tooltip>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: Repository) => (
        <Space>
          <Tooltip title="在GitHub中打开">
            <a href={record.htmlUrl} target="_blank" rel="noopener noreferrer">
              <LinkOutlined />
            </a>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleTableChange = (_pagination: TablePaginationConfig, _filters: any, sorter: any) => {
    if (sorter.field) {
      const sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
      handleSort(sorter.field as SortConfig['sortBy'], sortOrder);
    }
  };

  const getStatusTag = () => {
    const metadata = statusData?.metadata;
    if (!metadata) return null;

    switch (metadata.updateStatus) {
      case 'updating':
        return <Tag icon={<SyncOutlined spin />} color="processing">数据更新中...</Tag>;
      case 'success':
        return <Tag icon={<CheckCircleOutlined />} color="success">数据正常</Tag>;
      case 'error':
        return <Tooltip title={metadata.errorMessage}><Tag icon={<ExclamationCircleOutlined />} color="error">更新失败</Tag></Tooltip>;
      default:
        return <Tag>等待更新</Tag>;
    }
  };

  return (
    <Layout className="app-layout">
      <Header className="app-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <Title level={3} style={{ color: '#fff', margin: 0 }}>
          GitHub Android Top 500
        </Title>
        <Space>
          {getStatusTag()}
          {statusData?.metadata?.lastUpdateTime && (
            <Text style={{ color: '#fff' }}>
              上次更新: {dayjs(statusData.metadata.lastUpdateTime).format('YYYY-MM-DD HH:mm')}
            </Text>
          )}
        </Space>
      </Header>
      <Content style={{ padding: '24px', background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
        <Card>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* 工具栏 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <Space wrap>
                <Input
                  placeholder="搜索项目名称或描述..."
                  prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  allowClear
                  style={{ width: 300 }}
                />
                <Select
                  placeholder="编程语言"
                  allowClear
                  style={{ width: 120 }}
                  value={filters.language}
                  onChange={(v) => handleFilterChange('language', v)}
                  options={LANGUAGE_OPTIONS}
                />
                <Select
                  placeholder="Star数量"
                  allowClear
                  style={{ width: 140 }}
                  value={filters.starRange}
                  onChange={(v) => handleFilterChange('starRange', v)}
                  options={STAR_RANGE_OPTIONS}
                />
                <Select
                  placeholder="更新时间"
                  allowClear
                  style={{ width: 120 }}
                  value={filters.updateRange}
                  onChange={(v) => handleFilterChange('updateRange', v)}
                  options={UPDATE_RANGE_OPTIONS}
                />
                {activeFilterCount > 0 && (
                  <Badge count={activeFilterCount} size="small">
                    <Button onClick={handleFilterReset}>重置</Button>
                  </Badge>
                )}
              </Space>
              <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport} disabled={isLoading}>
                导出Excel
              </Button>
            </div>

            {/* 数据统计 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary">
                共 {data?.pagination.total || 0} 个项目
              </Text>
            </div>

            {/* 表格 */}
            <Table<Repository>
              columns={columns}
              dataSource={data?.data || []}
              rowKey="id"
              loading={isLoading}
              pagination={{
                current: data?.pagination.page || 1,
                pageSize: data?.pagination.pageSize || 20,
                total: data?.pagination.total || 0,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条`,
                pageSizeOptions: PAGE_SIZE_OPTIONS.map(String),
                onChange: handlePageChange,
                onShowSizeChange: handlePageChange,
              }}
              onChange={handleTableChange}
              scroll={{ x: 1000 }}
              size="middle"
              locale={{ emptyText: '暂无数据' }}
            />
          </Space>
        </Card>
      </Content>
    </Layout>
  );
}

export default function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ConfigProvider>
  );
}
