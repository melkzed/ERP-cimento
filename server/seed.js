// Carga inicial de demonstração — roupas e acessórios.
export function seed(db) {
  const insCat = db.prepare('INSERT INTO categorias (nome) VALUES (?)');
  const insAttr = db.prepare('INSERT INTO atributos (nome) VALUES (?)');
  const insVal = db.prepare('INSERT INTO valores_atributo (atributo_id, valor) VALUES (?, ?)');
  const insProd = db.prepare('INSERT INTO produtos (nome, descricao, categoria_id, unidade) VALUES (?, ?, ?, ?)');
  const insVar = db.prepare('INSERT INTO variacoes (produto_id, sku, estoque, estoque_minimo, preco_venda) VALUES (?, ?, ?, ?, ?)');
  const insVV = db.prepare('INSERT INTO variacao_valores (variacao_id, valor_atributo_id) VALUES (?, ?)');
  const insForn = db.prepare('INSERT INTO fornecedores (razao_social, nome_fantasia, cnpj, email, telefone, cidade, uf) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const insCond = db.prepare('INSERT INTO condicoes_pagamento (nome, num_parcelas, taxa_juros, dias_carencia) VALUES (?, ?, ?, ?)');
  const insOferta = db.prepare(
    'INSERT INTO fornecedor_variacao (fornecedor_id, variacao_id, condicao_pagamento_id, preco_custo, prazo_entrega_dias, forma_cobranca, quantidade_minima, codigo_no_fornecedor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );

  // --- Categorias (cadastro com FK — nada de texto livre) ---
  const cat = {};
  for (const nome of ['Camisetas', 'Camisas', 'Calças', 'Vestidos', 'Calçados', 'Bolsas', 'Cintos', 'Bonés']) {
    cat[nome] = insCat.run(nome).lastInsertRowid;
  }

  // --- Atributos e valores ---
  const val = {}; // "Cor:Azul" -> id
  const atributos = {
    Cor: ['Preto', 'Branco', 'Azul', 'Vermelho', 'Bege', 'Caramelo'],
    Tamanho: ['P', 'M', 'G', 'GG'],
    Numeração: ['36', '38', '40', '42', '44'],
    Material: ['Algodão', 'Poliéster', 'Jeans', 'Couro', 'Couro sintético'],
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

  const polo = insProd.run('Camisa Polo Piquet', 'Camisa polo em piquet de algodão.', cat['Camisas'], 'UN').lastInsertRowid;
  const skus = {};
  for (const cor of ['Preto', 'Branco', 'Azul']) {
    for (const tam of ['P', 'M', 'G', 'GG']) {
      const sku = `POLO-${cor.slice(0, 3).toUpperCase()}-${tam}`;
      skus[sku] = mkVariacao(polo, sku, [`Cor:${cor}`, `Tamanho:${tam}`, 'Material:Algodão'], 20 + Math.floor(Math.random() * 30), 10, 89.9);
    }
  }

  const camiseta = insProd.run('Camiseta Básica', 'Camiseta básica gola careca 100% algodão.', cat['Camisetas'], 'UN').lastInsertRowid;
  for (const cor of ['Preto', 'Branco', 'Vermelho']) {
    for (const tam of ['P', 'M', 'G']) {
      const sku = `CMST-${cor.slice(0, 3).toUpperCase()}-${tam}`;
      skus[sku] = mkVariacao(camiseta, sku, [`Cor:${cor}`, `Tamanho:${tam}`, 'Material:Algodão'], 30 + Math.floor(Math.random() * 40), 15, 39.9);
    }
  }

  const jeans = insProd.run('Calça Jeans Slim', 'Calça jeans masculina corte slim.', cat['Calças'], 'UN').lastInsertRowid;
  for (const num of ['38', '40', '42', '44']) {
    const sku = `JEANS-${num}`;
    skus[sku] = mkVariacao(jeans, sku, [`Numeração:${num}`, 'Material:Jeans', 'Cor:Azul'], 12 + Math.floor(Math.random() * 15), 6, 159.9);
  }

  const vestido = insProd.run('Vestido Midi Floral', 'Vestido midi estampa floral, tecido leve.', cat['Vestidos'], 'UN').lastInsertRowid;
  for (const tam of ['P', 'M', 'G']) {
    const sku = `VEST-FLOR-${tam}`;
    skus[sku] = mkVariacao(vestido, sku, [`Tamanho:${tam}`, 'Material:Poliéster'], 8 + Math.floor(Math.random() * 10), 5, 189.9);
  }

  const cinto = insProd.run('Cinto de Couro Clássico', 'Cinto de couro legítimo com fivela metálica.', cat['Cintos'], 'UN').lastInsertRowid;
  for (const cor of ['Preto', 'Caramelo']) {
    const sku = `CINTO-${cor.slice(0, 3).toUpperCase()}`;
    skus[sku] = mkVariacao(cinto, sku, [`Cor:${cor}`, 'Material:Couro'], 15, 8, 79.9);
  }

  const bolsa = insProd.run('Bolsa Tote Grande', 'Bolsa tote espaçosa com alça de ombro.', cat['Bolsas'], 'UN').lastInsertRowid;
  for (const cor of ['Preto', 'Bege']) {
    const sku = `BOLSA-TOTE-${cor.slice(0, 3).toUpperCase()}`;
    skus[sku] = mkVariacao(bolsa, sku, [`Cor:${cor}`, 'Material:Couro sintético'], 10, 5, 149.9);
  }

  const bone = insProd.run('Boné Aba Curva', 'Boné aba curva com fecho ajustável, tamanho único.', cat['Bonés'], 'UN').lastInsertRowid;
  for (const cor of ['Preto', 'Azul', 'Vermelho']) {
    const sku = `BONE-${cor.slice(0, 3).toUpperCase()}`;
    skus[sku] = mkVariacao(bone, sku, [`Cor:${cor}`, 'Material:Poliéster'], 25, 10, 49.9);
  }

  // --- Fornecedores ---
  const malharia = insForn.run('Malharia Santa Rita Ltda', 'Malharia Santa Rita', '12.345.678/0001-01', 'vendas@malhariasr.com.br', '(11) 3456-7890', 'São Paulo', 'SP').lastInsertRowid;
  const textilNE = insForn.run('Têxtil Nordeste S.A.', 'Têxtil Nordeste', '23.456.789/0001-12', 'comercial@textilne.com.br', '(85) 3244-5566', 'Fortaleza', 'CE').lastInsertRowid;
  const couroCia = insForn.run('Couro & Cia Artefatos Ltda', 'Couro & Cia', '34.567.890/0001-23', 'pedidos@courocia.com.br', '(51) 3587-1122', 'Novo Hamburgo', 'RS').lastInsertRowid;
  const confSul = insForn.run('Confecções Sul Brasil Ltda', 'Confecções Sul', '45.678.901/0001-34', 'vendas@confsul.com.br', '(47) 3321-9988', 'Blumenau', 'SC').lastInsertRowid;

  // --- Condições de pagamento (catálogo reutilizável) ---
  const aVista = insCond.run('À vista', 1, 0, 0).lastInsertRowid;
  const d30 = insCond.run('30 dias', 1, 0, 30).lastInsertRowid;
  const d3060 = insCond.run('30/60 dias', 2, 2.0, 30).lastInsertRowid;
  const d306090 = insCond.run('30/60/90 dias', 3, 4.5, 30).lastInsertRowid;
  const cartao3x = insCond.run('Cartão 3x', 3, 3.2, 0).lastInsertRowid;

  // --- Ofertas: fornecedor × variação × condição ---
  const ofertas = [
    // SKU, fornecedor, condição, custo, prazo, forma, qtd mín, cód. fornecedor
    ['POLO-PRE-M', malharia, aVista, 42.5, 7, 'PIX', 20, 'MSR-POLO-PM'],
    ['POLO-PRE-M', textilNE, d3060, 39.8, 12, 'Boleto', 50, 'TNE-4411'],
    ['POLO-PRE-M', confSul, d30, 41.0, 9, 'Boleto', 30, 'CS-POLO-PTO-M'],
    ['POLO-BRA-M', malharia, aVista, 41.9, 7, 'PIX', 20, 'MSR-POLO-BM'],
    ['POLO-BRA-M', textilNE, d306090, 40.5, 12, 'Boleto', 50, 'TNE-4412'],
    ['POLO-AZU-G', confSul, d3060, 42.8, 9, 'Boleto', 30, 'CS-POLO-AZ-G'],
    ['CMST-PRE-M', malharia, aVista, 16.9, 5, 'PIX', 50, 'MSR-CMST-PM'],
    ['CMST-PRE-M', textilNE, d30, 15.4, 12, 'Boleto', 100, 'TNE-1101'],
    ['CMST-BRA-M', textilNE, aVista, 14.8, 12, 'PIX', 100, 'TNE-1102'],
    ['CMST-BRA-M', confSul, cartao3x, 16.2, 8, 'Cartão', 40, 'CS-CMST-BR-M'],
    ['CMST-VER-P', malharia, d30, 17.5, 5, 'Boleto', 50, 'MSR-CMST-VP'],
    ['JEANS-40', confSul, d3060, 78.9, 10, 'Boleto', 20, 'CS-JEANS-40'],
    ['JEANS-40', textilNE, d306090, 74.5, 15, 'Boleto', 40, 'TNE-8840'],
    ['JEANS-42', confSul, d30, 79.9, 10, 'Boleto', 20, 'CS-JEANS-42'],
    ['VEST-FLOR-M', confSul, aVista, 92.0, 12, 'PIX', 10, 'CS-VESTM-FL'],
    ['VEST-FLOR-M', textilNE, d3060, 88.5, 15, 'Boleto', 20, 'TNE-VD-220'],
    ['CINTO-PRE', couroCia, aVista, 34.9, 6, 'PIX', 12, 'CC-CINTO-P'],
    ['CINTO-CAR', couroCia, d30, 36.5, 6, 'Boleto', 12, 'CC-CINTO-C'],
    ['BOLSA-TOTE-PRE', couroCia, d3060, 72.0, 8, 'Boleto', 6, 'CC-TOTE-P'],
    ['BOLSA-TOTE-BEG', couroCia, aVista, 69.9, 8, 'PIX', 6, 'CC-TOTE-B'],
    ['BONE-PRE', confSul, aVista, 21.5, 7, 'PIX', 24, 'CS-BONE-PTO'],
    ['BONE-AZU', malharia, d30, 22.9, 5, 'Boleto', 24, 'MSR-BONE-AZ'],
  ];
  for (const [sku, forn, cond, custo, prazo, forma, qtd, cod] of ofertas) {
    insOferta.run(forn, skus[sku], cond, custo, prazo, forma, qtd, cod);
  }

  // --- Fornecedores homologados por produto (derivados das ofertas) ---
  db.exec(`
    INSERT INTO produto_fornecedor (produto_id, fornecedor_id)
    SELECT DISTINCT v.produto_id, fv.fornecedor_id
      FROM fornecedor_variacao fv
      JOIN variacoes v ON v.id = fv.variacao_id
  `);
}
