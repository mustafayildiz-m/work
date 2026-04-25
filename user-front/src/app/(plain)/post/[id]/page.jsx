'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardBody, Col, Container, Row, Button, Alert, Spinner } from 'react-bootstrap';
import Image from 'next/image';
import Link from 'next/link';
import avatar7 from '@/assets/images/avatar/07.jpg';
import { BsShare, BsEye, BsDownload, BsX, BsChat, BsPersonPlus, BsArrowLeft } from 'react-icons/bs';
import { useNotificationContext } from '@/context/useNotificationContext';
import { useAuth } from '@/hooks/useAuth';
import { decodePostId, isValidEncodedId } from '@/utils/encoding';

const PublicPostPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const { showNotification } = useNotificationContext();
  const { isAuthenticated, userInfo } = useAuth();

  // Get language and type from URL parameters
  const currentLang = searchParams.get('lang') || 'tr';
  const postTypeParam = searchParams.get('type') || null;

  // Multilingual content
  const translations = {
    tr: {
      backToHome: 'Ana Sayfaya Dön',
      postNotFound: 'Gönderi Bulunamadı',
      postNotFoundDesc: 'Bu gönderi mevcut değil veya silinmiş olabilir.',
      comments: 'Yorumlar',
      commentPlaceholder: 'Yorumunuzu yazın...',
      commentButton: 'Yorum Yap',
      noComments: 'Henüz yorum yapılmamış. İlk yorumu siz yapın!',
      loginToComment: 'Yorum yapmak için giriş yapmanız gerekiyor.',
      signIn: 'Giriş Yap',
      signUp: 'Üye Ol',
      share: 'Paylaş',
      sharing: 'Paylaşılıyor...',
      shared: 'Paylaşıldı',
      platformTitle: 'İslami Topluluk Platformu',
      platformDesc: 'Müslümanların bir araya geldiği, bilgi paylaştığı ve birlikte öğrendiği modern dijital platform',
      islamicContent: 'İslami İçerik',
      islamicContentDesc: 'Alimlerden güncel fetvalar, dersler ve makaleler',
      community: 'Topluluk',
      communityDesc: 'Müslümanlarla sohbet edin ve deneyimlerinizi paylaşın',
      learning: 'Öğrenme',
      learningDesc: 'İslami bilginizi geliştirin ve sorularınızı sorun',
      whyJoin: 'Neden Bize Katılmalısınız?',
      reliableSources: 'Güvenilir İslami kaynaklar',
      expertFatwas: 'Uzman alimlerden fetvalar',
      currentNews: 'Güncel İslami haberler',
      communitySupport: 'Aktif topluluk desteği',
      mobileFriendly: 'Mobil uyumlu tasarım',
      freeMembership: 'Ücretsiz üyelik',
      joinNow: 'Hemen Üye Ol',
      securePlatform: 'Güvenli ve güvenilir platform',
      thousandsMembers: 'Binlerce aktif üye',
      free: 'Ücretsiz'
    },
    ar: {
      backToHome: 'العودة إلى الصفحة الرئيسية',
      postNotFound: 'المنشور غير موجود',
      postNotFoundDesc: 'هذا المنشور غير موجود أو قد تم حذفه.',
      comments: 'التعليقات',
      commentPlaceholder: 'اكتب تعليقك...',
      commentButton: 'أضف تعليق',
      noComments: 'لا توجد تعليقات بعد. كن أول من يعلق!',
      loginToComment: 'يجب عليك تسجيل الدخول للتعليق.',
      signIn: 'تسجيل الدخول',
      signUp: 'إنشاء حساب',
      share: 'مشاركة',
      sharing: 'جاري المشاركة...',
      shared: 'تم المشاركة',
      platformTitle: 'منصة المجتمع الإسلامي',
      platformDesc: 'منصة رقمية حديثة يجتمع فيها المسلمون لتبادل المعرفة والتعلم معاً',
      islamicContent: 'المحتوى الإسلامي',
      islamicContentDesc: 'الفتاوى الحديثة والدروس والمقالات من العلماء',
      community: 'المجتمع',
      communityDesc: 'تحدث مع المسلمين وشارك تجاربك',
      learning: 'التعلم',
      learningDesc: 'طور معرفتك الإسلامية واسأل أسئلتك',
      whyJoin: 'لماذا يجب أن تنضم إلينا؟',
      reliableSources: 'مصادر إسلامية موثوقة',
      expertFatwas: 'فتاوى من علماء متخصصين',
      currentNews: 'أخبار إسلامية حديثة',
      communitySupport: 'دعم مجتمعي نشط',
      mobileFriendly: 'تصميم متوافق مع الهاتف المحمول',
      freeMembership: 'عضوية مجانية',
      joinNow: 'انضم الآن',
      securePlatform: 'منصة آمنة وموثوقة',
      thousandsMembers: 'آلاف الأعضاء النشطين',
      free: 'مجاني'
    },
    en: {
      backToHome: 'Back to Home',
      postNotFound: 'Post Not Found',
      postNotFoundDesc: 'This post does not exist or may have been deleted.',
      comments: 'Comments',
      commentPlaceholder: 'Write your comment...',
      commentButton: 'Comment',
      noComments: 'No comments yet. Be the first to comment!',
      loginToComment: 'You need to sign in to comment.',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      share: 'Share',
      sharing: 'Sharing...',
      shared: 'Shared',
      platformTitle: 'Islamic Community Platform',
      platformDesc: 'A modern digital platform where Muslims gather, share knowledge and learn together',
      islamicContent: 'Islamic Content',
      islamicContentDesc: 'Current fatwas, lessons and articles from scholars',
      community: 'Community',
      communityDesc: 'Chat with Muslims and share your experiences',
      learning: 'Learning',
      learningDesc: 'Develop your Islamic knowledge and ask your questions',
      whyJoin: 'Why Should You Join Us?',
      reliableSources: 'Reliable Islamic sources',
      expertFatwas: 'Fatwas from expert scholars',
      currentNews: 'Current Islamic news',
      communitySupport: 'Active community support',
      mobileFriendly: 'Mobile-friendly design',
      freeMembership: 'Free membership',
      joinNow: 'Join Now',
      securePlatform: 'Secure and reliable platform',
      thousandsMembers: 'Thousands of active members',
      free: 'Free'
    },
    fr: {
      backToHome: 'Retour à l\'accueil',
      postNotFound: 'Publication introuvable',
      postNotFoundDesc: 'Cette publication n\'existe pas ou a été supprimée.',
      comments: 'Commentaires',
      commentPlaceholder: 'Écrivez votre commentaire...',
      commentButton: 'Commenter',
      noComments: 'Aucun commentaire pour le moment. Soyez le premier à commenter !',
      loginToComment: 'Vous devez vous connecter pour commenter.',
      signIn: 'Se connecter',
      signUp: 'S\'inscrire',
      share: 'Partager',
      sharing: 'Partage en cours...',
      shared: 'Partagé',
      platformTitle: 'Plateforme Communautaire Islamique',
      platformDesc: 'Une plateforme numérique moderne où les musulmans se rassemblent, partagent leurs connaissances et apprennent ensemble',
      islamicContent: 'Contenu Islamique',
      islamicContentDesc: 'Fatwas actuelles, leçons et articles d\'érudits',
      community: 'Communauté',
      communityDesc: 'Discutez avec des musulmans et partagez vos expériences',
      learning: 'Apprentissage',
      learningDesc: 'Développez vos connaissances islamiques et posez vos questions',
      whyJoin: 'Pourquoi nous rejoindre ?',
      reliableSources: 'Sources islamiques fiables',
      expertFatwas: 'Fatwas d\'érudits experts',
      currentNews: 'Actualités islamiques',
      communitySupport: 'Support communautaire actif',
      mobileFriendly: 'Design adapté aux mobiles',
      freeMembership: 'Adhésion gratuite',
      joinNow: 'Rejoindre maintenant',
      securePlatform: 'Plateforme sécurisée et fiable',
      thousandsMembers: 'Des milliers de membres actifs',
      free: 'Gratuit'
    },
    de: {
      backToHome: 'Zurück zur Startseite',
      postNotFound: 'Beitrag nicht gefunden',
      postNotFoundDesc: 'Dieser Beitrag existiert nicht oder wurde möglicherweise gelöscht.',
      comments: 'Kommentare',
      commentPlaceholder: 'Schreiben Sie Ihren Kommentar...',
      commentButton: 'Kommentieren',
      noComments: 'Noch keine Kommentare. Seien Sie der Erste, der kommentiert!',
      loginToComment: 'Sie müssen sich anmelden, um zu kommentieren.',
      signIn: 'Anmelden',
      signUp: 'Registrieren',
      share: 'Teilen',
      sharing: 'Wird geteilt...',
      shared: 'Geteilt',
      platformTitle: 'Islamische Gemeinschaftsplattform',
      platformDesc: 'Eine moderne digitale Plattform, auf der sich Muslime versammeln, Wissen teilen und gemeinsam lernen',
      islamicContent: 'Islamischer Inhalt',
      islamicContentDesc: 'Aktuelle Fatwas, Lektionen und Artikel von Gelehrten',
      community: 'Gemeinschaft',
      communityDesc: 'Chatten Sie mit Muslimen und teilen Sie Ihre Erfahrungen',
      learning: 'Lernen',
      learningDesc: 'Entwickeln Sie Ihr islamisches Wissen und stellen Sie Ihre Fragen',
      whyJoin: 'Warum sollten Sie uns beitreten?',
      reliableSources: 'Zuverlässige islamische Quellen',
      expertFatwas: 'Fatwas von Expertengelehrten',
      currentNews: 'Aktuelle islamische Nachrichten',
      communitySupport: 'Aktive Gemeinschaftsunterstützung',
      mobileFriendly: 'Mobilfreundliches Design',
      freeMembership: 'Kostenlose Mitgliedschaft',
      joinNow: 'Jetzt beitreten',
      securePlatform: 'Sichere und zuverlässige Plattform',
      thousandsMembers: 'Tausende aktive Mitglieder',
      free: 'Kostenlos'
    },
    ja: {
      backToHome: 'ホームに戻る',
      postNotFound: '投稿が見つかりません',
      postNotFoundDesc: 'この投稿は存在しないか、削除された可能性があります。',
      comments: 'コメント',
      commentPlaceholder: 'コメントを書いてください...',
      commentButton: 'コメントする',
      noComments: 'まだコメントがありません。最初のコメントを書いてください！',
      loginToComment: 'コメントするにはログインが必要です。',
      signIn: 'ログイン',
      signUp: '登録',
      share: 'シェア',
      platformTitle: 'イスラムコミュニティプラットフォーム',
      platformDesc: 'ムスリムが集まり、知識を共有し、共に学ぶ現代的なデジタルプラットフォーム',
      islamicContent: 'イスラムコンテンツ',
      islamicContentDesc: '学者からの最新のファトワ、レッスン、記事',
      community: 'コミュニティ',
      communityDesc: 'ムスリムとチャットし、経験を共有しましょう',
      learning: '学習',
      learningDesc: 'イスラム知識を向上させ、質問をしてください',
      whyJoin: 'なぜ私たちに参加すべきですか？',
      reliableSources: '信頼できるイスラム情報源',
      expertFatwas: '専門学者からのファトワ',
      currentNews: '最新のイスラムニュース',
      communitySupport: 'アクティブなコミュニティサポート',
      mobileFriendly: 'モバイル対応デザイン',
      freeMembership: '無料会員登録',
      joinNow: '今すぐ参加',
      securePlatform: '安全で信頼できるプラットフォーム',
      thousandsMembers: '何千ものアクティブメンバー',
      free: '無料'
    }
  };

  const t = translations[currentLang] || translations.tr;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [sharingPosts, setSharingPosts] = useState(new Set());
  const [sharedPosts, setSharedPosts] = useState(new Set());
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        // Decode the post ID from the URL parameter
        const encodedId = params.id;
        let postId = encodedId;

        // First, URL decode the parameter (in case it's URL encoded)
        const urlDecodedId = decodeURIComponent(encodedId);

        // Check if it's an encoded ID and decode it
        if (isValidEncodedId(urlDecodedId)) {
          postId = decodePostId(urlDecodedId);
        }

        // Determine which endpoint to use based on type parameter
        let postData = null;
        let postType = 'user';

        if (postTypeParam === '1') {
          // Scholar post (type=1)
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scholar-posts/public/${postId}?language=${currentLang}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            postData = await response.json();
            postType = 'scholar';
          } else {
            setError('Scholar post not found');
          }
        } else if (postTypeParam === '2') {
          // User post (type=2)
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-posts/${postId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            postData = await response.json();
            postType = 'user';
          } else {
            setError('User post not found');
          }
        } else {
          // No type parameter, try both (fallback)
          let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-posts/${postId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            postData = await response.json();
            postType = 'user';
          } else {
            // If not found as user post, try as scholar post
            response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scholar-posts/public/${postId}?language=${currentLang}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              postData = await response.json();
              postType = 'scholar';
            } else {
              setError('Post not found');
            }
          }
        }

        if (postData) {
          // Load user/scholar info
          let userInfo = null;
          if (postType === 'user' && postData.user_id) {
            try {
              const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/public/${postData.user_id}`);
              if (userResponse.ok) {
                userInfo = await userResponse.json();
              }
            } catch (error) {
              console.error('Error fetching user info:', error);
            }
          } else if (postType === 'scholar') {
            // Check if scholar info is already included in the response
            if (postData.scholar) {
              userInfo = postData.scholar;
            } else {
              // Fallback: Try different possible field names for scholar ID
              const scholarId = postData.scholar_id || postData.scholarId;

              if (scholarId) {
                try {
                  const scholarResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scholars/${scholarId}`);
                  if (scholarResponse.ok) {
                    userInfo = await scholarResponse.json();
                  }
                } catch (error) {
                  console.error('Error fetching scholar info:', error);
                }
              }
            }
          }

          // Check if this is a shared post and load original user info
          if (postData.original_user_id) {
            try {
              const originalUserResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/public/${postData.original_user_id}`);
              if (originalUserResponse.ok) {
                const originalUser = await originalUserResponse.json();
                // Use original user info for display
                userInfo = originalUser;
              }
            } catch (error) {
              console.error('Error fetching original user info:', error);
            }
          }

          // For scholar posts, extract content from translations based on lang parameter
          let processedPostData = { ...postData };
          if (postType === 'scholar' && postData.translations && postData.translations.length > 0) {
            // Find translation for current language
            const translation = postData.translations.find(t => t.language === currentLang) || postData.translations[0];
            if (translation) {
              processedPostData.content = translation.content;
              processedPostData.mediaUrls = translation.mediaUrls || [];
              processedPostData.fileUrls = translation.fileUrls || [];
              // Extract first media URL as image_url if available
              if (translation.mediaUrls && translation.mediaUrls.length > 0) {
                const firstMedia = translation.mediaUrls[0];
                // Check if it's a video or image
                if (firstMedia.includes('.mp4') || firstMedia.includes('.webm') || firstMedia.includes('.mov')) {
                  processedPostData.video_url = firstMedia;
                } else {
                  processedPostData.image_url = firstMedia;
                }
              }
            }
          }

          if (userInfo) {
            // Ensure name is present by combining first and last names if needed
            if (!userInfo.name && (userInfo.firstName || userInfo.first_name)) {
              userInfo.name = `${userInfo.firstName || userInfo.first_name || ''} ${userInfo.lastName || userInfo.last_name || ''}`.trim();
            }
            if (!userInfo.fullName && userInfo.name) {
              userInfo.fullName = userInfo.name;
            }
          }

          setPost({
            ...processedPostData,
            postType,
            user: userInfo,
            scholar: userInfo,
            // Add top-level name for easier access in UI
            authorName: userInfo?.name || userInfo?.fullName || userInfo?.username || (postType === 'scholar' ? 'Alim' : 'Kullanıcı')
          });

          // Load comments if it's a user post (regardless of auth for public view)
          if (postType === 'user') {
            loadComments(postId, postType);
          }

          // Check if user has already shared this post
          if (isAuthenticated) {
            checkIfPostIsShared(postId);
          }
        } else {
          setError('Gönderi bulunamadı');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Gönderi yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id, isAuthenticated]);

  // Yeni yorum anlık görünsün (biri bu paylaşıma yorum yaptı)
  useEffect(() => {
    const handleNewComment = (event) => {
      const { postId, comment } = event.detail || {};
      if (!postId || !comment || !post) return;
      if (post.postType === 'user' && Number(post.id) === Number(postId)) {
        setComments(prev => {
          if (prev.some(c => c.id === comment.id)) return prev;
          return [...prev, comment];
        });
      }
    };
    window.addEventListener('newCommentInPost', handleNewComment);
    return () => window.removeEventListener('newCommentInPost', handleNewComment);
  }, [post]);

  const loadComments = async (postId, postType) => {
    try {
      setLoadingComments(true);
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-post-comments/post/${postId}`, {
        method: 'GET',
        headers: headers
      });

      if (response.ok) {
        const commentsData = await response.json();
        setComments(Array.isArray(commentsData) ? commentsData : (commentsData.comments || []));
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const checkIfPostIsShared = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-post-shares/check/${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isShared) {
          setSharedPosts(prev => new Set(prev).add(postId));
        }
      }
    } catch (error) {
      console.error('Error checking if post is shared:', error);
    }
  };

  const handleSharePost = async (postId) => {
    if (!isAuthenticated) {
      showNotification({
        title: 'Giriş Gerekli',
        message: 'Paylaşım yapmak için giriş yapmanız gerekiyor.',
        variant: 'warning',
        delay: 4000
      });
      return;
    }

    try {
      setSharingPosts(prev => new Set(prev).add(postId));
      const token = localStorage.getItem('token');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-post-shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          post_id: postId,
          post_type: post.postType === 'scholar' ? 1 : 2
        })
      });

      if (response.ok) {
        setSharedPosts(prev => new Set(prev).add(postId));
        showNotification({
          title: 'Başarılı!',
          message: 'Gönderi başarıyla paylaşıldı!',
          variant: 'success',
          delay: 3000
        });
      } else {
        const errorData = await response.json();
        showNotification({
          title: 'Hata!',
          message: errorData.message || 'Paylaşım sırasında bir hata oluştu',
          variant: 'danger',
          delay: 4000
        });
      }
    } catch (error) {
      console.error('Paylaşım hatası:', error);
      showNotification({
        title: 'Hata!',
        message: 'Paylaşım sırasında bir hata oluştu',
        variant: 'danger',
        delay: 4000
      });
    } finally {
      setSharingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showNotification({
        title: 'Giriş Gerekli',
        message: 'Yorum yapmak için giriş yapmanız gerekiyor.',
        variant: 'warning',
        delay: 4000
      });
      return;
    }

    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-post-comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          post_id: post.id,
          user_id: userInfo.id,
          content: newComment.trim()
        })
      });

      if (response.ok) {
        setNewComment('');
        loadComments(post.id, post.postType);
        showNotification({
          title: 'Başarılı!',
          message: 'Yorumunuz eklendi!',
          variant: 'success',
          delay: 3000
        });
      } else {
        const errorData = await response.json();
        showNotification({
          title: 'Hata!',
          message: errorData.message || 'Yorum eklenirken bir hata oluştu',
          variant: 'danger',
          delay: 4000
        });
      }
    } catch (error) {
      console.error('Yorum ekleme hatası:', error);
      showNotification({
        title: 'Hata!',
        message: 'Yorum eklenirken bir hata oluştu',
        variant: 'danger',
        delay: 4000
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Tarih bilinmiyor';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Geçersiz tarih';
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Tarih hatası';
    }
  };

  const getImageUrl = (photoUrl) => {
    if (!photoUrl || typeof photoUrl !== 'string' || photoUrl === 'null') return avatar7.src || avatar7;

    let finalUrl;
    if (photoUrl.startsWith('/uploads/') || photoUrl.startsWith('uploads/')) {
      // Remove leading slash if present to avoid double slashes
      const cleanUrl = photoUrl.startsWith('/') ? photoUrl.substring(1) : photoUrl;
      finalUrl = `${process.env.NEXT_PUBLIC_API_URL}/${cleanUrl}`;
    } else if (photoUrl.startsWith('http')) {
      finalUrl = photoUrl;
    } else {
      finalUrl = `${process.env.NEXT_PUBLIC_API_URL}/uploads/${photoUrl}`;
    }


    return finalUrl;
  };

  const isImageFile = (fileName) => {
    if (!fileName) return false;
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const extension = fileName.split('.').pop().toLowerCase();
    return imageExtensions.includes(extension);
  };

  if (loading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Gönderi yükleniyor...</p>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error || !post) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="danger">
              <Alert.Heading>Gönderi Bulunamadı</Alert.Heading>
              <p>{error || 'Aradığınız gönderi bulunamadı veya silinmiş olabilir.'}</p>
              <hr />
              <div className="d-flex justify-content-end">
                <Link href="/" className="btn btn-outline-danger">
                  <BsArrowLeft className="me-2" />
                  Ana Sayfaya Dön
                </Link>
              </div>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }


  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      padding: '3rem 0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background glow elements */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0) 70%)',
        borderRadius: '50%',
        zIndex: 0
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '-5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(5, 150, 105, 0.05) 0%, rgba(5, 150, 105, 0) 70%)',
        borderRadius: '50%',
        zIndex: 0
      }}></div>

      <Container className="py-4" style={{ position: 'relative', zIndex: 1 }}>
        <Row className="justify-content-center">
          <Col lg={8}>
            {/* Header / Back Button Area */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <Link href="/" className="btn d-flex align-items-center gap-2 px-3 py-2 shadow" style={{
                backgroundColor: 'rgba(255, 255, 255, 1)',
                borderRadius: '12px',
                border: 'none',
                color: '#4f46e5',
                fontWeight: '700',
                transition: 'all 0.2s',
                zIndex: 10
              }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
              >
                <BsArrowLeft className="text-primary" />
                {t.backToHome}
              </Link>
            </div>

            {/* Post Card */}
            <Card className="mb-4 shadow-lg border-0" style={{
              borderRadius: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              overflow: 'hidden'
            }}>
              <CardBody className="p-0">
                {/* Visual Accent Header */}
                <div style={{ height: '6px', background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' }}></div>

                {/* User Info Section */}
                <div className="p-4 d-flex align-items-center border-bottom" style={{ borderColor: 'rgba(0, 0, 0, 0.04)' }}>
                  <div className="avatar me-3 position-relative">
                    <div style={{
                      borderRadius: '50%',
                      padding: '3px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                    }}>
                      <Image
                        className="avatar-img rounded-circle border border-white"
                        src={getImageUrl(post.user?.avatar || post.scholar?.photoUrl)}
                        alt={post.authorName}
                        width={48}
                        height={48}
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = avatar7.src || avatar7;
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-0 fw-bold" style={{ color: '#1e293b', fontSize: '1.1rem' }}>
                      {post.authorName || 'Kullanıcı'}
                    </h6>
                    <div className="d-flex align-items-center gap-2">
                      <span className={`badge ${post.postType === 'scholar' ? 'bg-primary' : 'bg-dark'} bg-opacity-10 text-${post.postType === 'scholar' ? 'primary' : 'dark'} px-2 py-1`} style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {post.postType === 'scholar' ? 'Alim' : 'Kullanıcı'}
                      </span>
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                        • {formatDate(post.created_at || post.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Post Content Area */}
                <div className="p-4">
                  {post.content && (
                    <div className="mb-4">
                      {post.postType === 'scholar' ? (
                        <div
                          className="post-content-scholar"
                          style={{
                            fontSize: '1.2rem',
                            lineHeight: '1.7',
                            color: '#1e293b',
                            whiteSpace: 'pre-wrap'
                          }}
                          dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                      ) : (
                        <p className="mb-0" style={{
                          fontSize: '1.15rem',
                          lineHeight: '1.6',
                          color: '#334155',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {post.content}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Post Media - Scholar Posts (from mediaUrls) */}
                  {post.postType === 'scholar' && post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className="mb-3">
                      {post.mediaUrls.map((mediaUrl, index) => {
                        const isVideo = mediaUrl.includes('.mp4') || mediaUrl.includes('.webm') || mediaUrl.includes('.mov');
                        return (
                          <div key={index} className="mb-2">
                            {isVideo ? (
                              <video
                                className="w-100 rounded"
                                controls
                                preload="metadata"
                                style={{ maxHeight: '400px' }}
                              >
                                <source src={getImageUrl(mediaUrl)} type="video/mp4" />
                                Tarayıcınız video oynatmayı desteklemiyor.
                              </video>
                            ) : (
                              <img
                                src={getImageUrl(mediaUrl)}
                                alt={`Gönderi ${index + 1}`}
                                className="img-fluid rounded"
                                style={{
                                  width: '100%',
                                  height: 'auto',
                                  maxHeight: '600px',
                                  objectFit: 'contain',
                                  display: 'block',
                                  margin: '0 auto'
                                }}
                                onError={(e) => {
                                  console.error('Media failed to load:', e.target.src);
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Post Image - User Posts */}
                  {post.postType !== 'scholar' && post.image_url && (
                    <div className="mb-3">
                      <img
                        src={getImageUrl(post.image_url)}
                        alt="Gönderi"
                        className="img-fluid rounded"
                        style={{
                          width: '100%',
                          height: 'auto',
                          maxHeight: '600px',
                          objectFit: 'contain',
                          display: 'block',
                          margin: '0 auto'
                        }}
                        onError={(e) => {
                          console.error('Post image failed to load:', e.target.src);
                        }}
                      />
                    </div>
                  )}

                  {/* Post Video - User Posts */}
                  {post.postType !== 'scholar' && (post.video_url || post.video) && (
                    <div className="mb-3">
                      <video
                        className="w-100 rounded"
                        controls
                        preload="metadata"
                        style={{ maxHeight: '400px' }}
                      >
                        <source src={getImageUrl(post.video_url || post.video)} type="video/mp4" />
                        Tarayıcınız video oynatmayı desteklemiyor.
                      </video>
                    </div>
                  )}

                  {/* File Attachments */}
                  {post.fileUrls && post.fileUrls.length > 0 && (
                    <div className="mb-3">
                      <h6 className="mb-2">Ekli Dosyalar:</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {post.fileUrls.map((fileUrl, index) => {
                          const fileName = fileUrl.split('/').pop();
                          const fileExtension = fileName.split('.').pop().toLowerCase();
                          const fullFileUrl = getImageUrl(fileUrl);
                          const isImage = isImageFile(fileName);

                          return (
                            <div key={index} className="border rounded p-3" style={{ minWidth: '200px' }}>
                              <div className="d-flex align-items-center mb-2">
                                <div className="me-2">
                                  {fileExtension === 'pdf' && <span className="text-danger fs-4">📄</span>}
                                  {fileExtension === 'docx' && <span className="text-primary fs-4">📝</span>}
                                  {!['pdf', 'docx'].includes(fileExtension) && <span className="text-secondary fs-4">📎</span>}
                                </div>
                                <div className="flex-grow-1">
                                  <small className="d-block fw-bold">{fileName}</small>
                                  <small className="text-muted">{fileExtension.toUpperCase()} dosyası</small>
                                </div>
                              </div>

                              <div className="d-flex gap-2">
                                {isImage ? (
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="flex-fill"
                                    onClick={() => setSelectedImage(fullFileUrl)}
                                  >
                                    <BsEye className="me-1" />
                                    Önizle
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="flex-fill"
                                    onClick={() => window.open(fullFileUrl, '_blank')}
                                  >
                                    <BsEye className="me-1" />
                                    Önizle
                                  </Button>
                                )}
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  className="flex-fill"
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(fullFileUrl);
                                      if (response.ok) {
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = fileName;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        window.URL.revokeObjectURL(url);
                                      }
                                    } catch (error) {
                                      console.error('Download error:', error);
                                    }
                                  }}
                                >
                                  <BsDownload className="me-1" />
                                  İndir
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex gap-3">
                      <Button
                        variant={sharedPosts.has(post.id) ? "success" : "light"}
                        size="sm"
                        onClick={() => handleSharePost(post.id)}
                        disabled={sharingPosts.has(post.id)}
                      >
                        <BsShare className="me-1" />
                        {sharingPosts.has(post.id) ? t.sharing :
                          sharedPosts.has(post.id) ? t.shared : t.share}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Comments Section - Only for user posts and authenticated users */}
            {post.postType === 'scholar' ? (
              <Card className="shadow-lg" style={{
                borderRadius: '20px',
                border: 'none',
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)'
              }}>
                <CardBody className="p-4 text-center">
                  <h5 className="mb-3" style={{ color: '#2c3e50' }}>{t.comments}</h5>
                  <div className="py-4">
                    <i className="fas fa-lock text-muted mb-3" style={{ fontSize: '2rem' }}></i>
                    <p className="text-muted mb-0">
                      {currentLang === 'tr' ? 'Alim paylaşımlarına yorum yapılamaz.' :
                        currentLang === 'ar' ? 'لا يمكن التعليق على مشاركات العلماء.' :
                          currentLang === 'fr' ? 'Les commentaires ne sont pas autorisés sur les publications des érudits.' :
                            'Comments are not allowed on scholar posts.'}
                    </p>
                  </div>
                </CardBody>
              </Card>
            ) : (
              <Card className="shadow-lg border-0" style={{
                borderRadius: '24px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)'
              }}>
                <CardBody className="p-4">
                  <h5 className="mb-4 fw-bold d-flex align-items-center gap-2">
                    <BsChat className="text-primary" />
                    {t.comments} ({comments.length})
                  </h5>

                  {/* Comment Form for Authenticated Users */}
                  {isAuthenticated ? (
                    <form onSubmit={handleAddComment} className="mb-4">
                      <div className="d-flex gap-2">
                        <div className="avatar">
                          <Image
                            className="avatar-img rounded-circle border"
                            src={getImageUrl(userInfo?.avatar)}
                            alt={userInfo?.name || 'User'}
                            width={40}
                            height={40}
                            style={{ objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = avatar7.src || avatar7;
                            }}
                          />
                        </div>
                        <div className="flex-grow-1">
                          <textarea
                            className="form-control bg-light border-0 px-3 py-2"
                            rows={2}
                            placeholder={t.commentPlaceholder}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            style={{ borderRadius: '15px', resize: 'none' }}
                            maxLength={500}
                          />
                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <small className="text-muted fw-bold">{newComment.length}/500</small>
                            <Button
                              type="submit"
                              size="sm"
                              disabled={!newComment.trim()}
                              className="px-4 rounded-pill fw-bold"
                              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}
                            >
                              {t.commentButton}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="p-3 mb-4 rounded-4" style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px dashed rgba(16, 185, 129, 0.2)' }}>
                      <p className="mb-0 text-center text-muted small fw-medium">
                        <i className="fas fa-lock me-2"></i>
                        {t.loginToComment}
                        <Link href="/auth-advance/sign-in" className="ms-2 fw-bold text-primary text-decoration-none">
                          {t.signIn}
                        </Link>
                      </p>
                    </div>
                  )}

                  {/* Global Comment List */}
                  {loadingComments ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" size="sm" variant="primary" />
                    </div>
                  ) : comments.length > 0 ? (
                    <div className="vstack gap-3">
                      {comments.map((comment, index) => (
                        <div key={index} className="d-flex gap-3 p-3 bg-white bg-opacity-50 rounded-4 border border-light">
                          <div className="avatar flex-shrink-0">
                            <Image
                              className="avatar-img rounded-circle border"
                              src={getImageUrl(comment.user_avatar || comment.avatar)}
                              alt={comment.user_name || 'User'}
                              width={40}
                              height={40}
                              style={{ objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = avatar7.src || avatar7;
                              }}
                            />
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <h6 className="mb-0 fw-bold small">{comment.user_name || comment.username || 'Kullanıcı'}</h6>
                              <small className="text-muted" style={{ fontSize: '0.7rem' }}>{formatDate(comment.created_at)}</small>
                            </div>
                            <p className="mb-0 text-secondary small" style={{ whiteSpace: 'pre-wrap' }}>
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted py-4">
                      <BsChat className="fs-1 mb-2 opacity-20" />
                      <p className="small mb-0">{t.noComments}</p>
                    </div>
                  )}
                </CardBody>
              </Card>
            )}

            {/* Site Information for Non-Members */}
            {!isAuthenticated && (
              <Card className="shadow-lg mt-4" style={{
                borderRadius: '20px',
                border: 'none',
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
              }}>
                <CardBody className="p-5 text-center">
                  <div className="mb-4">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                      style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                      }}>
                      <i className="fas fa-users fa-2x text-white"></i>
                    </div>
                    <h3 className="mb-3" style={{
                      color: '#ffffff',
                      fontWeight: 'bold',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      {t.platformTitle}
                    </h3>
                    <p className="lead mb-4 opacity-100 mx-auto" style={{ maxWidth: '600px', color: '#334155', fontWeight: '500' }}>
                      {t.platformDesc}
                    </p>
                  </div>

                  <div className="row g-4 mb-4">
                    <div className="col-md-4">
                      <div className="text-center">
                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                          style={{
                            width: '60px',
                            height: '60px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 4px 16px rgba(102, 126, 234, 0.2)'
                          }}>
                          <i className="fas fa-book-open fa-lg text-white"></i>
                        </div>
                        <h6 className="fw-bold" style={{ color: '#ffffff' }}>{t.islamicContent}</h6>
                        <p className="small" style={{ color: '#f1f5f9' }}>{t.islamicContentDesc}</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center">
                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                          style={{
                            width: '60px',
                            height: '60px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 4px 16px rgba(102, 126, 234, 0.2)'
                          }}>
                          <i className="fas fa-comments fa-lg text-white"></i>
                        </div>
                        <h6 className="fw-bold" style={{ color: '#ffffff' }}>{t.community}</h6>
                        <p className="small" style={{ color: '#f1f5f9' }}>{t.communityDesc}</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center">
                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                          style={{
                            width: '60px',
                            height: '60px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 4px 16px rgba(102, 126, 234, 0.2)'
                          }}>
                          <i className="fas fa-graduation-cap fa-lg text-white"></i>
                        </div>
                        <h6 className="fw-bold" style={{ color: '#ffffff' }}>{t.learning}</h6>
                        <p className="small" style={{ color: '#f1f5f9' }}>{t.learningDesc}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-light rounded-3 p-4 mb-4" style={{
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                    border: '1px solid rgba(102, 126, 234, 0.1)'
                  }}>
                    <h5 className="mb-3" style={{ color: '#2c3e50' }}>
                      <i className="fas fa-star text-warning me-2"></i>
                      {t.whyJoin}
                    </h5>
                    <div className="row text-start">
                      <div className="col-md-6">
                        <ul className="list-unstyled">
                          <li className="mb-2" style={{ color: '#4a5568' }}>
                            <i className="fas fa-check-circle text-success me-2"></i>
                            {t.reliableSources}
                          </li>
                          <li className="mb-2" style={{ color: '#4a5568' }}>
                            <i className="fas fa-check-circle text-success me-2"></i>
                            {t.expertFatwas}
                          </li>
                          <li className="mb-2" style={{ color: '#4a5568' }}>
                            <i className="fas fa-check-circle text-success me-2"></i>
                            {t.currentNews}
                          </li>
                        </ul>
                      </div>
                      <div className="col-md-6">
                        <ul className="list-unstyled">
                          <li className="mb-2" style={{ color: '#4a5568' }}>
                            <i className="fas fa-check-circle text-success me-2"></i>
                            {t.communitySupport}
                          </li>
                          <li className="mb-2" style={{ color: '#4a5568' }}>
                            <i className="fas fa-check-circle text-success me-2"></i>
                            {t.mobileFriendly}
                          </li>
                          <li className="mb-2" style={{ color: '#4a5568' }}>
                            <i className="fas fa-check-circle text-success me-2"></i>
                            {t.freeMembership}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="d-grid gap-3 d-md-flex justify-content-md-center">
                    <Link href="/auth-advance/sign-up" className="btn btn-primary btn-lg px-5" style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      borderRadius: '50px',
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                      fontWeight: 'bold'
                    }}>
                      <i className="fas fa-user-plus me-2"></i>
                      {t.joinNow}
                    </Link>
                    <Link href="/auth-advance/sign-in" className="btn btn-outline-primary btn-lg px-5" style={{
                      border: '2px solid #667eea',
                      borderRadius: '50px',
                      color: '#667eea',
                      fontWeight: 'bold',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <i className="fas fa-sign-in-alt me-2"></i>
                      {t.signIn}
                    </Link>
                  </div>

                  <div className="mt-4">
                    <small style={{ color: '#e2e8f0' }}>
                      <i className="fas fa-shield-alt me-1"></i>
                      {t.securePlatform} •
                      <i className="fas fa-users me-1"></i>
                      {t.thousandsMembers} •
                      <i className="fas fa-heart me-1"></i>
                      {t.free}
                    </small>
                  </div>
                </CardBody>
              </Card>
            )}
          </Col>
        </Row>
      </Container>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
          onClick={() => setSelectedImage(null)}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Görsel Önizleme</h5>
                <Button
                  variant="close"
                  onClick={() => setSelectedImage(null)}
                >
                  <BsX />
                </Button>
              </div>
              <div className="modal-body p-0">
                <Image
                  src={selectedImage}
                  alt="Önizleme"
                  width={800}
                  height={600}
                  className="img-fluid"
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicPostPage;
