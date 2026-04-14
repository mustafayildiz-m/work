/**
 * Utility functions for authentication
 */

/**
 * Decode JWT token and extract user ID
 * @returns {number|null} User ID from token or null if invalid
 */
export const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      // console.warn('No token found in localStorage');
      return null;
    }

    // Decode the JWT token (base64 decode the payload part)
    const payload = token.split('.')[1];
    if (!payload) {
      // console.warn('Invalid token format');
      return null;
    }

    try {
      const decodedPayload = JSON.parse(atob(payload));
      return decodedPayload.sub; // 'sub' contains the user ID
    } catch (e) {
      console.error('Error parsing token payload:', e);
      return null;
    }
  } catch (error) {
    // console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Get user info from token
 * @returns {object|null} User info object or null if invalid
 */
export const getUserInfoFromToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const payload = token.split('.')[1];
    if (!payload) return null;

    try {
      const decodedPayload = JSON.parse(atob(payload));
      return {
        id: decodedPayload.sub,
        email: decodedPayload.email,
        username: decodedPayload.username,
        role: decodedPayload.role,
        photoUrl: decodedPayload.photoUrl,
        firstName: decodedPayload.firstName,
        lastName: decodedPayload.lastName
      };
    } catch (e) {
      console.error('Error parsing user info from token:', e);
      return null;
    }
  } catch (error) {
    return null;
  }
};

/**
 * Store JWT token in localStorage
 * @param {string} token - JWT token to store
 * @param {boolean} clearExisting - Whether to clear existing token first
 */
export const storeToken = (token, clearExisting = true) => {
  try {
    if (clearExisting) {
      // Eski token varsa sil
      localStorage.removeItem('token');
    }

    // Yeni token'ı kaydet
    localStorage.setItem('token', token);

    // Custom event dispatch for same-tab localStorage changes
    window.dispatchEvent(new CustomEvent('localStorageChange', {
      detail: { key: 'token', value: token }
    }));

    // Token'ı decode edip bilgileri logla
    const userInfo = getUserInfoFromToken();
    if (userInfo) {
    }
  } catch (error) {
    // console.error('Error storing token:', error);
  }
};

/**
 * Clear token from localStorage
 */
export const clearToken = () => {
  try {
    localStorage.removeItem('token');

    // Custom event dispatch for same-tab localStorage changes
    window.dispatchEvent(new CustomEvent('localStorageChange', {
      detail: { key: 'token', value: null }
    }));
  } catch (error) {
    // console.error('Error clearing token:', error);
  }
};

/**
 * Check if token exists and is valid
 * @returns {boolean} True if token exists and is valid
 */
export const hasValidToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;

    // Token'ın geçerli olup olmadığını kontrol et
    if (isTokenExpired(token)) return false;
    const userInfo = getUserInfoFromToken();
    return !!userInfo;
  } catch (error) {
    // console.error('Error checking token validity:', error);
    return false;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (token) => {
  try {
    if (!token) return true;

    const payload = token.split('.')[1];
    if (!payload) return true;

    try {
      const decodedPayload = JSON.parse(atob(payload));
      const exp = decodedPayload.exp;

      if (!exp) return true;

      // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
      return Date.now() >= exp * 1000;
    } catch (e) {
      console.error('Error checking token expiration:', e);
      return true;
    }
  } catch (error) {
    return true; // If we can't decode, consider it expired
  }
};

/**
 * Get token from localStorage
 * @param {boolean} checkExpiry - Whether to check if token is expired (default: true)
 * @returns {string|null} Token string or null if not found or expired
 */
export const getToken = (checkExpiry = true) => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      return null;
    }

    // Check if token is expired
    if (checkExpiry && isTokenExpired(token)) {
      // Token expired, clear it
      clearToken();
      return null;
    }

    return token;
  } catch (error) {
    return null;
  }
};

let _isHandling401 = false;

/**
 * Handle 401 Unauthorized response — clear token and redirect to login.
 * Prevents multiple concurrent redirects.
 */
export const handle401 = () => {
  if (_isHandling401) return;
  _isHandling401 = true;
  clearToken();
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    const loginUrl = new URL(`${window.location.origin}/auth-advance/sign-in`);
    loginUrl.searchParams.set('redirectTo', pathname);
    loginUrl.searchParams.set('message', 'session_expired');
    window.location.replace(loginUrl.toString());
  }
};

/**
 * Authenticated fetch wrapper.
 * Automatically adds Authorization header and handles 401 by redirecting to login.
 */
export const authFetch = async (url, options = {}) => {
  const token = getToken();

  if (!token) {
    handle401();
    throw new Error('No valid token');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    handle401();
    throw new Error('Unauthorized');
  }

  return response;
};
