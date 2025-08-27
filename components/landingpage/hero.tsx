// components/Hero.tsx
export default function Hero() {
  return (
    <section className="text-center py-20 px-6 bg-[#F0FDF4]">
      <h1 className="text-4xl md:text-6xl font-madimi text-[#059669] mb-4 animate-fade-in">
        Crie cardápios incríveis para seu delivery
      </h1>
      <p className="text-lg text-gray-700 mb-6 max-w-xl mx-auto animate-fade-in delay-200">
        A Delivize é o SaaS ideal para transformar seu cardápio em uma
        experiência digital irresistível.
      </p>
      <a
        href="#cta"
        className="bg-[#059669] text-white px-6 py-3 rounded-full text-lg hover:bg-[#047857] transition animate-fade-in delay-400"
      >
        Comece grátis por 14 dias
      </a>
    </section>
  );
}
