"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, GripVertical, Search } from "lucide-react";
import { createClient } from "@/lib/client";
import CategoriaModal from "./categoriaPopup";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export interface Categoria {
  id?: string;
  name: string;
  description: string;
  photo_url: string;
  order_index: number;
  is_active: boolean;
  cardapio_id: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface CategoriasManagerProps {
  cardapioId: string;
}

export default function CategoriasManager({
  cardapioId,
}: CategoriasManagerProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(
    null
  );
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [search, setSearch] = useState("");

  const supabase = createClient();

  // Carregar categorias
  useEffect(() => {
    loadCategorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardapioId]);

  const loadCategorias = async () => {
    if (!cardapioId) {
      setCategorias([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .eq("cardapio_id", cardapioId)
        .order("order_index", { ascending: true });

      if (error) throw error;
      setCategorias(data || []);
    } catch (err) {
      console.error("Erro ao carregar categorias:", err);
      showMessage("error", "Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Handler salvar (criar ou editar)
  const handleSave = async () => {
    if (!selectedCategoria) return;

    if (!selectedCategoria.name || !selectedCategoria.name.trim()) {
      showMessage("error", "Nome da categoria é obrigatório");
      return;
    }

    const effectiveCardapioId = selectedCategoria.cardapio_id || cardapioId;
    if (!effectiveCardapioId) {
      showMessage("error", "cardapio_id não definido. Atualize a página.");
      return;
    }

    setSaving(true);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const payload = {
      name: selectedCategoria.name.trim(),
      description: selectedCategoria.description ?? "",
      photo_url: selectedCategoria.photo_url ?? "",
      order_index:
        typeof selectedCategoria.order_index === "number"
          ? selectedCategoria.order_index
          : categorias.length,
      is_active: !!selectedCategoria.is_active,
      cardapio_id: effectiveCardapioId,
      user_id: userId,
    };

    try {
      if (selectedCategoria.id) {
        const { data, error } = await supabase
          .from("categorias")
          .update({
            name: payload.name,
            description: payload.description,
            photo_url: payload.photo_url,
            is_active: payload.is_active,
          })
          .eq("id", selectedCategoria.id)
          .select()
          .single();

        if (error) throw error;

        setCategorias((prev) =>
          prev.map((c) =>
            c.id === selectedCategoria.id ? { ...c, ...data } : c
          )
        );

        showMessage("success", "Categoria atualizada com sucesso!");
      } else {
        const maxIndex =
          categorias.length > 0
            ? Math.max(
                ...categorias.map((c) =>
                  typeof c.order_index === "number" ? c.order_index : 0
                )
              )
            : -1;
        payload.order_index = Math.max(0, maxIndex + 1);

        const { data, error } = await supabase
          .from("categorias")
          .insert(payload)
          .select("*")
          .single();

        if (error) throw error;

        setCategorias((prev) => [...prev, data]);
        showMessage("success", "Categoria criada com sucesso!");
      }
    } catch (error: any) {
      console.error("Erro ao salvar categoria:", error);
      showMessage("error", "Erro ao salvar categoria");
    } finally {
      setSaving(false);
      setSelectedCategoria(null);
      loadCategorias();
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    if (!confirm("Excluir essa categoria? Esta ação não pode ser desfeita."))
      return;
    setSaving(true);
    try {
      const { error } = await supabase.from("categorias").delete().eq("id", id);
      if (error) throw error;
      setCategorias((prev) => prev.filter((c) => c.id !== id));
      showMessage("success", "Categoria excluída com sucesso!");
    } catch (error: any) {
      console.error("Erro ao excluir categoria:", error);
      showMessage("error", "Erro ao excluir categoria");
    } finally {
      setSaving(false);
    }
  };

  // Drag & drop: atualizar ordem no banco automaticamente
  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const newCategorias = Array.from(categorias);
    const [moved] = newCategorias.splice(result.source.index, 1);
    newCategorias.splice(result.destination.index, 0, moved);

    setCategorias(newCategorias);

    try {
      for (let i = 0; i < newCategorias.length; i++) {
        const categoria = newCategorias[i];
        if (categoria.id) {
          await supabase
            .from("categorias")
            .update({ order_index: i })
            .eq("id", categoria.id);
        }
      }
    } catch (err) {
      console.error("Erro ao salvar ordenação:", err);
      showMessage("error", "Erro ao salvar nova ordem");
    }
  };

  if (loading) return <p className="p-6">Carregando categorias...</p>;

  // filtro em tempo real
  const filteredCategorias =
    search.trim().length > 0
      ? categorias.filter((c) =>
          c.name.toLowerCase().includes(search.toLowerCase())
        )
      : categorias;

  return (
    <div className="p-4 sm:p-6 w-full ">
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <p className="text-sm text-gray-600">
          Organize as categorias do seu cardápio
        </p>
        <button
          onClick={() => {
            if (!cardapioId) {
              showMessage("error", "Cardápio não definido. Atualize a página.");
              return;
            }
            const nextIndex =
              categorias.length > 0
                ? Math.max(
                    ...categorias.map((c) =>
                      typeof c.order_index === "number" ? c.order_index : 0
                    )
                  ) + 1
                : 0;
            setSelectedCategoria({
              name: "",
              description: "",
              photo_url: "",
              order_index: nextIndex,
              is_active: true,
              cardapio_id: cardapioId,
            });
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Nova Categoria
        </button>
      </div>

      {/* Barra de busca: só aparece se houver mais de 8 categorias */}
      {categorias.length > 8 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
          />
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="categorias">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="bg-white rounded-xl border border-gray-200 overflow-x-auto"
            >
              {filteredCategorias.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  Nenhuma categoria encontrada
                </div>
              )}

              {filteredCategorias.map((categoria, index) => (
                <Draggable
                  key={String(categoria.id ?? `new-${index}`)}
                  draggableId={String(categoria.id ?? `new-${index}`)}
                  index={index}
                >
                  {(prov) => (
                    <div
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 border-b last:border-0"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div {...prov.dragHandleProps}>
                          <GripVertical className="w-5 h-5 text-gray-400 cursor-move flex-shrink-0" />
                        </div>
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {categoria.name || "Sem nome"}
                          </p>
                          <span
                            className={`inline-flex w-fit items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                              categoria.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {categoria.is_active ? "Ativa" : "Inativa"}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setSelectedCategoria(categoria)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          disabled={saving}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(categoria.id!)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                          disabled={saving}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {selectedCategoria && (
        <CategoriaModal
          isOpen={!!selectedCategoria}
          onClose={() => setSelectedCategoria(null)}
          categoria={selectedCategoria}
          onChange={(field, value) =>
            setSelectedCategoria((prev) =>
              prev ? { ...prev, [field]: value } : prev
            )
          }
          onSave={handleSave}
          saving={saving}
          onDelete={
            selectedCategoria.id
              ? () => handleDelete(selectedCategoria.id!)
              : undefined
          }
        />
      )}
    </div>
  );
}
