# Banco de Dados — PeliculaApp
### Documento Técnico para o Time Antigravity

---

## Visão Geral

O banco de dados do PeliculaApp é hospedado no **Supabase** (PostgreSQL gerenciado) e possui **4 tabelas principais** + **1 view** auxiliar. O acesso é protegido por Row Level Security (RLS) — apenas funcionários autenticados via Supabase Auth podem ler ou gravar dados.

---

## Diagrama de Relacionamento

```
clients (1)
  └── vehicles (N)
        └── installations (N)
                └── film_types (1)  [referência]
```

---

## Tabelas

### 1. `clients` — Clientes

Armazena os dados pessoais e de contato de cada cliente. A chave de busca principal é o **CPF**.

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | `UUID` | Sim | Chave primária (gerada automaticamente) |
| `cpf` | `VARCHAR(11)` | Sim | CPF sem formatação — apenas 11 dígitos numéricos |
| `full_name` | `TEXT` | Sim | Nome completo do cliente |
| `email` | `TEXT` | Não | E-mail de contato |
| `phone` | `VARCHAR(20)` | Não | Telefone/WhatsApp |
| `birth_date` | `DATE` | Não | Data de nascimento |
| `address_street` | `TEXT` | Não | Rua/logradouro |
| `address_number` | `TEXT` | Não | Número |
| `address_complement` | `TEXT` | Não | Complemento (apto, bloco) |
| `address_district` | `TEXT` | Não | Bairro |
| `address_city` | `TEXT` | Não | Cidade |
| `address_state` | `CHAR(2)` | Não | UF (ex: `SP`) |
| `address_zip_code` | `VARCHAR(9)` | Não | CEP com traço (ex: `01310-100`) |
| `notes` | `TEXT` | Não | Observações gerais |
| `created_at` | `TIMESTAMPTZ` | Auto | Data de criação |
| `updated_at` | `TIMESTAMPTZ` | Auto | Última atualização (trigger automático) |

> **Atenção:** CPF deve ser armazenado **sem pontos e sem traço** — apenas os 11 dígitos numéricos (ex: `12345678900`). A formatação visual `123.456.789-00` é feita pelo frontend.

---

### 2. `vehicles` — Veículos

Cada cliente pode ter um ou mais veículos. Um veículo pertence a exatamente um cliente.

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | `UUID` | Sim | Chave primária |
| `client_id` | `UUID` | Sim | FK → `clients.id` (cascade delete) |
| `brand` | `TEXT` | Sim | Marca (ex: Toyota, Honda) |
| `model` | `TEXT` | Sim | Modelo (ex: Corolla, Civic) |
| `year` | `SMALLINT` | Sim | Ano de fabricação |
| `color` | `TEXT` | Não | Cor |
| `plate` | `VARCHAR(8)` | Sim | Placa sem traço (ex: `ABC1234` ou `ABC1D23`) |
| `notes` | `TEXT` | Não | Observações sobre o veículo |
| `created_at` | `TIMESTAMPTZ` | Auto | — |
| `updated_at` | `TIMESTAMPTZ` | Auto | Trigger automático |

> **Atenção:** Placa armazenada **sem traço e sem espaço** nos dois formatos:
> - Antigo: `ABC1234`
> - Mercosul: `ABC1D23`

---

### 3. `film_types` — Tipos de Película

Catálogo de películas disponíveis para instalação. Usado como referência nas instalações.

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | `UUID` | Sim | Chave primária |
| `name` | `TEXT` | Sim | Nome do produto (ex: Insulfilm G20) |
| `brand` | `TEXT` | Não | Fabricante (ex: 3M, Llumar, Johnson) |
| `category` | `TEXT` | Não | Categoria (ex: solar, segurança, decorativo) |
| `description` | `TEXT` | Não | Descrição detalhada |
| `warranty_months` | `SMALLINT` | Não | Garantia padrão em meses |
| `is_active` | `BOOLEAN` | Sim | `true` = disponível para novas instalações |
| `created_at` | `TIMESTAMPTZ` | Auto | — |
| `updated_at` | `TIMESTAMPTZ` | Auto | Trigger automático |

---

### 4. `installations` — Instalações

