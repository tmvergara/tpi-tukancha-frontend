"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Cancha, HorarioDisponibilidad } from "@/lib/types";

interface ReservaResumenProps {
  cancha: Cancha;
  fecha: Date;
  horario: HorarioDisponibilidad;
}

export function ReservaResumen({
  cancha,
  fecha,
  horario,
}: ReservaResumenProps) {
  return (
    <Card className="bg-zinc-50 dark:bg-zinc-900">
      <CardContent className="p-4">
        <h4 className="font-semibold mb-2">Resumen de la reserva</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">Cancha:</span>
            <span className="font-medium">
              {cancha.nombre} - {cancha.deporte}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">Fecha:</span>
            <span className="font-medium">
              {format(fecha, "EEEE, d 'de' MMMM 'de' yyyy", {
                locale: es,
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">Horario:</span>
            <span className="font-medium">{horario.hora}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-zinc-200 dark:border-zinc-700">
            <span className="font-semibold">Total:</span>
            <span className="text-xl font-bold text-primary">
              $
              {cancha.precio.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
