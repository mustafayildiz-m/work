'use client';

import Link from 'next/link';
import { Card, CardBody, CardHeader, Button } from 'react-bootstrap';
import { BsPersonPlusFill } from 'react-icons/bs';
import { useEffect, useRef, useState, useMemo } from 'react';
import { getImageUrl } from '@/utils/image';
import { useWebSocketChatContext } from '@/context/useWebSocketChatContext';

const FollowRequestsDropdown = () => {
    const { followRequests, setFollowRequests } = useWebSocketChatContext();
    const [localRequests, setLocalRequests] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Combine local (fetched) and real-time (socket) requests
    const pendingRequests = useMemo(() => {
        const combined = [...followRequests, ...localRequests];
        // Remove duplicates by ID (backend uses 'id', local might use idx or id)
        const unique = combined.filter((req, index, self) =>
            req && req.id && index === self.findIndex((r) => r && r.id === req.id)
        );

        // Robust sort by date
        return unique.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
            const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
            return dateB - dateA;
        });
    }, [followRequests, localRequests]);

    useEffect(() => {
        const fetchPendingRequests = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-follow/requests`, {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setLocalRequests(data || []);
                }
            } catch (error) {
                console.error('Error fetching pending requests:', error);
            }
        };
        fetchPendingRequests();
    }, []);

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

    const handleAcceptRequest = async (e, followerId) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            const requestBody = { follower_id: followerId };
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-follow/accept-request`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            if (response.ok) {
                setLocalRequests(prev => prev.filter(req => req.followerId !== followerId));
                setFollowRequests(prev => prev.filter(req => req.followerId !== followerId));
            }
        } catch (error) {
            console.error('Error accepting request:', error);
        }
    };

    const handleRejectRequest = async (e, followerId) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            const requestBody = { follower_id: followerId };
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-follow/reject-request`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            if (response.ok) {
                setLocalRequests(prev => prev.filter(req => req.followerId !== followerId));
                setFollowRequests(prev => prev.filter(req => req.followerId !== followerId));
            }
        } catch (error) {
            console.error('Error rejecting request:', error);
        }
    };

    return (
        <li className="nav-item ms-2" ref={containerRef} style={{ position: 'relative' }}>
            <button
                type="button"
                className="nav-link bg-light icon-md btn btn-light p-0 position-relative"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-label="Takip istekleri"
            >
                {pendingRequests.length > 0 && (
                    <span className="badge badge-center rounded-pill bg-danger position-absolute top-0 start-100 translate-middle" style={{ width: '18px', height: '18px', fontSize: '0.65rem' }}>
                        {pendingRequests.length > 9 ? '9+' : pendingRequests.length}
                    </span>
                )}
                <BsPersonPlusFill size={15} />
            </button>

            <div
                role="menu"
                className="p-0 shadow-lg border-0 bg-white rounded"
                style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: '360px',
                    zIndex: 1050,
                    display: isOpen ? 'block' : 'none'
                }}
            >
                <Card>
                    <CardHeader className="d-flex justify-content-between align-items-center">
                        <h6 className="m-0">Takip İstekleri {pendingRequests.length > 0 && <span className="badge bg-danger ms-1">{pendingRequests.length}</span>}</h6>
                    </CardHeader>
                    <CardBody className="p-0">
                        {pendingRequests.length > 0 ? (
                            <ul className="list-group list-group-flush list-unstyled p-2 mb-0" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                {pendingRequests.map((request, idx) => {
                                    const requestUser = request.follower;
                                    if (!requestUser) return null;

                                    return (
                                        <li key={idx}>
                                            <div className="rounded d-sm-flex border-0 mb-1 p-2 position-relative align-items-center hover-bg-light transition-all">
                                                <div className="avatar text-center me-2" style={{ width: '45px', height: '45px' }}>
                                                    {requestUser.photoUrl ? (
                                                        <img
                                                            className="avatar-img rounded-circle"
                                                            src={getImageUrl(requestUser.photoUrl)}
                                                            alt={requestUser.firstName}
                                                            style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                                                            onError={(e) => { e.target.src = '/profile/profile.png'; }}
                                                        />
                                                    ) : (
                                                        <div className="avatar-img rounded-circle bg-primary">
                                                            <span className="text-white position-absolute top-50 start-50 translate-middle fw-bold">
                                                                {requestUser.firstName?.charAt(0)}{requestUser.lastName?.charAt(0)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mx-sm-2 my-2 my-sm-0 flex-grow-1">
                                                    <Link href={`/profile/user/${requestUser.id}`} className="text-decoration-none text-body">
                                                        <p className="mb-0 fw-bold small text-truncate" style={{ maxWidth: '140px' }}>{requestUser.firstName} {requestUser.lastName}</p>
                                                    </Link>
                                                    <p className="text-muted mb-0" style={{ fontSize: '0.70rem' }}>Sizinle bağlantı kurmak istiyor</p>
                                                    <div className="d-flex mt-2 gap-2">
                                                        <Button variant="primary" size="sm" onClick={(e) => handleAcceptRequest(e, request.followerId)} className="py-1 px-3 flex-fill fw-bold" style={{ fontSize: '0.80rem', borderRadius: '6px' }}>
                                                            Kabul Et
                                                        </Button>
                                                        <Button variant="danger-soft" size="sm" onClick={(e) => handleRejectRequest(e, request.followerId)} className="py-1 px-3 flex-fill fw-bold" style={{ fontSize: '0.80rem', borderRadius: '6px' }}>
                                                            Sil
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className="p-4 text-center text-muted">
                                <BsPersonPlusFill size={24} className="mb-2 opacity-50" />
                                <p className="mb-0 small">Bekleyen takip isteğiniz bulunmuyor.</p>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </li>
    );
};

export default FollowRequestsDropdown;
