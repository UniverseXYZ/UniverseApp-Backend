import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @Column()
  customDescription: string;

  @Column()
  tierImage: string;

  @Column()
  tierColor: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/*
 * up to 20 winners and up to 5 nfts per winner, so max 100 NFTs
 */
