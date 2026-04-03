import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner, Form, ListGroup, Image } from 'react-bootstrap';
import { BsEnvelope, BsCheckCircleFill, BsSearch } from 'react-icons/bs';
import { useWebSocketChatContext } from '@/context/useWebSocketChatContext';
import { useLanguage } from '@/context/useLanguageContext';
import { useLayoutContext } from '@/context/useLayoutContext';
import { useNotificationContext } from '@/context/useNotificationContext';
import placeholderImg from '@/assets/images/avatar/placeholder.jpg';

const ShareViaMessageModal = ({ show, onHide, post, postDataPayload }) => {
  const { t } = useLanguage();
  const { theme } = useLayoutContext();
  const isDarkMode = theme === 'dark' || theme === 'green';
  const { showNotification } = useNotificationContext();
  const { sendMessage, isConnected } = useWebSocketChatContext();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (show) {
      fetchFollowing();
      setSelectedUserIds([]);
      setSearchTerm('');
    }
  }, [show]);

  const fetchFollowing = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/following/users?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching following users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return placeholderImg.src;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
    if (url.startsWith('uploads/')) return `${process.env.NEXT_PUBLIC_API_URL}/${url}`;
    return `${process.env.NEXT_PUBLIC_API_URL}/uploads/${url}`;
  };

  const toggleUserSelection = (userId) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSend = async () => {
    if (selectedUserIds.length === 0) return;
    if (!isConnected) {
      showNotification({
        title: t('common.error'),
        message: t('messaging.disconnectedError') || 'Sohbet sunucusuna bağlı değilsiniz.',
        variant: 'danger'
      });
      return;
    }

    setSending(true);

    try {
      // Create special formatted JSON message for post sharing
      const payload = JSON.stringify({
        type: 'post_share',
        postData: postDataPayload || {
          id: post.postId,
          title: post.title,
          caption: post.caption,
          image: post.image,
          video: post.video,
          isUserPost: post.isUserPost,
          authorName: post.isUserPost ? post.socialUser?.name : post.socialUser?.fullName,
          authorAvatar: post.isUserPost ? post.socialUser?.avatar : post.socialUser?.photoUrl
        }
      });

      // Send to all selected users
      const promises = selectedUserIds.map(userId => sendMessage(payload, userId));
      await Promise.all(promises);

      showNotification({
        title: t('common.success'),
        message: 'Gönderi başarıyla paylaşıldı!',
        variant: 'success'
      });
      
      onHide();
    } catch (error) {
      console.error('Error sharing post via message:', error);
      showNotification({
        title: t('common.error'),
        message: 'Gönderi paylaşılırken bir hata oluştu.',
        variant: 'danger'
      });
    } finally {
      setSending(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim().toLowerCase();
    const name = u.name?.toLowerCase() || '';
    const username = u.username?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || name.includes(search) || username.includes(search);
  });

  return (
    <Modal show={show} onHide={onHide} centered className="modern-modal" scrollable>
      <ModalHeader closeButton className="border-0 pb-0" style={{ background: 'transparent' }}>
        <div className="d-flex align-items-center">
          <div className="icon-shape icon-md rounded-circle bg-primary bg-opacity-10 text-primary me-3 shadow-sm">
            <BsEnvelope size={20} />
          </div>
          <div>
            <h5 className="modal-title mb-0 fw-bold">Mesaj Olarak Gönder</h5>
            <small className="text-muted">Bu gönderiyi takipleştiğin kişilere DM olarak gönder</small>
          </div>
        </div>
      </ModalHeader>
      <ModalBody>
        <div className="mb-3 position-relative">
          <Form.Control
            type="text"
            placeholder="Ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ps-5 border-0"
            style={{ 
              borderRadius: '12px', 
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.03)',
              color: isDarkMode ? '#fff' : '#000'
            }}
          />
          <BsSearch className="position-absolute text-muted" style={{ left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <p>Kullanıcı bulunamadı.</p>
          </div>
        ) : (
          <ListGroup variant="flush">
            {filteredUsers.map(user => {
              const isSelected = selectedUserIds.includes(user.id);
              return (
                <ListGroup.Item 
                  key={user.id} 
                  action 
                  onClick={() => toggleUserSelection(user.id)}
                  className={`d-flex align-items-center mb-2 border-0 rounded-3 ${isSelected ? 'bg-primary bg-opacity-10 text-primary' : ''}`}
                  style={{ 
                    transition: 'all 0.2s ease', cursor: 'pointer',
                    backgroundColor: isSelected ? undefined : (isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'),
                    color: isDarkMode ? '#e9ecef' : '#212529'
                  }}
                >
                  <img
                    src={getImageUrl(user.photoUrl)}
                    alt={user.firstName || user.name}
                    className="rounded-circle me-3"
                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = placeholderImg.src; }}
                  />
                  <div className="flex-grow-1">
                    <h6 className="mb-0 fw-bold">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : (user.name || t('common.user'))}
                    </h6>
                    {user.username && <small style={{ opacity: 0.7 }}>@{user.username}</small>}
                  </div>
                  <div 
                    className="icon-shape icon-sm rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      border: isSelected ? 'none' : `1px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                      backgroundColor: isSelected ? 'var(--bs-primary)' : 'transparent',
                      color: isSelected ? '#fff' : 'transparent'
                    }}
                  >
                    {isSelected && <BsCheckCircleFill size={16} />}
                  </div>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        )}
      </ModalBody>
      <ModalFooter className="border-0 pt-0" style={{ background: 'transparent' }}>
        <Button variant="secondary" onClick={onHide} className="rounded-3" disabled={sending}>
          İptal
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSend} 
          disabled={selectedUserIds.length === 0 || sending}
          className="rounded-3 px-4"
        >
          {sending ? <Spinner size="sm" animation="border" /> : `Gönder (${selectedUserIds.length})`}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ShareViaMessageModal;
