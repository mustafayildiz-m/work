'use client';

import { getAllNotifications } from '@/helpers/data';
import { timeSince } from '@/utils/date';
import clsx from 'clsx';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap';
import { BsBellFill, BsCheckLg, BsThreeDots, BsTrash, BsChatLeftText, BsBoxArrowUpRight } from 'react-icons/bs';
import LoadMoreButton from './components/LoadMoreButton';
import { useWebSocketChatContext } from '@/context/useWebSocketChatContext';
import { getImageUrl } from '@/utils/image';
import { useLayoutContext } from '@/context/useLayoutContext';
import { useLanguage } from '@/context/useLanguageContext';

const NotificationsPage = () => {
  const { theme } = useLayoutContext();
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  const { notifications: realTimeNotifications, setNotifications } = useWebSocketChatContext();
  const [staticNotifications, setStaticNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const allNotifications = useMemo(() => {
    const combined = [...realTimeNotifications, ...staticNotifications];
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
      const key = relatedId ? `${n.type}-${relatedId}` : null;

      // Only deduplicate certain types where duplication is likely
      const isDeduplicatable = ['follow_accept', 'follow_request'].includes(n.type);

      if (isDeduplicatable && key) {
        if (!dedupByTypeAndUser.has(key)) {
          dedupByTypeAndUser.set(key, n);
          unique.push(n);
        } else {
          const existing = dedupByTypeAndUser.get(key);
          const isCurrentStatic = !String(n.id).startsWith('notif-');
          const isExistingStatic = !String(existing?.id).startsWith('notif-');
          if (isCurrentStatic && !isExistingStatic) {
            dedupByTypeAndUser.set(key, n);
          }
        }
      } else {
        unique.push(n);
      }
    }

    const merged = unique.map((n) => {
      const relatedId = n.relatedUserId || n.related_user_id;
      const key = relatedId ? `${n.type}-${relatedId}` : null;
      if (!key) return n;
      return dedupByTypeAndUser.get(key) || n;
    });

    // Final sort by time and filter out type-only follow requests
    return Array.from(new Map(merged.map((n) => [String(n.id), n])).values())
      .filter(n => n.type !== 'follow_request')
      .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));
  }, [realTimeNotifications, staticNotifications]);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const notifs = await getAllNotifications();
      setStaticNotifications(notifs || []);
      // API bildirimlerini context'e senkronize et - TabTitleUpdater sekme başlığı için görebilsin
      setNotifications((prev) => {
        const byId = new Map(prev.map((n) => [String(n.id), n]));
        (notifs || []).forEach((n) => {
          const id = String(n.id);
          if (!byId.has(id)) {
            byId.set(id, {
              ...n,
              isRead: n.isRead ?? n.is_read,
              is_read: n.is_read ?? n.isRead,
            });
          }
        });
        const merged = Array.from(byId.values()).sort(
          (a, b) => new Date(b.time || b.created_at || 0) - new Date(a.time || a.created_at || 0)
        );
        const unreadCount = merged.filter((n) => !(n.isRead === true || n.is_read === true)).length;
        if (unreadCount > 0 && typeof window !== 'undefined' && document.visibilityState === 'hidden') {
          window.dispatchEvent(
            new CustomEvent('tabTitleNotification', { detail: { type: 'notification', unreadCount } })
          );
        }
        return merged;
      });
    } catch (e) {
      console.error("Error fetching notifications:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();

    // Listen for notification changes from other components (like the notification dropdown)
    // window.addEventListener('notificationsChanged', fetchNotifs);
    // return () => window.removeEventListener('notificationsChanged', fetchNotifs);
  }, []);

  const handleMarkAsRead = async (e, id) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      // If it's a real-time notification (not yet in DB), just mark it locally
      if (String(id).startsWith('notif-')) {
        setStaticNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true, is_read: true } : n));
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true, is_read: true } : n));
        window.dispatchEvent(new CustomEvent('notificationMarkedRead', { detail: { id } }));
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setStaticNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true, is_read: true } : n));
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true, is_read: true } : n));
        window.dispatchEvent(new CustomEvent('notificationMarkedRead', { detail: { id } }));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
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
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
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

  const handleClearAll = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
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

  return (
    <Col lg={8} className="mx-auto mt-4">
      <Card className={clsx('border-0 shadow-sm', isDark ? 'bg-dark text-white' : 'bg-white')}>
        <CardHeader className={clsx('py-3 border-0 d-flex align-items-center justify-content-between', isDark ? 'bg-dark border-bottom border-secondary' : 'bg-white border-bottom')}>
          <h1 className="h5 mb-0">{t('notifications.title')} {unreadCount > 0 && <span className="badge bg-danger ms-2">{unreadCount}</span>}</h1>
          <Dropdown>
            <DropdownToggle as="a" className="text-secondary content-none btn btn-secondary-soft-hover py-1 px-2" id="cardNotiAction">
              <BsThreeDots />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end shadow border-0" aria-labelledby="cardNotiAction">
              <li>
                <DropdownItem onClick={handleMarkAllAsRead}>
                  <BsCheckLg className="me-2 text-primary" /> {t('notifications.markAllAsRead')}
                </DropdownItem>
              </li>
              <li>
                <DropdownItem onClick={handleClearAll} className="text-danger">
                  <BsTrash className="me-2" /> {t('notifications.clearAll')}
                </DropdownItem>
              </li>
            </DropdownMenu>
          </Dropdown>
        </CardHeader>
        <CardBody className="p-2">
          {allNotifications.length > 0 ? (
            <ul className="list-unstyled mb-0">
              {allNotifications.map((notification, idx) => (
                <li key={notification.id || idx}>
                  <div className={clsx('rounded d-flex border-0 mb-1 p-3 position-relative align-items-center notification-item transition-all', {
                    'unread-bg': !notification.isRead
                  })}>
                    <div className="avatar text-center me-3 position-relative" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                      {notification.avatar ? (
                        <img
                          className="avatar-img rounded-circle"
                          src={getImageUrl(notification.avatar)}
                          alt=""
                          style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = '/profile/profile.png'; }}
                        />
                      ) : (
                        <div className={`avatar-img rounded-circle bg-${notification.textAvatar?.variant || 'primary'}`} style={{ width: '48px', height: '48px', position: 'relative' }}>
                          <span className="text-white position-absolute top-50 start-50 translate-middle fw-bold" style={{ fontSize: '1rem' }}>
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
                            width: '20px',
                            height: '20px',
                            borderWidth: '2px !important'
                          }}
                        >
                          <BsCheckLg size={12} className="text-white fw-bold" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <p className={clsx('mb-0 small', !notification.isRead ? (isDark ? 'fw-bold text-white' : 'fw-bold text-dark') : 'text-body')}>
                        {notification.title}
                      </p>
                      {notification.description && (
                        <p className="text-muted mb-0 small text-truncate" style={{ fontSize: '0.8rem' }}>
                          {notification.description}
                        </p>
                      )}
                      <p className="text-muted mb-0" style={{ fontSize: '0.70rem' }}>
                        {timeSince(notification.time)}
                      </p>
                      {notification.type === 'follow_accept' && (notification.relatedUserId || notification.related_user_id) && (
                        <div className="d-flex gap-2 mt-2">
                          <Button
                            as={Link}
                            href={`/profile/user/${notification.relatedUserId || notification.related_user_id}`}
                            size="sm"
                            variant="outline-primary"
                            className="py-0 px-2 d-flex align-items-center"
                            style={{ fontSize: '0.72rem', borderRadius: '6px' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <BsBoxArrowUpRight className="me-1" size={11} />
                            {t('notifications.goToProfile')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-success"
                            className="py-0 px-2 d-flex align-items-center"
                            style={{ fontSize: '0.72rem', borderRadius: '6px' }}
                            onClick={(e) => handleOpenMessageFromNotification(e, notification)}
                          >
                            <BsChatLeftText className="me-1" size={11} />
                            {t('notifications.sendMessage')}
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="d-flex gap-2 ms-3">
                      {!notification.isRead && (
                        <button
                          className="btn btn-sm btn-link text-primary p-1"
                          onClick={(e) => handleMarkAsRead(e, notification.id)}
                          title={t('notifications.markAsRead')}
                        >
                          <BsCheckLg size={18} />
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-link text-danger p-1"
                        onClick={(e) => handleDeleteNotification(e, notification.id)}
                        title={t('notifications.delete')}
                      >
                        <BsTrash size={18} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-5 text-center text-muted">
              {loading ? (
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">{t('notifications.loading')}</span>
                </div>
              ) : (
                <>
                  <BsBellFill size={48} className="mb-3 opacity-25" />
                  <p className="mb-0">{t('notifications.noNotifications')}</p>
                </>
              )}
            </div>
          )}
        </CardBody>
        {allNotifications.length > 10 && (
          <CardFooter className="border-0 py-3 text-center position-relative d-grid pt-0">
            <LoadMoreButton />
          </CardFooter>
        )}
      </Card>

      <style jsx>{`
                .notification-item {
                    transition: all 0.2s ease;
                }
                .notification-item:hover {
                    background-color: ${isDark ? '#2c3034' : '#f8f9fa'} !important;
                }
                .unread-bg {
                    background-color: ${isDark ? '#2c3034' : '#f0f2f5'} !important;
                }
                :global(.dropdown-item) {
                    cursor: pointer;
                    font-size: 0.9rem;
                    padding: 0.5rem 1rem;
                }
                :global(.dropdown-item:hover) {
                    background-color: ${isDark ? '#3d4246' : '#f8f9fa'};
                }
            `}</style>
    </Col>
  );
};

export default NotificationsPage;