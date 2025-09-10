"use client";

import { useState, useEffect } from "react";
import { Save, User, Mail, Lock, Camera, LogOut, Trash2 } from "lucide-react";
import { createClient } from "@/lib/client";
import AlterarEmail from "./AlterarEmail";
import AlterarSenha from "./AlterarSenha";
import SubscribeButton from "./buy-button";
import ManageSubscriptionButton from "./gerenciar-button"; // 👈 botão de gerenciar assinatura

export default function ContaView() {
  const supabase = createClient();

  const [form, setForm] = useState({
    nome: "",
    email: "",
    foto: "",
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [emailModal, setEmailModal] = useState(false);
  const [senhaModal, setSenhaModal] = useState(false);

  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null); // 👈 estado do subscription_id

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) throw userError;

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("nome, avatar_url, is_premium, subscription_id")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        setForm({
          nome: profile?.nome ?? "",
          email: user.email ?? "",
          foto: profile?.avatar_url ?? "",
        });

        setIsPremium(profile?.is_premium ?? false);
        setSubscriptionId(profile?.subscription_id ?? null); // 👈 setando subscription_id
      } catch (err) {
        console.error(err);
        setMessage({
          type: "error",
          text: "Erro ao carregar seus dados.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw userError;

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        nome: form.nome,
        avatar_url: form.foto,
      });

      if (profileError) throw profileError;

      setMessage({
        type: "success",
        text: "Dados salvos com sucesso!",
      });
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: "Erro ao salvar alterações.",
      });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      window.location.href = "/acesso/login";
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: "Erro ao desconectar. Tente novamente.",
      });
      setLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setMessage(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw userError;

      const response = await fetch("/api/delete-user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const responseData = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Conta deletada com sucesso!",
        });

        await supabase.auth.signOut();

        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        throw new Error(responseData.error || "Falha ao deletar conta");
      }
    } catch (err) {
      console.error("Erro ao deletar conta:", err);
      setMessage({
        type: "error",
        text: "Erro ao deletar conta. Entre em contato com o suporte.",
      });
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Carregando informações...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 w-full max-w-2xl mx-auto">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
        Minha Conta
      </h2>

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

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Digite seu nome"
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="flex items-center gap-2 relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="email"
              value={form.email}
              disabled
              className="flex-1 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setEmailModal(true)}
              className="text-emerald-600 text-sm font-medium hover:underline"
            >
              Alterar
            </button>
          </div>
        </div>

        {/* Senha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <div className="flex items-center gap-2 relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="password"
              value="********"
              disabled
              className="flex-1 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setSenhaModal(true)}
              className="text-emerald-600 text-sm font-medium hover:underline"
            >
              Alterar
            </button>
          </div>
        </div>

        {/* Botão salvar */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>

      {/* Sessão de assinatura */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Assinatura</h3>

        {isPremium === null ? (
          <p className="text-sm text-gray-600">Carregando...</p>
        ) : isPremium ? (
          <div>
            <p className="text-sm text-green-600 mb-4">
              🎉 Você já possui uma assinatura ativa!
            </p>
            <p className="text-sm text-gray-700 mb-2">
              Plano: <span className="font-medium">Premium</span>
            </p>
            <p className="text-sm text-gray-700 mb-2">
              Status: <span className="font-medium">Ativo</span>
            </p>

            {/* Botão de Gerenciar Assinatura */}
            {subscriptionId && (
              <ManageSubscriptionButton subscriptionId={subscriptionId} />
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Você ainda não possui uma assinatura ativa.
            </p>
            <SubscribeButton />
          </>
        )}
      </div>

      {/* Seção de ações da conta */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Ações da Conta
        </h3>

        <div className="space-y-3">
          {/* Botão Desconectar */}
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-800">Desconectar</p>
              <p className="text-xs text-gray-500">
                Fazer logout da sua conta neste dispositivo
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <LogOut className="w-4 h-4" />
              {loggingOut ? "Saindo..." : "Desconectar"}
            </button>
          </div>

          {/* Botão Deletar Conta */}
          <div className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
            <div>
              <p className="text-sm font-medium text-red-800">Deletar Conta</p>
              <p className="text-xs text-red-600">
                Esta ação não pode ser desfeita
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
            >
              <Trash2 className="w-4 h-4" />
              Deletar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de alterar email */}
      <AlterarEmail
        isOpen={emailModal}
        onClose={() => setEmailModal(false)}
        currentEmail={form.email}
      />

      {/* Modal de alterar senha */}
      <AlterarSenha isOpen={senhaModal} onClose={() => setSenhaModal(false)} />

      {/* Modal de confirmação de delete */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Confirmar Exclusão
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Tem certeza que deseja deletar sua conta? Esta ação é permanente e
              todos os seus dados serão perdidos.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-70"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? "Deletando..." : "Sim, Deletar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
