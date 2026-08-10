import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'not_published', label: 'Not Published' },
];

const STATUS_COLORS = {
  active: 'success',
  in_progress: 'warning',
  not_published: 'secondary',
};

export default function LanguageDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    q: '',
    sort: 'questionCount',
    order: 'DESC',
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('active');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.set(k, String(v));
      });
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/languages/qa/admin?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (id, newStatus) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/languages/qa/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) fetchData();
  };

  const handleBulkUpdate = async () => {
    if (selectedIds.length === 0) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/languages/qa/bulk-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ids: selectedIds, status: bulkStatus }),
    });
    if (res.ok) {
      setSelectedIds([]);
      fetchData();
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (!data?.items) return;
    const allIds = data.items.map((i) => i.id);
    if (selectedIds.length === allIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allIds);
    }
  };

  return (
    <div className="language-dashboard" data-testid="language-dashboard">
      {/* Stats Banner */}
      {data?.stats && (
        <div className="row mb-4 g-3" data-testid="stats-banner">
          <div className="col-sm-3">
            <div className="card text-center">
              <div className="card-body py-3">
                <h4 className="fw-bold text-success" data-testid="stat-active">
                  {data.stats.active}
                </h4>
                <small>Active</small>
              </div>
            </div>
          </div>
          <div className="col-sm-3">
            <div className="card text-center">
              <div className="card-body py-3">
                <h4 className="fw-bold text-warning" data-testid="stat-in-progress">
                  {data.stats.inProgress}
                </h4>
                <small>In Progress</small>
              </div>
            </div>
          </div>
          <div className="col-sm-3">
            <div className="card text-center">
              <div className="card-body py-3">
                <h4 className="fw-bold text-secondary" data-testid="stat-not-published">
                  {data.stats.notPublished}
                </h4>
                <small>Not Published</small>
              </div>
            </div>
          </div>
          <div className="col-sm-3">
            <div className="card text-center">
              <div className="card-body py-3">
                <h4 className="fw-bold text-primary" data-testid="stat-total-questions">
                  {data.stats.totalQuestions}
                </h4>
                <small>Total Questions</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="row mb-3 g-2" data-testid="filters">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search languages..."
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value, page: 1 }))}
            data-testid="filter-search"
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
            data-testid="filter-status"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="alert alert-info d-flex align-items-center gap-2 mb-3" data-testid="bulk-actions">
          <span>{selectedIds.length} selected</span>
          <select
            className="form-select form-select-sm w-auto"
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            data-testid="bulk-status-select"
          >
            {STATUS_OPTIONS.filter((o) => o.value).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleBulkUpdate}
            data-testid="bulk-apply-btn"
          >
            Apply
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-5" data-testid="loading">
          Loading...
        </div>
      ) : (
        <div className="table-responsive" data-testid="language-table">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      data?.items?.length > 0 &&
                      selectedIds.length === data.items.length
                    }
                    onChange={toggleSelectAll}
                    data-testid="select-all-checkbox"
                  />
                </th>
                <th>Native Name</th>
                <th>English Name</th>
                <th>ISO 639-3</th>
                <th>Direction</th>
                <th>Questions</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.items?.map((lang) => (
                <tr key={lang.id} data-testid={`row-${lang.id}`}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(lang.id)}
                      onChange={() => toggleSelect(lang.id)}
                      data-testid={`checkbox-${lang.id}`}
                    />
                  </td>
                  <td dir={lang.direction === 'rtl' ? 'rtl' : 'ltr'}>
                    <strong>{lang.nativeName}</strong>
                  </td>
                  <td>{lang.englishName}</td>
                  <td>
                    <code>{lang.iso639_3}</code>
                  </td>
                  <td>
                    <span className={`badge bg-${lang.direction === 'rtl' ? 'info' : 'light'} text-dark`}>
                      {lang.direction?.toUpperCase()}
                    </span>
                  </td>
                  <td>{lang.questionCount}</td>
                  <td>
                    <select
                      className={`form-select form-select-sm border-${STATUS_COLORS[lang.status] || 'secondary'}`}
                      value={lang.status}
                      onChange={(e) => handleStatusChange(lang.id, e.target.value)}
                      data-testid={`status-select-${lang.id}`}
                    >
                      {STATUS_OPTIONS.filter((o) => o.value).map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className={`badge bg-${STATUS_COLORS[lang.status]}`}>
                      {lang.status?.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data && data.total > data.limit && (
        <nav data-testid="admin-pagination">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${data.page <= 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                data-testid="prev-page"
              >
                Previous
              </button>
            </li>
            <li className="page-item disabled">
              <span className="page-link" data-testid="page-info">
                Page {data.page} of {Math.ceil(data.total / data.limit)}
              </span>
            </li>
            <li className={`page-item ${data.page >= Math.ceil(data.total / data.limit) ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                data-testid="next-page"
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
