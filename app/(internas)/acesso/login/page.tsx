"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";

import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // 🔥 Buscar cardápio já criado para esse usuário
        const { data: cardapio, error: cardapioError } = await supabase
          .from("cardapios")
          .select("subdomain")
          .eq("user_id", data.user.id)
          .single();

        if (cardapioError || !cardapio) {
          throw new Error("Nenhum cardápio encontrado para este usuário.");
        }

        // ✅ Redirecionar para /cardapio/{subdomain}
        router.push(`/cardapio/${cardapio.subdomain}`);
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-[#F0FDF4] to-white p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border border-gray-200">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-[#059669]">
              Acessar Conta
            </CardTitle>
            <CardDescription className="mt-1 text-gray-600">
              Entre para gerenciar seu cardápio 🚀
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">
                  {error}
                </p>
              )}

              {/* Botão principal */}
              <Button
                type="submit"
                className="w-full bg-[#059669] hover:bg-[#047857] transition"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>

              {/* Separador */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">ou</span>
                </div>
              </div>

              {/* Google Button (mock, se quiser integrar depois) */}
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="h-5 w-5"
                />
                Entrar com Google
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              Não tem conta?{" "}
              <Link
                href="/acesso/cadastro"
                className="font-medium text-[#059669] hover:underline"
              >
                Criar conta
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
