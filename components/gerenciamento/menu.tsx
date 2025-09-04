"use client";

import {
  Home,
  Brush,
  User,
  Clock,
  Package,
  Folder,
  X,
  Bot, // 👈 ícone robozinho
  MessageCircle, // 👈 ícone para WhatsApp
  Upload, // 👈 ícone para Uploads
  KanbanSquare, // 👈 Ícone para Pedidos (Kanban)
  Ticket, // 👈 ícone para Cupons
  Bike, // 👈 ícone para Entregadores
  Star, // 👈 ícone para Avaliações
  CreditCard, // 👈 ícone para Formas de Pagamento
  Printer, // 👈 ícone para Impressoras
} from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";

interface MenuProps {
  onSelect: (view: string) => void;
  selected: string;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Menu({
  onSelect,
  selected,
  isMobileOpen = false,
  onMobileClose,
}: MenuProps) {
  const menuItems = [
    { id: "inicio", label: "Início", icon: Home },
    { id: "produtos", label: "Produtos", icon: Package },
    { id: "categorias", label: "Categorias", icon: Folder },
    { id: "pedidos", label: "Pedidos", icon: KanbanSquare },
    { id: "entregadores", label: "Entregadores", icon: Bike },
    { id: "avaliacoes", label: "Avaliações", icon: Star },
    { id: "cupons", label: "Cupons", icon: Ticket },
    { id: "pagamentos", label: "Formas de Pagamento", icon: CreditCard },
    { id: "impressoras", label: "Impressoras", icon: Printer },
    { id: "horarios", label: "Horários", icon: Clock },
    { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
    { id: "chatbot", label: "Chatbot", icon: Bot },
    { id: "uploads", label: "Uploads", icon: Upload },
    { id: "design", label: "Design", icon: Brush },
  ];

  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email || "");
    };
    getUser();
  }, [supabase]);

  const handleMenuItemClick = (itemId: string) => {
    onSelect(itemId);
    if (onMobileClose) onMobileClose();
  };

  return (
    <>
      {/* Menu Desktop */}
      <div className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col h-full">
        {/* Header */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <img src="/logodelivize.svg" alt="Delivize" className="w-8 h-8" />
            <span className="text-xl font-semibold text-gray-900">
              Delivize
            </span>
          </div>
        </div>

        {/* Divider alinhado */}
        <div className="px-4">
          <div className="border-b border-gray-200" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isSelected = selected === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => onSelect(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={
                        isSelected ? "text-emerald-700" : "text-gray-500"
                      }
                    />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Account */}
        <div className="border-t border-gray-100 p-4">
          <button
            onClick={() => onSelect("conta")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              selected === "conta"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <User
              size={18}
              className={
                selected === "conta" ? "text-emerald-700" : "text-gray-500"
              }
            />
            <div className="flex flex-col items-start">
              <span>Minha Conta</span>
              <span className="text-xs text-gray-500 truncate max-w-[180px]">
                {userEmail || "Carregando..."}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header com botão de fechar */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logodelivize.svg" alt="Delivize" className="w-8 h-8" />
            <span className="text-xl font-semibold text-gray-900">
              Delivize
            </span>
          </div>
          <button
            onClick={onMobileClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Divider alinhado */}
        <div className="px-4">
          <div className="border-b border-gray-200" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isSelected = selected === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleMenuItemClick(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={
                        isSelected ? "text-emerald-700" : "text-gray-500"
                      }
                    />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Account */}
        <div className="border-t border-gray-100 p-4">
          <button
            onClick={() => handleMenuItemClick("conta")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              selected === "conta"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <User
              size={18}
              className={
                selected === "conta" ? "text-emerald-700" : "text-gray-500"
              }
            />
            <div className="flex flex-col items-start">
              <span>Minha Conta</span>
              <span className="text-xs text-gray-500 truncate max-w-[180px]">
                {userEmail || "Carregando..."}
              </span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
