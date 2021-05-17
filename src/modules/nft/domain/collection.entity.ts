import {
  Column,
  CreateDateColumn,
  Entity, OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Nft } from './nft.entity';

export enum CollectionSource {
  UNIVERSE = "universe",
  SCRAPER = "scraper"
}
@Entity()
export class NftCollection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId?: number;

  @Column({
    type: "enum",
    enum: CollectionSource,
    default: CollectionSource.UNIVERSE
  })
  source: CollectionSource;

  @Column({ nullable: true })
  txHash?: string;

  @Column({ default: false })
  onChain: boolean;

  @Column({ nullable: true })
  address?: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  symbol?: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => Nft, (nft) => nft.collection, {
    cascade: true,
  })
  collectibles: Nft[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
