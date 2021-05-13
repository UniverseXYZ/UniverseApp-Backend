import {
  Column,
  CreateDateColumn,
  Entity, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NftCollection } from './collection.entity';

@Entity()
export class Nft {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

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
