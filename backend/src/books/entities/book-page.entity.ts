import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { Book } from './book.entity';

@Entity('book_pages')
@Index(['bookId', 'pageNumber'], { unique: true })
export class BookPage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    bookId: number;

    @Column()
    pageNumber: number;

    @Column({ type: 'longtext' })
    content: string;

    @ManyToOne(() => Book, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'bookId' })
    book: Book;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
