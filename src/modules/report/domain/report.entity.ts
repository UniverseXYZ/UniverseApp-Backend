import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  schema: 'universe-backend',
})
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  userAddress: string;

  @Column()
  collectionAddress: string;

  @Column({
    nullable: true,
  })
  tokenId: string;

  @Column({
    nullable: true,
  })
  description: string;

  @Column({
    nullable: true,
  })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}
