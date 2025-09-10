"use client";

import { X, Crown, Sparkles } from "lucide-react";
import SubscribeButton from "./buy-button";

interface AvisoPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AvisoPopup({ isOpen, onClose }: AvisoPopupProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay com blur */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 relative overflow-hidden"
          data-trial-popup
        >
          {/* Gradiente de fundo */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-red-50"></div>

          {/* Botão fechar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Conteúdo */}
          <div className="relative p-8 text-center">
            {/* Ícone principal */}
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
              <Crown className="w-10 h-10 text-white" />
            </div>

            {/* Título */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Seu teste gratuito expirou!
            </h2>

            {/* Descrição */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              Você aproveitou ao máximo seus 14 dias grátis! Para continuar
              usando todas as funcionalidades da Delivize, faça o upgrade para o
              plano premium.
            </p>

            {/* Features */}
            <div className="bg-white/70 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-700 mb-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Cardápios ilimitados</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700 mb-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Domínio personalizado</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Suporte prioritário</span>
              </div>
            </div>

            {/* Botões */}
            <div className="space-y-3">
              <SubscribeButton />

              <button
                onClick={onClose}
                className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
              >
                Continuar explorando (modo limitado)
              </button>
            </div>

            {/* Garantia */}
            <p className="text-xs text-gray-400 mt-4">
              💳 Sem compromisso • Cancele quando quiser
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
