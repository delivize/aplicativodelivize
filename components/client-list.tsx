"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { Trash2 } from "lucide-react";

interface Client {
  id: string;
  name: string;
  photo_url: string | null;
  subdomain: string;
  created_at: string;
}

interface ClientListProps {
  cardapios: Client[];
  onClientDeleted: () => void; // Added callback to refresh list after deletion
}

export function ClientList({ cardapios, onClientDeleted }: ClientListProps) {
  const [domain, setDomain] = useState("felipeecamila.store");
  const [deletingId, setDeletingId] = useState<string | null>(null); // Track which client is being deleted

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname.includes("felipeecamila.store")) {
        setDomain("felipeecamila.store");
      } else if (hostname !== "localhost") {
        // Se não for localhost, usar o hostname atual removendo subdomínios
        const parts = hostname.split(".");
        if (parts.length > 2) {
          setDomain(parts.slice(-2).join("."));
        } else {
          setDomain(hostname);
        }
      }
    }
  }, []);

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (!confirm(`Tem certeza que deseja remover o cliente "${clientName}"?`)) {
      return;
    }

    setDeletingId(clientId);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", clientId);

      if (error) {
        console.error("Erro ao deletar cliente:", error);
        alert("Erro ao remover cliente. Tente novamente.");
        return;
      }

      onClientDeleted(); // Refresh the list
    } catch (error) {
      console.error("Erro ao deletar cliente:", error);
      alert("Erro ao remover cliente. Tente novamente.");
    } finally {
      setDeletingId(null);
    }
  };

  if (cardapios.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">
            Nenhum cliente cadastrado ainda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {cardapios.map((client) => (
        <Card key={client.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {" "}
              {/* Added justify-between for delete button */}
              <div className="flex items-center gap-3">
                {client.photo_url && (
                  <Image
                    src={client.photo_url || "/placeholder.svg"}
                    alt={client.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                )}
                {client.name}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteClient(client.id, client.name)}
                disabled={deletingId === client.id}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Página:{" "}
              <span className="font-mono">
                {client.subdomain}.{domain}
              </span>
            </p>
            <a
              href={`https://${client.subdomain}.${domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              Ver página do cliente →
            </a>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
