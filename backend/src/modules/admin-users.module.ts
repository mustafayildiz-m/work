import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUsersController } from '../controllers/admin-users.controller';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UsersModule],
  controllers: [AdminUsersController],
})
export class AdminUsersModule {}
