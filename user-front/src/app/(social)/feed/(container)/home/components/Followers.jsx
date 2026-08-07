'use client';

import { getWhoToFollow } from '@/helpers/data';
import Image from 'next/image';
import Link from 'next/link';
import { Button, Card } from 'react-bootstrap';
import { BsArrowClockwise } from 'react-icons/bs';
import React, { useState, useEffect } from 'react';
import { getUserIdFromToken } from '../../../../../../utils/auth';
import { useLanguage } from '@/context/useLanguageContext';
import { getProfilePath } from '@/utils/profileEncoder';
import { useSession } from 'next-auth/react';

const Followers = () => {
  const { t } = useLanguage();
  const { status } = useSession();
  const [whoToFollowData, setWhoToFollowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState({});

  // Helper function to create unique key for each follower
  const getFollowerKey = (follower) => {
    return `${follower.type}-${follower.id}`;
  };

  const fetchScholars = async () => {
    try {
      setLoading(true);
      const data = await getWhoToFollow('scholars', 10);
      if (data && data.length > 0) {
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        setWhoToFollowData(shuffled.slice(0, 8));
      } else {
        setWhoToFollowData([]);
      }
    } catch (error) {
      console.error('Error fetching who to follow data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholars();
  }, []);

  if (status !== 'authenticated') {
    return null;
  }

  // Helper function to get proper image URL
  const getImageUrl = (photoUrl) => {
    if (!photoUrl || typeof photoUrl !== 'string' || photoUrl === 'null') return '/profile/profile.png';
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) return photoUrl;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const path = photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`;
    return `${apiBaseUrl}${path}`;
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

      let endpoint, requestBody;

      if (followerType === 'scholar') {
        // Scholar follow
        endpoint = '/user-scholar-follow/follow';
        requestBody = {
          user_id: parseInt(userId),
          scholar_id: parseInt(followerId)
        };
      } else {
        // User follow
        endpoint = '/user-follow/follow';
        requestBody = {
          follower_id: parseInt(userId),
          following_id: parseInt(followerId)
        };
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        // Update the local state to reflect the follow status
        setWhoToFollowData(prev =>
          prev.map(item =>
            item.id === followerId && item.type === followerType
              ? { ...item, isFollowing: true }
              : item
          )
        );
        // Dispatch event to update other components (like ProfilePanel counts)
        window.dispatchEvent(new CustomEvent('followStatusChanged', {
          detail: { userId: followerId, type: followerType, status: 'following' }
        }));
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

      let endpoint, requestBody;

      if (followerType === 'scholar') {
        // Scholar unfollow
        endpoint = '/user-scholar-follow/unfollow';
        requestBody = {
          user_id: parseInt(userId),
          scholar_id: parseInt(followerId)
        };
      } else {
        // User unfollow
        endpoint = '/user-follow/unfollow';
        requestBody = {
          follower_id: parseInt(userId),
          following_id: parseInt(followerId)
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
        // Update the local state to reflect the follow status
        setWhoToFollowData(prev =>
          prev.map(item =>
            item.id === followerId && item.type === followerType
              ? { ...item, isFollowing: false }
              : item
          )
        );
        // Dispatch event to update other components (like ProfilePanel counts)
        window.dispatchEvent(new CustomEvent('followStatusChanged', {
          detail: { userId: followerId, type: followerType, status: 'unfollowed' }
        }));
      } else {
        console.error('Unfollow failed');
      }
    } catch (error) {
      console.error('Error unfollowing:', error);
    } finally {
      setFollowLoading(prev => ({ ...prev, [followerKey]: false }));
    }
  };
  return (
    <Card className="feed-surface-card feed-sidebar-card feed-sidebar-compact border-0">
      <div className="feed-sidebar-header d-flex justify-content-between align-items-center">
        <h6 className="feed-sidebar-title text-truncate pe-2">{t('feed.suggestedScholars')}</h6>
        <button
          type="button"
          className="feed-refresh-btn"
          onClick={fetchScholars}
          disabled={loading}
          title={t('common.refresh') || 'Yenile'}
          aria-label={t('common.refresh') || 'Yenile'}
        >
          <BsArrowClockwise
            size={16}
            style={{
              transition: 'transform 0.5s linear',
              transform: loading ? 'rotate(360deg)' : 'none',
            }}
          />
        </button>
      </div>

      <div className="feed-sidebar-body">
        <div className="feed-scholars-scroll">
          {loading ? (
            <div className="feed-loading-inline py-4">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">{t('common.loading')}</span>
              </div>
              <p className="mt-2 mb-0">{t('common.loading')}</p>
            </div>
          ) : whoToFollowData && whoToFollowData.length > 0 ? (
            whoToFollowData.map((follower, idx) => (
              <div className="feed-scholar-row hstack gap-2 mb-2" key={`${follower.type}-${follower.id}` || idx}>
                <span role="button" style={{ flexShrink: 0 }}>
                  <Image
                    className="feed-scholar-avatar"
                    src={getImageUrl(follower.photoUrl)}
                    alt={follower.name || follower.fullName}
                    width={34}
                    height={34}
                    loading="eager"
                    unoptimized
                    onError={(e) => {
                      e.target.src = '/profile/profile.png';
                    }}
                  />
                </span>

                <div className="overflow-hidden flex-grow-1">
                  {follower.id && follower.id !== 'undefined' ? (
                    <Link
                      className="feed-scholar-name d-block text-truncate"
                      href={getProfilePath(follower.type || 'scholar', follower.id) || '#'}
                    >
                      {follower.name || follower.fullName}
                    </Link>
                  ) : (
                    <span className="feed-scholar-name d-block text-truncate">
                      {follower.name || follower.fullName}
                    </span>
                  )}
                  <p className="feed-scholar-role text-muted text-truncate">{t('feed.scholar')}</p>
                </div>

                {follower.isFollowing ? (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="feed-follow-btn ms-auto"
                    onClick={() => handleUnfollow(follower.id, follower.type)}
                    disabled={followLoading[getFollowerKey(follower)]}
                  >
                    {followLoading[getFollowerKey(follower)] ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    ) : (
                      t('feed.unfollow')
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="primary-soft"
                    size="sm"
                    className="feed-follow-btn ms-auto"
                    onClick={() => handleFollow(follower.id, follower.type)}
                    disabled={followLoading[getFollowerKey(follower)]}
                  >
                    {followLoading[getFollowerKey(follower)] ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    ) : (
                      t('feed.follow')
                    )}
                  </Button>
                )}
              </div>
            ))
          ) : (
            <div className="feed-state-card py-4">
              <p className="mb-0">{t('feed.noSuggestionsYet')}</p>
            </div>
          )}
        </div>

        <div className="d-grid mt-2">
          <Link href="/feed/scholars">
            <Button variant="primary-soft" size="sm" className="w-100 rounded-pill feed-sidebar-footer-btn">
              {t('feed.viewAll')}
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
export default React.memo(Followers);