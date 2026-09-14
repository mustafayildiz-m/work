import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

const toBoolean = ({ value }: { value: unknown }) =>
  value === true || value === 'true' || value === '1' || value === 1;

export class LoginDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi girin' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Şifre gereklidir' })
  password: string;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  rememberMe?: boolean;
}

export class RegisterDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi girin' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  @MaxLength(128)
  password: string;

  @IsString()
  @MinLength(3, { message: 'Kullanıcı adı en az 3 karakter olmalıdır' })
  @MaxLength(30)
  username: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}

export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Google token gerekli' })
  idToken: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi girin' })
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  @MaxLength(128)
  password: string;
}
