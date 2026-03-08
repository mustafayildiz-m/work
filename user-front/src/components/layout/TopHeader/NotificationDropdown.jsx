import { getAllNotifications } from '@/helpers/data';
import { timeSince } from '@/utils/date';
import clsx from 'clsx';
import Link from 'next/link';
import { Card, CardBody, CardFooter, CardHeader, Button } from 'react-bootstrap';
import { BsBellFill, BsCheckLg, BsTrash } from 'react-icons/bs';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useWebSocketChatContext } from '@/context/useWebSocketChatContext';
import { useLayoutContext } from '@/context/useLayoutContext';
import { getImageUrl } from '@/utils/image';

const NotificationDropdown = () => {
  const { theme } = useLayoutContext();
  const isDark = theme === 'dark';
  const { notifications: realTimeNotifications, setNotifications } = useWebSocketChatContext();
  const [staticNotifications, setStaticNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const allNotifications = useMemo(() => {
    const combined = [...realTimeNotifications, ...staticNotifications];

    // Deduplicate by type and related user to prevent duplication between Socket and DB
    const seen = new Set();
    const unique = [];

    // Sort combined to prioritize static (DB) notifications over real-time ones 
    // because static ones have persistent IDs.
    const sorted = combined.sort((a, b) => {
      const isAStatic = !String(a.id).startsWith('notif-');
      const isBStatic = !String(b.id).startsWith('notif-');
      if (isAStatic && !isBStatic) return -1;
      if (!isAStatic && isBStatic) return 1;
      return new Date(b.time || 0) - new Date(a.time || 0);
    });

    for (const n of sorted) {
      const relatedId = n.relatedUserId || n.related_user_id;
      const key = `${n.type}-${relatedId}`;

      // Only deduplicate certain types where duplication is likely
      const isDeduplicatable = ['follow_accept', 'follow_request'].includes(n.type);

      if (isDeduplicatable && relatedId) {
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(n);
        }
      } else {
        unique.push(n);
      }
    }

    // Final sort by time
    return unique
      .filter(n => n.type !== 'follow_request')
      .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));
  }, [realTimeNotifications, staticNotifications]);

  const fetchNotifs = async () => {
    try {
      const notifs = await getAllNotifications();
      setStaticNotifications(notifs || []);
    } catch (e) { }
  };

  useEffect(() => {
    fetchNotifs();

    // Listen for notification changes from other components (like the notifications page)
    window.addEventListener('notificationsChanged', fetchNotifs);
    return () => window.removeEventListener('notificationsChanged', fetchNotifs);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setStaticNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        window.dispatchEvent(new Event('notificationsChanged'));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setStaticNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        window.dispatchEvent(new Event('notificationsChanged'));
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setStaticNotifications(prev => prev.filter(n => n.id !== id));
        setNotifications(prev => prev.filter(n => n.id !== id));
        window.dispatchEvent(new Event('notificationsChanged'));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleClearAll = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setStaticNotifications([]);
        setNotifications([]);
        window.dispatchEvent(new Event('notificationsChanged'));
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const unreadCount = allNotifications.filter(n => !n.isRead).length;

  return (
    <li className="nav-item ms-2" ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="nav-link bg-light icon-md btn btn-light p-0 position-relative"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Bildirimler"
      >
        {unreadCount > 0 && (
          <span className="badge badge-center rounded-pill bg-danger position-absolute top-0 start-100 translate-middle" style={{ width: '18px', height: '18px', fontSize: '0.65rem' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <BsBellFill size={15} />
      </button>

      <div
        role="menu"
        className={clsx('p-0 shadow-lg border-0 rounded notification-dropdown-menu', isDark ? 'bg-dark' : 'bg-white')}
        style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          right: 0,
          width: '380px',
          zIndex: 1050,
          display: isOpen ? 'block' : 'none'
        }}
      >
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center py-2">
            <h6 className="m-0 small fw-bold">Bildirimler {unreadCount > 0 && <span className="badge bg-danger ms-1">{unreadCount}</span>}</h6>
            <div className="d-flex gap-2">
              {unreadCount > 0 && (
                <Link className="small text-primary text-decoration-none fw-bold" href="" onClick={handleMarkAllAsRead} style={{ fontSize: '0.7rem' }}>
                  Hepsini Oku
                </Link>
              )}
              <Link className="small text-danger text-decoration-none fw-bold" href="" onClick={handleClearAll} style={{ fontSize: '0.7rem' }}>
                Hepsini Temizle
              </Link>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {allNotifications.length > 0 ? (
              <ul className="list-group list-group-flush list-unstyled p-2 mb-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {allNotifications.slice(0, 9).map((notification, idx) => (
                  <li key={notification.id || idx} className="mb-1">
                    <div className={clsx('rounded d-flex border-0 p-2 position-relative align-items-center notification-item transition-all', {
                      'unread-bg': !notification.isRead
                    })}>
                      <div className="avatar text-center me-2 position-relative" style={{ width: '38px', height: '38px', flexShrink: 0 }}>
                        {notification.avatar ? (
                          <img
                            className="avatar-img rounded-circle"
                            src={getImageUrl(notification.avatar)}
                            alt=""
                            style={{ width: '38px', height: '38px', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = '/profile/profile.png'; }}
                          />
                        ) : (
                          <div className={`avatar-img rounded-circle bg-${notification.textAvatar?.variant || 'primary'}`} style={{ width: '38px', height: '38px', position: 'relative' }}>
                            <span className="text-white position-absolute top-50 start-50 translate-middle fw-bold" style={{ fontSize: '0.75rem' }}>
                              {notification.textAvatar?.text || '?'}
                            </span>
                          </div>
                        )}
                        {notification.type === 'follow_accept' && (
                          <div
                            className="bg-success rounded-circle border border-white position-absolute d-flex align-items-center justify-content-center shadow-sm"
                            style={{
                              bottom: '-2px',
                              right: '-2px',
                              width: '18px',
                              height: '18px',
                              borderWidth: '2px !important'
                            }}
                          >
                            <BsCheckLg size={10} className="text-white fw-bold" />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow-1 overflow-hidden">
                        <p className={clsx('mb-0 small text-truncate', !notification.isRead ? (isDark ? 'fw-bold text-white' : 'fw-bold text-dark') : 'text-body')} style={{ maxWidth: '200px' }}>
                          {notification.title}
                        </p>
                        {(notification.description || notification.message) && (
                          <p className="text-muted mb-0 small text-truncate" style={{ fontSize: '0.7rem', maxWidth: '200px' }}>
                            {notification.description || notification.message}
                          </p>
                        )}
                        <p className="text-muted mb-0" style={{ fontSize: '0.65rem' }}>{timeSince(notification.time)}</p>
                      </div>
                      <div className="d-flex gap-1 ms-2">
                        {!notification.isRead && (
                          <button
                            className="btn btn-xs btn-link text-primary p-1"
                            onClick={(e) => handleMarkAsRead(e, notification.id)}
                            title="Okundu işaretle"
                          >
                            <BsCheckLg size={14} />
                          </button>
                        )}
                        <button
                          className="btn btn-xs btn-link text-danger p-1"
                          onClick={(e) => handleDeleteNotification(e, notification.id)}
                          title="Sil"
                        >
                          <BsTrash size={14} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-muted">
                <BsBellFill size={24} className="mb-2 opacity-50" />
                <p className="mb-0 small">Henüz bildiriminiz bulunmuyor.</p>
              </div>
            )}
          </CardBody>
          <CardFooter className="text-center p-2">
            <Link
              href="/feed/notifications"
              className="btn btn-primary-soft btn-sm w-100 fw-bold"
              style={{ fontSize: '0.8rem' }}
              onClick={() => setIsOpen(false)}
            >
              Tüm Bildirimleri Gör
            </Link>
          </CardFooter>
        </Card>
      </div>
      <style jsx>{`
        .notification-dropdown-menu {
          background-color: ${isDark ? '#212529' : '#ffffff'} !important;
          border: 1px solid ${isDark ? '#495057' : '#e9ecef'} !important;
        }
        .notification-item {
          transition: all 0.2s ease;
        }
        .notification-item:hover {
          background-color: ${isDark ? '#2c3034' : '#f8f9fa'} !important;
        }
        .unread-bg {
          background-color: ${isDark ? '#2c3034' : '#f0f2f5'} !important;
        }
        [data-bs-theme="dark"] .card {
          background-color: #212529;
          border-color: #495057;
        }
        [data-bs-theme="dark"] .card-header, 
        [data-bs-theme="dark"] .card-footer {
          background-color: #2a2e33;
          border-color: #495057;
        }
        [data-bs-theme="dark"] .list-group-item {
          background-color: transparent;
          border-color: #495057;
        }
      `}</style>
    </li>
  );
};

export default NotificationDropdown;
