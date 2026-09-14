import { ConfigService } from '@nestjs/config';

const DEV_FALLBACK_SECRET = 'dev-only-insecure-secret';

/**
 * JWT secret'ı tek bir yerden okur. Production'da eksikse uygulama ayağa
 * kalkmaz; geliştirme ortamında uyarı verip güvensiz bir fallback kullanır.
 */
export function getJwtSecret(config: ConfigService): string {
  const secret = config.get<string>('JWT_SECRET');
  if (secret && secret.trim().length > 0) return secret;

  if ((config.get<string>('NODE_ENV') || process.env.NODE_ENV) === 'production') {
    throw new Error('JWT_SECRET tanımlı değil. Production ortamında zorunludur.');
  }

  console.warn('⚠️  JWT_SECRET tanımlı değil, geliştirme fallback secret kullanılıyor.');
  return DEV_FALLBACK_SECRET;
}
