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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/*
 * up to 20 winners and up to 5 nfts per winner, so max 100 NFTs
 */
