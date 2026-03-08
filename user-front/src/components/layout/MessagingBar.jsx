'use client';

import { useAuthContext } from '@/context/useAuthContext';
import { useLayoutContext } from '@/context/useLayoutContext';
import { useLanguage } from '@/context/useLanguageContext';
import { useWebSocketChatContext } from '@/context/useWebSocketChatContext';
import Image from 'next/image';
import { BsPencilSquare, BsChevronUp, BsChevronDown, BsSearch, BsThreeDots } from 'react-icons/bs';
import placeholderImg from '@/assets/images/avatar/placeholder.jpg';
import { useSession } from 'next-auth/react';
import { useState, useMemo, useEffect } from 'react';
import clsx from 'clsx';
import SimplebarReactClient from '@/components/wrappers/SimplebarReactClient';

const MessagingBar = () => {
    const { userInfo } = useAuthContext();
    const { conversationPanel } = useLayoutContext();
    const { locale, t } = useLanguage();
    const { status, data: session } = useSession();
    const { conversations, selectConversation } = useWebSocketChatContext();

    const [isExpanded, setIsExpanded] = useState(false);
    const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [newMessageQuery, setNewMessageQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [connections, setConnections] = useState([]);

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

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const now = new Date();
        if (d.toDateString() === now.toDateString()) {
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
    };

    const handleConversationClick = async (conv) => {
        await selectConversation(conv);
        if (conversationPanel?.toggle) {
            conversationPanel.toggle();
        }
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
    const messagingTitle = t('messaging.title') === 'messaging.title' ? (locale === 'tr' ? 'Mesajlaşma' : 'Messaging') : t('messaging.title');
    const currentUserPhoto = userProfile?.photoUrl || userInfo?.photoUrl || session?.user?.image;

    const handleNewMessageClick = (e) => {
        e.stopPropagation();
        setSelectedUser(null);
        setNewMessageQuery('');
        setIsNewMessageOpen(true);
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setNewMessageQuery('');
        setChatMessages([]);
    };

    const handleSendMessage = () => {
        if (!chatInput.trim() || !selectedUser) return;

        const newMessage = {
            id: Date.now(),
            senderId: userInfo?.id || session?.user?.id,
            text: chatInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        };

        setChatMessages(prev => [...prev, newMessage]);
        setChatInput('');
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
                    border: `1px solid ${colors.border}`,
                    borderBottom: 'none',
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
                        <BsPencilSquare size={16} className="hover-active" onClick={handleNewMessageClick} title="Yeni Mesaj" />
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
                            placeholder={t('messaging.searchPlaceholder') === 'messaging.searchPlaceholder' ? (locale === 'tr' ? 'Mesajlarda ara' : 'Search messages') : t('messaging.searchPlaceholder')}
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
                                            src={getDisplayAvatar(conv.participantAvatar)}
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
                                                {conv.participantName}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>
                                                {formatDate(conv.lastMessageTime)}
                                            </span>
                                        </div>
                                        <div className="text-truncate" style={{ fontSize: '0.85rem', lineHeight: '1.4', color: (conv.unreadCount || 0) > 0 ? colors.textMain : colors.textMuted, fontWeight: (conv.unreadCount || 0) > 0 ? '700' : '400' }}>
                                            {conv.lastMessage || 'Mesaj bulunmuyor'}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center small" style={{ color: colors.textMuted }}>
                                {searchQuery ? 'Arama sonucu bulunamadı.' : (t('messaging.noConversations') === 'messaging.noConversations' ? 'Henüz bir konuşma bulunmuyor.' : t('messaging.noConversations'))}
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
                        border: `1px solid ${colors.border}`,
                        borderBottom: 'none',
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
                        <BsPencilSquare size={16} className="hover-active" title="Yeni Mesaj" onClick={handleNewMessageClick} />
                        <BsChevronUp size={18} className="hover-active" />
                    </div>
                </div>
            )}

            {/* LinkedIn Style New Message Popup */}
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
                        <span className="fw-bold" style={{ fontSize: '0.9rem' }}>Yeni mesaj</span>
                        <div className={clsx("d-flex align-items-center gap-3", iconClass)}>
                            <BsSearch size={16} className="hover-active" style={{ cursor: 'pointer' }} />
                            <div onClick={() => setIsNewMessageOpen(false)} className="hover-active d-flex align-items-center" style={{ cursor: 'pointer' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Search Field / Selected User Tag */}
                    <div className="px-3 py-2 d-flex flex-wrap align-items-center gap-2" style={{ borderBottom: `1px solid ${colors.border}`, minHeight: '52px', backgroundColor: colors.bg }}>
                        {selectedUser ? (
                            <div
                                className="d-flex align-items-center bg-success bg-opacity-10 px-2 py-1 rounded"
                                style={{ border: '1px solid rgba(var(--bs-success-rgb), 0.3)', cursor: 'default' }}
                            >
                                <span className="fw-bold" style={{ color: colors.textMain, fontSize: '0.85rem' }}>
                                    {selectedUser.firstName} {selectedUser.lastName}
                                </span>
                                <div
                                    onClick={() => setSelectedUser(null)}
                                    className="ms-2 d-flex align-items-center"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                </div>
                            </div>
                        ) : (
                            <input
                                type="text"
                                autoFocus
                                placeholder="Bir veya birden fazla ad yazın"
                                className="flex-grow-1 border-0 bg-transparent shadow-none"
                                style={{ color: colors.textMain, fontSize: '0.95rem', height: '40px', outline: 'none' }}
                                value={newMessageQuery}
                                onChange={(e) => setNewMessageQuery(e.target.value)}
                            />
                        )}
                        {selectedUser && (
                            <div className="ms-auto">
                                <BsSearch size={16} className="text-muted" />
                            </div>
                        )}
                    </div>

                    {/* Content Area: Suggestions or Chat */}
                    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: colors.bg }}>
                        {!selectedUser ? (
                            <SimplebarReactClient style={{ height: '100%' }}>
                                <div className="px-3 py-2 text-muted fw-bold" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                    Önerilen
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
                                                    {u.tagline || u.role || 'Kullanıcı'}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center small text-muted">Arama sonucu bulunamadı.</div>
                                )}
                            </SimplebarReactClient>
                        ) : (
                            <>
                                <SimplebarReactClient style={{ height: '100%' }}>
                                    <div className="p-3">
                                        {/* User Info Card */}
                                        <div className="text-center mb-4">
                                            <Image
                                                src={getDisplayAvatar(selectedUser.photoUrl)}
                                                alt={selectedUser.firstName}
                                                width={80}
                                                height={80}
                                                className="rounded-circle mb-2"
                                                style={{ objectFit: 'cover' }}
                                            />
                                            <h5 className="mb-0 fw-bold" style={{ color: colors.textMain }}>{selectedUser.firstName} {selectedUser.lastName}</h5>
                                            <p className="text-muted small">{selectedUser.tagline || selectedUser.role || 'Yazılım Geliştirici'}</p>
                                        </div>

                                        {/* Date Separator */}
                                        <div className="d-flex align-items-center mb-4">
                                            <div className="flex-grow-1 border-bottom" style={{ borderColor: colors.border }}></div>
                                            <div className="px-3 text-uppercase text-muted fw-bold" style={{ fontSize: '0.7rem' }}>16 ŞUB</div>
                                            <div className="flex-grow-1 border-bottom" style={{ borderColor: colors.border }}></div>
                                        </div>

                                        {/* Messages */}
                                        {chatMessages.map((msg) => (
                                            <div key={msg.id} className="d-flex mb-3">
                                                <Image
                                                    src={getDisplayAvatar(msg.isMe ? currentUserPhoto : selectedUser.photoUrl)}
                                                    alt={msg.isMe ? 'Me' : selectedUser.firstName}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-circle me-2 flex-shrink-0"
                                                    style={{ objectFit: 'cover' }}
                                                />
                                                <div>
                                                    <div className="d-flex align-items-center mb-1">
                                                        <span className="fw-bold me-2" style={{ color: colors.textMain, fontSize: '0.9rem' }}>
                                                            {msg.isMe ? 'Siz' : `${selectedUser.firstName} ${selectedUser.lastName}`}
                                                        </span>
                                                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>• {msg.time}</span>
                                                    </div>
                                                    <div style={{ color: colors.textMain, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                                                        {msg.text}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </SimplebarReactClient>

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
                                            placeholder="Bir mesaj yazın..."
                                            className="w-100 border-0 bg-transparent shadow-none"
                                            style={{
                                                color: colors.textMain,
                                                fontSize: '0.9rem',
                                                resize: 'none',
                                                outline: 'none',
                                                flex: 1
                                            }}
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                        />
                                        <div className="ms-auto">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: 'rotate(180deg)', cursor: 'pointer', color: colors.textMuted }}><path d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-end">
                                        <div className="d-flex align-items-center gap-2">
                                            <button
                                                onClick={handleSendMessage}
                                                className="btn btn-sm px-3 fw-bold shadow-none"
                                                style={{
                                                    backgroundColor: chatInput.trim() ? '#0a66c2' : 'transparent',
                                                    color: chatInput.trim() ? '#ffffff' : colors.textMuted,
                                                    borderRadius: '16px',
                                                    pointerEvents: chatInput.trim() ? 'auto' : 'none',
                                                    border: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Gönder
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
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
