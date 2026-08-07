import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { QaCategory } from './qa-category.entity';
import { QaItemTranslation } from './qa-item-translation.entity';
import { QaTag } from './qa-tag.entity';

@Entity('qa_items')
export class QaItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  categoryId: number;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  sourceReference: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sourceBookletName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sourceSection: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @ManyToOne(() => QaCategory, (cat) => cat.items, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category: QaCategory;

  @OneToMany(() => QaItemTranslation, (t) => t.qaItem, {
    cascade: true,
    eager: true,
  })
  translations: QaItemTranslation[];

  @ManyToMany(() => QaTag, (tag) => tag.qaItems)
  @JoinTable({
    name: 'qa_item_tags',
    joinColumn: { name: 'qaItemId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: QaTag[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
