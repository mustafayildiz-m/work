'use client';

import { useAuthContext } from '@/context/useAuthContext';
import { useLayoutContext } from '@/context/useLayoutContext';
import { useLanguage } from '@/context/useLanguageContext';
import { useWebSocketChatContext } from '@/context/useWebSocketChatContext';
import Image from 'next/image';
import { BsThreeDots, BsPencilSquare, BsChevronUp, BsChevronDown, BsSearch, BsSliders } from 'react-icons/bs';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [userProfile, setUserProfile] = useState(null);

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

        // Handle cases where it might be just the filename
        return `${apiBaseUrl}/uploads/${photoUrl}`;
    };

    const filteredConversations = useMemo(() => {
        return conversations.filter(conv =>
            conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
        ).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
    }, [conversations, searchQuery]);

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

    // Theme-based code color palette
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

    // Determine which photo to use
    const currentUserPhoto = userProfile?.photoUrl || userInfo?.photoUrl || session?.user?.image;

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
                    backgroundColor: colors.bg,
                    display: 'flex',
                    flexDirection: 'column',
                    border: `1px solid ${colors.border}`,
                    borderBottom: 'none',
                    boxShadow: colors.shadow
                }}
            >
                {/* Header (Duplicate of the bar for clicking to close) */}
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
                        <BsThreeDots size={18} className="hover-active" onClick={(e) => e.stopPropagation()} title="Seçenekler" />
                        <BsPencilSquare size={16} className="hover-active" onClick={(e) => e.stopPropagation()} title="Yeni Mesaj" />
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
                        <BsSliders className="position-absolute top-50 end-0 translate-middle-y me-2" size={14} style={{ cursor: 'pointer', color: colors.textMuted }} />
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
                        <BsThreeDots size={18} className="hover-active" title="Seçenekler" onClick={(e) => e.stopPropagation()} />
                        <BsPencilSquare size={16} className="hover-active" title="Yeni Mesaj" onClick={(e) => e.stopPropagation()} />
                        <BsChevronUp size={18} className="hover-active" />
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
        .btn:focus {
            box-shadow: none !important;
        }
        input::placeholder {
            color: ${colors.textMuted} !important;
        }
      `}</style>
        </div>
    );
};

export default MessagingBar;
