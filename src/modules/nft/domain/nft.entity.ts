import { 
  Column, 
  CreateDateColumn, 
  Entity, 
  Index, 
  JoinColumn, 
  OneToMany, 
  PrimaryGeneratedColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { Exclude } from 'class-transformer';
import {
  NftSourceEnum,
  NftStatusEnum,
  MetadataStorageEnum,
} from '../../../common/constants/enums';
import { NftFile } from './nft-file.entity';
import { NftTransaction } from './nft-transaction.entity';

@Entity({
  schema: 'universe-backend',
})

export class Nft {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  @Exclude()
  @Index()
  userId: number;

  @Column({
    nullable: true,
  })
  collectionId: number;

  @Column({
    type: 'enum',
    enum: NftStatusEnum,
    nullable: false, // explicitly specify the value!
  })
  status: NftStatusEnum;

  @Column({
    type: 'enum',
    enum: NftSourceEnum,
    default: NftSourceEnum.UNIVERSE,
  })
  @Exclude()
  source: NftSourceEnum;

  @Column({ nullable: true })
  tokenId: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  //arweave json metadata uri
  @Column({ nullable: true })
  tokenUri: string;

  @Column({ nullable: true })
  numberOfEditions?: number;

  @Column({
    type: 'jsonb', 
    nullable: true,
  })
  properties?: any;

  @Column({
    type: 'jsonb', 
    nullable: true
  })
  royalties?: any;

  @Column({ 
    type: 'enum',
    enum: MetadataStorageEnum,
    default: null,
    nullable: true,
  })
  metadataStorage: MetadataStorageEnum;

  @Column({ nullable: true })
  @Exclude()
  editionUUID: string;

  @Column({ nullable: true })
  creator: string;

  @Column({ nullable: true, length: 42 })
  owner: string;

  @Column({
    nullable: true,
    length: 42,
  })
  mintToOtherWallet: string;

  @Column({ default: 1 })
  amount: number;

  @Column({ default: 'ERC721' })
  standard: string;

  @Column({
    nullable: true,
  })
  licenseUri: string;

  @Column({ default: true })
  @Exclude()
  refreshed: boolean;

  @OneToMany(
    () => NftFile,
    nftFile => nftFile.nft,
    {
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    }
  )
  files: NftFile[];

  @OneToMany(
    () => NftTransaction,
    nftTransaction => nftTransaction.nft,
    {
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    }
  )
  transactions: NftTransaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
    
}
