import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Auction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  name: string;

  @Column({ default: false })
  onChain: boolean;

  @Column({nullable: true})
  onChainId: number;

  @Column({nullable: true})
  txHash: string;

  @Column()
  startingBid: number;

  @Column({ default: 'ETH' })
  bidCurrency: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({nullable: true})
  headline: string;

  @Column({nullable: true})
  link: string;

  @Column({nullable: true})
  promoImage: string;

  @Column({nullable: true})
  backgroundImage: string;

  @Column({ default: false })
  backgroundBlur: boolean;

  @Exclude()
  @CreateDateColumn()
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn()
  updatedAt: Date;

  rewardTiers: any[]
}
