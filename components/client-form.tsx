"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ClientForm() {
  const [name, setName] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const generateSubdomain = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "")
      .substring(0, 20)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError("Usuário não autenticado")
      setIsLoading(false)
      return
    }

    try {
      let photoUrl = null

      // Upload da foto se fornecida
      if (photo) {
        const fileExt = photo.name.split(".").pop()
        const fileName = `${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("client-photos")
          .upload(fileName, photo)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("client-photos").getPublicUrl(fileName)

        photoUrl = publicUrl
      }

      // Gerar subdomínio único
      const baseSubdomain = generateSubdomain(name)
      let subdomain = baseSubdomain
      let counter = 1

      // Verificar se o subdomínio já existe
      while (true) {
        const { data: existing } = await supabase.from("clients").select("id").eq("subdomain", subdomain).single()

        if (!existing) break

        subdomain = `${baseSubdomain}${counter}`
        counter++
      }

      // Inserir cliente
      const { error: insertError } = await supabase.from("clients").insert({
        name,
        photo_url: photoUrl,
        subdomain,
        user_id: user.id,
      })

      if (insertError) throw insertError

      setName("")
      setPhoto(null)
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao cadastrar cliente")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo Cliente</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Cliente</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome do cliente"
              required
            />
          </div>

          <div>
            <Label htmlFor="photo">Foto do Cliente</Label>
            <Input id="photo" type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Cadastrando..." : "Cadastrar Cliente"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
