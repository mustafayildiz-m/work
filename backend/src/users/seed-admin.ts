import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import ormconfig from '../config/typeorm.config';

async function seedAdmin() {
  const dataSource = await ormconfig.initialize();
  const userRepo = dataSource.getRepository(User);

  const adminEmail = 'admin@islamicwindows.com';
  const adminUsername = 'admin';
  const adminPassword = 'admin123';

  // Admin zaten var mı kontrol et
  const existing = await userRepo.findOneBy({ email: adminEmail });
  if (existing) {
    console.log('Admin zaten mevcut.');
    await dataSource.destroy();
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const admin = userRepo.create({
    email: adminEmail,
    username: adminUsername,
    password: hashedPassword,
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isActive: true,
  });
  await userRepo.save(admin);
  console.log('Admin başarıyla eklendi!');
  await dataSource.destroy();
}

seedAdmin().catch((err) => {
  console.error('Seed sırasında hata:', err);
  process.exit(1);
});
