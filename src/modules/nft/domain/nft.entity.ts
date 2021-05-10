import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Nft {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'integer' })
  numberOfEditions: number;

  @Column({ type: 'jsonb', nullable: true })
  properties?: any;

  @Column({ type: 'real', nullable: true })
  royalties?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
