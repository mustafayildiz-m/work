'use client';

import { useAuthContext } from '@/context/useAuthContext';
import { useLayoutContext } from '@/context/useLayoutContext';
import { useLanguage } from '@/context/useLanguageContext';
import { useWebSocketChatContext } from '@/context/useWebSocketChatContext';
import Image from 'next/image';
import { BsPencilSquare, BsChevronUp, BsChevronDown, BsSearch, BsThreeDots } from 'react-icons/bs';
import placeholderImg from '@/assets/images/avatar/placeholder.jpg';
import { useSession } from 'next-auth/react';
import { useState, useMemo, useEffect, useRef } from 'react';
import clsx from 'clsx';
import SimplebarReactClient from '@/components/wrappers/SimplebarReactClient';

const MessagingBar = () => {
    const { userInfo } = useAuthContext();
    const { conversationPanel } = useLayoutContext();
    const { locale, t } = useLanguage();
    const { status, data: session } = useSession();
    const { conversations, selectConversation, sendMessage, socket, fetchMessages, isConnected, markMessageAsRead, markConversationAsRead } = useWebSocketChatContext();

    const [isExpanded, setIsExpanded] = useState(false);
    const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [newMessageQuery, setNewMessageQuery] = useState('');
    const [userProfile, setUserProfile] = useState(null);
    const [connections, setConnections] = useState([]);
    const [activeChats, setActiveChats] = useState([]); // List of { user, messages, input, isExpanded }
    const chatInputRef = useRef(null);
    const activeChatsRef = useRef([]);

    useEffect(() => {
        activeChatsRef.current = activeChats;
    }, [activeChats]);

    // Fetch fresh user data to ensure photoUrl is present
    useEffect(() => {
        const fetchUserData = async () => {
            const userId = userInfo?.id || session?.user?.id || session?.user?.sub;
            if (!userId) return;

            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');

                const response = await fetch(`${apiBaseUrl}/users/${userId}`, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserProfile(data);
                }
            } catch (error) {
                console.error('Error fetching user profile in MessagingBar:', error);
            }
        };

        if (status === 'authenticated') {
            fetchUserData();
        }
    }, [userInfo?.id, session?.user?.id, status]);

    // Fetch connections for New Message suggestions
    useEffect(() => {
        const fetchConnections = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');
            try {
                const response = await fetch(`${apiBaseUrl}/user-follow/connections`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setConnections(data);
                }
            } catch (error) {
                console.error('Error fetching connections:', error);
            }
        };
        if (status === 'authenticated') fetchConnections();
    }, [status]);

    if (status === 'unauthenticated') return null;

    const getLocalized = (key, trValue, enValue) => {
        const value = t(key);
        if (value === key) {
            return locale === 'tr' ? trValue : enValue;
        }
        return value;
    };

    const getDisplayAvatar = (photoUrl) => {
        const defaultPlaceholder = typeof placeholderImg === 'string' ? placeholderImg : (placeholderImg?.src || '/images/avatar/placeholder.jpg');

        if (!photoUrl || photoUrl === 'null' || photoUrl === 'undefined') return defaultPlaceholder;

        if (typeof photoUrl === 'object') return photoUrl.src || defaultPlaceholder;

        const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');

        if (photoUrl.startsWith('http')) return photoUrl;

        if (photoUrl.startsWith('/uploads/')) {
            return `${apiBaseUrl}${photoUrl}`;
        }

        return `${apiBaseUrl}/uploads/${photoUrl}`;
    };

    const filteredConversations = useMemo(() => {
        return conversations.filter(conv =>
            conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
        ).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
    }, [conversations, searchQuery]);

    const suggestedUsers = useMemo(() => {
        if (!newMessageQuery) return connections.slice(0, 10);
        return connections.filter(u =>
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(newMessageQuery.toLowerCase()) ||
            u.username?.toLowerCase().includes(newMessageQuery.toLowerCase())
        );
    }, [connections, newMessageQuery]);

    // Keep header badge synchronized: if a chat window is open, mark that conversation as read.
    useEffect(() => {
        if (!Array.isArray(activeChats) || activeChats.length === 0) return;
        if (!Array.isArray(conversations) || conversations.length === 0) return;

        activeChats
            .filter((chat) => chat?.isExpanded)
            .forEach((chat) => {
                const conv = conversations.find(
                    (c) => String(c.participantId) === String(chat.user?.id)
                );
                if (!conv || !conv.id || String(conv.id).startsWith('temp-')) return;
                if ((conv.unreadCount || 0) <= 0) return;
                markConversationAsRead?.(conv.id, conv.participantId);
            });
    }, [activeChats, conversations, markConversationAsRead]);

    // Auto-open chat boxes for unread conversations on login
    useEffect(() => {
        if (status !== 'authenticated' || !Array.isArray(conversations) || conversations.length === 0) return;

        const unreadConversations = conversations
            .filter((conv) => (conv.unreadCount || 0) > 0)
            .sort((a, b) => {
                const unreadDiff = (b.unreadCount || 0) - (a.unreadCount || 0);
                if (unreadDiff !== 0) return unreadDiff;
                return new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0);
            });

        if (unreadConversations.length === 0) return;

        setActiveChats((prev) => {
            const next = [...prev];

            unreadConversations.forEach((conv) => {
                const exists = next.some((chat) => String(chat.user.id) === String(conv.participantId));
                if (exists) return;

                const matchedConnection = connections.find((c) =>
                    String(c.id) === String(conv.participantId) ||
                    (c.username && c.username === conv.participantName)
                );

                const user = matchedConnection || {
                    id: conv.participantId,
                    firstName: conv.participantName?.split(' ')[0] || getLocalized('messaging.userFallback', 'Kullanıcı', 'User'),
                    lastName: conv.participantName?.split(' ').slice(1).join(' ') || '',
                    photoUrl: conv.participantAvatar
                };

                next.push({
                    user,
                    messages: [],
                    input: '',
                    isExpanded: false,
                    unreadCount: conv.unreadCount || 0
                });
            });

            return next.sort((a, b) => (b.unreadCount || 0) - (a.unreadCount || 0));
        });
    }, [status, conversations, connections]);

    // WebSocket Listener for incoming messages to open/update tabs
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleNewMessage = (message) => {
            // Find if this message belongs to any of our active chats
            const senderId = message.senderId;
            const isMe = String(senderId) === String(userInfo?.id || session?.user?.id);
            const otherUserId = isMe ? message.receiverId : senderId;
            const existingChat = activeChatsRef.current.find(c => String(c.user.id) === String(otherUserId));
            const shouldMarkReadNow = !isMe && !!existingChat?.isExpanded;

            // Update existing tab or open new one
            setActiveChats(prev => {
                const existingChatIndex = prev.findIndex(c => c.user.id === otherUserId);

                const formattedMsg = {
                    id: message.id || Date.now() + Math.random(),
                    senderId: senderId,
                    text: message.content,
                    time: new Date(message.timestamp || message.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isMe: isMe
                };

                if (existingChatIndex !== -1) {
                    const updated = [...prev];
                    const chat = updated[existingChatIndex];
                    // Avoid duplicates
                    if (!chat.messages.some(m => m.id === formattedMsg.id)) {
                        updated[existingChatIndex] = {
                            ...chat,
                            messages: [...chat.messages, formattedMsg],
                            unreadCount: !isMe && !chat.isExpanded ? (chat.unreadCount || 0) + 1 : (chat.unreadCount || 0)
                        };
                    }
                    return updated;
                } else {
                    // Open new tab for the sender
                    // Need to find user info from connections or conversations
            const senderConv = conversations.find(c => String(c.participantId) === String(otherUserId));
            const senderConn = connections.find(c => String(c.id) === String(otherUserId));

                    const user = {
                        id: otherUserId,
                        firstName: senderConv?.participantName?.split(' ')[0] || senderConn?.firstName || getLocalized('messaging.userFallback', 'Kullanıcı', 'User'),
                        lastName: senderConv?.participantName?.split(' ').slice(1).join(' ') || senderConn?.lastName || '',
                        photoUrl: senderConv?.participantAvatar || senderConn?.photoUrl
                    };

                    return [{
                        user,
                        messages: [formattedMsg],
                        input: '',
                        isExpanded: false,
                        unreadCount: isMe ? 0 : 1
                    }, ...prev];
                }
            });

            if (shouldMarkReadNow && message.id) {
                markMessageAsRead?.(message.id, message.conversationId);
            }
        };

        socket.on('newMessage', handleNewMessage);
        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, [socket, isConnected, conversations, connections, userInfo?.id, session?.user?.id, markMessageAsRead]);

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const now = new Date();
        if (d.toDateString() === now.toDateString()) {
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
    };

    const resolveConversationAvatar = (conv) => {
        if (conv?.participantAvatar && conv.participantAvatar !== 'null' && conv.participantAvatar !== 'undefined') {
            return conv.participantAvatar;
        }

        const matchedConnection = connections.find((c) =>
            String(c.id) === String(conv?.participantId) ||
            (c.username && c.username === conv?.participantName)
        );

        return matchedConnection?.photoUrl || null;
    };

    const resolveConversationName = (conv) => {
        const fromConversation =
            `${conv?.participantFirstName || ''} ${conv?.participantLastName || ''}`.trim();
        if (fromConversation) return fromConversation;

        const matchedConnection = connections.find((c) =>
            String(c.id) === String(conv?.participantId) ||
            (c.username && c.username === conv?.participantUsername)
        );

        const fromConnection =
            `${matchedConnection?.firstName || ''} ${matchedConnection?.lastName || ''}`.trim();
        if (fromConnection) return fromConnection;

        return conv?.participantName || conv?.participantUsername || getLocalized('messaging.unknownUser', 'Bilinmeyen Kullanıcı', 'Unknown User');
    };

    const handleConversationClick = async (conv) => {
        if (conv?.id && !String(conv.id).startsWith('temp-')) {
            markConversationAsRead?.(conv.id, conv.participantId);
            await selectConversation(conv);
        }

        // Find user details from connection or create a simple user object
        const user = connections.find(c => String(c.id) === String(conv.participantId)) || {
            id: conv.participantId,
            firstName: (conv.participantFirstName || resolveConversationName(conv).split(' ')[0]),
            lastName: (conv.participantLastName || resolveConversationName(conv).split(' ').slice(1).join(' ')),
            photoUrl: conv.participantAvatar
        };
        openChatWindow(user);
    };

    const { theme } = useLayoutContext();
    const isDark = theme === 'dark';

    const colors = isDark ? {
        bg: '#1d2226',
        header: '#1d2226',
        itemHover: '#293138',
        textMain: '#ffffff',
        textMuted: '#9aa0a6',
        searchBg: '#38434f',
        border: 'rgba(255,255,255,0.1)',
        shadow: '0 8px 30px rgba(0,0,0,0.5)'
    } : {
        bg: '#ffffff',
        header: '#ffffff',
        itemHover: '#f3f6f8',
        textMain: '#000000',
        textMuted: '#666666',
        searchBg: '#eef3f8',
        border: 'rgba(0,0,0,0.08)',
        shadow: '0 8px 30px rgba(0,0,0,0.12)'
    };

    const iconClass = isDark ? "text-white-50" : "text-black-50";
    const messagingTitle = t('menu.messaging') === 'menu.messaging'
        ? getLocalized('messaging.title', 'Mesajlaşma', 'Messaging')
        : t('menu.messaging');
    const currentUserPhoto = userProfile?.photoUrl || userInfo?.photoUrl || session?.user?.image;

    const handleNewMessageClick = (e) => {
        e.stopPropagation();
        setNewMessageQuery('');
        setIsNewMessageOpen(true);
    };

    const handleSelectUser = (user) => {
        setIsNewMessageOpen(false);
        openChatWindow(user);
    };

    const openChatWindow = async (user) => {
        setActiveChats(prev => {
            if (prev.find(chat => String(chat.user.id) === String(user.id))) {
                return prev.map(chat =>
                    String(chat.user.id) === String(user.id) ? { ...chat, isExpanded: true, unreadCount: 0 } : chat
                );
            }
            return [{
                user,
                messages: [],
                input: '',
                isExpanded: true,
                unreadCount: 0
            }, ...prev];
        });

        // Fetch messages for this user
        // We need to find the conversationId first or use recipientId
        try {
            const conv = conversations.find(c => String(c.participantId) === String(user.id));
            if (conv && conv.id && !conv.id.startsWith('temp-')) {
                await selectConversation(conv);
                markConversationAsRead?.(conv.id, conv.participantId);
                const history = await fetchMessages(conv.id);
                if (history && Array.isArray(history)) {
                    const currentUserId = userInfo?.id || session?.user?.id;
                    history
                        .filter((m) =>
                            String(m.receiverId) === String(currentUserId) &&
                            m.status !== 'read'
                        )
                        .forEach((m) => markMessageAsRead?.(m.id, conv.id));

                    setActiveChats(prev => prev.map(chat =>
                        chat.user.id === user.id
                            ? {
                                ...chat,
                                messages: history.map(m => ({
                                    id: m.id,
                                    senderId: m.senderId,
                                    text: m.content,
                                    time: new Date(m.timestamp || m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                    isMe: String(m.senderId) === String(userInfo?.id || session?.user?.id)
                                }))
                            }
                            : chat
                    ));
                }
            }
        } catch (error) {
            console.error('Error fetching history for tab:', error);
        }
    };

    // Open a specific chat window from other pages/components
    useEffect(() => {
        const handleOpenMessagingWithUser = (event) => {
            const user = event?.detail?.user;
            if (!user?.id) return;
            setIsExpanded(true);
            setIsNewMessageOpen(false);
            openChatWindow(user);
        };

        window.addEventListener('openMessagingWithUser', handleOpenMessagingWithUser);
        return () => {
            window.removeEventListener('openMessagingWithUser', handleOpenMessagingWithUser);
        };
    }, [openChatWindow]);

    const closeChatWindow = (userId) => {
        setActiveChats(prev => prev.filter(chat => chat.user.id !== userId));
    };

    const loadChatHistoryForUser = async (userId) => {
        try {
            const conv = conversations.find(c => String(c.participantId) === String(userId));
            if (!conv || !conv.id || conv.id.startsWith('temp-')) return;

            await selectConversation(conv);
            markConversationAsRead?.(conv.id, conv.participantId);
            const history = await fetchMessages(conv.id);
            if (!history || !Array.isArray(history)) return;

            const currentUserId = userInfo?.id || session?.user?.id;
            history
                .filter((m) =>
                    String(m.receiverId) === String(currentUserId) &&
                    m.status !== 'read'
                )
                .forEach((m) => markMessageAsRead?.(m.id, conv.id));

            setActiveChats(prev => prev.map(chat =>
                String(chat.user.id) === String(userId)
                    ? {
                        ...chat,
                        messages: history.map(m => ({
                            id: m.id,
                            senderId: m.senderId,
                            text: m.content,
                            time: new Date(m.timestamp || m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            isMe: String(m.senderId) === String(userInfo?.id || session?.user?.id)
                        }))
                    }
                    : chat
            ));
        } catch (error) {
            console.error('Error loading chat history on toggle:', error);
        }
    };

    const toggleChatWindow = (userId) => {
        let shouldLoadHistory = false;
        let shouldMarkConversationRead = false;
        const targetConversation = conversations.find(
            (c) => String(c.participantId) === String(userId)
        );

        setActiveChats(prev => prev.map(chat => {
            if (String(chat.user.id) !== String(userId)) return chat;
            const nextExpanded = !chat.isExpanded;
            if (nextExpanded) {
                shouldLoadHistory = true;
                shouldMarkConversationRead = true;
            }
            return { ...chat, isExpanded: nextExpanded, unreadCount: nextExpanded ? 0 : chat.unreadCount };
        }));

        // Trigger immediately on click-to-open
        if (
            shouldMarkConversationRead &&
            targetConversation?.id &&
            !String(targetConversation.id).startsWith('temp-')
        ) {
            markConversationAsRead?.(
                targetConversation.id,
                targetConversation.participantId
            );
        }

        if (shouldLoadHistory) {
            loadChatHistoryForUser(userId);
        }
    };

    const updateChatInput = (userId, value) => {
        setActiveChats(prev => prev.map(chat =>
            chat.user.id === userId ? { ...chat, input: value } : chat
        ));
    };

    const handleSendMessage = async (userId) => {
        const chat = activeChats.find(c => c.user.id === userId);
        if (!chat || !chat.input.trim()) return;

        try {
            await sendMessage(chat.input, userId);

            const newMessage = {
                id: Date.now(),
                senderId: userInfo?.id || session?.user?.id,
                text: chat.input,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: true
            };

            setActiveChats(prev => prev.map(c =>
                c.user.id === userId
                    ? { ...c, messages: [...c.messages, newMessage], input: '' }
                    : c
            ));
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div
            className="d-none d-lg-block position-fixed end-0 bottom-0"
            style={{
                zIndex: 1050,
                width: '420px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
        >
            {/* Expanded Content */}
            <div
                className={clsx("overflow-hidden", isExpanded ? "d-block" : "d-none")}
                style={{
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                    height: '750px',
                    maxHeight: 'calc(100vh - 60px)',
                    backgroundColor: colors.bg,
                    display: 'flex',
                    flexDirection: 'column',
                    borderStyle: 'solid',
                    borderColor: colors.border,
                    borderWidth: '1px 1px 0 1px',
                    boxShadow: colors.shadow
                }}
            >
                {/* Header */}
                <div
                    onClick={() => setIsExpanded(false)}
                    className="d-flex align-items-center justify-content-between px-3"
                    style={{
                        height: '48px',
                        cursor: 'pointer',
                        backgroundColor: colors.header,
                        color: colors.textMain,
                        flexShrink: 0,
                        borderBottom: `1px solid ${colors.border}`
                    }}
                >
                    <div className="d-flex align-items-center">
                        <div className="position-relative me-2 d-flex align-items-center">
                            <Image
                                src={getDisplayAvatar(currentUserPhoto)}
                                alt="User"
                                width={32}
                                height={32}
                                className="rounded-circle"
                                style={{ border: '1px solid rgba(255,255,255,0.2)', objectFit: 'cover' }}
                                key={currentUserPhoto || 'default'}
                            />
                            <div className="position-absolute bottom-0 end-0 bg-success rounded-circle" style={{ width: '10px', height: '10px', border: '2px solid #1d2226' }} />
                        </div>
                        <span className="fw-bold ms-1" style={{ fontSize: '0.85rem' }}>{messagingTitle}</span>
                    </div>
                    <div className={clsx("d-flex align-items-center gap-3", iconClass)}>
                        <BsPencilSquare size={16} className="hover-active" onClick={handleNewMessageClick} title={getLocalized('messaging.newMessage', 'Yeni Mesaj', 'New Message')} />
                        <BsChevronDown size={18} className="hover-active" />
                    </div>
                </div>

                {/* Search Area */}
                <div className="p-3" style={{ flexShrink: 0, borderBottom: `1px solid ${colors.border}` }}>
                    <div className="position-relative">
                        <BsSearch className="position-absolute top-50 start-0 translate-middle-y ms-3" size={13} style={{ color: colors.textMuted }} />
                        <input
                            type="text"
                            className="form-control form-control-sm ps-5 pe-4 shadow-none"
                            placeholder={getLocalized('messaging.searchPlaceholder', 'Mesajlarda ara', 'Search messages')}
                            style={{
                                backgroundColor: colors.searchBg,
                                border: 'none',
                                color: colors.textMain,
                                fontSize: '0.9rem',
                                height: '36px',
                                borderRadius: '4px'
                            }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Conversation List */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <SimplebarReactClient style={{ height: '100%' }}>
                        {filteredConversations.length > 0 ? (
                            filteredConversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    onClick={() => handleConversationClick(conv)}
                                    className="d-flex align-items-center p-3 border-bottom hover-bg"
                                    style={{
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        minHeight: '84px',
                                        borderBottomColor: colors.border
                                    }}
                                >
                                    <div className="position-relative me-3 flex-shrink-0">
                                        <Image
                                            src={getDisplayAvatar(resolveConversationAvatar(conv))}
                                            alt={conv.participantName}
                                            width={48}
                                            height={48}
                                            className="rounded-circle"
                                            style={{ objectFit: 'cover' }}
                                        />
                                        {conv.isOnline && (
                                            <div className="position-absolute bottom-0 end-0 bg-success rounded-circle" style={{ width: '12px', height: '12px', border: `2px solid ${colors.bg}` }} />
                                        )}
                                    </div>
                                    <div className="flex-grow-1 overflow-hidden">
                                        <div className="d-flex justify-content-between align-items-baseline mb-1">
                                            <span className="text-truncate" style={{ fontSize: '1rem', color: colors.textMain, fontWeight: (conv.unreadCount || 0) > 0 ? '700' : '500' }}>
                                                {resolveConversationName(conv)}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>
                                                {formatDate(conv.lastMessageTime)}
                                            </span>
                                        </div>
                                        <div className="text-truncate" style={{ fontSize: '0.85rem', lineHeight: '1.4', color: (conv.unreadCount || 0) > 0 ? colors.textMain : colors.textMuted, fontWeight: (conv.unreadCount || 0) > 0 ? '700' : '400' }}>
                                            {conv.lastMessage || getLocalized('messaging.noMessage', 'Mesaj bulunmuyor', 'No messages yet')}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center small" style={{ color: colors.textMuted }}>
                                {searchQuery ? getLocalized('messaging.noSearchResults', 'Arama sonucu bulunamadı.', 'No search results found.') : getLocalized('messaging.noConversations', 'Henüz bir konuşma bulunmuyor.', 'No conversations yet.')}
                            </div>
                        )}
                    </SimplebarReactClient>
                </div>
            </div>

            {/* The Bar (Header - visible when closed) */}
            {!isExpanded && (
                <div
                    onClick={() => setIsExpanded(true)}
                    className="d-flex align-items-center justify-content-between px-3"
                    style={{
                        height: '48px',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backgroundColor: colors.header,
                        color: colors.textMain,
                        borderStyle: 'solid',
                        borderColor: colors.border,
                        borderWidth: '1px 1px 0 1px',
                        boxShadow: colors.shadow
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.itemHover;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = colors.header;
                    }}
                >
                    <div className="d-flex align-items-center">
                        <div className="position-relative me-2 d-flex align-items-center">
                            <Image
                                src={getDisplayAvatar(currentUserPhoto)}
                                alt="User"
                                width={32}
                                height={32}
                                className="rounded-circle"
                                style={{ border: '1px solid rgba(255,255,255,0.2)', objectFit: 'cover' }}
                                key={currentUserPhoto || 'default'}
                            />
                            <div
                                className="position-absolute bottom-0 end-0 bg-success rounded-circle"
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    border: `2px solid ${colors.header}`
                                }}
                            />
                        </div>
                        <span className="fw-bold ms-1" style={{ fontSize: '0.85rem' }}>
                            {messagingTitle}
                        </span>
                    </div>

                    <div className={clsx("d-flex align-items-center gap-3", iconClass)}>
                        <BsPencilSquare size={16} className="hover-active" title={getLocalized('messaging.newMessage', 'Yeni Mesaj', 'New Message')} onClick={handleNewMessageClick} />
                        <BsChevronUp size={18} className="hover-active" />
                    </div>
                </div>
            )}

            {/* Active Chat Windows (Tabs) */}
            {activeChats.map((chat, index) => (
                <div
                    key={chat.user.id}
                    className="position-absolute bottom-0 shadow-lg overflow-hidden d-flex flex-column"
                    style={{
                        right: `calc(100% + ${(index * 432) + (isNewMessageOpen ? 432 : 12)}px)`,
                        width: '420px',
                        height: chat.isExpanded ? '750px' : '48px',
                        maxHeight: 'calc(100vh - 60px)',
                        backgroundColor: colors.bg,
                        border: `1px solid ${colors.border}`,
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                        zIndex: 1060 - index,
                        boxShadow: colors.shadow,
                        transition: 'all 0.3s ease'
                    }}
                >
                    {/* Window Header */}
                    <div
                        onClick={() => toggleChatWindow(chat.user.id)}
                        className="d-flex align-items-center justify-content-between px-3"
                        style={{
                            height: '48px',
                            backgroundColor: colors.header,
                            color: colors.textMain,
                            borderBottom: chat.isExpanded ? `1px solid ${colors.border}` : 'none',
                            flexShrink: 0,
                            cursor: 'pointer'
                        }}
                    >
                        <div className="d-flex align-items-center overflow-hidden">
                            <div className="position-relative me-2 flex-shrink-0">
                                <Image
                                    src={getDisplayAvatar(chat.user.photoUrl)}
                                    alt={chat.user.firstName}
                                    width={32}
                                    height={32}
                                    className="rounded-circle"
                                    style={{ objectFit: 'cover' }}
                                />
                                <div className="position-absolute bottom-0 end-0 bg-success rounded-circle" style={{ width: '10px', height: '10px', border: `2px solid ${colors.header}` }} />
                            </div>
                            <span className="fw-bold text-truncate" style={{ fontSize: '0.85rem' }}>
                                {chat.user.firstName} {chat.user.lastName}
                            </span>
                            {(chat.unreadCount || 0) > 0 && (
                                <span className="ms-2 badge rounded-pill bg-danger" style={{ fontSize: '0.65rem', padding: '0.3em 0.6em' }}>
                                    {chat.unreadCount}
                                </span>
                            )}
                        </div>
                        <div className={clsx("d-flex align-items-center gap-2", iconClass)}>
                            {chat.isExpanded ? <BsChevronDown size={18} /> : <BsChevronUp size={18} />}
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closeChatWindow(chat.user.id);
                                }}
                                className="hover-active p-1 d-flex align-items-center"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </div>
                        </div>
                    </div>

                    {chat.isExpanded && (
                        <>
                            {/* Chat Content */}
                            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: colors.bg }}>
                                <div style={{ flex: 1, minHeight: 0 }}>
                                    <SimplebarReactClient style={{ height: '100%' }}>
                                        <div className="p-3">
                                            {/* User Info Card */}
                                            <div className="text-center mb-4">
                                                <Image
                                                    src={getDisplayAvatar(chat.user.photoUrl)}
                                                    alt={chat.user.firstName}
                                                    width={80}
                                                    height={80}
                                                    className="rounded-circle mb-2"
                                                    style={{ objectFit: 'cover' }}
                                                />
                                                <h5 className="mb-0 fw-bold" style={{ color: colors.textMain }}>{chat.user.firstName} {chat.user.lastName}</h5>
                                                <p className="text-muted small">{chat.user.tagline || chat.user.role || getLocalized('messaging.defaultRole', 'Yazılım Geliştirici', 'Software Developer')}</p>
                                            </div>

                                            {/* Messages */}
                                            {chat.messages.map((msg) => (
                                                <div key={msg.id} className={clsx("d-flex mb-3", msg.isMe ? "flex-row-reverse" : "flex-row")}>
                                                    <Image
                                                        src={getDisplayAvatar(msg.isMe ? currentUserPhoto : chat.user.photoUrl)}
                                                        alt={msg.isMe ? getLocalized('messaging.me', 'Ben', 'Me') : chat.user.firstName}
                                                        width={32}
                                                        height={32}
                                                        className={clsx("rounded-circle flex-shrink-0", msg.isMe ? "ms-2" : "me-2")}
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                    <div className={clsx("overflow-hidden d-flex flex-column", msg.isMe ? "align-items-end" : "align-items-start")}>
                                                        <div className={clsx("d-flex align-items-center mb-1", msg.isMe ? "flex-row-reverse" : "flex-row")}>
                                                            <span className={clsx("fw-bold text-truncate", msg.isMe ? "ms-2" : "me-2")} style={{ color: colors.textMain, fontSize: '0.85rem' }}>
                                                                {msg.isMe ? getLocalized('messaging.you', 'Siz', 'You') : chat.user.firstName}
                                                            </span>
                                                            <span className="text-muted flex-shrink-0" style={{ fontSize: '0.7rem' }}>• {msg.time}</span>
                                                        </div>
                                                        <div
                                                            style={{
                                                                color: colors.textMain,
                                                                fontSize: '0.9rem',
                                                                whiteSpace: 'pre-wrap',
                                                                wordBreak: 'break-word',
                                                                backgroundColor: msg.isMe ? (isDark ? '#057642' : '#e7f3ed') : (isDark ? '#38434f' : '#f3f6f8'),
                                                                padding: '8px 12px',
                                                                borderRadius: '12px',
                                                                borderTopRightRadius: msg.isMe ? '2px' : '12px',
                                                                borderTopLeftRadius: msg.isMe ? '12px' : '2px'
                                                            }}
                                                        >
                                                            {msg.text}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </SimplebarReactClient>
                                </div>

                                {/* Input Area */}
                                <div className="p-3" style={{ borderTop: `1px solid ${colors.border}`, backgroundColor: isDark ? '#1d2226' : '#ffffff' }}>
                                    <div
                                        className="rounded p-2 mb-2"
                                        style={{
                                            backgroundColor: colors.searchBg,
                                            minHeight: '100px',
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}
                                    >
                                        <textarea
                                            placeholder={getLocalized('messaging.writeMessage', 'Bir mesaj yazın...', 'Write a message...')}
                                            className="w-100 border-0 bg-transparent shadow-none"
                                            style={{
                                                color: colors.textMain,
                                                fontSize: '0.9rem',
                                                resize: 'none',
                                                outline: 'none',
                                                flex: 1
                                            }}
                                            value={chat.input}
                                            onChange={(e) => updateChatInput(chat.user.id, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage(chat.user.id);
                                                }
                                            }}
                                        />
                                        <div className="ms-auto">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: 'rotate(180deg)', cursor: 'pointer', color: colors.textMuted }}><path d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-end">
                                        <button
                                            onClick={() => handleSendMessage(chat.user.id)}
                                            className="btn btn-sm px-3 fw-bold shadow-none"
                                            style={{
                                                backgroundColor: chat.input?.trim() ? '#0a66c2' : 'transparent',
                                                color: chat.input?.trim() ? '#ffffff' : colors.textMuted,
                                                borderRadius: '16px',
                                                pointerEvents: chat.input?.trim() ? 'auto' : 'none',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {getLocalized('messaging.send', 'Gönder', 'Send')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ))}

            {/* LinkedIn Style New Message Search Popup */}
            {isNewMessageOpen && (
                <div
                    className="position-absolute bottom-0 shadow-lg overflow-hidden d-flex flex-column"
                    style={{
                        right: '100%',
                        marginRight: '12px',
                        width: '420px',
                        height: '750px',
                        maxHeight: 'calc(100vh - 60px)',
                        backgroundColor: colors.bg,
                        border: `1px solid ${colors.border}`,
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                        zIndex: 1060,
                        boxShadow: colors.shadow
                    }}
                >
                    {/* Popup Header */}
                    <div
                        className="d-flex align-items-center justify-content-between px-3"
                        style={{
                            height: '48px',
                            backgroundColor: colors.header,
                            color: colors.textMain,
                            borderBottom: `1px solid ${colors.border}`,
                            flexShrink: 0
                        }}
                    >
                        <span className="fw-bold" style={{ fontSize: '0.9rem' }}>{getLocalized('messaging.newMessage', 'Yeni Mesaj', 'New Message')}</span>
                        <div className={clsx("d-flex align-items-center gap-3", iconClass)}>
                            <div onClick={() => setIsNewMessageOpen(false)} className="hover-active d-flex align-items-center" style={{ cursor: 'pointer' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Search Field */}
                    <div className="px-3 py-2 d-flex flex-wrap align-items-center gap-2" style={{ borderBottom: `1px solid ${colors.border}`, minHeight: '52px', backgroundColor: colors.bg }}>
                        <input
                            type="text"
                            autoFocus
                            placeholder={getLocalized('messaging.newMessageSearchPlaceholder', 'Bir veya birden fazla ad yazın', 'Type one or more names')}
                            className="flex-grow-1 border-0 bg-transparent shadow-none"
                            style={{ color: colors.textMain, fontSize: '0.95rem', height: '40px', outline: 'none' }}
                            value={newMessageQuery}
                            onChange={(e) => setNewMessageQuery(e.target.value)}
                        />
                    </div>

                    {/* Suggestions list */}
                    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: colors.bg }}>
                        <SimplebarReactClient style={{ height: '100%' }}>
                            <div className="px-3 py-2 text-muted fw-bold" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                {getLocalized('messaging.suggested', 'Önerilen', 'Suggested')}
                            </div>
                            {suggestedUsers.length > 0 ? (
                                suggestedUsers.map((u) => (
                                    <div
                                        key={u.id}
                                        onClick={() => handleSelectUser(u)}
                                        className="d-flex align-items-center p-3 hover-bg"
                                        style={{ cursor: 'pointer', borderBottom: `1px solid ${colors.border}` }}
                                    >
                                        <Image
                                            src={getDisplayAvatar(u.photoUrl)}
                                            alt={u.firstName}
                                            width={48}
                                            height={48}
                                            className="rounded-circle me-3"
                                            style={{ objectFit: 'cover' }}
                                        />
                                        <div className="flex-grow-1 overflow-hidden">
                                            <div className="fw-bold text-truncate" style={{ color: colors.textMain }}>
                                                {u.firstName} {u.lastName}
                                            </div>
                                            <div className="text-muted text-truncate small">
                                                {u.tagline || u.role || getLocalized('messaging.userFallback', 'Kullanıcı', 'User')}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center small text-muted">{getLocalized('messaging.noSearchResults', 'Arama sonucu bulunamadı.', 'No search results found.')}</div>
                            )}
                        </SimplebarReactClient>
                    </div>
                </div>
            )}

            <style jsx>{`
                .hover-active {
                    transition: color 0.1s ease;
                }
                .hover-active:hover {
                    color: ${colors.textMain} !important;
                }
                .hover-bg:hover {
                    background-color: ${colors.itemHover} !important;
                }
                :global(.simplebar-content-wrapper) {
                    background-color: ${colors.bg} !important;
                }
                input::placeholder {
                    color: ${colors.textMuted} !important;
                }
            `}</style>
        </div>
    );
};

export default MessagingBar;
