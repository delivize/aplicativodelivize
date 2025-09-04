// components/Footer.tsx
"use client";

import Image from "next/image";
import { Facebook, Instagram, Mail } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#F0FDF4] text-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* grid de 3 colunas, alinhadas pelo topo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* BRAND */}
          <div className="flex items-start gap-3">
            <Image
              src="/logodelivize.svg"
              alt="Delivize"
              width={48}
              height={48}
              priority={true}
            />
            <div>
              {/* título com mesmo tamanho dos outros headings para evitar desalinhamento */}
              <h4 className="text-lg font-semibold text-[#059669]">Delivize</h4>
              <p className="mt-1 text-sm text-gray-600 max-w-xs leading-relaxed">
                Plataforma que ajuda seu delivery a vender mais e encantar
                clientes.
              </p>
            </div>
          </div>

          {/* LINKS */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Navegação</h4>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              <li>
                <a href="/sobre" className="hover:text-[#059669] transition">
                  Sobre
                </a>
              </li>
              <li>
                <a href="#planos" className="hover:text-[#059669] transition">
                  Planos
                </a>
              </li>
              <li>
                <a href="/recursos" className="hover:text-[#059669] transition">
                  Recursos
                </a>
              </li>
              <li>
                <a href="/contato" className="hover:text-[#059669] transition">
                  Contato
                </a>
              </li>
            </ul>
          </div>

          {/* CONTATO + REDES */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contato</h4>

            <div className="text-sm mb-4">
              <a
                href="mailto:contato@delivize.com"
                className="block hover:text-[#059669] transition"
              >
                contato@delivize.com
              </a>
              <a
                href="/suporte"
                className="block hover:text-[#059669] transition"
              >
                Central de suporte
              </a>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="p-2 rounded-md hover:bg-white/30 transition"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="p-2 rounded-md hover:bg-white/30 transition"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Instagram size={18} />
              </a>
              <a
                href="mailto:contato@delivize.com"
                aria-label="Email"
                className="p-2 rounded-md hover:bg-white/30 transition"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* linha final */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-600">
          <div>
            © {year} <span className="font-semibold">Delivize</span>. Todos os
            direitos reservados.
          </div>
          <div className="flex gap-4">
            <a href="/privacidade" className="hover:text-[#059669] transition">
              Política de privacidade
            </a>
            <a href="/termos" className="hover:text-[#059669] transition">
              Termos de uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
