import { IsInt, IsString, IsOptional, IsIn } from 'class-validator';

export class CreateUserPostDto {
  @IsInt()
  user_id: number;

  @IsString()
  type: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsString()
  @IsOptional()
  video_url?: string;

  @IsString()
  @IsOptional()
  @IsIn(['user', 'scholar'])
  shared_profile_type?: string;

  @IsInt()
  @IsOptional()
  shared_profile_id?: number;

  @IsInt()
  @IsOptional()
  shared_book_id?: number;

  @IsInt()
  @IsOptional()
  shared_article_id?: number;
}
