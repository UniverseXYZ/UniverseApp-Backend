import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

type AuctionCreatedEventData = {
  time: number;
  endTime: number;
  auctionId: number;
  startTime: number;
  resetTimer: number;
  auctionOwner: string;
  numberOfSlots: number;
  supportsWhitelist: boolean;
};

@Entity({
  name: 'auctions',
})
export class AuctionCreatedEvent {
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
  data?: AuctionCreatedEventData;

  @Column()
  block_timestamp: string;

  @Column()
  included_in_block: string;

  @Column()
  created_at: Date;
}
