import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialSchema1734120000000 implements MigrationInterface {
  name = 'CreateInitialSchema1734120000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar extensão UUID
    await queryRunner.query(
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
    );

    // Verificar se a tabela users já existe
    const usersTable = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )
    `);

    if (usersTable[0].exists) {
      // Tabelas já existem, pular criação
      return;
    }

    // Criar tabela users
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "password_hash" VARCHAR(255) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMP NULL
      )
    `);

    // Índices para users
    await queryRunner.query(
      `CREATE INDEX "idx_users_email" ON "users"("email") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_users_deleted_at" ON "users"("deleted_at")`,
    );

    // Criar tabela short_urls
    await queryRunner.query(`
      CREATE TABLE "short_urls" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "original_url" TEXT NOT NULL,
        "short_code" VARCHAR(6) NOT NULL UNIQUE,
        "user_id" UUID NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMP NULL,
        CONSTRAINT "fk_short_urls_user" 
          FOREIGN KEY ("user_id") 
          REFERENCES "users"("id") 
          ON DELETE SET NULL,
        CONSTRAINT "chk_short_code_length" 
          CHECK (LENGTH("short_code") <= 6),
        CONSTRAINT "chk_original_url_not_empty" 
          CHECK (LENGTH(TRIM("original_url")) > 0)
      )
    `);

    // Índices para short_urls
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_short_urls_code_active" 
       ON "short_urls"("short_code") 
       WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_short_urls_user_id" 
       ON "short_urls"("user_id") 
       WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_short_urls_deleted_at" ON "short_urls"("deleted_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_short_urls_created_at" ON "short_urls"("created_at")`,
    );

    // Criar tabela clicks
    await queryRunner.query(`
      CREATE TABLE "clicks" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "short_url_id" UUID NOT NULL,
        "ip_address" VARCHAR(45) NULL,
        "user_agent" TEXT NULL,
        "clicked_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "fk_clicks_short_url" 
          FOREIGN KEY ("short_url_id") 
          REFERENCES "short_urls"("id") 
          ON DELETE CASCADE
      )
    `);

    // Índices para clicks
    await queryRunner.query(
      `CREATE INDEX "idx_clicks_short_url_id" ON "clicks"("short_url_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_clicks_clicked_at" ON "clicks"("clicked_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_clicks_short_url_clicked_at" 
       ON "clicks"("short_url_id", "clicked_at")`,
    );

    // Criar função para atualizar updated_at
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // Criar triggers para updated_at
    await queryRunner.query(`
      CREATE TRIGGER update_users_updated_at 
        BEFORE UPDATE ON "users" 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column()
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_short_urls_updated_at 
        BEFORE UPDATE ON "short_urls" 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column()
    `);

    // Criar view short_urls_with_stats
    await queryRunner.query(`
      CREATE OR REPLACE VIEW "short_urls_with_stats" AS
      SELECT 
        su.id,
        su.original_url,
        su.short_code,
        su.user_id,
        su.created_at,
        su.updated_at,
        su.deleted_at,
        COUNT(c.id) AS click_count
      FROM 
        "short_urls" su
      LEFT JOIN 
        "clicks" c ON su.id = c.short_url_id
      WHERE 
        su.deleted_at IS NULL
      GROUP BY 
        su.id, su.original_url, su.short_code, su.user_id, su.created_at, su.updated_at, su.deleted_at
    `);

    // Adicionar comentários nas tabelas
    await queryRunner.query(
      `COMMENT ON TABLE "users" IS 'Tabela de usuários do sistema'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "short_urls" IS 'Tabela de URLs encurtadas'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "clicks" IS 'Tabela de registros de cliques'`,
    );

    await queryRunner.query(
      `COMMENT ON COLUMN "users"."deleted_at" IS 'Data de exclusão lógica. NULL = ativo, preenchido = deletado'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "short_urls"."deleted_at" IS 'Data de exclusão lógica. NULL = ativo, preenchido = deletado'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "short_urls"."user_id" IS 'ID do usuário que criou a URL. NULL = URL pública'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "short_urls"."short_code" IS 'Código curto único (máximo 6 caracteres)'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover view
    await queryRunner.query(`DROP VIEW IF EXISTS "short_urls_with_stats"`);

    // Remover triggers
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_short_urls_updated_at ON "short_urls"`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_users_updated_at ON "users"`,
    );

    // Remover função
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS update_updated_at_column()`,
    );

    // Remover tabelas (ordem inversa devido a foreign keys)
    await queryRunner.query(`DROP TABLE IF EXISTS "clicks"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "short_urls"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

    // Remover extensão
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
