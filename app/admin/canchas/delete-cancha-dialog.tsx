"use client";

import { useState } from "react";
import { Cancha } from "./page";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteCanchaDialogProps {
  cancha: Cancha;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCanchaDialog({
  cancha,
  open,
  onOpenChange,
}: DeleteCanchaDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    // TODO: Integrar con el backend cuando esté listo
    // try {
    //   await authenticatedFetch(`${API_URL}/canchas/${cancha.id}`, {
    //     method: 'DELETE',
    //   });
    //   toast.success('Cancha eliminada exitosamente');
    //   onOpenChange(false);
    //   // Recargar las canchas
    // } catch (error) {
    //   toast.error('Error al eliminar la cancha');
    // } finally {
    //   setIsDeleting(false);
    // }

    // Simulación temporal
    setTimeout(() => {
      console.log("Eliminando cancha:", cancha.id);
      setIsDeleting(false);
      onOpenChange(false);
      // Aquí mostrarías un toast de éxito
      alert(`Cancha "${cancha.nombre}" eliminada (simulación)`);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle>Eliminar Cancha</DialogTitle>
          </div>
          <DialogDescription className="pt-3">
            ¿Estás seguro de que deseas eliminar la cancha{" "}
            <span className="font-semibold text-foreground">
              {cancha.nombre}
            </span>
            ? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
