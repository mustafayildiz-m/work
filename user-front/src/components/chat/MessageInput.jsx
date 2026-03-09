'use client';

import { useWebSocketChatContext } from '@/context/useWebSocketChatContext';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { BsEmojiSmileFill, BsSendFill, BsPersonPlus } from 'react-icons/bs';
import { useLanguage } from '@/context/useLanguageContext';
import { useOptionalNotificationContext } from '@/context/useNotificationContext';

// Emoji picker'ı lazy load
const EmojiPicker = dynamic(() => import('@emoji-mart/react'), {
  ssr: false,
  loading: () => {
    const { t } = useLanguage();
    return (
      <div className="p-2 text-muted small bg-white rounded shadow">
        {t('messaging.emojiLoading')}
      </div>
    );
  }
});

// Constants
const TYPING_TIMEOUT = 2000;
const MAX_MESSAGE_LENGTH = 1000;
const TEXTAREA_MAX_HEIGHT = 120;
const TEXTAREA_MIN_HEIGHT = 40;

// Emoji data cache - moved inside component for better control
let emojiDataCache = null;

const MessageInput = () => {
  const { t, language } = useLanguage();
  const notificationContext = useOptionalNotificationContext();
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
  const [errorType, setErrorType] = useState(''); // 'FOLLOW_REQUIRED' | ''
  const [isDarkTheme, setIsDarkTheme] = useState(false);

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
    setErrorType('');

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
        setError(t('messaging.emptyMessageError'));
      } else if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
        setError(t('messaging.maxLengthError', { count: MAX_MESSAGE_LENGTH }));
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

    } catch (err) {
      console.error('Error sending message:', err);
      if (err?.message === 'FOLLOW_REQUIRED') {
        const msg = t('messaging.followRequired');
        setError(msg);
        setErrorType('FOLLOW_REQUIRED');
        notificationContext?.showNotification?.({
          title: t('common.warning'),
          message: msg,
          variant: 'warning',
          delay: 6000
        });
      } else {
        setError(t('messaging.sendError'));
        setErrorType('');
      }
    } finally {
      setIsSending(false);
    }
  }, [canSend, trimmedMessage, updateTypingStatus, sendMessage, activeConversation, adjustTextareaHeight, t]);

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
    setErrorType('');
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

  // Track current theme for adaptive UI/emoji picker
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const updateThemeState = () => {
      const currentTheme = document.documentElement.getAttribute('data-bs-theme');
      setIsDarkTheme(currentTheme === 'dark');
    };

    updateThemeState();

    const observer = new MutationObserver(updateThemeState);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-bs-theme'],
    });

    return () => observer.disconnect();
  }, []);

  // No conversation state
  if (!activeConversation) {
    return (
      <div className="p-3 bg-light text-center text-muted">
        <p className="mb-0">{t('messaging.selectConversationPrompt')}</p>
      </div>
    );
  }

  // Disconnected state
  if (!isConnected) {
    return (
      <div className="p-3 bg-warning text-center">
        <div className="d-flex align-items-center justify-content-center text-white">
          <svg width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
          </svg>
          {t('messaging.disconnectedError')}
        </div>
      </div>
    );
  }

  return (
    <div
      className="message-input-container p-3 position-relative"
      style={{
        background:
          'linear-gradient(180deg, rgba(var(--bs-body-bg-rgb), 0.72) 0%, rgba(var(--bs-body-bg-rgb), 0.95) 100%)',
        borderTop: '1px solid var(--bs-border-color)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        bottom: 0,
        zIndex: 10,
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))'
      }}
    >
      <form onSubmit={handleSubmit}>
        <div
          className="d-flex align-items-end gap-2 p-2 rounded-4 message-composer-shell"
          style={{
            background: 'var(--bs-secondary-bg)',
            border: '1px solid var(--bs-border-color)',
            boxShadow: isDarkTheme
              ? '0 12px 32px rgba(0, 0, 0, 0.35)'
              : '0 10px 28px rgba(15, 23, 42, 0.10)',
          }}
        >
          {/* Emoji button */}
          <button
            type="button"
            className="btn emoji-btn"
            onClick={handleEmojiToggle}
            disabled={isSending}
            aria-label={t('messaging.selectEmoji')}
            title={t('messaging.selectEmoji')}
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              border: '1px solid var(--bs-border-color)',
              background: isDarkTheme
                ? 'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.07) 100%)'
                : 'linear-gradient(145deg, #ffffff 0%, #f2f5fb 100%)',
              color: isDarkTheme ? '#ffd166' : '#ff9f1c',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow:
                isDarkTheme
                  ? '0 8px 18px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.06)'
                  : '0 8px 18px rgba(31, 51, 96, 0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
              transition: 'transform 0.18s ease, box-shadow 0.2s ease, border-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow =
                isDarkTheme
                  ? '0 12px 24px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.12)'
                  : '0 12px 24px rgba(31, 51, 96, 0.18), inset 0 1px 0 rgba(255,255,255,1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow =
                isDarkTheme
                  ? '0 8px 18px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.06)'
                  : '0 8px 18px rgba(31, 51, 96, 0.12), inset 0 1px 0 rgba(255,255,255,0.9)';
            }}
          >
            <BsEmojiSmileFill size={18} />
          </button>

          {/* Message textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            placeholder={t('messaging.writeMessage')}
            className={`form-control ${error ? 'is-invalid' : ''}`}
            disabled={isSending}
            rows={1}
            maxLength={MAX_MESSAGE_LENGTH}
            style={{
              resize: 'none',
              minHeight: `${TEXTAREA_MIN_HEIGHT}px`,
              maxHeight: `${TEXTAREA_MAX_HEIGHT}px`,
              overflowY: 'auto',
              borderRadius: 14,
              border: '1px solid var(--bs-border-color)',
              background: 'var(--bs-body-bg)',
              color: 'var(--bs-body-color)',
              boxShadow: 'none',
            }}
            aria-label={t('messaging.enterMessage')}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'message-error' : undefined}
          />

          {/* Send button */}
          <button
            type="submit"
            className="btn send-btn"
            disabled={!canSend}
            aria-label={t('messaging.sendMessage')}
            title={t('messaging.sendMessage')}
            style={{
              width: 46,
              height: 46,
              borderRadius: 16,
              border: canSend
                ? '1px solid rgba(87, 163, 255, 0.6)'
                : '1px solid rgba(255,255,255,0.10)',
              background: canSend
                ? 'linear-gradient(145deg, #2f8cff 0%, #1a73ff 60%, #1458f5 100%)'
                : (isDarkTheme
                  ? 'linear-gradient(145deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.06) 100%)'
                  : 'linear-gradient(145deg, #d9deea 0%, #c7cfdf 100%)'),
              color: canSend ? '#ffffff' : (isDarkTheme ? 'rgba(255,255,255,0.7)' : '#7c879d'),
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: canSend
                ? '0 14px 30px rgba(23, 103, 255, 0.45), inset 0 1px 0 rgba(255,255,255,0.32)'
                : (isDarkTheme
                  ? '0 8px 18px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06)'
                  : '0 8px 16px rgba(27,39,94,0.12), inset 0 1px 0 rgba(255,255,255,0.55)'),
              transition: 'transform 0.18s ease, box-shadow 0.2s ease, filter 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!canSend) return;
              e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
              e.currentTarget.style.filter = 'brightness(1.05)';
              e.currentTarget.style.boxShadow =
                '0 18px 34px rgba(61, 132, 255, 0.52), inset 0 1px 0 rgba(255,255,255,0.48)';
            }}
            onMouseLeave={(e) => {
              if (!canSend) return;
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.filter = 'brightness(1)';
              e.currentTarget.style.boxShadow =
                '0 14px 30px rgba(61, 132, 255, 0.42), inset 0 1px 0 rgba(255,255,255,0.38)';
            }}
          >
            {isSending ? (
              <div
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              <BsSendFill size={16} />
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

        {/* Error message - şık uyarı followRequired için */}
        {error && (
          <div
            id="message-error"
            role="alert"
            className={`mt-2 p-2 rounded-3 small d-flex align-items-start gap-2 ${
              errorType === 'FOLLOW_REQUIRED'
                ? 'bg-warning bg-opacity-15 border border-warning border-opacity-50 text-warning-emphasis'
                : 'text-danger'
            }`}
          >
            {errorType === 'FOLLOW_REQUIRED' && (
              <BsPersonPlus size={16} className="flex-shrink-0 mt-0.5" />
            )}
            <span>{error}</span>
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
              theme={isDarkTheme ? 'dark' : 'light'}
              locale={language === 'tr' ? 'tr' : 'en'}
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
      <style jsx>{`
        @media (max-width: 575.98px) {
          .message-input-container {
            padding: 0.6rem !important;
          }

          .message-composer-shell {
            gap: 0.45rem !important;
            padding: 0.45rem !important;
            border-radius: 12px !important;
          }

          .emoji-btn {
            width: 38px !important;
            height: 38px !important;
            border-radius: 12px !important;
          }

          .send-btn {
            width: 40px !important;
            height: 40px !important;
            border-radius: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MessageInput;