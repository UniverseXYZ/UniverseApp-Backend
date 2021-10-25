import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  schema: 'universe-backend',
})
export class AuctionBid {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Exclude()
  userId: number;

  @Column()
  @Exclude()
  auctionId: number;

  @Column({ type: 'decimal' })
  amount: number;

  @CreateDateColumn()
  createdAt: Date;
}
