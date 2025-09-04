"use client";

import { X, Trash2 } from "lucide-react";
import { Categoria } from "./categorias.jsx";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface CategoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoria: Categoria;
  onChange: (field: keyof Categoria, value: any) => void;
  onSave: () => void;
  saving?: boolean;
  onDelete?: () => void;
}

export default function CategoriaModal({
  isOpen,
  onClose,
  categoria,
  onChange,
  onSave,
  saving = false,
  onDelete,
}: CategoriaModalProps) {
  const [preview, setPreview] = useState<string | null>(
    (categoria.photo_url as string) ?? null
  );

  // Mantém o componente montado até a animação de saída terminar
  const [mounted, setMounted] = useState<boolean>(isOpen);
  useEffect(() => {
    if (isOpen) setMounted(true);
  }, [isOpen]);

  // Sincroniza preview quando trocar a categoria externa
  useEffect(() => {
    setPreview((categoria.photo_url as string) ?? null);
  }, [categoria?.photo_url]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Envia o arquivo para o parent
    onChange("photo_url", file);
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onChange("photo_url", null);
    // reseta o input para permitir reenviar o mesmo arquivo depois
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const overlayVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 },
  };

  const modalVariants = {
    open: { opacity: 1, scale: 1, y: 0 },
    closed: { opacity: 0, scale: 0.96, y: 12 },
  };

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => {
        if (!isOpen) setMounted(false);
      }}
    >
      {mounted && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-hidden={!isOpen}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          variants={overlayVariants}
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          exit="closed"
        >
          {/* backdrop separado para permitir animação e clique fora */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            variants={overlayVariants}
            initial={false}
            animate={isOpen ? "open" : "closed"}
            exit="closed"
            onClick={() => !saving && onClose()}
          />
          <motion.div
            className="relative bg-white w-full max-w-lg rounded-xl shadow-xl p-6"
            variants={modalVariants}
            initial="closed"
            animate={isOpen ? "open" : "closed"}
            exit="closed"
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {/* Botão fechar */}
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {categoria?.id ? "Editar Categoria" : "Nova Categoria"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da categoria *
                </label>
                <input
                  type="text"
                  value={categoria?.name ?? ""}
                  onChange={(e) =>
                    onChange("name", e.target.value.slice(0, 30))
                  }
                  placeholder="Ex: Hambúrgueres, Bebidas..."
                  disabled={saving}
                  maxLength={30}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:bg-gray-50"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {categoria?.name?.length ?? 0}/30 caracteres
                </p>
              </div>

              {/* Upload da foto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Foto da categoria
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  disabled={saving}
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 
                             file:rounded-lg file:border-0 
                             file:text-sm file:font-medium
                             file:bg-emerald-50 file:text-emerald-700
                             hover:file:bg-emerald-100 disabled:opacity-50"
                />

                {preview && (
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={preview}
                      alt="Pré-visualização"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50"
                      aria-label="Remover imagem"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remover imagem
                    </button>
                  </div>
                )}
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={categoria?.description ?? ""}
                  onChange={(e) => onChange("description", e.target.value)}
                  placeholder="Descrição opcional..."
                  rows={3}
                  disabled={saving}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:bg-gray-50"
                />
              </div>

              {/* Ativo */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(categoria?.is_active)}
                  onChange={(e) => onChange("is_active", e.target.checked)}
                  disabled={saving}
                  className="w-4 h-4 accent-emerald-600 disabled:opacity-50"
                />
                <span className="text-sm text-gray-700">Categoria ativa</span>
              </div>

              {/* Ações */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                {onDelete && categoria?.id && (
                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={saving}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50"
                  >
                    Excluir
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    !(categoria?.name && categoria.name.trim().length > 0)
                  }
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
