"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
let CacheService = CacheService_1 = class CacheService {
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
        this.logger = new common_1.Logger(CacheService_1.name);
    }
    async get(key) {
        try {
            const value = await this.cacheManager.get(key);
            if (value !== undefined) {
                this.logger.debug(`Cache hit: ${key}`);
                return value;
            }
            else {
                this.logger.debug(`Cache miss: ${key}`);
                return null;
            }
        }
        catch (error) {
            this.logger.error(`Cache get error for key ${key}:`, error.message);
            return null;
        }
    }
    async set(key, value, ttl) {
        try {
            const ttlMs = ttl ? ttl * 1000 : undefined;
            await this.cacheManager.set(key, value, ttlMs);
            this.logger.debug(`Cache set: ${key} with TTL: ${ttl || 'default'}s`);
        }
        catch (error) {
            this.logger.error(`Cache set error for key ${key}:`, error.message);
        }
    }
    async del(key) {
        try {
            await this.cacheManager.del(key);
            this.logger.debug(`Cache delete: ${key}`);
        }
        catch (error) {
            this.logger.error(`Cache delete error for key ${key}:`, error.message);
        }
    }
    async reset() {
        try {
            await this.cacheManager.clear();
            this.logger.debug('Cache reset completed');
        }
        catch (error) {
            this.logger.error('Cache reset error:', error.message);
        }
    }
    async delPattern(pattern) {
        try {
            this.logger.debug(`Pattern delete requested for pattern: ${pattern}`);
            await this.reset();
        }
        catch (error) {
            this.logger.error(`Pattern delete error for pattern ${pattern}:`, error.message);
        }
    }
    async getStats() {
        try {
            return {
                message: 'Cache stats not available in memory store',
                store: 'memory',
            };
        }
        catch (error) {
            this.logger.error('Cache stats error:', error.message);
            return { error: error.message };
        }
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = CacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object])
], CacheService);
//# sourceMappingURL=cache.service.js.map