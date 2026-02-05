import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class CreateUserPostCommentDto {
  @IsInt()
  @IsNotEmpty()
  post_id: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}
