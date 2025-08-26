"use client"; // componente client

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client"; // client-side supabase

interface ClientManageProps {
  slug: string;
  initialName: string;
  initialPhotoUrl: string | null;
}

export default function ClientManagePage({
  slug,
  initialName,
  initialPhotoUrl,
}: ClientManageProps) {
  const [name, setName] = useState(initialName);
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase
      .from("clients")
      .update({ name, photo_url: photoUrl })
      .eq("subdomain", slug);

    if (error) {
      setMessage(`Erro ao atualizar cliente: ${error.message}`);
    } else {
      setMessage("Cliente atualizado com sucesso!");
      router.refresh(); // atualiza a página sem reload
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Gerenciar cliente: {initialName}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col">
          Nome:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded"
            required
          />
        </label>

        <label className="flex flex-col">
          Foto (URL):
          <input
            type="text"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            className="border p-2 rounded"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-amber-600 text-white py-2 rounded hover:bg-amber-700 transition disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Salvar alterações"}
        </button>

        {message && (
          <p
            className={`mt-2 ${
              message.includes("Erro") ? "text-red-500" : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
