"use client";

import { TrialProvider, useTrial } from "@/components/gerenciamento/useTrial";
import AvisoPopup from "@/components/gerenciamento/AvisoPopup";

// Componente interno que usa o contexto
function AppContent({ children }: { children: React.ReactNode }) {
  const { showExpiredPopup, setShowExpiredPopup } = useTrial();

  const handleClosePopup = () => {
    setShowExpiredPopup(false);
  };

  return (
    <>
      {/* Conteúdo principal - NADA MUDA AQUI! */}
      {children}

      {/* Apenas adicione o popup */}
      <AvisoPopup isOpen={showExpiredPopup} onClose={handleClosePopup} />
    </>
  );
}

// Layout principal com provider - SÓ ISSO!
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <TrialProvider>
      <AppContent>{children}</AppContent>
    </TrialProvider>
  );
}
