'use client';

import { useWebSocketChatContext } from '@/context/useWebSocketChatContext';
import { useAuthContext } from '@/context/useAuthContext';
import { useEffect, useRef, useMemo, useCallback, memo, useState } from 'react';
import { Card, Spinner } from 'react-bootstrap';
import { FaCheck, FaCheckDouble } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import { getToken } from '@/utils/auth';
import placeholderImg from '@/assets/images/avatar/placeholder.jpg';
import { useLanguage } from '@/context/useLanguageContext';
import { getProfilePath } from '@/utils/profileEncoder';

// Constants
const MESSAGE_STATUSES = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read'
};

// Helper functions - moved outside component to prevent recreation
const getDisplayAvatar = (photoUrl) => {
  if (!photoUrl || typeof photoUrl !== 'string') {
    return placeholderImg;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://') || photoUrl.startsWith('data:image/')) {
    return photoUrl;
  }

  if (photoUrl.startsWith('/uploads/')) {
    return `${apiUrl}${photoUrl}`;
  }

  if (photoUrl.startsWith('uploads/')) {
    return `${apiUrl}/${photoUrl}`;
  }

  if (!photoUrl.startsWith('/') && !photoUrl.includes('uploads/')) {
    return `${apiUrl}/uploads/${photoUrl}`;
  }

  return photoUrl;
};

const parseTimestamp = (timestamp) => {
  if (!timestamp) return null;

  try {
    let date;

    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string') {
      const invalidStrings = ['Invalid Date', 'null', 'undefined', ''];
      if (invalidStrings.includes(timestamp)) return null;
      date = new Date(timestamp);
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else if (timestamp?.toDate) {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }

    return (!date || isNaN(date.getTime())) ? null : date;
  } catch (error) {
    console.warn('Error parsing timestamp:', error);
    return null;
  }
};

