import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

interface ClientManageProps {
  params: { slug: string };
}

// 🔹 Action no servidor
async function updateClient(formData: FormData, slug: string) {
  "use server";

  const supabase = await createClient();

  const name = formData.get("name") as string;
  const photo_url = formData.get("photo_url") as string;

  await supabase
    .from("clients")
    .update({ name, photo_url })
    .eq("subdomain", slug);

  // revalida a página após salvar
  revalidatePath(`/cliente/${slug}`);
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

      {/* 🔹 Form já chama a Server Action */}
      <form
        action={(formData) => updateClient(formData, params.slug)}
        className="flex flex-col gap-4 max-w-sm"
      >
        <label className="flex flex-col">
          Nome:
          <input
            type="text"
            name="name"
            defaultValue={client.name}
            className="border p-2 rounded"
          />
        </label>

        <label className="flex flex-col">
          Foto:
          <input
            type="text"
            name="photo_url"
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
