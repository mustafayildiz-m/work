import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const options = {
  debug: process.env.NODE_ENV === 'development',
  providers: [
    ...(googleClientId && googleClientSecret
      ? [
        GoogleProvider({
          clientId: googleClientId,
          clientSecret: googleClientSecret,
          authorization: {
            params: {
              prompt: "consent",
              access_type: "offline",
              response_type: "code"
            }
          }
        }),
      ]
      : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email:',
          type: 'text',
          placeholder: 'Enter your username'
        },
        password: {
          label: 'Password',
          type: 'password'
        }
      },
      async authorize(credentials, req) {
        try {
          // Server-side'da Docker network içinden backend'e erişim için
          // Docker içindeyse 'backend' hostname'ini, değilse NEXT_PUBLIC_API_URL'i kullan
          const apiUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
          const response = await fetch(`${apiUrl}/auth/callback/credentials`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password
            })
          });

          const data = await response.json();

          if (response.ok && data.ok && data.user) {
            // API'den dönen kullanıcı bilgilerini NextAuth formatına çevir
            return {
              id: data.user.id.toString(),
              email: data.user.email,
              username: data.user.username,
              firstName: data.user.firstName,
              lastName: data.user.lastName,
              role: data.user.role,
              photoUrl: data.user.photoUrl,
              access_token: data.access_token
            };
          }

          // Giriş başarısız - Backend'den gelen hata mesajını al
          const errorMessage = data.message || 'auth.invalidCredentials';
          console.error('Authentication failed:', errorMessage);

          // Error message'ı i18n key olarak döndür
          if (errorMessage.includes('devre dışı') || errorMessage.includes('disabled')) {
            throw new Error('auth.accountDisabled');
          } else if (errorMessage.includes('Geçersiz') || errorMessage.includes('Invalid')) {
            throw new Error('auth.invalidCredentials');
          }
          throw new Error(errorMessage);
        } catch (error) {
          console.error('Authentication error:', error);
          // Backend'den gelen hata mesajını kullan veya fallback
          const errorMsg = error.message || 'auth.invalidCredentials';
          throw new Error(errorMsg);
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET || 'kvwLrfri/MBznUCofIoRH9+NvGu6GqvVdqO3mor1GuA=',
  pages: {
    signIn: '/auth-advance/sign-in'
  },
  // Trust proxy for production (HTTPS handled by Nginx)
  trustHost: true,
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },
    async jwt({ token, user, account }) {
      // Debug log for production (check with docker logs)
      if (account?.provider === 'google' && typeof window === 'undefined') {
        console.log(`Google login attempt for email: ${token.email}`);
      }

      // Google OAuth login: exchange Google id_token for our backend JWT
      if (account?.provider === 'google') {
        try {
          const apiUrl =
            process.env.BACKEND_API_URL ||
            process.env.NEXT_PUBLIC_API_URL ||
            'http://localhost:3000';

          const response = await fetch(`${apiUrl}/auth/callback/google`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              idToken: account?.id_token,
            }),
          });

          const data = await response.json();

          if (response.ok && data?.access_token && data?.user) {
            token.user = {
              ...data.user,
              id: data.user.id?.toString?.() ?? data.user.id,
              access_token: data.access_token,
            };
            token.access_token = data.access_token;
            delete token.error;
            if (typeof window === 'undefined') console.log(`Google login SUCCESS for email: ${token.email}`);
          } else {
            token.error = data?.message || 'Google ile giriş başarısız';
            if (typeof window === 'undefined') console.log(`Google login FAILED for email: ${token.email}. Error: ${token.error}`);
          }
        } catch (err) {
          token.error = 'Google ile giriş başarısız';
          if (typeof window === 'undefined') console.log(`Google login ERROR for email: ${token.email}. Error: ${err.message}`);
        }

        return token;
      }

      // JWT token'a kullanıcı bilgilerini ekle
      if (user) {
        token.user = user;

        // Eğer access_token varsa, bunu da token'a ekle
        if (user.access_token) {
          token.access_token = user.access_token;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Session'a kullanıcı bilgilerini ekle
      if (token.user) {
        session.user = {
          id: token.user.id,
          email: token.user.email,
          name: `${token.user.firstName || ''} ${token.user.lastName || ''}`.trim() || token.user.username,
          username: token.user.username,
          firstName: token.user.firstName,
          lastName: token.user.lastName,
          role: token.user.role,
          photoUrl: token.user.photoUrl,
          bio: token.user.bio,
          booksCount: token.user.booksCount,
          articlesCount: token.user.articlesCount,
          visitsCount: token.user.visitsCount
        };

        // Access token'ı session'a da ekle (client-side'da kullanmak için)
        if (token.access_token) {
          session.access_token = token.access_token;
        }
      }

      if (token.error) {
        session.error = token.error;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 saat (saniye cinsinden)
    updateAge: 60 * 60, // 1 saat (saniye cinsinden)
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 saat (saniye cinsinden)
  }
};
