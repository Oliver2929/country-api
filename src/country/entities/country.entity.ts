import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  capital: string;

  @Column({ nullable: true })
  region: string;

  @Column()
  population: number;

  @Column({ nullable: true })
  currency_code: string;

  @Column({ type: 'float', nullable: true })
  exchange_rate: number;

  @Column({ type: 'float', nullable: true })
  estimated_gdp: number | null;

  @Column({ nullable: true })
  flag_url: string;

  @Column({ type: 'timestamp' })
  last_refreshed_at: Date;
}
