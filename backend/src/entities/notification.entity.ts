import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../users/entities/user.entity';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    user_id: number; // The recipient of the notification

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    type: string; // 'follow_request', 'follow_accept', etc.

    @Column()
    title: string;

    @Column('text', { nullable: true })
    message: string;

    @Column({ default: false })
    is_read: boolean;

    @Column({ nullable: true })
    related_user_id: number; // The user who triggered the notification (e.g., the follower)

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'related_user_id' })
    related_user: User;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
