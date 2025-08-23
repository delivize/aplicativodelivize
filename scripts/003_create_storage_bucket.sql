-- Criar bucket para fotos dos clientes
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-photos', 'client-photos', true);

-- Política para permitir upload de fotos (apenas usuários autenticados)
CREATE POLICY "Users can upload client photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'client-photos' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir visualização pública das fotos
CREATE POLICY "Public can view client photos" ON storage.objects
FOR SELECT USING (bucket_id = 'client-photos');

-- Política para permitir que usuários deletem suas próprias fotos
CREATE POLICY "Users can delete their own client photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'client-photos' 
  AND auth.role() = 'authenticated'
);
