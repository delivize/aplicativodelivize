// components/Header.tsx
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
      <div className="flex items-center gap-2">
        <Image
          src="/logodelivize.svg"
          alt="Delivize Logo"
          width={158}
          height={40}
        />
      </div>
      <nav className="flex gap-6">
        <Link href="#planos" className="text-[#059669] hover:underline">
          Planos
        </Link>
        <Link href="#sobre" className="text-[#059669] hover:underline">
          Sobre
        </Link>
        <Link
          href="/acesso/cadastro"
          className="bg-[#059669] text-white px-4 py-2 rounded hover:bg-[#047857] transition"
        >
          Criar Conta
        </Link>
      </nav>
    </header>
  );
}
