import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

type BidSubmittedEventData = {
  sender: string;
  auctionId: number;
  currentBid: number;
  totalBid: number;
  time: number;
};

@Entity({
  name: 'bids_submitted',
})
export class BidSubmittedEvent {
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
  data?: BidSubmittedEventData;

  @Column()
  block_timestamp: string;

  @Column()
  included_in_block: string;

  @Column()
  created_at: Date;
}
