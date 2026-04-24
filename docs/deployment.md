# Deployment e Configuração — PeliculaApp

A hospedagem em ambiente de produção dos ativos estáticos (HTML/JS/CSS) ocorre na Vercel, integrada aos serviços do Supabase.

## 1. Implantação na Vercel

O deploy inclui a pasta raiz ou pasta `web/`, conforme configurado no `vercel.json`.

> [!NOTE]
> O arquivo `_redirects` na raiz de `web/` usa formato nativo da plataforma Netlify e não tem efeito em deploy na Vercel. Caso seja necessário configurar redirecionamentos, use a seção `rewrites` ou `redirects` dentro do `vercel.json`. O arquivo atual é candidato a remoção. *(a confirmar se está em uso)*

## 2. Variáveis de Ambiente

Na lógica client-side, são necessárias as seguintes variáveis públicas com a Anon Key:
- `SUPA_URL`
- `SUPA_KEY`

*(a confirmar em qual arquivo JS exato dentro de `web/` as variáveis operam atualmente)*

## 3. Configurações Supabase Auth

O fluxo de redefinição de senha requer as seguintes configurações de URL no Supabase:
1. No painel de Auth > **URL Configuration**, ajuste a **Site URL** para o domínio da Vercel.
2. Adicione a mesma Vercel URL em **Redirect URLs**.

## Troubleshooting Histórico (Logs e Auth)

> [!WARNING]
> Nota: documentação histórica, validar se ainda se aplica.

| Status | Causa Comum (Histórica) | Solução Histórica |
|---|---|---|
| 401 | O token JWT não estava sendo enviado ou expirou na sessão. | Fazer o deploy do código atualizado que utiliza `sb.auth.getSession()`. |
| 403 | Inconsistência de UUIDs entre a tabela `profiles` e o Auth, ou campo `role` preenchido incorretamente. | Ajustar via comando SQL o `user_id` ou corrigir o role para `admin`. |
| 404 | A função `manage-user` não existia ou possuía um nome com grafia distinta. | Efetuar o deploy via CLI garantindo a nomenclatura exata (`manage-user`). |
| 500 | A tabela `profiles` ou o trigger `handle_updated_at()` estavam ausentes. | Criar as tabelas base e triggers conforme documentado em `database.md`. |
