import { createClient } from "@/lib/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";

interface ClientPageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function ClientPage({ params }: ClientPageProps) {
  const { subdomain } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("subdomain", subdomain)
    .single();

  if (!client) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {client.photo_url && (
            <div className="mb-6">
              <Image
                src={client.photo_url || "/placeholder.svg"}
                alt={client.name}
                width={120}
                height={120}
                className="rounded-full mx-auto object-cover border-4 border-blue-200"
              />
            </div>
          )}

          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {client.name}
          </h1>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-blue-800 font-medium">
              Bem-vindo à página de {client.name}
            </p>
          </div>

          <p className="text-gray-600 text-sm">
            Esta é uma página personalizada criada especialmente para{" "}
            {client.name}.
          </p>
        </div>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Teste",
};
