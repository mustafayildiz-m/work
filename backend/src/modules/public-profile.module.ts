import { Module } from '@nestjs/common';
import { PublicProfileController } from '../controllers/public-profile.controller';
import { UsersModule } from '../users/users.module';
import { ScholarsModule } from '../scholars/scholars.module';
import { BooksModule } from '../books/books.module';

@Module({
  imports: [UsersModule, ScholarsModule, BooksModule],
  controllers: [PublicProfileController],
})
export class PublicProfileModule {}
