"use client";

import { useState, useEffect } from "react";
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
import { toast } from "sonner";

interface Equipo {
  id: number;
  nombre: string;
  representante?: string | null;
  telefono?: string | null;
  email?: string | null;
  torneo_id: number;
}

interface EditEquipoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  equipo: Equipo | null;
}

export function EditEquipoDialog({
  open,
  onOpenChange,
  onSuccess,
  equipo,
}: EditEquipoDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    representante: "",
    telefono: "",
    email: "",
  });

  useEffect(() => {
    if (equipo) {
      setFormData({
        nombre: equipo.nombre,
        representante: equipo.representante || "",
        telefono: equipo.telefono || "",
        email: equipo.email || "",
      });
    }
  }, [equipo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!equipo) return;

    setLoading(true);

    try {
      const payload = {
        nombre: formData.nombre,
        torneo_id: equipo.torneo_id,
        representante: formData.representante,
        telefono: formData.telefono,
        email: formData.email,
      };

      const response = await authenticatedFetch(
        `${API_URL}/equipos/${equipo.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al actualizar el equipo");
      }

      const result = await response.json();
      toast.success(result.message || "Equipo actualizado exitosamente");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar el equipo"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Equipo</DialogTitle>
          <DialogDescription>
            Actualiza la información del equipo
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
              <Input
                id="telefono"
                type="tel"
                placeholder="+54 9 11 1234-5678"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
                required
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
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
