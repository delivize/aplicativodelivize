"use client";

import { useState, useEffect, useRef } from "react";
import {
  Upload,
  Search,
  Grid3X3,
  List,
  Heart,
  HeartOff,
  Tag,
  FolderOpen,
  Eye,
  Check,
  Copy,
  Download,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/client";
import PopupUploads from "./uploadsPopup";

export interface UploadFile {
  id?: string;
  name: string;
  original_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  width?: number;
  height?: number;
  user_id?: string;
  cardapio_id?: string;
  used_in?: string[];
  tags?: string[];
  is_favorite: boolean;
  created_at?: string;
  updated_at?: string;
}

interface UploadsManagerProps {
  cardapioId?: string;
  onSelectImage?: (imageUrl: string) => void;
  selectionMode?: boolean;
}

type ViewMode = "grid" | "list";
type SortBy = "recent" | "name" | "size" | "favorites";

export default function UploadsManager({
  cardapioId,
  onSelectImage,
  selectionMode = false,
}: UploadsManagerProps) {
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState<UploadFile | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    loadUploads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardapioId, sortBy]);

  const loadUploads = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      let query = supabase
        .from("uploads")
        .select("*")
        .eq("user_id", userData.user.id);

      if (cardapioId) {
        query = query.eq("cardapio_id", cardapioId);
      }

      switch (sortBy) {
        case "recent":
          query = query.order("created_at", { ascending: false });
          break;
        case "name":
          query = query.order("name", { ascending: true });
          break;
        case "size":
          query = query.order("file_size", { ascending: false });
          break;
        case "favorites":
          query = query.order("is_favorite", { ascending: false });
          break;
      }

      const { data, error } = await query;
      if (error) throw error;
      setUploads(data || []);
    } catch (err) {
      console.error("Erro ao carregar uploads:", err);
      showMessage("error", "Erro ao carregar imagens");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      showMessage("error", "Usuário não autenticado");
      return;
    }

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          showMessage("error", `${file.name} não é uma imagem válida`);
          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          showMessage("error", `${file.name} é muito grande (máx: 10MB)`);
          continue;
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const filePath = `uploads/${userData.user.id}/${fileName}`;

        const { error: storageError } = await supabase.storage
          .from("images")
          .upload(filePath, file);

        if (storageError) throw storageError;

        const { data: publicData } = supabase.storage
          .from("images")
          .getPublicUrl(filePath);

        // Salvar no banco
        const uploadData = {
          name: file.name.replace(/\.[^/.]+$/, ""),
          original_name: file.name,
          file_url: publicData.publicUrl,
          file_size: file.size,
          mime_type: file.type,
          user_id: userData.user.id,
          cardapio_id: cardapioId || null,
          used_in: [],
          tags: [],
          is_favorite: false,
        };

        const { error: dbError } = await supabase
          .from("uploads")
          .insert(uploadData);

        if (dbError) throw dbError;
      }

      showMessage("success", "Imagens enviadas com sucesso!");
      loadUploads();
    } catch (error) {
      console.error("Erro no upload:", error);
      showMessage("error", "Erro ao enviar imagens");
    } finally {
      setUploading(false);
    }
  };

  const toggleFavorite = async (id: string, currentFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from("uploads")
        .update({ is_favorite: !currentFavorite })
        .eq("id", id);

      if (error) throw error;

      setUploads((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, is_favorite: !currentFavorite } : u
        )
      );
    } catch (error) {
      console.error("Erro ao alterar favorito:", error);
      showMessage("error", "Erro ao alterar favorito");
    }
  };

  const deleteUpload = async (id: string, fileUrl: string) => {
    if (!confirm("Excluir esta imagem?")) return;

    try {
      const url = new URL(fileUrl);
      const filePath = url.pathname.split("/").slice(-3).join("/");

      await supabase.storage.from("images").remove([filePath]);
      await supabase.from("uploads").delete().eq("id", id);

      setUploads((prev) => prev.filter((u) => u.id !== id));
      showMessage("success", "Imagem excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir:", error);
      showMessage("error", "Erro ao excluir imagem");
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      showMessage("error", "Erro ao copiar URL");
    }
  };

  const downloadImage = (url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filteredUploads = uploads.filter((u) => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (showFavoritesOnly && !u.is_favorite) return false;
    if (selectedTags.length > 0) {
      const tags = u.tags || [];
      if (!selectedTags.some((tag) => tags.includes(tag))) return false;
    }
    return true;
  });

  const allTags = Array.from(new Set(uploads.flatMap((u) => u.tags || [])));

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  if (loading) return <p className="p-6">Carregando uploads...</p>;

  return (
    <div className="p-4 sm:p-6 w-full">
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-gray-600">
            Gerencie todas as imagens do seu cardápio
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#059669] rounded-lg hover:bg-emerald-700 disabled:opacity-50 w-full sm:w-auto justify-center"
        >
          <Upload className="w-4 h-4" />
          {uploading ? "Enviando..." : "Enviar Imagens"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        />
      </div>

      {/* Filtros e Controles */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        {/* Busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar imagens..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:outline-none"
          />
        </div>

        {/* Ordenação */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:outline-none"
        >
          <option value="recent">Mais recentes</option>
          <option value="name">Nome</option>
          <option value="size">Tamanho</option>
          <option value="favorites">Favoritas</option>
        </select>

        {/* Modo de visualização */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg ${
              viewMode === "grid"
                ? "bg-emerald-100 text-[#059669]"
                : "text-gray-500 hover:bg-gray-200"
            }`}
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg ${
              viewMode === "list"
                ? "bg-emerald-100 text-[#059669]"
                : "text-gray-500 hover:bg-gray-200"
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>

        {/* Filtro de favoritos */}
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            showFavoritesOnly
              ? "bg-pink-100 text-pink-600"
              : "text-gray-500 hover:bg-gray-200"
          }`}
        >
          <Heart className="w-4 h-4" />
          Favoritas
        </button>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() =>
                setSelectedTags((prev) =>
                  prev.includes(tag)
                    ? prev.filter((t) => t !== tag)
                    : [...prev, tag]
                )
              }
              className={`inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full ${
                selectedTags.includes(tag)
                  ? "bg-emerald-100 text-[#059669]"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Tag className="w-3 h-3" />
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Grid/Lista */}
      {filteredUploads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FolderOpen className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma imagem encontrada
          </h3>
          <p className="text-gray-500 mb-4">
            {search || selectedTags.length > 0 || showFavoritesOnly
              ? "Tente ajustar os filtros de busca"
              : "Comece enviando suas primeiras imagens"}
          </p>
          {!search && selectedTags.length === 0 && !showFavoritesOnly && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#059669] bg-emerald-50 rounded-lg hover:bg-emerald-100"
            >
              <Upload className="w-4 h-4" />
              Enviar Primeira Imagem
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredUploads.map((u) => (
            <div
              key={u.id}
              className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square relative bg-gray-100">
                <img
                  src={u.file_url}
                  alt={u.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => setSelectedUpload(u)}
                    className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {selectionMode && onSelectImage && (
                    <button
                      onClick={() => onSelectImage(u.file_url)}
                      className="p-2 bg-[#059669] rounded-full text-white hover:bg-emerald-700"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => toggleFavorite(u.id!, u.is_favorite)}
                    className={`p-2 rounded-full ${
                      u.is_favorite
                        ? "bg-pink-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {u.is_favorite ? (
                      <Heart className="w-4 h-4" />
                    ) : (
                      <HeartOff className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {u.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(u.file_size)}
                </p>
                {u.width && u.height && (
                  <p className="text-xs text-gray-500">
                    {u.width} × {u.height}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredUploads.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-4 p-4 hover:bg-gray-50"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={u.file_url}
                    alt={u.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{u.name}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{formatFileSize(u.file_size)}</span>
                    {u.width && u.height && (
                      <span>
                        {u.width} × {u.height}
                      </span>
                    )}
                    <span>{new Date(u.created_at!).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {u.is_favorite && <Heart className="w-4 h-4 text-pink-500" />}
                  <button
                    onClick={() => setSelectedUpload(u)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {selectionMode && onSelectImage && (
                    <button
                      onClick={() => onSelectImage(u.file_url)}
                      className="p-2 text-[#059669] hover:bg-emerald-50 rounded"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => copyUrl(u.file_url)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    {copiedUrl === u.file_url ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => downloadImage(u.file_url, u.original_name)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteUpload(u.id!, u.file_url)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popup de visualização */}
      {selectedUpload && (
        <PopupUploads
          upload={{
            id: selectedUpload.id,
            name: selectedUpload.name,
            file_url: selectedUpload.file_url,
            file_size: selectedUpload.file_size,
            mime_type: selectedUpload.mime_type,
            created_at: selectedUpload.created_at || new Date().toISOString(),
            is_favorite: selectedUpload.is_favorite,
          }}
          onClose={() => setSelectedUpload(null)}
        />
      )}
    </div>
  );
}