const formatMessageTime = (timestamp, locale = 'tr-TR') => {
  const date = parseTimestamp(timestamp);
  if (!date) return '--:--';

  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDateHeader = (date, locale = 'tr-TR') => {
  if (!date) return '';

  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getMessageStatusIcon = (status) => {
  switch (status) {
    case MESSAGE_STATUSES.SENT:
      return <FaCheck className="text-muted" />;
    case MESSAGE_STATUSES.DELIVERED:
      return <FaCheckDouble className="text-muted" />;
    case MESSAGE_STATUSES.READ:
      return <FaCheckDouble className="text-info" />;
    default:
      return null;
  }
};

// Memoized Avatar Component - supports optional profile link
const Avatar = memo(({ src, alt, size = 32, className = '', profileHref }) => {
  const handleError = useCallback((e) => {
    e.target.src = placeholderImg;
  }, []);

  const image = (
    <Image
      src={getDisplayAvatar(src)}
      alt={alt}
      width={size}
      height={size}
      className="rounded-circle"
      onError={handleError}
      style={{ objectFit: 'cover', width: size, height: size, flexShrink: 0 }}
    />
  );

  if (profileHref) {
    return (
      <Link
        href={profileHref}
        className={`flex-shrink-0 ${className}`.trim()}
        style={{ width: size, height: size, display: 'block' }}
      >
        {image}
      </Link>
    );
  }

  return (
    <div className={`flex-shrink-0 ${className}`.trim()} style={{ width: size, height: size }}>
      {image}
    </div>
  );
});

// Memoized Message Item Component
const MessageItem = memo(({
  message,
  isOwnMessage,
  showDate,
  messageDate,
  ownAvatar,
  participantProfileHref,
  currentUserProfileHref
}) => {
  return (
    <div>
      {/* Date separator */}
      {showDate && messageDate && (
        <div className="text-center my-3">
          <span className="badge text-body-secondary border" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
            {formatDateHeader(messageDate, message.locale)}
          </span>
        </div>
      )}

      {/* Message */}
      <div className={clsx('message-item mb-3', {
        'text-end': isOwnMessage,
        'text-start': !isOwnMessage
      })}>
        <div className={clsx('d-flex align-items-start', {
          'justify-content-end': isOwnMessage,
          'justify-content-start': !isOwnMessage
        })}>
          {/* Avatar (other user) */}
          {!isOwnMessage && (
            <div className="flex-shrink-0 me-2">
              <Avatar
                src={message.partnerAvatar || message.sender?.photoUrl || message.senderAvatar}
                alt="Avatar"
                size={32}
                profileHref={participantProfileHref}
              />
            </div>
          )}

          {/* Message content */}
          <div className="message-content" style={{ maxWidth: '75%' }}>
            <div
              className={clsx('message-bubble p-3 rounded', {
                'bg-primary text-white': isOwnMessage,
                'bg-body-tertiary text-body': !isOwnMessage
              })}
              style={!isOwnMessage ? {
                border: '1px solid var(--bs-border-color)'
              } : {}}
            >
              <div className="message-text mb-1">
                {(() => {
                  try {
                    const parsed = JSON.parse(message.content);
                    if (parsed && parsed.type === 'post_share') {
                      const post = parsed.postData;
                      
                      const getYouTubeId = (url) => {
                        if (!url) return null;
                        const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                        return m ? m[1] : null;
                      };
                      const youtubeId = getYouTubeId(post.video_url);
                      
                      return (
                        <div style={{ maxWidth: '280px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--bs-border-color)', backgroundColor: 'var(--bs-body-bg)' }}>
                          <div className="d-flex align-items-center px-2 py-2 border-bottom">
                            <img src={getDisplayAvatar(post.authorAvatar)} alt="author" className="rounded-circle me-2 flex-shrink-0" style={{width: 24, height: 24, objectFit: 'cover'}} />
                            <small className="fw-bold text-truncate">{post.authorName || 'Kullanıcı'}</small>
                          </div>
                          {youtubeId ? (
                            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                              <iframe
                                src={`https://www.youtube.com/embed/${youtubeId}`}
                                title={post.title || 'Video'}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                              />
                            </div>
                          ) : post.image ? (
                            <img src={getDisplayAvatar(post.image)} alt="post" className="w-100" style={{maxHeight:'160px', objectFit:'cover', display:'block'}} />
                          ) : null}
                          <div className="px-2 py-2">
                            {post.title && <h6 className="fw-bold text-truncate mb-1" style={{fontSize: '13px'}}>{post.title}</h6>}
                            {post.caption && <p className="text-muted mb-2" style={{fontSize: '11px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{post.caption.replace(/<[^>]+>/g, '')}</p>}
                            <Link href={
                              post.postType === 'story' ? `/blogs/story/${post.id}` :
                              post.postType === 'book' ? `/books/${post.id}` :
                              post.postType === 'article' ? `/feed/articles/${post.id}` :
                              post.postType === 'podcast' ? `/feed/podcasts/${post.id}` :
                              post.postType === 'newsletter' ? `/feed/newsletters/${post.id}` :
                              post.authorId ? `${(getProfilePath(post.isUserPost ? 'user' : 'scholar', post.authorId, 'feed') || '')}#post-${post.id}` :
                              post.isUserPost ? `/feed/post/${post.id}?type=2` : `/feed/post/${post.id}?type=1`
                            } className="btn btn-sm btn-primary w-100 rounded-pill" style={{fontSize: '12px'}}>
                              Gönderiyi Gör
                            </Link>
                          </div>
                        </div>
                      );
                    }
                  } catch (e) {
                    return message.content;
                  }
                  return message.content;
                })()}
              </div>

              {/* Message meta */}
              <div className={clsx('message-meta d-flex align-items-center', {
                'justify-content-end': isOwnMessage,
                'justify-content-start': !isOwnMessage
              })}>
                <small className={clsx('me-2', isOwnMessage ? 'text-white-50' : 'text-muted')}>
                  {formatMessageTime(message.timestamp, message.locale)}
                </small>
                {isOwnMessage && getMessageStatusIcon(message.status)}
              </div>
            </div>
          </div>

          {/* Avatar (own message) */}
          {isOwnMessage && (
            <div className="flex-shrink-0 ms-2">
              <Avatar
                src={ownAvatar}
                alt="Avatar"
                size={32}
                profileHref={currentUserProfileHref}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// Memoized Typing Indicator Component
const TypingIndicator = memo(({ participantAvatar }) => {
  return (
    <div className="typing-indicator mb-3">
      <div className="d-flex align-items-center">
        <Avatar
          src={participantAvatar}
          alt="Avatar"
          size={32}
          className="me-2"
        />
        <div className="bg-body-tertiary p-2 rounded">
          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
});

// Memoized Header Component
const MessageHeader = memo(({ activeConversation, onBackToConversations, isOnline, participantAvatar, participantProfileHref, t }) => {
  return (
    <Card.Header className="border-0 bg-body-tertiary">
      <div className="d-flex align-items-center">
        {/* Mobile back button - only visible on mobile */}
        <button
          className="btn btn-link p-0 me-2 d-lg-none"
          onClick={onBackToConversations}
          aria-label={t('messaging.backToConversations')}
          title={t('messaging.backToConversations')}
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
          </svg>
        </button>

        <Avatar
          src={participantAvatar}
          alt="Avatar"
          size={40}
          className="me-3"
          profileHref={participantProfileHref}
        />
        <div className="flex-grow-1">
          <h6 className="mb-0">{activeConversation.participantName}</h6>
          <small className="text-muted">
            {isOnline ? t('messaging.online') : t('messaging.offline')}
          </small>
        </div>
      </div>
    </Card.Header>
  );
});

// Main Component
const MessageList = ({ onBackToConversations }) => {
  const { userInfo } = useAuthContext();
  const {
    messages,
    activeConversation,
    loading,
    markMessageAsRead,
    typingUsers,
    selectConversation,
    onlineUsers
  } = useWebSocketChatContext();

  const { t, language } = useLanguage();

  const messagesEndRef = useRef(null);
  const [ownAvatarFromProfile, setOwnAvatarFromProfile] = useState(null);

  // Memoized current user ID
  const currentUserId = useMemo(() => {
    try {
      const token = getToken();
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub;
      }
    } catch (error) {
      console.error('Error getting current user ID:', error);
    }
    return null;
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    const token = getToken();
    if (!token) return;

    let isMounted = true;
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');

    fetch(`${apiUrl}/users/${currentUserId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        setOwnAvatarFromProfile(data?.photoUrl || null);
      })
      .catch(() => {
        if (isMounted) setOwnAvatarFromProfile(null);
      });

    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  // Memoized filtered messages - PERFORMANCE IMPROVEMENT
  const filteredMessages = useMemo(() => {
    if (!activeConversation || !messages.length) return [];

    return messages.filter(message => {
      // Priority: conversationId match
      if (message.conversationId && message.conversationId === activeConversation.id) {
        return true;
      }

      // Fallback: participantId match for temp conversations
      if (currentUserId) {
        const participantId = activeConversation.participantId;
        return (String(message.senderId) === String(currentUserId) && String(message.receiverId) === String(participantId)) ||
          (String(message.senderId) === String(participantId) && String(message.receiverId) === String(currentUserId));
      }

      return false;
    });
  }, [messages, activeConversation, currentUserId]);

  // Memoized processed messages with date info
  const processedMessages = useMemo(() => {
    return filteredMessages.map((message, index) => {
      const messageDate = parseTimestamp(message.timestamp);
      const prevMessageDate = index > 0 ? parseTimestamp(filteredMessages[index - 1].timestamp) : null;

      const showDate = index === 0 ||
        (prevMessageDate && messageDate &&
          messageDate.toDateString() !== prevMessageDate.toDateString());

      return {
        ...message,
        messageDate,
        showDate,
        isOwnMessage: String(message.senderId) === String(currentUserId),
        locale: language === 'tr' ? 'tr-TR' : (language === 'en' ? 'en-US' : language)
      };
    });
  }, [filteredMessages, currentUserId, language]);

  // Optimized scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Auto scroll effect - yeni mesaj geldiğinde en alta kaydır
  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [processedMessages.length, scrollToBottom]);

  // Mark messages as read - optimized
  useEffect(() => {
    if (!activeConversation || !processedMessages.length || !currentUserId) return;

    const unreadMessages = processedMessages.filter(
      msg => !msg.isOwnMessage && msg.status !== MESSAGE_STATUSES.READ
    );

    if (unreadMessages.length === 0) return;

    // Batch mark as read to prevent multiple calls
    const timeoutId = setTimeout(() => {
      unreadMessages.forEach(msg => {
        markMessageAsRead(msg.id);
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [activeConversation?.id, processedMessages.length, currentUserId, markMessageAsRead]);

  // Check if user is typing
  const isTyping = useMemo(() => {
    return activeConversation?.id && typingUsers[activeConversation.id];
  }, [activeConversation, typingUsers]);

  const isConversationOnline = useMemo(() => {
    if (!activeConversation || !onlineUsers) return false;
    const participantId = String(activeConversation.participantId || '');
    const participantUsername = String(activeConversation.participantUsername || '').toLowerCase();
    const participantName = String(activeConversation.participantName || '').toLowerCase();

    return onlineUsers.some((onlineUser) => {
      if (onlineUser && typeof onlineUser === 'object') {
        const onlineId = String(onlineUser.id || onlineUser.userId || '');
        const onlineUsername = String(onlineUser.username || '').toLowerCase();
        return (
          (participantId && onlineId === participantId) ||
          (participantUsername && onlineUsername === participantUsername) ||
          (participantName && onlineUsername === participantName)
        );
      }

      const value = String(onlineUser).toLowerCase();
      return (
        (participantId && value === participantId) ||
        (participantUsername && value === participantUsername) ||
        (participantName && value === participantName)
      );
    });
  }, [activeConversation, onlineUsers]);

  const resolvedParticipantAvatar = useMemo(() => {
    if (activeConversation?.participantAvatar) {
      return activeConversation.participantAvatar;
    }
    const participantId = String(activeConversation?.participantId || '');
    const fromOnline = (onlineUsers || []).find((onlineUser) => {
      if (!onlineUser || typeof onlineUser !== 'object') return false;
      return String(onlineUser.id || onlineUser.userId || '') === participantId;
    });
    return fromOnline?.photoUrl || null;
  }, [activeConversation, onlineUsers]);

  const currentUserAvatar = useMemo(() => {
    return ownAvatarFromProfile || userInfo?.photoUrl || placeholderImg;
  }, [ownAvatarFromProfile, userInfo?.photoUrl]);

  // Handle back to conversations (mobile only)
  const handleBackToConversations = useCallback(() => {
    if (selectConversation) {
      selectConversation(null);
    }
    if (onBackToConversations) {
      onBackToConversations();
    }
  }, [selectConversation, onBackToConversations]);

  // Loading state
  if (loading) {
    return (
      <Card className="h-100 d-flex align-items-center justify-content-center">
        <Card.Body className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">{t('messaging.loadingMessages')}</p>
        </Card.Body>
      </Card>
    );
  }

  // No conversation selected
  if (!activeConversation) {
    return (
      <Card className="h-100 d-flex align-items-center justify-content-center">
        <Card.Body className="text-center text-muted">
          <div className="mb-3">
            <i className="fas fa-comments fa-3x"></i>
          </div>
          <h5>{t('messaging.selectConversationTitle')}</h5>
          <p className="mb-0">{t('messaging.selectConversationDesc')}</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="h-100 d-flex flex-column">
      {/* Header */}
      <MessageHeader
        activeConversation={activeConversation}
        onBackToConversations={handleBackToConversations}
        isOnline={isConversationOnline}
        participantAvatar={resolvedParticipantAvatar}
        participantProfileHref={activeConversation?.participantId ? getProfilePath('user', activeConversation.participantId) : undefined}
        t={t}
      />

      {/* Messages */}
      <Card.Body className="flex-grow-1 p-0 message-list-body" style={{ overflowY: 'auto' }}>
        <div className="messages-container p-3 d-flex flex-column justify-content-end" style={{ minHeight: '100%' }}>
          {processedMessages.length === 0 ? (
            <div className="text-center text-muted py-5">
              <div className="mb-3">
                <i className="fas fa-comment fa-2x"></i>
              </div>
              <h6>{t('messaging.noMessagesYet')}</h6>
              <p className="mb-0">{t('messaging.firstMessagePrompt')}</p>
            </div>
          ) : (
            <div className="messages-list">
              {processedMessages.map((message) => (
                <MessageItem
                  key={message.id}
                  message={{ ...message, partnerAvatar: resolvedParticipantAvatar }}
                  isOwnMessage={message.isOwnMessage}
                  showDate={message.showDate}
                  messageDate={message.messageDate}
                  ownAvatar={currentUserAvatar}
                  participantProfileHref={activeConversation?.participantId ? getProfilePath('user', activeConversation.participantId) : undefined}
                  currentUserProfileHref={currentUserId ? getProfilePath('user', currentUserId) : undefined}
                />
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <TypingIndicator participantAvatar={resolvedParticipantAvatar} />
              )}

              {/* Scroll reference */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </Card.Body>
      <style jsx>{`
        .message-list-body {
          min-height: 0;
        }

        @media (max-width: 991.98px) {
          .messages-container {
            padding: 0.85rem !important;
          }
        }
      `}</style>
    </Card>
  );
};

// Display name for debugging
Avatar.displayName = 'Avatar';
MessageItem.displayName = 'MessageItem';
TypingIndicator.displayName = 'TypingIndicator';
MessageHeader.displayName = 'MessageHeader';
MessageList.displayName = 'MessageList';

export default MessageList;