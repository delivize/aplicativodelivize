import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[middleware] Erro: Variáveis do Supabase não configuradas");
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const hostname = request.headers.get("host") || "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const mainDomain = siteUrl
    .replace("https://", "")
    .replace("http://", "")
    .replace(/\/$/, "");

  console.log("[middleware] hostname:", hostname);
  console.log("[middleware] mainDomain:", mainDomain);

  // Evitar rodar lógica em dev/local/preview
  const isPreviewDomain =
    hostname.includes("vusercontent.net") ||
    hostname.includes("localhost") ||
    hostname === mainDomain;

  if (!isPreviewDomain) {
    const hostParts = hostname.split(".");
    const mainParts = mainDomain.split(".");

    // 🔹 Caso seja subdomínio do domínio principal
    if (hostParts.length > mainParts.length) {
      const subdomain = hostParts[0];
      if (subdomain !== "www" && subdomain.length > 0) {
        const url = request.nextUrl.clone();
        url.pathname = `/${subdomain}${
          request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname
        }`;
        return NextResponse.rewrite(url);
      }
    } else {
      // 🔹 Caso seja domínio personalizado → rewrite para rota "custom"
      const url = request.nextUrl.clone();
      url.pathname = `/custom/${hostname}${
        request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname
      }`;
      return NextResponse.rewrite(url);
    }
  }

  // 🔐 Rotas protegidas
  const protectedRoutes = ["/dashboard"];
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
