import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { QaItem } from './qa-item.entity';
import { Language } from '../../languages/entities/language.entity';

@Entity('qa_item_translations')
export class QaItemTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  qaItemId: number;

  @Column()
  languageId: number;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'text' })
  answer: string;

  @Column({ type: 'text', nullable: true })
  keywords: string;

  @ManyToOne(() => QaItem, (item) => item.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'qaItemId' })
  qaItem: QaItem;

  @ManyToOne(() => Language)
  @JoinColumn({ name: 'languageId' })
  language: Language;
}
