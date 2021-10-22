import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * This entity is created by the scraper, not the backend.
 */
@Entity({
  schema: 'public',
  name: 'monitored_nfts',
})
export class MonitoredNfts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  created_at: Date;
}
