'use client';

import { useWebSocketChatContext } from '@/context/useWebSocketChatContext';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';

// Emoji picker'ı lazy load
const EmojiPicker = dynamic(() => import('@emoji-mart/react'), {
  ssr: false,
  loading: () => (
    <div className="p-2 text-muted small bg-white rounded shadow">
      Emoji yükleniyor...
    </div>
  )
});

// Constants
const TYPING_TIMEOUT = 2000;
const MAX_MESSAGE_LENGTH = 1000;
const TEXTAREA_MAX_HEIGHT = 120;
const TEXTAREA_MIN_HEIGHT = 40;

// Emoji data cache - moved inside component for better control
let emojiDataCache = null;

const MessageInput = () => {
  const {
    activeConversation,
    sendMessage,
    sendTypingStatus,
    isConnected
  } = useWebSocketChatContext();

  // State
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiData, setEmojiData] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  
  // Refs
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const lastTypingStatusRef = useRef(false);

  // Memoized values
  const trimmedMessage = useMemo(() => message.trim(), [message]);
  const isMessageValid = useMemo(() => {
    return trimmedMessage.length > 0 && trimmedMessage.length <= MAX_MESSAGE_LENGTH;
  }, [trimmedMessage]);

  const canSend = useMemo(() => {
    return isMessageValid && isConnected && !isSending && activeConversation;
  }, [isMessageValid, isConnected, isSending, activeConversation]);

  // Load emoji data on demand
  const loadEmojiData = useCallback(async () => {
    if (emojiDataCache) {
      setEmojiData(emojiDataCache);
      return;
    }

    try {
      const { default: data } = await import('@emoji-mart/data');
      emojiDataCache = data;
      setEmojiData(data);
    } catch (error) {
      console.error('Failed to load emoji data:', error);
    }
  }, []);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const newHeight = Math.min(
      Math.max(textarea.scrollHeight, TEXTAREA_MIN_HEIGHT),
      TEXTAREA_MAX_HEIGHT
    );
    textarea.style.height = `${newHeight}px`;
  }, []);

  // Optimized typing status management
  const updateTypingStatus = useCallback((isTyping) => {
    if (!activeConversation || !isConnected) return;
    
    // Only send if status changed
    if (lastTypingStatusRef.current !== isTyping) {
      sendTypingStatus(activeConversation.id, isTyping);
      lastTypingStatusRef.current = isTyping;
      isTypingRef.current = isTyping;
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing if user stops
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        updateTypingStatus(false);
      }, TYPING_TIMEOUT);
    }
  }, [activeConversation, isConnected, sendTypingStatus]);

  // Handle message change
  const handleMessageChange = useCallback((e) => {
    const value = e.target.value;
    setMessage(value);
    setError('');

    // Update typing status
    const isTyping = value.trim().length > 0;
    updateTypingStatus(isTyping);

    // Adjust height after state update
    setTimeout(adjustTextareaHeight, 0);
  }, [updateTypingStatus, adjustTextareaHeight]);

  // Handle message submission
  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    
    if (!canSend) {
      if (!trimmedMessage) {
        setError('Mesaj boş olamaz');
      } else if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
        setError(`Mesaj en fazla ${MAX_MESSAGE_LENGTH} karakter olabilir`);
      }
      return;
    }

    try {
      setIsSending(true);
      setError('');
      
      // Stop typing status
      updateTypingStatus(false);

      // Send message
      await sendMessage(trimmedMessage, activeConversation.participantId);
      
      // Reset form
      setMessage('');
      setShowEmojiPicker(false);
      
      // Reset textarea height
      setTimeout(adjustTextareaHeight, 0);
      
      // Focus back to textarea
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsSending(false);
    }
  }, [canSend, trimmedMessage, updateTypingStatus, sendMessage, activeConversation, adjustTextareaHeight]);

  // Handle key events
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  // Handle emoji selection
  const handleEmojiSelect = useCallback((emoji) => {
    if (!emoji?.native) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newMessage = message.slice(0, start) + emoji.native + message.slice(end);
    
    setMessage(newMessage);
    setShowEmojiPicker(false);
    
    // Update cursor position after emoji
    setTimeout(() => {
      const newPosition = start + emoji.native.length;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
      adjustTextareaHeight();
    }, 0);
  }, [message, adjustTextareaHeight]);

  // Handle emoji picker toggle
  const handleEmojiToggle = useCallback(async () => {
    if (!showEmojiPicker && !emojiData) {
      await loadEmojiData();
    }
    setShowEmojiPicker(prev => !prev);
  }, [showEmojiPicker, emojiData, loadEmojiData]);

  // Close emoji picker on outside click
  useEffect(() => {
    if (!showEmojiPicker) return;

    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  // Reset on conversation change
  useEffect(() => {
    setMessage('');
    setError('');
    setShowEmojiPicker(false);
    updateTypingStatus(false);
    setTimeout(adjustTextareaHeight, 0);
  }, [activeConversation?.id, updateTypingStatus, adjustTextareaHeight]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (activeConversation && isTypingRef.current) {
        sendTypingStatus(activeConversation.id, false);
      }
    };
  }, [activeConversation, sendTypingStatus]);

  // No conversation state
  if (!activeConversation) {
    return (
      <div className="p-3 bg-light text-center text-muted">
        <p className="mb-0">Mesaj göndermek için bir konuşma seçin</p>
      </div>
    );
  }

  // Disconnected state
  if (!isConnected) {
    return (
      <div className="p-3 bg-warning text-center">
        <div className="d-flex align-items-center justify-content-center text-white">
          <svg width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
          </svg>
          Bağlantı kesildi. Yeniden bağlanmaya çalışılıyor...
        </div>
      </div>
    );
  }

  return (
    <div 
      className="message-input-container p-3 position-relative" 
      style={{ 
        backgroundColor: '#f8f9fa', 
        borderTop: '1px solid #dee2e6',
        position: 'sticky',
        bottom: 0,
        zIndex: 10
      }}
    >
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          {/* Emoji button */}
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleEmojiToggle}
            disabled={isSending}
            aria-label="Emoji seç"
            title="Emoji seç"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M4.285 9.567a.5.5 0 0 1 .683.183A3.498 3.498 0 0 0 8 11.5a3.498 3.498 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.498 4.498 0 0 1 8 12.5a4.498 4.498 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zm4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5z"/>
            </svg>
          </button>

          {/* File upload button */}
          <button
            type="button"
            className="btn btn-outline-secondary"
            disabled={isSending}
            aria-label="Dosya ekle"
            title="Dosya ekle"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0V3z"/>
            </svg>
          </button>

          {/* Message textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            placeholder="Mesajınızı yazın..."
            className={`form-control ${error ? 'is-invalid' : ''}`}
            disabled={isSending}
            rows={1}
            maxLength={MAX_MESSAGE_LENGTH}
            style={{
              resize: 'none',
              minHeight: `${TEXTAREA_MIN_HEIGHT}px`,
              maxHeight: `${TEXTAREA_MAX_HEIGHT}px`,
              overflowY: 'auto'
            }}
            aria-label="Mesaj girin"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'message-error' : undefined}
          />

          {/* Send button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!canSend}
            aria-label="Mesaj gönder"
            title="Mesaj gönder"
          >
            {isSending ? (
              <div 
                className="spinner-border spinner-border-sm" 
                role="status"
                aria-hidden="true"
              />
            ) : (
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
              </svg>
            )}
          </button>
        </div>

        {/* Character count */}
        {message.length > MAX_MESSAGE_LENGTH * 0.8 && (
          <div className="text-end mt-1">
            <small className={`${message.length > MAX_MESSAGE_LENGTH ? 'text-danger' : 'text-muted'}`}>
              {message.length}/{MAX_MESSAGE_LENGTH}
            </small>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div id="message-error" className="text-danger small mt-1" role="alert">
            {error}
          </div>
        )}
      </form>

      {/* Emoji picker */}
      {showEmojiPicker && emojiData && (
        <div 
          ref={emojiPickerRef}
          className="position-absolute mb-2" 
          style={{ 
            bottom: '100%',
            left: '1rem',
            zIndex: 1000,
            maxWidth: 'calc(100vw - 2rem)'
          }}
        >
          <div className="shadow-lg rounded overflow-hidden">
            <EmojiPicker
              data={emojiData}
              onEmojiSelect={handleEmojiSelect}
              theme="light"
              locale="tr"
              previewPosition="none"
              skinTonePosition="none"
              maxFrequentRows={2}
              perLine={8}
              categories={[
                'frequent',
                'people',
                'nature',
                'foods',
                'activity',
                'places',
                'objects',
                'symbols'
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageInput;