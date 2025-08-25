import { createClient } from "@/lib/server";

interface ClientManageProps {
  params: { slug: string };
}

export default async function ClientManagePage({ params }: ClientManageProps) {
  const supabase = await createClient();
  const { data: client } = await supabase
    .from("clients")
    .select("name, photo_url")
    .eq("subdomain", params.slug)
    .single();

  if (!client) {
    return <div>Cliente não encontrado</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">
        Gerenciar cliente: {client.name}
      </h1>

      <form className="flex flex-col gap-4 max-w-sm">
        <label className="flex flex-col">
          Nome:
          <input
            type="text"
            defaultValue={client.name}
            className="border p-2 rounded"
          />
        </label>

        <label className="flex flex-col">
          Foto:
          <input
            type="text"
            defaultValue={client.photo_url || ""}
            className="border p-2 rounded"
          />
        </label>

        <button type="submit" className="bg-blue-500 text-white py-2 rounded">
          Salvar alterações
        </button>
      </form>
    </div>
  );
}
