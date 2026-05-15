# Ciclo 5 / Ciclo 6 — Correções e Versionamento

**Data:** 2026-05-14
**Branch:** redesign

---

## Frente 1 — C4: Correção do display_name do admin na sidebar

### Sintoma

A sidebar exibia literalmente "Nome do Admin" no lugar do nome real e as iniciais do avatar mostravam "ND".

### Causa raiz

O campo `display_name` na tabela `public.profiles` estava com o valor padrão de setup `'Nome do Admin'` para o usuário admin. Não havia nenhum hardcode no frontend — o código em `app.js` já lia `profile.display_name` corretamente e gerava as iniciais por palavra.

Geração de iniciais em `app.js:1194-1195`:
```javascript
const words    = profile.display_name.trim().split(' ');
const initials = words.slice(0,2).map(w => w[0]).join('').toUpperCase();
// "Nome do Admin" → words=["Nome","do","Admin"] → initials="ND"
// "Marcelo"       → words=["Marcelo"]           → initials="M"
```

### Correção

UPDATE no banco via MCP Supabase:

```sql
UPDATE public.profiles
SET display_name = 'Marcelo'
WHERE user_id = 'fe059679-cb99-4b9d-866c-a2d720fac186';
```

**Resultado:** 1 linha afetada. `display_name` confirmado como `'Marcelo'`.

### Estado do frontend

Nenhuma alteração em `app.js`. O fluxo de renderização funciona corretamente:

1. `showApp()` (`app.js:14-25`) — exibe nome temporário derivado do e-mail enquanto o perfil carrega
2. `loadUserProfile()` (`app.js:1165-1215`) — sobrescreve com `display_name` real do banco; fallback implícito via e-mail se `display_name` for nulo

---

## Frente 2 — Migration retroativa: tabela `employees`

### Contexto

A migration `20260425_ciclo6_installer_id.sql` adiciona FK para `public.employees`, mas não existia nenhuma migration de criação dessa tabela. Ela havia sido criada manualmente via SQL Editor do Supabase (ciclo 5) e precisava ser versionada.

### Schema descoberto em produção

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| id | UUID | NOT NULL | uuid_generate_v4() |
| full_name | TEXT | NOT NULL | — |
| store_id | UUID | NOT NULL | — |
| is_active | BOOLEAN | NOT NULL | true |
| hired_at | DATE | YES | — |
| photo_url | TEXT | YES | — |
| created_at | TIMESTAMPTZ | NOT NULL | now() |
| updated_at | TIMESTAMPTZ | NOT NULL | now() |

**Constraints:**
- PK: `employees_pkey` em `id`
- FK: `employees_store_id_fkey` → `public.stores(id)`

**RLS:** habilitado

**Policies:**

| Policy | Comando | USING | WITH CHECK |
|---|---|---|---|
| employees_select | SELECT | `is_admin() OR (store_id = get_user_store_id())` | — |
| employees_insert | INSERT | — | `is_admin()` |
| employees_update | UPDATE | `is_admin()` | `is_admin()` |

**Trigger:** `employees_updated_at` BEFORE UPDATE → `update_updated_at()`

**Índices extras:** `idx_employees_store_id` (btree), `idx_employees_is_active` (btree)

**Registros existentes:** 2

### Arquivo criado

`supabase/migrations/20260425000000_ciclo5_create_employees.sql`

O timestamp `20260425000000` garante execução antes de `20260425_ciclo6_installer_id.sql` em qualquer recriação futura do banco (comparação alfabética: `0` < `_`).

Ordem resultante na pasta:
```
20260424215500_ciclo2_stores.sql
20260425000000_ciclo5_create_employees.sql   ← novo
20260425_ciclo6_installer_id.sql
```

> **Importante:** Esta migration é apenas para versionamento. A tabela já existe em produção — não deve ser executada via MCP em bancos ativos.

---

## Verificação

1. Login com `admin@pelicula.com`
2. Sidebar deve exibir **"Marcelo"**
3. Avatar deve exibir **"M"**
4. `supabase/migrations/` contém os três arquivos na ordem correta acima
