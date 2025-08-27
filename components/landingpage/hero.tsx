// components/Hero.tsx
"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F0FDF4] to-white py-24 px-6 text-center">
      {/* Background decorativo */}
      <div className="absolute inset-0 -z-10 flex justify-center opacity-30">
        <div className="w-[600px] h-[600px] bg-green-200 rounded-full blur-3xl"></div>
      </div>

      {/* Título */}
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-4xl md:text-6xl font-madimi text-[#059669] mb-6 leading-tight"
      >
        Crie cardápios digitais
        <span className="block text-[#047857]">
          profissionais para seu delivery
        </span>
      </motion.h1>

      {/* Subtítulo */}
      <motion.p
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto"
      >
        A <span className="font-semibold text-[#059669]">Delivize</span> é a
        plataforma ideal para transformar seu cardápio em uma experiência
        digital irresistível, prática e lucrativa.
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="flex justify-center gap-4"
      >
        <a
          href="#cta"
          className="bg-[#059669] text-white px-8 py-4 rounded-full text-lg font-medium shadow-lg hover:bg-[#047857] hover:shadow-xl transition"
        >
          Comece grátis por 14 dias
        </a>
        <a
          href="#features"
          className="px-8 py-4 rounded-full text-lg font-medium border border-[#059669] text-[#059669] hover:bg-[#ECFDF5] transition"
        >
          Ver recursos
        </a>
      </motion.div>
    </section>
  );
}