Histórico completo de instalações de película por veículo.

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | `UUID` | Sim | Chave primária |
| `vehicle_id` | `UUID` | Sim | FK → `vehicles.id` (cascade delete) |
| `film_type_id` | `UUID` | Não | FK → `film_types.id` (set null se deletar) |
| `installed_at` | `DATE` | Sim | Data da instalação |
| `warranty_months` | `SMALLINT` | Não | Sobrescreve o padrão do tipo de película |
| `warranty_until` | `DATE` | **Auto** | **Calculado por trigger** — não enviar |
| `covered_parts` | `TEXT[]` | Não | Array de vidros cobertos (ver lista abaixo) |
| `status` | `ENUM` | Sim | `active`, `expired` ou `removed` |
| `notes` | `TEXT` | Não | Observações |
| `installed_by` | `UUID` | Não | FK → `auth.users.id` (funcionário que registrou) |
| `created_at` | `TIMESTAMPTZ` | Auto | — |
| `updated_at` | `TIMESTAMPTZ` | Auto | Trigger automático |

#### Valores válidos para `covered_parts`

```
parabrisa
traseiro
lateral_dianteiro_esq
lateral_dianteiro_dir
lateral_traseiro_esq
lateral_traseiro_dir
teto_solar
```

#### Valores válidos para `status`

| Valor | Significado |
|---|---|
| `active` | Película instalada e dentro da garantia |
| `expired` | Garantia expirada, película ainda presente |
| `removed` | Película foi removida |

> **Importante:** `warranty_until` é calculado automaticamente por um trigger no banco quando a instalação é inserida ou atualizada. O frontend **não deve** enviar este campo.

---

## View

### `warranties_expiring_soon`

Retorna as instalações ativas cuja garantia vence nos próximos 30 dias. Ideal para o widget de alertas no Dashboard.

```sql
SELECT
  installation_id,
  warranty_until,
  status,
  covered_parts,
  plate,           -- da tabela vehicles
  brand,           -- da tabela vehicles
  model,           -- da tabela vehicles
  year,            -- da tabela vehicles
  client_name,     -- full_name da tabela clients
  client_phone,    -- phone da tabela clients
  client_cpf,      -- cpf da tabela clients
  film_type_name   -- name da tabela film_types
FROM warranties_expiring_soon;
```

---

## SQL Completo — Executar na Ordem

Execute os blocos abaixo no **SQL Editor do Supabase** (`Dashboard → SQL Editor → New Query`), na sequência indicada.

---

### Bloco 1 — Extensões

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

### Bloco 2 — Tabela `clients`

```sql
CREATE TABLE public.clients (
  id                  UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  cpf                 VARCHAR(11) NOT NULL UNIQUE,
  full_name           TEXT        NOT NULL,
  email               TEXT,
  phone               VARCHAR(20),
  birth_date          DATE,
  address_street      TEXT,
  address_number      TEXT,
  address_complement  TEXT,
  address_district    TEXT,
  address_city        TEXT,
  address_state       CHAR(2),
  address_zip_code    VARCHAR(9),
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_clients_cpf       ON public.clients (cpf);
CREATE INDEX idx_clients_full_name ON public.clients
  USING gin (to_tsvector('portuguese', full_name));
```

---

### Bloco 3 — Tabela `vehicles`

```sql
CREATE TABLE public.vehicles (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id   UUID        NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  brand       TEXT        NOT NULL,
  model       TEXT        NOT NULL,
  year        SMALLINT    NOT NULL,
  color       TEXT,
  plate       VARCHAR(8)  NOT NULL UNIQUE,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_vehicles_client_id ON public.vehicles (client_id);
CREATE INDEX idx_vehicles_plate     ON public.vehicles (plate);
```

---

### Bloco 4 — Tabela `film_types`

