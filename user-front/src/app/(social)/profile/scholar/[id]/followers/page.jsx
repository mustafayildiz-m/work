'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FaSearch, FaUserFriends, FaUser } from 'react-icons/fa';

export default function ScholarFollowersPage() {
  const params = useParams();
  const [followersData, setFollowersData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ followersCount: 0 });

  useEffect(() => {
    const fetchFollowersData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const scholarId = params?.id;
        if (!token || !scholarId) { setLoading(false); return; }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scholars/${scholarId}/followers?limit=100`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const items = (data.items || data.users || []).map(u => ({
            id: u.id,
            name: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || '',
            username: u.username,
            photoUrl: u.photoUrl
          }));
          setFollowersData(items);
          setFilteredData(items);
        }

        const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scholars/${scholarId}/follow-stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          setStats({ followersCount: statsJson.followersCount || 0 });
        }
      } catch (e) {
        // console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowersData();
  }, [params?.id]);

  useEffect(() => {
    let filtered = followersData;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(i => (
        (i.name || '').toLowerCase().includes(q) ||
        (i.username || '').toLowerCase().includes(q)
      ));
    }
    setFilteredData(filtered);
  }, [searchTerm, followersData]);

  const getImageUrl = (photoUrl) => {
    if (!photoUrl) return '/profile/profile.png';
    if (photoUrl.startsWith('/uploads/')) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      return `${apiBaseUrl}${photoUrl}`;
    }
    return photoUrl;
  };

  if (loading) {
    return (
      <div className="card following-card">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Takipçiler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card following-card">
      <div className="card-header following-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0"><FaUserFriends className="me-2" />Takipçiler</h5>
            <p className="text-muted mb-0 mt-2">{filteredData.length} kişi bulundu</p>
          </div>
          <div className="stats-badges">
            <span className="badge bg-primary">
              <FaUser className="me-1" /> {stats.followersCount} Takipçi
            </span>
          </div>
        </div>
      </div>

      <div className="search-filter-section">
        <div className="row mb-4">
          <div className="col-md-8">
            <div className="input-group search-input-group">
              <span className="input-group-text"><FaSearch /></span>
              <input type="text" className="form-control" placeholder="Ad ile ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="following-grid">
        {filteredData.length > 0 ? (
          <div className="row g-3">
            {filteredData.map((item) => (
              <div key={`user-${item.id}`} className="col-lg-4 col-md-6">
                <div className="card following-item-card">
                  <div className="card-body d-flex flex-column text-center">
                    <div className="item-avatar">
                      <img src={getImageUrl(item.photoUrl)} alt={item.name || item.username} width={80} height={80} className="rounded-circle" onError={(e) => { e.target.src = '/profile/profile.png'; }} />
                      <span className="badge item-badge bg-primary">Kullanıcı</span>
                    </div>
                    <h6 className="item-name">
                      {item.id ? (
                        <Link href={`/profile/${item.type || 'user'}/${item.id}`} className="text-decoration-none">{item.name || item.username}</Link>
                      ) : (
                        <span className="text-decoration-none">{item.name || item.username}</span>
                      )}
                    </h6>
                    {item.username && (<p className="item-username">@{item.username}</p>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <div className="empty-state">
              <FaUserFriends className="empty-icon" />
              <h6 className="mt-3">Takipçi bulunamadı</h6>
              <p className="text-muted">Arama kriterlerinizi değiştirmeyi deneyin.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


