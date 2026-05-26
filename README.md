# CimentoERP

Aplicacao ERP para cimento e materiais de construcao, criada com React, TypeScript, Tailwind CSS, react-router-dom, @tanstack/react-query, lucide-react, recharts, componentes no estilo shadcn/ui e integracao com Supabase.

## Rodar localmente

```bash
npm install
npm run dev
```

Para conectar ao backend Supabase, informe `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em um arquivo `.env`.

Veja `SUPABASE_SETUP.md` para o esquema de tabelas e a configuração inicial do Supabase.

## Scripts

- `npm run dev`: inicia o Vite.
- `npm run build`: roda typecheck e gera build de producao.
- `npm run typecheck`: valida TypeScript.
