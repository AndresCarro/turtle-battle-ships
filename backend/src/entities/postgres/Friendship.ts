import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';


export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

@Entity('friendships')
export class Friendship {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_name' })
  userName!: string;

  @Column({ name: 'friend_name' })
  friendName!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_name', referencedColumnName: 'name' })
  user!: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'friend_name', referencedColumnName: 'name' })
  friend!: User;
}
