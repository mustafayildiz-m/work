import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScholarStory } from '../entities/scholar-story.entity';
import { StoryView } from '../entities/story-view.entity';
import { StoryLike } from '../entities/story-like.entity';
import { Scholar } from '../scholars/entities/scholar.entity';
import { ScholarStoryService } from '../services/scholar-story.service';
import { ScholarStoryController } from '../controllers/scholar-story.controller';
import { UploadModule } from '../upload/upload.module';
import { CacheService } from '../services/cache.service';
import { UserPostsModule } from '../modules/user-posts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScholarStory, StoryView, StoryLike, Scholar]),
    UploadModule,
    UserPostsModule,
  ],
  controllers: [ScholarStoryController],
  providers: [ScholarStoryService, CacheService],
  exports: [ScholarStoryService],
})
export class ScholarStoriesModule {}
