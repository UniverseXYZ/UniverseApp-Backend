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

  @Column()
  //TODO: Possible floating number errors
  amount: number;

  @Column()
  //TODO: Could be a FK to currency entity
  currency: string;

  @CreateDateColumn()
  createdAt: Date;
}
