import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Article } from './article.entity';
import { Language } from '../../languages/entities/language.entity';

@Entity('article_translations')
export class ArticleTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  articleId: number;

  @Column()
  languageId: number;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ nullable: true })
  slug: string;

  @Column({ nullable: true })
  pdfUrl: string;

  @ManyToOne(() => Article, (article) => article.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'articleId' })
  article: Article;

  @ManyToOne(() => Language, (language) => language.id)
  @JoinColumn({ name: 'languageId' })
  language: Language;
}
