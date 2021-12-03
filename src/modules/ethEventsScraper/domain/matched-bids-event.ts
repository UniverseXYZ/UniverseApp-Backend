import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

type MatchedBidEventData = {
  auctionId: number;
  slotIndex: number;
  slotReservePrice: number;
  winningBidAmount: number;
  winner: string;
  time: number;
};

@Entity({
  name: 'matched_bids',
})
export class MatchedBidEvent {
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
  data?: MatchedBidEventData;

  @Column()
  block_timestamp: string;

  @Column()
  included_in_block: string;

  @Column()
  created_at: Date;
}
