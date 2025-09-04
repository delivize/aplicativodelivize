// components/Header.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logodelivize.svg"
            alt="Delivize Logo"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <span className="text-xl font-semibold text-[#059669]">Delivize</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#planos"
            className="text-gray-700 hover:text-[#059669] transition"
          >
            Planos
          </Link>
          <Link
            href="#sobre"
            className="text-gray-700 hover:text-[#059669] transition"
          >
            Sobre
          </Link>
          <Link
            href="/acesso/cadastro"
            className="bg-[#059669] text-white px-5 py-2 rounded-full shadow hover:bg-[#047857] transition"
          >
            Criar Conta
          </Link>
        </nav>

        {/* Mobile Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-sm">
          <nav className="flex flex-col items-center gap-4 py-4">
            <Link
              href="#planos"
              onClick={() => setOpen(false)}
              className="text-gray-700 hover:text-[#059669] transition"
            >
              Planos
            </Link>
            <Link
              href="#sobre"
              onClick={() => setOpen(false)}
              className="text-gray-700 hover:text-[#059669] transition"
            >
              Sobre
            </Link>
            <Link
              href="/acesso/cadastro"
              onClick={() => setOpen(false)}
              className="bg-[#059669] text-white px-5 py-2 rounded-full shadow hover:bg-[#047857] transition"
            >
              Criar Conta
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
