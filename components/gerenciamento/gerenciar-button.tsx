"use client";

import { useState } from "react";

interface ManageSubscriptionButtonProps {
  subscriptionId: string;
}

export default function ManageSubscriptionButton({
  subscriptionId,
}: ManageSubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/manage-subscription", {
        // URL corrigida aqui
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Erro ao abrir o gerenciamento de assinatura.");
      }
    } catch (err) {
      console.error(err);
      alert("Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="mt-2 w-full inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Carregando..." : "Gerenciar Assinatura"}
    </button>
  );
}
