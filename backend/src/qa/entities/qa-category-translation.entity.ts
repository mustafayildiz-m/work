import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { QaCategory } from './qa-category.entity';
import { Language } from '../../languages/entities/language.entity';

@Entity('qa_category_translations')
export class QaCategoryTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  categoryId: number;

  @Column()
  languageId: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => QaCategory, (cat) => cat.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'categoryId' })
  category: QaCategory;

  @ManyToOne(() => Language)
  @JoinColumn({ name: 'languageId' })
  language: Language;
}
