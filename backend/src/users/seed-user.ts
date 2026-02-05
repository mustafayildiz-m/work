import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import ormconfig from '../config/typeorm.config';

async function seedUser() {
  const dataSource = await ormconfig.initialize();
  const userRepo = dataSource.getRepository(User);

  const userEmail = 'mustafayildiz.m111@gmail.com';
  const userUsername = 'mustafayildiz111';
  const userPassword = 'admin123';

  // User zaten var mı kontrol et
  const existing = await userRepo.findOneBy({ email: userEmail });
  if (existing) {
    console.log('User zaten mevcut.');
    await dataSource.destroy();
    return;
  }

  const hashedPassword = await bcrypt.hash(userPassword, 10);
  const user = userRepo.create({
    email: userEmail,
    username: userUsername,
    password: hashedPassword,
    firstName: 'Mustafa',
    lastName: 'Yildiz',
    role: 'user',
    isActive: true,
  });
  await userRepo.save(user);
  console.log('User başarıyla eklendi!');
  await dataSource.destroy();
}

seedUser().catch((err) => {
  console.error('Seed sırasında hata:', err);
  process.exit(1);
});
