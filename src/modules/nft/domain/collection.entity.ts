import { 
  Column, 
  CreateDateColumn, 
  Entity, 
  Index, 
  PrimaryGeneratedColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { 
  NftCollectionSourceEnum,
  NftCollectionStatusEnum,
} from '../../../common/constants/enums';
import { Exclude } from 'class-transformer';

@Entity({
  schema: 'universe-backend',
})

export class NftCollection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,
  })
  @Exclude()
  userId: number;

  @Column({
    type: 'enum',
    enum: NftCollectionStatusEnum,
    nullable: true,
  })
  status: NftCollectionStatusEnum;

  @Column({
    type: 'enum',
    enum: NftCollectionSourceEnum,
    default: NftCollectionSourceEnum.UNIVERSE,
  })
  source: NftCollectionSourceEnum;

  @Column({ nullable: true })
  txHash?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  @Index()
  owner?: string;

  @Column({ nullable: true })
  @Index()
  creator?: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  symbol?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  shortUrl?: string;

  @Column({ nullable: true })
  coverUrl?: string;

  @Column({ nullable: true })
  bannerUrl?: string;

  @Column({ default: false })
  publicCollection?: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}