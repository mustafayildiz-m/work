'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { io } from 'socket.io-client';
import { getToken } from '@/utils/auth';
import placeholderImg from '@/assets/images/avatar/placeholder.jpg';
import { useOptionalNotificationContext } from './useNotificationContext';

// Helper functions - moved outside to prevent recreations
const getCurrentUserInfo = () => {
  try {
    const token = getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub,
        username: payload.username
      };
    }
  } catch (error) {
    console.error('Error getting current user info:', error);
  }
  return null;
};

const parseTimestamp = (timestamp, fallbackDate = new Date()) => {
  if (!timestamp) return fallbackDate;

  try {
    const parsed = new Date(timestamp);
    if (isNaN(parsed.getTime())) {
      console.warn('Invalid timestamp:', timestamp);
      return fallbackDate;
    }
    return parsed;
  } catch (error) {
    console.warn('Error parsing timestamp:', error);
    return fallbackDate;
  }
};

const getWebSocketUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // ÖNEMLİ: ChatGateway backend'de `namespace: '/chat'` olarak tanımlı.
  // socket.io-client'ta `io(url + '/chat', ...)` URL'in path'ini değil,
  // namespace'ini ayarlar (path her zaman /socket.io/ kalır).
  // /chat eklenmezse client default namespace'e bağlanır ve hiçbir event
  // (sendMessage, newFollowRequest, newNotification, vb.) tetiklenmez.

  if (apiUrl.includes('localhost')) {
    return 'http://localhost:3000/chat';
  }

  // /api suffix'ini kaldır ve /chat namespace'ini ekle
  const baseUrl = apiUrl.replace(/\/api\/?$/, '');
  return `${baseUrl}/chat`;
};

const normalizeOnlineUser = (userData) => {
  if (!userData) return null;
  if (typeof userData === 'object') {
    return {
      id: userData.id ?? userData.userId ?? null,
      userId: userData.userId ?? userData.id ?? null,
      username: userData.username || null,
      photoUrl: userData.photoUrl || null,
    };
  }
  return {
    id: null,
    userId: null,
    username: String(userData),
    photoUrl: null,
  };
};

const WebSocketChatContext = createContext(undefined);

const isNotificationSoundEnabled = () => {
  if (typeof window === 'undefined') return true;
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return true;
    const parsedUser = JSON.parse(storedUser);
    return parsedUser?.notificationSoundEnabled !== false;
  } catch (error) {
    return true;
  }
};

export const useWebSocketChatContext = () => {
  const context = useContext(WebSocketChatContext);
  // Return a safe object with defaults if no context (for unauthenticated pages)
  return context || {
    conversations: [],
    messages: [],
    onlineUsers: [],
    typingUsers: {},
    followRequests: [],
    setFollowRequests: () => { },
    notifications: [],
    setNotifications: () => { },
    isConnected: false,
    loading: false,
    selectConversation: () => { },
    sendMessage: () => Promise.resolve(),
    createNewConversation: () => Promise.resolve(),
    deleteConversation: () => Promise.resolve(),
  };
};

