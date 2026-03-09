'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useWebSocketChatContext } from '@/context/useWebSocketChatContext';
import { useLanguage } from '@/context/useLanguageContext';
import { DEFAULT_PAGE_TITLE } from '@/context/constants';

const CYCLE_INTERVAL_MS = 2500;

/**
 * Sekme arka plandayken başlığı mesaj/bildirim sayısına göre günceller.
 * Hem mesaj hem bildirim varsa başlık döngüsel olarak değişir (kayan yazı etkisi).
 */
export default function TabTitleUpdater() {
  const { conversations, notifications } = useWebSocketChatContext();
  const { t } = useLanguage();
  const cycleIntervalRef = useRef(null);
  const originalTitleRef = useRef(DEFAULT_PAGE_TITLE);

  const unreadMessages = conversations?.reduce((sum, c) => sum + (c.unreadCount || 0), 0) || 0;
  // Hem isRead hem is_read kontrolü - API'den gelen bildirimler snake_case kullanabilir
  const unreadNotifications =
    notifications?.filter((n) => !(n.isRead === true || n.is_read === true))?.length || 0;
  const hasUnread = unreadMessages > 0 || unreadNotifications > 0;

  const updateTitleForHidden = useCallback(
    (showMessages) => {
      const msgTitle =
        unreadMessages > 0
          ? unreadMessages === 1
            ? t('tabTitle.oneNewMessage')
            : t('tabTitle.newMessages', { count: unreadMessages })
          : null;
      const notifTitle =
        unreadNotifications > 0
          ? unreadNotifications === 1
            ? t('tabTitle.oneNewNotification')
            : t('tabTitle.newNotifications', { count: unreadNotifications })
          : null;

      if (msgTitle && notifTitle) {
        document.title = showMessages
          ? `${msgTitle} - ${originalTitleRef.current}`
          : `${notifTitle} - ${originalTitleRef.current}`;
      } else if (msgTitle) {
        document.title = `${msgTitle} - ${originalTitleRef.current}`;
      } else if (notifTitle) {
        document.title = `${notifTitle} - ${originalTitleRef.current}`;
      } else {
        document.title = originalTitleRef.current;
      }
    },
    [unreadMessages, unreadNotifications, t]
  );

  // WebSocket'ten bildirim geldiğinde hemen başlığı güncelle (React render beklemeden)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleTabTitleNotification = (e) => {
      if (document.visibilityState !== 'hidden') return;
      const { type, unreadCount } = e.detail || {};
      if (type === 'notification' && unreadCount > 0) {
        const notifTitle =
          unreadCount === 1
            ? t('tabTitle.oneNewNotification')
            : t('tabTitle.newNotifications', { count: unreadCount });
        document.title = `${notifTitle} - ${originalTitleRef.current}`;
      }
    };

    window.addEventListener('tabTitleNotification', handleTabTitleNotification);
    return () => window.removeEventListener('tabTitleNotification', handleTabTitleNotification);
  }, [t]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        document.title = originalTitleRef.current;
        if (cycleIntervalRef.current) {
          clearInterval(cycleIntervalRef.current);
          cycleIntervalRef.current = null;
        }
      } else if (document.visibilityState === 'hidden') {
        if (!hasUnread) {
          document.title = 'İslamic Windows 🕌';
          return;
        }
        const hasBoth = unreadMessages > 0 && unreadNotifications > 0;

        if (hasBoth) {
          let showMessages = true;
          updateTitleForHidden(showMessages);
          if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current);
          cycleIntervalRef.current = setInterval(() => {
            showMessages = !showMessages;
            updateTitleForHidden(showMessages);
          }, CYCLE_INTERVAL_MS);
        } else {
          updateTitleForHidden(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (document.visibilityState === 'hidden' && hasUnread) {
      handleVisibilityChange();
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (cycleIntervalRef.current) {
        clearInterval(cycleIntervalRef.current);
        cycleIntervalRef.current = null;
      }
    };
  }, [hasUnread, unreadMessages, unreadNotifications, updateTitleForHidden]);

  return null;
}
