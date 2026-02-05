import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('book_categories')
export class BookCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bookId: number;

  @Column()
  categoryName: string;
}
