import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { QaTag } from './qa-tag.entity';
import { Language } from '../../languages/entities/language.entity';

@Entity('qa_tag_translations')
export class QaTagTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tagId: number;

  @Column()
  languageId: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ManyToOne(() => QaTag, (tag) => tag.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tagId' })
  tag: QaTag;

  @ManyToOne(() => Language)
  @JoinColumn({ name: 'languageId' })
  language: Language;
}
