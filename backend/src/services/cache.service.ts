import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Cache'den veri getir
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<T>(key);
      if (value !== undefined) {
        this.logger.debug(`Cache hit: ${key}`);
        return value;
      } else {
        this.logger.debug(`Cache miss: ${key}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error.message);
      return null;
    }
  }

  /**
   * Cache'e veri kaydet
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      // TTL saniye cinsinden, millisecond'a çevir
      const ttlMs = ttl ? ttl * 1000 : undefined;
      await this.cacheManager.set(key, value, ttlMs);
      this.logger.debug(`Cache set: ${key} with TTL: ${ttl || 'default'}s`);
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error.message);
    }
  }

  /**
   * Cache'den veri sil
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache delete: ${key}`);
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}:`, error.message);
    }
  }

  /**
   * Cache'i temizle
   */
  async reset(): Promise<void> {
    try {
      await this.cacheManager.clear();
      this.logger.debug('Cache reset completed');
    } catch (error) {
      this.logger.error('Cache reset error:', error.message);
    }
  }

  /**
   * Cache key pattern'ına göre sil
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      // Basit pattern matching için tüm cache'i temizle
      // Redis store için daha gelişmiş pattern matching eklenebilir
      this.logger.debug(`Pattern delete requested for pattern: ${pattern}`);
      // Şimdilik tüm cache'i temizle
      await this.reset();
    } catch (error) {
      this.logger.error(
        `Pattern delete error for pattern ${pattern}:`,
        error.message,
      );
    }
  }

  /**
   * Cache istatistikleri
   */
  async getStats(): Promise<any> {
    try {
      return {
        message: 'Cache stats not available in memory store',
        store: 'memory',
      };
    } catch (error) {
      this.logger.error('Cache stats error:', error.message);
      return { error: error.message };
    }
  }
}
