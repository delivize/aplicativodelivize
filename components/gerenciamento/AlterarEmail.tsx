"use client";

import { useState } from "react";
import { X, Mail, Lock, Save, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/client";

interface AlterarEmailProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
}

export default function AlterarEmail({
  isOpen,
  onClose,
  currentEmail,
}: AlterarEmailProps) {
  const supabase = createClient();
  const [novoEmail, setNovoEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState<string | null>(null);

  if (!isOpen) return null;

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSave = async () => {
    setErrorMsg(null);

    if (!novoEmail.trim()) {
      setErrorMsg("Por favor, insira o novo email.");
      return;
    }
    if (!isValidEmail(novoEmail)) {
      setErrorMsg("Por favor, insira um email válido.");
      return;
    }
    if (!senha.trim()) {
      setErrorMsg("Por favor, insira sua senha.");
      return;
    }
    if (novoEmail === currentEmail) {
      setErrorMsg("O novo email deve ser diferente do atual.");
      return;
    }

    setLoading(true);

    try {
      // Reautenticar para segurança
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: currentEmail,
        password: senha,
      });

      if (loginError) {
        throw new Error("Senha incorreta.");
      }

      // Disparar processo de troca de email
      const { error: updateError } = await supabase.auth.updateUser({
        email: novoEmail,
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Mostrar popup de confirmação
      setConfirmationSent(novoEmail);
      setNovoEmail("");
      setSenha("");
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao alterar email.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNovoEmail("");
    setSenha("");
    setErrorMsg(null);
    setConfirmationSent(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          disabled={loading}
        >
          <X className="w-5 h-5" />
        </button>

        {!confirmationSent ? (
          <>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Alterar Email
            </h3>

            {errorMsg && (
              <div className="mb-3 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {errorMsg}
              </div>
            )}

            {/* Email Atual */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Atual
              </label>
              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                {currentEmail}
              </div>
            </div>

            {/* Novo Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Novo Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  value={novoEmail}
                  onChange={(e) => {
                    setNovoEmail(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="novo@email.com"
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Senha */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sua Senha (para confirmar)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-70"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading || !novoEmail.trim() || !senha.trim()}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-70"
              >
                <Save className="w-4 h-4" />
                {loading ? "Enviando..." : "Alterar Email"}
              </button>
            </div>
          </>
        ) : (
          // POPUP de confirmação
          <div className="text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Quase lá!
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Enviamos um link de confirmação para{" "}
              <span className="font-medium text-gray-800">
                {confirmationSent}
              </span>
              .<br />
              Clique no link para concluir a alteração do seu email.
            </p>
            <button
              onClick={handleClose}
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
            >
              Entendi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
