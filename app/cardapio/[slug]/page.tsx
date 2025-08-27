"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import Image from "next/image";
import { Header } from "@/components/ui/header"; // ajuste o caminho conforme necessário

interface Props {
  params: { slug: string };
}

export default function EditClientPage({ params }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState({
    name: "",
    photo_url: "",
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      const { data, error } = await supabase
        .from("cardapios")
        .select("name, photo_url")
        .eq("subdomain", params.slug)
        .single();

      if (error) {
        console.error("Erro ao buscar cliente:", error.message);
      }

      if (data) setClient(data);
      setLoading(false);
    };

    fetchClient();
  }, [params.slug]);

  useEffect(() => {
    if (client.name) {
      document.title = `Delivize | ${client.name}`;
    }
  }, [client.name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClient({ ...client, [e.target.name]: e.target.value });
  };

  const sanitizeFileName = (name: string) => {
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9.]/g, "_");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let photoUrl = client.photo_url;

    if (file) {
      const ext = file.name.split(".").pop();
      const sanitized = sanitizeFileName(file.name);
      const timestamp = Date.now();
      const fileName = `${params.slug}_${timestamp}_${sanitized}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from("client-photos")
          .upload(fileName, file, {
            upsert: true,
            contentType: file.type,
          });

        if (uploadError) {
          console.error("Erro no upload:", uploadError.message);
          alert("Erro ao fazer upload da imagem.");
          return;
        }

        const { data: urlData } = supabase.storage
          .from("client-photos")
          .getPublicUrl(fileName);

        if (!urlData || !urlData.publicUrl) {
          alert("Erro ao gerar URL pública da imagem.");
          return;
        }

        photoUrl = urlData.publicUrl;
      } catch (err: any) {
        console.error("Exceção no upload:", err.message);
        alert("Erro inesperado ao fazer upload da imagem.");
        return;
      }
    }

    const { error } = await supabase
      .from("cardapios")
      .update({ ...client, photo_url: photoUrl })
      .eq("subdomain", params.slug);

    if (!error) {
      alert("Dados atualizados com sucesso!");
      router.refresh();
    } else {
      console.error("Erro ao atualizar dados:", error.message);
      alert("Erro ao atualizar.");
    }
  };

  const handleSignOut = () => {
    // lógica de logout aqui
    alert("Você saiu com sucesso.");
    router.push("/login"); // ou qualquer rota de login
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div>
      <Header onSignOut={handleSignOut} />

      <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-4">Editar Cliente</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">Nome</label>
            <input
              type="text"
              name="name"
              value={client.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium">Foto</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {client.photo_url && (
            <Image
              src={client.photo_url}
              alt="Preview"
              width={100}
              height={100}
              className="rounded-full mx-auto"
            />
          )}

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Salvar
          </button>
        </form>
      </div>
    </div>
  );
}
