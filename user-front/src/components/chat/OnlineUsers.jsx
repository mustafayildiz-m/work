'use client';

import { useWebSocketChatContext } from '@/context/useWebSocketChatContext';
import { useAuthContext } from '@/context/useAuthContext';
import { useLayoutContext } from '@/context/useLayoutContext';
import { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import placeholderImg from '@/assets/images/avatar/placeholder.jpg';
import { getToken } from '@/utils/auth';
import { useLanguage } from '@/context/useLanguageContext';

// Helper functions
const getDisplayAvatar = (photoUrl, apiBaseUrl) => {
  const defaultPlaceholder = typeof placeholderImg === 'string' ? placeholderImg : (placeholderImg?.src || '/images/avatar/placeholder.jpg');

  if (!photoUrl) {
    return defaultPlaceholder;
  }

  // If photoUrl is an object
  if (typeof photoUrl === 'object') {
    return photoUrl.src || defaultPlaceholder;
  }

  if (typeof photoUrl !== 'string') {
    return defaultPlaceholder;
  }

  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://') || photoUrl.startsWith('data:image/')) {
    return photoUrl;
  }

  const cleanApiUrl = apiBaseUrl.replace(/\/$/, '');

  if (photoUrl.startsWith('/uploads/')) {
    return `${cleanApiUrl}${photoUrl}`;
  }

  if (photoUrl.startsWith('uploads/')) {
    return `${cleanApiUrl}/${photoUrl}`;
  }

  if (!photoUrl.startsWith('/') && !photoUrl.includes('uploads/')) {
    return `${cleanApiUrl}/uploads/${photoUrl}`;
  }

  return photoUrl;
};

const isCurrentUser = (user, userInfo) => {
  if (!user || !userInfo) return false;

  const currentUsername = userInfo?.username || userInfo?.email || '';
  const currentUserId = userInfo?.id || userInfo?.sub || '';

  return String(user.username) === String(currentUsername) ||
    String(user.id) === String(currentUserId);
};

const findUserConversation = (conversations, user) => {
  return conversations.find(conv =>
    String(conv.participantName) === String(user.username) ||
    String(conv.participantId) === String(user.id)
  );
};

const getDisplayName = (user, t) => {
  if (!user) return t('messaging.unknownUser');
  const firstName = (user.firstName || '').trim();
  const lastName = (user.lastName || '').trim();
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || user.username || t('messaging.unknownUser');
};

// Custom hook for API calls
const useUsersAPI = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);
  const intervalRef = useRef(null);

  const fetchUsers = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setAllUsers([]);
      setOnlineUsers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch both mutual connections and online users in parallel
      const [allUsersRes, onlineUsersRes] = await Promise.all([
        fetch(`${apiUrl}/user-follow/connections`, { headers, signal: abortControllerRef.current.signal }),
        fetch(`${apiUrl}/chat/online-users`, { headers, signal: abortControllerRef.current.signal })
      ]);

      if (!allUsersRes.ok || !onlineUsersRes.ok) {
        throw new Error(`HTTP Error fetching users`);
      }

      const allUsersData = await allUsersRes.json();
      const onlineUsersData = await onlineUsersRes.json();

      setAllUsers(Array.isArray(allUsersData) ? allUsersData : []);
      setOnlineUsers(Array.isArray(onlineUsersData) ? onlineUsersData : []);

    } catch (error) {
      if (error.name === 'AbortError') return;

      if (!error.message.includes('401')) {
        console.error('Error fetching users:', error);
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    fetchUsers();
    intervalRef.current = setInterval(fetchUsers, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchUsers]);

  // Refresh user list immediately when a follow request is accepted/changed
  useEffect(() => {
    const handleFollowChange = () => {
      fetchUsers();
    };
    window.addEventListener('followStatusChanged', handleFollowChange);
    return () => window.removeEventListener('followStatusChanged', handleFollowChange);
  }, [fetchUsers]);

  return {
    allUsers,
    onlineUsersList: onlineUsers,
    loading,
    error,
    refetch: fetchUsers
  };
};

