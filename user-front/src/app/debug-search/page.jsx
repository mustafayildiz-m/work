'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Button, Form, Row, Col, Alert, Badge } from 'react-bootstrap';
import { BsSearch, BsPerson, BsMortarboard, BsPeople, BsEye } from 'react-icons/bs';
import { useSearchContext } from '@/context/useSearchContext';
import { useSession } from 'next-auth/react';

const DebugSearchPage = () => {
  const { data: session, status } = useSession();
  const {
    performSearch,
    searchResults,
    isSearching,
    showResults,
    searchQuery,
    searchType,
    clearSearch
  } = useSearchContext();

  const [query, setQuery] = useState('');
  const [searchTypeInput, setSearchTypeInput] = useState('all');
  const [manualResults, setManualResults] = useState(null);
  const [error, setError] = useState(null);

  // Debug: Session ve context bilgilerini göster
  useEffect(() => {
    // Context and session state tracking
  }, [session, status, searchResults, isSearching, showResults, searchQuery, searchType]);

  const handleManualSearch = async () => {
    if (!query.trim()) return;

    setError(null);
    setManualResults(null);

    try {
      await performSearch(query, searchTypeInput);
    } catch (error) {
      console.error('❌ Manual search error:', error);
      setError('Arama sırasında bir hata oluştu');
    }
  };

  const handleDirectAPI = async () => {
    if (!query.trim() || !session?.accessToken) {
      setError('Sorgu veya access token eksik');
      return;
    }

    setError(null);
    setManualResults(null);

    try {

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/search/users?q=${encodeURIComponent(query)}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        }
      });


      if (response.ok) {
        const data = await response.json();
        setManualResults(data);
      } else {
        const errorText = await response.text();
        setError(`API Hatası: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Direct API call error:', error);
      setError(`Network Hatası: ${error.message}`);
    }
  };

  const renderUserItem = (user) => (
    <div key={user.id} className="d-flex align-items-center p-3 border rounded mb-2">
      <div className="flex-shrink-0 me-3">
        <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
          <BsPerson size={24} className="text-white" />
        </div>
      </div>
      <div className="flex-grow-1">
        <h6 className="mb-1">{user.name || 'İsimsiz'}</h6>
        <small className="text-muted">@{user.username || 'kullanici'}</small>
        {user.bio && <p className="mb-0 mt-2">{user.bio}</p>}
      </div>
      <Badge bg="primary">Kullanıcı</Badge>
    </div>
  );

  const renderScholarItem = (scholar) => (
    <div key={scholar.id} className="d-flex align-items-center p-3 border rounded mb-2">
      <div className="flex-shrink-0 me-3">
        <div className="bg-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
          <BsMortarboard size={24} className="text-white" />
        </div>
      </div>
      <div className="flex-grow-1">
        <h6 className="mb-1">{scholar.name || 'İsimsiz'}</h6>
        <small className="text-muted">@{scholar.username || 'alim'}</small>
        {scholar.bio && <p className="mb-0 mt-2">{scholar.bio}</p>}
      </div>
      <Badge bg="success">Alim</Badge>
    </div>
  );

  const renderFollowerItem = (follower) => (
    <div key={follower.id} className="d-flex align-items-center p-3 border rounded mb-2">
      <div className="flex-shrink-0 me-3">
        <div className="bg-info rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
          <BsPeople size={24} className="text-white" />
        </div>
      </div>
      <div className="flex-grow-1">
        <h6 className="mb-1">{follower.name || 'İsimsiz'}</h6>
        <small className="text-muted">@{follower.username || 'takipci'}</small>
        {follower.bio && <p className="mb-0 mt-2">{follower.bio}</p>}
      </div>
      <Badge bg="info">Takipçi</Badge>
    </div>
  );

  if (status === 'loading') {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Session yükleniyor...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container py-5">
        <Alert variant="warning">
          <h5>Authentication Gerekli</h5>
          <p>Bu sayfayı görüntülemek için giriş yapmanız gerekiyor.</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="mb-0">
                <BsSearch className="me-2" />
                Arama Debug Sayfası
              </CardTitle>
            </CardHeader>
            <CardBody>
              <Row className="g-3 mb-4">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Arama Sorgusu</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Aranacak kelimeyi girin..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Arama Türü</Form.Label>
                    <Form.Select
                      value={searchTypeInput}
                      onChange={(e) => setSearchTypeInput(e.target.value)}
                    >
                      <option value="all">Tümü</option>
                      <option value="users">Kullanıcılar</option>
                      <option value="scholars">Alimler</option>
                      <option value="followers">Takipçiler</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <Form.Label>&nbsp;</Form.Label>
                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      onClick={handleManualSearch}
                      disabled={isSearching || !query.trim()}
                    >
                      {isSearching ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Aranıyor...
                        </>
                      ) : (
                        <>
                          <BsSearch className="me-2" />
                          Context ile Ara
                        </>
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleDirectAPI}
                      disabled={!query.trim() || !session?.accessToken}
                    >
                      <BsEye className="me-2" />
                      Direkt API
                    </Button>
                  </div>
                </Col>
              </Row>

              {/* Session Bilgileri */}
              <Card className="mb-4">
                <CardHeader>
                  <h6 className="mb-0">Session Bilgileri</h6>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col md={6}>
                      <p><strong>Status:</strong> {status}</p>
                      <p><strong>Access Token:</strong> {session?.accessToken ? '✅ Mevcut' : '❌ Yok'}</p>
                      <p><strong>User ID:</strong> {session?.user?.id || 'N/A'}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Email:</strong> {session?.user?.email || 'N/A'}</p>
                      <p><strong>Name:</strong> {session?.user?.name || 'N/A'}</p>
                      <p><strong>Username:</strong> {session?.user?.username || 'N/A'}</p>
                    </Col>
                  </Row>
                </CardBody>
              </Card>

              {/* Context State Bilgileri */}
              <Card className="mb-4">
                <CardHeader>
                  <h6 className="mb-0">SearchContext State</h6>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col md={6}>
                      <p><strong>Search Query:</strong> {searchQuery || 'N/A'}</p>
                      <p><strong>Search Type:</strong> {searchType || 'N/A'}</p>
                      <p><strong>Is Searching:</strong> {isSearching ? '✅ Evet' : '❌ Hayır'}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Show Results:</strong> {showResults ? '✅ Evet' : '❌ Hayır'}</p>
                      <p><strong>Users Count:</strong> {searchResults.users.length}</p>
                      <p><strong>Scholars Count:</strong> {searchResults.scholars.length}</p>
                      <p><strong>Followers Count:</strong> {searchResults.followers.length}</p>
                    </Col>
                  </Row>
                </CardBody>
              </Card>

              {error && (
                <Alert variant="danger" className="mb-4">
                  <strong>Hata:</strong> {error}
                </Alert>
              )}

              {/* Context Search Results */}
              {showResults && (
                <Card className="mb-4">
                  <CardHeader>
                    <h6 className="mb-0">
                      Context Arama Sonuçları ({searchResults.users.length + searchResults.scholars.length + searchResults.followers.length})
                    </h6>
                  </CardHeader>
                  <CardBody>
                    {searchResults.users.length > 0 && (
                      <div className="mb-4">
                        <h6 className="text-primary mb-3">
                          <BsPerson className="me-2" />
                          Kullanıcılar ({searchResults.users.length})
                        </h6>
                        {searchResults.users.map(renderUserItem)}
                      </div>
                    )}

                    {searchResults.scholars.length > 0 && (
                      <div className="mb-4">
                        <h6 className="text-success mb-3">
                          <BsMortarboard className="me-2" />
                          Alimler ({searchResults.scholars.length})
                        </h6>
                        {searchResults.scholars.map(renderScholarItem)}
                      </div>
                    )}

                    {searchResults.followers.length > 0 && (
                      <div className="mb-4">
                        <h6 className="text-info mb-3">
                          <BsPeople className="me-2" />
                          Takipçiler ({searchResults.followers.length})
                        </h6>
                        {searchResults.followers.map(renderFollowerItem)}
                      </div>
                    )}

                    {searchResults.users.length === 0 &&
                      searchResults.scholars.length === 0 &&
                      searchResults.followers.length === 0 && (
                        <Alert variant="info">
                          <BsSearch className="me-2" />
                          Context arama sonucu bulunamadı.
                        </Alert>
                      )}
                  </CardBody>
                </Card>
              )}

              {/* Manual API Results */}
              {manualResults && (
                <Card>
                  <CardHeader>
                    <h6 className="mb-0">
                      Direkt API Sonuçları
                    </h6>
                  </CardHeader>
                  <CardBody>
                    <pre className="bg-light p-3 rounded">
                      {JSON.stringify(manualResults, null, 2)}
                    </pre>
                  </CardBody>
                </Card>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DebugSearchPage;
