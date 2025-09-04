"use client";

import { useState } from "react";

export default function ContaView() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    foto: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Minha Conta</h2>

      <form className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium">Nome</label>
          <input
            type="text"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Senha</label>
          <input
            type="password"
            name="senha"
            value={form.senha}
            onChange={handleChange}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Foto (URL)</label>
          <input
            type="text"
            name="foto"
            value={form.foto}
            onChange={handleChange}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>

        <button
          type="button"
          className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
        >
          Salvar
        </button>
      </form>
    </div>
  );
}
