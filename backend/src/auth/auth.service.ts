import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { randomBytes } from 'crypto';

import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) { }

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

    // Kullanıcı doğrulanmış mı kontrol et
    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Lütfen önce e-posta adresinizi doğrulayın.',
      );
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
        language: user.language,
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
        language: user.language,
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
    const verificationToken = randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date();
    verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);

    const user = await this.usersService.create({
      ...registerDto,
      role: 'user',
      isActive: true,
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    } as any);

    // E-posta gönder
    await this.mailService.sendVerificationEmail(
      user.email,
      user.firstName || user.username,
      verificationToken,
    );

    return {
      message:
        'Kayıt başarılı. Lütfen e-posta adresinize gönderilen doğrulama linkine tıklayın.',
    };
  }

  async verifyEmail(token: string) {
    const user = await (this.usersService as any).usersRepository.findOne({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new UnauthorizedException('Geçersiz doğrulama tokenı.');
    }

    if (user.verificationTokenExpires < new Date()) {
      throw new UnauthorizedException('Doğrulama linkinin süresi dolmuş.');
    }

    await this.usersService.update(user.id, {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    } as any);

    // Doğrulama tamamlandıktan sonra hoş geldin maili gönder
    await this.mailService.sendWelcomeEmail(user.email, user.firstName);

    return { message: 'Hesabınız başarıyla doğrulandı.' };
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
      language: (payload as any)?.locale || 'tr',
      isActive: true,
      isVerified: true, // Google ile kayıt olanlar direkt doğrulanmış sayılır
    } as any);

    // Google ile yeni kayıt olana hoş geldin maili gönder
    await this.mailService.sendWelcomeEmail(user.email, user.firstName);

    return this.login(user);
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Güvenlik için kullanıcı bulunamasa bile aynı mesajı dönebiliriz 
      // ama şu an geliştirme aşamasında olduğumuz için basit tutalım
      throw new UnauthorizedException('Kullanıcı bulunamadı.');
    }

    const resetToken = randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1 saat geçerli

    await this.usersService.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires,
    } as any);

    await this.mailService.sendPasswordResetEmail(
      user.email,
      user.firstName || user.username,
      resetToken,
    );

    return { message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await (this.usersService as any).usersRepository.findOne({
      where: { resetPasswordToken: token },
    });

    if (!user) {
      throw new UnauthorizedException('Geçersiz veya süresi dolmuş şifre sıfırlama tokenı.');
    }

    if (user.resetPasswordExpires < new Date()) {
      throw new UnauthorizedException('Şifre sıfırlama linkinin süresi dolmuş.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // UsersService.update metodu şifreyi tekrar hashliyor olabilir, bu yüzden direkt repository kullanıyoruz
    await (this.usersService as any).usersRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return { message: 'Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz.' };
  }
}
