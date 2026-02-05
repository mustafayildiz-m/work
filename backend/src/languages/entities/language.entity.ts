import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { BookTranslation } from '../../books/entities/book-translation.entity';
import { ArticleTranslation } from '../../articles/entities/article-translation.entity';

@Entity('languages')
export class Language {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ length: 10, unique: true })
  code: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(
    () => BookTranslation,
    (bookTranslation) => bookTranslation.language,
  )
  bookTranslations: BookTranslation[];

  @OneToMany(
    () => ArticleTranslation,
    (articleTranslation) => articleTranslation.language,
  )
  articleTranslations: ArticleTranslation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
