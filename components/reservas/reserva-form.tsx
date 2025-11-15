"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

// Servicios disponibles
export const SERVICIOS_DISPONIBLES = [
  "Parrilla",
  "Bebidas",
  "Pelota",
  "Vestuarios",
  "Estacionamiento",
  "Duchas",
];

interface ReservaFormProps {
  formData: {
    nombre: string;
    telefono: string;
    email: string;
  };
  selectedServicios: string[];
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onServicioToggle: (servicio: string) => void;
}

export function ReservaForm({
  formData,
  selectedServicios,
  onFormChange,
  onServicioToggle,
}: ReservaFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre completo *</Label>
        <Input
          id="nombre"
          name="nombre"
          placeholder="Juan Pérez"
          value={formData.nombre}
          onChange={onFormChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefono">Teléfono *</Label>
        <Input
          id="telefono"
          name="telefono"
          type="tel"
          placeholder="1234567890"
          value={formData.telefono}
          onChange={onFormChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="juan@example.com"
          value={formData.email}
          onChange={onFormChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Servicios *</Label>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Seleccioná los servicios que necesitás
        </p>
        <div className="grid grid-cols-2 gap-3 pt-2">
          {SERVICIOS_DISPONIBLES.map((servicio) => (
            <div key={servicio} className="flex items-center space-x-2">
              <Checkbox
                id={servicio}
                checked={selectedServicios.includes(servicio)}
                onCheckedChange={() => onServicioToggle(servicio)}
              />
              <label
                htmlFor={servicio}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {servicio}
              </label>
            </div>
          ))}
        </div>
        {selectedServicios.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedServicios.map((servicio) => (
              <Badge key={servicio} variant="secondary">
                {servicio}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
