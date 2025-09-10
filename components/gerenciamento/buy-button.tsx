"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";

export default function SubscribeButton() {
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  async function handleClick(testeId: string) {
    try {
      setIsCreatingCheckout(true);
      const checkoutResponse = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assinatura: true, testeId }),
      });

      const stripeClient = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUB_KEY as string
      );

      if (!stripeClient) throw new Error("Stripe failed to initialize.");

      const { sessionId } = await checkoutResponse.json();
      await stripeClient.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreatingCheckout(false);
    }
  }

  return (
    <button
      disabled={isCreatingCheckout}
      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
      onClick={() => handleClick("123")}
    >
      Fazer Upgrade Agora
    </button>
  );
}
