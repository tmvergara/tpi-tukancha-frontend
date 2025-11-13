"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Cancha } from "./page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DeleteCanchaDialog } from "./components/cancha-delete-dialog";
import { EditCanchaDialog } from "./components/cancha-edit-dialog";
import { useState } from "react";
import { usePermissions } from "@/hooks/use-permissions";

// Componente para las acciones de cada fila
function CanchaActions({
  cancha,
  onUpdate,
}: {
  cancha: Cancha;
  onUpdate: () => void;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { can } = usePermissions();

  const canEdit = can("canchas:edit");
  const canDelete = can("canchas:delete");

  // Si no puede hacer nada, no mostrar el menú
  if (!canEdit && !canDelete) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {canEdit && (
            <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
          )}
          {canDelete && (
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              variant="destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {canDelete && (
        <DeleteCanchaDialog
          cancha={cancha}
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onSuccess={onUpdate}
        />
      )}
      {canEdit && (
        <EditCanchaDialog
          cancha={cancha}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSuccess={onUpdate}
        />
      )}
    </>
  );
}

export const getColumns = (onUpdate: () => void): ColumnDef<Cancha>[] => [
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => {
      const nombre = row.getValue("nombre") as string;
      return <div className="font-medium">{nombre}</div>;
    },
  },
  {
    accessorKey: "deporte",
    header: "Deporte",
    cell: ({ row }) => {
      const deporte = row.getValue("deporte") as string;
      return <Badge variant="outline">{deporte}</Badge>;
    },
  },
  {
    accessorKey: "superficie",
    header: "Superficie (m²)",
    cell: ({ row }) => {
      const superficie = row.getValue("superficie") as number;
      return <div>{superficie.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: "techado",
    header: "Techado",
    cell: ({ row }) => {
      const techado = row.getValue("techado") as boolean;
      return (
        <Badge
          variant="outline"
          className={
            techado
              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
          }
        >
          {techado ? "Sí" : "No"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "iluminacion",
    header: "Iluminación",
    cell: ({ row }) => {
      const iluminacion = row.getValue("iluminacion") as boolean;
      return (
        <Badge
          variant="outline"
          className={
            iluminacion
              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
          }
        >
          {iluminacion ? "Sí" : "No"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "precio_hora",
    header: "Precio/Hora",
    cell: ({ row }) => {
      const precio = row.getValue("precio_hora") as number;
      return <div className="font-medium">${precio.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: "activa",
    header: "Estado",
    cell: ({ row }) => {
      const activa = row.getValue("activa") as boolean;
      return (
        <Badge
          variant="outline"
          className={
            activa
              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
          }
        >
          {activa ? "Activa" : "Inactiva"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const cancha = row.original;
      return <CanchaActions cancha={cancha} onUpdate={onUpdate} />;
    },
  },
];
