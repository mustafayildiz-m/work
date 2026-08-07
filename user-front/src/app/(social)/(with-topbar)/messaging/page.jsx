'use client';

import ConversationList from '@/components/chat/ConversationList';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import OnlineUsers from '@/components/chat/OnlineUsers';
import { useWebSocketChatContext } from '@/context/useWebSocketChatContext';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/useLanguageContext';

const Messaging = () => {
  const { t } = useLanguage();
  const { activeConversation, conversations, selectConversation, createNewConversation, loading: chatLoading } = useWebSocketChatContext();
  const [showConversationList, setShowConversationList] = useState(true);
  const [mobileListView, setMobileListView] = useState('conversations');
  const searchParams = useSearchParams();
  const deepLinkHandled = useRef(false);

  useEffect(() => {
    if (deepLinkHandled.current || chatLoading) return;

    const userId = searchParams.get('userId');
    if (!userId) return;

    deepLinkHandled.current = true;

    const userName = searchParams.get('userName') || '';
    const userUsername = searchParams.get('userUsername') || '';
    const userAvatar = searchParams.get('userAvatar') || '';

    const openConversation = async () => {
      const existingConv = conversations.find(
        (conv) => String(conv.participantId) === String(userId)
      );

      if (existingConv) {
        await selectConversation(existingConv);
      } else {
        await createNewConversation(Number(userId) || userId, userName, {
          avatar: userAvatar || null,
          username: userUsername || null,
          firstName: userName.split(' ')[0] || null,
          lastName: userName.split(' ').slice(1).join(' ') || null,
        });
      }

      if (window.innerWidth < 992) {
        setShowConversationList(false);
      }
    };

    openConversation();
  }, [searchParams, conversations, chatLoading, selectConversation, createNewConversation]);

  useEffect(() => {
    if (activeConversation && window.innerWidth < 992) {
      setShowConversationList(false);
    }
  }, [activeConversation]);

  const handleBackToConversations = () => {
    setShowConversationList(true);
  };

  const handleContactSelect = () => {
    if (window.innerWidth < 992) {
      setShowConversationList(false);
    }
  };

  const handleNewMessage = () => {
    if (window.innerWidth < 992) {
      setMobileListView('users');
      setShowConversationList(true);
    }
  };

  return (
    <main className="messaging-main messaging-page">
      <div className="container-fluid messaging-page-container h-100 px-2 px-lg-3 py-2">
        <div className="row gx-2 gx-lg-3 h-100">
          <div
            className={`col-lg-3 h-100 ${showConversationList ? 'd-block' : 'd-none d-lg-block'}`}
          >
            <div className="h-100 d-flex flex-column messaging-pane">
              <div className="d-lg-none p-2 mb-2 messaging-pane-card">
                <div className="btn-group w-100" role="group" aria-label={t('messaging.messagingListView')}>
                  <button
                    type="button"
                    className={`btn btn-sm ${mobileListView === 'conversations' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setMobileListView('conversations')}
                  >
                    {t('messaging.conversations')}
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${mobileListView === 'users' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setMobileListView('users')}
                  >
                    {t('messaging.contacts')}
                  </button>
                </div>
              </div>
              {mobileListView === 'users' ? (
                <div className="d-lg-none flex-grow-1" style={{ minHeight: 0 }}>
                  <OnlineUsers embedded onUserSelect={handleContactSelect} />
                </div>
              ) : (
                <div className="flex-grow-1" style={{ minHeight: 0 }}>
                  <ConversationList onNewMessage={handleNewMessage} />
                </div>
              )}
            </div>
          </div>

          <div
            className={`col-lg-6 h-100 ${!showConversationList ? 'd-block' : 'd-none d-lg-block'}`}
          >
            <div className="h-100 d-flex flex-column messaging-pane-card messaging-chat-column">
              <div className="flex-grow-1" style={{ minHeight: 0 }}>
                <MessageList onBackToConversations={handleBackToConversations} />
              </div>
              <div className="message-input-wrapper">
                <MessageInput compact />
              </div>
            </div>
          </div>

          <div className="col-lg-3 h-100 d-none d-lg-block">
            <OnlineUsers embedded onUserSelect={handleContactSelect} />
          </div>
        </div>
      </div>
      <style jsx>{`
        .messaging-main {
          height: calc(100dvh - 64px);
          min-height: calc(100dvh - 64px);
          overflow: hidden;
        }

        .messaging-pane,
        .messaging-chat-column {
          min-height: 0;
        }

        .message-input-wrapper {
          flex-shrink: 0;
        }

        @media (max-width: 991.98px) {
          .messaging-main {
            height: calc(100dvh - 60px);
            min-height: calc(100dvh - 60px);
          }
        }
      `}</style>
    </main>
  );
};

export default Messaging;
