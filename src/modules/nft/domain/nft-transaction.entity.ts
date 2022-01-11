import {
  Column, 
  CreateDateColumn, 
  Entity, 
  Index, 
  ManyToOne, 
  PrimaryGeneratedColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { NftTransactionStatusEnum } from '../../../common/constants/enums'
import { Nft } from './nft.entity';

@Entity({
  schema: 'universe-backend',
})

export class NftTransaction {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(
    () => Nft,
    nft => nft.files,
    {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    }
  )
  nft: Nft;

  @Column({
    type: 'enum',
    enum: NftTransactionStatusEnum,
    nullable: true,
  })
  status: NftTransactionStatusEnum;

  @Column({
      nullable: true,
  })
  hash: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
