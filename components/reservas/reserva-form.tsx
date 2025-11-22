"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PhoneInput } from "@/components/ui/phone-input";
import { Toggle } from "@/components/ui/toggle";
import { Check } from "lucide-react";

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
  onTelefonoChange: (value: string) => void;
  onServicioToggle: (servicio: string) => void;
}

export function ReservaForm({
  formData,
  selectedServicios,
  onFormChange,
  onTelefonoChange,
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
        <PhoneInput
          value={formData.telefono}
          onChange={onTelefonoChange}
          placeholder="(XXX) XXX-XXXX"
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
        <div className="flex flex-wrap gap-2 pt-2">
          {SERVICIOS_DISPONIBLES.map((servicio) => (
            <Toggle
              key={servicio}
              pressed={selectedServicios.includes(servicio)}
              onPressedChange={() => onServicioToggle(servicio)}
              variant="outline"
              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground transition-all duration-200"
            >
              {selectedServicios.includes(servicio) && (
                <Check className="mr-2 h-4 w-4 animate-in fade-in zoom-in duration-200" />
              )}
              {servicio}
            </Toggle>
          ))}
        </div>
      </div>
    </div>
  );
}
