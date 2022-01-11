import {
  Column, 
  CreateDateColumn, 
  Entity, 
  Index, 
  ManyToOne, 
  PrimaryGeneratedColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Nft } from './nft.entity';
import { JsonBody } from 'aws-sdk/clients/wafv2';

@Entity({
  schema: 'universe-backend',
})

export class NftFile {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Nft,
    nft => nft.files,
    {
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    }
  )
  nft: Nft;

  @Column()
  order: number;

  @Column({
      nullable: true,
  })
  name: string;

  @Column({
      nullable: true,
  })
  description: string;

  @Column({ nullable: true })
  type?: string;

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

  @Column({
    nullable: true,
  })
  ipfsHash: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  @Exclude()
  ipfs: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
