import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Auction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  headline: string;

  @Column({ type: 'decimal' })
  startingBid: number;

  @Column()
  tokenAddress: string;

  @Column()
  tokenSymbol: string;

  @Column()
  tokenDecimals: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  royaltySplits: { address: string; percentAmount: number }[];

  @Column({ nullable: true })
  link: string;

  @Column({ nullable: true })
  promoImageUrl: string;

  @Column({ nullable: true })
  backgroundImageUrl: string;

  @Column({ default: false })
  backgroundImageBlur: boolean;

  @Column({ default: false })
  onChain: boolean;

  @Column({ nullable: true })
  onChainId: number;

  @Column({ nullable: true })
  txHash: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
