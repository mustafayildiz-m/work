import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private getGoogleClientId(): string {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new UnauthorizedException(
        'Google OAuth yapılandırması eksik (GOOGLE_CLIENT_ID)',
      );
    }
    return clientId;
  }

  private sanitizeUsernameBase(input: string): string {
    const cleaned = (input || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '')
      .replace(/^[._-]+|[._-]+$/g, '');

    if (cleaned.length >= 3) return cleaned.slice(0, 24);
    return 'user';
  }

  private async generateUniqueUsername(preferredBase: string): Promise<string> {
    const base = this.sanitizeUsernameBase(preferredBase);

    // Try base as-is first
    const existing = await this.usersService.findByUsername(base);
    if (!existing) return base;

    // Then try with suffixes
    for (let i = 0; i < 20; i++) {
      const suffix = randomBytes(3).toString('hex'); // 6 chars
      const candidate = `${base}_${suffix}`.slice(0, 30);
      const taken = await this.usersService.findByUsername(candidate);
      if (!taken) return candidate;
    }

    // Fallback
    return `user_${randomBytes(4).toString('hex')}`.slice(0, 30);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Geçersiz email veya şifre');
    }

    // Kullanıcı aktif mi kontrol et
    if (!user.isActive) {
      throw new UnauthorizedException(
        'Hesabınız devre dışı bırakılmış. Lütfen yönetici ile iletişime geçin.',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Geçersiz email veya şifre');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
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

  async me(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.usersService.findByEmail(decoded.email);
      if (!user) {
        throw new UnauthorizedException('Kullanıcı bulunamadı');
      }

      // Kullanıcı aktif mi kontrol et
      if (!user.isActive) {
        throw new UnauthorizedException('Hesabınız devre dışı bırakılmış.');
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        photoUrl: user.photoUrl,
      };
    } catch (err) {
      console.error('Token verification error:', err.message);
      throw new UnauthorizedException('Geçersiz veya süresi dolmuş token');
    }
  }

  async register(registerDto: any) {
    // Email var mı kontrol et
    const existing = await this.usersService.findByEmail(registerDto.email);
    if (existing) {
      throw new UnauthorizedException('Bu email ile zaten bir kullanıcı var.');
    }
    // Yeni kullanıcı oluştur
    const user = await this.usersService.create({
      ...registerDto,
      role: 'user',
      isActive: true,
    });
    return { message: 'Kayıt başarılı', user };
  }

  async loginWithGoogleIdToken(idToken: string) {
    if (!idToken) {
      throw new UnauthorizedException('Google token gerekli');
    }

    const clientId = this.getGoogleClientId();
    const client = new OAuth2Client(clientId);

    let payload: any;
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch (err: any) {
      throw new UnauthorizedException('Geçersiz Google token');
    }

    const email = payload?.email as string | undefined;
    const emailVerified = payload?.email_verified as boolean | undefined;
    if (!email) {
      throw new UnauthorizedException('Google hesabından email alınamadı');
    }
    if (emailVerified === false) {
      throw new UnauthorizedException('Google email doğrulanmamış');
    }

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      if (!existingUser.isActive) {
        throw new UnauthorizedException(
          'Hesabınız devre dışı bırakılmış. Lütfen yönetici ile iletişime geçin.',
        );
      }

      // Optional: backfill missing profile fields
      const updates: any = {};
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

    const givenName = (payload?.given_name as string | undefined) || '';
    const familyName = (payload?.family_name as string | undefined) || '';
    const fullName = (payload?.name as string | undefined) || '';

    const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
    const firstName = givenName || nameParts[0] || 'User';
    const lastName = familyName || nameParts.slice(1).join(' ') || 'Google';
    const photoUrl = (payload?.picture as string | undefined) || undefined;

    const preferredBase = email.split('@')[0] || `${firstName}${lastName}`;
    const username = await this.generateUniqueUsername(preferredBase);

    // Generate a random password (user can later change it)
    const randomPassword = randomBytes(32).toString('hex');

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
}
