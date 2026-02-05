import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserPostCommentDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  content?: string;
}
