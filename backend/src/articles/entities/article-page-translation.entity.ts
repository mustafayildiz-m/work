import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { ArticlePage } from './article-page.entity';
import { Language } from '../../languages/entities/language.entity';

@Entity('article_page_translations')
export class ArticlePageTranslation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    pageId: number;

    @Column()
    languageId: number;

    @Column({ type: 'mediumtext' })
    content: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => ArticlePage, (page) => page.translations, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'pageId' })
    page: ArticlePage;

    @ManyToOne(() => Language)
    @JoinColumn({ name: 'languageId' })
    language: Language;
}
