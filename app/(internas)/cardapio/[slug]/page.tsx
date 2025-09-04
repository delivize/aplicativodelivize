"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/client";
import Menu from "@/components/gerenciamento/menu";
import Header from "@/components/gerenciamento/header";
import ConfiguracoesView from "@/components/gerenciamento/design";
import ContaView from "@/components/gerenciamento/contaView";
import OperatingHoursManager from "@/components/gerenciamento/operatingHoursManager";
import CategoriasManager from "@/components/gerenciamento/categorias";
import UploadsManager from "@/components/gerenciamento/uploads";
import Design from "@/components/gerenciamento/design";

export default function CardapioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const [view, setView] = useState("inicio");
  const [cardapioName, setCardapioName] = useState<string>("");
  const [cardapioId, setCardapioId] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchCardapioData = async () => {
      try {
        const { data, error } = await supabase
          .from("cardapios")
          .select("id, name")
          .eq("subdomain", resolvedParams.slug)
          .single();

        if (data && !error) {
          setCardapioName(data.name);
          setCardapioId(data.id);
        }
      } catch (err) {
        console.error("Erro ao buscar dados do cardápio:", err);
      }
    };

    fetchCardapioData();
  }, [resolvedParams.slug]);

  useEffect(() => {
    document.title = cardapioName
      ? `Delivize | ${cardapioName}`
      : "Delivize | Cardápio";

    const existingFavicon = document.querySelector(
      "link[rel='icon']"
    ) as HTMLLinkElement;
    if (existingFavicon) {
      existingFavicon.href = "/logodelivize.svg";
      existingFavicon.type = "image/svg+xml";
    } else {
      const favicon = document.createElement("link");
      favicon.rel = "icon";
      favicon.type = "image/svg+xml";
      favicon.href = "/logodelivize.svg";
      document.head.appendChild(favicon);
    }
  }, [cardapioName]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCardapioUpdate = (newName: string) => {
    setCardapioName(newName);
  };

  const renderView = () => {
    switch (view) {
      case "design":
        return <Design params={params} onUpdateName={handleCardapioUpdate} />;
      case "horarios":
        return <OperatingHoursManager cardapioId={cardapioId} />;
      case "categorias":
        return <CategoriasManager cardapioId={cardapioId} />;
      case "uploads":
        return <UploadsManager cardapioId={cardapioId} />;
      case "conta":
        return <ContaView />;
      default:
        return (
          <div className="p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <img
                      src="/logodelivize.svg"
                      alt="Delivize"
                      className="w-6 h-6 sm:w-8 sm:h-8"
                    />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    Bem-vindo ao {cardapioName || "seu Cardápio"}!
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                    Gerencie seu cardápio digital e configurações da sua conta.
                  </p>
                </div>

                {/* Cards de resumo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6 text-center">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Status
                    </h3>
                    <p className="text-lg sm:text-xl font-semibold text-gray-900">
                      Ativo
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6 text-center">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Visualizações
                    </h3>
                    <p className="text-lg sm:text-xl font-semibold text-gray-900">
                      -
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6 text-center sm:col-span-2 lg:col-span-1">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Última atualização
                    </h3>
                    <p className="text-lg sm:text-xl font-semibold text-gray-900">
                      Hoje
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const getViewTitle = () => {
    switch (view) {
      case "design":
        return "Design";
      case "horarios":
        return "Horários";
      case "categorias":
        return "Categorias";
      case "uploads":
        return "Uploads";
      case "conta":
        return "Minha Conta";
      default:
        return "Início";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Menu
        onSelect={(selectedView) => {
          setView(selectedView);
          setIsMobileMenuOpen(false);
        }}
        selected={view}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={getViewTitle()}
          slug={resolvedParams.slug}
          cardapioId={cardapioId}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        <main className="flex-1 overflow-y-auto">{renderView()}</main>
      </div>
    </div>
  );
}
