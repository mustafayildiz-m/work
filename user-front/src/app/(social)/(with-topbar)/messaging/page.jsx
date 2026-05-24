'use client';

import { Card, Col, Container, Row } from 'react-bootstrap';
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

  // Deep-link: open conversation from ?userId= query param (mobile redirect from profile)
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
        conv => String(conv.participantId) === String(userId)
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

  // Mobil cihazlarda conversation seçildiğinde listeyi gizle
  useEffect(() => {
    if (activeConversation && window.innerWidth < 992) {
      setShowConversationList(false);
    }
  }, [activeConversation]);

  // Geri butonuna tıklandığında conversation listesini göster
  const handleBackToConversations = () => {
    setShowConversationList(true);
  };

  return (
    <main className="messaging-main">
      <Container fluid className="h-100 px-0 px-md-2">
        <Row className="gx-0 h-100">
          {/* Sol Sidebar - Conversation Listesi */}
          <Col
            lg={3}
            xl={3}
            className={`h-100 ${showConversationList ? 'd-block' : 'd-none d-lg-block'}`}
          >
            <div className="h-100 d-flex flex-column messaging-pane">
              <div className="d-lg-none p-2 border-bottom bg-body-tertiary">
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
                <div className="d-lg-none h-100" style={{ minHeight: 0 }}>
                  <OnlineUsers />
                </div>
              ) : (
                <ConversationList />
              )}
            </div>
          </Col>

          {/* Orta Alan - Mesaj Listesi */}
          <Col
            lg={showConversationList ? 6 : 9}
            xl={showConversationList ? 6 : 9}
            className={`h-100 ${!showConversationList ? 'd-block' : 'd-none d-lg-block'}`}
          >
            <div className="h-100 d-flex flex-column messaging-pane">
              <div className="flex-grow-1" style={{ minHeight: 0 }}>
                <MessageList onBackToConversations={handleBackToConversations} />
              </div>
              <div className="message-input-wrapper">
                <MessageInput />
              </div>
            </div>
          </Col>

          {/* Sağ Sidebar - Online Kullanıcılar */}
          <Col lg={3} xl={3} className="h-100 d-none d-lg-block">
            <div className="h-100 messaging-pane">
              <OnlineUsers />
            </div>
          </Col>
        </Row>
      </Container>
      <style jsx>{`
        .messaging-main {
          height: calc(100dvh - 64px);
          min-height: calc(100dvh - 64px);
          overflow: hidden;
        }

        .messaging-pane {
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