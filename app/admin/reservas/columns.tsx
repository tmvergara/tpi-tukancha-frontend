"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Reserva } from "./page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, DollarSign, XCircle } from "lucide-react";
import { useState } from "react";
import { ReservaDetailDialog } from "./components/reserva-detail-dialog";
import { CobrarReservaDialog } from "./components/cobrar-reserva-dialog";
import { CancelReservaDialog } from "./components/reserva-cancel-dialog";
import { ReservaEstadoBadge } from "@/components/ui/reserva-estado-badge";

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
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const isPagado = reserva.estado === "PAGADO";
  const isCancelada = reserva.estado === "CANCELADA";

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
          title={isPagado ? "Reserva ya pagada" : "Cobrar reserva"}
          disabled={isPagado}
        >
          <DollarSign className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowCancelDialog(true)}
          title={isCancelada ? "Reserva ya cancelada" : "Cancelar reserva"}
          disabled={isCancelada}
        >
          <XCircle className="h-4 w-4" />
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
      <CancelReservaDialog
        reserva={reserva}
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
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
      return <ReservaEstadoBadge estado={estado} />;
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
