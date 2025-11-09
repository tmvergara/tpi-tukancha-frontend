"use client";

import * as React from "react";
import Link from "next/link";
import { Check, ChevronsUpDown } from "lucide-react";
import { format, addDays, startOfWeek, addHours } from "date-fns";
import { es } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Mock data de clubes
const clubs = [
  { value: "club-atletico", label: "Club Atlético" },
  { value: "deportivo-central", label: "Deportivo Central" },
  { value: "racing-club", label: "Racing Club" },
  { value: "boca-juniors", label: "Boca Juniors" },
  { value: "river-plate", label: "River Plate" },
];

// Mock data de disponibilidad (simulando que hay algunas horas ocupadas)
const mockAvailability = {
  // Algunas horas ocupadas aleatoriamente
  occupied: new Set([
    "2025-06-12T10:00",
    "2025-06-12T14:00",
    "2025-06-13T11:00",
    "2025-06-14T15:00",
  ]),
};

export default function ReservasPage() {
  const [open, setOpen] = React.useState(false);
  const [selectedClub, setSelectedClub] = React.useState("");
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [month, setMonth] = React.useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = React.useState<string | null>(null);

  // Generar los días de la semana a partir de la fecha seleccionada
  const weekDays = React.useMemo(() => {
    if (!date) return [];
    const start = startOfWeek(date, { weekStartsOn: 1 }); // Lunes
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [date]);

  // Generar horarios disponibles (de 8:00 a 22:00)
  const timeSlots = React.useMemo(() => {
    const slots = [];
    const startHour = 8;
    const endHour = 22;

    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
    }
    return slots;
  }, []);

  const isSlotOccupied = (day: Date, time: string) => {
    const slotKey = `${format(day, "yyyy-MM-dd")}T${time}`;
    return mockAvailability.occupied.has(slotKey);
  };

  const handleSlotClick = (day: Date, time: string) => {
    const slotKey = `${format(day, "yyyy-MM-dd")}T${time}`;
    if (!isSlotOccupied(day, time)) {
      setSelectedSlot(selectedSlot === slotKey ? null : slotKey);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-zinc-950">
      {/* Header - igual que el landing */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-white/100 backdrop-blur-md border-b border-zinc-200 dark:bg-black/80 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/Logo1.png" alt="Tukancha" className="h-12" />
          </Link>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 transition-colors"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Reservá tu cancha
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Seleccioná el club, la fecha y el horario que prefieras
          </p>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          {/* Panel izquierdo - Filtros */}
          <div className="space-y-6">
            {/* Selector de Club */}
            <Card>
              <CardHeader>
                <CardTitle>Club</CardTitle>
                <CardDescription>
                  Seleccioná el club donde querés reservar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {selectedClub
                        ? clubs.find((club) => club.value === selectedClub)
                            ?.label
                        : "Seleccionar club..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder="Buscar club..."
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>No se encontró el club.</CommandEmpty>
                        <CommandGroup>
                          {clubs.map((club) => (
                            <CommandItem
                              key={club.value}
                              value={club.value}
                              onSelect={(currentValue) => {
                                setSelectedClub(
                                  currentValue === selectedClub
                                    ? ""
                                    : currentValue
                                );
                                setOpen(false);
                              }}
                            >
                              {club.label}
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  selectedClub === club.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>

            {/* Calendario */}
            <Card>
              <CardHeader>
                <CardTitle>Fecha</CardTitle>
                <CardDescription>
                  Seleccioná la fecha de tu reserva
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex justify-end mb-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const today = new Date();
                      setMonth(today);
                      setDate(today);
                    }}
                  >
                    Hoy
                  </Button>
                </div>
                <Calendar
                  mode="single"
                  month={month}
                  onMonthChange={setMonth}
                  selected={date}
                  onSelect={setDate}
                  locale={es}
                  className="rounded-md border w-full"
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                />
              </CardContent>
            </Card>
          </div>

          {/* Panel derecho - Horarios de la semana */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Horarios disponibles</CardTitle>
                <CardDescription>
                  {date
                    ? `Semana del ${format(weekDays[0], "d 'de' MMMM", {
                        locale: es,
                      })}`
                    : "Seleccioná una fecha para ver los horarios"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedClub ? (
                  <div className="text-center py-12 text-zinc-500">
                    Seleccioná un club para ver los horarios disponibles
                  </div>
                ) : !date ? (
                  <div className="text-center py-12 text-zinc-500">
                    Seleccioná una fecha para ver los horarios
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                      {/* Headers de días */}
                      <div className="grid grid-cols-8 gap-2 mb-4">
                        <div className="text-sm font-medium text-zinc-500">
                          Horario
                        </div>
                        {weekDays.map((day) => (
                          <div key={day.toISOString()} className="text-center">
                            <div className="text-xs font-medium text-zinc-500 mb-1">
                              {format(day, "EEE", { locale: es })}
                            </div>
                            <div
                              className={cn(
                                "text-sm font-semibold",
                                format(day, "yyyy-MM-dd") ===
                                  format(date, "yyyy-MM-dd")
                                  ? "text-[#FFBF2C]"
                                  : "text-zinc-900 dark:text-zinc-100"
                              )}
                            >
                              {format(day, "d")}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Grid de horarios */}
                      <div className="space-y-2">
                        {timeSlots.map((time) => (
                          <div key={time} className="grid grid-cols-8 gap-2">
                            <div className="flex items-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
                              {time}
                            </div>
                            {weekDays.map((day) => {
                              const slotKey = `${format(
                                day,
                                "yyyy-MM-dd"
                              )}T${time}`;
                              const isOccupied = isSlotOccupied(day, time);
                              const isSelected = selectedSlot === slotKey;
                              const isPast =
                                day < new Date(new Date().setHours(0, 0, 0, 0));

                              return (
                                <button
                                  key={slotKey}
                                  onClick={() => handleSlotClick(day, time)}
                                  disabled={isOccupied || isPast}
                                  className={cn(
                                    "h-12 rounded-md text-sm font-medium transition-colors",
                                    isOccupied || isPast
                                      ? "bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800"
                                      : isSelected
                                      ? "bg-[#FFBF2C] text-zinc-900 hover:bg-[#FFBF2C]/90"
                                      : "bg-white border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 dark:hover:bg-zinc-800"
                                  )}
                                >
                                  {isOccupied
                                    ? "Ocupado"
                                    : isPast
                                    ? "-"
                                    : "Libre"}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Botón de confirmación */}
            {selectedSlot && (
              <div className="mt-6 flex justify-end">
                <Button
                  size="lg"
                  className="bg-[#FFBF2C] hover:bg-[#FFBF2C]/90 text-zinc-900"
                >
                  Confirmar reserva
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
