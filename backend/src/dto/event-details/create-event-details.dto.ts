import { IsString, IsDateString, IsInt, IsOptional } from 'class-validator';

export class CreateEventDetailsDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDateString()
  date: string;

  @IsString()
  time: string;

  @IsInt()
  duration: number;

  @IsString()
  location: string;

  @IsString()
  @IsOptional()
  guests?: string;

  @IsString()
  @IsOptional()
  attachment?: string;
}
