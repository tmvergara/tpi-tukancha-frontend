"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/lib/config";
import { authenticatedFetch } from "@/lib/auth";
import { UserDetailed } from "@/lib/types";

interface UserDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDetailed | null;
  clubId?: number;
  onSuccess: () => void;
  totalAdmins?: number;
}

export function UserDeleteDialog({
  open,
  onOpenChange,
  user,
  clubId,
  onSuccess,
  totalAdmins = 0,
}: UserDeleteDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLastAdmin = user?.rol.nombre === "admin" && totalAdmins === 1;

  const handleDelete = async () => {
    if (!user) return;

    // Validación adicional de seguridad
    if (isLastAdmin) {
      toast.error(
        "No se puede eliminar el único administrador del club. Debe existir al menos un administrador activo."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // Bug del backend: DELETE requiere un body aunque no lo use
      const dummyBody = {
        nombre: "dummy",
        email: "dummy@email.com",
        password: "dummy",
        rol_id: 1,
        club_id: clubId || 1,
      };

      const response = await authenticatedFetch(`${API_URL}/users/${user.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dummyBody),
      });

      if (!response.ok && response.status !== 204) {
        let errorMessage = "Error al eliminar usuario";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      toast.success("Usuario eliminado exitosamente");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error deleting user:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error al eliminar usuario";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar Usuario</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar a{" "}
            <span className="font-semibold">{user?.nombre}</span>? Esta acción
            no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        {isLastAdmin && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <strong>Advertencia:</strong> Este es el único administrador del
            club. No se puede eliminar.
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isSubmitting || isLastAdmin}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
