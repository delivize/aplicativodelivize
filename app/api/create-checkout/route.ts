import stripe from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/server"; // client server-side do Supabase

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
    const { testeId } = await req.json();

    // Cria a sessão de checkout
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: process.env.STRIPE_SUBSCRIPTION_PRICE_ID as string,
          quantity: 1,
        },
      ],
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email, // vincula o email do Supabase
      success_url: `${req.headers.get("origin")}/sucesso`,
      cancel_url: `${req.headers.get("origin")}/`,
      metadata: {
        userId: user.id, // 👈 ESSENCIAL pro webhook
        testeId, // se ainda quiser usar
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error("Erro ao criar checkout:", err);
    return NextResponse.json(
      { error: "Erro ao criar checkout" },
      { status: 500 }
    );
  }
}
