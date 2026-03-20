import { useState, useEffect } from 'react';
import { getTimelinePosts } from '@/helpers/data';
import { useLanguage } from '@/context/useLanguageContext';

export const useTimelinePosts = (userId) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { locale } = useLanguage();

  const LIMIT = 5;

  // Main fetch function for initial load
  useEffect(() => {
    const fetchInitialPosts = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setPage(1);
        const response = await getTimelinePosts(userId, locale, 1, LIMIT);
        
        // API returns { posts, total }
        const newPosts = Array.isArray(response) ? response : (response.posts || []);
        const total = response?.total ?? newPosts.length;
        setPosts(newPosts);
        
        // Tüm gönderiler yüklendi mi? (örn. 300 gönderi varsa 300'ü dolana kadar devam)
        setHasMore(newPosts.length < total);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching initial timeline posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialPosts();
  }, [userId, locale]);

  // Function to load more posts
  const loadMore = async () => {
    if (loadingMore || !hasMore || !userId) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const response = await getTimelinePosts(userId, locale, nextPage, LIMIT);
      
      const newPosts = Array.isArray(response) ? response : (response.posts || []);
      const total = response?.total ?? 0;
      
      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts(prev => {
          const updated = [...prev, ...newPosts];
          // Tüm gönderiler (örn. 300) yüklendi mi?
          setHasMore(updated.length < total);
          return updated;
        });
        setPage(nextPage);
      }
    } catch (err) {
      console.error('Error loading more posts:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Listen for post creation events and automatically add to top
  useEffect(() => {
    const handlePostCreated = async (event) => {
      if (event.detail && event.detail.post) {
        const newPost = event.detail.post;
        const fromRealtime = event.detail.fromRealtime === true;

        setPosts(prevPosts => {
          const exists = prevPosts.some(p => p.id === newPost.id);
          if (exists) return prevPosts;
          return [newPost, ...prevPosts];
        });

        if (fromRealtime) return;
      }

      // If needed, we could re-fetch page 1, but adding the new post to top is usually enough
    };

    window.addEventListener('postCreated', handlePostCreated);
    return () => window.removeEventListener('postCreated', handlePostCreated);
  }, [userId, locale]);

  // Listen for post deletion
  useEffect(() => {
    const handlePostDeleted = (event) => {
      const postId = event.detail?.postId;
      if (postId != null) {
        const id = Number(postId);
        setPosts(prevPosts => prevPosts.filter(post => Number(post.id) !== id));
      }
    };
    window.addEventListener('postDeletedFromFeed', handlePostDeleted);
    return () => window.removeEventListener('postDeletedFromFeed', handlePostDeleted);
  }, []);

  // Listen for share/unshare changes - cache bypass ile backend ile senkron
  useEffect(() => {
    const handleTimelineRefreshRequested = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        setPage(1);
        const response = await getTimelinePosts(userId, locale, 1, LIMIT, true);
        const newPosts = Array.isArray(response) ? response : (response.posts || []);
        const total = response?.total ?? newPosts.length;
        setPosts(newPosts);
        setHasMore(newPosts.length < total);
      } catch (err) {
        console.error('Error refreshing timeline:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    window.addEventListener('timelineRefreshRequested', handleTimelineRefreshRequested);
    return () => window.removeEventListener('timelineRefreshRequested', handleTimelineRefreshRequested);
  }, [userId, locale]);

  const refetch = async () => {
    if (userId) {
      setLoading(true);
      setError(null);
      setPage(1);
      try {
        const response = await getTimelinePosts(userId, locale, 1, LIMIT, true);
        const newPosts = Array.isArray(response) ? response : (response.posts || []);
        const total = response?.total ?? newPosts.length;
        setPosts(newPosts);
        setHasMore(newPosts.length < total);
      } catch (err) {
        setError(err.message);
        console.error('Error refetching timeline posts:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const removePost = (postId) => {
    const id = Number(postId);
    setPosts(prevPosts => prevPosts.filter(post => Number(post.id) !== id));
  };

  return {
    posts,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    error,
    refetch,
    removePost
  };
};
