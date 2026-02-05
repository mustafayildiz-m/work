"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const bcrypt = __importStar(require("bcrypt"));
const google_auth_library_1 = require("google-auth-library");
const crypto_1 = require("crypto");
let AuthService = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    getGoogleClientId() {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) {
            throw new common_1.UnauthorizedException('Google OAuth yapılandırması eksik (GOOGLE_CLIENT_ID)');
        }
        return clientId;
    }
    sanitizeUsernameBase(input) {
        const cleaned = (input || '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9._-]/g, '')
            .replace(/^[._-]+|[._-]+$/g, '');
        if (cleaned.length >= 3)
            return cleaned.slice(0, 24);
        return 'user';
    }
    async generateUniqueUsername(preferredBase) {
        const base = this.sanitizeUsernameBase(preferredBase);
        const existing = await this.usersService.findByUsername(base);
        if (!existing)
            return base;
        for (let i = 0; i < 20; i++) {
            const suffix = (0, crypto_1.randomBytes)(3).toString('hex');
            const candidate = `${base}_${suffix}`.slice(0, 30);
            const taken = await this.usersService.findByUsername(candidate);
            if (!taken)
                return candidate;
        }
        return `user_${(0, crypto_1.randomBytes)(4).toString('hex')}`.slice(0, 30);
    }
    async validateUser(email, password) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Geçersiz email veya şifre');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Hesabınız devre dışı bırakılmış. Lütfen yönetici ile iletişime geçin.');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Geçersiz email veya şifre');
        }
        const { password: _, ...result } = user;
        return result;
    }
    async login(user) {
        const payload = {
            email: user.email,
            username: user.username,
            sub: user.id,
            role: user.role,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                photoUrl: user.photoUrl,
            },
        };
    }
    async me(token) {
        try {
            const decoded = this.jwtService.verify(token);
            const user = await this.usersService.findByEmail(decoded.email);
            if (!user) {
                throw new common_1.UnauthorizedException('Kullanıcı bulunamadı');
            }
            if (!user.isActive) {
                throw new common_1.UnauthorizedException('Hesabınız devre dışı bırakılmış.');
            }
            return {
                id: user.id,
                email: user.email,
                role: user.role,
                photoUrl: user.photoUrl,
            };
        }
        catch (err) {
            console.error('Token verification error:', err.message);
            throw new common_1.UnauthorizedException('Geçersiz veya süresi dolmuş token');
        }
    }
    async register(registerDto) {
        const existing = await this.usersService.findByEmail(registerDto.email);
        if (existing) {
            throw new common_1.UnauthorizedException('Bu email ile zaten bir kullanıcı var.');
        }
        const user = await this.usersService.create({
            ...registerDto,
            role: 'user',
            isActive: true,
        });
        return { message: 'Kayıt başarılı', user };
    }
    async loginWithGoogleIdToken(idToken) {
        if (!idToken) {
            throw new common_1.UnauthorizedException('Google token gerekli');
        }
        const clientId = this.getGoogleClientId();
        const client = new google_auth_library_1.OAuth2Client(clientId);
        let payload;
        try {
            const ticket = await client.verifyIdToken({
                idToken,
                audience: clientId,
            });
            payload = ticket.getPayload();
        }
        catch (err) {
            throw new common_1.UnauthorizedException('Geçersiz Google token');
        }
        const email = payload?.email;
        const emailVerified = payload?.email_verified;
        if (!email) {
            throw new common_1.UnauthorizedException('Google hesabından email alınamadı');
        }
        if (emailVerified === false) {
            throw new common_1.UnauthorizedException('Google email doğrulanmamış');
        }
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            if (!existingUser.isActive) {
                throw new common_1.UnauthorizedException('Hesabınız devre dışı bırakılmış. Lütfen yönetici ile iletişime geçin.');
            }
            const updates = {};
            if (!existingUser.firstName && payload?.given_name)
                updates.firstName = payload.given_name;
            if (!existingUser.lastName && payload?.family_name)
                updates.lastName = payload.family_name;
            if (!existingUser.photoUrl && payload?.picture)
                updates.photoUrl = payload.picture;
            if (Object.keys(updates).length) {
                await this.usersService.update(existingUser.id, updates);
                const refreshed = await this.usersService.findByEmail(email);
                return this.login(refreshed || existingUser);
            }
            return this.login(existingUser);
        }
        const givenName = payload?.given_name || '';
        const familyName = payload?.family_name || '';
        const fullName = payload?.name || '';
        const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
        const firstName = givenName || nameParts[0] || 'User';
        const lastName = familyName || nameParts.slice(1).join(' ') || 'Google';
        const photoUrl = payload?.picture || undefined;
        const preferredBase = email.split('@')[0] || `${firstName}${lastName}`;
        const username = await this.generateUniqueUsername(preferredBase);
        const randomPassword = (0, crypto_1.randomBytes)(32).toString('hex');
        const user = await this.usersService.create({
            username,
            email,
            password: randomPassword,
            firstName,
            lastName,
            photoUrl,
            role: 'user',
            isActive: true,
        });
        return this.login(user);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map