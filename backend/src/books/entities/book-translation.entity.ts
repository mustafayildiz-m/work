import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Book } from './book.entity';
import { Language } from '../../languages/entities/language.entity';

@Entity('book_translations')
export class BookTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bookId: number;

  @Column()
  languageId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ nullable: true })
  pdfUrl: string;

  @ManyToOne(() => Book, (book) => book.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookId' })
  book: Book;

  @ManyToOne(() => Language, (language) => language.id)
  @JoinColumn({ name: 'languageId' })
  language: Language;
}
