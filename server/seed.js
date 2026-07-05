// Carga inicial de demonstração — materiais de construção.
export function seed(db) {
  const insAttr = db.prepare('INSERT INTO atributos (nome) VALUES (?)');
  const insVal = db.prepare('INSERT INTO valores_atributo (atributo_id, valor) VALUES (?, ?)');
  const insProd = db.prepare('INSERT INTO produtos (nome, descricao, categoria, unidade) VALUES (?, ?, ?, ?)');
  const insVar = db.prepare('INSERT INTO variacoes (produto_id, sku, estoque, estoque_minimo, preco_venda) VALUES (?, ?, ?, ?, ?)');
  const insVV = db.prepare('INSERT INTO variacao_valores (variacao_id, valor_atributo_id) VALUES (?, ?)');
  const insForn = db.prepare('INSERT INTO fornecedores (razao_social, nome_fantasia, cnpj, email, telefone, cidade, uf) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const insCond = db.prepare('INSERT INTO condicoes_pagamento (nome, num_parcelas, taxa_juros, dias_carencia) VALUES (?, ?, ?, ?)');
  const insOferta = db.prepare(
    'INSERT INTO fornecedor_variacao (fornecedor_id, variacao_id, condicao_pagamento_id, preco_custo, prazo_entrega_dias, forma_cobranca, quantidade_minima, codigo_no_fornecedor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );

  // --- Atributos e valores ---
  const val = {}; // "Tipo:CP-II" -> id
  const atributos = {
    Tipo: ['CP-II', 'CP-IV', 'CP-V ARI', 'AC-I', 'AC-II', 'AC-III'],
    Peso: ['20kg', '25kg', '40kg', '50kg'],
    Bitola: ['8mm', '10mm', '12.5mm'],
  };
  for (const [nome, valores] of Object.entries(atributos)) {
    const attrId = insAttr.run(nome).lastInsertRowid;
    for (const v of valores) {
      val[`${nome}:${v}`] = insVal.run(attrId, v).lastInsertRowid;
    }
  }

  // --- Produtos e variações (SKUs) ---
  const mkVariacao = (produtoId, sku, valores, estoque, minimo, precoVenda) => {
    const varId = insVar.run(produtoId, sku, estoque, minimo, precoVenda).lastInsertRowid;
    for (const chave of valores) insVV.run(varId, val[chave]);
    return varId;
  };

  const cimento = insProd.run('Cimento Portland', 'Cimento Portland para uso geral em obras.', 'Cimento', 'SC').lastInsertRowid;
  const skus = {};
  skus['CIM-CP2-50'] = mkVariacao(cimento, 'CIM-CP2-50', ['Tipo:CP-II', 'Peso:50kg'], 320, 100, 39.9);
  skus['CIM-CP2-25'] = mkVariacao(cimento, 'CIM-CP2-25', ['Tipo:CP-II', 'Peso:25kg'], 180, 60, 24.9);
  skus['CIM-CP4-50'] = mkVariacao(cimento, 'CIM-CP4-50', ['Tipo:CP-IV', 'Peso:50kg'], 90, 50, 42.5);
  skus['CIM-CP5-40'] = mkVariacao(cimento, 'CIM-CP5-40', ['Tipo:CP-V ARI', 'Peso:40kg'], 45, 40, 46.0);

  const argamassa = insProd.run('Argamassa Colante', 'Argamassa colante para assentamento de revestimentos.', 'Argamassa', 'SC').lastInsertRowid;
  skus['ARG-AC1-20'] = mkVariacao(argamassa, 'ARG-AC1-20', ['Tipo:AC-I', 'Peso:20kg'], 240, 80, 18.9);
  skus['ARG-AC2-20'] = mkVariacao(argamassa, 'ARG-AC2-20', ['Tipo:AC-II', 'Peso:20kg'], 150, 60, 26.5);
  skus['ARG-AC3-20'] = mkVariacao(argamassa, 'ARG-AC3-20', ['Tipo:AC-III', 'Peso:20kg'], 70, 40, 38.0);

  const vergalhao = insProd.run('Vergalhão CA-50 12m', 'Barra de aço nervurada CA-50 com 12 metros.', 'Aço', 'BR').lastInsertRowid;
  skus['VRG-80'] = mkVariacao(vergalhao, 'VRG-80', ['Bitola:8mm'], 400, 120, 42.0);
  skus['VRG-100'] = mkVariacao(vergalhao, 'VRG-100', ['Bitola:10mm'], 260, 100, 63.0);
  skus['VRG-125'] = mkVariacao(vergalhao, 'VRG-125', ['Bitola:12.5mm'], 130, 60, 96.0);

  // --- Fornecedores ---
  const votorantim = insForn.run('Votorantim Cimentos S.A.', 'Votorantim', '01.637.895/0001-32', 'vendas@vcimentos.com.br', '(11) 4586-2000', 'São Paulo', 'SP').lastInsertRowid;
  const mizu = insForn.run('Mizu Cimentos Especiais Ltda', 'Mizu', '10.550.201/0001-15', 'comercial@mizu.com.br', '(79) 3251-8800', 'Aracaju', 'SE').lastInsertRowid;
  const intercement = insForn.run('InterCement Brasil S.A.', 'InterCement', '62.258.884/0001-36', 'pedidos@intercement.com', '(11) 3718-4200', 'São Paulo', 'SP').lastInsertRowid;
  const acoforte = insForn.run('Aço Forte Distribuidora Ltda', 'Aço Forte', '23.410.577/0001-90', 'vendas@acoforte.com.br', '(31) 3333-7410', 'Contagem', 'MG').lastInsertRowid;

  // --- Condições de pagamento (catálogo reutilizável) ---
  const aVista = insCond.run('À vista', 1, 0, 0).lastInsertRowid;
  const d30 = insCond.run('30 dias', 1, 0, 30).lastInsertRowid;
  const d3060 = insCond.run('30/60 dias', 2, 2.0, 30).lastInsertRowid;
  const d306090 = insCond.run('30/60/90 dias', 3, 4.5, 30).lastInsertRowid;
  const cartao3x = insCond.run('Cartão 3x', 3, 3.2, 0).lastInsertRowid;

  // --- Ofertas: fornecedor × variação × condição ---
  const ofertas = [
    // SKU, fornecedor, condição, custo, prazo, forma, qtd mín, cód. fornecedor
    ['CIM-CP2-50', votorantim, aVista, 27.4, 3, 'PIX', 100, 'VOT-CP2-50'],
    ['CIM-CP2-50', votorantim, d306090, 28.9, 3, 'Boleto', 100, 'VOT-CP2-50'],
    ['CIM-CP2-50', mizu, aVista, 26.8, 7, 'PIX', 200, 'MZ-1150'],
    ['CIM-CP2-50', intercement, d3060, 27.9, 5, 'Boleto', 150, 'IC-CP2B50'],
    ['CIM-CP2-25', votorantim, aVista, 16.2, 3, 'PIX', 100, 'VOT-CP2-25'],
    ['CIM-CP2-25', mizu, d30, 15.9, 7, 'Boleto', 150, 'MZ-1125'],
    ['CIM-CP4-50', intercement, aVista, 30.5, 5, 'PIX', 100, 'IC-CP4B50'],
    ['CIM-CP4-50', mizu, d3060, 31.2, 7, 'Boleto', 100, 'MZ-1450'],
    ['CIM-CP5-40', votorantim, d30, 33.8, 4, 'Boleto', 60, 'VOT-CP5-40'],
    ['ARG-AC1-20', intercement, aVista, 12.1, 5, 'PIX', 50, 'IC-AC1'],
    ['ARG-AC1-20', mizu, cartao3x, 12.9, 7, 'Cartão', 50, 'MZ-AC1'],
    ['ARG-AC2-20', intercement, d3060, 17.4, 5, 'Boleto', 50, 'IC-AC2'],
    ['ARG-AC3-20', intercement, d306090, 25.9, 5, 'Boleto', 40, 'IC-AC3'],
    ['VRG-80', acoforte, aVista, 29.9, 2, 'PIX', 50, 'AF-CA50-80'],
    ['VRG-80', acoforte, d306090, 31.5, 2, 'Boleto', 50, 'AF-CA50-80'],
    ['VRG-100', acoforte, aVista, 45.2, 2, 'PIX', 40, 'AF-CA50-100'],
    ['VRG-125', acoforte, d3060, 69.8, 2, 'Boleto', 20, 'AF-CA50-125'],
  ];
  for (const [sku, forn, cond, custo, prazo, forma, qtd, cod] of ofertas) {
    insOferta.run(forn, skus[sku], cond, custo, prazo, forma, qtd, cod);
  }
}
