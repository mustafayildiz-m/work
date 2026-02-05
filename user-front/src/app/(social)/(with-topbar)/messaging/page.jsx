'use client';

import { Card, Col, Container, Row } from 'react-bootstrap';
import ConversationList from '@/components/chat/ConversationList';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import OnlineUsers from '@/components/chat/OnlineUsers';
import { useWebSocketChatContext } from '@/context/useWebSocketChatContext';
import { useState, useEffect } from 'react';

const Messaging = () => {
  const { activeConversation } = useWebSocketChatContext();
  const [showConversationList, setShowConversationList] = useState(true);

  // Mobil cihazlarda conversation seçildiğinde listeyi gizle
  useEffect(() => {
    if (activeConversation && window.innerWidth < 992) { // lg breakpoint
      setShowConversationList(false);
    }
  }, [activeConversation]);

  // Geri butonuna tıklandığında conversation listesini göster
  const handleBackToConversations = () => {
    setShowConversationList(true);
  };

  return (
    <main style={{ height: '100vh', overflow: 'hidden' }}>
      <Container fluid className="h-100">
        <Row className="gx-0 h-100">
          {/* Sol Sidebar - Conversation Listesi */}
          <Col 
            lg={3} 
            xl={3} 
            className={`h-100 ${showConversationList ? 'd-block' : 'd-none d-lg-block'}`}
          >
            <div className="h-100 d-flex flex-column">
              <ConversationList />
            </div>
          </Col>

          {/* Orta Alan - Mesaj Listesi */}
          <Col 
            lg={showConversationList ? 6 : 9} 
            xl={showConversationList ? 6 : 9} 
            className={`h-100 ${!showConversationList ? 'd-block' : 'd-none d-lg-block'}`}
          >
            <div className="h-100 d-flex flex-column">
              <div className="flex-grow-1" style={{ minHeight: 0 }}>
                <MessageList onBackToConversations={handleBackToConversations} />
              </div>
              <div style={{ height: '120px', flexShrink: 0 }}>
                <MessageInput />
              </div>
            </div>
          </Col>

          {/* Sağ Sidebar - Online Kullanıcılar */}
          <Col lg={3} xl={3} className="h-100 d-none d-lg-block">
            <div className="h-100">
              <OnlineUsers />
            </div>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default Messaging;