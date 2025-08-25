"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { ClientForm } from "@/components/client-form";
import { ClientList } from "@/components/client-list";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
interface Client {
  id: string;
  name: string;
  photo_url: string | null;
  subdomain: string;
  created_at: string;
}

export const metadata: Metadata = {
  title: "Delivize | Homee",
};

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const supabase = createClient();

  const fetchClients = async (userId: string) => {
    const { data } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setClients(data || []);
  };

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUser(user);
      await fetchClients(user.id);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleClientDeleted = async () => {
    if (user) {
      await fetchClients(user.id);
    }
  };

  const handleClientAdded = async () => {
    if (user) {
      await fetchClients(user.id);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex justify-center items-center h-64">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-amber-600">Cardápios</h1>
        <Button variant="outline" onClick={handleSignOut}>
          Sair
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">Criar Novo Cardápio</h2>
          <ClientForm onClientAdded={handleClientAdded} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Cardápios Cadastrados</h2>
          <ClientList clients={clients} onClientDeleted={handleClientDeleted} />
        </div>
      </div>
    </div>
  );
}
