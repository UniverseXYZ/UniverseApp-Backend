import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class RewardTier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  name: string;

  @Column({ type: 'integer' })
  numberOfWinners: number;

  @Column({ type: 'integer' })
  nftsPerWinner: number;

  @Column()
  minimumBid: number;

  @Column()
  auctionId: number;

  @Column()
  tierPosition: number;

  @Column({nullable:true})
  customDescription: string;

  @Column({nullable:true})
  tierImage: string;

  @Column({nullable:true})
  tierColor: string;

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn()
  @Exclude()
  updatedAt: Date;
}

/*
 * up to 20 winners and up to 5 nfts per winner, so max 100 NFTs
 */
