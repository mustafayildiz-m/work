import { getAllNotifications } from '@/helpers/data';
import { timeSince } from '@/utils/date';
import clsx from 'clsx';
import Link from 'next/link';
import { Card, CardBody, CardFooter, CardHeader, Button } from 'react-bootstrap';
import { BsBellFill, BsCheckLg, BsTrash, BsChatLeftText, BsBoxArrowUpRight } from 'react-icons/bs';
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

  const fetchNotifs = async () => {
    try {
      const notifs = await getAllNotifications();
      setStaticNotifications(notifs || []);
    } catch (e) { }
  };

  useEffect(() => {
    fetchNotifs();

    // Sync state locally when notifications are updated elsewhere
    const handleRead = (e) => {
      const { id } = e.detail;
      setStaticNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true, is_read: true } : n));
    };
    const handleDelete = (e) => {
      const { id } = e.detail;
      setStaticNotifications(prev => prev.filter(n => n.id !== id));
    };
    const handleAllRead = () => {
      setStaticNotifications(prev => prev.map(n => ({ ...n, isRead: true, is_read: true })));
    };
    const handleAllCleared = () => {
      setStaticNotifications([]);
    };

    window.addEventListener('notificationMarkedRead', handleRead);
    window.addEventListener('notificationDeleted', handleDelete);
    window.addEventListener('notificationAllRead', handleAllRead);
    window.addEventListener('notificationAllCleared', handleAllCleared);

    return () => {
      window.removeEventListener('notificationMarkedRead', handleRead);
      window.removeEventListener('notificationDeleted', handleDelete);
      window.removeEventListener('notificationAllRead', handleAllRead);
      window.removeEventListener('notificationAllCleared', handleAllCleared);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen]);

  const allNotifications = useMemo(() => {
    const combined = [...realTimeNotifications, ...staticNotifications];
    const byId = new Map();
    const dedupByTypeAndUser = new Map();
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
      const typeUserKey = relatedId ? `${n.type}-${relatedId}` : null;

      if (n?.id && !String(n.id).startsWith('notif-')) {
        // Prefer DB records for same id and avoid duplicate React keys
        if (!byId.has(n.id)) {
          byId.set(n.id, n);
        }
        // When DB record exists, it should replace equivalent temporary socket notification.
        if (typeUserKey && ['follow_accept', 'follow_request'].includes(n.type)) {
          dedupByTypeAndUser.set(typeUserKey, n);
        }
        continue;
      }

      // Only deduplicate certain types where duplication is likely
      if (typeUserKey && ['follow_accept', 'follow_request'].includes(n.type)) {
        if (!dedupByTypeAndUser.has(typeUserKey)) {
          dedupByTypeAndUser.set(typeUserKey, n);
          unique.push(n);
        }
      } else {
        unique.push(n);
      }
    }

    // Ensure DB notification overrides temporary socket notification for same type/user.
    const merged = unique.map((n) => {
      const relatedId = n.relatedUserId || n.related_user_id;
      const typeUserKey = relatedId ? `${n.type}-${relatedId}` : null;
      if (!typeUserKey) return n;
      return dedupByTypeAndUser.get(typeUserKey) || n;
    });

    merged.push(...byId.values());

    // Final sort by time
    return Array.from(new Map(merged.map((n) => [String(n.id), n])).values())
      .filter(n => n.type !== 'follow_request')
      .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));
  }, [realTimeNotifications, staticNotifications]);

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
        window.dispatchEvent(new CustomEvent('notificationMarkedRead', { detail: { id } }));
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
        window.dispatchEvent(new CustomEvent('notificationAllRead'));
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
        window.dispatchEvent(new CustomEvent('notificationDeleted', { detail: { id } }));
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
        window.dispatchEvent(new CustomEvent('notificationAllCleared'));
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const unreadCount = allNotifications.filter(n => !n.isRead).length;

  const handleOpenMessageFromNotification = (e, notification) => {
    e.preventDefault();
    e.stopPropagation();

    const targetUserId = notification.relatedUserId || notification.related_user_id;
    if (!targetUserId) return;

    window.dispatchEvent(
      new CustomEvent('openMessagingWithUser', {
        detail: {
          user: {
            id: targetUserId,
            firstName: notification.related_user?.firstName || '',
            lastName: notification.related_user?.lastName || '',
            username: notification.related_user?.username || '',
            role: notification.related_user?.role || '',
            tagline: notification.related_user?.tagline || '',
            photoUrl: notification.avatar || null
          }
        }
      })
    );
  };

  const handleNotificationClick = (notification) => {
    if (notification.type !== 'scholar_post') return;

    const scholarId = notification.scholarId || notification.scholar_id;
    const postId = notification.postId || notification.post_id;
    if (!scholarId || !postId) return;

    setIsOpen(false);
    window.location.href = `/profile/scholar/${scholarId}/feed?postId=${encodeURIComponent(postId)}`;
  };

  return (
    <li className="nav-item dropdown ms-2" ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="nav-link bg-light icon-md btn btn-light p-0 position-relative"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
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
          width: 'min(460px, calc(100vw - 1rem))',
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
              <ul className="list-group list-group-flush list-unstyled p-2 mb-0 notification-list-scroll" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {allNotifications.slice(0, 9).map((notification, idx) => (
                  <li key={notification.id || idx} className="mb-1">
                    <div
                      className={clsx('rounded d-flex border-0 p-2 position-relative align-items-center notification-item transition-all', {
                        'unread-bg': !notification.isRead,
                        'cursor-pointer': notification.type === 'scholar_post',
                      })}
                      onClick={() => handleNotificationClick(notification)}
                    >
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
                        <p className={clsx('mb-0 small text-truncate', !notification.isRead ? (isDark ? 'fw-bold text-white' : 'fw-bold text-dark') : 'text-body')} style={{ maxWidth: '100%' }}>
                          {notification.title}
                        </p>
                        {(notification.description || notification.message) && (
                          <p className="text-muted mb-0 small text-truncate" style={{ fontSize: '0.7rem', maxWidth: '100%' }}>
                            {notification.description || notification.message}
                          </p>
                        )}
                        <p className="text-muted mb-0" style={{ fontSize: '0.65rem' }}>{timeSince(notification.time)}</p>
                        {notification.type === 'follow_accept' && (notification.relatedUserId || notification.related_user_id) && (
                          <div className="d-flex gap-2 mt-1">
                            <Button
                              as={Link}
                              href={`/profile/user/${notification.relatedUserId || notification.related_user_id}`}
                              size="sm"
                              variant="outline-primary"
                              className="py-0 px-2 d-flex align-items-center"
                              style={{ fontSize: '0.68rem', borderRadius: '6px' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <BsBoxArrowUpRight className="me-1" size={11} />
                              Profile Git
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-success"
                              className="py-0 px-2 d-flex align-items-center"
                              style={{ fontSize: '0.68rem', borderRadius: '6px' }}
                              onClick={(e) => handleOpenMessageFromNotification(e, notification)}
                            >
                              <BsChatLeftText className="me-1" size={11} />
                              Mesaj Gonder
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="d-flex gap-1 ms-2">
                        {!notification.isRead && (
                          <button
                            className="btn btn-sm btn-link text-primary p-0 border-0 bg-transparent"
                            onClick={(e) => handleMarkAsRead(e, notification.id)}
                            title="Okundu işaretle"
                          >
                            <BsCheckLg size={16} />
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-link text-danger p-0 border-0 bg-transparent"
                          onClick={(e) => handleDeleteNotification(e, notification.id)}
                          title="Sil"
                        >
                          <BsTrash size={16} />
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
          <CardFooter className="py-2 text-center border-0">
            <Link
              className="small fw-bold text-primary text-decoration-none"
              href="/feed/notifications"
              onClick={() => setIsOpen(false)}
            >
              Tüm Bildirimleri Gör
            </Link>
          </CardFooter>
        </Card>
      </div>

      <style jsx>{`
                .notification-item:hover {
                    background-color: ${isDark ? '#2c3034' : '#f8f9fa'} !important;
                }
                .unread-bg {
                    background-color: ${isDark ? '#2c3034' : '#f0f2f5'} !important;
                }
                .notification-dropdown-menu {
                    animation: fadeIn 0.2s ease-out;
                }
                .notification-list-scroll {
                    max-height: 400px;
                    overflow-y: auto;
                }
                @media (max-width: 991.98px) {
                    .notification-dropdown-menu {
                        position: fixed !important;
                        top: 70px !important;
                        left: 0.5rem !important;
                        right: 0.5rem !important;
                        width: auto !important;
                        max-width: none !important;
                        border-radius: 14px !important;
                    }
                    .notification-list-scroll {
                        max-height: calc(100dvh - 190px) !important;
                    }
                }
                @media (max-width: 575.98px) {
                    .notification-dropdown-menu {
                        top: 66px !important;
                        left: 0.4rem !important;
                        right: 0.4rem !important;
                        border-radius: 12px !important;
                    }
                    .notification-list-scroll {
                        max-height: calc(100dvh - 180px) !important;
                    }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
    </li>
  );
};

export default NotificationDropdown;
