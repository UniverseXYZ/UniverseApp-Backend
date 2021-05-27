import {
  Column,
  CreateDateColumn,
  Entity, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NftCollection } from './collection.entity';


export enum NftSource {
  UNIVERSE = "universe",
  SCRAPER = "scraper"
}
@Entity()
export class Nft {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({
    type: "enum",
    enum: NftSource,
    default: NftSource.UNIVERSE
  })
  source: NftSource;

  @Column({ nullable: true })
  txHash: string;

  @Column({ default: false })
  onChain: boolean;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  tokenId: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  artwork_type?: string;

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

  //arweave json metadata uri
  @Column({ nullable: true })
  token_uri: string;

  @Column({ type: 'jsonb', nullable: true })
  properties?: any;

  @Column({ type: 'real', nullable: true })
  royalties?: number;

  @ManyToOne(
    () => NftCollection,
    (nftCollection) => nftCollection.collectibles,
  )
  collection: NftCollection;

  @Column({ default: true })
  refreshed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
