import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class Auction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Exclude()
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
  @Exclude()
  onChain: boolean;

  @Column({ nullable: true })
  @Exclude()
  onChainId: number;

  @Column({ nullable: true })
  @Exclude()
  txHash: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
