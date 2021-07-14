import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class RewardTier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  auctionId: number;

  @Column()
  userId: number;

  @Column()
  name: string;

  @Column({ type: 'integer' })
  numberOfWinners: number;

  @Column({ type: 'integer' })
  nftsPerWinner: number;

  @Column({ type: 'decimal', nullable: true })
  minimumBid: number;

  @Column()
  tierPosition: number;

  @Column({ nullable: true })
  customDescription: string;

  @Column({ nullable: true })
  tierImageUrl: string;

  @Column({ nullable: true })
  tierColor: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
