# PeliculaApp

O PeliculaApp é uma Single Page Application (SPA) para gestão operacional e relacionamento para estabelecimentos de instalação de películas automotivas e arquitetônicas. A plataforma permite gerenciar clientes, veículos, catálogo de produtos e garantias.

## Stack de Tecnologias

- Frontend: Estrutura HTML5 com estilização TailwindCSS. A lógica client-side é nativa (JavaScript Vanilla).
- Backend (BaaS): Supabase (PostgreSQL 15+, GoTrue Auth e Edge Functions).
- Segurança: Row Level Security (RLS) para controle de acesso a dados.

## Como Rodar Localmente

A aplicação não requer processo de build local. Sirva a pasta `web/` usando um servidor estático (ex: Live Server ou `npx serve`) e acesse através de `web/index.html`.

## Documentação Técnica

Acesse a pasta `docs/` para guias completos de arquitetura, banco de dados e deploy.

[Índice da Documentação](./docs/README.md)
