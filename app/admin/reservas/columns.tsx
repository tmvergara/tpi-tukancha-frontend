"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Reserva } from "./page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, DollarSign } from "lucide-react";
import { useState } from "react";
import { ReservaDetailDialog } from "./components/reserva-detail-dialog";
import { CobrarReservaDialog } from "./components/cobrar-reserva-dialog";

// Función helper para formatear fecha
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Función helper para obtener el color del badge según el estado
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

// Función helper para obtener el texto legible del estado
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

// Función helper para obtener el texto legible de la fuente
function getFuenteLabel(fuente: string): string {
  switch (fuente) {
    case "WEB":
      return "Web";
    case "TELEFONICA":
      return "Teléfono";
    case "PRESENCIAL":
      return "Presencial";
    default:
      return fuente;
  }
}

// Componente para las acciones de cada fila
function ReservaActions({
  reserva,
  onUpdate,
}: {
  reserva: Reserva;
  onUpdate: () => void;
}) {
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showCobrarDialog, setShowCobrarDialog] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowDetailDialog(true)}
          title="Ver detalles"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowCobrarDialog(true)}
          title="Cobrar reserva"
        >
          <DollarSign className="h-4 w-4" />
        </Button>
      </div>

      <ReservaDetailDialog
        reserva={reserva}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      />
      <CobrarReservaDialog
        reserva={reserva}
        open={showCobrarDialog}
        onOpenChange={setShowCobrarDialog}
        onSuccess={onUpdate}
      />
    </>
  );
}

export const getColumns = (onUpdate: () => void): ColumnDef<Reserva>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      const id = row.getValue("id") as number;
      return <div className="font-medium">#{id}</div>;
    },
  },
  {
    accessorKey: "cliente_nombre",
    header: "Cliente",
    cell: ({ row }) => {
      const nombre = row.getValue("cliente_nombre") as string;
      return <div className="font-medium">{nombre}</div>;
    },
  },
  {
    id: "cancha",
    header: "Cancha",
    cell: ({ row }) => {
      const cancha = row.original.cancha;
      return <div className="font-medium">{cancha.nombre}</div>;
    },
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.getValue("estado") as string;
      return (
        <Badge variant="outline" className={getEstadoBadgeColor(estado)}>
          {getEstadoLabel(estado)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "fuente",
    header: "Fuente",
    cell: ({ row }) => {
      const fuente = row.getValue("fuente") as string;
      return <Badge variant="secondary">{getFuenteLabel(fuente)}</Badge>;
    },
  },
  {
    accessorKey: "created_at",
    header: "Fecha Creación",
    cell: ({ row }) => {
      const fecha = row.getValue("created_at") as string;
      return <div className="text-sm">{formatDate(fecha)}</div>;
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const reserva = row.original;
      return <ReservaActions reserva={reserva} onUpdate={onUpdate} />;
    },
  },
];
