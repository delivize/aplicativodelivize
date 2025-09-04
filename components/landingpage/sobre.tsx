// components/Sobre.tsx
"use client";

import { motion } from "framer-motion";
import { Rocket, TrendingUp, Clock } from "lucide-react";

export default function Sobre() {
  const features = [
    {
      icon: <Clock className="w-8 h-8 text-[#059669]" />,
      title: "Agilidade",
      desc: "Crie e edite cardápios em minutos sem precisar de conhecimento técnico.",
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-[#059669]" />,
      title: "Mais Vendas",
      desc: "Ofereça uma experiência digital irresistível e aumente a conversão dos seus pedidos.",
    },
    {
      icon: <Rocket className="w-8 h-8 text-[#059669]" />,
      title: "Crescimento",
      desc: "Leve seu delivery para outro nível com tecnologia simples e eficiente.",
    },
  ];

  return (
    <section
      id="sobre"
      className="py-24 px-6 bg-[#F0FDF4] relative overflow-hidden"
    >
      {/* fundo decorativo */}
      <div className="absolute inset-0 -z-10 flex justify-center">
        <div className="w-[600px] h-[600px] bg-emerald-200 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-madimi text-[#059669] mb-8"
        >
          Por que usar a <span className="text-[#047857]">Delivize?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-700 max-w-3xl mx-auto text-lg mb-16"
        >
          Criar cardápios digitais nunca foi tão fácil. Com a{" "}
          <span className="font-semibold text-[#059669]">Delivize</span>, você
          economiza tempo, melhora a experiência do cliente e aumenta suas
          vendas com um sistema intuitivo e personalizável.
        </motion.p>

        {/* Cards de destaque */}
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition text-center"
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-[#059669] mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
