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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { toast } from "sonner";

interface CreateEquipoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  torneoId: number;
}

export function CreateEquipoDialog({
  open,
  onOpenChange,
  onSuccess,
  torneoId,
}: CreateEquipoDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    representante: "",
    telefono: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const payload = {
        nombre: formData.nombre,
        torneo_id: torneoId,
        representante: formData.representante,
        telefono: formData.telefono,
        email: formData.email,
      };

      const response = await authenticatedFetch(`${API_URL}/equipos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al crear el equipo");
      }

      const result = await response.json();
      toast.success(result.message || "Equipo creado exitosamente");
      onSuccess();
      onOpenChange(false);

      // Reset form
      setFormData({
        nombre: "",
        representante: "",
        telefono: "",
        email: "",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al crear el equipo"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Equipo</DialogTitle>
          <DialogDescription>
            Completa los datos para agregar un equipo al torneo
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre del Equipo *</Label>
              <Input
                id="nombre"
                placeholder="Ej: Los Tigres"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="representante">Representante *</Label>
              <Input
                id="representante"
                placeholder="Ej: Juan Pérez"
                value={formData.representante}
                onChange={(e) =>
                  setFormData({ ...formData, representante: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <PhoneInput
                value={formData.telefono}
                onChange={(value) =>
                  setFormData({ ...formData, telefono: value })
                }
                placeholder="(XXX) XXX-XXXX"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="equipo@ejemplo.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
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
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Equipo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
