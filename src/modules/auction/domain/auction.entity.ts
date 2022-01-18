import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Exclude, Transform } from 'class-transformer';
import BigNumber from 'bignumber.js';

@Entity({
  schema: 'universe-backend',
})
export class Auction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Exclude()
  userId: number;

  @Column({ nullable: true })
  owner: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  headline: string;

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

  @Column({ default: true })
  initialised: boolean;

  @Column({ default: false })
  depositedNfts: boolean;

  @Column({ default: false })
  canceled: boolean;

  @Column({ default: false })
  finalised: boolean;

  @Column({ nullable: true })
  onChainId: number;

  @Column({ nullable: true })
  @Exclude()
  txHash: string;

  @Column({ nullable: true })
  @Exclude()
  createAuctionTxHash: string;

  @Column({ type: 'bigint', nullable: true })
  onChainStartTime: string;

  @Column({ type: 'bigint', nullable: true })
  onChainEndTime: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'bigint', nullable: true, default: 0 })
  @Transform(
    ({ value, obj }) => {
      console.log(value, obj);
      return new BigNumber(value || '0').dividedBy(10 ** obj.tokenDecimals).toFixed();
    },
    {
      toPlainOnly: true,
    },
  )
  revenueClaimed: string;
}
