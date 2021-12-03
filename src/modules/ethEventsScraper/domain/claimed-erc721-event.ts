import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

type Erc721ClaimedEventData = {
  claimer: string;
  auctionId: number;
  slotIndex: number;
  time: number;
};

@Entity({
  name: 'claimed_erc721',
})
export class Erc721ClaimedEvent {
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
  data?: Erc721ClaimedEventData;

  @Column()
  block_timestamp: string;

  @Column()
  included_in_block: string;

  @Column()
  created_at: Date;
}
