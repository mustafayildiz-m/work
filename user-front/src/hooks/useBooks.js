'use client';

import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const useBooks = (selectedLanguageId = null) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasMore: false
  });

  const fetchBooks = useCallback(async (page = 1, query = '') => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');

      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }


      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });

      if (query) {
        params.append('search', query);
      }

      if (selectedLanguageId) {
        params.append('languageId', selectedLanguageId.toString());
      }

      const response = await fetch(`${API_BASE_URL}/books?${params}`, {
        headers: headers
      });


      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Backend'den gelen translations'ı kullanıcının diline göre transform et
      const transformedBooks = (data || []).map(book => {
        // Kullanıcının seçtiği dildeki çeviriyi bul, yoksa ilk çeviriyi al
        const selectedTranslation = selectedLanguageId
          ? book.translations?.find(t => t.languageId === selectedLanguageId)
          : book.translations?.[0];

        const fallbackTranslation = book.translations?.[0];
        const translation = selectedTranslation || fallbackTranslation;

        return {
          ...book,
          title: translation?.title || book.author || 'Başlıksız Kitap',
          description: translation?.description || '',
          summary: translation?.summary || '',
          // Translations'ı da koru (detay sayfası için)
        };
      });

      setBooks(transformedBooks);
      setPagination(prev => ({
        ...prev,
        page: page,
        total: transformedBooks.length,
        totalPages: Math.ceil(transformedBooks.length / pagination.limit),
        hasMore: page < Math.ceil(transformedBooks.length / pagination.limit)
      }));

    } catch (err) {
      setError(err.message);
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, selectedLanguageId]);

  const searchBooks = useCallback((query) => {
    setSearchQuery(query);
    fetchBooks(1, query);
  }, [fetchBooks]);

  const goToPage = useCallback((page) => {
    fetchBooks(page, searchQuery);
  }, [fetchBooks, searchQuery]);

  const loadMore = useCallback(() => {
    if (pagination.hasMore && !loading) {
      fetchBooks(pagination.page + 1, searchQuery);
    }
  }, [pagination.hasMore, pagination.page, loading, fetchBooks, searchQuery]);

  // Initial load
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return {
    books,
    loading,
    error,
    searchQuery,
    pagination,
    searchBooks,
    goToPage,
    loadMore,
    refetch: () => fetchBooks(pagination.page, searchQuery)
  };
};
