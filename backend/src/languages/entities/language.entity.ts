import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BookTranslation } from '../../books/entities/book-translation.entity';

@Entity('languages')
export class Language {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nativeName: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  englishName: string | null;

  @Column({ length: 10, unique: true })
  code: string;

  @Column({ type: 'char', length: 3, nullable: true, unique: true })
  iso639_3: string | null;

  @Column({ type: 'enum', enum: ['ltr', 'rtl'], default: 'ltr' })
  direction: 'ltr' | 'rtl';

  @Column({ type: 'text', nullable: true })
  aliases: string | null;

  @ManyToOne(() => Language, (lang) => lang.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parentLanguageId' })
  parentLanguage: Language | null;

  @Column({ nullable: true })
  parentLanguageId: number | null;

  @OneToMany(() => Language, (lang) => lang.parentLanguage)
  children: Language[];

  @Column({ type: 'int', default: 0 })
  questionCount: number;

  @Column({
    type: 'enum',
    enum: ['active', 'in_progress', 'not_published'],
    default: 'not_published',
  })
  status: 'active' | 'in_progress' | 'not_published';

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
