'use client';

import { useEffect, useState } from 'react';
import { FaSearch, FaUser, FaUserPlus } from 'react-icons/fa';
import { Spinner, Button } from 'react-bootstrap';
import Link from 'next/link';
import { getUserIdFromToken, authFetch } from '../../../../../utils/auth';
import { useLanguage } from '@/context/useLanguageContext';
import { getProfilePath } from '@/utils/profileEncoder';
import { useWebSocketChatContext } from '@/context/useWebSocketChatContext';
import PeopleCoverCard from '@/components/cards/PeopleCoverCard';
import { getPersonCoverUrl, getPersonAvatarUrl, truncateBio } from '@/utils/peopleCard';

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
    if (isSearching) return;

    try {
      setLoading(true);

      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/who-to-follow?page=${currentPage}&limit=${itemsPerPage}`
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
          const response = await authFetch(
            `${process.env.NEXT_PUBLIC_API_URL}/who-to-follow/search?q=${encodeURIComponent(searchTerm)}&page=${currentPage}&limit=${itemsPerPage}`
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

  const handleAvatarError = (e) => {
    e.target.src = '/profile/profile.png';
  };

  const handleFollow = async (followerId, followerType) => {
    const followerKey = `${followerType}-${followerId}`;
    try {
      setFollowLoading(prev => ({ ...prev, [followerKey]: true }));
      const userId = getUserIdFromToken();

      if (!userId) {
        console.error('User ID not found');
        return;
      }

      const requestBody = {
        follower_id: parseInt(userId),
        following_id: parseInt(followerId)
      };

      const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/user-follow/follow`, {
        method: 'POST',
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
      const userId = getUserIdFromToken();

      if (!userId) {
        console.error('User ID not found');
        return;
      }

      const requestBody = {
        follower_id: parseInt(userId),
        following_id: parseInt(followerId)
      };

      const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/user-follow/unfollow`, {
        method: 'DELETE',
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
      const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/user-follow/accept-request`, {
        method: 'POST',
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
      const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/user-follow/reject-request`, {
        method: 'POST',
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
        <div className="feed-people-page">
          <div className="feed-people-loading">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">{t('common.loading')}</span>
            </div>
            <p>{t('whoToFollow.loadingUsers')}</p>
          </div>
        </div>
      </div>
    );
  }

  const getRoleLabel = (user) => {
    if (user.type === 'scholar') return t('whoToFollow.scholar');
    if (user.role === 'admin') return t('whoToFollow.admin');
    if (user.role === 'moderator') return t('whoToFollow.moderator');
    return t('whoToFollow.user');
  };

  return (
    <div className="col-lg-9">
      <div className="feed-people-page">
        <div className="feed-people-header">
          <div>
            <h5 className="feed-people-title">
              <FaUser />
              {t('whoToFollow.users')}
            </h5>
            <p className="feed-people-subtitle">
              {isSearching
                ? `${totalCount} ${t('whoToFollow.resultsFound')}`
                : `${totalCount} ${t('whoToFollow.peopleFound')}`}
            </p>
          </div>
        </div>

        <div className="feed-people-toolbar">
          <div className="feed-people-search">
            {searchLoading ? (
              <div className="spinner-border spinner-border-sm text-success" role="status">
                <span className="visually-hidden">{t('search.searching')}</span>
              </div>
            ) : (
              <FaSearch />
            )}
            <input
              type="text"
              placeholder={t('whoToFollow.searchUserPlaceholder')}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {filteredUsers.length > 0 ? (
          <div className="feed-scholars-grid">
            {filteredUsers.map((user) => {
              const profileHref = getProfilePath(user.type || 'user', user.id) || null;
              const loadingKey = `${user.type}-${user.id}`;
              const isLoading = followLoading[loadingKey];
              const hasIncoming = user.hasIncomingRequest || followRequests.some(
                (req) => req.followerId == user.id || req.follower?.id == user.id
              );
              const bio = truncateBio(user.description || user.biography);

              let footer = null;
              if (hasIncoming) {
                footer = (
                  <>
                    <button
                      type="button"
                      className="feed-people-btn btn-follow"
                      onClick={() => handleAcceptRequest(user.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" /> : 'Kabul Et'}
                    </button>
                    <button
                      type="button"
                      className="feed-people-btn btn-danger-soft"
                      onClick={() => handleRejectRequest(user.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" /> : 'Sil'}
                    </button>
                  </>
                );
              } else if (user.followStatus === 'pending') {
                footer = (
                  <button
                    type="button"
                    className="feed-people-btn btn-pending"
                    onClick={() => handleUnfollow(user.id, user.type)}
                    disabled={isLoading}
                  >
                    {isLoading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" /> : 'İstek Gönderildi'}
                  </button>
                );
              } else if (user.isFollowing || user.followStatus === 'accepted') {
                footer = (
                  <button
                    type="button"
                    className="feed-people-btn btn-unfollow"
                    onClick={() => handleUnfollow(user.id, user.type)}
                    disabled={isLoading}
                  >
                    {isLoading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" /> : t('whoToFollow.unfollow')}
                  </button>
                );
              } else {
                footer = (
                  <button
                    type="button"
                    className="feed-people-btn btn-follow"
                    onClick={() => handleFollow(user.id, user.type)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    ) : (
                      <>
                        <FaUserPlus className="me-1" />
                        {t('whoToFollow.follow')}
                      </>
                    )}
                  </button>
                );
              }

              return (
                <PeopleCoverCard
                  key={loadingKey}
                  coverUrl={getPersonCoverUrl(user)}
                  avatarUrl={getPersonAvatarUrl(user.photoUrl)}
                  name={user.name}
                  meta={user.username ? `@${user.username}` : undefined}
                  bio={bio || undefined}
                  profileHref={profileHref}
                  badge={{
                    label: getRoleLabel(user),
                    variant: user.type === 'scholar' ? 'is-scholar' : 'is-user',
                  }}
                  onAvatarError={handleAvatarError}
                  footer={footer}
                />
              );
            })}
          </div>
        ) : (
          <div className="feed-people-empty">
            <FaSearch className="empty-icon" />
            <h6>{t('whoToFollow.noResultsTitle')}</h6>
            <p>{t('whoToFollow.noResultsDescription')}</p>
            <button
              type="button"
              className="feed-people-btn btn-outline"
              onClick={() => {
                setSearchTerm('');
                setIsSearching(false);
                setCurrentPage(1);
              }}
            >
              {t('whoToFollow.clearFilters')}
            </button>
          </div>
        )}

        {totalPages > 1 && (
          <div className="feed-people-pagination">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              {t('pagination.previous')}
            </Button>
            {generatePaginationItems()}
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              {t('pagination.next')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
