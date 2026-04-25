-- Ciclo 6: adiciona installer_id em installations (FK para employees)
-- Precisa ser aplicada pela Antigravity antes de testar o dropdown de instalador.

ALTER TABLE public.installations
ADD COLUMN installer_id UUID REFERENCES public.employees(id) ON DELETE SET NULL;
