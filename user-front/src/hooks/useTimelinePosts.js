import { useState, useEffect } from 'react';
import { getTimelinePosts } from '@/helpers/data';
import { useLanguage } from '@/context/useLanguageContext';

export const useTimelinePosts = (userId) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { locale } = useLanguage(); // Kullanıcının seçtiği dil

  // Main fetch function for initial load and manual refresh
  useEffect(() => {
    const fetchPosts = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getTimelinePosts(userId, locale);
        setPosts(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching timeline posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userId, locale]); // locale değişince de yeniden fetch et

  // Listen for post creation events and automatically refresh
  useEffect(() => {
    const handlePostCreated = async (event) => {
      // If we have post data in the event, add it immediately for instant feedback
      if (event.detail && event.detail.post) {
        const newPost = event.detail.post;
        
        // Ensure video_url is properly formatted for immediate display
        if (newPost.video_url && newPost.video_url.startsWith('blob:')) {
          // This is a blob URL from file selection, keep it for immediate display
        }
        
        // Add the new post to the beginning of the list
        setPosts(prevPosts => [newPost, ...prevPosts]);
      }
      
      // Then refresh from server to get accurate data
      if (userId) {
        try {
          setLoading(true);
          setError(null);
          const data = await getTimelinePosts(userId, locale);
          setPosts(data);
        } catch (err) {
          console.error('❌ useTimelinePosts: Error refreshing timeline:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    // Add event listener for post creation
    window.addEventListener('postCreated', handlePostCreated);

    // Cleanup event listener
    return () => {
      window.removeEventListener('postCreated', handlePostCreated);
    };
  }, [userId, locale]);

  const refetch = async () => {
    if (userId) {
      setLoading(true);
      setError(null);
      try {
        const data = await getTimelinePosts(userId, locale);
        setPosts(data);
      } catch (err) {
        setError(err.message);
        console.error('Error refetching timeline posts:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const removePost = (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  return {
    posts,
    loading,
    error,
    refetch,
    removePost
  };
};
