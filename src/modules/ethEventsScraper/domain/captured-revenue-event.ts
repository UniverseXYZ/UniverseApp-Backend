import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

type CapturedRevenueEventData = {
  auctionId: number;
  slotIndex: number;
  amount: number;
  bidToken: string;
  time: number;
};

@Entity({
  name: 'captured_revenues',
})
export class CapturedRevenueEvent {
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
  data?: CapturedRevenueEventData;

  @Column()
  block_timestamp: string;

  @Column()
  included_in_block: string;

  @Column()
  created_at: Date;
}
