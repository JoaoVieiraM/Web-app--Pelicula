# Configurações e Alterações no Supabase — PeliculaApp

> **Para o time Antigravity:** Este documento lista tudo que precisa ser executado/configurado no Supabase para o app funcionar corretamente. Execute na ordem indicada.

---

## PARTE 1 — Tabela de Perfis e Controle de Acesso por Role

### Por quê

O app possui dois tipos de usuário:
- **Admin** — acesso completo: dashboard, tipos de película, gestão de usuários
- **Atendente (employee)** — acesso restrito: apenas busca e cadastro de clientes

Os roles são armazenados em uma tabela `profiles` separada da `auth.users`.

---

### SQL — Executar no SQL Editor do Supabase

#### Bloco A — Tabela `profiles`

```sql
CREATE TABLE public.profiles (
  id           UUID         DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      UUID         NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT         NOT NULL,
  display_name TEXT,
  role         TEXT         NOT NULL DEFAULT 'employee'
                            CHECK (role IN ('admin', 'employee')),
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ  DEFAULT NOW() NOT NULL,
  updated_at   TIMESTAMPTZ  DEFAULT NOW() NOT NULL
);

-- Trigger de updated_at (usa a função já existente no banco)
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

#### Bloco B — Row Level Security na tabela `profiles`

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Cada usuário pode ler apenas o próprio perfil
-- (o admin lê todos via service role key na Edge Function)
CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
```

> **Nota:** A Edge Function `manage-user` usa a **service role key** (que ignora RLS), portanto não precisa de policies adicionais para leitura/escrita via função.

#### Bloco C — Criar o primeiro usuário Admin

Após criar os blocos A e B, crie o primeiro usuário admin manualmente:

1. Acesse **Authentication → Users → Add user**
2. Informe e-mail e senha
3. Copie o UUID gerado para o usuário
4. Execute no SQL Editor:

```sql
-- Substitua os valores pelos dados reais do seu admin
INSERT INTO public.profiles (user_id, email, display_name, role)
VALUES (
  'UUID-DO-USUARIO-AQUI',   -- cole o UUID do passo 3
  'admin@suaempresa.com',   -- e-mail do admin
  'Nome do Admin',          -- nome para exibição
  'admin'
);
```

A partir desse ponto, o admin pode criar outros usuários diretamente pelo app (página "Usuários" na sidebar).

---

## PARTE 2 — Edge Function `manage-user`

### Por quê

Criar e excluir usuários via Supabase Auth requer a **service role key**, que não pode ser exposta no frontend. A Edge Function executa no servidor do Supabase e usa essa chave com segurança.

### O que a função faz

| Ação | Descrição |
|---|---|
| `list` | Lista todos os usuários (perfis) |
| `create` | Cria um novo usuário no Auth + insere na tabela `profiles` |
| `toggle` | Ativa ou desativa um usuário (bane/desbane no Auth) |
| `delete` | Exclui o usuário do Auth (o perfil é removido por cascade) |

Todas as ações verificam que o chamador tem `role = 'admin'` antes de executar.

### Como deployar

O código da função está em:
```
supabase/functions/manage-user/index.ts
```

#### Opção A — Supabase CLI (recomendado)

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Login
supabase login

# Linkar ao projeto (usar o project ref do dashboard)
supabase link --project-ref bsewiosciksmlzndvnro

# Deploy da função
supabase functions deploy manage-user
```

#### Opção B — Via Supabase Dashboard

1. Acesse **Edge Functions → New Function**
2. Nomeie como `manage-user`
3. Cole o conteúdo do arquivo `supabase/functions/manage-user/index.ts`
4. Clique em **Deploy**

### Variáveis de ambiente (automáticas)

As seguintes variáveis são **injetadas automaticamente** pelo Supabase nas Edge Functions — não é necessário configurar nada:

| Variável | Descrição |
|---|---|
| `SUPABASE_URL` | URL do projeto |
| `SUPABASE_ANON_KEY` | Chave pública |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço (usada internamente pela função) |

---

## PARTE 3 — Recuperação de Senha ("Esqueci minha senha")

### 3.1 Definir a URL do site (Site URL)

**Onde:** Authentication → URL Configuration → **Site URL**

Definir para a URL raiz de produção, ex:
```
https://peliculaapp.netlify.app
```

### 3.2 Adicionar Redirect URL

**Onde:** Authentication → URL Configuration → **Redirect URLs**

Adicionar:
```
https://peliculaapp.netlify.app/
```

> Sem esta configuração, o `resetPasswordForEmail` é bloqueado com erro "redirect URL not allowed".

### 3.3 Personalizar template de e-mail (opcional)

**Onde:** Authentication → Email Templates → **Reset Password**

- Subject: `PeliculaApp — Recuperação de Senha`
- Manter o token `{{ .ConfirmationURL }}` no corpo

---

## PARTE 4 — Editar Cliente e Novo Tipo de Película

**Não requer alterações de SQL.** As RLS policies existentes (`"Authenticated full access"`) já cobrem `UPDATE` em `clients` e `INSERT` em `film_types` para usuários autenticados.

---

## Checklist de Execução

| # | Tarefa | Feito? |
|---|--------|--------|
| 1 | Executar Bloco A (tabela `profiles`) | ☐ |
| 2 | Executar Bloco B (RLS da `profiles`) | ☐ |
| 3 | Criar primeiro usuário admin no Auth | ☐ |
| 4 | Executar Bloco C (INSERT do perfil admin) | ☐ |
| 5 | Deployar Edge Function `manage-user` | ☐ |
| 6 | Configurar Site URL no Auth | ☐ |
| 7 | Adicionar Redirect URL no Auth | ☐ |
