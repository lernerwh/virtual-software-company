import { Octokit } from 'octokit';
import type { Repository } from './types.js';
import { saveRepositories, updateMetadata, getMetadata } from './store.js';
import config from './config.js';

let octokit: Octokit | null = null;

function getOctokit(): Octokit {
  if (!octokit) {
    octokit = new Octokit({
      auth: config.github.token,
    });
  }
  return octokit;
}

function transformRepo(item: any, rank: number): Repository {
  return {
    id: item.id,
    rank,
    name: item.name,
    fullName: item.full_name,
    description: item.description,
    url: item.url,
    htmlUrl: item.html_url,
    stars: item.stargazers_count,
    forks: item.forks_count,
    language: item.language,
    license: item.license?.spdx_id || null,
    ownerId: item.owner?.id,
    ownerName: item.owner?.login,
    ownerAvatar: item.owner?.avatar_url,
    ownerType: item.owner?.type,
    isFork: item.fork,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    pushedAt: item.pushed_at,
    openIssues: item.open_issues_count,
    watchers: item.watchers_count,
    topics: item.topics || [],
    homepage: item.homepage,
  };
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchAndroidRepos(): Promise<Repository[]> {
  const client = getOctokit();
  const allRepos: any[] = [];
  const perPage = 100;
  const maxRepos = config.github.maxRepos;

  // 搜索Android项目
  const queries = [
    'android language:java stars:>100',
    'android language:kotlin stars:>100',
  ];

  updateMetadata({ updateStatus: 'updating', errorMessage: null });

  try {
    for (const query of queries) {
      let page = 1;

      while (allRepos.length < maxRepos) {
        try {
          const response = await client.rest.search.repos({
            q: query,
            sort: 'stars',
            order: 'desc',
            per_page: perPage,
            page,
          });

          const items = response.data.items;
          if (items.length === 0) break;

          allRepos.push(...items);
          console.log(`Fetched ${allRepos.length} repos (query: ${query}, page: ${page})`);

          if (items.length < perPage) break;
          page++;

          // 避免API速率限制
          await sleep(1000);
        } catch (error: any) {
          if (error.status === 403) {
            console.warn('Rate limit hit, waiting...');
            await sleep(60000);
            continue;
          }
          throw error;
        }
      }
    }

    // 去重并排序
    const uniqueRepos = new Map<number, any>();
    for (const repo of allRepos) {
      if (!uniqueRepos.has(repo.id)) {
        uniqueRepos.set(repo.id, repo);
      }
    }

    const sortedRepos = Array.from(uniqueRepos.values())
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, maxRepos);

    const repositories = sortedRepos.map((item, index) => transformRepo(item, index + 1));

    // 保存到存储
    saveRepositories(repositories);

    console.log(`Successfully fetched and saved ${repositories.length} repositories`);
    return repositories;
  } catch (error: any) {
    console.error('Failed to fetch repositories:', error.message);
    updateMetadata({
      updateStatus: 'error',
      errorMessage: error.message,
    });
    throw error;
  }
}

export function needsRefresh(): boolean {
  const metadata = getMetadata();

  if (!metadata.lastUpdateTime) return true;
  if (metadata.updateStatus === 'updating') return false;

  const lastUpdate = new Date(metadata.lastUpdateTime);
  const cacheDurationMs = config.cache.durationHours * 60 * 60 * 1000;

  return Date.now() - lastUpdate.getTime() > cacheDurationMs;
}

export async function refreshIfNeeded(): Promise<boolean> {
  if (needsRefresh()) {
    console.log('Cache expired, refreshing data...');
    try {
      await fetchAndroidRepos();
      return true;
    } catch (error) {
      console.error('Auto refresh failed');
      return false;
    }
  }
  return false;
}
