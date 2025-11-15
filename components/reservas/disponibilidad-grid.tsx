"use client";

import { cn } from "@/lib/utils";
import { HorarioDisponibilidad } from "@/lib/types";

interface DisponibilidadGridProps {
  horarios: HorarioDisponibilidad[];
  onHorarioClick: (horario: HorarioDisponibilidad) => void;
  selectedDate: Date;
}

export function DisponibilidadGrid({
  horarios,
  onHorarioClick,
  selectedDate,
}: DisponibilidadGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {horarios.map((horario) => {
        const hayDisponibilidad = horario.canchas_disponibles.length > 0;
        const isPast =
          selectedDate.toDateString() === new Date().toDateString() &&
          parseInt(horario.hora.split(":")[0]) < new Date().getHours();

        return (
          <button
            key={horario.hora}
            onClick={() => onHorarioClick(horario)}
            disabled={!hayDisponibilidad || isPast}
            className={cn(
              "h-16 rounded-md text-base font-medium transition-colors relative",
              !hayDisponibilidad || isPast
                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800"
                : "bg-white border-2 border-zinc-200 hover:border-primary hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 dark:hover:border-primary dark:hover:bg-zinc-800"
            )}
          >
            <div>{horario.hora}</div>
            {hayDisponibilidad && !isPast && (
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                {horario.canchas_disponibles.length}{" "}
                {horario.canchas_disponibles.length === 1
                  ? "cancha"
                  : "canchas"}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