```sql
CREATE TABLE public.film_types (
  id              UUID     DEFAULT uuid_generate_v4() PRIMARY KEY,
  name            TEXT     NOT NULL UNIQUE,
  brand           TEXT,
  category        TEXT,
  description     TEXT,
  warranty_months SMALLINT,
  is_active       BOOLEAN  DEFAULT TRUE NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

---

### Bloco 5 — Enum de Status

```sql
CREATE TYPE public.installation_status AS ENUM (
  'active',
  'expired',
  'removed'
);
```

---

### Bloco 6 — Tabela `installations`

```sql
CREATE TABLE public.installations (
  id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  vehicle_id      UUID        NOT NULL REFERENCES public.vehicles(id)   ON DELETE CASCADE,
  film_type_id    UUID        REFERENCES public.film_types(id)           ON DELETE SET NULL,
  installed_at    DATE        NOT NULL DEFAULT CURRENT_DATE,
  warranty_months SMALLINT,
  warranty_until  DATE,
  covered_parts   TEXT[],
  status          public.installation_status DEFAULT 'active' NOT NULL,
  notes           TEXT,
  installed_by    UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_installations_vehicle_id   ON public.installations (vehicle_id);
CREATE INDEX idx_installations_status       ON public.installations (status);
CREATE INDEX idx_installations_warranty     ON public.installations (warranty_until);
CREATE INDEX idx_installations_installed_at ON public.installations (installed_at DESC);
```

---

### Bloco 7 — Trigger `updated_at` automático

```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_clients
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_vehicles
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_film_types
  BEFORE UPDATE ON public.film_types
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_installations
  BEFORE UPDATE ON public.installations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

---

### Bloco 8 — Trigger `warranty_until` automático

```sql
CREATE OR REPLACE FUNCTION public.calculate_warranty_until()
RETURNS TRIGGER AS $$
BEGIN
  -- Prioriza o warranty_months da própria instalação;
  -- se nulo, usa o padrão cadastrado no tipo de película.
  IF NEW.warranty_months IS NOT NULL THEN
    NEW.warranty_until := NEW.installed_at
                        + (NEW.warranty_months * INTERVAL '1 month');
  ELSIF NEW.film_type_id IS NOT NULL THEN
    SELECT (NEW.installed_at + (ft.warranty_months * INTERVAL '1 month'))
    INTO NEW.warranty_until
    FROM public.film_types ft
    WHERE ft.id = NEW.film_type_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER compute_warranty_until
  BEFORE INSERT OR UPDATE ON public.installations
  FOR EACH ROW EXECUTE FUNCTION public.calculate_warranty_until();
```

---

### Bloco 9 — Expiração automática de garantias (cron)

```sql
-- Função que atualiza o status de instalações com garantia vencida
CREATE OR REPLACE FUNCTION public.expire_overdue_warranties()
RETURNS void AS $$
BEGIN
  UPDATE public.installations
  SET    status = 'expired'
  WHERE  status        = 'active'
    AND  warranty_until < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;
```

**Para agendar a execução diária** (rodar às 3h da manhã):

1. Acesse **Supabase Dashboard → Database → Extensions**
2. Ative a extensão **`pg_cron`**
3. Execute no SQL Editor:

```sql
SELECT cron.schedule(
  'expire-warranties',         -- nome do job
  '0 3 * * *',                 -- todo dia às 03:00
  'SELECT public.expire_overdue_warranties()'
);
```

---

### Bloco 10 — Row Level Security (RLS)

```sql
ALTER TABLE public.clients       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.film_types    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installations ENABLE ROW LEVEL SECURITY;

-- Apenas usuários autenticados (funcionários com login) têm acesso total
CREATE POLICY "Authenticated full access to clients"
  ON public.clients FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated full access to vehicles"
  ON public.vehicles FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated full access to film_types"
  ON public.film_types FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated full access to installations"
  ON public.installations FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
```

> Usuários **não autenticados** (anônimos) são automaticamente bloqueados pelo RLS.

---

### Bloco 11 — View `warranties_expiring_soon`

```sql
CREATE OR REPLACE VIEW public.warranties_expiring_soon AS
SELECT
  i.id              AS installation_id,
  i.warranty_until,
  i.status,
  i.covered_parts,
  v.plate,
  v.brand,
  v.model,
  v.year,
  c.full_name       AS client_name,
  c.phone           AS client_phone,
  c.cpf             AS client_cpf,
  ft.name           AS film_type_name
FROM public.installations i
JOIN public.vehicles  v  ON v.id = i.vehicle_id
JOIN public.clients   c  ON c.id = v.client_id
LEFT JOIN public.film_types ft ON ft.id = i.film_type_id
WHERE i.status = 'active'
  AND i.warranty_until BETWEEN CURRENT_DATE
                           AND (CURRENT_DATE + INTERVAL '30 days')
ORDER BY i.warranty_until ASC;
```

---

### Bloco 12 — Dados iniciais (seed)

```sql
-- Tipos de película para popular o catálogo inicial
INSERT INTO public.film_types (name, brand, category, description, warranty_months)
VALUES
  ('Insulfilm G20',       'Johnson',  'solar',      'Escurecimento 20%, rejeição solar básica',          12),
  ('Insulfilm G35',       'Johnson',  'solar',      'Escurecimento 35%, rejeição solar básica',          12),
  ('Película Solar 3M',   '3M',       'solar',      'Alta rejeição de calor, baixa reflexão',            24),
  ('Nano Cerâmica Llumar','Llumar',   'premium',    'Tecnologia cerâmica, máxima rejeição solar',        36),
  ('Película de Segurança','3M',      'segurança',  'Anti-estilhaço, retém fragmentos em impactos',      24),
  ('Película Decorativa', NULL,       'decorativo', 'Acabamento fosco, uso estético',                     6);
```

---

## Configuração no Supabase

### Criar usuários (funcionários)

1. Acesse **Supabase Dashboard → Authentication → Users**
2. Clique em **"Invite user"** ou **"Add user"**
3. Informe o e-mail e uma senha temporária
4. O funcionário faz login na aplicação com essas credenciais

### Variáveis necessárias para o frontend

Encontre os valores em **Supabase Dashboard → Project Settings → API** e cole diretamente no início do `<script>` em `index.html`:

```js
const SUPA_URL = 'https://[seu-projeto].supabase.co';
const SUPA_KEY = '[sua-anon-key]'; // Anon/Public key — segura para o frontend
```

> **Importante:** Use apenas a **Anon Key** no frontend. A **Service Role Key** nunca deve ser exposta no código do cliente — ela bypassa o RLS e concede acesso total ao banco.

---

## Checklist de Implantação

Execute os blocos do SQL Editor na seguinte ordem e verifique cada etapa:

- [ ] Bloco 1 — Extensão `uuid-ossp` ativada
- [ ] Bloco 2 — Tabela `clients` criada
- [ ] Bloco 3 — Tabela `vehicles` criada
- [ ] Bloco 4 — Tabela `film_types` criada
- [ ] Bloco 5 — Tipo ENUM `installation_status` criado
- [ ] Bloco 6 — Tabela `installations` criada
- [ ] Bloco 7 — Triggers `updated_at` criados nas 4 tabelas
- [ ] Bloco 8 — Trigger `warranty_until` criado
- [ ] Bloco 9 — Função de expiração criada
- [ ] Extensão `pg_cron` ativada e job agendado
- [ ] Bloco 10 — RLS ativado e policies criadas
- [ ] Bloco 11 — View `warranties_expiring_soon` criada
- [ ] Bloco 12 — Seed de tipos de película inserido
- [ ] Primeiro usuário (funcionário) criado em Authentication → Users
- [ ] Variáveis de ambiente configuradas no projeto frontend

---

## Verificação pós-implantação

Após executar todos os blocos, valide com estas queries:

```sql
-- 1. Confirmar tabelas criadas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
-- Esperado: clients, film_types, installations, vehicles

-- 2. Confirmar RLS ativo
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public';
-- Esperado: rowsecurity = true em todas as tabelas

-- 3. Confirmar tipos de película inseridos
SELECT name, brand, warranty_months FROM public.film_types;

-- 4. Testar trigger de warranty_until
INSERT INTO public.clients (cpf, full_name) VALUES ('00000000001', 'Teste');
INSERT INTO public.vehicles (client_id, brand, model, year, plate)
  SELECT id, 'Marca', 'Modelo', 2024, 'TST0001' FROM public.clients WHERE cpf = '00000000001';
INSERT INTO public.installations (vehicle_id, film_type_id, installed_at, warranty_months)
  SELECT v.id, ft.id, CURRENT_DATE, 12
  FROM public.vehicles v, public.film_types ft
  WHERE v.plate = 'TST0001' AND ft.name = 'Insulfilm G20';

-- Deve retornar warranty_until = hoje + 12 meses
SELECT installed_at, warranty_months, warranty_until
FROM public.installations i
JOIN public.vehicles v ON v.id = i.vehicle_id
WHERE v.plate = 'TST0001';

-- Limpar dados de teste
DELETE FROM public.clients WHERE cpf = '00000000001';
```

---

*Documento gerado em Abril de 2026 — PeliculaApp v1.0*
