'use client';

import { useWebSocketChatContext } from '@/context/useWebSocketChatContext';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { timeSince } from '@/utils/date';
import placeholderImg from '@/assets/images/avatar/placeholder.jpg';
import { useLanguage } from '@/context/useLanguageContext';
import OnlineStatusDot from './OnlineStatusDot';

const ConversationList = ({ onNewMessage }) => {
  const {
    conversations,
    activeConversation,
    selectConversation,
    onlineUsers,
    isParticipantOnline,
    loading,
    searchMessages,
    deleteConversation
  } = useWebSocketChatContext();

  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);

  // Online status check
  const isUserOnline = useCallback((conversation) => {
    return isParticipantOnline(conversation, onlineUsers);
  }, [isParticipantOnline, onlineUsers]);

  // Search function
  const handleSearch = useCallback(async (query) => {
    if (!query || !query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchMessages(query);
      setSearchResults(results || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchMessages]);

  // Debounced search
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (searchQuery) {
      const timer = setTimeout(() => {
        handleSearch(searchQuery);
      }, 500);
      setDebounceTimer(timer);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [searchQuery]);

  // Display helpers
  const getDisplayName = useCallback((conversation) => {
    return conversation?.participantName || t('messaging.unknownUser');
  }, [t]);

  const getDisplayAvatar = useCallback((conversation) => {
    const defaultPlaceholder = typeof placeholderImg === 'string' ? placeholderImg : (placeholderImg?.src || '/images/avatar/placeholder.jpg');

    if (!conversation?.participantAvatar) return defaultPlaceholder;

    const avatar = conversation.participantAvatar;

    if (typeof avatar === 'object') {
      return avatar.src || defaultPlaceholder;
    }

    if (typeof avatar !== 'string') return defaultPlaceholder;

    if (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('data:image/')) {
      return avatar;
    }

    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');

    if (avatar.startsWith('/uploads/')) {
      return `${apiUrl}${avatar}`;
    }

    if (avatar.startsWith('uploads/')) {
      return `${apiUrl}/${avatar}`;
    }

    if (!avatar.startsWith('/') && !avatar.includes('uploads/')) {
      return `${apiUrl}/uploads/${avatar}`;
    }

    return avatar;
  }, []);

  // Conversation click handler
  const handleConversationClick = useCallback((conversation) => {
    if (!conversation) return;
    selectConversation(conversation);
  }, [selectConversation]);

  // Delete handlers - FIXED: Direct approach
  const handleDeleteClick = useCallback((conversation) => {
    if (!conversation) {
      console.error('No conversation provided to delete');
      return;
    }

    setConversationToDelete(conversation);
    setShowDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!conversationToDelete || !deleteConversation) return;

    try {
      await deleteConversation(conversationToDelete.id);
      setShowDeleteDialog(false);
      setConversationToDelete(null);
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }, [conversationToDelete, deleteConversation]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteDialog(false);
    setConversationToDelete(null);
  }, []);

  // Sorted conversations
  const sortedConversations = useMemo(() => {
    if (!conversations || conversations.length === 0) return [];

    return [...conversations].sort((a, b) => {
      const aTime = a.lastMessageTime ? new Date(a.lastMessageTime) : new Date(0);
      const bTime = b.lastMessageTime ? new Date(b.lastMessageTime) : new Date(0);
      return bTime - aTime;
    });
  }, [conversations]);

  // Loading state
  if (loading) {
    return (
      <div className="messaging-pane-card h-100">
        <div className="flex-grow-1 d-flex justify-content-center align-items-center">
          <div className="text-center">
            <div className="spinner-border spinner-border-sm text-primary mb-2" role="status">
              <span className="visually-hidden">{t('common.loading')}</span>
            </div>
            <div className="text-muted small">{t('messaging.loadingConversations')}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="messaging-pane-card h-100">
      <div className="messaging-pane-header">
        <div className="d-flex justify-content-between align-items-center gap-2">
          <div className="d-flex align-items-center gap-2 min-width-0">
            <h6 className="text-truncate">{t('messaging.conversations')}</h6>
            <span className="badge bg-primary rounded-pill">
              {sortedConversations.length}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-primary rounded-pill flex-shrink-0 d-lg-none"
            onClick={onNewMessage}
            title={t('messaging.newMessage')}
          >
            {t('messaging.newMessage')}
          </button>
        </div>
      </div>

      <div className="px-3 py-2 border-bottom">
        <div className="position-relative">
          <input
            type="text"
            className="form-control form-control-sm messaging-search-input"
            placeholder={`${t('messaging.searchPlaceholder')}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div
            className="position-absolute top-50 translate-middle-y text-muted"
            style={{ left: '12px' }}
          >
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="p-3 border-bottom search-results-container">
          <h6 className="mb-2 fw-semibold">{t('messaging.searchResults')}</h6>
          {isSearching ? (
            <div className="text-center py-2">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">{t('messaging.searching')}</span>
              </div>
              <span className="ms-2 small text-muted">{t('messaging.searching')}</span>
            </div>
          ) : searchResults.length > 0 ? (
            <div>
              {searchResults.slice(0, 3).map((result, index) => (
                <div
                  key={`search-${index}-${result.id || index}`}
                  className="mb-2 p-2 rounded"
                  style={{
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    backgroundColor: 'var(--bs-body-bg)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bs-tertiary-bg)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bs-body-bg)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                  onClick={() => {
                    const conv = sortedConversations.find(c =>
                      c.participantId === result.senderId ||
                      c.participantId === result.receiverId
                    );
                    if (conv) handleConversationClick(conv);
                  }}
                >
                  <div className="fw-semibold small">{result.senderName || t('messaging.unknownUser')}</div>
                  <div className="text-muted small text-truncate">
                    {(() => {
                      try {
                        const parsed = JSON.parse(result.content);
                        if (parsed && parsed.type === 'post_share') return '📷 [Gönderi Paylaşıldı]';
                      } catch(e) {}
                      return result.content;
                    })()}
                  </div>
                  <div className="text-muted" style={{ fontSize: '12px' }}>
                    {result.timestamp ? timeSince(new Date(result.timestamp)) : ''}
                  </div>
                </div>
              ))}
              {searchResults.length > 3 && (
                <div className="text-muted text-center small mt-2">
                  {t('messaging.moreResults', { count: searchResults.length - 3 })}
                </div>
              )}
            </div>
          ) : (
            <div className="text-muted small">{t('messaging.noSearchResults')}</div>
          )}
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-grow-1 min-height-0">
        <div className="conversations-list h-100 overflow-auto">
          {sortedConversations.length === 0 ? (
            <div className="messaging-empty-state">
              <div className="empty-icon">💬</div>
              <h6>{t('messaging.noConversations')}</h6>
              <p className="mb-3 d-none d-lg-block">{t('messaging.startConversationHint')}</p>
              <p className="mb-3 d-lg-none">{t('messaging.startConversationHintMobile')}</p>
              {onNewMessage && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary rounded-pill d-lg-none"
                  onClick={onNewMessage}
                >
                  {t('messaging.pickContact')}
                </button>
              )}
            </div>
          ) : (
            sortedConversations.map((conversation) => {
              const isActive = activeConversation?.id === conversation.id;
              const isOnline = isUserOnline(conversation);
              const hasUnread = conversation.unreadCount > 0;

              return (
                <div
                  key={conversation.id}
                  className={`messaging-conversation-item position-relative ${isActive ? 'is-active' : ''}`}
                >
                  <div className="d-flex align-items-center">
                    <div className="position-relative me-2 flex-shrink-0">
                      <Image
                        src={getDisplayAvatar(conversation)}
                        alt={`${getDisplayName(conversation)} avatar`}
                        width={40}
                        height={40}
                        className={`messaging-conversation-avatar ${isActive ? 'border-primary' : ''}`}
                        onError={(e) => {
                          e.target.src = placeholderImg.src || placeholderImg;
                        }}
                      />
                      <OnlineStatusDot visible={isOnline} size={11} />
                    </div>

                    <div
                      className="flex-grow-1 min-width-0"
                      onClick={() => handleConversationClick(conversation)}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className={`mb-0 text-truncate small ${hasUnread ? 'fw-bold' : 'fw-semibold'}`}>
                          {getDisplayName(conversation)}
                        </h6>
                        {conversation.lastMessageTime && (
                          <small className="text-muted text-nowrap ms-2" style={{ fontSize: '0.7rem' }}>
                            {timeSince(new Date(conversation.lastMessageTime))}
                          </small>
                        )}
                      </div>

                      <div className="d-flex justify-content-between align-items-center">
                        <p className={`mb-0 text-truncate me-2 ${hasUnread ? 'text-body-emphasis fw-medium' : 'text-muted'}`} style={{ fontSize: '0.8125rem' }}>
                          {(() => {
                            if (!conversation.lastMessage) return t('messaging.noMessage');
                            try {
                              const parsed = JSON.parse(conversation.lastMessage);
                              if (parsed && parsed.type === 'post_share') {
                                return '📷 [Gönderi Paylaşıldı]';
                              }
                            } catch(e) {}
                            return conversation.lastMessage;
                          })()}
                        </p>
                        {hasUnread && (
                          <span className="badge bg-danger rounded-pill" style={{ fontSize: '0.65rem' }}>
                            {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="messaging-delete-btn ms-2 flex-shrink-0 d-flex align-items-center justify-content-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(conversation);
                      }}
                      title={t('messaging.deleteConversation')}
                      aria-label={t('messaging.deleteConversation')}
                    >
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteDialog && conversationToDelete && (
        <>
          <div
            className="modal-backdrop show"
            style={{ zIndex: 9999 }}
            onClick={handleDeleteCancel}
          />
          <div
            className="modal show"
            style={{
              display: 'block',
              zIndex: 10000
            }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {t('messaging.deleteConfirmTitle')}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleDeleteCancel}
                  />
                </div>
                <div className="modal-body">
                  <p className="mb-3">
                    {t('messaging.deleteConfirmDesc', { name: conversationToDelete.participantName || t('messaging.unknownUser') })}
                  </p>
                  <p className="text-muted small mb-0">
                    {t('messaging.deleteConfirmNote')}
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleDeleteCancel}
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDeleteConfirm}
                  >
                    <svg width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                      <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                    </svg>
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Custom CSS */}
      <style jsx>{`
        .search-results-container {
          background-color: var(--bs-tertiary-bg);
        }

        .min-width-0 {
          min-width: 0;
        }

        .min-height-0 {
          min-height: 0;
        }

        .conversations-list::-webkit-scrollbar {
          width: 5px;
        }

        .conversations-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .conversations-list::-webkit-scrollbar-thumb {
          background: var(--bs-border-color);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default ConversationList;