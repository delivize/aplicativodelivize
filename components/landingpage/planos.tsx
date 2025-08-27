// components/Planos.tsx
export default function Planos() {
  return (
    <section id="planos" className="py-20 px-6 bg-white text-center">
      <h2 className="text-3xl font-madimi text-[#059669] mb-10">
        Escolha seu plano
      </h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="border p-6 rounded shadow hover:scale-105 transition">
          <h3 className="text-xl font-bold text-[#059669] mb-2">Gratuito</h3>
          <p className="text-gray-600 mb-4">14 dias de uso completo</p>
          <span className="text-2xl font-bold text-[#059669]">R$ 0</span>
        </div>
        <div className="border p-6 rounded shadow hover:scale-105 transition">
          <h3 className="text-xl font-bold text-[#059669] mb-2">
            Personalizado
          </h3>
          <p className="text-gray-600 mb-4">Preço baseado no faturamento</p>
          <span className="text-2xl font-bold text-[#059669]">
            Sob consulta
          </span>
        </div>
        <div className="border p-6 rounded shadow hover:scale-105 transition">
          <h3 className="text-xl font-bold text-[#059669] mb-2">PRO</h3>
          <p className="text-gray-600 mb-4">
            Recursos completos e suporte premium
          </p>
          <span className="text-2xl font-bold text-[#059669]">R$ 249/mês</span>
        </div>
      </div>
    </section>
  );
}
