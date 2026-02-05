// API URL yapılandırması
// 1. VITE_API_URL tanımlıysa onu kullan
// 2. Localhost'ta ve VITE_API_URL yoksa localhost:3000 kullan
// 3. Production'da ve VITE_API_URL yoksa, nginx proxy kullanılıyorsa boş string (relative path)
//    veya window.location.origin kullan
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // Environment variable tanımlıysa kullan
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim();
  }
  
  // Localhost'ta çalışıyorsak
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname === '';
  
  if (isLocalhost) {
    return 'http://localhost:3000';
  }
  
  // Production'da: Nginx proxy kullanılıyorsa boş string (relative path)
  // Bu durumda nginx API isteklerini backend'e yönlendirecek
  // Eğer backend ayrı bir domain'deyse, window.location.origin kullanılabilir
  // Ama nginx config'te API proxy varsa, boş string yeterli
  return '';
};

const API_URL = getApiUrl();

/**
 * Supabase adapter that maintains the same interface as the existing auth flow
 * but uses Supabase under the hood.
 */
export const SupabaseAdapter = {
  /**
   * Login with email and password
   */
  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      // Response'un içeriğini kontrol et
      const contentType = response.headers.get('content-type');
      let data = {};
      
      // Response body'yi oku
      const text = await response.text();
      
      if (text) {
        // Content-type JSON ise veya text boş değilse parse etmeyi dene
        if (contentType && contentType.includes('application/json')) {
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            console.error('JSON parse error:', parseError, 'Response text:', text);
            throw new Error('Sunucudan geçersiz yanıt alındı.');
          }
        } else if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
          // Content-type olmasa bile JSON gibi görünüyorsa parse et
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            throw new Error('Sunucudan geçersiz yanıt alındı.');
          }
        }
      }
      
      if (!response.ok) {
        // Backend'den gelen hata mesajını kullan
        const errorMessage = data.message || data.error || `Giriş başarısız (${response.status})`;
        console.error('Login error:', errorMessage, data);
        throw new Error(errorMessage);
      }
      
      // Başarılı yanıt için data kontrolü
      if (!data.access_token) {
        throw new Error('Sunucudan geçersiz yanıt alındı. Token bulunamadı.');
      }
      
      // Token ve kullanıcıyı döndür
      return {
        access_token: data.access_token,
        user: data.user
      };
    } catch (error) {
      // Eğer fetch hatası varsa (network error vs)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      }
      // JSON parse hatası ise
      if (error.message.includes('JSON')) {
        throw new Error('Sunucudan geçersiz yanıt alındı. Lütfen tekrar deneyin.');
      }
      throw error;
    }
  },

  /**
   * Get current user from the session
   */
  async getCurrentUser(token) {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Response'un içeriğini kontrol et
      const contentType = response.headers.get('content-type');
      let data = {};
      
      // Response body'yi oku
      const text = await response.text();
      
      if (text) {
        // Content-type JSON ise veya text JSON gibi görünüyorsa parse et
        if (contentType && contentType.includes('application/json')) {
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            console.error('JSON parse error:', parseError, 'Response text:', text);
            throw new Error('Sunucudan geçersiz yanıt alındı.');
          }
        } else if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
          // Content-type olmasa bile JSON gibi görünüyorsa parse et
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            throw new Error('Sunucudan geçersiz yanıt alındı.');
          }
        }
      }
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Kullanıcı bilgisi alınamadı');
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout the current user
   */
  logout() {
    localStorage.removeItem('access_token');
  },
};
