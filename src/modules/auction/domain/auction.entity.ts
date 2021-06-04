import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Auction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  name: string;

  @Column()
  startingBid: number;

  @Column({ default: 'ETH' })
  bidCurrency: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  headline: string;

  @Column()
  link: string;

  @Column()
  promoImage: string;

  @Column()
  backgroundImage: string;

  @Column({ default: false })
  backgroundBlur: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
