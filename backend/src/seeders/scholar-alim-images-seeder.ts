import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Scholar } from '../scholars/entities/scholar.entity';

@Injectable()
export class ScholarAlimImagesSeeder {
  constructor(
    @InjectRepository(Scholar)
    private readonly scholarRepository: Repository<Scholar>,
  ) {}

  /**
   * uploads/alimler/Cover ve uploads/alimler/ProfilPhotos klasörlerindeki
   * resimleri tüm alimlere karışık şekilde atar.
   */
  async seed(): Promise<{ updated: number; coverCount: number; profileCount: number }> {
    const baseDir = path.join(process.cwd(), 'uploads', 'alimler');
    const coverDir = path.join(baseDir, 'Cover');
    const profileDir = path.join(baseDir, 'ProfilPhotos');

    if (!fs.existsSync(coverDir)) {
      throw new Error(`Cover klasörü bulunamadı: ${coverDir}`);
    }
    if (!fs.existsSync(profileDir)) {
      throw new Error(`ProfilPhotos klasörü bulunamadı: ${profileDir}`);
    }

    const coverFiles = fs
      .readdirSync(coverDir)
      .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f))
      .map((f) => `uploads/alimler/Cover/${f}`);

    const profileFiles = fs
      .readdirSync(profileDir)
      .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f))
      .map((f) => `uploads/alimler/ProfilPhotos/${f}`);

    if (coverFiles.length === 0) {
      throw new Error('Cover klasöründe resim bulunamadı.');
    }
    if (profileFiles.length === 0) {
      throw new Error('ProfilPhotos klasöründe resim bulunamadı.');
    }

    const scholars = await this.scholarRepository.find({
      select: ['id', 'fullName', 'photoUrl', 'coverImage'],
    });

    if (scholars.length === 0) {
      console.log('⚠️ Veritabanında alim bulunamadı.');
      return { updated: 0, coverCount: coverFiles.length, profileCount: profileFiles.length };
    }

    let updated = 0;
    for (const scholar of scholars) {
      const randomCover = coverFiles[Math.floor(Math.random() * coverFiles.length)];
      const randomProfile = profileFiles[Math.floor(Math.random() * profileFiles.length)];

      await this.scholarRepository.update(scholar.id, {
        photoUrl: randomProfile,
        coverImage: randomCover,
      });
      updated++;
      process.stdout.write(`\r   Güncellenen: ${updated}/${scholars.length}`);
    }
    console.log('');

    return {
      updated,
      coverCount: coverFiles.length,
      profileCount: profileFiles.length,
    };
  }
}
