import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserPostCommentsService } from '../services/user-post-comments.service';
import { CreateUserPostCommentDto } from '../dto/user-post-comments/create-user-post-comment.dto';
import { UpdateUserPostCommentDto } from '../dto/user-post-comments/update-user-post-comment.dto';

@Controller('user-post-comments')
@UseGuards(JwtAuthGuard)
export class UserPostCommentsController {
  constructor(
    private readonly userPostCommentsService: UserPostCommentsService,
  ) {}

  @Post()
  create(
    @Body() createUserPostCommentDto: CreateUserPostCommentDto,
    @Request() req: any,
  ) {
    const userId = req.user.id; // JWT'den user ID'yi al
    return this.userPostCommentsService.create(
      createUserPostCommentDto,
      userId,
    );
  }

  @Get('post/:postId')
  findByPostId(@Param('postId', ParseIntPipe) postId: number) {
    return this.userPostCommentsService.findByPostId(postId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userPostCommentsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserPostCommentDto: UpdateUserPostCommentDto,
    @Request() req: any,
  ) {
    const userId = req.user.id; // JWT'den user ID'yi al
    return this.userPostCommentsService.update(
      id,
      updateUserPostCommentDto,
      userId,
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = req.user.id; // JWT'den user ID'yi al
    return this.userPostCommentsService.remove(id, userId);
  }

  @Get('count/:postId')
  getCommentCount(@Param('postId', ParseIntPipe) postId: number) {
    return this.userPostCommentsService.getCommentCount(postId);
  }
}
