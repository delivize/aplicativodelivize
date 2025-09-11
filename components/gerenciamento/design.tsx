"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import Image from "next/image";
import Toast from "@/components/gerenciamento/toast"; // Ajuste o caminho conforme sua estrutura

interface Props {
  params: Promise<{ slug: string }>;
  onUpdateName?: (newName: string) => void; // Nova prop para comunicar mudanças
}

export default function Design({ params, onUpdateName }: Props) {
  const resolvedParams = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [form, setForm] = useState({
    name: "",
    photo_url: "",
    slug: "",
  });
  // Estado para armazenar os dados originais do BD
  const [originalData, setOriginalData] = useState({
    name: "",
    photo_url: "",
    slug: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Buscar dados existentes
  useEffect(() => {
    const fetchCardapio = async () => {
      try {
        const { data, error } = await supabase
          .from("cardapios")
          .select("name, photo_url, subdomain")
          .eq("subdomain", resolvedParams.slug)
          .single();

        if (error) {
          console.error("Erro ao buscar cardápio:", error.message);
        } else if (data) {
          const cardapioData = {
            name: data.name,
            photo_url: data.photo_url,
            slug: data.subdomain,
          };

          // Armazena tanto no form quanto nos dados originais
          setForm(cardapioData);
          setOriginalData(cardapioData);
        }
      } catch (err) {
        console.error("Erro inesperado:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCardapio();
  }, [resolvedParams.slug]);

  // Atualizar título da página
  useEffect(() => {
    if (form.name) {
      document.title = `Delivize | ${form.name} - Configurações`;
    }
  }, [form.name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  // Função para resetar o formulário aos dados originais
  const handleCancel = () => {
    setForm(originalData);
    setFile(null);
    setPreview(null);
    setCopied(false);
  };

  const sanitizeFileName = (name: string) => {
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9.]/g, "_");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let photoUrl = form.photo_url;

      // Upload da nova imagem se selecionada
      if (file) {
        const sanitized = sanitizeFileName(file.name);
        const timestamp = Date.now();
        const fileName = `${form.slug}_${timestamp}_${sanitized}`;

        const { error: uploadError } = await supabase.storage
          .from("client-photos")
          .upload(fileName, file, {
            upsert: true,
            contentType: file.type,
          });

        if (uploadError) {
          console.error("Erro no upload:", uploadError.message);
          alert("Erro ao fazer upload da imagem.");
          return;
        }

        const { data: urlData } = supabase.storage
          .from("client-photos")
          .getPublicUrl(fileName);

        if (!urlData || !urlData.publicUrl) {
          alert("Erro ao gerar URL pública da imagem.");
          return;
        }

        photoUrl = urlData.publicUrl;
      }

      // Atualizar dados no banco
      const { error } = await supabase
        .from("cardapios")
        .update({
          name: form.name,
          photo_url: photoUrl,
          subdomain: form.slug,
        })
        .eq("subdomain", resolvedParams.slug);

      if (!error) {
        const updatedData = {
          name: form.name,
          photo_url: photoUrl,
          slug: form.slug,
        };

        setForm(updatedData);
        // Atualiza os dados originais após salvar com sucesso
        setOriginalData(updatedData);
        setFile(null);
        setPreview(null);

        // AQUI: Comunica a mudança do nome para o componente pai
        if (onUpdateName) {
          onUpdateName(form.name);
        }

        // Mostrar toast de sucesso
        setShowToast(true);

        if (form.slug !== resolvedParams.slug) {
          // Aguarda um pouco antes de redirecionar para que o usuário veja o toast
          setTimeout(() => {
            router.push(`/cardapio/${form.slug}`);
          }, 1500);
        } else {
          router.refresh();
        }
      } else {
        console.error("Erro ao atualizar dados:", error.message);
        alert("Erro ao salvar configurações.");
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      alert("Erro inesperado ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const removeImage = () => {
    setFile(null);
    setPreview(null);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`https://${form.slug}.delivize.com`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar URL:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 px-6 md:px-12 py-6 md:py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-8 p-8">
            {/* Nome do Cardápio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Nome do Cardápio
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Digite o nome do seu cardápio"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Endereço (slug)
              </label>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={(e) => {
                  let value = e.target.value
                    .toLowerCase() // sempre minúsculo
                    .replace(/\s+/g, "-") // espaços viram "-"
                    .replace(/[^a-z0-9-]/g, ""); // remove tudo que não for letra, número ou "-"
                  setForm({ ...form, slug: value });
                }}
                placeholder="ex: minhacafeteria"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Esse será o endereço do seu cardápio online.
              </p>
            </div>

            {/* Logo do Cardápio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Logo do Cardápio
              </label>

              <div className="space-y-4">
                {(preview || form.photo_url) && (
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0">
                      <Image
                        src={preview || form.photo_url}
                        alt="Logo do cardápio"
                        width={80}
                        height={80}
                        className="rounded-lg object-cover border-2 border-gray-200"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">
                        {file ? "Nova logo selecionada" : "Logo atual"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {file ? file.name : "Logo do cardápio"}
                      </p>
                    </div>
                    {file && (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}

                {/* Área de upload */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="flex flex-col items-center justify-center w-full py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-200 group"
                  >
                    <div className="text-center">
                      <p className="mt-3 text-sm">
                        <span className="font-semibold text-emerald-600">
                          Clique para enviar
                        </span>
                        <span className="text-gray-600">
                          {" "}
                          ou arraste uma imagem
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, JPEG até 10MB
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* URL para copiar */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                URL do Cardápio
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                <span className="px-4 py-3 text-gray-600 text-sm font-mono">
                  https://{form.slug}.delivize.com
                </span>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="px-4 py-3 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors border-l border-gray-200"
                  title="Copiar URL"
                >
                  {copied ? "✓" : "📋"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {copied && (
                  <span className="text-emerald-600">✓ URL copiada!</span>
                )}
              </p>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {saving ? "Salvando..." : "Salvar Configurações"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast Component */}
      <Toast
        isVisible={showToast}
        onHide={() => setShowToast(false)}
        message="Salvo com sucesso!"
      />
    </>
  );
}
