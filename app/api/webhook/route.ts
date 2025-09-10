import stripe from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/server"; // 👈 client server-side do Supabase

const secret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = (await headers()).get("stripe-signature");

    if (!secret || !signature) {
      throw new Error("Missing secret or signature");
    }

    const event = stripe.webhooks.constructEvent(body, signature, secret);
    const supabase = await createClient();

    switch (event.type) {
      case "checkout.session.completed": {
        if (event.data.object.mode === "subscription") {
          const session = event.data.object as any;
          const userId = session.metadata?.userId; // 👈 vem do metadata
          const subscriptionId = session.subscription as string;
          const customerEmail = session.customer_details?.email;

          console.log("✅ Assinatura criada com sucesso", {
            userId,
            subscriptionId,
            customerEmail,
          });

          if (userId && subscriptionId) {
            const { error } = await supabase
              .from("profiles")
              .update({
                is_premium: true,
                subscription_id: subscriptionId, // 👈 salva no Supabase
              })
              .eq("id", userId);

            if (error) console.error("Erro ao atualizar Supabase:", error);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const subscriptionId = subscription.id;

        console.log("❌ Assinatura cancelada", subscriptionId);

        // 🔍 Buscar o usuário que tem esse subscription_id
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("subscription_id", subscriptionId)
          .single();

        if (profile) {
          const { error } = await supabase
            .from("profiles")
            .update({
              is_premium: false,
              subscription_id: null, // 👈 limpa
            })
            .eq("id", profile.id);

          if (error) console.error("Erro ao atualizar Supabase:", error);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;
        console.log("💰 Renovação paga", invoice.subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        console.log("⚠️ Pagamento da renovação falhou", invoice.subscription);
        break;
      }
    }

    return NextResponse.json({ result: event, ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: `Webhook error: ${error}`, ok: false },
      { status: 500 }
    );
  }
}
