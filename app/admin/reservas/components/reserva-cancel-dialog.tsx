"use client";

import { useState } from "react";
import { Reserva } from "../page";
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
import { authenticatedFetch } from "@/lib/auth";
import { API_URL } from "@/lib/config";
import { toast } from "sonner";

interface CancelReservaDialogProps {
  reserva: Reserva;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CancelReservaDialog({
  reserva,
  open,
  onOpenChange,
  onSuccess,
}: CancelReservaDialogProps) {
  const [isCanceling, setIsCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    setIsCanceling(true);
    setError(null);

    try {
      const response = await authenticatedFetch(
        `${API_URL}/reservas/${reserva.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cancelar la reserva");
      }

      toast.success("Reserva cancelada", {
        description: "El horario ha sido liberado correctamente",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      toast.error("Error al cancelar", {
        description: errorMessage,
      });
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle>Cancelar Reserva</DialogTitle>
          </div>
          <DialogDescription className="pt-3">
            ¿Estás seguro de que deseas cancelar la reserva{" "}
            <span className="font-semibold text-foreground">#{reserva.id}</span>{" "}
            de{" "}
            <span className="font-semibold text-foreground">
              {reserva.cliente_nombre}
            </span>
            ? El horario será liberado y estará disponible nuevamente.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCanceling}
          >
            Volver
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isCanceling}
          >
            {isCanceling ? "Cancelando..." : "Cancelar Reserva"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
