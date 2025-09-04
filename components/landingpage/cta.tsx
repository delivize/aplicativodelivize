// components/CTA.tsx
export default function CTA() {
  return (
    <section
      id="cta"
      className="relative py-24 px-6 text-center bg-gradient-to-r from-[#059669] to-[#34d399] text-white overflow-hidden"
    >
      {/* Background effect */}
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />

      <div className="relative z-10 max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-madimi mb-6 animate-fade-in">
          Pronto para transformar seu delivery?
        </h2>
        <p className="text-lg md:text-xl mb-8 text-white/90">
          Crie sua conta agora e aproveite{" "}
          <span className="font-bold">14 dias grátis</span> sem compromisso.
        </p>

        <a
          href="/cadastro"
          className="inline-block bg-white text-[#059669] px-10 py-4 rounded-full text-lg font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition-transform"
        >
          🚀 Criar minha conta grátis
        </a>

        <p className="mt-4 text-sm text-white/80">
          Sem cartão de crédito • Cancelamento fácil
        </p>
      </div>
    </section>
  );
}
