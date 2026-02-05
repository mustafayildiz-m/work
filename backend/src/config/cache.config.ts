import { CacheModuleOptions } from '@nestjs/cache-manager';

// Basit in-memory cache konfigürasyonu (Redis gereksiz)
export const cacheConfig: CacheModuleOptions = {
  isGlobal: true,
  ttl: 600000, // 10 dakika (milliseconds)
  max: 10000, // Maximum 10,000 cache item
};