export const WebSocketChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [followRequests, setFollowRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio('/sounds/notification.mp3');
    audio.load();
    audioRef.current = audio;

    // Modern tarayıcılar için ses kilidini açma fonksiyonu
    const unlockAudio = () => {
      if (!isNotificationSoundEnabled()) {
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
        return;
      }
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          })
          .catch(e => console.log('Audio unlock failed:', e));
      }
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  const playNotificationSound = useCallback(() => {
    try {
      if (!isNotificationSoundEnabled()) return;
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play()
          .catch(e => {
            // Fallback: Try fresh audio object if ref fails
            const fallbackAudio = new Audio('/sounds/notification.mp3');
            fallbackAudio.play().catch(() => { });
          });
      } else {
        const directAudio = new Audio('/sounds/notification.mp3');
        directAudio.play().catch(() => { });
      }
    } catch (error) {
      // Silently fail if audio system is not available
    }
  }, []);

  const notificationContext = useOptionalNotificationContext();

  // Refs for stable references
  const socketRef = useRef(null);
  const isConnectedRef = useRef(false);
  const connectionAttemptRef = useRef(false);
  const currentUserRef = useRef(null);

  // Update refs when state changes
  useEffect(() => {
    socketRef.current = socket;
    isConnectedRef.current = isConnected;
    currentUserRef.current = getCurrentUserInfo();
  }, [socket, isConnected]);

  // Stable API call helper
  const apiCall = useCallback(async (endpoint, options = {}) => {
    const token = getToken();
    if (!token) {
      throw new Error('JWT token not found');
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }, []);

  // Stable message formatting
  const formatMessage = useCallback((message) => {
    return {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      receiverId: message.receiverId,
      timestamp: parseTimestamp(message.timestamp),
      status: message.status || 'sent',
      senderName: message.senderName || 'Bilinmeyen Kullanıcı',
      receiverName: message.receiverName || message.receiver?.username || null,
      senderAvatar: message.senderAvatar || message.sender?.photoUrl || null,
      receiverAvatar: message.receiverAvatar || message.receiver?.photoUrl || null,
      conversationId: message.conversationId
    };
  }, []);

  // Stable message operations
  const addOrUpdateMessage = useCallback((message) => {
    setMessages(prev => {
      const existingIndex = prev.findIndex(msg => msg.id === message.id);

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...message };
        return updated;
      }

      // Duplicate check
      const isDuplicate = prev.some(msg =>
        msg.content === message.content &&
        msg.senderId === message.senderId &&
        Math.abs(new Date(msg.timestamp).getTime() - new Date(message.timestamp).getTime()) < 5000
      );

      if (isDuplicate) {
        return prev;
      }

      const newMessages = [...prev, message];
      return newMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    });
  }, []);

  const replaceOptimisticMessage = useCallback((realMessage) => {
    setMessages(prev => {
      const optimisticIndex = prev.findIndex(msg =>
        String(msg.id).startsWith('temp-') &&
        msg.content === realMessage.content &&
        msg.senderId === realMessage.senderId
      );

      if (optimisticIndex !== -1) {
        const updated = [...prev];
        updated[optimisticIndex] = realMessage;
        return updated;
      }

      const exists = prev.some(msg => msg.id === realMessage.id);
      if (!exists) {
        const newMessages = [...prev, realMessage];
        return newMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      }

      return prev;
    });
  }, []);

  const removeOptimisticMessage = useCallback((messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  const updateConversationLastMessage = useCallback((message) => {
    setConversations(prev => {
      const currentUser = currentUserRef.current;
      const isFromCurrentUser =
        String(message.senderId) === String(currentUser?.id);
      const otherUserId = isFromCurrentUser
        ? message.receiverId
        : message.senderId;

      const existingIndex = prev.findIndex(conv =>
        conv.id === message.conversationId ||
        String(conv.participantId) === String(otherUserId)
      );

      if (existingIndex !== -1) {
        const updated = [...prev];
        const existing = updated[existingIndex];

        updated[existingIndex] = {
          ...existing,
          lastMessage: message.content,
          lastMessageTime: message.timestamp,
          unreadCount: isFromCurrentUser
            ? (existing.unreadCount || 0)
            : (existing.unreadCount || 0) + 1
        };
        return updated;
      }

      const activeConversationMatch =
        activeConversation &&
        String(activeConversation.participantId) === String(otherUserId)
          ? activeConversation
          : null;

      const isOtherUserOnline = (onlineUsers || []).some((onlineUser) => {
        if (onlineUser && typeof onlineUser === 'object') {
          return String(onlineUser.id || onlineUser.userId || '') === String(otherUserId);
        }
        return String(onlineUser) === String(otherUserId);
      });

      const participantName = isFromCurrentUser
        ? activeConversationMatch?.participantName ||
          activeConversationMatch?.participantUsername ||
          message.receiverName ||
          'Bilinmeyen Kullanıcı'
        : message.senderName || 'Bilinmeyen Kullanıcı';

      const participantAvatar = isFromCurrentUser
        ? activeConversationMatch?.participantAvatar || message.receiverAvatar || placeholderImg
        : message.senderAvatar || placeholderImg;

      const newConversation = {
        id: message.conversationId || `temp-${Date.now()}-${otherUserId}`,
        participantId: otherUserId,
        participantName,
        participantUsername: isFromCurrentUser
          ? activeConversationMatch?.participantUsername || message.receiverName || null
          : message.senderName || null,
        participantAvatar,
        lastMessage: message.content,
        lastMessageTime: message.timestamp,
        unreadCount: isFromCurrentUser ? 0 : 1,
        isOnline: isOtherUserOnline,
        createdAt: new Date().toISOString()
      };

      return [...prev, newConversation];
    });
  }, [activeConversation, onlineUsers]);

  // Socket connection with stable reference
  const connectSocket = useCallback(() => {
    const token = getToken();
    if (!token) {
      // Token not found or expired - silently skip connection
      return;
    }

    if (socketRef.current && isConnectedRef.current) {
      return;
    }

    if (connectionAttemptRef.current) {
      return;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      setSocket(null);
      setIsConnected(false);
    }

    connectionAttemptRef.current = true;

    try {
      const socketInstance = io(getWebSocketUrl(), {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: false
      });

      // Connection events
      socketInstance.on('connect', () => {
        setIsConnected(true);
        setError(null);
        connectionAttemptRef.current = false;
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
        connectionAttemptRef.current = false;
      });

      socketInstance.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        // Only set error if we have a valid token (otherwise it's expected to fail)
        const token = getToken();
        if (token) {
          setError('Backend bağlantı hatası: ' + error.message);
        }
        setIsConnected(false);
        connectionAttemptRef.current = false;
      });

      // Message events
      socketInstance.on('newMessage', (message) => {
        const formattedMessage = formatMessage(message);

        updateConversationLastMessage(formattedMessage);
        addOrUpdateMessage(formattedMessage);
        // Refresh conversation metadata (name/avatar) for newly created chats
        fetchConversations().catch(() => {});

        // Animated envelope notification for incoming messages
        const currentUser = getCurrentUserInfo();
        if (currentUser && String(message.senderId) !== String(currentUser.id)) {
          const isOnMessagingPage = typeof window !== 'undefined' && window.location.pathname === '/messaging';
          const isActiveConv = activeConversation?.participantId && 
            String(activeConversation.participantId) === String(message.senderId);

          if (!isOnMessagingPage || !isActiveConv) {
            window.dispatchEvent(new CustomEvent('newMessageEnvelopeNotification', {
              detail: {
                senderId: message.senderId,
                senderName: message.senderName || formattedMessage.senderName || 'Birisi',
                senderAvatar: message.senderAvatar || formattedMessage.senderAvatar,
                content: message.content || '',
                messageId: message.id
              }
            }));
            playNotificationSound();
          }
        }
      });

      socketInstance.on('messageSent', (message) => {
        const formattedMessage = formatMessage(message);

        updateConversationLastMessage(formattedMessage);
        replaceOptimisticMessage(formattedMessage);
        // Ensure sidebar immediately shows correct participant info
        fetchConversations().catch(() => {});
      });

      // User status events
      socketInstance.on('userOnline', (userData) => {
        const normalized = normalizeOnlineUser(userData);
        if (!normalized?.username && !normalized?.id) return;

        setOnlineUsers((prev) => {
          const exists = prev.some((u) =>
            (normalized.id && String(u.id) === String(normalized.id)) ||
            (normalized.username && String(u.username) === String(normalized.username))
          );
          if (exists) return prev;
          return [...prev, normalized];
        });

        if (normalized.userId && normalized.username) {
          setUserMap(prev => ({ ...prev, [normalized.username]: normalized.userId }));
        }
      });

      socketInstance.on('userOffline', (userData) => {
        const normalized = normalizeOnlineUser(userData);
        setOnlineUsers((prev) =>
          prev.filter((u) => {
            if (normalized.id && String(u.id) === String(normalized.id)) return false;
            if (normalized.username && String(u.username) === String(normalized.username)) return false;
            return true;
          })
        );
      });

      socketInstance.on('typing', ({ userId, conversationId, isTyping }) => {
        // Kendi yazma durumumuzu gösterme - odak kaybını önler
        const currentUser = getCurrentUserInfo();
        if (currentUser && String(userId) === String(currentUser.id)) return;

        setTypingUsers(prev => ({
          ...prev,
          [conversationId]: isTyping ? userId : null
        }));
      });

      // FIXED: Simple conversation delete handler with username support
      socketInstance.on('conversationDeleted', (data) => {
        // Support both old format ({ conversationId, deletedBy }) and new format with username
        const conversationId = data.conversationId;
        const deletedBy = data.deletedBy;

        // Try to get username from various sources
        let deletedByUsername = data.deletedByUsername;

        if (!deletedByUsername) {
          // Try to find username from conversations list
          const conversation = conversations?.find(conv => conv.id === conversationId);
          if (conversation) {
            deletedByUsername = conversation.participantName || conversation.participantUsername;
          }
        }

        if (!deletedByUsername) {
          // Try to find username from userMap (it's an object, not array)
          const user = userMap?.[deletedBy];
          if (user) {
            deletedByUsername = user.username || user.name || user;
          }
        }

        // Fallback
        if (!deletedByUsername) {
          deletedByUsername = 'Bir kullanıcı';
        }

        // Sadece karşı tarafın silme işlemi için bildirim göster
        // Kendi silme işlemimiz için bildirim gösterme
        if (deletedBy !== getCurrentUserInfo()?.id) {
          // Karşı taraf sildi - sadece bildirim göster, konuşmayı silme
          if (notificationContext?.showNotification) {
            notificationContext.showNotification({
              title: 'Konuşma Silindi',
              message: `${deletedByUsername} konuşmayı sildi.`,
              variant: 'info'
            });
          }
        } else {
          // Kendi silme işlemimiz - konuşmayı local'den sil
          setConversations(prev => prev.filter(conv => conv.id !== conversationId));

          // Clear if this was the active conversation
          if (activeConversation?.id === conversationId) {
            setActiveConversation(null);
            setMessages([]);
          }
        }
      });

      socketInstance.on('newFollowRequest', (request) => {
        setFollowRequests(prev => {
          if (prev.some(r => r.id === request.id)) return prev;
          return [request, ...prev];
        });
        playNotificationSound();

        if (notificationContext?.showNotification) {
          notificationContext.showNotification({
            title: '👤 Yeni Takip İsteği',
            message: `${request.follower.firstName} ${request.follower.lastName} sizi takip etmek istiyor.`,
            variant: 'success',
            delay: 5000
          });
        }
      });

      socketInstance.on('followRequestAccepted', (data) => {
        const newNotification = {
          id: `notif-${Date.now()}`,
          type: 'follow_accept',
          relatedUserId: data.accepterId,
          title: `${data.accepter.firstName} ${data.accepter.lastName} takip isteğinizi kabul etti.`,
          description: 'Takip İsteği Kabul Edildi',
          time: new Date(),
          avatar: data.accepter.photoUrl,
          textAvatar: {
            text: `${data.accepter.firstName?.charAt(0)}${data.accepter.lastName?.charAt(0)}`,
            variant: 'success'
          },
          isRead: false
        };

        setNotifications((prev) => {
          const next = [newNotification, ...prev];
          if (typeof window !== 'undefined' && document.visibilityState === 'hidden') {
            const unreadCount = next.filter((n) => !(n.isRead === true || n.is_read === true)).length;
            window.dispatchEvent(
              new CustomEvent('tabTitleNotification', { detail: { type: 'notification', unreadCount } })
            );
          }
          return next;
        });
        playNotificationSound();

        if (notificationContext?.showNotification) {
          notificationContext.showNotification({
            title: '✅ Takip İsteği Kabul Edildi',
            message: `${data.accepter.firstName} ${data.accepter.lastName} artık sizi takip ediyor.`,
            variant: 'success',
            delay: 5000
          });
        }

        // Takip durumu değiştiği için bileşenleri haberdar et
        window.dispatchEvent(new Event('followStatusChanged'));
      });

      // Post silindi - takipçilerin timeline'ından anında kaldır
      socketInstance.on('postDeletedFromFeed', (data) => {
        if (data && data.postId) {
          window.dispatchEvent(new CustomEvent('postDeletedFromFeed', { detail: { postId: data.postId } }));
        }
      });

      // Yeni post feed'e düştü (takip ettiğin biri paylaştı) - LinkedIn/Facebook tarzı anında görünüm
      socketInstance.on('newPostInFeed', (post) => {
        if (post && post.id) {
          window.dispatchEvent(new CustomEvent('postCreated', {
            detail: { post, fromRealtime: true }
          }));
        }
      });

      // Yeni yorum (biri paylaşımına yorum yaptı) - anlık görünüm
      socketInstance.on('newCommentInPost', (data) => {
        if (data && data.postId && data.comment) {
          window.dispatchEvent(new CustomEvent('newCommentInPost', {
            detail: { postId: data.postId, comment: data.comment }
          }));
        }
      });

      socketInstance.on('newNotification', (notification) => {
        const formattedNotification = {
          ...notification,
          time: notification.time || notification.created_at || new Date(),
          isRead:
            typeof notification.isRead === 'boolean'
              ? notification.isRead
              : Boolean(notification.is_read),
          avatar: notification.avatar || notification.related_user?.photoUrl,
          textAvatar: notification.textAvatar || {
            text: notification.related_user?.firstName?.charAt(0) || '?',
            variant: 'primary',
          },
        };

        setNotifications((prev) => {
          if (prev.some((existing) => existing.id === formattedNotification.id)) {
            return prev;
          }
          const next = [formattedNotification, ...prev];
          // Sekme başlığı için hemen event - React render beklemeden (Firefox uyumluluğu)
          if (typeof window !== 'undefined' && document.visibilityState === 'hidden') {
            const unreadCount = next.filter((n) => !(n.isRead === true || n.is_read === true)).length;
            window.dispatchEvent(
              new CustomEvent('tabTitleNotification', { detail: { type: 'notification', unreadCount } })
            );
          }
          return next;
        });
        playNotificationSound();

        if (notificationContext?.showNotification) {
          const isComment = notification.type === 'post_comment';
          const displayTitle = isComment
            ? (notification.title || '🔔 Yeni yorum')
            : (notification.related_user?.firstName?.trim()
              ? `🔔 ${notification.related_user.firstName} yeni bir gönderi paylaştı`
              : '🔔 Yeni Bildirim');
          notificationContext.showNotification({
            title: displayTitle,
            message: notification.message || notification.title || 'Yeni bir bildiriminiz var.',
            variant: 'info',
            delay: 5000,
          });
        }
      });

      setSocket(socketInstance);
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setError('WebSocket bağlantı hatası');
      connectionAttemptRef.current = false;
    }
  }, [formatMessage, updateConversationLastMessage, addOrUpdateMessage, replaceOptimisticMessage, notificationContext, activeConversation, playNotificationSound]);

  // API functions
  const fetchConversations = useCallback(async () => {
    // Don't fetch if no token (prevents 401 on login screen)
    const token = getToken();
    if (!token) {
      setConversations([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await apiCall('/chat/conversations');

      const formatted = data.map(conv => ({
        id: conv.id || conv.conversationId,
        participantId: conv.participant?.id || conv.participantId || conv.otherUserId,
        participantFirstName: conv.participant?.firstName || conv.participantFirstName || null,
        participantLastName: conv.participant?.lastName || conv.participantLastName || null,
        participantUsername: conv.participant?.username || conv.participantUsername || null,
        participantName:
          conv.participantName ||
          `${conv.participant?.firstName || ''} ${conv.participant?.lastName || ''}`.trim() ||
          conv.participant?.username ||
          'Bilinmeyen Kullanıcı',
        participantAvatar:
          conv.participant?.photoUrl ||
          conv.participantAvatar ||
          conv.participant?.avatar ||
          conv.avatar ||
          null,
        lastMessage: conv.lastMessage || '',
        lastMessageTime: parseTimestamp(conv.lastMessageAt || conv.lastMessageTime),
        unreadCount: conv.unreadCount || 0,
        isOnline: conv.isOnline || false,
        createdAt: conv.createdAt
      }));

      const deduplicated = formatted.reduce((acc, conv) => {
        const existing = acc.find(c => c.participantId === conv.participantId);
        if (!existing || new Date(conv.lastMessageTime) > new Date(existing.lastMessageTime)) {
          return existing
            ? acc.map(c => c.participantId === conv.participantId ? conv : c)
            : [...acc, conv];
        }
        return acc;
      }, []);

      setConversations(deduplicated);
    } catch (error) {
      // Silently ignore 401 errors (expected when not authenticated)
      if (!error.message.includes('401')) {
        console.error('Error fetching conversations:', error);
        setError(`Conversation'lar yüklenirken hata: ${error.message}`);
      }
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const fetchMessages = useCallback(async (conversationId) => {
    if (!conversationId || String(conversationId).startsWith('temp-')) {
      setMessages([]);
      return [];
    }

    try {
      setLoading(true);
      setError(null);

      const data = await apiCall(`/chat/conversations/${conversationId}/messages`);
      const formattedMessages = data.map(formatMessage);

      setMessages(formattedMessages);
      return formattedMessages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Mesajlar yüklenirken hata oluştu');
      setMessages([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [apiCall, formatMessage]);

  const fetchOnlineUsers = useCallback(async () => {
    // Don't fetch if no token (prevents 401 on login screen)
    const token = getToken();
    if (!token) {
      setOnlineUsers([]);
      return;
    }

    try {
      const data = await apiCall('/chat/online-users');

      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
        const normalizedUsers = data.map(normalizeOnlineUser).filter(Boolean);
        setOnlineUsers(normalizedUsers);

        const mapping = {};
        data.forEach(user => {
          if (user.username && user.id) {
            mapping[user.username] = user.id;
          }
        });
        setUserMap(mapping);
      } else {
        setOnlineUsers((data || []).map(normalizeOnlineUser).filter(Boolean));
      }
    } catch (error) {
      // Silently ignore 401 errors (expected when not authenticated)
      if (!error.message.includes('401')) {
        console.error('Error fetching online users:', error);
      }
      setOnlineUsers([]);
    }
  }, [apiCall]);

  // Actions
  const sendMessage = useCallback((content, receiverId) => {
    if (!socket || !isConnected) {
      return Promise.reject(new Error('Socket not connected'));
    }

    if (!content || content.trim().length === 0) {
      return Promise.reject(new Error('Message content is empty'));
    }

    if (!receiverId) {
      return Promise.reject(new Error('Receiver ID is required'));
    }

    const currentUser = currentUserRef.current;
    if (!currentUser) {
      return Promise.reject(new Error('Current user info not available'));
    }

    let backendReceiverId = receiverId;
    if (typeof receiverId === 'string' && userMap[receiverId] && userMap[receiverId] !== receiverId) {
      backendReceiverId = userMap[receiverId];
    }

    const messageData = {
      content: content.trim(),
      receiverId: backendReceiverId,
      timestamp: new Date().toISOString()
    };

    const optimisticMessage = {
      id: `temp-${Date.now()}-${Math.random()}`,
      content: content.trim(),
      senderId: currentUser.id,
      receiverId: backendReceiverId,
      timestamp: new Date(),
      status: 'sending',
      senderName: currentUser.username || 'Ben',
      conversationId: activeConversation?.id || null
    };

    addOrUpdateMessage(optimisticMessage);

    return new Promise((resolve, reject) => {
      socket.emit('sendMessage', messageData, (response) => {
        if (response?.error) {
          removeOptimisticMessage(optimisticMessage.id);
          if (response.code === 'FOLLOW_REQUIRED') {
            reject(new Error('FOLLOW_REQUIRED'));
          } else {
            reject(new Error(response.error || 'Send failed'));
          }
        } else {
          resolve(optimisticMessage);
        }
      });
    });
  }, [socket, isConnected, activeConversation, userMap, addOrUpdateMessage, removeOptimisticMessage]);

  const selectConversation = useCallback(async (conversation) => {
    if (activeConversation?.id === conversation?.id && !conversation?.isTemporary) {
      return;
    }

    setActiveConversation(conversation);

    if (conversation && !conversation.isTemporary && conversation.unreadCount > 0) {
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversation.id
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    }

    if (conversation && !conversation.isTemporary) {
      await fetchMessages(conversation.id);
    } else {
      setMessages([]);
    }
  }, [activeConversation, fetchMessages]);

  const createNewConversation = useCallback(async (participantId, participantName = null, participantData = null) => {
    let actualParticipantId = participantId;
    let actualParticipantName = participantName || participantId;

    if (typeof participantId === 'string' && userMap[participantId] && userMap[participantId] !== participantId) {
      actualParticipantId = userMap[participantId];
      actualParticipantName = participantId;
    } else if (typeof participantId === 'string') {
      try {
        const userData = await apiCall(`/chat/user/${encodeURIComponent(participantId)}`);
        actualParticipantId = userData.id;
        setUserMap(prev => ({ ...prev, [participantId]: actualParticipantId }));
      } catch (error) {
        console.error('Error getting user ID from backend:', error);
      }
    }

    const tempConversation = {
      id: `temp-${Date.now()}`,
      participantId: actualParticipantId,
      participantName: actualParticipantName,
      participantAvatar: participantData?.avatar || participantData?.photoUrl || placeholderImg,
      participantUsername: participantData?.username || null,
      participantFirstName: participantData?.firstName || null,
      participantLastName: participantData?.lastName || null,
      lastMessage: null,
      lastMessageTime: null,
      unreadCount: 0,
      isTemporary: true,
      isOnline: Boolean(participantData?.isOnline),
    };

    // Do not persist unsent temp conversations in sidebar list.
    // A real conversation will be created by backend on first sent message.
    await selectConversation(tempConversation);

    return tempConversation;
  }, [selectConversation, userMap, apiCall]);

  const markMessageAsRead = useCallback((messageId, conversationIdHint = null) => {
    if (!messageId) return;

    let resolvedConversationId = conversationIdHint;
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        if (!resolvedConversationId && msg.conversationId) {
          resolvedConversationId = msg.conversationId;
        }
        return { ...msg, status: 'read' };
      }),
    );

    if (resolvedConversationId) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === resolvedConversationId
            ? { ...conv, unreadCount: Math.max(0, (conv.unreadCount || 0) - 1) }
            : conv,
        ),
      );
    }

    if (socket && isConnected) {
      socket.emit('markAsRead', { messageId });
    }
  }, [socket, isConnected]);

  const markConversationAsRead = useCallback((conversationId, participantIdHint = null) => {
    if (!conversationId) return;

    // Immediately sync UI counters (header badge uses conversations.unreadCount)
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ||
        (participantIdHint !== null &&
          String(conv.participantId) === String(participantIdHint))
          ? { ...conv, unreadCount: 0 }
          : conv,
      ),
    );

    const currentUser = currentUserRef.current;

    // Mark all unread incoming messages in that conversation as read
    const unreadMessageIds = messages
      .filter(
        (msg) =>
          (msg.conversationId === conversationId ||
            (participantIdHint !== null &&
              (String(msg.senderId) === String(participantIdHint) ||
                String(msg.receiverId) === String(participantIdHint)))) &&
          (!currentUser || String(msg.receiverId) === String(currentUser.id)) &&
          msg.status !== 'read',
      )
      .map((msg) => msg.id);

    if (unreadMessageIds.length === 0) return;

    setMessages((prev) =>
      prev.map((msg) =>
        unreadMessageIds.includes(msg.id) ? { ...msg, status: 'read' } : msg,
      ),
    );

    if (socket && isConnected) {
      unreadMessageIds.forEach((messageId) => {
        socket.emit('markAsRead', { messageId });
      });
    }
  }, [messages, socket, isConnected]);

  // FIXED: Delete conversation - only from current user's view
  const deleteConversation = useCallback(async (conversationId) => {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    try {
      // Check if it's a temporary conversation
      const isTemporary = conversationId.startsWith('temp-');

      if (!isTemporary) {
        // API call to soft delete conversation (only for current user)
        await apiCall(`/chat/conversations/${conversationId}`, {
          method: 'DELETE'
        });

        // Emit WebSocket event to notify other participants
        if (socket && isConnected) {
          const currentUser = getCurrentUserInfo();
          socket.emit('deleteConversation', {
            conversationId,
            deletedBy: currentUser?.id,
            deletedByUsername: currentUser?.username || 'Bilinmeyen Kullanıcı'
          });
        }
      }

      // Remove from local state (only current user's view)
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));

      // Clear messages if this was the active conversation
      if (activeConversation?.id === conversationId) {
        setActiveConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }, [apiCall, activeConversation, socket, isConnected]);

  // Initial connection effect
  useEffect(() => {
    const token = getToken();
    if (token) {
      connectSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, []);

  // Token change monitoring
  useEffect(() => {
    let timeoutId;

    const checkTokenAndConnect = () => {
      const token = getToken();
      if (token && !isConnectedRef.current && !connectionAttemptRef.current) {
        timeoutId = setTimeout(connectSocket, 1000);
      } else if (!token && isConnectedRef.current) {
        if (socketRef.current) {
          socketRef.current.disconnect();
          setSocket(null);
          setIsConnected(false);
        }
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        checkTokenAndConnect();
      }
    };

    const handleCustomStorageChange = (e) => {
      if (e.detail && e.detail.key === 'token') {
        checkTokenAndConnect();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [connectSocket]);

  // Load data when connected
  useEffect(() => {
    // Only fetch if connected AND user has a token
    const token = getToken();
    if (isConnected && token) {
      Promise.all([
        fetchConversations(),
        fetchOnlineUsers()
      ]).catch(error => {
        // Silently ignore 401 errors
        if (!error.message?.includes('401')) {
          console.error('Error loading initial data:', error);
        }
      });
    }
  }, [isConnected, fetchConversations, fetchOnlineUsers]);

  // Memoized context value
  const contextValue = useMemo(() => ({
    socket,
    isConnected,
    loading,
    error,
    conversations,
    activeConversation,
    messages,
    onlineUsers,
    typingUsers,
    followRequests,
    setFollowRequests,
    notifications,
    setNotifications,
    sendMessage,
    sendTypingStatus: (conversationId, isTyping) => {
      if (socket && isConnected) {
        socket.emit('typing', { conversationId, isTyping });
      }
    },
    markMessageAsRead,
    markConversationAsRead,
    selectConversation,
    createNewConversation,
    deleteConversation,
    searchMessages: async (query) => {
      try {
        return await apiCall(`/chat/search?q=${encodeURIComponent(query)}`);
      } catch (error) {
        console.error('Error searching messages:', error);
        setError('Arama yapılırken hata oluştu');
        return [];
      }
    },
    fetchConversations,
    fetchMessages,
    fetchOnlineUsers,
    connectSocket
  }), [
    socket,
    isConnected,
    loading,
    error,
    conversations,
    activeConversation,
    messages,
    onlineUsers,
    typingUsers,
    followRequests,
    notifications,
    sendMessage,
    markMessageAsRead,
    markConversationAsRead,
    selectConversation,
    createNewConversation,
    deleteConversation,
    fetchConversations,
    fetchMessages,
    fetchOnlineUsers,
    connectSocket,
    apiCall
  ]);

  return (
    <WebSocketChatContext.Provider value={contextValue}>
      {children}
    </WebSocketChatContext.Provider>
  );
};