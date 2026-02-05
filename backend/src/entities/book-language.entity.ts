import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Language } from './language.entity';
import { Book } from './book.entity';

@Entity('book_languages')
export class BookLanguage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Language, (language) => language.bookLanguages)
  @JoinColumn({ name: 'languageId' })
  language: Language;

  @ManyToOne(() => Book)
  @JoinColumn({ name: 'bookId' })
  book: Book;
}
