'use client';

import Image from 'next/image';
import { Card, CardBody, CardFooter, CardHeader, Dropdown, DropdownDivider, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap';
import { BsBookmark, BsBookmarkCheck, BsBookmarkFill, BsChatFill, BsEnvelope, BsFlag, BsHeart, BsHeartFill, BsLink, BsPencilSquare, BsPersonX, BsReplyFill, BsSendFill, BsShare, BsSlashCircle, BsThreeDots, BsXCircle } from 'react-icons/bs';
import logo13 from '@/assets/images/logo/13.svg';
import PostCard from '@/components/cards/PostCard';
import CustomConfirmDialog from '@/components/CustomConfirmDialog';
import EditPostModal from '@/components/EditPostModal';
import { useTimelinePosts } from '@/hooks/useTimelinePosts';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/useLanguageContext';

// ActionMenu is now handled by PostCard component

/**
 * Posts Component - Displays timeline posts from followed users and scholars
 * 
 * @param {Object} props - Component props
 * @param {number} props.userId - The user ID to fetch timeline posts for (defaults to current user)
 * @param {boolean} props.showOwnPosts - Whether to show user's own posts instead of timeline (defaults to false)
 * 
 * @example
 * // Basic usage with default user ID
 * <Posts />
 * 
 * // With specific user ID
 * <Posts userId={123} />
 * 
 * // Show user's own posts
 * <Posts showOwnPosts={true} />
 * 
 * @returns {JSX.Element} Rendered posts component
 */
const Posts = ({ userId, showOwnPosts = false }) => {
  const { t, locale } = useLanguage();
  const [ownPosts, setOwnPosts] = useState([]);
  const [ownPostsLoading, setOwnPostsLoading] = useState(false);
  const [ownPostsError, setOwnPostsError] = useState(null);

  const { posts: timelinePosts, loading, error, refetch } = useTimelinePosts(userId);

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

  // State for language selection per post
  const [selectedLanguages, setSelectedLanguages] = useState({});

  // Global dil değiştiğinde tüm post dillerini sıfırla
  useEffect(() => {
    setSelectedLanguages({});
  }, [locale]);

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/user-posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Close the modal first
        setShowDeleteConfirm(false);
        // Refresh timeline to remove deleted post
        refetch();
      } else {
        // console.error('Failed to delete post:', response.status, response.statusText);
        const errorData = await response.text();
        // console.error('Error details:', errorData);
        alert('Gönderiyi silinirken bir hata oluştu. Lütfen tekrar deneyin.');
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      // console.error('Error deleting post:', error);
      setShowDeleteConfirm(false);
      alert('Gönderiyi silinirken bir hata oluştu. Lütfen tekrar deneyin.');
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
      //   post_id: postId,
      //   user_id: userId,
      //   content: commentText
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
    const post = posts.find(p => p.id === postId);
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
        // Close modal and refresh timeline
        setShowEditModal(false);
        setEditingPost(null);
        refetch();
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
  useEffect(() => {
    const fetchOwnPosts = async () => {
      if (!showOwnPosts) return;

      try {
        setOwnPostsLoading(true);
        setOwnPostsError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Kullanıcı girişi yapılmamış');
        }

        // Get current user ID from token if not provided
        let currentUserId = userId;
        if (!currentUserId) {
          const payload = token.split('.')[1];
          const decodedPayload = JSON.parse(atob(payload));
          currentUserId = decodedPayload.sub;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/user-posts/user/${currentUserId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setOwnPosts(data);
        } else {
          throw new Error('Gönderiler yüklenemedi');
        }
      } catch (err) {
        setOwnPostsError(err.message);
      } finally {
        setOwnPostsLoading(false);
      }
    };

    fetchOwnPosts();
  }, [userId, showOwnPosts]);

  // Use own posts if showOwnPosts is true, otherwise use timeline posts
  const posts = showOwnPosts ? ownPosts : timelinePosts;
  const postsLoading = showOwnPosts ? ownPostsLoading : loading;
  const postsError = showOwnPosts ? ownPostsError : error;

  // Debug information and load comments
  useEffect(() => {

    // Load comments only for user posts (not scholar posts)
    if (posts && posts.length > 0) {
      posts.forEach(post => {
        if (post.user_id && !post.scholar_id) {
          loadComments(post.id);
        }
      });
    }
  }, [userId, posts]);

  if (postsLoading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Gönderiler yükleniyor...</span>
        </div>
        <p className="mt-2 text-muted">
          {showOwnPosts ? 'Gönderileriniz yükleniyor...' : 'Takip ettiğiniz kişilerin gönderileri yükleniyor...'}
        </p>
        <small className="text-muted">
          API: {process.env.NEXT_PUBLIC_API_URL || 'Not configured'} | User ID: {userId}
        </small>
      </div>
    );
  }

  if (postsError) {
    return (
      <div className="alert alert-danger" role="alert">
        <h6 className="alert-heading">Hata!</h6>
        <p className="mb-0">Gönderiler yüklenirken bir hata oluştu: {postsError}</p>
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

  if (posts.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="mb-3">
          <BsPersonX size={48} className="text-muted" />
        </div>
        <h6 className="text-muted">
          {showOwnPosts ? 'Henüz gönderi paylaşmadınız' : 'Henüz gönderi bulunmuyor'}
        </h6>
        <p className="text-muted mb-0">
          {showOwnPosts
            ? 'İlk gönderinizi paylaşmak için yukarıdaki formu kullanın.'
            : 'Takip ettiğiniz kişiler henüz gönderi paylaşmamış veya henüz kimseyi takip etmiyorsunuz.'
          }
        </p>
        <small className="text-muted">
          API: {process.env.NEXT_PUBLIC_API_URL || 'Not configured'} | User ID: {userId}
        </small>
      </div>
    );
  }

  return (
    <>
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

      {posts.map((post, idx) => {
        // Handle different post types from API
        if (post.user_id && !post.scholar_id) {
          // User post - use PostCard component
          return (
            <PostCard
              key={`user-${post.id}`}
              postId={post.id}
              createdAt={post.created_at}
              caption={post.content}
              title={post.title}
              image={post.image_url}
              video={post.video_url}
              fileUrls={post.fileUrls || []}
              socialUser={{
                id: post.user_id,
                name: `User ${post.user_id}`, // You might want to fetch user details separately
                avatar: null
              }}
              likesCount={0} // API doesn't provide this yet
              commentsCount={0} // API doesn't provide this yet
              isUserPost={true}
              isOwnPost={post.ownPost || false}
              status={post.status || null}
              onUnfollow={() => handleUnfollow(post.user_id, 'user')}
              onDeletePost={(postId) => handleDeletePost(postId)}
              onEditPost={(postId) => handleEditPost(postId)}
              isDeleting={deletingPostId === post.id}
              onHidePost={() => handleHidePost(post.id)}
              onBlock={() => handleBlock(post.user_id)}
              onReportPost={() => handleReportPost(post.id)}
              onSavePost={() => handleSavePost(post.id)}
              onAddComment={handleAddComment}
              comments={postComments[post.id] || []}
              onLoadComments={() => loadComments(post.id)}
            />
          );
        } else if (post.type === 'scholar') {
          // Manuel seçim varsa onu kullan, yoksa global dil seç, yoksa Türkçe, yoksa ilk mevcut
          const currentLanguage = selectedLanguages[post.id] || locale || 'tr';
          const currentTranslation = post.translations?.find(t => t.language === currentLanguage)
            || post.translations?.find(t => t.language === 'tr')
            || post.translations?.[0];

          // Scholar post - use PostCard component with scholar info
          return (
            <PostCard
              key={`scholar-${post.id}`}
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
                avatar: post.scholar_photo_url
              }}
              likesCount={0}
              commentsCount={0}
              isUserPost={false} // Scholar posts cannot have comments
              isOwnPost={post.ownPost || false}
              onUnfollow={() => handleUnfollow(post.scholar_id, 'scholar')}
              onDeletePost={(postId) => handleDeletePost(postId)}
              onEditPost={(postId) => handleEditPost(postId)}
              isDeleting={deletingPostId === post.id}
              onHidePost={() => handleHidePost(post.id)}
              onBlock={() => handleBlock(post.scholar_id)}
              onReportPost={() => handleReportPost(post.id)}
              onSavePost={() => handleSavePost(post.id)}
              onAddComment={null}
              comments={[]}
              onLoadComments={() => { }}
              translations={post.translations}
              onLanguageChange={(lang) => setSelectedLanguages(prev => ({ ...prev, [post.id]: lang }))}
            />
          );
        }
        return null;
      })}
    </>
  );
};

export default Posts;
