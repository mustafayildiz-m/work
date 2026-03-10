'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/useLanguageContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const CACHE_KEY = 'scholar-stories-cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 dakika

const getCacheKey = (page, limit, language, query) =>
  `scholar-stories:${page}:${limit}:${language || 'all'}:${query || ''}`;

const getCached = (key) => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, key: storedKey, ts } = JSON.parse(raw);
    if (storedKey !== key) return null;
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
};

const setCached = (key, data) => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ key, data, ts: Date.now() }));
  } catch {}
};

export const useScholarStories = (initialLanguage = null) => {
  const { locale } = useLanguage();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage || 'all'); // Varsayılan olarak tüm diller
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasMore: false
  });

  const fetchStories = useCallback(async (page = 1, query = '', language = null) => {
    const languageToUse = language || selectedLanguage;
    const limit = pagination.limit;
    const cacheKey = getCacheKey(page, limit, languageToUse, query);

    // Önce cache'den göster (sayfa yenilemede anında görünüm)
    const cached = getCached(cacheKey);
    if (cached) {
      setStories(cached.stories || []);
      setPagination({
        page: cached.page || page,
        limit: cached.limit || limit,
        total: cached.total || 0,
        totalPages: cached.totalPages || 0,
        hasMore: page < (cached.totalPages || 1)
      });
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (languageToUse && languageToUse !== 'all') {
        params.append('language', languageToUse);
      }

      if (query) {
        params.append('search', query);
      }

      const response = await fetch(`${API_BASE_URL}/scholar-stories?${params}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const result = {
        stories: data.stories || [],
        page: data.page || page,
        limit: data.limit || limit,
        total: data.total || 0,
        totalPages: data.totalPages || 0
      };

      setCached(cacheKey, result);
      setStories(result.stories);
      setPagination({
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasMore: page < (result.totalPages || 1)
      });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching scholar stories:', err);
      if (!cached) setStories([]);
    } finally {
      setLoading(false);
    }
  }, [selectedLanguage, pagination.limit]);

  const searchStories = useCallback((query) => {
    setSearchQuery(query);
    fetchStories(1, query);
  }, [fetchStories]);

  const goToPage = useCallback((page) => {
    fetchStories(page, searchQuery);
  }, [fetchStories, searchQuery]);

  const refetch = useCallback(() => {
    fetchStories(1, searchQuery);
  }, [fetchStories, searchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    fetchStories(1, '');
  }, [fetchStories]);

  const changeLanguage = useCallback((language) => {
    setSelectedLanguage(language);
    setSearchQuery('');
    fetchStories(1, '', language);
  }, [fetchStories]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  return {
    stories,
    loading,
    error,
    pagination,
    searchQuery,
    selectedLanguage,
    searchStories,
    goToPage,
    refetch,
    clearSearch,
    changeLanguage
  };
};
