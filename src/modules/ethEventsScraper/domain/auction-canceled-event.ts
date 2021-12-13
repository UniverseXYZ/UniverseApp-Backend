import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

type AuctionCanceledEventData = {
  auctionId: number;
  time: number;
};

@Entity({
  name: 'auctions_canceled',
})
export class AuctionCanceledEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  processed: boolean;

  @Column()
  tx_hash: string;

  @Column()
  tx_index: number;

  @Column()
  log_index: number;

  @Column({ type: 'jsonb', nullable: true })
  data?: AuctionCanceledEventData;

  @Column()
  block_timestamp: string;

  @Column()
  included_in_block: string;

  @Column()
  created_at: Date;
}
