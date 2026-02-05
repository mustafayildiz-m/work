import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RefreshCw, Eye, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/common/container';
import { Helmet } from 'react-helmet-async';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const PostOnaylama = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const fetchPendingPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Giriş yapmanız gerekiyor');
        setLoading(false);
        return;
      }
      const response = await fetch(`${API_URL}/user-posts/admin/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
          // Redirect to login
          window.location.href = '/auth/signin';
          return;
        }
        const errorData = await response.json().catch(() => ({ message: 'Postlar yüklenemedi' }));
        throw new Error(errorData.message || 'Postlar yüklenemedi');
      }

      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Postlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPosts();
  }, []);

  const handleApprove = async (postId) => {
    try {
      setProcessingId(postId);
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Giriş yapmanız gerekiyor');
        setProcessingId(null);
        return;
      }
      const response = await fetch(`${API_URL}/user-posts/admin/${postId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
          window.location.href = '/auth/signin';
          return;
        }
        const errorData = await response.json().catch(() => ({ message: 'Post onaylanamadı' }));
        throw new Error(errorData.message || 'Post onaylanamadı');
      }

      toast.success('Post onaylandı');
      window.dispatchEvent(new Event('pendingPostsUpdated'));
      await fetchPendingPosts();
      if (selectedPost?.id === postId) {
        setIsModalOpen(false);
        setSelectedPost(null);
      }
    } catch (error) {
      console.error('Error approving post:', error);
      toast.error('Post onaylanırken bir hata oluştu');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (postId) => {
    try {
      setProcessingId(postId);
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Giriş yapmanız gerekiyor');
        setProcessingId(null);
        return;
      }
      const response = await fetch(`${API_URL}/user-posts/admin/${postId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
          window.location.href = '/auth/signin';
          return;
        }
        const errorData = await response.json().catch(() => ({ message: 'Post reddedilemedi' }));
        throw new Error(errorData.message || 'Post reddedilemedi');
      }

      toast.success('Post reddedildi');
      window.dispatchEvent(new Event('pendingPostsUpdated'));
      await fetchPendingPosts();
      if (selectedPost?.id === postId) {
        setIsModalOpen(false);
        setSelectedPost(null);
      }
    } catch (error) {
      console.error('Error rejecting post:', error);
      toast.error('Post reddedilirken bir hata oluştu');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  const getVideoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  return (
    <>
      <Helmet>
        <title>Onay Bekleyen Postlar - Islamic Windows Admin</title>
      </Helmet>

      <Container>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Onay Bekleyen Postlar
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Kullanıcılar tarafından paylaşılan postları inceleyin ve onaylayın
              </p>
            </div>
            <button
              onClick={fetchPendingPosts}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : posts.length === 0 ? (
            <Card className="p-12 text-center">
              <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Onay Bekleyen Post Yok
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Şu anda onay bekleyen post bulunmamaktadır.
              </p>
            </Card>
          ) : (
            <div className="grid gap-6">
              {posts.map((post) => (
                <Card key={post.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {post.user?.photoUrl ? (
                        <img
                          src={getImageUrl(post.user.photoUrl)}
                          alt={post.user.firstName || 'User'}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-gray-600 dark:text-gray-400 font-semibold">
                            {post.user?.firstName?.[0] || 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {post.user?.firstName} {post.user?.lastName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            @{post.user?.username || 'kullanici'}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(post.created_at)}
                        </span>
                      </div>

                      {post.title && (
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          {post.title}
                        </h4>
                      )}

                      <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                        {post.content}
                      </p>

                      {post.image_url && (
                        <div className="mb-4">
                          <img
                            src={getImageUrl(post.image_url)}
                            alt="Post image"
                            className="max-w-full h-auto rounded-lg cursor-pointer"
                            onClick={() => {
                              setSelectedPost(post);
                              setIsModalOpen(true);
                            }}
                          />
                        </div>
                      )}

                      {post.video_url && (
                        <div className="mb-4">
                          <video
                            src={getVideoUrl(post.video_url)}
                            controls
                            className="max-w-full h-auto rounded-lg"
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => handleApprove(post.id)}
                          disabled={processingId === post.id}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {processingId === post.id ? 'Onaylanıyor...' : 'Onayla'}
                        </button>
                        <button
                          onClick={() => handleReject(post.id)}
                          disabled={processingId === post.id}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          {processingId === post.id ? 'Reddediliyor...' : 'Reddet'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPost(post);
                            setIsModalOpen(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Detaylı İncele
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Modal */}
          {isModalOpen && selectedPost && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Post Detayları
                    </h2>
                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        setSelectedPost(null);
                      }}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      {selectedPost.user?.photoUrl ? (
                        <img
                          src={getImageUrl(selectedPost.user.photoUrl)}
                          alt={selectedPost.user.firstName || 'User'}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-gray-600 dark:text-gray-400 font-semibold text-xl">
                            {selectedPost.user?.firstName?.[0] || 'U'}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {selectedPost.user?.firstName} {selectedPost.user?.lastName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          @{selectedPost.user?.username || 'kullanici'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(selectedPost.created_at)}
                        </p>
                      </div>
                    </div>

                    {selectedPost.title && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          Başlık
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300">{selectedPost.title}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        İçerik
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {selectedPost.content}
                      </p>
                    </div>

                    {selectedPost.image_url && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          Resim
                        </h4>
                        <img
                          src={getImageUrl(selectedPost.image_url)}
                          alt="Post image"
                          className="max-w-full h-auto rounded-lg"
                        />
                      </div>
                    )}

                    {selectedPost.video_url && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          Video
                        </h4>
                        <video
                          src={getVideoUrl(selectedPost.video_url)}
                          controls
                          className="max-w-full h-auto rounded-lg"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleApprove(selectedPost.id)}
                        disabled={processingId === selectedPost.id}
                        className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {processingId === selectedPost.id ? 'Onaylanıyor...' : 'Onayla'}
                      </button>
                      <button
                        onClick={() => handleReject(selectedPost.id)}
                        disabled={processingId === selectedPost.id}
                        className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        {processingId === selectedPost.id ? 'Reddediliyor...' : 'Reddet'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </>
  );
};

export default PostOnaylama;

