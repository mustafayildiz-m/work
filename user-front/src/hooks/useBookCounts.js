'use client';

import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const useBookCounts = () => {
  const [bookCounts, setBookCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookCounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/languages/book-counts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Convert array to object with language code as key
      const countsObject = {};
      data.forEach(item => {
        countsObject[item.languageCode] = item.bookCount;
      });
      
      setBookCounts(countsObject);

    } catch (err) {
      setError(err.message);
      console.error('Error fetching book counts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookCounts();
  }, [fetchBookCounts]);

  const getBookCount = useCallback((languageCode) => {
    return bookCounts[languageCode] || 0;
  }, [bookCounts]);

  return {
    bookCounts,
    loading,
    error,
    getBookCount,
    fetchBookCounts
  };
};
