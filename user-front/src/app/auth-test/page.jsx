'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getToken, getUserIdFromToken, getUserInfoFromToken } from '@/utils/auth';

export default function AuthTest() {
  const { isAuthenticated, userInfo, login, logout, loading } = useAuth();
  const [credentials, setCredentials] = useState({
    email: 'admin@admin.com',
    password: 'admin123'
  });
  const [loginResult, setLoginResult] = useState(null);

  const handleLogin = async () => {
    const result = await login(credentials);
    setLoginResult(result);
  };

  const checkToken = () => {
    const token = getToken();
    const userId = getUserIdFromToken();
    const user = getUserInfoFromToken();

    setLoginResult({
      success: true,
      token: token?.substring(0, 50) + '...',
      userId,
      user
    });
  };

  return (
    <div className="container mt-5">
      <h1>Authentication Test</h1>

      <div className="row">
        <div className="col-md-6">
          <h3>Login Form</h3>
          <div className="mb-3">
            <label className="form-label">Email:</label>
            <input
              type="email"
              className="form-control"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password:</label>
            <input
              type="password"
              className="form-control"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            />
          </div>
          <button
            className="btn btn-primary me-2"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={checkToken}
          >
            Check Token
          </button>
        </div>

        <div className="col-md-6">
          <h3>Status</h3>
          <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
          <p><strong>User Info:</strong> {JSON.stringify(userInfo, null, 2)}</p>
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>

          {isAuthenticated && (
            <button className="btn btn-danger" onClick={logout}>
              Logout
            </button>
          )}
        </div>
      </div>

      {loginResult && (
        <div className="mt-4">
          <h3>Login Result</h3>
          <pre>{JSON.stringify(loginResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}