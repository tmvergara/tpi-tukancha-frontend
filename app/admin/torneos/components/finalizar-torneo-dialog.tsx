"use client";

import { useState } from "react";
import { authenticatedFetch } from "@/lib/auth";
import { API_URL } from "@/lib/config";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

interface FinalizarTorneoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  torneoId: number;
  torneoNombre: string;
}

export function FinalizarTorneoDialog({
  open,
  onOpenChange,
  onSuccess,
  torneoId,
  torneoNombre,
}: FinalizarTorneoDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleFinalizar = async () => {
    setLoading(true);

    try {
      const response = await authenticatedFetch(
        `${API_URL}/torneos/${torneoId}/estado`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ estado: "FINALIZADO" }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al finalizar el torneo");
      }

      const result = await response.json();
      toast.success(result.message || "Torneo finalizado exitosamente");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al finalizar el torneo"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Finalizar Torneo
          </DialogTitle>
          <DialogDescription>
            Esta acción finalizará el torneo y deshabilitará todas las funciones
            de gestión.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            ¿Estás seguro de que deseas finalizar el torneo{" "}
            <span className="font-semibold text-foreground">
              &quot;{torneoNombre}&quot;
            </span>
            ?
          </p>
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 p-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              Una vez finalizado:
            </p>
            <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
              <li>No se podrán agregar más equipos</li>
              <li>No se podrán programar nuevos partidos</li>
              <li>No se podrán editar resultados</li>
              <li>Solo será posible visualizar la tabla de posiciones</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleFinalizar}
            disabled={loading}
          >
            {loading ? "Finalizando..." : "Finalizar Torneo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
