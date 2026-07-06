# ERP Moda — Roupas & Acessórios

ERP local para catálogo de moda com **variações dinâmicas** (cor, tamanho, numeração, material…),
**categorias cadastradas** (sem erro de grafia) e **comparação de fornecedores**.
Sem Supabase, sem serviço externo: o banco é um arquivo SQLite criado automaticamente em `data/erp.sqlite`
(usando o módulo `node:sqlite` embutido no Node — zero dependência nativa).

## Como rodar

Requisitos: **Node.js 22.5+**

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

Na primeira execução o banco é criado e populado com dados de demonstração
(polos, camisetas, jeans, vestidos, cintos, bolsas e bonés; 4 fornecedores e 22 ofertas).

> Atualizou de uma versão anterior e o servidor reclamou de schema antigo? Rode `npm run db:reset`.

Outros comandos:

```bash
npm run db:reset   # apaga o banco e recria com os dados de demonstração
npm run build      # build de produção do frontend
npm run server     # sobe só a API (serve também o dist/, se existir)
```

## O modelo de dados

O problema clássico: produtos com variações imprevisíveis (cor, tamanho, material…) e o
mesmo item vendido por vários fornecedores, cada um com preço, prazo e condição de
pagamento diferentes. Colunas fixas travam o sistema — aqui tudo é dado, não estrutura:

| Tabela | Papel |
| --- | --- |
| `categorias` | Cadastro único referenciado por FK — relatórios agrupam sempre limpo |
| `produtos` | Conceito genérico ("Camisa Polo Piquet") — **sem** preço nem estoque |
| `atributos` | Eixos de variação dinâmicos (Cor, Tamanho, Numeração, Material…) |
| `valores_atributo` | Valores possíveis de cada atributo (Azul, M, 42, Couro…) |
| `variacoes` | O SKU concreto vendável, com estoque e preço de venda |
| `variacao_valores` | Quais valores de atributo compõem cada SKU |
| `fornecedores` | Cadastro de fornecedores |
| `condicoes_pagamento` | Catálogo reutilizável (parcelas, juros, carência) — referenciado por FK |
| `fornecedor_variacao` | **Pivot N:N**: preço de custo, prazo de entrega, forma de cobrança e condição de pagamento de cada fornecedor para cada SKU |

Variação nova de um fornecedor novo? É só inserir linhas — nunca alterar o schema.
O schema completo está em [`server/schema.sql`](server/schema.sql).

## Cadastro rápido e sem erro de digitação

- **Categorias e atributos são escolhidos de listas** (FK), nunca digitados no produto —
  impossível criar "Camizetas" por engano.
- **Fornecedores selecionados no cadastro do produto** (chips clicáveis, tabela
  `produto_fornecedor`). Fornecedor não existe ainda? Um botão abre o cadastro **dentro do
  mesmo modal** — o formulário do produto fica preservado e, ao salvar, você volta com o
  novo fornecedor já selecionado. O mesmo atalho existe no modal de nova oferta.
- **Gerador de variações em massa**: marque as cores e tamanhos desejados e todas as
  combinações são criadas de uma vez (produto cartesiano), com **SKU gerado
  automaticamente** (ex.: `POLO-AZU-M`). Combinações que já existem são ignoradas.
- Exclusões protegidas: categoria em uso e condição de pagamento em uso não podem ser removidas.

## Telas

- **Dashboard** — visão geral, estoque abaixo do mínimo e o fornecedor vencedor por SKU
- **Produtos & SKUs** — produto pai + gerador de variações em massa
- **Categorias** — cadastro único usado por FK nos produtos
- **Atributos** — eixos de variação dinâmicos e seus valores
- **Fornecedores** — cadastro e todas as ofertas de cada fornecedor
- **Condições de pagamento** — catálogo reutilizável (à vista, 30/60/90, cartão…)
- **Comparador de compras** — escolha um SKU e compare o **custo efetivo** (preço + juros da condição) entre fornecedores
- **Relatórios** — estoque e valor por categoria + margem por SKU (venda × melhor custo)

## Stack

- Backend: Node.js + Express + SQLite (`node:sqlite`)
- Frontend: React 18 + Vite + TypeScript + Tailwind CSS
