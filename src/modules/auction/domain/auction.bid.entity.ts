import { Exclude } from 'class-transformer';
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

  @Column({ type: 'decimal' })
  amount: number;

  @Column({ nullable: true })
  onChainSlotIndex: number;

  @CreateDateColumn()
  createdAt: Date;
}
