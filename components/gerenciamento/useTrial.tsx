"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import { createClient } from "@/lib/client";

interface TrialContextType {
  trialDaysLeft: number | null;
  isTrialExpired: boolean;
  isLoading: boolean;
  isPremium: boolean;
  showExpiredPopup: boolean;
  setShowExpiredPopup: (show: boolean) => void;
  checkTrialStatus: () => Promise<void>;
}

const TrialContext = createContext<TrialContextType | null>(null);

export function TrialProvider({ children }: { children: React.ReactNode }) {
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [showExpiredPopup, setShowExpiredPopup] = useState(false);

  const supabase = createClient();

  const checkTrialStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setTrialDaysLeft(null);
        setIsPremium(false);
        setIsLoading(false);
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
        setIsPremium(false);
        setIsLoading(false);
        return;
      }

      // Se já é premium, não precisa verificar teste
      if (profile.is_premium) {
        setTrialDaysLeft(null);
        setIsPremium(true);
        setIsLoading(false);
        return;
      }

      setIsPremium(false);

      // Calcular dias restantes do teste
      const trialStartDate = profile.trial_start_date
        ? new Date(profile.trial_start_date)
        : new Date(user.created_at);

      const now = new Date();
      const trialEndDate = new Date(trialStartDate);
      trialEndDate.setDate(trialEndDate.getDate() + 14); // 14 dias de teste

      const diffTime = trialEndDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const daysLeft = Math.max(0, diffDays);
      setTrialDaysLeft(daysLeft);
    } catch (error) {
      console.error("Erro ao verificar status do teste:", error);
      setTrialDaysLeft(null);
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Bloquear TODOS os cliques quando teste expira
  useEffect(() => {
    const isTrialExpired = trialDaysLeft === 0 && !isPremium;

    if (isTrialExpired) {
      const handleGlobalClick = (e: MouseEvent) => {
        // Não bloquear cliques no próprio popup
        const target = e.target as HTMLElement;
        if (target.closest("[data-trial-popup]")) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setShowExpiredPopup(true);
      };

      const handleGlobalSubmit = (e: SubmitEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowExpiredPopup(true);
      };

      const handleGlobalKeydown = (e: KeyboardEvent) => {
        // Bloquear teclas importantes (Enter, Space, etc.)
        if (["Enter", " ", "Space"].includes(e.key)) {
          const target = e.target as HTMLElement;
          if (target.closest("[data-trial-popup]")) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          setShowExpiredPopup(true);
        }
      };

      // Adicionar listeners globais
      document.addEventListener("click", handleGlobalClick, true);
      document.addEventListener("submit", handleGlobalSubmit, true);
      document.addEventListener("keydown", handleGlobalKeydown, true);

      // Adicionar classe CSS global para visual
      document.body.classList.add("trial-expired-global");

      return () => {
        document.removeEventListener("click", handleGlobalClick, true);
        document.removeEventListener("submit", handleGlobalSubmit, true);
        document.removeEventListener("keydown", handleGlobalKeydown, true);
        document.body.classList.remove("trial-expired-global");
      };
    }
  }, [trialDaysLeft, isPremium]);

  useEffect(() => {
    checkTrialStatus();

    // Verificar a cada 5 minutos
    const interval = setInterval(checkTrialStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkTrialStatus]);

  const isTrialExpired = trialDaysLeft === 0 && !isPremium;

  return (
    <TrialContext.Provider
      value={{
        trialDaysLeft,
        isTrialExpired,
        isLoading,
        isPremium,
        showExpiredPopup,
        setShowExpiredPopup,
        checkTrialStatus,
      }}
    >
      {children}
    </TrialContext.Provider>
  );
}

export function useTrial() {
  const context = useContext(TrialContext);
  if (!context) {
    throw new Error("useTrial deve ser usado dentro de TrialProvider");
  }
  return context;
}
