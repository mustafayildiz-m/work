'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardBody, Col, Container, Row } from 'react-bootstrap';
import Image from 'next/image';
import avatar7 from '@/assets/images/avatar/07.jpg';
import { BsHandThumbsUpFill, BsShare, BsEye, BsDownload, BsX } from 'react-icons/bs';
import CreatePostCard from '@/components/cards/CreatePostCard';
import PostCard from '@/components/cards/PostCard';
import SharedBookCard from '@/components/cards/SharedBookCard';
import SharedArticleCard from '@/components/cards/SharedArticleCard';
import SharedProfileCard from '@/components/cards/SharedProfileCard';
import CustomConfirmDialog from '@/components/CustomConfirmDialog';
import EditPostModal from '@/components/EditPostModal';
import { useLanguage } from '@/context/useLanguageContext';

const UserFeedPage = () => {
  const { t } = useLanguage();
  const params = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  // State for delete operation
  const [deletingPostId, setDeletingPostId] = useState(null);

  // State for custom confirmation dialogs
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // State for edit post modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // State for comments
  const [postComments, setPostComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});

  // State for user info
  const [userInfo, setUserInfo] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const fetchUserInfo = async () => {
    try {
      const userId = params.id;
      if (userId) {
        const token = localStorage.getItem('token');

        // Kullanıcı bilgilerini çek
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserInfo(userData);
        } else {
          // console.error('User info not found');
        }
      }
    } catch (error) {
      // console.error('Error fetching user info:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const userId = params.id;
      if (userId) {
        const token = localStorage.getItem('token');

        // Sadece bu kullanıcının post'larını çek (user endpoint, timeline değil, sadece kendi post'ları, başka kullanıcıların post'ları yok, sadece kendi gönderileri, resim ve video dahil, sadece kendi paylaştığı içerikler)
        const postsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-posts/user/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          if (process.env.NODE_ENV === 'development') {
          }
          setPosts(postsData);
        } else {
          // console.error('Posts not found');
        }
      }
    } catch (error) {
      // console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userId = params.id;
        if (userId) {
          const token = localStorage.getItem('token');

          // Check if this is the current user's profile
          try {
            const payload = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payload));
            const currentUserIdFromToken = decodedPayload.sub;
            setCurrentUserId(currentUserIdFromToken);
            setIsCurrentUser(currentUserIdFromToken === userId || currentUserIdFromToken.toString() === userId);
          } catch (error) {
            // console.error('Error checking current user:', error);
          }

          await Promise.all([fetchUserInfo(), fetchPosts()]);
        }
      } catch (error) {
        // console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Listen for post creation event
    const handlePostCreated = () => {
      fetchPosts();
    };

    window.addEventListener('postCreated', handlePostCreated);

    // Cleanup
    return () => {
      window.removeEventListener('postCreated', handlePostCreated);
    };
  }, [params.id]);

  // Load comments for posts
  useEffect(() => {
    if (posts && posts.length > 0) {
      posts.forEach(post => {
        // Sadece bu kullanıcının post'ları için comment yükleme (user endpoint, timeline değil, sadece kendi post'ları, başka kullanıcıların post'ları yok, sadece kendi gönderileri, resim ve video dahil, sadece kendi paylaştığı içerikler)
        loadComments(post.id);
      });
    }
  }, [posts]);

  // Helper function to get proper image URL
  const getImageUrl = (photoUrl) => {
    if (!photoUrl) return avatar7.src || avatar7;
    if (photoUrl.startsWith('/uploads/')) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      return `${apiBaseUrl}${photoUrl}`;
    }
    return photoUrl;
  };

  // Helper function to get file URL
  const getFileUrl = (fileUrl) => {
    if (!fileUrl) return '';
    if (fileUrl.startsWith('http')) return fileUrl;
    return `${process.env.NEXT_PUBLIC_API_URL}${fileUrl}`;
  };

  // Handler functions for post actions
  const handleUnfollow = async (userIdToUnfollow, userType = 'user') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/unfollow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userIdToUnfollow,
          userType
        })
      });

      if (response.ok) {
        // Refresh posts after unfollow
        fetchPosts();
        if (process.env.NODE_ENV === 'development') {
        }
      } else {
        // console.error('Failed to unfollow user');
      }
    } catch (error) {
      // console.error('Error unfollowing user:', error);
    }
  };

  const handleHidePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-posts/hide/${postId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Remove hidden post from local state
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        if (process.env.NODE_ENV === 'development') {
        }
      } else {
        // console.error('Failed to hide post');
      }
    } catch (error) {
      // console.error('Error hiding post:', error);
    }
  };

  const handleBlock = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/block`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        // Remove blocked user's posts from local state
        setPosts(prevPosts => prevPosts.filter(post => post.user_id !== userId && post.userId !== userId));
        if (process.env.NODE_ENV === 'development') {
        }
      } else {
        // console.error('Failed to block user');
      }
    } catch (error) {
      // console.error('Error blocking user:', error);
    }
  };

  const handleReportPost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-posts/report/${postId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: 'Inappropriate content',
          description: 'Post reported by user'
        })
      });

      if (response.ok) {
        if (process.env.NODE_ENV === 'development') {
        }
        // Show success message to user
        alert('Gönderi başarıyla rapor edildi.');
      } else {
        // console.error('Failed to report post');
        alert('Gönderi rapor edilemedi. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      // console.error('Error reporting post:', error);
      alert('Gönderi rapor edilirken hata oluştu.');
    }
  };

  const handleSavePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-posts/save/${postId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        if (process.env.NODE_ENV === 'development') {
        }
        // Show success message to user
        alert('Gönderi başarıyla kaydedildi.');
      } else {
        // console.error('Failed to save post');
        alert('Gönderi kaydedilemedi. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      // console.error('Error saving post:', error);
      alert('Gönderi kaydedilirken hata oluştu.');
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
        // Refresh posts to remove deleted post
        fetchPosts();
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

  const handleEditPost = async (postId) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (post) {
        setEditingPost(post);
        setShowEditModal(true);
      }
    } catch (error) {
      // console.error('Error editing post:', error);
    }
  };

  const handleUpdatePost = async (postData) => {
    if (!editingPost) return;

    setIsEditing(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/user-posts/${editingPost.id}`, {
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
        setShowEditModal(false);
        setEditingPost(null);
        // Refresh posts
        fetchPosts();

        alert('Gönderi başarıyla güncellendi.');
      } else {
        alert('Gönderi güncellenirken bir hata oluştu.');
      }
    } catch (error) {
      alert('Gönderi güncellenirken hata oluştu.');
    } finally {
      setIsEditing(false);
    }
  };

  const handleAddComment = async (postId, commentText) => {
    try {

      // Get the token from localStorage
      let token = localStorage.getItem('token');

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

        // Update the comments state immediately without refetching
        setPostComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), newComment]
        }));
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

      if (!token) {
        // console.error('No authentication token found');
        alert('Yorum silmek için giriş yapmanız gerekiyor.');
        return;
      }

      // Make the DELETE request to remove comment
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/user-post-comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {

        // Update the comments state to remove the deleted comment
        setPostComments(prev => ({
          ...prev,
          [postId]: (prev[postId] || []).filter(comment => comment.id !== commentId)
        }));
      } else {
        // console.error('Failed to delete comment:', response.status, response.statusText);
        alert('Yorum silinirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      // console.error('Error deleting comment:', error);
      alert('Yorum silinirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const loadComments = async (postId) => {
    try {
      if (loadingComments[postId]) return;

      setLoadingComments(prev => ({ ...prev, [postId]: true }));

      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/user-post-comments/post/${postId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const comments = await response.json();
        setPostComments(prev => ({ ...prev, [postId]: comments }));
      } else {
        // console.error('Failed to load comments for post:', postId);
      }
    } catch (error) {
      // console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Gönderiler yükleniyor...</p>
      </div>
    );
  }

  return (
    <>
      {/* Custom Confirmation Dialogs */}
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

      {/* Show CreatePostCard only for current user */}
      {isCurrentUser && (
        <div className="mb-4" style={{ marginTop: '1rem' }}>
          <CreatePostCard />
        </div>
      )}

      {posts && posts.length > 0 ? (
        posts.map((post, index) => {
          // Check if this is a shared profile post
          if (post.shared_profile_type && post.shared_profile_id) {
            return (
              <SharedProfileCard
                key={`shared-profile-${post.id}`}
                postId={post.id}
                userId={post.user_id || post.userId}
                userName={userInfo?.firstName && userInfo?.lastName
                  ? `${userInfo.firstName} ${userInfo.lastName}`
                  : userInfo?.fullName || userInfo?.username || `Kullanıcı ${params.id}`}
                userAvatar={userInfo?.photoUrl || avatar7}
                timeAgo={post.time_ago || post.timeAgo}
                sharedProfileType={post.shared_profile_type}
                sharedProfileId={post.shared_profile_id}
                onDeletePost={isCurrentUser && (post.user_id === currentUserId || post.userId === currentUserId) ? (postId) => handleDeletePost(postId) : null}
              />
            );
          }

          // Check if this is a shared book post
          if (post.type === 'shared_book' && post.shared_book_id) {
            return (
              <SharedBookCard
                key={`shared-book-${post.id}`}
                post={post}
                onDeletePost={isCurrentUser && (post.user_id === currentUserId || post.userId === currentUserId) ? (postId) => handleDeletePost(postId) : null}
              />
            );
          }

          // Check if this is a shared article post
          if (post.type === 'shared_article' && post.shared_article_id) {
            return (
              <SharedArticleCard
                key={`shared-article-${post.id}`}
                post={post}
                onDeletePost={isCurrentUser && (post.user_id === currentUserId || post.userId === currentUserId) ? (postId) => handleDeletePost(postId) : null}
              />
            );
          }

          // Sadece bu kullanıcının post'ları (user endpoint'inden geliyor, timeline değil, sadece kendi post'ları, başka kullanıcıların post'ları yok, sadece kendi gönderileri, resim ve video dahil, sadece kendi paylaştığı içerikler, sadece kendi profilinde görünen içerikler)
          if (post.type === 'user' || post.type === 'text' || !post.type) {
            const isSharedPost = post.isShared;

            // Post yazarı (Orijinal post ise yazar, shared post ise orijinal yazar)
            const postAuthor = {
              id: post.user_id || post.userId || params.id,
              name: post.user_name || (userInfo?.firstName && userInfo?.lastName
                ? `${userInfo.firstName} ${userInfo.lastName}`
                : userInfo?.fullName || userInfo?.username || `Kullanıcı ${params.id}`),
              username: post.user_username || userInfo?.username,
              avatar: post.user_photo_url || userInfo?.photoUrl || avatar7,
              role: post.user_role || userInfo?.role || 'user'
            };

            return (
              <PostCard
                key={`user-${post.id}-${isSharedPost ? 'shared' : 'original'}`}
                postId={post.id}
                createdAt={post.created_at || post.createdAt}
                timeAgo={post.time_ago || post.timeAgo}
                caption={post.content || post.caption}
                title={post.title || post.title}
                image={post.image_url || post.imageUrl}
                video={post.video_url || post.videoUrl}
                fileUrls={post.file_urls || post.fileUrls || []}
                socialUser={postAuthor}
                likesCount={post.likes_count || post.likesCount || 0}
                commentsCount={post.comments_count || post.commentsCount || 0}
                isUserPost={true}
                isOwnPost={!isSharedPost && isCurrentUser && (post.user_id === currentUserId || post.userId === currentUserId)}
                status={post.status || null}
                onUnfollow={isCurrentUser && (post.user_id === currentUserId || post.userId === currentUserId) ? null : () => handleUnfollow(post.user_id || post.userId, 'user')}
                onDeletePost={isCurrentUser && (post.user_id === currentUserId || post.userId === currentUserId) ? (postId) => handleDeletePost(postId) : null}
                onEditPost={isCurrentUser && (post.user_id === currentUserId || post.userId === currentUserId) ? (postId) => handleEditPost(postId) : null}
                isDeleting={deletingPostId === post.id}
                onHidePost={() => handleHidePost(post.id)}
                onBlock={() => handleBlock(post.user_id || post.userId)}
                onReportPost={() => handleReportPost(post.id)}
                onSavePost={() => handleSavePost(post.id)}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
                comments={postComments[post.id] || []}
                onLoadComments={() => loadComments(post.id)}
                isSharedPost={isSharedPost}
                originalUser={isSharedPost ? userInfo : null}
              />
            );
          }
          return null;
        })
      ) : (
        <Card>
          <CardBody className="text-center py-5">
            <h4>Henüz Gönderi Yok</h4>
            <p className="text-muted">
              {isCurrentUser
                ? 'Henüz hiç gönderi paylaşmadınız. İlk gönderinizi paylaşmak için yukarıdaki formu kullanın.'
                : 'Bu kullanıcı henüz hiç gönderi paylaşmamış.'
              }
            </p>
          </CardBody>
        </Card>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center"
          style={{ zIndex: 1050 }}
          onClick={() => setSelectedImage(null)}
        >
          <div className="position-relative">
            <Image
              src={selectedImage}
              alt="Full size image"
              width={800}
              height={600}
              className="img-fluid"
            />
            <button
              className="btn btn-light position-absolute top-0 end-0 m-2"
              onClick={() => setSelectedImage(null)}
            >
              <BsX />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UserFeedPage;
