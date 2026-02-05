'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/useLanguageContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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
    try {
      setLoading(true);
      setError(null);

      const languageToUse = language || selectedLanguage;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });

      // Dil seçiliyse ekle (tüm diller için parametreyi gönderme)
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
      
      setStories(data.stories || []);
      setPagination({
        page: data.page || page, // Backend'den gelen sayfa numarası
        limit: data.limit || pagination.limit,
        total: data.total || 0,
        totalPages: data.totalPages || 0,
        hasMore: page < (data.totalPages || 1)
      });

    } catch (err) {
      setError(err.message);
      console.error('Error fetching scholar stories:', err);
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
