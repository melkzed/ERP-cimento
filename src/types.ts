export interface Atributo {
  id: number;
  nome: string;
  valores: ValorAtributo[];
}

export interface ValorAtributo {
  id: number;
  atributo_id: number;
  valor: string;
  em_uso: number;
}

export interface Categoria {
  id: number;
  nome: string;
  num_produtos?: number;
}

export interface Produto {
  id: number;
  nome: string;
  descricao: string | null;
  categoria_id: number | null;
  categoria: string | null;
  unidade: string;
  ativo: number;
  criado_em: string;
  num_variacoes?: number;
  estoque_total?: number;
}

export interface ValorDaVariacao {
  atributo: string;
  valor: string;
  valor_atributo_id: number;
}

export interface Variacao {
  id: number;
  produto_id: number;
  sku: string;
  estoque: number;
  estoque_minimo: number;
  preco_venda: number | null;
  ativo: number;
  valores: ValorDaVariacao[];
  produto?: string;
  unidade?: string;
  num_ofertas?: number;
  melhor_custo?: number | null;
}

export interface ProdutoDetalhado extends Produto {
  variacoes: Variacao[];
}

export interface Fornecedor {
  id: number;
  razao_social: string;
  nome_fantasia: string | null;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  uf: string | null;
  ativo: number;
  num_ofertas?: number;
}

export interface FornecedorDetalhado extends Fornecedor {
  ofertas: Oferta[];
}

export interface CondicaoPagamento {
  id: number;
  nome: string;
  num_parcelas: number;
  taxa_juros: number;
  dias_carencia: number;
  em_uso?: number;
}

export interface Oferta {
  id: number;
  fornecedor_id: number;
  variacao_id: number;
  condicao_pagamento_id: number;
  preco_custo: number;
  prazo_entrega_dias: number;
  forma_cobranca: string;
  quantidade_minima: number;
  codigo_no_fornecedor: string | null;
  fornecedor: string;
  razao_social: string;
  condicao: string;
  num_parcelas: number;
  taxa_juros: number;
  dias_carencia: number;
  custo_efetivo: number;
  sku: string;
  produto: string;
}

export interface RelatorioCategoria {
  id: number;
  categoria: string;
  num_produtos: number;
  num_skus: number;
  estoque_total: number;
  valor_estoque: number;
}

export interface RelatorioMargem {
  id: number;
  sku: string;
  preco_venda: number;
  estoque: number;
  produto: string;
  categoria: string | null;
  melhor_custo: number;
  margem: number;
  margem_pct: number;
}

export interface Relatorios {
  porCategoria: RelatorioCategoria[];
  margens: RelatorioMargem[];
}

export interface Dashboard {
  produtos: number;
  variacoes: number;
  categorias: number;
  fornecedores: number;
  ofertas: number;
  atributos: number;
  condicoes: number;
  estoqueBaixo: {
    id: number;
    sku: string;
    estoque: number;
    estoque_minimo: number;
    produto: string;
    unidade: string;
  }[];
  melhoresOfertas: Oferta[];
}
