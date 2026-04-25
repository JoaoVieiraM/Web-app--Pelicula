-- Seed inicial com as 4 lojas da Markel
INSERT INTO public.stores (id, name, address, phone, is_active)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Markel Film - Loja 1', 'Matriz SP', '11900000001', true),
  ('22222222-2222-2222-2222-222222222222', 'Markel Film - Loja 2', 'Filial Sul', '11900000002', true),
  ('33333333-3333-3333-3333-333333333333', 'Markel Film - Loja 3', 'Filial Norte', '11900000003', true),
  ('44444444-4444-4444-4444-444444444444', 'Markel Film - Loja 4', 'Filial Leste', '11900000004', true)
ON CONFLICT (id) DO NOTHING;
