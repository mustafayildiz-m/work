'use client';

import { useWebSocketChatContext } from '@/context/useWebSocketChatContext';
import { Card, Button } from 'react-bootstrap';

const TestChat = () => {
  const {
    isConnected,
    loading,
    error,
    conversations,
    onlineUsers,
    socket
  } = useWebSocketChatContext();

  return (
    <div className="container mt-4">
      <h2>Chat Test Sayfası</h2>
      
      <Card className="mb-4">
        <Card.Body>
          <h5>Bağlantı Durumu</h5>
          <p>Bağlı: {isConnected ? 'Evet' : 'Hayır'}</p>
          <p>Yükleniyor: {loading ? 'Evet' : 'Hayır'}</p>
          {error && <p className="text-danger">Hata: {error}</p>}
          <p>Conversation Sayısı: {conversations.length}</p>
          <p>Online Kullanıcı Sayısı: {onlineUsers.length}</p>
          <p>Socket ID: {socket?.id || 'Yok'}</p>
          <p>User Map: {JSON.stringify(userMap)}</p>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <h5>Conversation'lar</h5>
          {conversations.length === 0 ? (
            <p>Henüz conversation yok</p>
          ) : (
            <ul>
              {conversations.map((conv, index) => (
                <li key={index}>
                  {conv.participantName || 'Bilinmeyen'} - {conv.id}
                </li>
              ))}
            </ul>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default TestChat;
