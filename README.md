# ERP Cimento

ERP local para catálogo de produtos com **variações dinâmicas** e **comparação de fornecedores**.
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
(cimento, argamassa, vergalhão, 4 fornecedores e 17 ofertas).

Outros comandos:

```bash
npm run db:reset   # apaga o banco e recria com os dados de demonstração
npm run build      # build de produção do frontend
npm run server     # sobe só a API (serve também o dist/, se existir)
```

## O modelo de dados (o "pulo do gato")

O problema clássico: produtos com variações imprevisíveis (peso, tipo, bitola…) e o
mesmo item vendido por vários fornecedores, cada um com preço, prazo e condição de
pagamento diferentes. Colunas fixas travam o sistema — aqui tudo é dado, não estrutura:

| Tabela | Papel |
| --- | --- |
| `produtos` | Conceito genérico ("Cimento Portland") — **sem** preço nem estoque |
| `atributos` | Eixos de variação dinâmicos (Tipo, Peso, Bitola…) |
| `valores_atributo` | Valores possíveis de cada atributo (CP-II, 50kg…) |
| `variacoes` | O SKU concreto vendável, com estoque e preço de venda |
| `variacao_valores` | Quais valores de atributo compõem cada SKU |
| `fornecedores` | Cadastro de fornecedores |
| `condicoes_pagamento` | Catálogo reutilizável (parcelas, juros, carência) — referenciado por FK |
| `fornecedor_variacao` | **Pivot N:N**: preço de custo, prazo de entrega, forma de cobrança e condição de pagamento de cada fornecedor para cada SKU |

Variação nova de um fornecedor novo? É só inserir linhas — nunca alterar o schema.
O schema completo está em [`server/schema.sql`](server/schema.sql).

## Telas

- **Dashboard** — visão geral, estoque abaixo do mínimo e o fornecedor vencedor por SKU
- **Produtos & SKUs** — produto pai + variações geradas por combinação de atributos
- **Atributos** — cadastro dinâmico de eixos de variação e seus valores
- **Fornecedores** — cadastro e todas as ofertas de cada fornecedor
- **Condições de pagamento** — catálogo reutilizável (à vista, 30/60/90, cartão…)
- **Comparador de compras** — escolha um SKU e compare o **custo efetivo** (preço + juros da condição) entre fornecedores

## Stack

- Backend: Node.js + Express + SQLite (`node:sqlite`)
- Frontend: React 18 + Vite + TypeScript + Tailwind CSS
