import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class RewardTierNft {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rewardTierId: number;

  @Column()
  nftId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
