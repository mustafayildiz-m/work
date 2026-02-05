'use client';

import { useWebSocketChatContext } from '@/context/useWebSocketChatContext';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { timeSince } from '@/utils/date';
import placeholderImg from '@/assets/images/avatar/placeholder.jpg';

const ConversationList = () => {
  const {
    conversations,
    activeConversation,
    selectConversation,
    onlineUsers,
    loading,
    searchMessages,
    deleteConversation
  } = useWebSocketChatContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);

  // Online status check
  const isUserOnline = useCallback((userId) => {
    if (!onlineUsers || !userId) return false;
    const userIdStr = String(userId);
    return onlineUsers.some(onlineUser => String(onlineUser) === userIdStr);
  }, [onlineUsers]);

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
    return conversation?.participantName || 'Bilinmeyen Kullanıcı';
  }, []);

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
      <div className="card h-100">
        <div className="card-body d-flex justify-content-center align-items-center">
          <div className="text-center">
            <div className="spinner-border text-primary mb-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="text-muted small">Konuşmalar yükleniyor...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-100">
      {/* Header */}
      <div className="card-header border-0 pb-0">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Konuşmalar</h6>
          <span className="badge bg-primary rounded-pill">
            {sortedConversations.length}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-bottom">
        <div className="position-relative">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Mesajlarda ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              paddingLeft: '40px',
              borderRadius: '20px',
              fontSize: '14px'
            }}
          />
          <div
            className="position-absolute top-50 translate-middle-y"
            style={{ left: '12px' }}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="p-3 border-bottom bg-light">
          <h6 className="mb-2 fw-semibold">Arama Sonuçları</h6>
          {isSearching ? (
            <div className="text-center py-2">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Aranıyor...</span>
              </div>
              <span className="ms-2 small text-muted">Aranıyor...</span>
            </div>
          ) : searchResults.length > 0 ? (
            <div>
              {searchResults.slice(0, 3).map((result, index) => (
                <div
                  key={`search-${index}-${result.id || index}`}
                  className="mb-2 p-2 bg-white rounded"
                  style={{
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f8f9fa';
                    e.target.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.transform = 'translateX(0)';
                  }}
                  onClick={() => {
                    const conv = sortedConversations.find(c =>
                      c.participantId === result.senderId ||
                      c.participantId === result.receiverId
                    );
                    if (conv) handleConversationClick(conv);
                  }}
                >
                  <div className="fw-semibold small">{result.senderName || 'Bilinmeyen'}</div>
                  <div className="text-muted small text-truncate">{result.content}</div>
                  <div className="text-muted" style={{ fontSize: '12px' }}>
                    {result.timestamp ? timeSince(new Date(result.timestamp)) : ''}
                  </div>
                </div>
              ))}
              {searchResults.length > 3 && (
                <div className="text-muted text-center small mt-2">
                  +{searchResults.length - 3} sonuç daha
                </div>
              )}
            </div>
          ) : (
            <div className="text-muted small">Sonuç bulunamadı</div>
          )}
        </div>
      )}

      {/* Conversations List */}
      <div className="card-body p-0">
        <div
          className="conversations-list"
          style={{
            maxHeight: 'calc(100vh - 250px)',
            overflowY: 'auto'
          }}
        >
          {sortedConversations.length === 0 ? (
            <div className="p-4 text-center text-muted">
              <div className="mb-3" style={{ fontSize: '48px' }}>💬</div>
              <h6 className="mb-2">Henüz konuşma yok</h6>
              <p className="small mb-0">Yeni bir mesaj göndererek konuşma başlatın</p>
            </div>
          ) : (
            sortedConversations.map((conversation) => {
              const isActive = activeConversation?.id === conversation.id;
              const isOnline = isUserOnline(conversation.participantId);
              const hasUnread = conversation.unreadCount > 0;

              return (
                <div
                  key={conversation.id}
                  className={`conversation-item p-3 border-bottom position-relative ${isActive ? 'bg-primary bg-opacity-10' : ''
                    }`}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '';
                    }
                  }}
                >
                  <div className="d-flex align-items-center">
                    {/* Avatar */}
                    <div className="position-relative me-3 flex-shrink-0">
                      <div
                        className="position-relative overflow-hidden"
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '50%',
                          border: isActive ? '2px solid #0d6efd' : '2px solid #e9ecef'
                        }}
                      >
                        <Image
                          src={getDisplayAvatar(conversation)}
                          alt={`${getDisplayName(conversation)} avatar`}
                          width={52}
                          height={52}
                          style={{ objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = placeholderImg.src || placeholderImg;
                          }}
                        />
                      </div>
                      {isOnline && (
                        <div
                          className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-white"
                          style={{
                            width: '16px',
                            height: '16px'
                          }}
                        />
                      )}
                    </div>

                    {/* Conversation Info - Clickable */}
                    <div
                      className="flex-grow-1 min-width-0"
                      onClick={() => handleConversationClick(conversation)}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className={`mb-0 text-truncate ${hasUnread ? 'fw-bold' : 'fw-semibold'}`}>
                          {getDisplayName(conversation)}
                        </h6>
                        {conversation.lastMessageTime && (
                          <small className="text-muted text-nowrap ms-2">
                            {timeSince(new Date(conversation.lastMessageTime))}
                          </small>
                        )}
                      </div>

                      <div className="d-flex justify-content-between align-items-center">
                        <p className={`mb-0 small text-truncate me-2 ${hasUnread ? 'text-dark fw-medium' : 'text-muted'
                          }`}>
                          {conversation.lastMessage || 'Henüz mesaj yok'}
                        </p>
                        {hasUnread && (
                          <span className="badge bg-danger rounded-pill">
                            {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete Button - Simple and Direct */}
                    <div className="ms-3 flex-shrink-0">
                      <button
                        className="btn btn-outline-danger btn-sm rounded-circle d-flex align-items-center justify-content-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(conversation);
                        }}
                        title="Konuşmayı Sil"
                        style={{
                          width: '36px',
                          height: '36px',
                          padding: '0',
                          borderWidth: '1px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#dc3545';
                          e.target.style.borderColor = '#dc3545';
                          e.target.style.color = 'white';
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.borderColor = '#dc3545';
                          e.target.style.color = '#dc3545';
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                          <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                        </svg>
                      </button>
                    </div>
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
                    Konuşmayı Sil
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleDeleteCancel}
                  />
                </div>
                <div className="modal-body">
                  <p className="mb-3">
                    <strong>{conversationToDelete.participantName}</strong> ile olan konuşmayı silmek istediğinizden emin misiniz?
                  </p>
                  <p className="text-muted small mb-0">
                    Bu konuşma sadece sizin için silinecektir. Diğer katılımcı konuşmayı görmeye devam edecektir.
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleDeleteCancel}
                  >
                    İptal
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
                    Sil
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Custom CSS */}
      <style jsx>{`
        .conversations-list::-webkit-scrollbar {
          width: 6px;
        }

        .conversations-list::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .conversations-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .conversations-list::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        .min-width-0 {
          min-width: 0;
        }
      `}</style>
    </div>
  );
};

export default ConversationList;