'use client';

import { useTimelinePosts } from '@/hooks/useTimelinePosts';
import { BsPersonX } from 'react-icons/bs';
import PostCard from '@/components/cards/PostCard';
import SharedProfileCard from '@/components/cards/SharedProfileCard';
import SharedBookCard from '@/components/cards/SharedBookCard';
import SharedPodcastCard from '@/components/cards/SharedPodcastCard';
import SharedStoryCard from '@/components/cards/SharedStoryCard';
import SharedNewsletterCard from '@/components/cards/SharedNewsletterCard';
import CustomConfirmDialog from '@/components/CustomConfirmDialog';
import EditPostModal from '@/components/EditPostModal';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/useLanguageContext';
import { useNotificationContext } from '@/context/useNotificationContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function loadPendingPosts(userId) {
  const token = localStorage.getItem('token');
  if (!token) return [];
  const response = await fetch(`${API_BASE}/user-posts/user/${userId}?status=pending`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) return [];
  return response.json();
}

const Feeds = ({ userId }) => {
  const { t, locale } = useLanguage();
  const { showNotification } = useNotificationContext();

  // Always call hooks first, before any conditional returns
  const { 
    posts: timelinePosts, 
    loading, 
    loadingMore, 
    hasMore, 
    loadMore, 
    error, 
    refetch, 
    removePost 
  } = useTimelinePosts(userId);

  // Setup Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    const observerTarget = document.getElementById('infinite-scroll-trigger');
    if (observerTarget) {
      observer.observe(observerTarget);
    }

    return () => {
      if (observerTarget) {
        observer.unobserve(observerTarget);
      }
    };
  }, [hasMore, loadingMore, loading, loadMore]);

  // State for user's own pending posts
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loadingPendingPosts, setLoadingPendingPosts] = useState(false);

  // State for delete operation
  const [deletingPostId, setDeletingPostId] = useState(null);

  // State for custom confirmation dialogs
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // State for edit post modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // State for comments
  const [postComments, setPostComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});

  // State for language selection per post - key: postId, value: languageCode
  const [localeForLangs, setLocaleForLangs] = useState(locale);
  const [selectedLanguages, setSelectedLanguages] = useState({});

  if (localeForLangs !== locale) {
    setLocaleForLangs(locale);
    setSelectedLanguages({});
  }

  // Fetch user's own pending posts
  useEffect(() => {
    if (!userId) return;
    setLoadingPendingPosts(true);
    loadPendingPosts(userId)
      .then(posts => setPendingPosts(posts))
      .catch(err => console.error('Error fetching pending posts:', err))
      .finally(() => setLoadingPendingPosts(false));
  }, [userId]);

  // Listen for post creation events and add to pending posts immediately
  useEffect(() => {
    const handlePostCreated = async (event) => {
      if (event.detail && event.detail.post) {
        const newPost = event.detail.post;

        if (!newPost.status || newPost.status === 'pending') {
          const pendingPost = {
            id: newPost.id || Date.now(),
            user_id: newPost.user_id || userId,
            content: newPost.content,
            title: newPost.title || null,
            image_url: newPost.image_url || null,
            video_url: newPost.video_url || null,
            status: 'pending',
            created_at: newPost.created_at || new Date().toISOString(),
            timeAgo: 'Şimdi',
            user_name: newPost.user_name || 'Sen',
            user_username: newPost.user_username,
            user_photo_url: newPost.user_photo_url,
          };

          setPendingPosts(prev => {
            const exists = prev.some(p => p.id === pendingPost.id);
            if (exists) return prev;
            return [pendingPost, ...prev];
          });
        }

        setTimeout(() => {
          if (!userId) return;
          loadPendingPosts(userId)
            .then(posts => setPendingPosts(posts))
            .catch(err => console.error('Error refreshing pending posts:', err));
        }, 1500);
      }
    };

    window.addEventListener('postCreated', handlePostCreated);

    return () => {
      window.removeEventListener('postCreated', handlePostCreated);
    };
  }, [userId]);

  // Yeni yorum anlık görünsün (biri paylaşımıma yorum yaptı)
  useEffect(() => {
    const handleNewComment = (event) => {
      const { postId, comment } = event.detail || {};
      if (!postId || !comment) return;
      setPostComments(prev => {
        const existing = prev[postId] || [];
        if (existing.some(c => c.id === comment.id)) return prev;
        return { ...prev, [postId]: [...existing, comment] };
      });
    };
    window.addEventListener('newCommentInPost', handleNewComment);
    return () => window.removeEventListener('newCommentInPost', handleNewComment);
  }, []);

  // Handler functions for post actions
  const handleUnfollow = async (userIdToUnfollow, userType = 'user') => {
    // Store the action details and show confirmation dialog
    setPendingAction({
      type: 'unfollow',
      userId: userIdToUnfollow,
      userType: userType
    });
    setShowUnfollowConfirm(true);
  };

  const executeUnfollow = async () => {
    const { userId: userIdToUnfollow, userType } = pendingAction;

    try {

      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        // console.error('No authentication token found');
        return;
      }


      // Make the DELETE request to unfollow the user
      // Determine the correct endpoint based on user type
      let endpoint;
      let requestBody;

      if (userType === 'scholar') {
        endpoint = '/user-scholar-follow/unfollow';
        requestBody = {
          user_id: userId,
          scholar_id: userIdToUnfollow
        };
      } else {
        endpoint = '/user-follow/unfollow';
        requestBody = {
          follower_id: userId,
          following_id: userIdToUnfollow
        };
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${endpoint}`;
      //   'Authorization': `Bearer ${token.substring(0, 20)}...`,
      //   'Content-Type': 'application/json'
      // });


      // Log the exact curl command that would be equivalent

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });


      if (response.ok) {
        // Close the modal first
        setShowUnfollowConfirm(false);
        // Refresh timeline to remove unfollowed user's posts
        refetch();
      } else {
        // console.error('Failed to unfollow user:', response.status, response.statusText);
        const errorData = await response.text();
        // console.error('Error details:', errorData);
        alert('Kullanıcı takipten çıkarılırken bir hata oluştu. Lütfen tekrar deneyin.');
        setShowUnfollowConfirm(false);
      }
    } catch (error) {
      // console.error('Error unfollowing user:', error);
      setShowUnfollowConfirm(false);
      alert('Kullanıcı takipten çıkarılırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setPendingAction(null);
    }
  };

  const handleDeletePost = async (postId) => {
    // Store the action details and show confirmation dialog
    setPendingAction({
      type: 'delete',
      postId: postId
    });
    setShowDeleteConfirm(true);
  };

  // Separate handler for shared profile posts - no confirmation dialog needed
  const handleDeleteSharedProfilePost = async (postId) => {
    try {
      setDeletingPostId(postId);

      const token = localStorage.getItem('token');
      if (!token) {
        setDeletingPostId(null);
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/user-posts/${postId}`;

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Immediately remove the post from local state for instant UI update
        removePost(postId);
        // Also remove from pending posts if it exists there
        setPendingPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        console.error('Failed to delete shared profile post:', response.status);
      }
    } catch (error) {
      console.error('Error deleting shared profile post:', error);
    } finally {
      setDeletingPostId(null);
    }
  };

  // Separate handler for shared book posts - no confirmation dialog needed
  const handleDeleteSharedBookPost = async (postId) => {
    try {
      setDeletingPostId(postId);

      const token = localStorage.getItem('token');
      if (!token) {
        setDeletingPostId(null);
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/user-posts/${postId}`;

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Immediately remove the post from local state for instant UI update
        removePost(postId);
        // Also remove from pending posts if it exists there
        setPendingPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        console.error('Failed to delete shared book post:', response.status);
      }
    } catch (error) {
      console.error('Error deleting shared book post:', error);
    } finally {
      setDeletingPostId(null);
    }
  };

  // Separate handler for shared story posts - no confirmation dialog needed
  const handleDeleteSharedNewsletterPost = async (postId) => {
    try {
      setDeletingPostId(postId);
      const token = localStorage.getItem('token');
      if (!token) {
        setDeletingPostId(null);
        return;
      }
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/user-posts/${postId}`;
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        removePost(postId);
        setPendingPosts(prev => prev.filter(p => p.id !== postId));
      }
    } catch (err) {
      console.error('Error deleting shared newsletter post:', err);
    } finally {
      setDeletingPostId(null);
    }
  };

  const handleDeleteSharedStoryPost = async (postId) => {
    try {
      setDeletingPostId(postId);
      const token = localStorage.getItem('token');
      if (!token) {
        setDeletingPostId(null);
        return;
      }
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/user-posts/${postId}`;
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        removePost(postId);
        setPendingPosts(prev => prev.filter(p => p.id !== postId));
      }
    } catch (err) {
      console.error('Failed to delete shared story post:', err);
    } finally {
      setDeletingPostId(null);
    }
  };

  // Separate handler for shared podcast posts - no confirmation dialog needed
  const handleDeleteSharedPodcastPost = async (postId) => {
    try {
      setDeletingPostId(postId);

      const token = localStorage.getItem('token');
      if (!token) {
        setDeletingPostId(null);
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/user-posts/${postId}`;

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        removePost(postId);
        setPendingPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        console.error('Failed to delete shared podcast post:', response.status);
      }
    } catch (error) {
      console.error('Error deleting shared podcast post:', error);
    } finally {
      setDeletingPostId(null);
    }
  };

  const executeDeletePost = async () => {
    const { postId } = pendingAction;

    try {
      setDeletingPostId(postId);

      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        // console.error('No authentication token found');
        setDeletingPostId(null);
        return;
      }


      // Make the DELETE request to the API
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/user-posts/${postId}`;
      //   'Authorization': `Bearer ${token.substring(0, 20)}...`,
      //   'Content-Type': 'application/json'
      // });

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });


      if (response.ok) {
        // Close the modal first
        setShowDeleteConfirm(false);
        // Immediately remove the post from local state for instant UI update
        removePost(postId);
        // Also remove from pending posts if it exists there
        setPendingPosts(prev => prev.filter(p => p.id !== postId));
        // refetch kaldırıldı - silinen post cache/race nedeniyle geri geliyordu
      } else {
        // console.error('Failed to delete post:', response.status, response.statusText);
        const errorData = await response.text();
        // console.error('Error details:', errorData);
        alert('Gönderi silinirken bir hata oluştu. Lütfen tekrar deneyin.');
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      // console.error('Error deleting post:', error);
      setShowDeleteConfirm(false);
      alert('Gönderi silinirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setDeletingPostId(null);
      setPendingAction(null);
    }
  };

  const handleHidePost = async (postId) => {
    try {
      // TODO: Implement hide post API call
    } catch (error) {
      // console.error('Error hiding post:', error);
    }
  };

  const handleBlock = async (userIdToBlock) => {
    try {
      // TODO: Implement block user API call
    } catch (error) {
      // console.error('Error blocking user:', error);
    }
  };

  const handleReportPost = async (postId) => {
    try {
      // TODO: Implement report post API call
    } catch (error) {
      // console.error('Error reporting post:', error);
    }
  };

  const handleSavePost = async (postId) => {
    try {
      // TODO: Implement save post API call
    } catch (error) {
      // console.error('Error saving post:', error);
    }
  };

  const handleAddComment = async (postId, commentText) => {
    try {

      // Debug: Check what's in localStorage

      // Get the token from localStorage
      let token = localStorage.getItem('token');

      // If token not found, try next-auth.session-token
      if (!token) {
        token = localStorage.getItem('next-auth.session-token');
      }

      if (!token) {
        // console.error('No authentication token found');
        alert('Yorum eklemek için giriş yapmanız gerekiyor.');
        return;
      }

      // Extract user_id from JWT token
      let userId = null;
      try {
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        userId = decodedPayload.sub;
      } catch (error) {
        // console.error('Error extracting user_id from token:', error);
        alert('Kullanıcı bilgisi alınamadı. Lütfen tekrar giriş yapın.');
        return;
      }

      // Make the POST request to add comment
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/user-post-comments`;
      //   'Authorization': `Bearer ${token.substring(0, 20)}...`,
      //   'Content-Type': 'application/json'
      // });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          post_id: postId,
          user_id: userId,
          content: commentText
        })
      });


      if (response.ok) {

        // Get the response data to get the new comment details
        const newComment = await response.json();
        //   user_name: newComment.user_name,
        //   user_username: newComment.user_username,
        //   user_photo_url: newComment.user_photo_url,
        //   avatar: newComment.avatar
        // });

        // Update the comments state immediately without refetching
        setPostComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), newComment]
        }));

        // Remove refetch to prevent page scroll reset
        // refetch();
      } else {
        // console.error('Failed to add comment:', response.status, response.statusText);
        const errorData = await response.text();
        // console.error('Error details:', errorData);
        alert('Yorum eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      // console.error('Error adding comment:', error);
      alert('Yorum eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleDeleteComment = async (commentId, postId) => {
    try {

      // Get the token from localStorage
      let token = localStorage.getItem('token');

      // If token not found, try next-auth.session-token
      if (!token) {
        token = localStorage.getItem('next-auth.session-token');
      }

      if (!token) {
        // console.error('No authentication token found');
        alert('Yorum silmek için giriş yapmanız gerekiyor.');
        return;
      }

      // Make the DELETE request to remove comment
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/user-post-comments/${commentId}`;
      //   'Authorization': `Bearer ${token.substring(0, 20)}...`,
      //   'Content-Type': 'application/json'
      // });

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });


      if (response.ok) {

        // Update the comments state immediately without refetching
        setPostComments(prev => ({
          ...prev,
          [postId]: (prev[postId] || []).filter(comment => comment.id !== commentId)
        }));

        // Also refetch to ensure consistency
        refetch();
      } else {
        // console.error('Failed to delete comment:', response.status, response.statusText);
        const errorData = await response.text();
        // console.error('Error details:', errorData);
        alert('Yorum silinirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      // console.error('Error deleting comment:', error);
      alert('Yorum silinirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const fetchComments = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // console.error('No authentication token found');
        return [];
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/user-post-comments/post/${postId}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const comments = await response.json();
        return comments;
      } else {
        // console.error('Failed to fetch comments:', response.status, response.statusText);
        return [];
      }
    } catch (error) {
      // console.error('Error fetching comments:', error);
      return [];
    }
  };

  const loadComments = async (postId) => {
    if (postComments[postId] || loadingComments[postId]) return;

    setLoadingComments(prev => ({ ...prev, [postId]: true }));

    try {
      const comments = await fetchComments(postId);
      setPostComments(prev => ({ ...prev, [postId]: comments }));
    } catch (error) {
      // console.error('Error loading comments for post:', postId, error);
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleEditPost = async (postId) => {
    // Find the post data
    const post = timelinePosts.find(p => p.id === postId);
    if (post) {
      setEditingPost({
        id: post.id,
        title: post.title || '',
        content: post.content || ''
      });
      setShowEditModal(true);
    }
  };

  const handleUpdatePost = async (postData) => {
    if (!editingPost) return;

    setIsEditing(true);

    try {

      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        // console.error('No authentication token found');
        return;
      }

      // Make the PUT request to update the post
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/user-posts/${editingPost.id}`;
      //   'Authorization': `Bearer ${token.substring(0, 20)}...`,
      //   'Content-Type': 'application/json'
      // });

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: postData.title,
          content: postData.content
        })
      });


      if (response.ok) {
        const updatedPost = await response.json();

        // Eğer post onay bekliyorsa timeline'dan kaldır ve pending listesine ekle
        if (updatedPost.status === 'pending') {
          removePost(editingPost.id);

          // Post verisini pending posts formatına çevir
          const pendingPost = {
            id: updatedPost.id,
            user_id: updatedPost.user_id,
            content: updatedPost.content,
            title: updatedPost.title || null,
            image_url: updatedPost.image_url || null,
            video_url: updatedPost.video_url || null,
            status: 'pending',
            created_at: updatedPost.created_at || new Date().toISOString(),
            timeAgo: 'Şimdi',
            user_name: updatedPost.user_name || timelinePosts.find(p => p.id === editingPost.id)?.user_name || 'Sen',
            user_username: updatedPost.user_username || timelinePosts.find(p => p.id === editingPost.id)?.user_username,
            user_photo_url: updatedPost.user_photo_url || timelinePosts.find(p => p.id === editingPost.id)?.user_photo_url,
          };

          // Pending posts listesine ekle (duplicate kontrolü ile)
          setPendingPosts(prev => {
            const exists = prev.some(p => p.id === pendingPost.id);
            if (exists) {
              return prev.map(p => p.id === pendingPost.id ? pendingPost : p);
            }
            return [pendingPost, ...prev];
          });

          showNotification({
            title: t('common.success'),
            message: t('feed.postPendingApproval'),
            variant: 'success',
            delay: 3000
          });
        } else {
          // Eğer onay gerektirmiyorsa (approved ise) timeline'ı yenile
          refetch();
          showNotification({
            title: t('common.success'),
            message: t('feed.postSuccess'),
            variant: 'success',
            delay: 3000
          });
        }

        // Close modal
        setShowEditModal(false);
        setEditingPost(null);
      } else {
        const errorData = await response.text();
        alert('Gönderi güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      alert('Gönderi güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsEditing(false);
    }
  };

  // Debug information removed — comments now load lazily via onLoadComments prop

  // Validate that userId is provided
  if (!userId) {
    return (
      <div className="text-center py-4">
        <div className="mb-3">
          <BsPersonX size={48} className="text-muted" />
        </div>
        <h6 className="text-muted">User ID Required</h6>
        <p className="text-muted mb-0">
          Please provide a valid user ID to view timeline posts.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="feed-loading-inline">
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">{t('common.loading')}</span>
        </div>
        <p>{t('feed.loadingTimeline')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h6 className="alert-heading">Hata!</h6>
        <p className="mb-0">Timeline gönderileri yüklenirken bir hata oluştu: {error}</p>
        <hr />
        <div className="mb-3">
          <small className="text-muted">
            <strong>Debug Info:</strong><br />
            API URL: {process.env.NEXT_PUBLIC_API_URL || 'Not configured'}<br />
            User ID: {userId}<br />
            Environment: {process.env.NODE_ENV}
          </small>
        </div>
        <button
          className="btn btn-outline-danger btn-sm me-2"
          onClick={refetch}
        >
          Tekrar Dene
        </button>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => window.location.reload()}
        >
          Sayfayı Yenile
        </button>
      </div>
    );
  }

  return <>
    {/* Custom Confirmation Dialogs */}
    <CustomConfirmDialog
      show={showUnfollowConfirm}
      onConfirm={executeUnfollow}
      onCancel={() => {
        setShowUnfollowConfirm(false);
        setPendingAction(null);
      }}
      title="Takipten Çık"
      message="Bu kullanıcıyı takipten çıkarmak istediğinizden emin misiniz?"
      confirmText="Evet, Çıkar"
      cancelText="İptal"
      type="warning"
    />

    <CustomConfirmDialog
      show={showDeleteConfirm}
      onConfirm={executeDeletePost}
      onCancel={() => {
        setShowDeleteConfirm(false);
        setPendingAction(null);
      }}
      title={t('post.deleteTitle')}
      message={t('post.deleteMessage')}
      confirmText={t('post.deleteConfirm')}
      cancelText={t('post.deleteCancel')}
      type="danger"
    />

    {/* Edit Post Modal */}
    <EditPostModal
      show={showEditModal}
      postData={editingPost}
      isEditing={isEditing}
      onSave={handleUpdatePost}
      onCancel={() => {
        setShowEditModal(false);
        setEditingPost(null);
      }}
    />

    <div className="feed-timeline">
      <div className="feed-timeline-header">
        <h6>{t('menu.feed')}</h6>
      </div>

    {/* User's Own Pending Posts (shown dimmed) */}
    {pendingPosts && pendingPosts.length > 0 && (
      pendingPosts.map((post) => {
        return (
          <div key={`pending-${post.id}`} className="feed-timeline-item feed-pending-post">
            <PostCard
              postId={post.id}
              createdAt={post.created_at}
              timeAgo={post.timeAgo}
              caption={post.content}
              title={post.title}
              image={post.image_url}
              video={post.video_url}
              fileUrls={[]}
              socialUser={{
                id: post.user_id,
                name: post.user_name || `User ${post.user_id}`,
                username: post.user_username,
                avatar: post.user_photo_url
              }}
              likesCount={0}
              commentsCount={0}
              isUserPost={true}
              isOwnPost={true}
              status="pending"
              onDeletePost={(postId) => handleDeletePost(postId)}
              onEditPost={(postId) => handleEditPost(postId)}
              isDeleting={deletingPostId === post.id}
              onHidePost={() => handleHidePost(post.id)}
              onBlock={null}
              onReportPost={null}
              onSavePost={null}
              onAddComment={null}
              onDeleteComment={null}
              comments={[]}
              onLoadComments={() => { }}
              isSharedPost={false}
            />
          </div>
        );
      })
    )}

    {/* Timeline Posts from API */}
    {timelinePosts && timelinePosts.length > 0 ? (
      timelinePosts.map((post, idx) => {
        // Check if this is a shared profile post
        if (post.shared_profile_type && post.shared_profile_id) {
          return (
            <SharedProfileCard
              key={`shared-profile-${post.id}`}
              postId={post.id}
              userId={post.user_id}
              userName={post.user_name || `User ${post.user_id}`}
              userAvatar={post.user_photo_url}
              timeAgo={post.timeAgo}
              sharedProfileType={post.shared_profile_type}
              sharedProfileId={post.shared_profile_id}
              onDeletePost={handleDeleteSharedProfilePost}
            />
          );
        }

        // Check if this is a shared book post
        if (post.type === 'shared_book' && post.shared_book_id) {
          return (
            <SharedBookCard
              key={`shared-book-${post.id}`}
              post={post}
              onDeletePost={handleDeleteSharedBookPost}
            />
          );
        }

        // Check if this is a shared podcast post
        if (post.type === 'shared_podcast' && post.shared_podcast_id) {
          return (
            <SharedPodcastCard
              key={`shared-podcast-${post.id}`}
              post={post}
              onDeletePost={handleDeleteSharedPodcastPost}
              comments={postComments[post.id] || []}
              onLoadComments={() => loadComments(post.id)}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
            />
          );
        }

        // Check if this is a shared story post
        if (post.type === 'shared_story' && post.shared_story_id) {
          return (
            <SharedStoryCard
              key={`shared-story-${post.id}`}
              post={post}
              onDeletePost={handleDeleteSharedStoryPost}
              comments={postComments[post.id] || []}
              onLoadComments={() => loadComments(post.id)}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
            />
          );
        }

        // Check if this is a shared newsletter post
        if (post.type === 'shared_newsletter' && post.shared_newsletter_id) {
          return (
            <SharedNewsletterCard
              key={`shared-newsletter-${post.id}`}
              post={post}
              onDeletePost={handleDeleteSharedNewsletterPost}
              comments={postComments[post.id] || []}
              onLoadComments={() => loadComments(post.id)}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
            />
          );
        }

        // Handle different post types from API
        // User posts have user_id and no scholar_id (type can be 'text', 'image', 'video', or 'user')
        if (post.user_id && !post.scholar_id) {
          // User post - use PostCard component with API user info
          return (
            <PostCard
              key={post.isShared ? `shared-user-${post.id}` : `user-${post.id}`}
              postId={post.id}
              createdAt={post.created_at}
              timeAgo={post.timeAgo}
              caption={post.content}
              title={post.title}
              image={post.image_url}
              video={post.video_url}
              fileUrls={post.fileUrls || []}
              socialUser={{
                id: post.user_id,
                name: post.user_name || `User ${post.user_id}`,
                username: post.user_username,
                avatar: post.user_photo_url,
                role: post.user_role || 'user'
              }}
              likesCount={0}
              commentsCount={0}
              isUserPost={true} // Add flag to identify user posts
              isOwnPost={post.ownPost || false}
              status={post.status || null}
              onUnfollow={() => {
                handleUnfollow(post.user_id, 'user');
              }}
              onDeletePost={(postId) => handleDeletePost(postId)}
              onEditPost={(postId) => handleEditPost(postId)}
              isDeleting={deletingPostId === post.id}
              onHidePost={() => handleHidePost(post.id)}
              onBlock={() => handleBlock(post.user_id)}
              onReportPost={() => handleReportPost(post.id)}
              onSavePost={() => handleSavePost(post.id)}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
              comments={postComments[post.id] || []}
              onLoadComments={() => loadComments(post.id)}
              // Shared post props
              isSharedPost={post.isShared || false}
              originalUser={post.shared_by_user || post.original_user || null}
              sharedAt={post.shared_at || null}
            />
          );
        } else if (post.scholar_id || post.type === 'scholar') {
          // Scholar posts have scholar_id (type is usually 'scholar')
          // Manuel seçim varsa onu kullan, yoksa global dil seç, yoksa Türkçe, yoksa ilk mevcut
          const currentLanguage = selectedLanguages[post.id] || locale || 'tr';
          const currentTranslation = post.translations?.find(t => t.language === currentLanguage)
            || post.translations?.find(t => t.language === 'tr')
            || post.translations?.[0];

          // Scholar post - use PostCard component with scholar info
          return (
            <PostCard
              key={post.isShared ? `shared-scholar-${post.id}` : `scholar-${post.id}`}
              postId={post.id}
              createdAt={post.created_at}
              timeAgo={post.timeAgo}
              caption={currentTranslation?.content || post.content}
              title={post.title}
              image={post.image_url}
              video={post.video_url}
              fileUrls={currentTranslation?.fileUrls || post.fileUrls || []}
              socialUser={{
                id: post.scholar_id,
                name: post.scholar_name || `Scholar ${post.scholar_id}`,
                fullName: post.scholar_name || `Scholar ${post.scholar_id}`,
                photoUrl: post.scholar_photo_url,
                avatar: post.scholar_photo_url
              }}
              likesCount={0}
              commentsCount={0}
              isUserPost={false} // Scholar posts cannot have comments
              isOwnPost={post.ownPost || false}
              onUnfollow={() => {
                handleUnfollow(post.scholar_id, 'scholar');
              }}
              onDeletePost={(postId) => handleDeletePost(postId)}
              onEditPost={(postId) => handleEditPost(postId)}
              isDeleting={deletingPostId === post.id}
              onHidePost={() => handleHidePost(post.id)}
              onBlock={() => handleBlock(post.scholar_id)}
              onReportPost={() => handleReportPost(post.id)}
              onSavePost={() => handleSavePost(post.id)}
              translations={post.translations}
              onLanguageChange={(lang) => setSelectedLanguages(prev => ({ ...prev, [post.id]: lang }))}
              onAddComment={null}
              onDeleteComment={null}
              comments={[]}
              onLoadComments={() => { }}
              // Shared post props
              isSharedPost={post.isShared || false}
              originalUser={post.isShared ? post.shared_by_user : null}
              sharedAt={post.shared_at || null}
            />
          );
        }
        return null;
      })
    ) : (
      <div className="feed-state-card">
        <div className="feed-state-icon">📭</div>
        <h6>{t('feed.noPostsFound')}</h6>
        <p>{t('feed.noPostsDescription')}</p>
      </div>
    )}
    
    {/* Infinite Scroll Trigger & Loading More Spinner */}
    <div id="infinite-scroll-trigger" className="text-center py-2" style={{ minHeight: '40px' }}>
      {loadingMore && (
        <div className="spinner-border text-primary spinner-border-sm" role="status">
          <span className="visually-hidden">{t('common.loading')}</span>
        </div>
      )}
      {!hasMore && timelinePosts && timelinePosts.length > 0 && (
        <div className="feed-end-marker">{t('feed.noMorePosts')}</div>
      )}
    </div>
    </div>
  </>;
};
export default Feeds;