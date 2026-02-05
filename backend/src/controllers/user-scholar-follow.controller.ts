import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserScholarFollowService } from '../services/user-scholar-follow.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('user-scholar-follow')
export class UserScholarFollowController {
  constructor(
    private readonly userScholarFollowService: UserScholarFollowService,
  ) {}

  @Post('follow')
  follow(@Body() body: { user_id: number; scholar_id: number }) {
    return this.userScholarFollowService.follow(body.user_id, body.scholar_id);
  }

  @Delete('unfollow')
  unfollow(@Body() body: { user_id: number; scholar_id: number }) {
    return this.userScholarFollowService.unfollow(
      body.user_id,
      body.scholar_id,
    );
  }

  // Takip edilen alimleri getir
  @Get('following')
  async getFollowingScholars(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id;
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    const offsetNumber = offset ? parseInt(offset, 10) : 0;

    const [scholars, totalCount] = await Promise.all([
      this.userScholarFollowService.getFollowingScholars(
        userId,
        limitNumber,
        offsetNumber,
      ),
      this.userScholarFollowService.getFollowingScholarsCount(userId),
    ]);

    return {
      scholars,
      totalCount,
      hasMore: offsetNumber + limitNumber < totalCount,
    };
  }

  // Takip edilen alim sayısını getir
  @Get('stats')
  async getScholarFollowStats(@Request() req?: any) {
    const userId = req?.user?.id;

    const followingCount =
      await this.userScholarFollowService.getFollowingScholarsCount(userId);

    return {
      followingScholarsCount: followingCount,
    };
  }
}
