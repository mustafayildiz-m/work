'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import placeholderImg from '@/assets/images/avatar/placeholder.jpg';

const MessageEnvelopeNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();
  const timeoutsRef = useRef({});

  const getDisplayAvatar = (photoUrl) => {
    const defaultPlaceholder = typeof placeholderImg === 'string' ? placeholderImg : (placeholderImg?.src || '/images/avatar/placeholder.jpg');
    if (!photoUrl || photoUrl === 'null' || photoUrl === 'undefined') return defaultPlaceholder;
    if (typeof photoUrl === 'object') return photoUrl.src || defaultPlaceholder;
    if (typeof photoUrl !== 'string') return defaultPlaceholder;

    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');
    if (photoUrl.startsWith('http')) return photoUrl;
    if (photoUrl.startsWith('/uploads/')) return `${apiBaseUrl}${photoUrl}`;
    return `${apiBaseUrl}/uploads/${photoUrl}`;
  };

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, leaving: true } : n
    ));
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 400);
  }, []);

  const handleClick = useCallback((notification) => {
    if (timeoutsRef.current[notification.id]) {
      clearTimeout(timeoutsRef.current[notification.id]);
      delete timeoutsRef.current[notification.id];
    }
    removeNotification(notification.id);
    router.push('/messaging');
  }, [router, removeNotification]);

  useEffect(() => {
    const handleNewMessageNotification = (event) => {
      const { senderName, senderAvatar, content, messageId } = event.detail;

      const id = `msg-notif-${messageId || Date.now()}-${Math.random()}`;
      const notification = {
        id,
        senderName,
        senderAvatar,
        content,
        leaving: false,
        timestamp: Date.now()
      };

      setNotifications(prev => {
        const limited = prev.length >= 3 ? prev.slice(1) : prev;
        return [...limited, notification];
      });

      timeoutsRef.current[id] = setTimeout(() => {
        removeNotification(id);
        delete timeoutsRef.current[id];
      }, 5000);
    };

    window.addEventListener('newMessageEnvelopeNotification', handleNewMessageNotification);
    return () => {
      window.removeEventListener('newMessageEnvelopeNotification', handleNewMessageNotification);
      Object.values(timeoutsRef.current).forEach(clearTimeout);
    };
  }, [removeNotification]);

  if (notifications.length === 0) return null;

  return (
    <div className="message-envelope-container">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`envelope-notification ${notification.leaving ? 'envelope-leave' : 'envelope-enter'}`}
          style={{ '--index': index }}
          onClick={() => handleClick(notification)}
        >
          <div className="envelope-wrapper">
            {/* Animated envelope icon */}
            <div className="envelope-icon-area">
              <div className="envelope-animated">
                <div className="envelope-body">
                  <div className="envelope-flap" />
                  <div className="envelope-letter">
                    <div className="letter-lines">
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="envelope-content">
              <div className="envelope-header">
                <div className="envelope-avatar">
                  <Image
                    src={getDisplayAvatar(notification.senderAvatar)}
                    alt={notification.senderName || 'User'}
                    width={36}
                    height={36}
                    className="rounded-circle"
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="avatar-pulse" />
                </div>
                <div className="envelope-info">
                  <span className="envelope-sender">{notification.senderName || 'Birisi'}</span>
                  <span className="envelope-label">yeni mesaj gönderdi</span>
                </div>
              </div>
              <p className="envelope-message">{notification.content || ''}</p>
              <span className="envelope-cta">Mesajı görüntüle →</span>
            </div>
          </div>
        </div>
      ))}

      <style jsx>{`
        .message-envelope-container {
          position: fixed;
          top: 80px;
          right: 20px;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 12px;
          pointer-events: none;
        }

        .envelope-notification {
          pointer-events: all;
          cursor: pointer;
          width: 360px;
          border-radius: 16px;
          overflow: hidden;
          background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
          border: 1px solid rgba(99, 102, 241, 0.15);
          box-shadow: 
            0 20px 60px rgba(99, 102, 241, 0.15),
            0 8px 24px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        :global([data-bs-theme="dark"]) .envelope-notification {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid rgba(99, 102, 241, 0.3);
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.4),
            0 8px 24px rgba(99, 102, 241, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        :global([data-bs-theme="green"]) .envelope-notification {
          background: linear-gradient(135deg, #1a3a1e 0%, #0d2810 100%);
          border: 1px solid rgba(67, 160, 71, 0.3);
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.4),
            0 8px 24px rgba(67, 160, 71, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .envelope-notification:hover {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 
            0 24px 70px rgba(99, 102, 241, 0.2),
            0 12px 30px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .envelope-enter {
          animation: slideInEnvelope 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .envelope-leave {
          animation: slideOutEnvelope 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes slideInEnvelope {
          0% {
            opacity: 0;
            transform: translateX(120%) scale(0.8) rotateY(-10deg);
          }
          50% {
            opacity: 1;
            transform: translateX(-5%) scale(1.02) rotateY(2deg);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1) rotateY(0);
          }
        }

        @keyframes slideOutEnvelope {
          0% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(120%) scale(0.8);
          }
        }

        .envelope-wrapper {
          display: flex;
          align-items: stretch;
          padding: 0;
        }

        .envelope-icon-area {
          width: 72px;
          min-height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          flex-shrink: 0;
        }

        :global([data-bs-theme="green"]) .envelope-icon-area {
          background: linear-gradient(135deg, #2e7d32 0%, #43a047 100%);
        }

        .envelope-animated {
          animation: envelopeBounce 2s ease-in-out infinite;
        }

        @keyframes envelopeBounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-3px) rotate(-3deg); }
          75% { transform: translateY(-3px) rotate(3deg); }
        }

        .envelope-body {
          position: relative;
          width: 36px;
          height: 28px;
          background: #ffffff;
          border-radius: 3px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }

        .envelope-flap {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 14px;
          background: #f0f0f0;
          clip-path: polygon(0 0, 50% 100%, 100% 0);
          animation: flapOpen 1.5s ease-in-out infinite alternate;
          transform-origin: top center;
        }

        @keyframes flapOpen {
          0% { transform: rotateX(0deg); }
          100% { transform: rotateX(-30deg); }
        }

        .envelope-letter {
          position: absolute;
          top: 4px;
          left: 4px;
          right: 4px;
          height: 20px;
          background: #fff;
          border-radius: 2px;
          border: 1px solid #e0e0e0;
          animation: letterPeek 1.5s ease-in-out infinite alternate;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @keyframes letterPeek {
          0% { transform: translateY(4px); }
          100% { transform: translateY(-4px); }
        }

        .letter-lines {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 3px;
          width: 100%;
        }

        .letter-lines span {
          display: block;
          height: 2px;
          background: linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%);
          border-radius: 1px;
        }

        .letter-lines span:nth-child(1) { width: 80%; }
        .letter-lines span:nth-child(2) { width: 60%; }
        .letter-lines span:nth-child(3) { width: 40%; }

        :global([data-bs-theme="green"]) .letter-lines span {
          background: linear-gradient(90deg, #2e7d32 0%, #81c784 100%);
        }

        .envelope-content {
          flex: 1;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }

        .envelope-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .envelope-avatar {
          position: relative;
          flex-shrink: 0;
        }

        .avatar-pulse {
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 2px solid rgba(99, 102, 241, 0.5);
          animation: avatarPulseAnim 1.5s ease-in-out infinite;
        }

        :global([data-bs-theme="green"]) .avatar-pulse {
          border-color: rgba(67, 160, 71, 0.5);
        }

        @keyframes avatarPulseAnim {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0; }
        }

        .envelope-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .envelope-sender {
          font-weight: 700;
          font-size: 0.88rem;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        :global([data-bs-theme="dark"]) .envelope-sender,
        :global([data-bs-theme="green"]) .envelope-sender {
          color: #f1f5f9;
        }

        .envelope-label {
          font-size: 0.72rem;
          color: #6366f1;
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        :global([data-bs-theme="green"]) .envelope-label {
          color: #66bb6a;
        }

        .envelope-message {
          margin: 0;
          font-size: 0.82rem;
          color: #475569;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 220px;
          line-height: 1.4;
        }

        :global([data-bs-theme="dark"]) .envelope-message,
        :global([data-bs-theme="green"]) .envelope-message {
          color: #94a3b8;
        }

        .envelope-cta {
          font-size: 0.72rem;
          color: #6366f1;
          font-weight: 600;
          opacity: 0.8;
          transition: opacity 0.2s;
        }

        :global([data-bs-theme="green"]) .envelope-cta {
          color: #66bb6a;
        }

        .envelope-notification:hover .envelope-cta {
          opacity: 1;
        }

        @media (max-width: 575.98px) {
          .message-envelope-container {
            top: 65px;
            right: 10px;
            left: 10px;
          }

          .envelope-notification {
            width: 100%;
          }

          .envelope-icon-area {
            width: 56px;
          }

          .envelope-content {
            padding: 10px 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default MessageEnvelopeNotification;
