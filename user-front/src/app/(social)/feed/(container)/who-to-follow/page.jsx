'use client';

import { useEffect, useState } from 'react';
import { FaPlus, FaSearch, FaUser, FaUserPlus } from 'react-icons/fa';
import { Spinner, Button } from 'react-bootstrap';
import Link from 'next/link';
import './who-to-follow.css';
import { getUserIdFromToken } from '../../../../../utils/auth';
import { useLanguage } from '@/context/useLanguageContext';
import { useWebSocketChatContext } from '@/context/useWebSocketChatContext';

export default function WhoToFollowPage() {
  const { t } = useLanguage();
  const { followRequests, setFollowRequests } = useWebSocketChatContext();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [followLoading, setFollowLoading] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 15;

  const fetchData = async () => {
    if (isSearching) return; // Don't fetch if searching

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/who-to-follow?page=${currentPage}&limit=${itemsPerPage}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Normalize data
        const userItems = (data.users || []).map(u => ({
          id: u.id,
          type: u.type || 'user',
          name: u.name || [u.firstName, u.lastName].filter(Boolean).join(' '),
          username: u.username,
          firstName: u.firstName,
          lastName: u.lastName,
          photoUrl: u.photoUrl,
          description: u.description || u.biography,
          role: u.role,
          isFollowing: u.isFollowing || false,
          followStatus: u.followStatus || null,
          hasIncomingRequest: u.hasIncomingRequest || false
        }));

        setUsers(userItems);
        setFilteredUsers(userItems);
        setTotalCount(data.totalCount || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to create unique key for each follower
  const getFollowerKey = (follower) => {
    return `${follower.type}-${follower.id}`;
  };

  // Fetch users with pagination
  useEffect(() => {
    fetchData();
  }, [currentPage, isSearching]);

  // Sidebar veya başka yerden gelen takip durumu değişikliklerini dinle
  useEffect(() => {
    window.addEventListener('followStatusChanged', fetchData);
    return () => {
      window.removeEventListener('followStatusChanged', fetchData);
    };
  }, []);

  // Debounced search function
  useEffect(() => {
    if (loading) return;

    const searchTimeout = setTimeout(async () => {
      if (searchTerm.trim()) {
        setIsSearching(true);
        setSearchLoading(true);

        try {
          const token = localStorage.getItem('token');
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/who-to-follow/search?q=${encodeURIComponent(searchTerm)}&page=${currentPage}&limit=${itemsPerPage}`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.ok) {
            const data = await response.json();

            const userItems = (data.users || []).map(u => ({
              id: u.id,
              type: u.type || 'user',
              name: u.name || [u.firstName, u.lastName].filter(Boolean).join(' '),
              username: u.username,
              firstName: u.firstName,
              lastName: u.lastName,
              photoUrl: u.photoUrl,
              description: u.description || u.biography,
              role: u.role,
              isFollowing: u.isFollowing || false,
              followStatus: u.followStatus || null,
              hasIncomingRequest: u.hasIncomingRequest || false
            }));

            setFilteredUsers(userItems);
            setTotalCount(data.totalCount || 0);
            setTotalPages(data.totalPages || 1);
          } else {
            console.error('Search failed:', response.status);
            setFilteredUsers([]);
          }
        } catch (error) {
          console.error('Error performing search:', error);
          setFilteredUsers([]);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(searchTimeout);
  }, [searchTerm, currentPage, loading]);

  // Update filtered users when users change and not searching
  useEffect(() => {
    if (!isSearching && !searchTerm.trim()) {
      setFilteredUsers(users);
    }
  }, [users, isSearching, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(
        <Button
          key="first"
          variant="outline-primary"
          size="sm"
          onClick={() => handlePageChange(1)}
          style={{
            borderRadius: '8px',
            minWidth: '40px',
            padding: '0.5rem',
            fontWeight: '500'
          }}
        >
          1
        </Button>
      );
      if (startPage > 2) {
        items.push(
          <span key="ellipsis1" style={{
            padding: '0 0.25rem',
            color: '#64748b',
            fontWeight: '600'
          }}>...</span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Button
          key={i}
          variant={i === currentPage ? "primary" : "outline-primary"}
          size="sm"
          onClick={() => handlePageChange(i)}
          style={{
            borderRadius: '8px',
            minWidth: '40px',
            padding: '0.5rem',
            fontWeight: '500',
            transition: 'all 0.3s ease'
          }}
        >
          {i}
        </Button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <span key="ellipsis2" style={{
            padding: '0 0.25rem',
            color: '#64748b',
            fontWeight: '600'
          }}>...</span>
        );
      }
      items.push(
        <Button
          key="last"
          variant="outline-primary"
          size="sm"
          onClick={() => handlePageChange(totalPages)}
          style={{
            borderRadius: '8px',
            minWidth: '40px',
            padding: '0.5rem',
            fontWeight: '500'
          }}
        >
          {totalPages}
        </Button>
      );
    }

    return items;
  };

  const getImageUrl = (photoUrl) => {
    if (!photoUrl || photoUrl === 'null' || photoUrl === 'undefined') return '/profile/profile.png';
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');
    if (photoUrl.startsWith('/uploads/')) {
      return `${apiBaseUrl}${photoUrl}`;
    }
    if (photoUrl.startsWith('uploads/')) {
      return `${apiBaseUrl}/${photoUrl}`;
    }
    return photoUrl;
  };

  // Follow function
  const handleFollow = async (followerId, followerType) => {
    const followerKey = `${followerType}-${followerId}`;
    try {
      setFollowLoading(prev => ({ ...prev, [followerKey]: true }));
      const token = localStorage.getItem('token');
      const userId = getUserIdFromToken();

      if (!userId) {
        console.error('User ID not found');
        return;
      }

      const endpoint = '/user-follow/follow';
      const requestBody = {
        follower_id: parseInt(userId),
        following_id: parseInt(followerId)
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        // Update the local state
        const updateFn = item =>
          item.id == followerId && item.type == followerType
            ? { ...item, isFollowing: followerType === 'scholar' ? true : false, followStatus: followerType === 'scholar' ? 'accepted' : 'pending' }
            : item;

        setUsers(prev => prev.map(updateFn));
        setFilteredUsers(prev => prev.map(updateFn));

        // Sidebar istatistiklerini güncellemek için event fırlat
        window.dispatchEvent(new Event('followStatusChanged'));
      } else {
        console.error('Follow failed');
      }
    } catch (error) {
      console.error('Error following:', error);
    } finally {
      setFollowLoading(prev => ({ ...prev, [followerKey]: false }));
    }
  };

  // Unfollow function
  const handleUnfollow = async (followerId, followerType) => {
    const followerKey = `${followerType}-${followerId}`;
    try {
      setFollowLoading(prev => ({ ...prev, [followerKey]: true }));
      const token = localStorage.getItem('token');
      const userId = getUserIdFromToken();

      if (!userId) {
        console.error('User ID not found');
        return;
      }

      const endpoint = '/user-follow/unfollow';
      const requestBody = {
        follower_id: parseInt(userId),
        following_id: parseInt(followerId)
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        // Update the local state
        const updateFn = item =>
          item.id == followerId && item.type == followerType
            ? { ...item, isFollowing: false, followStatus: null }
            : item;

        setUsers(prev => prev.map(updateFn));
        setFilteredUsers(prev => prev.map(updateFn));

        // Sidebar istatistiklerini güncellemek için event fırlat
        window.dispatchEvent(new Event('followStatusChanged'));
      } else {
        console.error('Unfollow failed');
      }
    } catch (error) {
      console.error('Error unfollowing:', error);
    } finally {
      setFollowLoading(prev => ({ ...prev, [followerKey]: false }));
    }
  };

  const handleAcceptRequest = async (followerId) => {
    const followerKey = `user-${followerId}`;
    try {
      setFollowLoading(prev => ({ ...prev, [followerKey]: true }));
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-follow/accept-request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ follower_id: followerId })
      });
      if (response.ok) {
        const updateFn = u => u.id == followerId ? { ...u, hasIncomingRequest: false, isFollowing: true, followStatus: 'accepted' } : u;
        setUsers(prev => prev.map(updateFn));
        setFilteredUsers(prev => prev.map(updateFn));
        setFollowRequests(prev => prev.filter(req => req.followerId != followerId));

        // Sidebar istatistiklerini güncellemek için event fırlat
        window.dispatchEvent(new Event('followStatusChanged'));
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setFollowLoading(prev => ({ ...prev, [followerKey]: false }));
    }
  };

  const handleRejectRequest = async (followerId) => {
    const followerKey = `user-${followerId}`;
    try {
      setFollowLoading(prev => ({ ...prev, [followerKey]: true }));
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-follow/reject-request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ follower_id: followerId })
      });
      if (response.ok) {
        const updateFn = u => u.id == followerId ? { ...u, hasIncomingRequest: false } : u;
        setUsers(prev => prev.map(updateFn));
        setFilteredUsers(prev => prev.map(updateFn));
        setFollowRequests(prev => prev.filter(req => req.followerId != followerId));

        // Sidebar istatistiklerini güncellemek için event fırlat
        window.dispatchEvent(new Event('followStatusChanged'));
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setFollowLoading(prev => ({ ...prev, [followerKey]: false }));
    }
  };


  if (loading) {
    return (
      <div className="col-lg-9">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="mt-3 text-muted">{t('whoToFollow.loadingUsers')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="col-lg-9">
      <div className="card who-to-follow-card">
        <div className="card-header who-to-follow-header border-0 pb-0" style={{ padding: '1.5rem 1.5rem 0.5rem' }}>
          <div className="d-flex align-items-center justify-content-between">
            <h5 className="mb-0 fs-5 fw-bold">
              <FaUser className="me-2 text-primary" />
              {t('whoToFollow.users')}
            </h5>
            <span className="badge bg-light text-muted fw-normal" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', borderRadius: '10px' }}>
              {isSearching ? (
                <>
                  <FaSearch className="me-1 small" />
                  {totalCount} {t('whoToFollow.resultsFound')}
                </>
              ) : (
                `${totalCount} ${t('whoToFollow.peopleFound')}`
              )}
            </span>
          </div>
        </div>

        <div className="search-filter-section">
          <div className="row">
            <div className="col-md-12">
              <div className="input-group search-input-group shadow-sm">
                <span className="input-group-text border-0 bg-white ps-3">
                  {searchLoading ? (
                    <div className="spinner-border spinner-border-sm text-success" role="status">
                      <span className="visually-hidden">{t('search.searching')}</span>
                    </div>
                  ) : (
                    <FaSearch style={{ color: '#81C784' }} />
                  )}
                </span>
                <input
                  type="text"
                  className="form-control border-0 py-2 ps-2"
                  placeholder={t('whoToFollow.searchUserPlaceholder')}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  style={{ fontSize: '0.9rem', outline: 'none', boxShadow: 'none' }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="users-grid">
          <div className="row">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={`${user.type}-${user.id}`} className="user-card-col px-2 mb-4">
                  <div className="card h-100 border-0 shadow-sm user-item-card">
                    {/* Top Image Section - Edge to Edge */}
                    <Link href={`/profile/${user.type || 'user'}/${user.id}`} style={{ display: 'block', position: 'relative', width: '100%', aspectRatio: '1/1', overflow: 'hidden' }}>
                      <img
                        src={getImageUrl(user.photoUrl)}
                        alt={user.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease'
                        }}
                        className="user-card-img"
                        onError={(e) => {
                          e.target.src = '/profile/profile.png';
                        }}
                      />
                    </Link>

                    {/* Content Section */}
                    <div className="card-body p-3 d-flex flex-column text-center">
                      <div className="d-flex justify-content-center mb-2">
                        <span className={`role-badge ${user.type === 'scholar' ? 'bg-primary' : user.role === 'admin' ? 'bg-danger' : user.role === 'moderator' ? 'bg-info' : 'bg-secondary'}`}>
                          <FaUser className="me-1" style={{ fontSize: '0.42rem' }} />
                          {user.type === 'scholar'
                            ? t('whoToFollow.scholar')
                            : user.role === 'admin'
                              ? t('whoToFollow.admin')
                              : user.role === 'moderator'
                                ? t('whoToFollow.moderator')
                                : t('whoToFollow.user')}
                        </span>
                      </div>

                      <h6 className="mb-2 user-card-name">
                        <Link href={`/profile/${user.type || 'user'}/${user.id}`} className="text-decoration-none text-dark dark:text-white">
                          {user.name}
                        </Link>
                      </h6>

                      <div className="mt-auto pt-2">
                        {user.hasIncomingRequest || followRequests.some(req => (req.followerId == user.id || req.follower?.id == user.id)) ? (
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-primary btn-sm flex-fill fw-bold"
                              onClick={() => handleAcceptRequest(user.id)}
                              disabled={followLoading[`user-${user.id}`]}
                              style={{ borderRadius: '8px', padding: '0.4rem' }}
                            >
                              {followLoading[`user-${user.id}`] ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              ) : (
                                'Kabul Et'
                              )}
                            </button>
                            <button
                              className="btn btn-danger-soft btn-sm flex-fill fw-bold"
                              onClick={() => handleRejectRequest(user.id)}
                              disabled={followLoading[`user-${user.id}`]}
                              style={{ borderRadius: '8px', padding: '0.4rem' }}
                            >
                              {followLoading[`user-${user.id}`] ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              ) : (
                                'Sil'
                              )}
                            </button>
                          </div>
                        ) : user.isFollowing || user.followStatus === 'accepted' ? (
                          <button
                            className="unfollow-btn-custom"
                            onClick={() => handleUnfollow(user.id, user.type)}
                            disabled={followLoading[`${user.type}-${user.id}`]}
                          >
                            {followLoading[`${user.type}-${user.id}`] ? (
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : (
                              t('whoToFollow.unfollow')
                            )}
                          </button>
                        ) : user.followStatus === 'pending' ? (
                          <button
                            className="btn btn-outline-secondary w-100 fw-bold"
                            onClick={() => handleUnfollow(user.id, user.type)}
                            disabled={followLoading[`${user.type}-${user.id}`]}
                            style={{ borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                          >
                            {followLoading[`${user.type}-${user.id}`] ? (
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : (
                              'İstek Gönderildi'
                            )}
                          </button>
                        ) : (
                          <button
                            className="follow-btn-custom"
                            onClick={() => handleFollow(user.id, user.type)}
                            disabled={followLoading[`${user.type}-${user.id}`]}
                          >
                            {followLoading[`${user.type}-${user.id}`] ? (
                              <span className="spinner-border spinner-border-sm text-white" role="status" aria-hidden="true"></span>
                            ) : (
                              <>
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="white"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="me-2"
                                  style={{ display: 'inline-block', verticalAlign: 'middle' }}
                                >
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                  <circle cx="8.5" cy="7" r="4"></circle>
                                  <line x1="20" y1="8" x2="20" y2="14"></line>
                                  <line x1="23" y1="11" x2="17" y2="11"></line>
                                </svg>
                                <span>{t('whoToFollow.follow')}</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="empty-state">
                  <FaSearch className="empty-state-icon" />
                  <h5 className="text-muted">{t('whoToFollow.noResultsTitle')}</h5>
                  <p className="text-muted">
                    {t('whoToFollow.noResultsDescription')}
                  </p>
                  <button
                    className="btn clear-filters-btn"
                    onClick={() => {
                      setSearchTerm('');
                      setIsSearching(false);
                      setCurrentPage(1);
                    }}
                  >
                    {t('whoToFollow.clearFilters')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3 mt-md-4 pt-3" style={{
              borderTop: '1px solid rgba(181, 231, 160, 0.2)'
            }}>
              <div className="d-flex align-items-center flex-wrap pagination-wrapper" style={{
                gap: '0.5rem'
              }}>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {t('pagination.previous')}
                </Button>

                {generatePaginationItems()}

                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {t('pagination.next')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
