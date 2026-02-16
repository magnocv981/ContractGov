
-- Tabela de Contratos
CREATE TABLE IF NOT EXISTS contratos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    cliente_orgao TEXT NOT NULL,
    cnpj TEXT,
    estado TEXT NOT NULL,
    valor_global DECIMAL(15, 2) NOT NULL DEFAULT 0,
    status TEXT CHECK (status IN ('Ativo', 'Pendente', 'Encerrado', 'Cancelado')) NOT NULL DEFAULT 'Pendente',
    qtde_plataformas INTEGER NOT NULL DEFAULT 0,
    qtde_elevadores INTEGER NOT NULL DEFAULT 0,
    instalados_plataformas INTEGER NOT NULL DEFAULT 0,
    instalados_elevadores INTEGER NOT NULL DEFAULT 0,
    objeto_contrato TEXT,
    data_inicio DATE,
    data_encerramento DATE,
    prazo_execucao DATE,
    data_conclusao_instalacao DATE,
    prazo_garantia_dias INTEGER DEFAULT 365,
    created_at TIMESTAMPTZ DEFAULT now()
 );

-- Tabela de Contatos
CREATE TABLE IF NOT EXISTS contatos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contrato_id UUID REFERENCES contratos(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contatos ENABLE ROW LEVEL SECURITY;

-- Políticas para Contratos
CREATE POLICY "Usuários podem ver seus próprios contratos" ON contratos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios contratos" ON contratos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios contratos" ON contratos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios contratos" ON contratos
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para Contatos (via contrato_id)
CREATE POLICY "Usuários podem ver contatos de seus contratos" ON contatos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM contratos 
            WHERE contratos.id = contatos.contrato_id 
            AND contratos.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem inserir contatos em seus contratos" ON contatos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM contratos 
            WHERE contratos.id = contatos.contrato_id 
            AND contratos.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem atualizar contatos de seus contratos" ON contatos
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM contratos 
            WHERE contratos.id = contatos.contrato_id 
            AND contratos.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem deletar contatos de seus contratos" ON contatos
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM contratos 
            WHERE contratos.id = contatos.contrato_id 
            AND contratos.user_id = auth.uid()
        )
    );
-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    cnpj TEXT,
    endereco TEXT,
    endereco_numero TEXT,
    endereco_bairro TEXT,
    endereco_cep TEXT,
    endereco_cidade TEXT,
    endereco_estado TEXT,
    contato_nome TEXT,
    telefone TEXT,
    whatsapp TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar colunas se não existirem
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'clientes' AND COLUMN_NAME = 'endereco_numero') THEN
        ALTER TABLE clientes ADD COLUMN endereco_numero TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'clientes' AND COLUMN_NAME = 'endereco_bairro') THEN
        ALTER TABLE clientes ADD COLUMN endereco_bairro TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'clientes' AND COLUMN_NAME = 'endereco_cep') THEN
        ALTER TABLE clientes ADD COLUMN endereco_cep TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'clientes' AND COLUMN_NAME = 'endereco_cidade') THEN
        ALTER TABLE clientes ADD COLUMN endereco_cidade TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'clientes' AND COLUMN_NAME = 'endereco_estado') THEN
        ALTER TABLE clientes ADD COLUMN endereco_estado TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'clientes' AND COLUMN_NAME = 'contato_nome') THEN
        ALTER TABLE clientes ADD COLUMN contato_nome TEXT;
    END IF;
END $$;

-- RLS para Clientes
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios clientes" ON clientes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios clientes" ON clientes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios clientes" ON clientes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios clientes" ON clientes
    FOR DELETE USING (auth.uid() = user_id);
