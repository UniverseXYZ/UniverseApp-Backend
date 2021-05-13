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

  @Column()
  tokenId: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  image_url?: string;

  @Column({ nullable: true })
  image_preview_url?: string;

  @Column({ nullable: true })
  image_thumbnail_url?: string;

  @Column({ nullable: true })
  image_original_url?: string;

  @Column({ type: 'integer' })
  numberOfEditions: number;

  @Column({ type: 'jsonb', nullable: true })
  properties?: any;

  @Column({ type: 'real', nullable: true })
  royalties?: number;

  @ManyToOne(
    () => NftCollection,
    (nftCollection) => nftCollection.collectibles,
  )
  collection: NftCollection;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
