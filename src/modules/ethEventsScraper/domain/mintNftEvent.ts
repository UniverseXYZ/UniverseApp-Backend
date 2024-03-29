import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('minted_nfts')
export class MintedNftEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tx_hash: string;

  @Column()
  tx_index: number;

  @Column()
  log_index: number;

  @Column()
  token_id: number;

  @Column()
  token_uri: string;

  @Column()
  processed: boolean;

  @Column({ type: 'text' })
  receiver: string;

  @Column()
  contract_address: string;

  @Column()
  block_timestamp: string;

  @Column()
  included_in_block: string;

  @Column()
  created_at: Date;
}
