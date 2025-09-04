"use client";

import { X } from "lucide-react";

interface Upload {
  id?: string;
  name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  is_favorite?: boolean;
}

export default function PopupUploads({
  upload,
  onClose,
}: {
  upload: Upload;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg max-w-3xl w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {upload.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Imagem */}
        <div className="max-h-[70vh] overflow-auto bg-gray-50 flex justify-center items-center">
          <img
            src={upload.file_url}
            alt={upload.name}
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>

        {/* Detalhes */}
        <div className="p-4 text-sm text-gray-600 border-t">
          <p>
            <span className="font-medium">Tamanho:</span>{" "}
            {(upload.file_size / 1024).toFixed(1)} KB
          </p>
          <p>
            <span className="font-medium">Tipo:</span> {upload.mime_type}
          </p>
          <p>
            <span className="font-medium">Enviado em:</span>{" "}
            {new Date(upload.created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>
    </div>
  );
}
