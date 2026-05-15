-- Migration retroativa: criação da tabela public.employees
-- Gerada em 2026-05-14 a partir do schema em produção.
-- Esta tabela foi criada originalmente via SQL Editor do Supabase (ciclo 5)
-- e está sendo versionada retroativamente para garantir reprodutibilidade.
-- NÃO execute esta migration em bancos onde employees já existe.

CREATE TABLE IF NOT EXISTS public.employees (
  id          UUID        NOT NULL DEFAULT uuid_generate_v4(),
  full_name   TEXT        NOT NULL,
  store_id    UUID        NOT NULL,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  hired_at    DATE,
  photo_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT employees_pkey PRIMARY KEY (id),
  CONSTRAINT employees_store_id_fkey
    FOREIGN KEY (store_id) REFERENCES public.stores(id)
);

-- Trigger de updated_at
CREATE TRIGGER employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT — admin vê tudo; employee vê apenas sua loja
CREATE POLICY employees_select ON public.employees
  FOR SELECT
  USING (is_admin() OR (store_id = get_user_store_id()));

-- Policy: INSERT — somente admin
CREATE POLICY employees_insert ON public.employees
  FOR INSERT
  WITH CHECK (is_admin());

-- Policy: UPDATE — somente admin
CREATE POLICY employees_update ON public.employees
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Índices adicionais (PK já cria seu índice acima)
CREATE INDEX idx_employees_store_id ON public.employees USING btree (store_id);
CREATE INDEX idx_employees_is_active ON public.employees USING btree (is_active);
