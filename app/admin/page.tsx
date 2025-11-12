import { Sparkles, LayoutDashboard } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-var(--header-height)-4.5rem)]">
      <div className="w-full max-w-2xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            ¡Bienvenido al Panel de Administración!
          </h1>
          <p className="text-lg text-muted-foreground">
            Estás en el área de gestión de Tukancha
          </p>
        </div>

        <div className="flex items-start gap-3 text-left bg-muted/50 p-6 rounded-lg max-w-xl mx-auto">
          <LayoutDashboard className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Para comenzar, selecciona una funcionalidad desde el menú lateral.
              Desde allí podrás gestionar usuarios, productos, reservas y todas
              las características del sistema.
            </p>
          </div>
        </div>

        <div className="pt-4">
          <p className="text-xs text-muted-foreground">
            Panel de administración • Tukancha
          </p>
        </div>
      </div>
    </div>
  );
}
