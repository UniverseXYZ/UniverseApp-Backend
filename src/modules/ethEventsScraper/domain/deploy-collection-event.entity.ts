import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('universe')
export class DeployCollectionEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tx_hash: string;

  @Column()
  tx_index: number;

  @Column()
  log_index: number;

  @Column()
  token_name: string;

  @Column()
  token_symbol: string;

  @Column()
  contract_address: string;

  @Column()
  block_timestamp: string;

  @Column()
  included_in_block: string;

  @Column()
  processed: boolean;

  @Column()
  owner: string;

  @Column()
  created_at: Date;
}
