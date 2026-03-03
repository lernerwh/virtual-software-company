import React from 'react';
import { Table, Tag, Tooltip, Space, Spin } from 'antd';
import { StarOutlined, ForkOutlined, LinkOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { Repository, RepoListResponse, SortConfig } from '../../types';
import { formatNumber, getTimeAgo, truncateText } from '../../utils/format';

interface RepoTableProps {
  data: RepoListResponse | null;
  isLoading: boolean;
  sortConfig: SortConfig;
  onSort: (sortBy: SortConfig['sortBy'], sortOrder: SortConfig['sortOrder']) => void;
  onPageChange: (page: number, pageSize: number) => void;
}

/**
 * 项目列表表格组件
 */
export const RepoTable: React.FC<RepoTableProps> = ({
  data,
  isLoading,
  sortConfig,
  onSort,
  onPageChange,
}) => {
  const handleTableChange = (_pagination: TablePaginationConfig, _filters: any, sorter: any) => {
    if (sorter.field) {
      const sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
      onSort(sorter.field as SortConfig['sortBy'], sortOrder);
    }
  };

  const columns: ColumnsType<Repository> = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 70,
      align: 'center',
      render: (rank: number) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>#{rank}</span>
      ),
    },
    {
      title: '项目名称',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 200,
      render: (fullName: string, record: Repository) => (
        <a
          href={record.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#1890ff' }}
        >
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
        const color = language === 'Java' ? '#b07219' : language === 'Kotlin' ? '#F18E33' : '#default';
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
            <a
              href={record.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkOutlined />
            </a>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
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
        onChange: onPageChange,
        onShowSizeChange: onPageChange,
      }}
      onChange={handleTableChange}
      scroll={{ x: 1000 }}
      size="middle"
      locale={{ emptyText: '暂无数据' }}
    />
  );
};

export default RepoTable;
