'use client';

import { useAuthContext } from '@/context/useAuthContext';
import { Card, Button } from 'react-bootstrap';
import { getToken, getUserIdFromToken, getUserInfoFromToken } from '@/utils/auth';

const DebugToken = () => {
  const { userInfo, isAuthenticated } = useAuthContext();

  const token = getToken();
  const userId = getUserIdFromToken();
  const userInfoFromToken = getUserInfoFromToken();

  return (
    <div className="container mt-4">
      <h2>Token Debug Sayfası</h2>
      
      <Card className="mb-4">
        <Card.Body>
          <h5>Auth Context Bilgileri</h5>
          <p>Authenticated: {isAuthenticated ? 'Evet' : 'Hayır'}</p>
          <p>UserInfo: {JSON.stringify(userInfo, null, 2)}</p>
          <p>UserInfo Type: {typeof userInfo}</p>
          <p>UserInfo ID: {userInfo?.id}</p>
          <p>UserInfo Username: {userInfo?.username}</p>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Body>
          <h5>Token Bilgileri</h5>
          <p>Token: {token ? `${token.substring(0, 50)}...` : 'Yok'}</p>
          <p>User ID from Token: {userId}</p>
          <p>User Info from Token: {JSON.stringify(userInfoFromToken, null, 2)}</p>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <h5>Test</h5>
          <p>Bu sayfada userInfo ve token bilgilerini kontrol edebilirsiniz.</p>
          <p>OnlineUsers component'inde kullanıcı eşleştirmesi için bu bilgileri kullanıyoruz.</p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DebugToken;
