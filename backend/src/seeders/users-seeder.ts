import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersSeeder {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed() {
    console.log('🌱 Starting users seeding...');

    // 10 rastgele kullanıcı
    const users = [
      {
        email: 'ahmet.yilmaz@example.com',
        username: 'ahmetyilmaz',
        password: '123456',
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        photoUrl: 'uploads/coverImage/coverImage.jpg',
        biography:
          'İslami ilimlerle ilgilenen bir öğrenci. Hadis ve fıkıh konularında araştırmalar yapıyorum.',
        role: 'user',
        isActive: true,
      },
      {
        email: 'fatma.kaya@example.com',
        username: 'fatmakaya',
        password: '123456',
        firstName: 'Fatma',
        lastName: 'Kaya',
        photoUrl: 'uploads/coverImage/coverImage.jpg',
        biography:
          "Tasavvuf ve ahlak konularında kendimi geliştirmeye çalışıyorum. Mevlana'nın eserlerini okuyorum.",
        role: 'user',
        isActive: true,
      },
      {
        email: 'mehmet.demir@example.com',
        username: 'mehmetdemir',
        password: '123456',
        firstName: 'Mehmet',
        lastName: 'Demir',
        photoUrl: 'uploads/coverImage/coverImage.jpg',
        biography:
          "Kur'an-ı Kerim tefsiri ve Arapça dil öğrenimi konularında çalışıyorum.",
        role: 'user',
        isActive: true,
      },
      {
        email: 'ayse.ozturk@example.com',
        username: 'ayseozturk',
        password: '123456',
        firstName: 'Ayşe',
        lastName: 'Öztürk',
        photoUrl: 'uploads/coverImage/coverImage.jpg',
        biography:
          'İslam tarihi ve İslam medeniyeti konularında araştırmalar yapıyorum.',
        role: 'user',
        isActive: true,
      },
      {
        email: 'ali.celik@example.com',
        username: 'alcelik',
        password: '123456',
        firstName: 'Ali',
        lastName: 'Çelik',
        photoUrl: 'uploads/coverImage/coverImage.jpg',
        biography:
          'Fıkıh ve İslam hukuku konularında uzmanlaşmaya çalışıyorum.',
        role: 'user',
        isActive: true,
      },
      {
        email: 'zeynep.arslan@example.com',
        username: 'zeyneparslan',
        password: '123456',
        firstName: 'Zeynep',
        lastName: 'Arslan',
        photoUrl: 'uploads/coverImage/coverImage.jpg',
        biography:
          'Hadis ilmi ve sünnet konularında derinlemesine çalışıyorum.',
        role: 'user',
        isActive: true,
      },
      {
        email: 'ibrahim.koc@example.com',
        username: 'ibrahimkoc',
        password: '123456',
        firstName: 'İbrahim',
        lastName: 'Koç',
        photoUrl: 'uploads/coverImage/coverImage.jpg',
        biography:
          'İslam felsefesi ve kelam ilmi konularında araştırmalar yapıyorum.',
        role: 'user',
        isActive: true,
      },
      {
        email: 'hatice.sahin@example.com',
        username: 'haticesahin',
        password: '123456',
        firstName: 'Hatice',
        lastName: 'Şahin',
        photoUrl: 'uploads/coverImage/coverImage.jpg',
        biography:
          "Tefsir ve Kur'an ilimleri konularında kendimi geliştiriyorum.",
        role: 'user',
        isActive: true,
      },
      {
        email: 'osman.yildirim@example.com',
        username: 'osmanyildirim',
        password: '123456',
        firstName: 'Osman',
        lastName: 'Yıldırım',
        photoUrl: 'uploads/coverImage/coverImage.jpg',
        biography: 'İslami sanatlar ve edebiyat konularında çalışıyorum.',
        role: 'user',
        isActive: true,
      },
      {
        email: 'emine.akbas@example.com',
        username: 'emineakbas',
        password: '123456',
        firstName: 'Emine',
        lastName: 'Akbaş',
        photoUrl: 'uploads/coverImage/coverImage.jpg',
        biography:
          'İslami eğitim ve öğretim metodları konularında araştırmalar yapıyorum.',
        role: 'user',
        isActive: true,
      },
    ];

    for (const userData of users) {
      try {
        // Kullanıcının zaten var olup olmadığını kontrol et
        const existingUser = await this.userRepository.findOne({
          where: [{ email: userData.email }, { username: userData.username }],
        });

        if (existingUser) {
          console.log(
            `⚠️  User already exists: ${userData.email} or ${userData.username}`,
          );
          continue;
        }

        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Kullanıcıyı oluştur
        const user = this.userRepository.create({
          ...userData,
          password: hashedPassword,
        });

        await this.userRepository.save(user);
        console.log(
          `✅ Added user: ${userData.firstName} ${userData.lastName} (${userData.email})`,
        );
      } catch (error) {
        console.error(`❌ Error adding user ${userData.email}:`, error.message);
      }
    }

    console.log('🎉 Users seeding completed!');
  }
}
