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

interface Partido {
  id: number;
  goles_equipo1: number;
  goles_equipo2: number;
}

interface EditResultadoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  partido: Partido | null;
}

export function EditResultadoDialog({
  open,
  onOpenChange,
  onSuccess,
  partido,
}: EditResultadoDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    goles_equipo1: "",
    goles_equipo2: "",
  });

  useEffect(() => {
    if (partido) {
      setFormData({
        goles_equipo1: partido.goles_equipo1?.toString() || "0",
        goles_equipo2: partido.goles_equipo2?.toString() || "0",
      });
    }
  }, [partido]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!partido) return;

    setLoading(true);

    try {
      const payload = {
        goles_equipo1: parseInt(formData.goles_equipo1) || 0,
        goles_equipo2: parseInt(formData.goles_equipo2) || 0,
      };

      const response = await authenticatedFetch(
        `${API_URL}/partidos/${partido.id}/resultado`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al actualizar el resultado");
      }

      const result = await response.json();
      toast.success(result.message || "Resultado actualizado exitosamente");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al actualizar el resultado"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Registrar Resultado</DialogTitle>
          <DialogDescription>
            Actualiza el resultado del partido y su estado
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="goles_equipo1">Goles Equipo 1 *</Label>
                <Input
                  id="goles_equipo1"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.goles_equipo1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      goles_equipo1: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="goles_equipo2">Goles Equipo 2 *</Label>
                <Input
                  id="goles_equipo2"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.goles_equipo2}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      goles_equipo2: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="text-muted-foreground">
                <strong>Nota:</strong> El ganador se calcula automáticamente en
                el backend y la tabla de posiciones se actualiza al guardar.
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
              {loading ? "Guardando..." : "Guardar Resultado"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