const OnlineUsers = () => {
  const {
    conversations,
    selectConversation,
    createNewConversation
  } = useWebSocketChatContext();

  const { userInfo } = useAuthContext();
  const { conversationPanel, messagingOffcanvas } = useLayoutContext();
  const { t } = useLanguage();

  const { allUsers, onlineUsersList, loading, error, refetch } = useUsersAPI();

  const apiBaseUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }, []);

  const combinedUserDetails = useMemo(() => {
    if (!allUsers || allUsers.length === 0) return [];

    const onlineIds = new Set(onlineUsersList.map(u => String(u.id)));

    return allUsers.map((user) => {
      const userConversation = findUserConversation(conversations, user);
      const displayName = getDisplayName(user, t);

      return {
        id: user.id,
        name: displayName,
        username: user.username,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        avatar: getDisplayAvatar(user.photoUrl, apiBaseUrl),
        conversationId: userConversation?.id || null,
        isCurrentUser: isCurrentUser(user, userInfo),
        isOnline: onlineIds.has(String(user.id))
      };
    }).sort((a, b) => {
      if (a.isCurrentUser && !b.isCurrentUser) return -1;
      if (!a.isCurrentUser && b.isCurrentUser) return 1;
      // Online users first
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [allUsers, onlineUsersList, conversations, userInfo, apiBaseUrl, t]);

  const handleUserClick = useCallback(async (user) => {
    if (user.isCurrentUser) {
      return;
    }

    try {
      messagingOffcanvas.toggle();

      let conversation = null;

      if (user.conversationId) {
        conversation = conversations.find(conv => conv.id === user.conversationId);
      }

      if (!conversation) {
        conversation = conversations.find(conv =>
          String(conv.participantId) === String(user.id) ||
          String(conv.participantName) === String(user.name)
        );
      }

      if (conversation) {
        await selectConversation(conversation);
      } else {
        await createNewConversation(user.id, user.name, {
          avatar: user.avatar,
          username: user.username,
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          isOnline: user.isOnline,
        });
      }

      conversationPanel.toggle();

    } catch (error) {
      console.error('Error handling user click:', error);
    }
  }, [conversations, selectConversation, createNewConversation, messagingOffcanvas, conversationPanel]);

  const handleImageError = useCallback((e) => {
    e.target.src = placeholderImg.src || placeholderImg;
  }, []);

  return (
    <div className="card h-100">
      <div className="card-header border-0 pb-0">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            {t('messaging.contacts')}
            <span className="badge bg-success ms-2">
              {combinedUserDetails.filter(u => u.isOnline).length} {t('messaging.online')}
            </span>
          </h6>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={refetch}
            disabled={loading}
            title={t('messaging.refresh')}
          >
            {loading ? (
              <div className="spinner-border spinner-border-sm" role="status" />
            ) : (
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="card-body p-0">
        <div
          className="online-users-list"
          style={{
            height: '100%',
            overflowY: 'auto'
          }}
        >
          {loading && allUsers.length === 0 ? (
            <div className="p-3 text-center">
              <div className="spinner-border spinner-border-sm text-primary" role="status" />
              <div className="mt-2 text-muted small">{t('messaging.loadingUsers')}</div>
            </div>
          ) : error ? (
            <div className="alert alert-danger m-3">
              <div className="d-flex align-items-center">
                <svg width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                  <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                </svg>
                <div className="flex-grow-1">
                  <strong>{t('common.error')}</strong>
                  <div className="small">{error}</div>
                </div>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={refetch}
                >
                  {t('messaging.tryAgain')}
                </button>
              </div>
            </div>
          ) : combinedUserDetails.length === 0 ? (
            <div className="p-3 text-center text-muted">
              <p className="mb-0">{t('messaging.noUsersFound')}</p>
            </div>
          ) : (
            combinedUserDetails.map((user) => (
              <div
                key={user.id}
                className={`online-user-item p-3 border-bottom ${user.isCurrentUser ? 'bg-body-tertiary' : ''
                  }`}
                onClick={() => handleUserClick(user)}
                style={{
                  cursor: user.isCurrentUser ? 'default' : 'pointer',
                  opacity: user.isCurrentUser ? 0.7 : 1
                }}
                title={user.isCurrentUser ? t('messaging.thisIsYou') : t('messaging.chatWith', { name: user.name })}
                onMouseEnter={(e) => {
                  if (!user.isCurrentUser) {
                    e.currentTarget.style.backgroundColor = 'var(--bs-tertiary-bg)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!user.isCurrentUser) {
                    e.currentTarget.style.backgroundColor = '';
                  }
                }}
              >
                <div className="d-flex align-items-center">
                  <div className="position-relative me-3">
                    <Image
                      src={user.avatar}
                      alt={`${user.name} avatar`}
                      width={40}
                      height={40}
                      className="rounded-circle"
                      onError={handleImageError}
                      priority={false}
                    />
                    {user.isOnline && (
                      <div
                        className="position-absolute bottom-0 end-0 bg-success rounded-circle"
                        style={{
                          width: '10px',
                          height: '10px',
                          border: '2px solid var(--bs-body-bg)'
                        }}
                      />
                    )}
                  </div>

                  <div className="flex-grow-1">
                    <h6 className="mb-0">
                      {user.name}
                      {user.isCurrentUser && (
                        <span className="text-muted ms-2 small">{t('messaging.youSuffix')}</span>
                      )}
                    </h6>
                    {user.isOnline ? (
                      <small className="text-success">{t('messaging.online')}</small>
                    ) : (
                      <small className="text-muted">{t('messaging.offline')}</small>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OnlineUsers;