import axios from 'axios';

export interface NewsItem {
  title: string;
  source: string;
  publishedAt: string;
  description: string;
  url: string;
}

interface CacheEntry {
  expiresAt: number;
  data: NewsItem[];
}

const newsCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000;

export const fetchLocalNews = async (city: string): Promise<NewsItem[]> => {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) throw new Error('News API key is not configured');

  const cacheKey = city.toLowerCase();
  const cached = newsCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.data;
  newsCache.delete(cacheKey);

  const response = await axios.get('https://newsapi.org/v2/everything', {
    params: {
      q: city,
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: 5,
      apiKey,
    },
  });

  if (response.data?.status !== 'ok') throw new Error(response.data?.message || 'News provider failed');
  const news = (response.data.articles || []).slice(0, 5).map((article: any) => ({
    title: article.title,
    source: article.source?.name || 'Unknown source',
    publishedAt: article.publishedAt,
    description: article.description || '',
    url: article.url,
  }));
  newsCache.set(cacheKey, { data: news, expiresAt: Date.now() + CACHE_TTL_MS });
  return news;
};