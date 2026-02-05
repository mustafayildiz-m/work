import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScholarsService } from './scholars.service';
import { ScholarsController } from './scholars.controller';
import { Scholar } from './entities/scholar.entity';
import { ScholarBook } from './entities/scholar-book.entity';
import { ScholarPost } from './entities/scholar-post.entity';
import { ScholarPostTranslation } from './entities/scholar-post-translation.entity';
import { ScholarPostsService } from './scholar-posts.service';
import { ScholarPostsController } from './scholar-posts.controller';
import { Source } from '../sources/entities/source.entity';
import { Book } from '../books/entities/book.entity';
import { BookTranslation } from '../books/entities/book-translation.entity';
import { Language } from '../languages/entities/language.entity';
import { UploadModule } from '../upload/upload.module';
import { UserScholarFollowModule } from '../modules/user-scholar-follow.module';
import { CacheService } from '../services/cache.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Scholar,
      ScholarBook,
      ScholarPost,
      ScholarPostTranslation,
      Source,
      Book,
      BookTranslation,
      Language,
    ]),
    UploadModule,
    UserScholarFollowModule,
  ],
  controllers: [ScholarsController, ScholarPostsController],
  providers: [ScholarsService, ScholarPostsService, CacheService],
  exports: [ScholarsService, ScholarPostsService],
})
export class ScholarsModule { }
