import {
  Column,
  CreateDateColumn,
  Entity, OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Nft } from './nft.entity';

@Entity()
export class NftCollection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: true })
  address?: string;

  @Column({nullable: true })
  name?: string;

  @Column({nullable: true })
  symbol?: string;

  @Column({nullable: true })
  description?: string;

  @Column()
  tokenName: string;

  @OneToMany(() => Nft, (nft) => nft.collection, {
    cascade: true,
  })
  collectibles: Nft[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
