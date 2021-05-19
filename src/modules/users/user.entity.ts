import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @Exclude()
  id: number;

  @Column()
  address: string;

  @Column({ default: '' })
  profileImageName: string;

  @Column({ default: '' })
  logoImageName: string;

  @Column({ default: '' })
  displayName: string;

  @Column({ default: '' })
  universePageUrl: string;

  @Column({ default: '' })
  about: string;

  @Column({ default: '' })
  instagramUser: string;

  @Column({ default: '' })
  twitterUser: string;

  @Column({ default: true })
  @Exclude()
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
