// components/CTA.tsx
export default function CTA() {
  return (
    <section id="cta" className="py-20 px-6 bg-white text-center">
      <h2 className="text-3xl font-madimi text-[#059669] mb-4">
        Pronto para transformar seu cardápio?
      </h2>
      <p className="text-gray-700 mb-6">
        Crie sua conta agora e aproveite 14 dias grátis.
      </p>
      <a
        href="/cadastro"
        className="bg-[#059669] text-white px-6 py-3 rounded-full text-lg hover:bg-[#047857] transition"
      >
        Criar Conta
      </a>
    </section>
  );
}
