import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Article } from './article.entity';
import { ArticlePageTranslation } from './article-page-translation.entity';

@Entity('article_pages')
export class ArticlePage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    articleId: number;

    @Column()
    pageNumber: number;

    @Column({ type: 'mediumtext', nullable: true })
    content: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Article, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'articleId' })
    article: Article;

    @OneToMany(() => ArticlePageTranslation, (translation) => translation.page)
    translations: ArticlePageTranslation[];
}
