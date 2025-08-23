import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.trim() === "" || supabaseAnonKey.trim() === "") {
    console.error("[v0] Erro: Variáveis de ambiente do Supabase não configuradas corretamente!")
    console.error("[v0] NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl || "undefined")
    console.error("[v0] NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✓ Definida" : "✗ Não definida")

    // Retornar resposta de erro em desenvolvimento
    if (process.env.NODE_ENV === "development") {
      return new NextResponse(
        `Erro de configuração: Configure as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local\n\nURL atual: ${supabaseUrl}`,
        { status: 500 },
      )
    }

    // Em produção, continuar sem autenticação
    return NextResponse.next()
  }

  try {
    new URL(supabaseUrl)
  } catch (error) {
    console.error("[v0] Erro: NEXT_PUBLIC_SUPABASE_URL não é uma URL válida:", supabaseUrl)

    if (process.env.NODE_ENV === "development") {
      return new NextResponse(
        `Erro de configuração: NEXT_PUBLIC_SUPABASE_URL não é uma URL válida: ${supabaseUrl}\n\nExemplo correto: https://seu-projeto.supabase.co`,
        { status: 500 },
      )
    }

    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  let supabase
  try {
    supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    })
  } catch (error) {
    console.error("[v0] Erro ao criar cliente Supabase:", error)

    if (process.env.NODE_ENV === "development") {
      return new NextResponse(
        `Erro ao criar cliente Supabase: ${error}\n\nVerifique se NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY estão corretas.`,
        { status: 500 },
      )
    }

    return NextResponse.next()
  }

  const hostname = request.headers.get("host") || ""
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const mainDomain = siteUrl.replace("https://", "").replace("http://", "").replace(/\/$/, "")

  console.log("[v0] Debug middleware:")
  console.log("[v0] hostname:", hostname)
  console.log("[v0] mainDomain:", mainDomain)
  console.log("[v0] pathname:", request.nextUrl.pathname)

  // Verificar se é um subdomínio válido (não é preview do v0 nem localhost)
  const isPreviewDomain = hostname.includes("vusercontent.net") || hostname.includes("localhost")

  if (!isPreviewDomain && hostname !== mainDomain) {
    const hostParts = hostname.split(".")
    const mainDomainParts = mainDomain.split(".")

    // Se o hostname tem mais partes que o domínio principal, pode ser um subdomínio
    if (hostParts.length > mainDomainParts.length) {
      const subdomain = hostParts[0]
      console.log("[v0] Potential subdomain detected:", subdomain)

      // Verificar se não é 'www' e se é um subdomínio válido
      if (subdomain !== "www" && subdomain.length > 0) {
        console.log("[v0] Valid subdomain, rewriting to:", `/${subdomain}`)

        // Rewrite interno para a rota do subdomínio (não redirect)
        const url = request.nextUrl.clone()
        url.pathname = `/${subdomain}${request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname}`

        return NextResponse.rewrite(url)
      }
    }
  }

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    console.error("[v0] Erro ao verificar usuário:", error)
    // Continuar sem autenticação se houver erro
  }

  const protectedRoutes = ["/dashboard"]
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
