import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Exclude, Expose, Transform } from 'class-transformer';
import { configValues } from '../../configuration';

const transformFn = ({ value }) => value && configValues.aws.s3BaseUrl + '/' + value;

@Entity()
export class SavedNft {
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @Column()
  userId: number;

  @Column()
  collectionId: number;

  @Column({ nullable: true })
  txHash: string;

  @Column({ type: 'jsonb', default: [] })
  tokenUris: string[];

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  numberOfEditions: number;

  @Column({ nullable: true })
  artworkType?: string;

  //artwork original s3
  @Transform(transformFn)
  @Column({ nullable: true })
  url?: string;

  //artwork original optimized s3, less bytes per pixel/frame
  @Transform(transformFn)
  @Expose({ name: 'optimizedUrl' })
  @Column({ nullable: true })
  optimized_url?: string;

  //either resized image, or in case of videos a snapshot of a frame
  @Transform(transformFn)
  @Expose({ name: 'thumbnailUrl' })
  @Column({ nullable: true })
  thumbnail_url?: string;

  //arweave content
  @Transform(transformFn)
  @Expose({ name: 'originalUrl' })
  @Column({ nullable: true })
  original_url?: string;

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
