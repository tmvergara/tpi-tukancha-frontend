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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Equipo {
  id: number;
  nombre: string;
}

interface CreatePartidoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  torneoId: number;
  equipos: Equipo[];
}

export function CreatePartidoDialog({
  open,
  onOpenChange,
  onSuccess,
  torneoId,
  equipos,
}: CreatePartidoDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    equipo1_id: "",
    equipo2_id: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.equipo1_id === formData.equipo2_id) {
      toast.error("Un equipo no puede jugar contra sí mismo");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        torneo_id: torneoId,
        equipo1_id: parseInt(formData.equipo1_id),
        equipo2_id: parseInt(formData.equipo2_id),
      };

      const response = await authenticatedFetch(`${API_URL}/partidos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al crear el partido");
      }

      const result = await response.json();
      toast.success(result.message || "Partido creado exitosamente");
      onSuccess();
      onOpenChange(false);

      // Reset form
      setFormData({
        equipo1_id: "",
        equipo2_id: "",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al crear el partido"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Partido</DialogTitle>
          <DialogDescription>
            Selecciona los equipos que se enfrentarán en este partido
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="equipo1">Equipo 1 *</Label>
              <Select
                value={formData.equipo1_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, equipo1_id: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar equipo" />
                </SelectTrigger>
                <SelectContent>
                  {equipos.map((equipo) => (
                    <SelectItem key={equipo.id} value={equipo.id.toString()}>
                      {equipo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="equipo2">Equipo 2 *</Label>
              <Select
                value={formData.equipo2_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, equipo2_id: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar equipo" />
                </SelectTrigger>
                <SelectContent>
                  {equipos.map((equipo) => (
                    <SelectItem key={equipo.id} value={equipo.id.toString()}>
                      {equipo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="text-muted-foreground">
                <strong>Nota:</strong> Los goles se inicializan en 0. Podrás
                registrar el resultado después de crear el partido.
              </p>
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
              {loading ? "Creando..." : "Crear Partido"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
