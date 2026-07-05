-- =====================================================================
-- ERP Cimento — Schema do banco local (SQLite)
--
-- Modelo em camadas:
--   produtos            -> conceito genérico (sem preço/estoque)
--   atributos           -> eixos de variação dinâmicos (Tipo, Peso, ...)
--   valores_atributo    -> valores possíveis de cada atributo
--   variacoes           -> SKU concreto vendável (combinação de valores)
--   variacao_valores    -> quais valores compõem cada SKU
--   fornecedores        -> cadastro de fornecedores
--   condicoes_pagamento -> catálogo reutilizável de condições
--   fornecedor_variacao -> pivot N:N com preço/prazo/condição por fornecedor
-- =====================================================================

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS produtos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nome        TEXT NOT NULL,
  descricao   TEXT,
  categoria   TEXT,
  unidade     TEXT NOT NULL DEFAULT 'UN',
  ativo       INTEGER NOT NULL DEFAULT 1,
  criado_em   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS atributos (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS valores_atributo (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  atributo_id INTEGER NOT NULL REFERENCES atributos(id) ON DELETE CASCADE,
  valor       TEXT NOT NULL,
  UNIQUE (atributo_id, valor)
);

CREATE TABLE IF NOT EXISTS variacoes (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  produto_id     INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  sku            TEXT NOT NULL UNIQUE,
  estoque        REAL NOT NULL DEFAULT 0,
  estoque_minimo REAL NOT NULL DEFAULT 0,
  preco_venda    REAL,
  ativo          INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS variacao_valores (
  variacao_id       INTEGER NOT NULL REFERENCES variacoes(id) ON DELETE CASCADE,
  valor_atributo_id INTEGER NOT NULL REFERENCES valores_atributo(id) ON DELETE RESTRICT,
  PRIMARY KEY (variacao_id, valor_atributo_id)
);

CREATE TABLE IF NOT EXISTS fornecedores (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  razao_social  TEXT NOT NULL,
  nome_fantasia TEXT,
  cnpj          TEXT UNIQUE,
  email         TEXT,
  telefone      TEXT,
  cidade        TEXT,
  uf            TEXT,
  ativo         INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS condicoes_pagamento (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  nome          TEXT NOT NULL UNIQUE,
  num_parcelas  INTEGER NOT NULL DEFAULT 1,
  taxa_juros    REAL NOT NULL DEFAULT 0,   -- % sobre o total da compra
  dias_carencia INTEGER NOT NULL DEFAULT 0 -- dias até a 1ª parcela
);

CREATE TABLE IF NOT EXISTS fornecedor_variacao (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  fornecedor_id         INTEGER NOT NULL REFERENCES fornecedores(id) ON DELETE CASCADE,
  variacao_id           INTEGER NOT NULL REFERENCES variacoes(id) ON DELETE CASCADE,
  condicao_pagamento_id INTEGER NOT NULL REFERENCES condicoes_pagamento(id) ON DELETE RESTRICT,
  preco_custo           REAL NOT NULL CHECK (preco_custo >= 0),
  prazo_entrega_dias    INTEGER NOT NULL DEFAULT 0,
  forma_cobranca        TEXT NOT NULL DEFAULT 'PIX', -- PIX, Boleto, Cartão, Transferência
  quantidade_minima     REAL NOT NULL DEFAULT 1,
  codigo_no_fornecedor  TEXT,
  UNIQUE (fornecedor_id, variacao_id, condicao_pagamento_id)
);

CREATE INDEX IF NOT EXISTS idx_valores_atributo_atributo ON valores_atributo(atributo_id);
CREATE INDEX IF NOT EXISTS idx_variacoes_produto         ON variacoes(produto_id);
CREATE INDEX IF NOT EXISTS idx_vv_valor                  ON variacao_valores(valor_atributo_id);
CREATE INDEX IF NOT EXISTS idx_fv_variacao               ON fornecedor_variacao(variacao_id);
CREATE INDEX IF NOT EXISTS idx_fv_fornecedor             ON fornecedor_variacao(fornecedor_id);
