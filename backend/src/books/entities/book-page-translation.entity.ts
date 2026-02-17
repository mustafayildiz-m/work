import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { BookPage } from './book-page.entity';
import { Language } from '../../languages/entities/language.entity';

@Entity('book_page_translations')
@Index(['pageId', 'languageId'], { unique: true })
export class BookPageTranslation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    pageId: number;

    @Column()
    languageId: number;

    @Column({ type: 'longtext' })
    content: string;

    @ManyToOne(() => BookPage, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'pageId' })
    page: BookPage;

    @ManyToOne(() => Language)
    @JoinColumn({ name: 'languageId' })
    language: Language;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
