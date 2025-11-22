"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateTorneoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateTorneoDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateTorneoDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    reglamento: "",
    categoria: "",
    fecha_inicio: undefined as Date | undefined,
    fecha_fin: undefined as Date | undefined,
    estado: "ACTIVO",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.club_id) {
      toast.error("Error: No se pudo identificar el club");
      return;
    }

    if (!formData.fecha_inicio || !formData.fecha_fin) {
      toast.error("Por favor selecciona las fechas de inicio y fin");
      return;
    }

    if (formData.fecha_fin < formData.fecha_inicio) {
      toast.error("La fecha de fin debe ser posterior a la fecha de inicio");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nombre: formData.nombre,
        reglamento: formData.reglamento || null,
        categoria: formData.categoria || null,
        fecha_inicio: format(formData.fecha_inicio, "yyyy-MM-dd"),
        fecha_fin: format(formData.fecha_fin, "yyyy-MM-dd"),
        club_id: user.club_id,
        estado: formData.estado,
      };

      const response = await authenticatedFetch(`${API_URL}/torneos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al crear el torneo");
      }

      toast.success("Torneo creado exitosamente");
      onSuccess();
      onOpenChange(false);

      // Reset form
      setFormData({
        nombre: "",
        reglamento: "",
        categoria: "",
        fecha_inicio: undefined,
        fecha_fin: undefined,
        estado: "ACTIVO",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al crear el torneo"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Torneo</DialogTitle>
          <DialogDescription>
            Completa los datos para crear un nuevo torneo
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre del Torneo *</Label>
              <Input
                id="nombre"
                placeholder="Ej: Torneo Apertura 2024"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reglamento">Reglamento</Label>
              <Textarea
                id="reglamento"
                placeholder="Reglamento del torneo (opcional)"
                value={formData.reglamento}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, reglamento: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Input
                id="categoria"
                placeholder="Ej: Primera, Juvenil, etc. (opcional)"
                value={formData.categoria}
                onChange={(e) =>
                  setFormData({ ...formData, categoria: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Fecha de Inicio *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !formData.fecha_inicio && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.fecha_inicio ? (
                        format(formData.fecha_inicio, "PPP", { locale: es })
                      ) : (
                        <span>Seleccionar</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.fecha_inicio}
                      onSelect={(date) =>
                        setFormData({ ...formData, fecha_inicio: date })
                      }
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label>Fecha de Fin *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !formData.fecha_fin && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.fecha_fin ? (
                        format(formData.fecha_fin, "PPP", { locale: es })
                      ) : (
                        <span>Seleccionar</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.fecha_fin}
                      onSelect={(date) =>
                        setFormData({ ...formData, fecha_fin: date })
                      }
                      initialFocus
                      locale={es}
                      disabled={(date) =>
                        formData.fecha_inicio
                          ? date < formData.fecha_inicio
                          : false
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
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
              {loading ? "Creando..." : "Crear Torneo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
