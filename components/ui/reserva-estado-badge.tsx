import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ReservaEstadoBadgeProps {
  estado: string;
  className?: string;
}

// Función para obtener el color del badge según el estado
function getEstadoBadgeColor(estado: string): string {
  switch (estado) {
    case "CONFIRMADA":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800";
    case "PENDIENTE":
      return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800";
    case "PAGADO":
      return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800";
    case "CANCELADA":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800";
    case "NO_ASISTIO":
      return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800";
    default:
      return "";
  }
}

// Función para obtener el texto legible del estado
function getEstadoLabel(estado: string): string {
  switch (estado) {
    case "CONFIRMADA":
      return "Confirmada";
    case "PENDIENTE":
      return "Pendiente";
    case "PAGADO":
      return "Pagado";
    case "CANCELADA":
      return "Cancelada";
    case "NO_ASISTIO":
      return "No asistió";
    default:
      return estado;
  }
}

export function ReservaEstadoBadge({
  estado,
  className,
}: ReservaEstadoBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(getEstadoBadgeColor(estado), className)}
    >
      {getEstadoLabel(estado)}
    </Badge>
  );
}
