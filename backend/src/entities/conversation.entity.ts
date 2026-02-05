import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Message } from './message.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  participant1Id: number;

  @Column()
  participant2Id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'participant1Id' })
  participant1: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'participant2Id' })
  participant2: User;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @Column('timestamp', { nullable: true })
  lastMessageAt: Date;

  @Column('boolean', { default: false })
  isDeleted: boolean;

  @Column('boolean', { default: false })
  deletedByParticipant1: boolean;

  @Column('boolean', { default: false })
  deletedByParticipant2: boolean;

  @Column('timestamp', { nullable: true })
  deletedAtParticipant1: Date;

  @Column('timestamp', { nullable: true })
  deletedAtParticipant2: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
