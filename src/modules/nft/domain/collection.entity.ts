import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum CollectionSource {
  UNIVERSE = 'universe',
  SCRAPER = 'scraper',
}
@Entity({
  schema: 'universe-backend',
})
export class NftCollection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: CollectionSource,
    default: CollectionSource.UNIVERSE,
  })
  source: CollectionSource;

  @Column({ nullable: true })
  txHash?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  @Index()
  owner?: string;

  @Column({ nullable: true })
  @Index()
  creator?: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  symbol?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  siteLink?: string;

  @Column({ nullable: true })
  discordLink?: string;

  @Column({ nullable: true })
  instagramLink?: string;

  @Column({ nullable: true })
  mediumLink?: string;

  @Column({ nullable: true })
  telegramLink?: string;

  @Column({ nullable: true })
  shortUrl?: string;

  @Column({ nullable: true })
  coverUrl?: string;

  @Column({ nullable: true })
  bannerUrl?: string;

  @Column({ default: false })
  publicCollection?: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
