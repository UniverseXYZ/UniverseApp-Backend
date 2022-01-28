import BigNumber from 'bignumber.js';
import { Exclude, Transform } from 'class-transformer';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  schema: 'universe-backend',
})
export class AuctionBid {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  @Exclude()
  bidder: string;

  @Column()
  @Exclude()
  auctionId: number;

  @Column({ type: 'bigint', nullable: true })
  @Transform(({ value, obj }) => new BigNumber(value).dividedBy(10 ** obj.decimalPlaces).toFixed(), {
    toPlainOnly: true,
  })
  amount: string;

  @Column({ nullable: true })
  onChainSlotIndex: number;

  @Column({ nullable: true })
  decimalPlaces: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false, nullable: true })
  withdrawn: boolean;
}
