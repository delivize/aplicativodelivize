// components/Hero.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F0FDF4] via-white to-white py-32">
      {/* Background decorativo */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-green-200 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-[-150px] right-[-100px] w-[500px] h-[500px] bg-emerald-300 rounded-full blur-3xl opacity-30"></div>
      </div>

      {/* Container centralizado - mesmo do Header */}
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
        {/* Texto */}
        <div className="flex-1 text-center md:text-left">
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

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-700 mb-10 max-w-xl"
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
            className="flex flex-col sm:flex-row justify-center md:justify-start gap-4"
          >
            <a
              href="#cta"
              className="bg-[#059669] text-white px-8 py-4 rounded-full text-lg font-medium shadow-lg hover:scale-105 hover:shadow-xl transition"
            >
              Comece grátis por 14 dias
            </a>
            <a
              href="#features"
              className="px-8 py-4 rounded-full text-lg font-medium border border-[#059669] text-[#059669] hover:bg-[#ECFDF5] hover:scale-105 transition"
            >
              Ver recursos
            </a>
          </motion.div>
        </div>

        {/* Imagem/Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex-1 flex justify-center"
        >
          <Image
            src="/logodelivize.svg"
            alt="Mockup do cardápio digital"
            width={500}
            height={500}
            className="drop-shadow-2xl rounded-2xl"
          />
        </motion.div>
      </div>
    </section>
  );
}
