import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

type BidWithdrawnEventData = {
  recipient: string;
  auctionId: number;
  amount: number;
  time: number;
};

@Entity({
  name: 'bids_withdrawn',
})
export class BidWithdrawnEvent {
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
  data?: BidWithdrawnEventData;

  @Column()
  block_timestamp: string;

  @Column()
  included_in_block: string;

  @Column()
  created_at: Date;
}
