// app/custom/[domain]/page.tsx
interface CustomDomainPageProps {
  params: {
    domain: string;
  };
}

export default async function CustomDomainPage({
  params,
}: CustomDomainPageProps) {
  const { domain } = params;

  console.log("🎯 [PAGE] Renderizando página para domínio:", domain);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎉 Funcionou!
          </h1>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-semibold">
              Domínio personalizado ativo:
            </p>
            <p className="text-green-600 text-lg font-mono mt-1">{domain}</p>
          </div>
          <div className="text-gray-600 space-y-2">
            <p>✅ Middleware funcionando</p>
            <p>✅ Rota dinâmica funcionando</p>
            <p>✅ Próximo passo: conectar com banco</p>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Debug:</strong> Se você vê esta página, o sistema de
              domínios personalizados está funcionando! Agora só precisa
              conectar com os dados do restaurante.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
