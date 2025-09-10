import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    console.log("🚀 [MIDDLEWARE] Iniciando...");
    console.log("🌐 [MIDDLEWARE] hostname:", request.headers.get("host"));
    console.log("📍 [MIDDLEWARE] pathname:", request.nextUrl.pathname);

    const hostname = request.headers.get("host") || "";

    // Pular assets estáticos e API routes
    if (
      request.nextUrl.pathname.startsWith("/_next/") ||
      request.nextUrl.pathname.startsWith("/api/") ||
      request.nextUrl.pathname.startsWith("/favicon") ||
      request.nextUrl.pathname.includes(".")
    ) {
      console.log("⚡ [MIDDLEWARE] Pulando asset estático");
      return NextResponse.next();
    }

    // Se já está na rota /custom, não fazer rewrite novamente
    if (request.nextUrl.pathname.startsWith("/custom/")) {
      console.log("✅ [MIDDLEWARE] Já está em /custom/, seguindo...");
      return NextResponse.next();
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const mainDomain = siteUrl
      .replace("https://", "")
      .replace("http://", "")
      .replace(/\/$/, "");

    console.log("🏠 [MIDDLEWARE] mainDomain:", mainDomain);

    // Evitar rodar lógica em dev/local/preview
    const isPreviewDomain =
      hostname.includes("vusercontent.net") ||
      hostname.includes("localhost") ||
      hostname === mainDomain;

    console.log("🔍 [MIDDLEWARE] isPreviewDomain:", isPreviewDomain);

    if (!isPreviewDomain) {
      const hostParts = hostname.split(".");
      const mainParts = mainDomain.split(".");

      console.log("🔧 [MIDDLEWARE] hostParts:", hostParts);
      console.log("🔧 [MIDDLEWARE] mainParts:", mainParts);

      // 🔹 Caso seja subdomínio do domínio principal
      if (hostParts.length > mainParts.length) {
        const subdomain = hostParts[0];
        if (subdomain !== "www" && subdomain.length > 0) {
          const url = request.nextUrl.clone();
          url.pathname = `/${subdomain}${
            request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname
          }`;
          console.log("🔄 [MIDDLEWARE] Subdomínio rewrite para:", url.pathname);
          return NextResponse.rewrite(url);
        }
      } else {
        // 🔹 Caso seja domínio personalizado → rewrite para rota "custom"
        const url = request.nextUrl.clone();
        const originalPathname = request.nextUrl.pathname;

        url.pathname = `/custom/${hostname}${
          originalPathname === "/" ? "" : originalPathname
        }`;

        console.log(
          "🎯 [MIDDLEWARE] Domínio personalizado rewrite para:",
          url.pathname
        );
        return NextResponse.rewrite(url);
      }
    }

    console.log("✅ [MIDDLEWARE] Finalizando normalmente");
    return NextResponse.next();
  } catch (error) {
    console.error("❌ [MIDDLEWARE] Erro:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
