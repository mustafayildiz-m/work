import { IsOptional, IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateLanguageDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 10)
  code: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  flagUrl?: string;
}
