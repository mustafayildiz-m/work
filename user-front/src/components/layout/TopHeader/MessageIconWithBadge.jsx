'use client';

import Link from 'next/link';
import { BsChatLeftTextFill } from 'react-icons/bs';
import { useWebSocketChatContext } from '@/context/useWebSocketChatContext';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';


const MessageIconWithBadge = () => {
  const { status } = useSession();
  const { conversations } = useWebSocketChatContext();

  // Okunmamış mesaj sayısını hesapla
  const unreadCount = useMemo(() => {
    return conversations.reduce((total, conversation) => {
      return total + (conversation.unreadCount || 0);
    }, 0);
  }, [conversations]);

  if (status === 'unauthenticated') return null;


  return (
    <>
      <Link className="nav-link bg-light icon-md btn btn-light p-0 position-relative message-icon-link" href="/messaging">
        <BsChatLeftTextFill size={15} className="message-icon" />

        {/* Badge - sadece okunmamış mesaj varsa göster */}
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger message-badge"
            style={{
              fontSize: '0.6rem',
              minWidth: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2px 6px',
              zIndex: 10
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Link>

      <style jsx>{`
        @media (max-width: 991.98px) {
          :global(.message-icon-link) {
            width: 32px !important;
            height: 32px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          
          :global(.message-icon) {
            font-size: 13px !important;
          }
          
          :global(.message-badge) {
            font-size: 0.55rem !important;
            min-width: 16px !important;
            height: 16px !important;
            padding: 1px 4px !important;
          }
        }

        @media (max-width: 575.98px) {
          :global(.message-icon-link) {
            width: 30px !important;
            height: 30px !important;
          }
          
          :global(.message-icon) {
            font-size: 12px !important;
          }
          
          :global(.message-badge) {
            font-size: 0.5rem !important;
            min-width: 14px !important;
            height: 14px !important;
          }
        }
      `}</style>
    </>
  );
};

export default MessageIconWithBadge;
