import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
  Check,
} from 'typeorm';
import { Click } from '../../clicks/entities/click.entity';

@Entity('short_urls')
@Index('idx_short_urls_code_active', ['shortCode'], {
  unique: true,
  where: 'deleted_at IS NULL',
})
@Index('idx_short_urls_user_id', ['userId'], {
  where: 'deleted_at IS NULL',
})
@Index('idx_short_urls_deleted_at', ['deletedAt'])
@Index('idx_short_urls_created_at', ['createdAt'])
@Check(`"short_code" IS NULL OR LENGTH("short_code") <= 6`)
@Check(`"original_url" IS NULL OR LENGTH(TRIM("original_url")) > 0`)
export class ShortUrl {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'original_url' })
  originalUrl: string;

  @Column({ type: 'varchar', length: 6, unique: true, name: 'short_code' })
  shortCode: string;

  @Column({ type: 'uuid', nullable: true, name: 'user_id' })
  userId: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt: Date | null;

  // Nota: Relacionamento com User removido pois User está em outro serviço (auth-service)
  // O userId é mantido como string para referência

  @OneToMany(() => Click, click => click.shortUrl)
  clicks: Click[];
}
