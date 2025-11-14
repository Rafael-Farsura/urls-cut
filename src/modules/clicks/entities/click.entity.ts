import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { ShortUrl } from '../../urls/entities/short-url.entity';

@Entity('clicks')
@Index('idx_clicks_short_url_id', ['shortUrlId'])
@Index('idx_clicks_clicked_at', ['clickedAt'])
@Index('idx_clicks_short_url_clicked_at', ['shortUrlId', 'clickedAt'])
export class Click {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'short_url_id' })
  shortUrlId: string;

  @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' })
  ipAddress: string | null;

  @Column({ type: 'text', nullable: true, name: 'user_agent' })
  userAgent: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'clicked_at' })
  clickedAt: Date;

  // Relacionamentos
  @ManyToOne(() => ShortUrl, (shortUrl) => shortUrl.clicks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'short_url_id' })
  shortUrl: ShortUrl;
}

