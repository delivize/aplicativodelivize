"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ClientFormProps {
  onClientAdded?: (cardapio: {
    name: string;
    photo_url: string | null;
    subdomain: string;
    user_id: string;
  }) => void;
}

export function ClientForm({ onClientAdded }: ClientFormProps) {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const generateSubdomain = (name: string) =>
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "")
      .substring(0, 20);

  const uploadPhoto = async (photo: File): Promise<string | null> => {
    const supabase = createClient();
    const fileExt = photo.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("client-photos")
      .upload(fileName, photo);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("client-photos").getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Usuário não autenticado");
      setIsLoading(false);
      return;
    }

    try {
      const photoUrl = photo ? await uploadPhoto(photo) : null;

      const baseSubdomain = generateSubdomain(name);
      const { data: existingSubdomains } = await supabase
        .from("cardapios")
        .select("subdomain")
        .ilike("subdomain", `${baseSubdomain}%`);

      const existingSet = new Set(existingSubdomains?.map((c) => c.subdomain));
      let subdomain = baseSubdomain;
      let counter = 1;

      while (existingSet.has(subdomain)) {
        subdomain = `${baseSubdomain}${counter}`;
        counter++;
      }

      const { error: insertError } = await supabase.from("cardapios").insert({
        name,
        photo_url: photoUrl,
        subdomain,
        user_id: user.id,
      });

      if (insertError) throw insertError;

      onClientAdded?.({
        name,
        photo_url: photoUrl,
        subdomain,
        user_id: user.id,
      });

      setName("");
      setPhoto(null);
      // router.refresh(); // Removido para evitar reload desnecessário
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao criar cardápio"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo Cardápio</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Cardápio</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome do cliente"
              required
              aria-label="Nome do Cardápio"
            />
          </div>

          <div>
            <Label htmlFor="photo">Foto do Cardápio</Label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              aria-label="Foto do Cardápio"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
            aria-label="Criar Cardápio"
          >
            {isLoading ? "Criando..." : "Criar Cardápio"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
