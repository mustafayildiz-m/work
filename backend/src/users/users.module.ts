import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserFollowModule } from '../modules/user-follow.module';
import { UserScholarFollowModule } from '../modules/user-scholar-follow.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UserFollowModule,
    UserScholarFollowModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
