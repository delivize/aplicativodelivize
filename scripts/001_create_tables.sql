-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  photo_url TEXT,
  subdomain TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para clients
CREATE POLICY "clients_select_own" ON public.clients 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "clients_insert_own" ON public.clients 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "clients_update_own" ON public.clients 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "clients_delete_own" ON public.clients 
  FOR DELETE USING (auth.uid() = user_id);

-- Política para permitir acesso público aos clientes por subdomínio (para as páginas públicas)
CREATE POLICY "clients_public_subdomain" ON public.clients 
  FOR SELECT USING (true);
