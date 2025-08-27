"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { ClientForm } from "@/components/client-form";
import { ClientList } from "@/components/client-list";
import { Header } from "@/components/ui/header";
import { Loader } from "@/components/ui/loader";

interface Client {
  id: string;
  name: string;
  photo_url: string | null;
  subdomain: string;
  created_at: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [cardapios, setCardapios] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const fetchCardapios = async (userId: string) => {
    const { data } = await supabase
      .from("cardapios")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setCardapios(data || []);
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
      await fetchCardapios(user.id);
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const handleClientDeleted = async () => {
    if (user) await fetchCardapios(user.id);
  };

  const handleClientAdded = async () => {
    if (user) await fetchCardapios(user.id);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSignOut={handleSignOut} />
      <main className="container mx-auto p-6 max-w-5xl">
        <div className="grid gap-8 md:grid-cols-2">
          <section>
            <h2 className="text-xl font-semibold mb-4 text-green-700">
              Criar Novo Cardápio
            </h2>
            <ClientForm onClientAdded={handleClientAdded} />
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-4 text-green-700">
              Cardápios Cadastrados
            </h2>
            <ClientList
              cardapios={cardapios}
              onClientDeleted={handleClientDeleted}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
