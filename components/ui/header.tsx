import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Header({ onSignOut }: { onSignOut: () => void }) {
  return (
    <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <Image src="logotipo.svg" alt="Delivize Logo" width={40} height={40} />
        <span className="text-xl font-bold text-green-600">Delivize</span>
      </div>
      <Button variant="outline" onClick={onSignOut}>
        Sair
      </Button>
    </header>
  );
}
