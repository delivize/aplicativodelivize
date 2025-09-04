// components/Planos.tsx
"use client";

import { motion } from "framer-motion";
import { CheckCircle, Star } from "lucide-react";

export default function Planos() {
  const planos = [
    {
      nome: "Gratuito",
      desc: "14 dias de uso completo",
      preco: "R$ 0",
      destaque: false,
      beneficios: [
        "Acesso completo",
        "Sem necessidade de cartão",
        "Ideal para testar",
      ],
    },
    {
      nome: "PRO",
      desc: "Recursos completos e suporte premium",
      preco: "R$ 129/mês",
      destaque: true,
      beneficios: [
        "Cardápios ilimitados",
        "Domínio personalizado",
        "Suporte premium",
        "Integrações avançadas",
      ],
    },
    {
      nome: "Personalizado",
      desc: "Preço baseado no faturamento",
      preco: "Sob consulta",
      destaque: false,
      beneficios: [
        "Solução sob medida",
        "Recursos corporativos",
        "Gestão multi-unidades",
        "Consultoria dedicada",
      ],
    },
  ];

  return (
    <section id="planos" className="py-24 px-6 bg-white relative">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-madimi text-[#059669] mb-4"
        >
          Escolha seu plano
        </motion.h2>
        <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
          Temos opções para todos os tipos de negócios — do pequeno delivery ao
          grande restaurante.
        </p>

        {/* Grid de planos */}
        <div className="grid md:grid-cols-3 gap-8">
          {planos.map((plano, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className={`relative rounded-2xl border shadow-lg p-8 flex flex-col items-center text-center transition hover:shadow-xl hover:scale-105 ${
                plano.destaque
                  ? "border-[#059669] bg-[#F0FDF4]"
                  : "border-gray-200 bg-white"
              }`}
            >
              {/* Badge de destaque */}
              {plano.destaque && (
                <span className="absolute -top-4 bg-[#059669] text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1 shadow">
                  <Star size={16} /> Mais Popular
                </span>
              )}

              <h3 className="text-2xl font-bold text-[#059669] mb-2">
                {plano.nome}
              </h3>
              <p className="text-gray-600 mb-4">{plano.desc}</p>
              <span className="text-3xl font-bold text-[#059669] mb-6">
                {plano.preco}
              </span>

              <ul className="text-gray-700 text-left mb-6 space-y-2">
                {plano.beneficios.map((b, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[#059669]" /> {b}
                  </li>
                ))}
              </ul>

              <a
                href="#cta"
                className={`w-full py-3 rounded-full font-medium transition ${
                  plano.destaque
                    ? "bg-[#059669] text-white hover:bg-[#047857]"
                    : "border border-[#059669] text-[#059669] hover:bg-[#ECFDF5]"
                }`}
              >
                {plano.destaque ? "Assinar agora" : "Saiba mais"}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
