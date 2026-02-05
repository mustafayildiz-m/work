import { Cache } from 'cache-manager';
export declare class CacheService {
    private cacheManager;
    private readonly logger;
    constructor(cacheManager: Cache);
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    reset(): Promise<void>;
    delPattern(pattern: string): Promise<void>;
    getStats(): Promise<any>;
}
