import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Table,
  UpdateDateColumn,
} from 'typeorm';

//Todo: check entity name and structure
@Entity('asdasd')
export class CreateNftEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tx_hash: string;

  @Column()
  tx_index: number;

  @Column()
  log_index: number;

  @Column()
  data: {}

  @Column()
  block_timestamp: string;

  @Column()
  included_in_block: string;

  @Column()
  created_at: Date;
}
