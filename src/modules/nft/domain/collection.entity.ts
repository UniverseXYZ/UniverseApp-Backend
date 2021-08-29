import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum CollectionSource {
  UNIVERSE = 'universe',
  SCRAPER = 'scraper',
}
@Entity()
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
  owner?: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  symbol?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  shortUrl?: string;

  @Column({ nullable: true })
  coverUrl?: string;

  @Column({ default: false })
  publicCollection?: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
