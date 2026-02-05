'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { Badge } from 'react-bootstrap';
import { BsSearch, BsPerson, BsMortarboard, BsPeople } from 'react-icons/bs';

const SearchTestPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  const performSearch = async (query, type = 'all') => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      let results = { users: [], scholars: [], followers: [] };

      if (type === 'all' || type === 'users') {
        const usersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/search/users?q=${encodeURIComponent(query)}&limit=10`);
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          results.users = usersData.results || [];
        }
      }

      if (type === 'all' || type === 'scholars') {
        const scholarsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/search/scholars?q=${encodeURIComponent(query)}&limit=10`);
        if (scholarsResponse.ok) {
          const scholarsData = await scholarsResponse.json();
          results.scholars = scholarsData.results || [];
        }
      }

      if (type === 'all' || type === 'followers') {
        const followersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/search/followers?q=${encodeURIComponent(query)}&limit=10`);
        if (followersResponse.ok) {
          const followersData = await followersResponse.json();
          results.followers = followersData.results || [];
        }
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setError('Arama sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch(searchQuery, searchType);
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

  return (
    <div className="container py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card>
            <CardHeader>
              <CardTitle className="mb-0">
                <BsSearch className="me-2" />
                Arama API Test Sayfası
              </CardTitle>
            </CardHeader>
            <CardBody>
              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Arama Sorgusu</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Aranacak kelimeyi girin..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Arama Türü</Form.Label>
                      <Form.Select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                      >
                        <option value="all">Tümü</option>
                        <option value="users">Kullanıcılar</option>
                        <option value="scholars">Alimler</option>
                        <option value="followers">Takipçiler</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Label>&nbsp;</Form.Label>
                    <div className="d-grid">
                      <Button 
                        type="submit" 
                        variant="primary" 
                        disabled={isSearching || !searchQuery.trim()}
                      >
                        {isSearching ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Aranıyor...
                          </>
                        ) : (
                          <>
                            <BsSearch className="me-2" />
                            Ara
                          </>
                        )}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>

              {error && (
                <Alert variant="danger" className="mt-3">
                  {error}
                </Alert>
              )}

              {searchResults && (
                <div className="mt-4">
                  <h5>Arama Sonuçları</h5>
                  
                  {searchType === 'all' && (
                    <>
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
                    </>
                  )}

                  {searchType === 'users' && searchResults.users.map(renderUserItem)}
                  {searchType === 'scholars' && searchResults.scholars.map(renderScholarItem)}
                  {searchType === 'followers' && searchResults.followers.map(renderFollowerItem)}

                  {searchResults && 
                   searchResults.users.length === 0 && 
                   searchResults.scholars.length === 0 && 
                   searchResults.followers.length === 0 && (
                    <Alert variant="info">
                      <BsSearch className="me-2" />
                      Arama sorgunuzla eşleşen sonuç bulunamadı.
                    </Alert>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SearchTestPage;
