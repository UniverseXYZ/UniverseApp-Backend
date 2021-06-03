import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class SavedNft {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  numberOfEditions: number;

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

  @Column({ type: 'jsonb', nullable: true })
  properties?: any;

  @Column({ type: 'real', nullable: true })
  royalties?: number;

  @Column({ type: 'integer', nullable: true })
  collectionId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
