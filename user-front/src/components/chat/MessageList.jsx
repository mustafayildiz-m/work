'use client';

import { useWebSocketChatContext } from '@/context/useWebSocketChatContext';
import { useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { Card, Spinner } from 'react-bootstrap';
import { FaCheck, FaCheckDouble } from 'react-icons/fa';
import Image from 'next/image';
import clsx from 'clsx';
import { getToken } from '@/utils/auth';
import placeholderImg from '@/assets/images/avatar/placeholder.jpg';

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

const formatMessageTime = (timestamp) => {
  const date = parseTimestamp(timestamp);
  if (!date) return '--:--';
  
  return date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDateHeader = (date) => {
  if (!date) return '';
  
  return date.toLocaleDateString('tr-TR', {
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

// Memoized Avatar Component
const Avatar = memo(({ src, alt, size = 32, className = '' }) => {
  const handleError = useCallback((e) => {
    e.target.src = placeholderImg;
  }, []);

  return (
    <Image
      src={getDisplayAvatar(src)}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-circle ${className}`}
      onError={handleError}
    />
  );
});

// Memoized Message Item Component
const MessageItem = memo(({ 
  message, 
  isOwnMessage, 
  showDate, 
  messageDate,
  currentUserId 
}) => {
  return (
    <div>
      {/* Date separator */}
      {showDate && messageDate && (
        <div className="text-center my-3">
          <span className="badge bg-light text-muted">
            {formatDateHeader(messageDate)}
          </span>
        </div>
      )}

      {/* Message */}
      <div className={clsx('message-item mb-3', {
        'text-end': isOwnMessage,
        'text-start': !isOwnMessage
      })}>
        <div className={clsx('d-flex', {
          'justify-content-end': isOwnMessage,
          'justify-content-start': !isOwnMessage
        })}>
          {/* Avatar (other user) */}
          {!isOwnMessage && (
            <div className="flex-shrink-0 me-2">
              <Avatar 
                src={message.sender?.photoUrl} 
                alt="Avatar" 
                size={32}
              />
            </div>
          )}

          {/* Message content */}
          <div className="message-content" style={{ maxWidth: '75%' }}>
            <div 
              className={clsx('message-bubble p-3 rounded', {
                'bg-primary text-white': isOwnMessage,
                'bg-secondary text-white': !isOwnMessage
              })}
              style={!isOwnMessage ? {
                backgroundColor: '#495057',
                border: '1px solid #6c757d'
              } : {}}
            >
              <div className="message-text mb-1">
                {message.content}
              </div>
              
              {/* Message meta */}
              <div className={clsx('message-meta d-flex align-items-center', {
                'justify-content-end': isOwnMessage,
                'justify-content-start': !isOwnMessage
              })}>
                <small className="text-white-50 me-2">
                  {formatMessageTime(message.timestamp)}
                </small>
                {isOwnMessage && getMessageStatusIcon(message.status)}
              </div>
            </div>
          </div>

          {/* Avatar (own message) */}
          {isOwnMessage && (
            <div className="flex-shrink-0 ms-2">
              <Avatar 
                src={message.receiver?.photoUrl} 
                alt="Avatar" 
                size={32}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// Memoized Typing Indicator Component
const TypingIndicator = memo(({ activeConversation }) => {
  return (
    <div className="typing-indicator mb-3">
      <div className="d-flex align-items-center">
        <Avatar 
          src={activeConversation.participantAvatar} 
          alt="Avatar" 
          size={32}
          className="me-2"
        />
        <div className="bg-light p-2 rounded">
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
const MessageHeader = memo(({ activeConversation, onBackToConversations }) => {
  return (
    <Card.Header className="border-0 bg-light">
      <div className="d-flex align-items-center">
        {/* Mobile back button - only visible on mobile */}
        <button
          className="btn btn-link p-0 me-2 d-lg-none"
          onClick={onBackToConversations}
          aria-label="Konuşmalara geri dön"
          title="Konuşmalara geri dön"
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
          </svg>
        </button>
        
        <Avatar 
          src={activeConversation.participantAvatar} 
          alt="Avatar" 
          size={40}
          className="me-3"
        />
        <div className="flex-grow-1">
          <h6 className="mb-0">{activeConversation.participantName}</h6>
          <small className="text-muted">
            {activeConversation.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
          </small>
        </div>
      </div>
    </Card.Header>
  );
});

// Main Component
const MessageList = ({ onBackToConversations }) => {
  const {
    messages,
    activeConversation,
    loading,
    markMessageAsRead,
    typingUsers,
    selectConversation
  } = useWebSocketChatContext();

  const messagesEndRef = useRef(null);
  
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
        return (message.senderId === currentUserId && String(message.receiverId) === String(participantId)) ||
               (String(message.senderId) === String(participantId) && message.receiverId === currentUserId);
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
        isOwnMessage: message.senderId === currentUserId
      };
    });
  }, [filteredMessages, currentUserId]);

  // Optimized scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Auto scroll effect - optimized
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
          <p className="mt-2 text-muted">Mesajlar yükleniyor...</p>
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
          <h5>Bir konuşma seçin</h5>
          <p className="mb-0">Mesajlaşmaya başlamak için sol taraftan bir konuşma seçin</p>
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
      />

      {/* Messages */}
      <Card.Body className="flex-grow-1 p-0" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
        <div className="messages-container p-3">
          {processedMessages.length === 0 ? (
            <div className="text-center text-muted py-5">
              <div className="mb-3">
                <i className="fas fa-comment fa-2x"></i>
              </div>
              <h6>Henüz mesaj yok</h6>
              <p className="mb-0">İlk mesajı göndererek konuşmayı başlatın</p>
            </div>
          ) : (
            <div className="messages-list">
              {processedMessages.map((message) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  isOwnMessage={message.isOwnMessage}
                  showDate={message.showDate}
                  messageDate={message.messageDate}
                  currentUserId={currentUserId}
                />
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <TypingIndicator activeConversation={activeConversation} />
              )}

              {/* Scroll reference */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </Card.Body>
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