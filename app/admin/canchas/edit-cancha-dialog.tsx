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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { authenticatedFetch } from "@/lib/auth";
import { API_URL } from "@/lib/config";

interface EditCanchaDialogProps {
  cancha: Cancha;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditCanchaDialog({
  cancha,
  open,
  onOpenChange,
  onSuccess,
}: EditCanchaDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: cancha.nombre,
    deporte: cancha.deporte,
    superficie: cancha.superficie,
    techado: cancha.techado,
    iluminacion: cancha.iluminacion,
    precio_hora: cancha.precio_hora,
    activa: cancha.activa,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await authenticatedFetch(
        `${API_URL}/canchas/${cancha.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar la cancha");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cancha</DialogTitle>
          <DialogDescription>
            Modifica los datos de la cancha {cancha.nombre}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deporte">Deporte</Label>
              <Input
                id="deporte"
                value={formData.deporte}
                onChange={(e) =>
                  setFormData({ ...formData, deporte: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="superficie">Superficie (m²)</Label>
              <Input
                id="superficie"
                type="number"
                step="0.01"
                value={formData.superficie}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    superficie: parseFloat(e.target.value),
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precio_hora">Precio por Hora</Label>
              <Input
                id="precio_hora"
                type="number"
                step="0.01"
                value={formData.precio_hora}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    precio_hora: parseFloat(e.target.value),
                  })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="techado" className="cursor-pointer">
                Techado
              </Label>
              <Switch
                id="techado"
                checked={formData.techado}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, techado: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="iluminacion" className="cursor-pointer">
                Iluminación
              </Label>
              <Switch
                id="iluminacion"
                checked={formData.iluminacion}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, iluminacion: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="activa" className="cursor-pointer">
                Activa
              </Label>
              <Switch
                id="activa"
                checked={formData.activa}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, activa: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
