'use client';

import { useWebSocketChatContext } from '@/context/useWebSocketChatContext';
import { Card, Button, Badge, Alert } from 'react-bootstrap';
import { FaCircle, FaCheck, FaCheckDouble } from 'react-icons/fa';

const ChatTest = () => {
  const {
    socket,
    isConnected,
    conversations,
    messages,
    onlineUsers,
    loading,
    error,
    sendMessage,
    fetchConversations,
    fetchOnlineUsers
  } = useWebSocketChatContext();

  const testMessage = () => {
    if (conversations.length > 0) {
      const firstConversation = conversations[0];
      sendMessage('Test mesajı - ' + new Date().toLocaleTimeString(), firstConversation.participantId);
    }
  };

  return (
    <div className="container mt-4">
      <h2>WebSocket Chat Test Sayfası</h2>
      
      {/* Bağlantı Durumu */}
      <Card className="mb-4">
        <Card.Header>
          <h5>Bağlantı Durumu</h5>
        </Card.Header>
        <Card.Body>
          <div className="d-flex align-items-center mb-3">
            <FaCircle 
              className={isConnected ? 'text-success' : 'text-danger'} 
              style={{ fontSize: '12px' }}
            />
            <span className="ms-2">
              {isConnected ? 'Bağlı' : 'Bağlantı Yok'}
            </span>
          </div>
          
          {error && (
            <Alert variant="danger">
              <strong>Hata:</strong> {error}
            </Alert>
          )}
          
          <div className="d-flex gap-2">
            <Button 
              variant="primary" 
              size="sm"
              onClick={fetchConversations}
              disabled={loading}
            >
              Conversation'ları Yenile
            </Button>
            <Button 
              variant="info" 
              size="sm"
              onClick={fetchOnlineUsers}
              disabled={loading}
            >
              Online Kullanıcıları Yenile
            </Button>
            <Button 
              variant="success" 
              size="sm"
              onClick={testMessage}
              disabled={!isConnected || conversations.length === 0}
            >
              Test Mesajı Gönder
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Conversation'lar */}
      <Card className="mb-4">
        <Card.Header>
          <h5>Conversation'lar ({conversations.length})</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <p>Yükleniyor...</p>
          ) : conversations.length === 0 ? (
            <p className="text-muted">Henüz conversation yok</p>
          ) : (
            <div className="row">
              {conversations.map((conv, index) => (
                <div key={conv.id} className="col-md-6 mb-3">
                  <Card>
                    <Card.Body>
                      <h6>{conv.participantName || 'Bilinmeyen Kullanıcı'}</h6>
                      <p className="text-muted small mb-2">
                        {conv.lastMessage || 'Henüz mesaj yok'}
                      </p>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          ID: {conv.id}
                        </small>
                        {conv.unreadCount > 0 && (
                          <Badge bg="danger">{conv.unreadCount}</Badge>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Online Kullanıcılar */}
      <Card className="mb-4">
        <Card.Header>
          <h5>Online Kullanıcılar ({onlineUsers.length})</h5>
        </Card.Header>
        <Card.Body>
          {onlineUsers.length === 0 ? (
            <p className="text-muted">Çevrimiçi kullanıcı yok</p>
          ) : (
            <div className="d-flex flex-wrap gap-2">
              {onlineUsers.map((userId, index) => (
                <Badge key={index} bg="success">
                  User ID: {userId}
                </Badge>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Mesajlar */}
      <Card className="mb-4">
        <Card.Header>
          <h5>Son Mesajlar ({messages.length})</h5>
        </Card.Header>
        <Card.Body>
          {messages.length === 0 ? (
            <p className="text-muted">Henüz mesaj yok</p>
          ) : (
            <div className="messages-list">
              {messages.slice(-5).map((message, index) => (
                <div key={message.id || index} className="mb-3 p-3 border rounded">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <strong>{message.senderName || 'Bilinmeyen'}</strong>
                    <small className="text-muted">
                      {new Date(message.timestamp).toLocaleString('tr-TR')}
                    </small>
                  </div>
                  <p className="mb-2">{message.content}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      Status: {message.status || 'unknown'}
                    </small>
                    <div>
                      {message.status === 'sent' && <FaCheck className="text-muted" />}
                      {message.status === 'delivered' && <FaCheckDouble className="text-muted" />}
                      {message.status === 'read' && <FaCheckDouble className="text-info" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Socket Bilgileri */}
      <Card>
        <Card.Header>
          <h5>Socket Bilgileri</h5>
        </Card.Header>
        <Card.Body>
          <pre className="bg-light p-3 rounded">
            {JSON.stringify({
              connected: isConnected,
              socketId: socket?.id,
              conversationsCount: conversations.length,
              messagesCount: messages.length,
              onlineUsersCount: onlineUsers.length,
              loading,
              error: error || null
            }, null, 2)}
          </pre>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ChatTest;
