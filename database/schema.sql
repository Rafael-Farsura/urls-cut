-- ============================================
-- Schema do Banco de Dados - URL Shortener
-- ============================================

-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Tabela: users
-- Descrição: Armazena informações dos usuários
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Índices para users
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- ============================================
-- Tabela: short_urls
-- Descrição: Armazena URLs encurtadas
-- ============================================
CREATE TABLE short_urls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_url TEXT NOT NULL,
    short_code VARCHAR(6) NOT NULL UNIQUE,
    user_id UUID NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Foreign Key
    CONSTRAINT fk_short_urls_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT chk_short_code_length 
        CHECK (LENGTH(short_code) <= 6),
    CONSTRAINT chk_original_url_not_empty 
        CHECK (LENGTH(TRIM(original_url)) > 0)
);

-- Índices para short_urls
CREATE UNIQUE INDEX idx_short_urls_code_active 
    ON short_urls(short_code) 
    WHERE deleted_at IS NULL;
CREATE INDEX idx_short_urls_user_id ON short_urls(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_short_urls_deleted_at ON short_urls(deleted_at);
CREATE INDEX idx_short_urls_created_at ON short_urls(created_at);

-- ============================================
-- Tabela: clicks
-- Descrição: Armazena registros de cliques nas URLs encurtadas
-- ============================================
CREATE TABLE clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    short_url_id UUID NOT NULL,
    ip_address VARCHAR(45) NULL, -- IPv6 pode ter até 45 caracteres
    user_agent TEXT NULL,
    clicked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key
    CONSTRAINT fk_clicks_short_url 
        FOREIGN KEY (short_url_id) 
        REFERENCES short_urls(id) 
        ON DELETE CASCADE
);

-- Índices para clicks
CREATE INDEX idx_clicks_short_url_id ON clicks(short_url_id);
CREATE INDEX idx_clicks_clicked_at ON clicks(clicked_at);
CREATE INDEX idx_clicks_short_url_clicked_at ON clicks(short_url_id, clicked_at);

-- ============================================
-- Função: Atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_short_urls_updated_at 
    BEFORE UPDATE ON short_urls 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- View: short_urls_with_stats
-- Descrição: View para facilitar consultas com estatísticas de cliques
-- ============================================
CREATE OR REPLACE VIEW short_urls_with_stats AS
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
    short_urls su
LEFT JOIN 
    clicks c ON su.id = c.short_url_id
WHERE 
    su.deleted_at IS NULL
GROUP BY 
    su.id, su.original_url, su.short_code, su.user_id, su.created_at, su.updated_at, su.deleted_at;

-- ============================================
-- Comentários nas tabelas
-- ============================================
COMMENT ON TABLE users IS 'Tabela de usuários do sistema';
COMMENT ON TABLE short_urls IS 'Tabela de URLs encurtadas';
COMMENT ON TABLE clicks IS 'Tabela de registros de cliques';

COMMENT ON COLUMN users.deleted_at IS 'Data de exclusão lógica. NULL = ativo, preenchido = deletado';
COMMENT ON COLUMN short_urls.deleted_at IS 'Data de exclusão lógica. NULL = ativo, preenchido = deletado';
COMMENT ON COLUMN short_urls.user_id IS 'ID do usuário que criou a URL. NULL = URL pública';
COMMENT ON COLUMN short_urls.short_code IS 'Código curto único (máximo 6 caracteres)';

