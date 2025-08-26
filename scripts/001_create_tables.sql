-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS public.cardapios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  photo_url TEXT,
  subdomain TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela cardapios
ALTER TABLE public.cardapios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para cardapios
CREATE POLICY "cardapios_select_own" ON public.cardapios 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "cardapios_insert_own" ON public.cardapios 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cardapios_update_own" ON public.cardapios 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "cardapios_delete_own" ON public.cardapios 
  FOR DELETE USING (auth.uid() = user_id);

-- Política para permitir acesso público aos clientes por subdomínio (para as páginas públicas)
CREATE POLICY "cardapios_public_subdomain" ON public.cardapios 
  FOR SELECT USING (true);
