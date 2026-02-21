'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardBody, Col, Container, Row } from 'react-bootstrap';
import Image from 'next/image';
import avatar7 from '@/assets/images/avatar/07.jpg';
import { BsX } from 'react-icons/bs';
import PostCard from '@/components/cards/PostCard';
import { useLanguage } from '@/context/useLanguageContext';

const ScholarFeedPage = () => {
  const params = useParams();
  const { locale } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scholar, setScholar] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [localeForLangs, setLocaleForLangs] = useState(locale);
  const [selectedLanguages, setSelectedLanguages] = useState({});

  if (localeForLangs !== locale) {
    setLocaleForLangs(locale);
    setSelectedLanguages({});
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const scholarId = params.id;
        if (scholarId) {
          const token = localStorage.getItem('token');

          const headers = {
            'Content-Type': 'application/json'
          };

          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          // Alim bilgilerini çek
          const scholarResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scholars/${scholarId}`, {
            method: 'GET',
            headers: headers
          });

          let scholarData = null;
          if (scholarResponse.ok) {
            scholarData = await scholarResponse.json();
            setScholar(scholarData);
          }

          // Alim'in gönderilerini çek (translations ile birlikte)
          const postsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scholar-posts/scholar/${scholarId}`, {
            method: 'GET',
            headers: headers
          });

          if (postsResponse.ok) {
            const postsData = await postsResponse.json();

            // Postları direkt normalize et - dil seçimi rendering sırasında yapılacak
            const normalizedPosts = postsData.map(post => ({
              type: 'scholar',
              id: post.id,
              createdAt: post.createdAt,
              updatedAt: post.updatedAt,
              scholar: scholarData,
              translations: post.translations || [],
              isUserPost: false // This is a scholar post
            }));

            setPosts(normalizedPosts);
          } else {
            if (postsResponse.status !== 401) {
              console.error('❌ Posts not found, status:', postsResponse.status);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, locale]); // locale değişince de yeniden fetch et


  // Helper function to get proper image URL
  const getImageUrl = (photoUrl) => {
    if (!photoUrl) return avatar7.src || avatar7;
    if (photoUrl.startsWith('/uploads/') || photoUrl.startsWith('uploads/')) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      // Ensure the path starts with a slash
      const normalizedPath = photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`;
      return `${apiBaseUrl}${normalizedPath}`;
    }
    return photoUrl;
  };


  if (loading) {
    return (
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card>
              <CardBody className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Gönderiler yükleniyor...</p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="g-4">
        <Col lg={12}>
          {posts && posts.length > 0 ? (
            posts.map((post, index) => {
              // Manuel seçim varsa onu kullan, yoksa global dil seç, yoksa Türkçe
              const currentLanguage = selectedLanguages[post.id] || locale || 'tr';
              const currentTranslation = post.translations?.find(t => t.language === currentLanguage)
                || post.translations?.find(t => t.language === 'tr')
                || post.translations?.[0];

              // Eğer çeviri yoksa bu postu gösterme
              if (!currentTranslation) {
                return null;
              }

              return (
                <PostCard
                  key={post.id || index}
                  postId={post.id}
                  createdAt={post.createdAt}
                  caption={currentTranslation.content}
                  socialUser={scholar} // Use scholar from state, not post.scholar
                  isUserPost={false} // This is a scholar post
                  fileUrls={currentTranslation.fileUrls || []}
                  photos={currentTranslation.mediaUrls || []}
                  translations={post.translations}
                  onLanguageChange={(lang) => setSelectedLanguages(prev => ({ ...prev, [post.id]: lang }))}
                />
              );
            })
          ) : (
            <Card>
              <CardBody className="text-center py-5">
                <h5>Henüz Gönderi Yok</h5>
                <p className="text-muted">Bu alim henüz gönderi paylaşmamış.</p>
              </CardBody>
            </Card>
          )}
        </Col>

      </Row>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div className="position-relative">
            <button
              className="btn btn-light position-absolute top-0 end-0 m-2"
              style={{ zIndex: 10000 }}
              onClick={() => setSelectedImage(null)}
            >
              <BsX size={24} />
            </button>
            <Image
              src={selectedImage}
              alt="Önizleme"
              width={800}
              height={600}
              className="img-fluid"
              style={{ maxHeight: '90vh', maxWidth: '90vw' }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </Container>
  );
};

export default ScholarFeedPage;
