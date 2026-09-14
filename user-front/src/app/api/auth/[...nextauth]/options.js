import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const getApiUrl = () =>
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000';

const SIGN_IN_PAGE = '/auth-advance/sign-in';
const THIRTY_DAYS = 30 * 24 * 60 * 60;

const toBoolean = (value) =>
  value === true || value === 'true' || value === '1' || value === 1;

const mapBackendError = (message) => {
  const text = (message || '').toString();
  if (text.includes('devre dışı') || text.includes('disabled')) return 'auth.accountDisabled';
  if (text.includes('Geçersiz') || text.includes('geçersiz') || text.includes('Invalid') || text.includes('invalid')) {
    return 'auth.invalidCredentials';
  }
  return text || 'auth.invalidCredentials';
};

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
          placeholder: 'Enter your email'
        },
        password: {
          label: 'Password',
          type: 'password'
        },
        rememberMe: {
          label: 'Remember me',
          type: 'text'
        }
      },
      async authorize(credentials) {
        try {
          const response = await fetch(`${getApiUrl()}/auth/callback/credentials`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
              rememberMe: toBoolean(credentials?.rememberMe),
            })
          });

          if (response.status === 429) {
            throw new Error('auth.tooManyAttempts');
          }

          const text = await response.text();
          if (!text) {
            console.error('Empty response from backend during credentials auth');
            throw new Error('auth.invalidCredentials');
          }
          const data = JSON.parse(text);

          if (response.ok && data.ok && data.user) {
            return {
              id: data.user.id.toString(),
              email: data.user.email,
              username: data.user.username,
              firstName: data.user.firstName,
              lastName: data.user.lastName,
              role: data.user.role,
              photoUrl: data.user.photoUrl,
              language: data.user.language,
              access_token: data.access_token
            };
          }

          const errorMessage = data.message || 'auth.invalidCredentials';
          console.error('Authentication failed:', errorMessage);
          throw new Error(mapBackendError(errorMessage));
        } catch (error) {
          console.error('Authentication error:', error);
          throw new Error(error.message || 'auth.invalidCredentials');
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET || 'islamic_windows_jwt_test',
  pages: {
    signIn: SIGN_IN_PAGE
  },
  // Trust proxy for production (HTTPS handled by Nginx)
  trustHost: true,
  callbacks: {
    /**
     * Google girişinde backend'den JWT alınamazsa oturum HİÇ açılmaz;
     * kullanıcı hata koduyla giriş sayfasına geri gönderilir.
     * Başarılıysa backend kullanıcı bilgisi `user` nesnesine eklenir ve
     * aynı nesne jwt() callback'ine ulaşır.
     */
    async signIn({ user, account }) {
      if (account?.provider !== 'google') {
        return true;
      }

      let errorCode = 'GoogleBackendError';
      try {
        const response = await fetch(`${getApiUrl()}/auth/callback/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: account?.id_token }),
        });

        const text = await response.text();
        const data = text ? JSON.parse(text) : null;

        if (response.ok && data?.access_token && data?.user) {
          Object.assign(user, {
            ...data.user,
            id: data.user.id?.toString?.() ?? data.user.id,
            access_token: data.access_token,
          });
          console.log(`Google login SUCCESS for email: ${data.user.email}`);
          return true;
        }

        const message = data?.message || '';
        if (message.includes('devre dışı') || message.includes('disabled')) {
          errorCode = 'AccountDisabled';
        }
        console.error(`Google login FAILED for email: ${user?.email}. Error: ${message}`);
      } catch (err) {
        console.error(`Google login ERROR for email: ${user?.email}. Error: ${err.message}`);
      }

      return `${SIGN_IN_PAGE}?error=${errorCode}`;
    },
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
        if (user.access_token) {
          token.access_token = user.access_token;
        }
      }
      return token;
    },
    async session({ session, token }) {
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
          visitsCount: token.user.visitsCount,
          language: token.user.language
        };

        if (token.access_token) {
          session.access_token = token.access_token;
        }
      }
      return session;
    }
  },
  // Çerez ömrü 30 gün; asıl oturum süresini backend JWT belirler
  // (rememberMe yoksa 1 gün, varsa 30 gün). useAuth backend JWT'si
  // dolunca kullanıcıyı otomatik çıkarır.
  session: {
    strategy: 'jwt',
    maxAge: THIRTY_DAYS,
    updateAge: 60 * 60,
  },
  jwt: {
    maxAge: THIRTY_DAYS,
  }
};
