import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  schema: 'universe-backend',
})
export class MoralisLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'jsonb' })
  token?: any;

  @CreateDateColumn()
  createdAt: Date;
}
