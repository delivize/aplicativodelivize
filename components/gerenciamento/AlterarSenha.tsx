"use client";

import { useState } from "react";
import { X, Lock, Save, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/client";

interface AlterarSenhaProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AlterarSenha({ isOpen, onClose }: AlterarSenhaProps) {
  const supabase = createClient();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSalvar = async () => {
    if (!novaSenha || !confirmarSenha) {
      setMessage({ type: "error", text: "Preencha todos os campos." });
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setMessage({ type: "error", text: "As senhas não coincidem." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: novaSenha,
      });

      if (error) throw error;

      setMessage({ type: "success", text: "Senha alterada com sucesso!" });
      setNovaSenha("");
      setConfirmarSenha("");
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Erro ao alterar a senha." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
        {/* Botão Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Alterar Senha
        </h3>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Nova senha"
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Confirmar nova senha"
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={handleSalvar}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Salvando..."
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Senha
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
