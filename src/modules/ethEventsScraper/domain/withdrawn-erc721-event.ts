import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

type Erc721WithdrawnEventData = {
  time: number;
  tokenId: number;
  auctionId: number;
  depositor: string;
  slotIndex: number;
  nftSlotIndex: number;
  tokenAddress: string;
};

@Entity({
  name: 'withdrawn_erc721',
})
export class Erc721WithdrawnEvent {
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
  data?: Erc721WithdrawnEventData;

  @Column()
  block_timestamp: string;

  @Column()
  included_in_block: string;

  @Column()
  created_at: Date;
}
