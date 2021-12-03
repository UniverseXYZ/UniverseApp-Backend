import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

type WithdrawnRevenueEventData = {
  recipient: string;
  auctionId: number;
  amount: string;
  time: number;
};

@Entity({
  name: 'withdrawn_revenues',
})
export class WithdrawnRevenueEvent {
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
  data?: WithdrawnRevenueEventData;

  @Column()
  block_timestamp: string;

  @Column()
  included_in_block: string;

  @Column()
  created_at: Date;
}
