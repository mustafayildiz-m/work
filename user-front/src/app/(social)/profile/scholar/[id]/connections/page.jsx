'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardBody, CardHeader, CardTitle, Modal, Button, ListGroup } from 'react-bootstrap';
import Image from 'next/image';
import avatar7 from '@/assets/images/avatar/07.jpg';
import { BsBook, BsDownload, BsEye, BsPerson, BsX, BsChevronDown, BsHeart, BsFileEarmarkPdf, BsGeoAlt } from 'react-icons/bs';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow } from 'swiper/modules';
import { Row, Col, Pagination, Badge } from 'react-bootstrap';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import book1 from '@/assets/images/book/01.jpg';
import dynamic from 'next/dynamic';

// MapComponent'i dynamic import ile yükle (SSR hatası önlemek için)
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="text-center py-3">
      <div className="spinner-border spinner-border-sm text-primary" role="status">
        <span className="visually-hidden">Harita yükleniyor...</span>
      </div>
      <p className="mt-1 text-muted small">Harita yükleniyor...</p>
    </div>
  )
});

const ScholarBooksPage = () => {
  const params = useParams();
  const [scholar, setScholar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [allBooks, setAllBooks] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'own', 'related'
  
  // Language selection modal state
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const itemsPerPage = 12;

  useEffect(() => {
    const fetchScholarData = async () => {
      try {
        const scholarId = params.id;
        if (scholarId) {
          const token = localStorage.getItem('token');

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scholars/${scholarId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            setScholar(data);
            
            // Combine ownBooks and relatedBooks
            const combinedBooks = [
              ...(data.ownBooks || []).map(book => ({ ...book, type: 'own' })),
              ...(data.relatedBooks || []).map(book => ({ ...book, type: 'related' }))
            ];
            
            setAllBooks(combinedBooks);
          }
        }
      } catch (error) {
        // console.error('Error fetching scholar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScholarData();
  }, [params.id]);

  // Filter books based on active tab
  const getFilteredBooks = () => {
    switch (activeTab) {
      case 'own':
        return allBooks.filter(book => book.type === 'own');
      case 'related':
        return allBooks.filter(book => book.type === 'related');
      default:
        return allBooks;
    }
  };

  const filteredBooks = getFilteredBooks();
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const paginatedBooks = filteredBooks.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Helper function to get proper image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;

    // Eğer zaten tam URL ise (http/https ile başlıyorsa)
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // Eğer /uploads/ ile başlıyorsa API base URL ekle
    if (imageUrl.startsWith('/uploads/') || imageUrl.startsWith('uploads/')) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      // Ensure the path starts with a slash
      const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
      return `${apiBaseUrl}${normalizedPath}`;
    }

    // Eğer sadece dosya adı ise (örn: "book-cover.jpg")
    if (imageUrl.includes('.') && !imageUrl.startsWith('/')) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      return `${apiBaseUrl}/uploads/${imageUrl}`;
    }

    // Diğer durumlar için orijinal URL'yi döndür
    return imageUrl;
  };

  // Helper function to get book cover image
  const getBookCoverImage = (book) => {
    if (book.type === 'own') {
      // Own books use coverUrl
      return getImageUrl(book.coverUrl);
    } else if (book.type === 'related') {
      // Related books use coverImage
      return getImageUrl(book.coverImage);
    }
    return null;
  };

  // Handle download button click
  const handleDownloadClick = (book) => {
    
    if (book.type === 'related' && book.languages && book.languages.length > 1) {
      // Show language selection modal for books with multiple languages
      setSelectedBook(book);
      setShowLanguageModal(true);
    } else if (book.type === 'own' && book.pdfUrl) {
      // Direct download for own books using pdfUrl
      downloadBook(book, null);
    } else if (book.type === 'related' && book.languages && book.languages.length === 1) {
      // Direct download for books with single language
      downloadBook(book, book.languages[0]);
    } else {
      // No download available
      alert('Bu kitap için indirme seçeneği bulunmuyor.');
    }
  };

  // Download book function
  const downloadBook = (book, language) => {
    let downloadUrl = null;
    
    if (language && language.pdfUrl) {
      downloadUrl = getImageUrl(language.pdfUrl);
    } else if (book.type === 'own' && book.pdfUrl) {
      // For own books, use pdfUrl
      downloadUrl = getImageUrl(book.pdfUrl);
    } else if (book.coverUrl) {
      downloadUrl = getImageUrl(book.coverUrl);
    }
    
    
    if (downloadUrl) {
      // Force download by creating a blob URL
      fetch(downloadUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.blob();
        })
        .then(blob => {
          
          // Validate blob
          if (!blob || blob.size === 0) {
            throw new Error('Invalid blob received');
          }
          
          // Create blob URL
          const blobUrl = window.URL.createObjectURL(blob);
              
              // Determine file extension based on book type and URL
              let fileExtension = '.pdf';
              if (book.type === 'own' && book.pdfUrl) {
                // Extract extension from the actual file URL
                const urlParts = book.pdfUrl.split('.');
                if (urlParts.length > 1) {
                  fileExtension = '.' + urlParts[urlParts.length - 1];
                }
              }
              
              // Generate filename based on book type
              let filename = book.title;
              if (language && language.languageCode) {
                filename += `_${language.languageCode.toUpperCase()}`;
              }
              filename += fileExtension;
              
              // Create temporary link element with proper attributes
              const link = document.createElement('a');
              link.href = blobUrl;
              link.download = filename;
              link.style.display = 'none'; // Hide the link
              
              // Force download attribute and prevent opening in new tab
              link.setAttribute('download', filename);
              link.setAttribute('target', '_self');
              
              // Force download using blob
              try {
                // Append to body, click, and remove
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              } catch (error) {
                // Try alternative download method without opening in new tab
                const directLink = document.createElement('a');
                directLink.href = downloadUrl;
                directLink.download = filename;
                directLink.style.display = 'none';
                directLink.setAttribute('target', '_self');
                document.body.appendChild(directLink);
                directLink.click();
                document.body.removeChild(directLink);
              }
              
              // Clean up blob URL
              window.URL.revokeObjectURL(blobUrl);
            })
        .catch(error => {
          // console.error('Download error:', error);
          alert('İndirme sırasında hata oluştu. Lütfen tekrar deneyin.');
          
          // If all download methods fail, don't open in new tab
        });
    } else {
      alert('İndirme dosyası bulunamadı.');
    }
  };

  // Handle language selection from modal
  const handleLanguageSelect = (language) => {
    if (selectedBook && language) {
      downloadBook(selectedBook, language);
      setShowLanguageModal(false);
      setSelectedBook(null);
    }
  };

  // Get language display name
  const getLanguageDisplayName = (languageCode) => {
    const languageNames = {
      'en': 'İngilizce',
      'tr': 'Türkçe',
      'ar': 'Arapça',
      'ru': 'Rusça',
      'fr': 'Fransızca',
      'de': 'Almanca',
      'es': 'İspanyolca',
      'fa': 'Farsça',
      'ur': 'Urduca'
    };
    return languageNames[languageCode] || languageCode.toUpperCase();
  };

  const paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item key={number} active={number === page} onClick={() => setPage(number)}>
        {number}
      </Pagination.Item>
    );
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Kitaplar yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!scholar) {
    return (
      <div className="text-center py-5">
        <h4>Alim Bulunamadı</h4>
        <p className="text-muted">Aradığınız alim bulunamadı veya silinmiş olabilir.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Book Tabs */}
      <Card className="mb-4">
        <CardHeader className="border-0 pb-0">
          <div className="d-flex justify-content-between align-items-center">
            <CardTitle>
              Kitaplar
              <span className="badge bg-primary ms-2">{allBooks.length}</span>
            </CardTitle>
            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab('all')}
              >
                Tümü ({allBooks.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'own' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab('own')}
              >
                Kendi Kitapları ({scholar.ownBooks?.length || 0})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'related' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab('related')}
              >
                İlgili Kitaplar ({scholar.relatedBooks?.length || 0})
              </button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {filteredBooks.length > 0 ? (
            <div className="px-4 py-8 overflow-visible">
              <Swiper
                effect="coverflow"
                slidesPerView={2}
                spaceBetween={20}
                grabCursor={true}
                centeredSlides={true}
                loop={true}
                coverflowEffect={{
                  rotate: 0,
                  stretch: 0,
                  depth: 120,
                  modifier: 2.5,
                  slideShadows: false,
                }}
                modules={[EffectCoverflow]}
                breakpoints={{
                  640: { slidesPerView: 3 },
                  1024: { slidesPerView: 4 },
                  1280: { slidesPerView: 5 },
                }}
                className="w-full max-w-6xl mx-auto overflow-visible"
              >
                {filteredBooks.slice(0, 10).map((book, index) => (
                  <SwiperSlide
                    key={`${book.id}-${book.type}`}
                    className="w-[250px] h-[360px] rounded-xl overflow-hidden shadow-lg bg-white"
                  >
                    <div className="position-relative">
                      <Image
                        width={200}
                        height={300}
                        src={getBookCoverImage(book) || book1}
                        alt={book.title}
                        className="w-full h-full object-cover"
                                                  onError={(e) => {
                            e.target.src = book1; // Varsayılan resim
                          }}
                      />
                      <Badge 
                        bg={book.type === 'own' ? 'success' : 'info'} 
                        className="position-absolute top-0 start-0 m-2"
                      >
                        {book.type === 'own' ? 'Kendi Kitabı' : 'İlgili Kitap'}
                      </Badge>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ) : (
            <div className="text-center py-4">
              <BsBook size={48} className="text-muted mb-2" />
              <h6>Bu kategoride kitap bulunamadı</h6>
              <p className="text-muted">Seçilen kategori için henüz kitap bulunmuyor.</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Book Grid */}
      <Card>
        <CardBody>
          <div className="my-5">
            {filteredBooks.length > 0 ? (
              <>
                <Row>
                  {paginatedBooks.map((book, idx) => (
                    <Col key={`${book.id}-${book.type}`} xs={12} sm={6} md={4} lg={3} className="mb-4">
                      <div className="book-card-wrapper position-relative overflow-hidden">
                        <Card className="h-100 shadow-sm border-0">
                          <div className="img-container position-relative">
                            <Image
                              src={getBookCoverImage(book) || book1}
                              alt={book.title || 'Kitap Resmi'}
                              width={250}
                              height={350}
                              style={{ objectFit: 'cover' }}
                              className="card-img-top"
                              onError={(e) => {
                                e.target.src = book1; // Varsayılan resim
                              }}
                            />
                            <Badge 
                              bg={book.type === 'own' ? 'success' : 'info'} 
                              className="position-absolute top-0 start-0 m-2"
                            >
                              {book.type === 'own' ? 'Kendi Kitabı' : 'İlgili Kitap'}
                            </Badge>
                            <div className="hover-icons d-flex flex-column gap-2">
                              <div className="icon-btn bg-white shadow rounded p-2">
                                <BsHeart />
                              </div>
                              <div 
                                className="icon-btn bg-white shadow rounded p-2"
                                onClick={() => handleDownloadClick(book)}
                                title="İndir"
                                style={{ cursor: 'pointer' }}
                              >
                                <BsDownload />
                              </div>
                            </div>
                          </div>
                          <Card.Body>
                            <div className="text-decoration-none">
                              <Card.Title className="text-center" style={{ fontSize: '1rem' }}>{book.title}</Card.Title>
                              <p className="small text-muted text-center mb-2">
                                {book.description || 'Açıklama bulunmuyor'}
                              </p>
                              {book.languages && book.languages.length > 0 && (
                                <div className="text-center">
                                  <small className="text-muted">
                                    Diller: {book.languages.map(lang => lang.languageCode.toUpperCase()).join(', ')}
                                  </small>
                                </div>
                              )}
                            </div>
                          </Card.Body>
                        </Card>
                      </div>
                    </Col>
                  ))}
                </Row>

                {totalPages > 1 && (
                  <div className="d-flex justify-content-center">
                    <Pagination className='gap-2'>
                      <Pagination.Prev onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} />
                      {paginationItems}
                      <Pagination.Next onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} />
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-5">
                <BsBook size={48} className="text-muted mb-2" />
                <h6>Henüz Kitap Bulunmuyor</h6>
                <p className="text-muted">Bu alim henüz kitap eklememiş veya ilgili kitap bulunmuyor.</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Language Selection Modal */}
      <Modal show={showLanguageModal} onHide={() => setShowLanguageModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <BsFileEarmarkPdf className="me-2" />
            Dil Seçimi
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBook && (
            <div>
              <h6 className="mb-3">{selectedBook.title}</h6>
              <p className="text-muted mb-3">Hangi dilde indirmek istiyorsunuz?</p>
              <ListGroup>
                {selectedBook.languages?.map((language) => (
                  <ListGroup.Item 
                    key={language.id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{getLanguageDisplayName(language.languageCode)}</strong>
                      <small className="text-muted ms-2">({language.languageCode.toUpperCase()})</small>
                    </div>
                    {language.pdfUrl ? (
                      <Button 
                        variant="success" 
                        size="sm"
                        onClick={() => handleLanguageSelect(language)}
                        className="d-flex align-items-center gap-1"
                      >
                        <BsDownload size={14} />
                        İndir
                      </Button>
                    ) : (
                      <Badge bg="warning">PDF Yok</Badge>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLanguageModal(false)}>
            İptal
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx="true">{`
        .img-container {
          position: relative;
        }

        .hover-icons {
          position: absolute;
          top: 10px;
          right: -60px;
          transition: right 0.3s ease;
        }

        .book-card-wrapper:hover .hover-icons {
          right: 10px;
        }

        .icon-btn {
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .icon-btn:hover {
          transform: scale(1.1);
        }

        .btn-group .btn {
          border-radius: 0.375rem;
        }

        .btn-group .btn:not(:last-child) {
          margin-right: 0.25rem;
        }

        .list-group-item {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .list-group-item:hover {
          background-color: #f8f9fa;
        }
      `}</style>
    </div>
  );
};

export default ScholarBooksPage;
