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

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

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
