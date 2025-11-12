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

interface EditCanchaDialogProps {
  cancha: Cancha;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCanchaDialog({
  cancha,
  open,
  onOpenChange,
}: EditCanchaDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    // TODO: Integrar con el backend cuando esté listo
    // try {
    //   await authenticatedFetch(`${API_URL}/canchas/${cancha.id}`, {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(formData),
    //   });
    //   toast.success('Cancha actualizada exitosamente');
    //   onOpenChange(false);
    //   // Recargar las canchas
    // } catch (error) {
    //   toast.error('Error al actualizar la cancha');
    // } finally {
    //   setIsSubmitting(false);
    // }

    // Simulación temporal
    setTimeout(() => {
      console.log("Actualizando cancha:", cancha.id, formData);
      setIsSubmitting(false);
      onOpenChange(false);
      // Aquí mostrarías un toast de éxito
      alert(`Cancha "${formData.nombre}" actualizada (simulación)`);
    }, 1000);
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
