# DEPLOY URGENTE — Página de Usuários: Erro "non-2xx status code"

## O que significa este erro

A mensagem "Edge Function returned a non-2xx status code" é genérica — o Supabase JS SDK
a exibe sempre que a Edge Function retorna qualquer código fora da faixa 2xx (pode ser
401, 403, 404, 500 etc.). **A única forma de saber o código real é ler os logs da Edge Function.**

---

## Como ler os logs (fazer isso primeiro)

1. Acesse **Supabase Dashboard → Edge Functions → manage-user → Logs**
2. Recarregue a página Usuários no app para gerar uma nova entrada de log
3. Anote o código HTTP e a mensagem de erro exibida no log
4. Use a tabela abaixo para encontrar a causa raiz

---

## Mapa de erros: código HTTP → causa → solução

### Status 401 — Não Autorizado

**Causa A:** O `index.html` em produção ainda está na versão antiga (sem o fix do token).
A versão atualizada captura o token explicitamente com `sb.auth.getSession()` antes de
chamar a Edge Function. Se o arquivo implantado for o anterior, o token pode não chegar.

**Solução A:** Fazer deploy do `index.html` atualizado (versão com o fix do token na
função `callEdgeFunction`, linha ~2298).

---

**Causa B:** O token JWT do usuário expirou durante a sessão.

**Solução B:** Sair e entrar novamente no app. Se o problema se repetir com frequência,
verificar o tempo de expiração configurado em **Supabase → Authentication → Settings →
JWT expiry**.

---

### Status 403 — Proibido

**Causa A (mais provável):** O UUID inserido na tabela `profiles` não corresponde ao UUID
real do usuário admin no Supabase Auth.

**Como verificar:**
1. No Supabase Dashboard → **Authentication → Users** → copie o UUID do admin
2. No **Table Editor → profiles** → veja o valor do campo `user_id`
3. Se forem diferentes, execute:

```sql
UPDATE public.profiles
SET user_id = 'UUID-CORRETO-DO-AUTH'
WHERE email = 'email-do-admin@empresa.com';
```

---

**Causa B:** A tabela `profiles` existe mas está vazia — o INSERT do perfil admin nunca
foi executado ou falhou silenciosamente.

**Como verificar:** No **Table Editor → profiles** — se não houver nenhuma linha, execute:

```sql
INSERT INTO public.profiles (user_id, email, display_name, role)
VALUES (
  'UUID-DO-USUARIO-NO-AUTH',
  'email-do-admin@empresa.com',
  'Nome do Admin',
  'admin'
);
```

---

**Causa C:** O campo `role` do admin está com valor diferente de `'admin'`
(ex: `'Admin'`, `'ADMIN'`, `'employee'`). O check é case-sensitive.

**Como verificar:**
```sql
SELECT user_id, email, role FROM public.profiles;
```

Se o role estiver errado:
```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'email-do-admin@empresa.com';
```

---

### Status 404 — Função não encontrada

**Causa:** A Edge Function `manage-user` não está deployada, ou foi deployada com um nome
diferente (ex: `manage_user` com underscore).

**Como verificar:** No Supabase Dashboard → **Edge Functions** — verificar se existe uma
função com o nome exato `manage-user` (com hífen).

**Solução — Opção A (CLI):**
```bash
npm install -g supabase
supabase login
supabase link --project-ref bsewiosciksmlzndvnro
supabase functions deploy manage-user
```

**Solução — Opção B (Dashboard):**
1. **Edge Functions → New Function**
2. Nome: `manage-user` (com hífen, exatamente assim)
3. Colar o conteúdo de `supabase/functions/manage-user/index.ts`
4. Deploy

---

### Status 500 — Erro interno na função

**Causa A:** A tabela `profiles` não existe no banco. A Edge Function tenta consultá-la
e o PostgreSQL retorna erro, derrubando a função.

**Como verificar:** No **Table Editor** — verificar se a tabela `profiles` aparece na lista.

**Solução:** Executar os Blocos A e B no SQL Editor:

```sql
-- BLOCO A: Criar tabela
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

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

```sql
-- BLOCO B: Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
```

---

**Causa B:** A função `handle_updated_at()` referenciada no trigger não existe no banco.

**Como verificar:**
```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'handle_updated_at';
```

Se não retornar nada, criar a função antes do Bloco A:

```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Checklist completo de verificação

| # | O que verificar | Como verificar | Resolvido? |
|---|-----------------|---------------|------------|
| 1 | Ler os logs da Edge Function para saber o código HTTP real | Dashboard → Edge Functions → manage-user → Logs | ☐ |
| 2 | `index.html` em produção é a versão atualizada (com fix do token) | Verificar com o time que fez o deploy | ☐ |
| 3 | Função `manage-user` está deployada com nome exato (hífen) | Dashboard → Edge Functions | ☐ |
| 4 | Tabela `profiles` existe no banco | Table Editor | ☐ |
| 5 | Função `handle_updated_at()` existe no banco | SQL acima | ☐ |
| 6 | Tabela `profiles` tem uma linha com o admin | Table Editor → profiles | ☐ |
| 7 | UUID na tabela `profiles` bate com o UUID no Auth | Comparar Auth → Users com Table Editor | ☐ |
| 8 | Campo `role` do admin é exatamente `admin` (minúsculo) | SELECT na tabela profiles | ☐ |
