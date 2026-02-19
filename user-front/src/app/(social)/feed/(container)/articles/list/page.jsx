'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Col, Card, CardHeader, CardBody, CardTitle, Row, Button, Form, InputGroup, Spinner, Alert, Badge, Collapse } from 'react-bootstrap';
import { BsArrowLeft, BsFileText, BsSearch, BsFilter, BsBook, BsGrid3X3Gap, BsList, BsChevronDown, BsChevronUp } from 'react-icons/bs';
import Link from 'next/link';
import Select from 'react-select';
import ArticleGrid from '../components/ArticleGrid';
import { useLanguage } from '@/context/useLanguageContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const ArticlesListPage = () => {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const languageId = searchParams.get('languageId');
  const languageName = searchParams.get('languageName');
  const languageCode = searchParams.get('languageCode');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState(() => {
    // localStorage'dan görünüm modunu güvenli şekilde oku
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('articlesViewMode');
        if (saved === 'grid' || saved === 'list') {
          return saved;
        }
      }
    } catch (error) {
      console.error('localStorage okuma hatası:', error);
    }
    return 'grid';
  }); // 'grid' veya 'list'
  const [showBookFilter, setShowBookFilter] = useState(() => {
    // localStorage'dan kitap filtre durumunu güvenli şekilde oku
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('articlesBookFilterOpen');
        return saved === 'true';
      }
    } catch (error) {
      console.error('localStorage okuma hatası:', error);
    }
    return false;
  });

  // Sadece makalesi olan kitapları fetch et
  const fetchBooksWithArticles = useCallback(async () => {
    try {
      setLoadingBooks(true);
      const token = localStorage.getItem('token');

      const params = new URLSearchParams();
      if (languageId) params.append('languageId', languageId);

      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/books/with-articles?${params.toString()}`, {
        headers: headers
      });


      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // react-select formatına dönüştür
      const bookOptions = data.map(book => ({
        value: book.id,
        label: `${book.title} (${book.articleCount} ${t('articles.list.articleCountInBook')})`
      }));

      setBooks(bookOptions);
    } catch (err) {
      console.error('Error fetching books with articles:', err);
    } finally {
      setLoadingBooks(false);
    }
  }, [languageId, t]);

  useEffect(() => {
    if (languageId) {
      fetchBooksWithArticles();
    }
  }, [languageId, fetchBooksWithArticles]);

  // Debounce ile otomatik arama - her tuşa basıldığında
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveSearch(searchQuery);
      setCurrentPage(1);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Arama input değişimi
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Form submit'i engelle (zaten otomatik arama var)
  const handleSearch = (e) => {
    if (e) {
      e.preventDefault();
    }
  };

  // Kitap filtreleme - multi-select
  const handleBookChange = (selectedOptions) => {
    setSelectedBooks(selectedOptions || []);
    setCurrentPage(1);
  };

  // Görünüm modunu localStorage'a kaydet
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('articlesViewMode', viewMode);
      } catch (error) {
        console.error('localStorage yazma hatası:', error);
      }
    }
  }, [viewMode]);

  // Kitap filtre durumunu localStorage'a kaydet
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('articlesBookFilterOpen', showBookFilter.toString());
      } catch (error) {
        console.error('localStorage yazma hatası:', error);
      }
    }
  }, [showBookFilter]);

  // languageId yoksa dil seçim sayfasına yönlendir
  useEffect(() => {
    if (!languageId) {
      router.push('/feed/articles');
    }
  }, [languageId, router]);

  if (!languageId) {
    return null;
  }

  // Seçili kitap ID'lerini al
  const selectedBookIds = selectedBooks.map(book => book.value);

  // react-select stilleri
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '38px',
      borderColor: state.isFocused ? '#0d6efd' : '#dee2e6',
      boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)' : 'none',
      '&:hover': {
        borderColor: '#0d6efd'
      }
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#0d6efd',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: 'white',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: 'white',
      ':hover': {
        backgroundColor: '#0b5ed7',
        color: 'white',
      },
    }),
  };

  return (
    <Col lg={9}>
      {/* Header with Search */}
      <Card className="mb-4 border-0 shadow-sm">
        <CardHeader className="bg-gradient text-white border-0" style={{
          background: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)'
        }}>
          <Row className="align-items-center g-3">
            <Col xs={12} md={5}>
              <div className="d-flex align-items-center">
                <Link href="/feed/articles">
                  <Button
                    variant="light"
                    size="sm"
                    className="me-3"
                  >
                    <BsArrowLeft className="me-1" />
                    {t('articles.list.backToLanguages')}
                  </Button>
                </Link>
                <CardTitle className="mb-0 h4">
                  <BsFileText className="me-2" />
                  {t(`books.languages.${languageName}`) || languageName} {t('articles.list.articlesTitle')}
                </CardTitle>
              </div>
            </Col>
            <Col xs={12} md={5}>
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder={t('articles.list.searchPlaceholder')}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="bg-white"
                  />
                  <InputGroup.Text className="bg-white">
                    <BsSearch className="text-muted" />
                  </InputGroup.Text>
                </InputGroup>
              </Form>
            </Col>
            <Col xs={12} md={2} className="text-end">
              <div className="d-flex justify-content-end gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'light' : 'outline-light'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  title={t('articles.list.gridView')}
                >
                  <BsGrid3X3Gap size={18} />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'light' : 'outline-light'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  title={t('articles.list.listView')}
                >
                  <BsList size={22} />
                </Button>
              </div>
            </Col>
          </Row>
        </CardHeader>
      </Card>

      {/* Book Filter - Collapsible Multi Select */}
      {books.length > 0 && (
        <Card className="mb-4 border-0 shadow-sm">
          <CardBody>
            <div
              onClick={() => setShowBookFilter(!showBookFilter)}
              style={{ cursor: 'pointer' }}
              className="d-flex align-items-center justify-content-between mb-3"
            >
              <div>
                <h6 className="mb-0">
                  <BsBook className="me-2" />
                  {t('articles.list.filterByBook')}
                  {selectedBooks.length > 0 && (
                    <Badge bg="primary" className="ms-2">{selectedBooks.length} {t('articles.list.booksSelected')}</Badge>
                  )}
                </h6>
                <small className="text-muted">
                  {selectedBooks.length > 0
                    ? `${selectedBooks.length} ${t('articles.list.booksSelected')}`
                    : t('articles.list.allBooksShowing')}
                </small>
              </div>
              <div className="text-primary">
                {showBookFilter ? <BsChevronUp size={20} /> : <BsChevronDown size={20} />}
              </div>
            </div>

            <Collapse in={showBookFilter}>
              <div>
                <Select
                  isMulti
                  options={books}
                  value={selectedBooks}
                  onChange={handleBookChange}
                  placeholder={t('articles.list.selectBooks')}
                  noOptionsMessage={() => t('articles.list.noBooksWithArticles')}
                  isLoading={loadingBooks}
                  styles={customSelectStyles}
                  className="basic-multi-select"
                  classNamePrefix="select"
                />
              </div>
            </Collapse>
          </CardBody>
        </Card>
      )}

      {/* Makale Grid/List */}
      <ArticleGrid
        selectedLanguageId={languageId}
        languageCode={languageCode}
        languageName={languageName}
        searchQuery={activeSearch}
        selectedBookIds={selectedBookIds}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        viewMode={viewMode}
      />
    </Col>
  );
};

export default ArticlesListPage;

