'use client';

import { useEffect, useState } from 'react';
import { FaSearch, FaGraduationCap, FaUsers, FaUserFriends } from 'react-icons/fa';
import Link from 'next/link';
import { getUserIdFromToken } from '../../../../../utils/auth';
import { useLanguage } from '@/context/useLanguageContext';
import { getProfilePath } from '@/utils/profileEncoder';
import PeopleCoverCard from '@/components/cards/PeopleCoverCard';
import { getPersonCoverUrl, getPersonAvatarUrl, truncateBio } from '@/utils/peopleCard';

export default function FollowingPage() {
  const { t } = useLanguage();
  const [followingData, setFollowingData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [unfollowLoading, setUnfollowLoading] = useState({});
  const [stats, setStats] = useState({
    followingUsersCount: 0,
    followingScholarsCount: 0,
    totalFollowingCount: 0
  });

  // Helper function to create unique key for each followed item
  const getFollowedKey = (item) => {
    return `${item.type}-${item.id}`;
  };

  useEffect(() => {
    const fetchFollowingData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          setLoading(false);
          return;
        }

        // Fetch following data
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/following?limit=100&type=all`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setFollowingData(data.items || []);
          setFilteredData(data.items || []);

          // Update stats - API returns usersCount/scholarsCount/totalCount, map to expected format
          if (data.stats) {
            const s = data.stats;
            setStats({
              followingUsersCount: s.followingUsersCount ?? s.usersCount ?? 0,
              followingScholarsCount: s.followingScholarsCount ?? s.scholarsCount ?? 0,
              totalFollowingCount: s.totalFollowingCount ?? s.totalCount ?? 0
            });
          }
        } else {
          console.error('Failed to fetch following data');
        }
      } catch (error) {
        console.error('Error fetching following data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowingData();
  }, []);

  useEffect(() => {
    let filtered = followingData;
    const term = searchTerm.trim().toLowerCase();

    // Filter by search term - API returns name, fullName (scholars), username (users)
    if (term) {
      filtered = filtered.filter(item => {
        if (item.name && item.name.toLowerCase().includes(term)) return true;
        if (item.fullName && item.fullName.toLowerCase().includes(term)) return true;
        if (item.username && item.username.toLowerCase().includes(term)) return true;
        return false;
      });
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    setFilteredData(filtered);
  }, [searchTerm, selectedType, followingData]);

  const handleAvatarError = (e) => {
    e.target.src = '/profile/profile.png';
  };

  // Unfollow function
  const handleUnfollow = async (itemId, itemType) => {
    const itemKey = `${itemType}-${itemId}`;
    try {
      setUnfollowLoading(prev => ({ ...prev, [itemKey]: true }));
      const token = localStorage.getItem('token');
      const userId = getUserIdFromToken();

      if (!userId) {
        console.error('User ID not found');
        return;
      }

      let endpoint, requestBody;

      if (itemType === 'scholar') {
        // Scholar unfollow
        endpoint = '/user-scholar-follow/unfollow';
        requestBody = {
          user_id: parseInt(userId),
          scholar_id: parseInt(itemId)
        };
      } else {
        // User unfollow
        endpoint = '/user-follow/unfollow';
        requestBody = {
          follower_id: parseInt(userId),
          following_id: parseInt(itemId)
        };
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        // Remove the item from the list
        setFollowingData(prev => prev.filter(item =>
          !(item.id === itemId && item.type === itemType)
        ));

        // Update stats
        if (itemType === 'scholar') {
          setStats(prev => ({
            ...prev,
            followingScholarsCount: Math.max(0, prev.followingScholarsCount - 1),
            totalFollowingCount: Math.max(0, prev.totalFollowingCount - 1)
          }));
        } else {
          setStats(prev => ({
            ...prev,
            followingUsersCount: Math.max(0, prev.followingUsersCount - 1),
            totalFollowingCount: Math.max(0, prev.totalFollowingCount - 1)
          }));
        }

        // Sol paneldeki (ProfilePanel) takip sayılarını güncelle
        window.dispatchEvent(new Event('followStatusChanged'));
      } else {
        console.error('Unfollow failed');
      }
    } catch (error) {
      console.error('Error unfollowing:', error);
    } finally {
      setUnfollowLoading(prev => ({ ...prev, [itemKey]: false }));
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
            <p>{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-lg-9">
      <div className="feed-people-page">
        <div className="feed-people-header">
          <div>
            <h5 className="feed-people-title">
              <FaUserFriends />
              {t('profileHeader.following')}
            </h5>
            <p className="feed-people-subtitle">
              {t('feed.scholarsUsersFound', {
                scholars: filteredData.filter((i) => i.type === 'scholar').length,
                users: filteredData.filter((i) => i.type === 'user').length
              })}
            </p>
          </div>
          <div className="feed-people-stats">
            <span className="feed-people-stat">
              <FaUsers className="me-1" />
              {stats.followingUsersCount} {t('followers.users')}
            </span>
            <span className="feed-people-stat">
              <FaGraduationCap className="me-1" />
              {stats.followingScholarsCount} {t('followers.scholars')}
            </span>
          </div>
        </div>

        <div className="feed-people-toolbar">
          <div className="feed-people-search">
            <FaSearch />
            <input
              type="text"
              placeholder={t('followers.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="feed-people-filter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">{t('followers.filterAll')} ({stats.totalFollowingCount})</option>
            <option value="user">{t('followers.filterUsers')} ({stats.followingUsersCount})</option>
            <option value="scholar">{t('followers.filterScholars')} ({stats.followingScholarsCount})</option>
          </select>
        </div>

        {filteredData.length > 0 ? (
          <div className="feed-scholars-grid">
            {filteredData.map((item) => {
              const profileHref = item.id && item.id !== 'undefined'
                ? getProfilePath(item.type || 'user', item.id) || null
                : null;
              const bio = truncateBio(item.biography || item.bio);
              const followedMeta = item.followedDate
                ? new Date(item.followedDate * 1000).toLocaleDateString('tr-TR')
                : undefined;

              return (
                <PeopleCoverCard
                  key={`${item.type}-${item.id}`}
                  coverUrl={getPersonCoverUrl(item)}
                  avatarUrl={getPersonAvatarUrl(item.photoUrl)}
                  name={item.name || item.fullName}
                  meta={item.username ? `@${item.username}` : followedMeta}
                  bio={bio || undefined}
                  profileHref={profileHref}
                  badge={{
                    label: item.type === 'scholar' ? t('followers.scholar') : t('followers.user'),
                    variant: item.type === 'scholar' ? 'is-scholar' : 'is-user',
                  }}
                  onAvatarError={handleAvatarError}
                  footer={(
                    <button
                      type="button"
                      className="feed-people-btn btn-unfollow"
                      onClick={() => handleUnfollow(item.id, item.type)}
                      disabled={unfollowLoading[getFollowedKey(item)]}
                    >
                      {unfollowLoading[getFollowedKey(item)] ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      ) : (
                        t('whoToFollow.unfollow')
                      )}
                    </button>
                  )}
                />
              );
            })}
          </div>
        ) : (
          <div className="feed-people-empty">
            <FaUserFriends className="empty-icon" />
            <h6>{t('whoToFollow.noResultsTitle')}</h6>
            <p>
              {searchTerm || selectedType !== 'all'
                ? t('followers.noFollowersFound')
                : t('whoToFollow.noResultsDescription')}
            </p>
            {!searchTerm && selectedType === 'all' && (
              <Link href="/feed/who-to-follow" className="feed-people-btn btn-follow">
                {t('followers.seeWhoToFollow')}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
