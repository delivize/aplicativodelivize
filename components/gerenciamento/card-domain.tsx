"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface VerificationRecord {
  type: string;
  domain: string;
  value: string;
}

export default function CardDomain() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [verificationRecords, setVerificationRecords] = useState<
    VerificationRecord[]
  >([]);
  const [verified, setVerified] = useState<boolean | null>(null);

  async function addDomain() {
    setLoading(true);
    setMessage(null);
    setVerified(null);
    try {
      const res = await fetch("/api/add-domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Erro ao adicionar domínio");
      } else {
        setMessage("Domínio enviado para verificação");
        setVerificationRecords(data.vercelResponse?.verification || []);
        setVerified(data.vercelResponse?.verified ?? null);
      }
    } catch (err) {
      setMessage("Erro ao comunicar com servidor");
    } finally {
      setLoading(false);
    }
  }

  async function checkDomain() {
    if (!domain) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/check-domain?domain=${domain}`);
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Erro ao verificar domínio");
      } else {
        setVerified(data.verified ?? false);
        setVerificationRecords(data.verification || []);
        setMessage(
          data.verified
            ? "✅ Domínio verificado com sucesso!"
            : "⏳ Ainda não verificado"
        );
      }
    } catch (err) {
      setMessage("Erro ao verificar domínio");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-lg mx-auto mt-6 shadow-lg rounded-2xl border p-4">
      <CardContent className="space-y-4">
        <h2 className="text-xl font-bold">Domínio Personalizado</h2>
        <p className="text-gray-600 text-sm">
          Adicione seu domínio personalizado (ex:{" "}
          <strong>meupizzaria.com</strong>) e siga as instruções de DNS abaixo.
        </p>

        <div className="flex space-x-2">
          <Input
            placeholder="meudominio.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
          <Button onClick={addDomain} disabled={loading}>
            {loading ? "Carregando..." : "Adicionar"}
          </Button>
        </div>

        {message && <p className="text-sm mt-2">{message}</p>}

        {verificationRecords.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3 border mt-3">
            <h3 className="font-semibold mb-2">Registros DNS necessários:</h3>
            <ul className="space-y-2">
              {verificationRecords.map((rec, i) => (
                <li key={i} className="text-sm bg-white p-2 rounded border">
                  <p>
                    <strong>Tipo:</strong> {rec.type}
                  </p>
                  <p>
                    <strong>Nome:</strong> {rec.domain}
                  </p>
                  <p>
                    <strong>Valor:</strong> {rec.value}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {verified !== null && (
          <div className="mt-3">
            {verified ? (
              <p className="text-green-600 font-semibold">
                ✅ Seu domínio já está ativo!
              </p>
            ) : (
              <p className="text-orange-600 font-semibold">
                ⏳ Domínio ainda não verificado.
              </p>
            )}
          </div>
        )}

        <Button
          onClick={checkDomain}
          variant="outline"
          disabled={!domain || loading}
        >
          Verificar Status
        </Button>
      </CardContent>
    </Card>
  );
}
