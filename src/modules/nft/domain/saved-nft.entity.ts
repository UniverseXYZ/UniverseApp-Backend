import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

export enum MetadataStorageEnum {
  ONCHAIN = 'onchain',
  OFFCHAIN = 'offchain',
}

@Entity({
  schema: 'universe-backend',
})
export class SavedNft {
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @Column()
  userId: number;

  @Column()
  collectionId: number;

  @Column({ nullable: true })
  tokenUri: string;

  // @Column({ 
  //   type: 'enum',
  //   enum: MetadataStorageEnum,
  //   default: null,
  //   nullable: true,
  // })
  // metadataStorage: MetadataStorageEnum;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
