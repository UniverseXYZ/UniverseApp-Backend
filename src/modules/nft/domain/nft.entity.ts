import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

export enum NftSource {
  UNIVERSE = 'universe',
  SCRAPER = 'scraper',
}
@Entity({
  schema: 'universe-backend',
})
export class Nft {
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @Column({ nullable: true })
  @Index()
  userId: number;

  @Column()
  collectionId: number;

  @Column({
    type: 'enum',
    enum: NftSource,
    default: NftSource.UNIVERSE,
  })
  @Exclude()
  source: NftSource;

  @Column({ nullable: true })
  txHash: string;

  @Exclude()
  @Column({ nullable: true })
  editionUUID: string;

  @Column({ nullable: true })
  creator: string;

  @Column({ nullable: true, length: 42 })
  owner: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  tokenId: string;

  @Column({ nullable: true })
  artworkType?: string;

  //artwork original s3
  @Column({ nullable: true })
  url?: string;

  //artwork original optimized s3, less bytes per pixel/frame
  @Column({ nullable: true })
  optimized_url?: string;

  //either resized image, or in case of videos a snapshot of a frame
  @Column({ nullable: true })
  thumbnail_url?: string;

  //arweave content
  @Column({ nullable: true })
  original_url?: string;

  @Column({ nullable: true })
  animation_url?: string;

  @Column({ nullable: true })
  animation_original_url?: string;

  @Column({ nullable: true })
  background_color?: string;

  @Column({ nullable: true })
  external_link?: string;

  //arweave json metadata uri
  @Column({ nullable: true })
  tokenUri: string;

  @Column({ type: 'jsonb', nullable: true })
  properties?: any;

  @Column({ type: 'jsonb', nullable: true })
  royalties?: any;

  @Column({ nullable: true })
  numberOfEditions?: number;

  @Exclude()
  @Column({ default: true })
  refreshed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: 1 })
  amount: number;

  @Column({ default: 'ERC721' })
  standard: string;
}
