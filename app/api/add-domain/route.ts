import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { domain } = await req.json();

    if (!domain) {
      return NextResponse.json(
        { error: "Domínio é obrigatório" },
        { status: 400 }
      );
    }

    const vercelRes = await fetch(
      `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: domain }),
      }
    );

    const data = await vercelRes.json();

    if (!vercelRes.ok) {
      console.error("Erro Vercel:", data);
      return NextResponse.json({ error: data }, { status: vercelRes.status });
    }

    return NextResponse.json({
      message: "Domínio adicionado com sucesso à Vercel!",
      vercelResponse: data,
    });
  } catch (err) {
    console.error("Erro ao adicionar domínio:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
