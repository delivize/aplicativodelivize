// app/custom/[domain]/page.tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

interface CustomDomainPageProps {
  params: {
    domain: string;
  };
}

// Função para buscar os dados do restaurante pelo domínio
async function getRestaurantByDomain(domain: string) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => (await cookies()).getAll(),
        setAll: () => {}, // No-op para server components
      },
    }
  );

  const { data, error } = await supabase
    .from("restaurants") // Substitua pelo nome da sua tabela
    .select("*")
    .eq("custom_domain", domain)
    .single();

  if (error || !data) {
    console.error("Erro ao buscar restaurante:", error);
    return null;
  }

  return data;
}

export default async function CustomDomainPage({
  params,
}: CustomDomainPageProps) {
  const { domain } = params;

  // Buscar dados do restaurante
  const restaurant = await getRestaurantByDomain(domain);

  if (!restaurant) {
    notFound();
  }

  // Aqui você renderiza o cardápio do restaurante
  return (
    <div className="min-h-screen">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {restaurant.name}
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        {/* Renderizar o cardápio aqui */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Exemplo de como renderizar itens do cardápio */}
          {restaurant.menu_items?.map((item: any) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-gray-600 mt-2">{item.description}</p>
              <p className="text-xl font-bold text-green-600 mt-4">
                R$ {item.price?.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
