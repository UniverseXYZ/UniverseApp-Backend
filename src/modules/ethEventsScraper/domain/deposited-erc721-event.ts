import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

type Erc721DepositedEventData = {
  time: number;
  tokenId: number;
  auctionId: number;
  depositor: string;
  slotIndex: number;
  nftSlotIndex: number;
  tokenAddress: string;
};

@Entity({
  name: 'deposited_erc721',
})
export class Erc721DepositedEvent {
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
  data?: Erc721DepositedEventData;

  @Column()
  block_timestamp: string;

  @Column()
  included_in_block: string;

  @Column()
  created_at: Date;
}
