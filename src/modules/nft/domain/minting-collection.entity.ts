import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

type TxStatus = 'pending' | 'failed' | 'succeded';

@Entity({
  schema: 'universe-backend',
})
export class MintingCollection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  name: string;

  @Column()
  symbol: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  shortUrl?: string;

  @Column({ nullable: true })
  coverUrl?: string;

  @Column({ nullable: true })
  txHash?: string;

  @Column({ nullable: true, type: 'character' })
  txStatus?: TxStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
