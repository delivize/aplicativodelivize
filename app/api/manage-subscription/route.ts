import stripe from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Recupera o usuário logado
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    // Dados enviados pelo frontend
    const { subscriptionId } = await req.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "subscriptionId é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar o customerId da assinatura
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customerId = subscription.customer as string;

    // Criar a sessão do portal de gerenciamento de assinatura
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${req.headers.get("origin")}/conta`, // usando o mesmo padrão da API de checkout
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("Erro ao criar portal session:", err);
    return NextResponse.json(
      { error: "Erro ao criar portal de gerenciamento" },
      { status: 500 }
    );
  }
}
