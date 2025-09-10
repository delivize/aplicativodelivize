// app/api/delete-user/route.js
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// IMPORTANTE: Use a SERVICE_ROLE_KEY (não a ANON_KEY)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // Esta é a chave SERVICE ROLE
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function DELETE(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log(`Tentando deletar usuário: ${userId}`);

    // MÉTODO 1: Tentar usar Admin API primeiro
    try {
      const { data: adminData, error: adminError } =
        await supabaseAdmin.auth.admin.deleteUser(
          userId,
          false // shouldSoftDelete = false (hard delete)
        );

      if (!adminError) {
        console.log("Usuário deletado via Admin API:", adminData);
        return NextResponse.json({
          message: "Usuário deletado com sucesso via Admin API",
          data: adminData,
        });
      }

      console.warn("Admin API falhou:", adminError);
    } catch (adminException) {
      console.warn("Exceção Admin API:", adminException);
    }

    // MÉTODO 2: Usar RPC como fallback
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc(
      "delete_user_completely",
      { user_id: userId }
    );

    if (!rpcError) {
      console.log("Usuário deletado via RPC:", rpcData);
      return NextResponse.json({
        message: "Usuário deletado com sucesso via RPC",
        data: rpcData,
      });
    }

    console.warn("RPC falhou:", rpcError);

    // MÉTODO 3: SQL direto como último recurso
    try {
      // Deletar profile primeiro
      await supabaseAdmin.from("profiles").delete().eq("id", userId);

      // Tentar deletar sessões
      const { error: sessionsError } = await supabaseAdmin
        .from("auth.sessions")
        .delete()
        .eq("user_id", userId);

      console.log("Sessões deletadas:", sessionsError || "sucesso");

      // Tentar deletar identities
      const { error: identitiesError } = await supabaseAdmin
        .from("auth.identities")
        .delete()
        .eq("user_id", userId);

      console.log("Identities deletadas:", identitiesError || "sucesso");

      // Tentar deletar usuário
      const { error: userError } = await supabaseAdmin
        .from("auth.users")
        .delete()
        .eq("id", userId);

      if (userError) {
        throw userError;
      }

      return NextResponse.json({
        message: "Usuário deletado via SQL direto",
      });
    } catch (sqlError) {
      console.error("SQL direto falhou:", sqlError);

      return NextResponse.json(
        {
          error: "Falha em todos os métodos de delete",
          details: {
            adminError: "Admin API falhou",
            rpcError: rpcError?.message,
            sqlError: sqlError.message,
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro geral no servidor:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
