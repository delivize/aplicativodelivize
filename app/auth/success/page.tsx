import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Conta criada com sucesso!</CardTitle>
            <CardDescription>Verifique seu email para confirmar</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Você criou sua conta com sucesso. Verifique seu email para confirmar sua conta antes de fazer login.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
