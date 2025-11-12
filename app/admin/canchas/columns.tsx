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
import { DeleteCanchaDialog } from "./delete-cancha-dialog";
import { EditCanchaDialog } from "./edit-cancha-dialog";
import { useState } from "react";

// Componente para las acciones de cada fila
function CanchaActions({ cancha }: { cancha: Cancha }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

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
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            variant="destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteCanchaDialog
        cancha={cancha}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
      <EditCanchaDialog
        cancha={cancha}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </>
  );
}

export const columns: ColumnDef<Cancha>[] = [
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
        <Badge variant={techado ? "default" : "secondary"}>
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
        <Badge variant={iluminacion ? "default" : "secondary"}>
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
        <Badge variant={activa ? "default" : "destructive"}>
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
      return <CanchaActions cancha={cancha} />;
    },
  },
];
