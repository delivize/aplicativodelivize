// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="py-6 px-6 bg-[#F0FDF4] text-center text-sm text-gray-600">
      © {new Date().getFullYear()} Delivize. Todos os direitos reservados.
    </footer>
  );
}
