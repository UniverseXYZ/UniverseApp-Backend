import { Exclude, Expose } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { configValues } from '../configuration';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Exclude()
  @Column({ default: '' })
  profileImageName: string;

  @Exclude()
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

  @Expose()
  get profileImageUrl(): string {
    return this.profileImageName ? `${configValues.aws.s3BaseUrl}/${this.profileImageName}` : null;
  }

  @Expose()
  get logoImageUrl(): string {
    return this.logoImageName ? `${configValues.aws.s3BaseUrl}/${this.logoImageName}` : null;
  }
}
