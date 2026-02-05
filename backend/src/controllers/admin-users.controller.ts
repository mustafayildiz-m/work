import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { UpdateUserAdminDto } from '../users/dto/update-user-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Controller('admin/users')
@UseGuards(JwtAuthGuard)
export class AdminUsersController {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Kullanıcı listesi (filtreleme ve sayfalama ile)
  @Get()
  async getUsers(
    @Query('role') role?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNumber = limit ? parseInt(limit) : 20;
    const offsetNumber = offset ? parseInt(offset) : 0;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Role filtresi
    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    // Aktiflik filtresi
    if (isActive !== undefined) {
      const activeStatus = isActive === 'true';
      queryBuilder.andWhere('user.isActive = :isActive', {
        isActive: activeStatus,
      });
    }

    // Arama filtresi
    if (search) {
      queryBuilder.andWhere(
        '(user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search OR user.username LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Sayfalama
    queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip(offsetNumber)
      .take(limitNumber);

    const [users, total] = await queryBuilder.getManyAndCount();

    // Şifreleri gizle
    const sanitizedUsers = users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return {
      users: sanitizedUsers,
      total,
      limit: limitNumber,
      offset: offsetNumber,
      hasMore: offsetNumber + limitNumber < total,
    };
  }

  // Kullanıcı detayı
  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'username',
        'firstName',
        'lastName',
        'photoUrl',
        'biography',
        'phoneNo',
        'location',
        'birthDate',
        'role',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new BadRequestException('Kullanıcı bulunamadı');
    }

    return user;
  }

  // Kullanıcı güncelle
  @Patch(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserAdminDto,
  ) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new BadRequestException('Kullanıcı bulunamadı');
    }

    // Email benzersizliği kontrolü
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingEmail) {
        throw new BadRequestException('Bu email zaten kullanılıyor');
      }
    }

    // Username benzersizliği kontrolü
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUsername = await this.userRepository.findOne({
        where: { username: updateUserDto.username },
      });
      if (existingUsername) {
        throw new BadRequestException('Bu kullanıcı adı zaten kullanılıyor');
      }
    }

    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Kullanıcı rolünü değiştir
  @Patch(':id/role')
  async changeUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: string,
  ) {
    const validRoles = ['user', 'editor', 'admin'];
    if (!validRoles.includes(role)) {
      throw new BadRequestException('Geçersiz rol');
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('Kullanıcı bulunamadı');
    }

    user.role = role;
    await this.userRepository.save(user);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Kullanıcıyı aktif/pasif yap
  @Patch(':id/status')
  async toggleUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('isActive') isActive: boolean,
  ) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('Kullanıcı bulunamadı');
    }

    user.isActive = isActive;
    await this.userRepository.save(user);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Kullanıcı sil
  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('Kullanıcı bulunamadı');
    }

    await this.userRepository.remove(user);
    return { message: 'Kullanıcı başarıyla silindi' };
  }

  // Kullanıcı istatistikleri
  @Get('statistics/summary')
  async getUserStatistics() {
    const [
      totalUsers,
      adminCount,
      editorCount,
      userCount,
      activeUsers,
      inactiveUsers,
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { role: 'admin' } }),
      this.userRepository.count({ where: { role: 'editor' } }),
      this.userRepository.count({ where: { role: 'user' } }),
      this.userRepository.count({ where: { isActive: true } }),
      this.userRepository.count({ where: { isActive: false } }),
    ]);

    return {
      totalUsers,
      adminCount,
      editorCount,
      userCount,
      activeUsers,
      inactiveUsers,
    };
  }
}
