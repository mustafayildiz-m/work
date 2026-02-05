import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Scholar } from '../scholars/entities/scholar.entity';
import { UserFollow } from '../entities/user-follow.entity';
import { UserScholarFollow } from '../entities/user-scholar-follow.entity';
import { SearchService } from '../services/search.service';
import { SearchController } from '../controllers/search.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Scholar, UserFollow, UserScholarFollow]),
  ],
  providers: [SearchService],
  controllers: [SearchController],
  exports: [SearchService],
})
export class SearchModule {}
