'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardBody } from 'react-bootstrap';

const UserAboutPage = () => {
  const params = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = params.id;
        if (userId) {
          const token = localStorage.getItem('token');
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [params.id]);



  if (loading) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Kullanıcı bilgileri yükleniyor...</p>
        </CardBody>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <h4>Kullanıcı Bulunamadı</h4>
          <p className="text-muted">Aradığınız kullanıcı bulunamadı veya silinmiş olabilir.</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <div className="text-center mb-4">
          <p className="lead">{user.bio || user.description || 'Bu kullanıcı henüz bir biyografi eklememiş.'}</p>
        </div>

        <div className="border-top pt-4">
          <h5>Detaylı Profil Bilgileri</h5>
          <ul className="list-unstyled">
            <li><strong>Email:</strong> {user.email || user.email_address || 'Belirtilmemiş'}</li>
            <li><strong>Konum:</strong> {user.location || user.locationName || 'Belirtilmemiş'}</li>
            <li><strong>Yaş:</strong> {user.age || user.age_years ? `${user.age || user.age_years} yaşında` : 'Belirtilmemiş'}</li>
            <li><strong>Katılım Tarihi:</strong> {user.joinDate || user.createdAt || user.created_at ? new Date(user.joinDate || user.createdAt || user.created_at).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}</li>
            <li><strong>Rol:</strong> {user.role || user.userRole || 'Kullanıcı'}</li>
            <li><strong>Durum:</strong> {user.status || user.userStatus || 'Aktif'}</li>
            <li><strong>Son Giriş:</strong> {user.lastLogin || user.last_login || user.updatedAt ? new Date(user.lastLogin || user.last_login || user.updatedAt).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}</li>
          </ul>
        </div>
      </CardBody>
    </Card>
  );
};

export default UserAboutPage;
