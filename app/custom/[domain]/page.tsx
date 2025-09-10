// app/custom/[domain]/page.tsx
import { createClient } from "@/lib/server";
import { notFound } from "next/navigation";

export default async function CustomDomainPage({
  params,
}: {
  params: { domain: string };
}) {
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("cardapios")
    .select("*")
    .eq("custom_domain", params.domain)
    .single();

  if (!client) notFound();

  return (
    <div>
      <h1>{client.name}</h1>
      <p>Este é o domínio personalizado: {params.domain}</p>
    </div>
  );
}
