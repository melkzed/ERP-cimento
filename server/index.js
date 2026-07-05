import express from 'express';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { db, isEmpty, DB_PATH } from './db.js';
import { seed } from './seed.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

if (isEmpty()) {
  seed(db);
  console.log('Banco vazio — dados de demonstração inseridos.');
}

const app = express();
app.use(express.json());

// Converte erros de constraint do SQLite em respostas 409 legíveis.
const wrap = (fn) => (req, res) => {
  try {
    fn(req, res);
  } catch (err) {
    if (String(err.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'Registro duplicado: já existe um cadastro com esses dados.' });
    }
    if (String(err.message).includes('FOREIGN KEY')) {
      return res.status(409).json({ error: 'Registro em uso por outro cadastro — remova as dependências primeiro.' });
    }
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// SELECT reutilizável de ofertas com custo efetivo (juros da condição aplicados).
const OFERTA_SELECT = `
  SELECT fv.id, fv.fornecedor_id, fv.variacao_id, fv.condicao_pagamento_id,
         fv.preco_custo, fv.prazo_entrega_dias, fv.forma_cobranca,
         fv.quantidade_minima, fv.codigo_no_fornecedor,
         f.nome_fantasia AS fornecedor, f.razao_social,
         c.nome AS condicao, c.num_parcelas, c.taxa_juros, c.dias_carencia,
         ROUND(fv.preco_custo * (1 + c.taxa_juros / 100.0), 2) AS custo_efetivo,
         v.sku, p.nome AS produto
    FROM fornecedor_variacao fv
    JOIN fornecedores f ON f.id = fv.fornecedor_id
    JOIN condicoes_pagamento c ON c.id = fv.condicao_pagamento_id
    JOIN variacoes v ON v.id = fv.variacao_id
    JOIN produtos p ON p.id = v.produto_id
`;

const valoresDaVariacao = db.prepare(`
  SELECT a.nome AS atributo, va.valor, va.id AS valor_atributo_id
    FROM variacao_valores vv
    JOIN valores_atributo va ON va.id = vv.valor_atributo_id
    JOIN atributos a ON a.id = va.atributo_id
   WHERE vv.variacao_id = ?
   ORDER BY a.nome
`);

const variacaoCompleta = (v) => ({
  ...v,
  valores: valoresDaVariacao.all(v.id),
});

// ---------------------------------------------------------------- Dashboard
app.get('/api/dashboard', wrap((req, res) => {
  const count = (sql) => db.prepare(sql).get().n;
  const estoqueBaixo = db.prepare(`
    SELECT v.id, v.sku, v.estoque, v.estoque_minimo, p.nome AS produto, p.unidade
      FROM variacoes v JOIN produtos p ON p.id = v.produto_id
     WHERE v.estoque <= v.estoque_minimo
     ORDER BY (v.estoque * 1.0 / NULLIF(v.estoque_minimo, 0)) ASC
  `).all();
  const melhoresOfertas = db.prepare(`
    ${OFERTA_SELECT}
    WHERE fv.id IN (
      SELECT fv2.id FROM fornecedor_variacao fv2
      JOIN condicoes_pagamento c2 ON c2.id = fv2.condicao_pagamento_id
      GROUP BY fv2.variacao_id
      HAVING fv2.preco_custo * (1 + c2.taxa_juros / 100.0)
             = MIN(fv2.preco_custo * (1 + c2.taxa_juros / 100.0))
    )
    ORDER BY p.nome, v.sku
  `).all();
  res.json({
    produtos: count('SELECT COUNT(*) n FROM produtos'),
    variacoes: count('SELECT COUNT(*) n FROM variacoes'),
    fornecedores: count('SELECT COUNT(*) n FROM fornecedores'),
    ofertas: count('SELECT COUNT(*) n FROM fornecedor_variacao'),
    atributos: count('SELECT COUNT(*) n FROM atributos'),
    condicoes: count('SELECT COUNT(*) n FROM condicoes_pagamento'),
    estoqueBaixo,
    melhoresOfertas,
  });
}));

// ---------------------------------------------------------------- Atributos
app.get('/api/atributos', wrap((req, res) => {
  const atributos = db.prepare('SELECT * FROM atributos ORDER BY nome').all();
  const valores = db.prepare(`
    SELECT va.*, (SELECT COUNT(*) FROM variacao_valores vv WHERE vv.valor_atributo_id = va.id) AS em_uso
      FROM valores_atributo va ORDER BY va.valor
  `).all();
  res.json(atributos.map((a) => ({ ...a, valores: valores.filter((v) => v.atributo_id === a.id) })));
}));

app.post('/api/atributos', wrap((req, res) => {
  const { nome } = req.body;
  if (!nome?.trim()) return res.status(400).json({ error: 'Informe o nome do atributo.' });
  const r = db.prepare('INSERT INTO atributos (nome) VALUES (?)').run(nome.trim());
  res.status(201).json({ id: r.lastInsertRowid });
}));

app.delete('/api/atributos/:id', wrap((req, res) => {
  db.prepare('DELETE FROM atributos WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
}));

app.post('/api/atributos/:id/valores', wrap((req, res) => {
  const { valor } = req.body;
  if (!valor?.trim()) return res.status(400).json({ error: 'Informe o valor.' });
  const r = db.prepare('INSERT INTO valores_atributo (atributo_id, valor) VALUES (?, ?)').run(req.params.id, valor.trim());
  res.status(201).json({ id: r.lastInsertRowid });
}));

app.delete('/api/valores/:id', wrap((req, res) => {
  db.prepare('DELETE FROM valores_atributo WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
}));

// ---------------------------------------------------------------- Produtos
app.get('/api/produtos', wrap((req, res) => {
  res.json(db.prepare(`
    SELECT p.*,
           (SELECT COUNT(*) FROM variacoes v WHERE v.produto_id = p.id) AS num_variacoes,
           (SELECT COALESCE(SUM(v.estoque), 0) FROM variacoes v WHERE v.produto_id = p.id) AS estoque_total
      FROM produtos p ORDER BY p.nome
  `).all());
}));

app.post('/api/produtos', wrap((req, res) => {
  const { nome, descricao, categoria, unidade } = req.body;
  if (!nome?.trim()) return res.status(400).json({ error: 'Informe o nome do produto.' });
  const r = db.prepare('INSERT INTO produtos (nome, descricao, categoria, unidade) VALUES (?, ?, ?, ?)')
    .run(nome.trim(), descricao || null, categoria || null, unidade || 'UN');
  res.status(201).json({ id: r.lastInsertRowid });
}));

app.get('/api/produtos/:id', wrap((req, res) => {
  const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(req.params.id);
  if (!produto) return res.status(404).json({ error: 'Produto não encontrado.' });
  const variacoes = db.prepare(`
    SELECT v.*,
           (SELECT COUNT(*) FROM fornecedor_variacao fv WHERE fv.variacao_id = v.id) AS num_ofertas,
           (SELECT MIN(ROUND(fv.preco_custo * (1 + c.taxa_juros / 100.0), 2))
              FROM fornecedor_variacao fv
              JOIN condicoes_pagamento c ON c.id = fv.condicao_pagamento_id
             WHERE fv.variacao_id = v.id) AS melhor_custo
      FROM variacoes v WHERE v.produto_id = ? ORDER BY v.sku
  `).all(req.params.id).map(variacaoCompleta);
  res.json({ ...produto, variacoes });
}));

app.delete('/api/produtos/:id', wrap((req, res) => {
  db.prepare('DELETE FROM produtos WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
}));

// ---------------------------------------------------------------- Variações
app.get('/api/variacoes', wrap((req, res) => {
  const rows = db.prepare(`
    SELECT v.*, p.nome AS produto, p.unidade
      FROM variacoes v JOIN produtos p ON p.id = v.produto_id
     ORDER BY p.nome, v.sku
  `).all().map(variacaoCompleta);
  res.json(rows);
}));

app.post('/api/produtos/:id/variacoes', wrap((req, res) => {
  const { sku, estoque = 0, estoque_minimo = 0, preco_venda = null, valor_atributo_ids = [] } = req.body;
  if (!sku?.trim()) return res.status(400).json({ error: 'Informe o SKU.' });
  const insVar = db.prepare('INSERT INTO variacoes (produto_id, sku, estoque, estoque_minimo, preco_venda) VALUES (?, ?, ?, ?, ?)');
  const insVV = db.prepare('INSERT INTO variacao_valores (variacao_id, valor_atributo_id) VALUES (?, ?)');
  db.exec('BEGIN');
  try {
    const varId = insVar.run(req.params.id, sku.trim(), estoque, estoque_minimo, preco_venda).lastInsertRowid;
    for (const vid of valor_atributo_ids) insVV.run(varId, vid);
    db.exec('COMMIT');
    res.status(201).json({ id: varId });
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}));

app.patch('/api/variacoes/:id', wrap((req, res) => {
  const atual = db.prepare('SELECT * FROM variacoes WHERE id = ?').get(req.params.id);
  if (!atual) return res.status(404).json({ error: 'Variação não encontrada.' });
  const { estoque, estoque_minimo, preco_venda } = { ...atual, ...req.body };
  db.prepare('UPDATE variacoes SET estoque = ?, estoque_minimo = ?, preco_venda = ? WHERE id = ?')
    .run(estoque, estoque_minimo, preco_venda, req.params.id);
  res.json({ ok: true });
}));

app.delete('/api/variacoes/:id', wrap((req, res) => {
  db.prepare('DELETE FROM variacoes WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
}));

// ---------------------------------------------------------------- Fornecedores
app.get('/api/fornecedores', wrap((req, res) => {
  res.json(db.prepare(`
    SELECT f.*, (SELECT COUNT(*) FROM fornecedor_variacao fv WHERE fv.fornecedor_id = f.id) AS num_ofertas
      FROM fornecedores f ORDER BY f.nome_fantasia
  `).all());
}));

app.post('/api/fornecedores', wrap((req, res) => {
  const { razao_social, nome_fantasia, cnpj, email, telefone, cidade, uf } = req.body;
  if (!razao_social?.trim()) return res.status(400).json({ error: 'Informe a razão social.' });
  const r = db.prepare('INSERT INTO fornecedores (razao_social, nome_fantasia, cnpj, email, telefone, cidade, uf) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(razao_social.trim(), nome_fantasia || razao_social.trim(), cnpj || null, email || null, telefone || null, cidade || null, uf || null);
  res.status(201).json({ id: r.lastInsertRowid });
}));

app.get('/api/fornecedores/:id', wrap((req, res) => {
  const fornecedor = db.prepare('SELECT * FROM fornecedores WHERE id = ?').get(req.params.id);
  if (!fornecedor) return res.status(404).json({ error: 'Fornecedor não encontrado.' });
  const ofertas = db.prepare(`${OFERTA_SELECT} WHERE fv.fornecedor_id = ? ORDER BY p.nome, v.sku`).all(req.params.id);
  res.json({ ...fornecedor, ofertas });
}));

app.delete('/api/fornecedores/:id', wrap((req, res) => {
  db.prepare('DELETE FROM fornecedores WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
}));

// ---------------------------------------------------------------- Condições de pagamento
app.get('/api/condicoes', wrap((req, res) => {
  res.json(db.prepare(`
    SELECT c.*, (SELECT COUNT(*) FROM fornecedor_variacao fv WHERE fv.condicao_pagamento_id = c.id) AS em_uso
      FROM condicoes_pagamento c ORDER BY c.num_parcelas, c.nome
  `).all());
}));

app.post('/api/condicoes', wrap((req, res) => {
  const { nome, num_parcelas = 1, taxa_juros = 0, dias_carencia = 0 } = req.body;
  if (!nome?.trim()) return res.status(400).json({ error: 'Informe o nome da condição.' });
  const r = db.prepare('INSERT INTO condicoes_pagamento (nome, num_parcelas, taxa_juros, dias_carencia) VALUES (?, ?, ?, ?)')
    .run(nome.trim(), num_parcelas, taxa_juros, dias_carencia);
  res.status(201).json({ id: r.lastInsertRowid });
}));

app.delete('/api/condicoes/:id', wrap((req, res) => {
  db.prepare('DELETE FROM condicoes_pagamento WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
}));

// ---------------------------------------------------------------- Ofertas (fornecedor × variação)
app.get('/api/ofertas', wrap((req, res) => {
  const { variacao_id } = req.query;
  const sql = `${OFERTA_SELECT} ${variacao_id ? 'WHERE fv.variacao_id = ?' : ''} ORDER BY custo_efetivo`;
  res.json(variacao_id ? db.prepare(sql).all(variacao_id) : db.prepare(sql).all());
}));

app.post('/api/ofertas', wrap((req, res) => {
  const { fornecedor_id, variacao_id, condicao_pagamento_id, preco_custo, prazo_entrega_dias = 0, forma_cobranca = 'PIX', quantidade_minima = 1, codigo_no_fornecedor = null } = req.body;
  if (!fornecedor_id || !variacao_id || !condicao_pagamento_id || preco_custo == null) {
    return res.status(400).json({ error: 'Fornecedor, variação, condição de pagamento e preço são obrigatórios.' });
  }
  const r = db.prepare(
    'INSERT INTO fornecedor_variacao (fornecedor_id, variacao_id, condicao_pagamento_id, preco_custo, prazo_entrega_dias, forma_cobranca, quantidade_minima, codigo_no_fornecedor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(fornecedor_id, variacao_id, condicao_pagamento_id, preco_custo, prazo_entrega_dias, forma_cobranca, quantidade_minima, codigo_no_fornecedor);
  res.status(201).json({ id: r.lastInsertRowid });
}));

app.delete('/api/ofertas/:id', wrap((req, res) => {
  db.prepare('DELETE FROM fornecedor_variacao WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
}));

// Serve o frontend compilado quando existir (npm run build && npm run server).
const dist = join(__dirname, '..', 'dist');
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(join(dist, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`API do ERP rodando em http://localhost:${PORT} (banco: ${DB_PATH})`);
});
