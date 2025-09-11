"use client";

import { Copy, Crown, Check, Clock, Menu as MenuIcon, Eye } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/client";

interface HeaderProps {
  title: string;
  slug?: string;
  cardapioId: string;
  onMobileMenuToggle?: () => void;
}

const DAYS_OF_WEEK = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export default function Header({
  title,
  slug = "barrasreal",
  cardapioId,
  onMobileMenuToggle,
}: HeaderProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);

  const supabase = createClient();

  // Resolver problema de hidratação
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Função para calcular dias restantes do teste
  const calculateTrialDaysLeft = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setTrialDaysLeft(null);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("trial_start_date, is_premium")
        .eq("id", user.id)
        .single();

      if (error || !profile) {
        console.error("Erro ao buscar perfil:", error);
        setTrialDaysLeft(null);
        return;
      }

      // Se já é premium, não mostra o contador
      if (profile.is_premium) {
        setTrialDaysLeft(null);
        return;
      }

      // Se não tem data de início do teste, usar a data de criação do usuário
      const trialStartDate = profile.trial_start_date
        ? new Date(profile.trial_start_date)
        : new Date(user.created_at);

      const now = new Date();
      const trialEndDate = new Date(trialStartDate);
      trialEndDate.setDate(trialEndDate.getDate() + 14); // 14 dias de teste

      const diffTime = trialEndDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      setTrialDaysLeft(Math.max(0, diffDays));
    } catch (error) {
      console.error("Erro ao calcular dias do teste:", error);
      setTrialDaysLeft(null);
    }
  }, [supabase]);

  // Função para verificar se está aberto - usando useCallback para estabilizar a referência
  const checkIfOpen = useCallback(async () => {
    // Verifica se temos um cardapioId válido
    if (!cardapioId) {
      console.warn("cardapioId não fornecido");
      setIsOpen(null);
      return;
    }

    try {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Domingo, 1 = Segunda...
      const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

      console.log(
        `Verificando status - Dia: ${currentDay}, Hora: ${currentTime}`
      );

      // Primeiro, verifica se a conexão com Supabase está funcionando
      const { data, error } = await supabase
        .from("operating_hours")
        .select("*")
        .eq("cardapios_id", cardapioId)
        .eq("day_of_week", currentDay)
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar horários:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          cardapioId,
          currentDay,
        });
        setIsOpen(null);
        return;
      }

      // Se não há dados ou não está ativo para hoje
      if (!data || !data.is_active) {
        console.log("Estabelecimento fechado hoje ou sem horários definidos");
        setIsOpen(false);
        return;
      }

      // Verifica se os horários estão definidos
      if (!data.opening_time || !data.closing_time) {
        console.warn("Horários de abertura/fechamento não definidos", data);
        setIsOpen(null);
        return;
      }

      // Verifica se o horário atual está entre abertura e fechamento
      const isCurrentlyOpen =
        currentTime >= data.opening_time && currentTime < data.closing_time;
      console.log(
        `Horários: ${data.opening_time} - ${data.closing_time}, Status: ${
          isCurrentlyOpen ? "ABERTO" : "FECHADO"
        }`
      );

      setIsOpen(isCurrentlyOpen);
    } catch (err) {
      console.error("Erro ao verificar status aberto/fechado:", {
        error: err,
        message: err instanceof Error ? err.message : "Erro desconhecido",
        cardapioId,
      });
      setIsOpen(null);
    }
  }, [cardapioId, supabase]);

  useEffect(() => {
    if (isClient) {
      // Calcular dias do teste
      calculateTrialDaysLeft();

      // Só executa se temos um cardapioId
      if (cardapioId) {
        checkIfOpen();
        // Atualiza a cada 30 segundos para refletir mudanças mais rapidamente
        const interval = setInterval(checkIfOpen, 30 * 1000);
        return () => clearInterval(interval);
      } else {
        console.warn("Header: cardapioId não fornecido");
        setIsOpen(null);
      }
    }
  }, [cardapioId, isClient, checkIfOpen, calculateTrialDaysLeft]);

  const handleCopyLink = async () => {
    const url = `${slug}.delivize.menu`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Falha ao copiar:", err);
      // Fallback para navegadores que não suportam clipboard API
      try {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error("Fallback de cópia também falhou:", fallbackErr);
      }
    }
  };

  const handleViewMenu = () => {
    const url = `https://${slug}.delivize.menu`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const getTrialMessage = () => {
    if (trialDaysLeft === null) return null;

    if (trialDaysLeft === 0) {
      return "Seu teste acabou!";
    } else if (trialDaysLeft === 1) {
      return "Seu teste termina amanhã!";
    } else {
      return `Seu teste termina em ${trialDaysLeft} dias!`;
    }
  };

  const getTrialColor = () => {
    if (trialDaysLeft === null) return "orange";

    if (trialDaysLeft <= 2) {
      return "red"; // Vermelho para urgente (0-2 dias)
    } else if (trialDaysLeft <= 5) {
      return "yellow"; // Amarelo para atenção (3-5 dias)
    } else {
      return "orange"; // Laranja para normal (6+ dias)
    }
  };

  const trialColor = getTrialColor();
  const trialMessage = getTrialMessage();

  return (
    <header className="w-full bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        {/* Lado esquerdo - Menu mobile + Título */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Botão do menu mobile */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <MenuIcon size={20} className="text-gray-600" />
          </button>

          {/* Título - sempre visível, mas responsivo */}
          <h1 className="text-base sm:text-lg lg:text-2xl font-semibold text-gray-900 truncate">
            {title}
          </h1>
        </div>

        {/* Centro - Status Aberto/Fechado - hidden em mobile */}
        {isClient && isOpen !== null && (
          <div
            className={`hidden sm:flex absolute left-1/2 -translate-x-1/2 items-center gap-2 rounded-lg px-3 lg:px-4 py-2 border ${
              isOpen
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <Clock
              className={`w-4 h-4 ${
                isOpen ? "text-green-600" : "text-red-600"
              }`}
            />
            <span className="text-sm font-medium">
              {isOpen ? "Aberto" : "Fechado"}
            </span>
          </div>
        )}

        {/* Lado direito - Mobile: apenas ícones, Desktop: layout completo */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile: apenas ícones */}
          <div className="flex sm:hidden items-center gap-2">
            {/* Status como ícone de relógio colorido */}
            {isClient && isOpen !== null && (
              <div className="p-2">
                <Clock
                  className={`w-5 h-5 ${
                    isOpen ? "text-green-600" : "text-red-600"
                  }`}
                />
              </div>
            )}

            {/* Ver cardápio - ícone de olho */}
            <button
              onClick={handleViewMenu}
              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200"
              title="Ver Cardápio"
            >
              <Eye className="w-5 h-5" />
            </button>

            {/* Copiar link */}
            <button
              onClick={handleCopyLink}
              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200"
              title={copied ? "Copiado!" : "Copiar Link"}
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Desktop/Tablet: layout completo */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Aviso de teste/upgrade - hidden em mobile small */}
            {trialMessage && (
              <div
                className={`hidden md:flex items-center gap-2 rounded-lg px-3 lg:px-4 py-2 border ${
                  trialColor === "red"
                    ? "bg-red-50 border-red-200"
                    : trialColor === "yellow"
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-orange-50 border-orange-200"
                }`}
              >
                <Crown
                  className={`w-4 h-4 ${
                    trialColor === "red"
                      ? "text-red-600"
                      : trialColor === "yellow"
                      ? "text-yellow-600"
                      : "text-orange-600"
                  }`}
                />
                <span
                  className={`text-xs lg:text-sm font-medium ${
                    trialColor === "red"
                      ? "text-red-800"
                      : trialColor === "yellow"
                      ? "text-yellow-800"
                      : "text-orange-800"
                  }`}
                >
                  {trialMessage}
                </span>
              </div>
            )}

            {/* Botões Ver Cardápio e Copiar */}
            <div className="flex">
              <button
                onClick={handleViewMenu}
                className="inline-flex items-center px-3 sm:px-4 lg:px-6 py-2 lg:py-2.5 text-xs sm:text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-l-lg hover:bg-emerald-700 transition-all duration-200"
              >
                Ver Cardápio
              </button>

              <button
                onClick={handleCopyLink}
                className="inline-flex items-center px-2 sm:px-3 py-2 lg:py-2.5 text-sm font-medium text-white bg-emerald-600 border border-l-emerald-700 border-transparent rounded-r-lg hover:bg-emerald-700 transition-all duration-200"
                title={copied ? "Copiado!" : "Copiar Link"}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-200 transition-all duration-200" />
                ) : (
                  <Copy className="w-4 h-4 transition-all duration-200" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
