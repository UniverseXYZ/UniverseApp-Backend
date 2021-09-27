import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

type TxStatus = 'pending' | 'failed' | 'succeded';

@Entity({
  schema: 'universe-backend',
})
export class MintingNft {
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @Column()
  userId: number;

  @Column({ nullable: true })
  collectionId: number;

  @Exclude()
  @Column({ nullable: true })
  savedNftId: number;

  @Column({ nullable: true })
  tokenUri: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  numberOfEditions: number;

  @Column({ nullable: true })
  artworkType?: string;

  //artwork original s3
  @Column({ nullable: true })
  url?: string;

  //artwork original optimized s3, less bytes per pixel/frame
  @Column({ nullable: true })
  optimizedUrl?: string;

  //either resized image, or in case of videos a snapshot of a frame
  @Column({ nullable: true })
  thumbnailUrl?: string;

  //arweave content
  @Column({ nullable: true })
  originalUrl?: string;

  @Column({ type: 'jsonb', nullable: true })
  properties?: any;

  @Column({ type: 'jsonb', nullable: true })
  royalties?: any;

  @Column({ nullable: true })
  txHash?: string;

  @Column({ nullable: true, type: 'character' })
  txStatus?: TxStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
