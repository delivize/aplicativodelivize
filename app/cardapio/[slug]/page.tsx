"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import Image from "next/image";

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
      const { data } = await supabase
        .from("cardapios")
        .select("name, photo_url")
        .eq("subdomain", params.slug)
        .single();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let photoUrl = client.photo_url;

    if (file) {
      const ext = file.name.split(".").pop();
      const fileName = `${params.slug}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("client-photos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        alert("Erro ao fazer upload da imagem.");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("client-photos")
        .getPublicUrl(fileName);

      photoUrl = urlData.publicUrl;
    }

    const { error } = await supabase
      .from("cardapios")
      .update({ ...client, photo_url: photoUrl })
      .eq("subdomain", params.slug);

    if (!error) {
      alert("Dados atualizados com sucesso!");
      router.refresh();
    } else {
      alert("Erro ao atualizar.");
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
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
  );
}
