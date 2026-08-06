import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { BookTranslation } from '../../books/entities/book-translation.entity';

@Entity('languages')
export class Language {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ length: 10, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  flagUrl: string | null;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(
    () => BookTranslation,
    (bookTranslation) => bookTranslation.language,
  )
  bookTranslations: BookTranslation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
