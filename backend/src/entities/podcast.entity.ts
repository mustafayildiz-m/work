import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Language } from '../languages/entities/language.entity';

@Entity('podcasts')
export class Podcast {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  audioUrl: string; // Audio dosyası URL'i

  @Column({ type: 'varchar', length: 500, nullable: true })
  coverImage: string; // Kapak resmi

  @Column({ type: 'int', nullable: true })
  duration: number; // Süre (saniye)

  @Column({ type: 'varchar', length: 255, nullable: true })
  author: string; // Konuşmacı/Yazar

  @Column({ type: 'varchar', length: 50, default: 'tr' })
  language: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'int', default: 0 })
  listenCount: number; // Dinlenme sayısı

  @Column({ type: 'int', default: 0 })
  likeCount: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string; // Kategori (Hadis, Fıkıh, Tefsir, vb.)

  @Column({ type: 'date', nullable: true })
  publishDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
