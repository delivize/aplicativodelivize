-- Desabilitar confirmação de email no Supabase
-- Atualizar configurações de autenticação para não exigir confirmação de email
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Configurar para que novos usuários não precisem confirmar email
-- Nota: Esta configuração também pode ser feita no painel do Supabase em Authentication > Settings
-- Desmarque "Enable email confirmations" nas configurações de autenticação
