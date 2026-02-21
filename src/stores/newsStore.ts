import { create } from 'zustand';
import { newsService } from '../api/services';
import type { NewsArticle } from '../types';

interface NewsState {
  // Data
  articles: NewsArticle[];
  currentArticle: NewsArticle | null;
  currentArticleContent: string | null;
  isLoading: boolean;
  isLoadingArticle: boolean;
  error: string | null;

  // Actions
  loadNews: () => Promise<void>;
  loadArticle: (id: string) => Promise<void>;
  loadArticleContent: (id: string) => Promise<void>;
  clearCurrentArticle: () => void;
  clearError: () => void;

  // Helpers
  getArticlesByCategory: (category: string) => NewsArticle[];
  getLatestArticles: (limit?: number) => NewsArticle[];
}

export const useNewsStore = create<NewsState>((set, get) => ({
  articles: [],
  currentArticle: null,
  currentArticleContent: null,
  isLoading: false,
  isLoadingArticle: false,
  error: null,

  loadNews: async () => {
    try {
      set({ isLoading: true, error: null });
      const articles = await newsService.getNews();
      set({ articles });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load news' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadArticle: async (id: string) => {
    try {
      set({ isLoadingArticle: true, error: null });
      const article = await newsService.getNewsById(id);
      set({ currentArticle: article });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load article' });
    } finally {
      set({ isLoadingArticle: false });
    }
  },

  loadArticleContent: async (id: string) => {
    try {
      set({ isLoadingArticle: true, error: null });
      const content = await newsService.getNewsContent(id);
      set({ currentArticleContent: content });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load article content' });
    } finally {
      set({ isLoadingArticle: false });
    }
  },

  clearCurrentArticle: () => {
    set({ currentArticle: null, currentArticleContent: null });
  },

  clearError: () => set({ error: null }),

  getArticlesByCategory: (category: string) => {
    return get().articles.filter((article) => article.category === category);
  },

  getLatestArticles: (limit = 10) => {
    return get()
      .articles.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
      .slice(0, limit);
  },
}));
