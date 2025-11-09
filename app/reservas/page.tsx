"use client";

import * as React from "react";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { es } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { API_URL } from "@/lib/config";
import { Club } from "@/lib/types";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Tipos para la disponibilidad
interface Cancha {
  id: number;
  nombre: string;
  tipo: string;
  techada: boolean;
  precio: number;
  caracteristicas?: string[];
}

interface HorarioDisponibilidad {
  hora: string;
  canchasDisponibles: Cancha[];
}

interface DisponibilidadResponse {
  fecha: string;
  horarios: HorarioDisponibilidad[];
}

// Mock data de disponibilidad
const mockDisponibilidad: DisponibilidadResponse = {
  fecha: "2025-11-09",
  horarios: [
    {
      hora: "08:00",
      canchasDisponibles: [
        {
          id: 1,
          nombre: "Cancha 1",
          tipo: "Fútbol 5",
          techada: true,
          precio: 5000,
          caracteristicas: ["Césped sintético", "Iluminación LED"],
        },
        {
          id: 2,
          nombre: "Cancha 2",
          tipo: "Fútbol 7",
          techada: false,
          precio: 7000,
          caracteristicas: ["Césped natural"],
        },
      ],
    },
    {
      hora: "09:00",
      canchasDisponibles: [
        {
          id: 1,
          nombre: "Cancha 1",
          tipo: "Fútbol 5",
          techada: true,
          precio: 5000,
          caracteristicas: ["Césped sintético", "Iluminación LED"],
        },
      ],
    },
    {
      hora: "10:00",
      canchasDisponibles: [],
    },
    {
      hora: "11:00",
      canchasDisponibles: [
        {
          id: 3,
          nombre: "Cancha 3",
          tipo: "Paddle",
          techada: true,
          precio: 4000,
          caracteristicas: ["Piso de cemento"],
        },
      ],
    },
    {
      hora: "12:00",
      canchasDisponibles: [
        {
          id: 1,
          nombre: "Cancha 1",
          tipo: "Fútbol 5",
          techada: true,
          precio: 5000,
        },
        {
          id: 2,
          nombre: "Cancha 2",
          tipo: "Fútbol 7",
          techada: false,
          precio: 7000,
        },
      ],
    },
    {
      hora: "13:00",
      canchasDisponibles: [
        {
          id: 2,
          nombre: "Cancha 2",
          tipo: "Fútbol 7",
          techada: false,
          precio: 7000,
        },
      ],
    },
    {
      hora: "14:00",
      canchasDisponibles: [],
    },
    {
      hora: "15:00",
      canchasDisponibles: [
        {
          id: 1,
          nombre: "Cancha 1",
          tipo: "Fútbol 5",
          techada: true,
          precio: 5000,
          caracteristicas: ["Césped sintético", "Iluminación LED"],
        },
        {
          id: 2,
          nombre: "Cancha 2",
          tipo: "Fútbol 7",
          techada: false,
          precio: 7000,
          caracteristicas: ["Césped natural"],
        },
        {
          id: 3,
          nombre: "Cancha 3",
          tipo: "Paddle",
          techada: true,
          precio: 4000,
          caracteristicas: ["Piso de cemento"],
        },
      ],
    },
    {
      hora: "16:00",
      canchasDisponibles: [
        {
          id: 1,
          nombre: "Cancha 1",
          tipo: "Fútbol 5",
          techada: true,
          precio: 5000,
        },
      ],
    },
    {
      hora: "17:00",
      canchasDisponibles: [
        {
          id: 2,
          nombre: "Cancha 2",
          tipo: "Fútbol 7",
          techada: false,
          precio: 7000,
        },
      ],
    },
    {
      hora: "18:00",
      canchasDisponibles: [],
    },
    {
      hora: "19:00",
      canchasDisponibles: [
        {
          id: 1,
          nombre: "Cancha 1",
          tipo: "Fútbol 5",
          techada: true,
          precio: 5000,
        },
      ],
    },
    {
      hora: "20:00",
      canchasDisponibles: [
        {
          id: 3,
          nombre: "Cancha 3",
          tipo: "Paddle",
          techada: true,
          precio: 4000,
        },
      ],
    },
    {
      hora: "21:00",
      canchasDisponibles: [
        {
          id: 2,
          nombre: "Cancha 2",
          tipo: "Fútbol 7",
          techada: false,
          precio: 7000,
        },
      ],
    },
  ],
};

export default function ReservasPage() {
  const [open, setOpen] = React.useState(false);
  const [selectedClub, setSelectedClub] = React.useState("");
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [month, setMonth] = React.useState<Date | undefined>(new Date());
  const [clubs, setClubs] = React.useState<Club[]>([]);
  const [isLoadingClubs, setIsLoadingClubs] = React.useState(true);
  const [disponibilidad, setDisponibilidad] =
    React.useState<DisponibilidadResponse | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = React.useState(false);

  // Estado para el dialog de selección de cancha
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedHorario, setSelectedHorario] =
    React.useState<HorarioDisponibilidad | null>(null);
  const [selectedCancha, setSelectedCancha] = React.useState<Cancha | null>(
    null
  );

  // Estado del formulario de reserva
  const [formData, setFormData] = React.useState({
    nombre: "",
    telefono: "",
    email: "",
  });

  // Fetch clubes del backend
  React.useEffect(() => {
    const fetchClubs = async () => {
      try {
        setIsLoadingClubs(true);
        const response = await fetch(`${API_URL}/clubes`);
        if (!response.ok) {
          throw new Error("Error al cargar los clubes");
        }
        const data = await response.json();
        setClubs(data);
      } catch (error) {
        console.error("Error fetching clubs:", error);
        setClubs([]);
      } finally {
        setIsLoadingClubs(false);
      }
    };

    fetchClubs();
  }, []);

  // Fetch timeslots cuando cambia el club o la fecha
  React.useEffect(() => {
    if (selectedClub && date) {
      // TODO: Reemplazar con llamada real al backend
      // const fetchDisponibilidad = async () => {
      //   try {
      //     setIsLoadingSlots(true);
      //     const response = await fetch(
      //       `${API_URL}/clubes/${selectedClub}/disponibilidad?fecha=${format(date, 'yyyy-MM-dd')}`
      //     );
      //     const data = await response.json();
      //     setDisponibilidad(data);
      //   } catch (error) {
      //     console.error("Error fetching disponibilidad:", error);
      //   } finally {
      //     setIsLoadingSlots(false);
      //   }
      // };
      // fetchDisponibilidad();

      // Por ahora usamos mock data
      setDisponibilidad(mockDisponibilidad);
      setSelectedCancha(null);
      setSelectedHorario(null);
    }
  }, [selectedClub, date]);

  const handlePreviousDay = () => {
    if (date) {
      const newDate = subDays(date, 1);
      setDate(newDate);
      setMonth(newDate);
    }
  };

  const handleNextDay = () => {
    if (date) {
      const newDate = addDays(date, 1);
      setDate(newDate);
      setMonth(newDate);
    }
  };

  const handleHorarioClick = (horario: HorarioDisponibilidad) => {
    if (horario.canchasDisponibles.length > 0) {
      setSelectedHorario(horario);
      setDialogOpen(true);
    }
  };

  const handleCanchaSelect = (cancha: Cancha) => {
    setSelectedCancha(cancha);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleConfirmReserva = async () => {
    if (!selectedCancha || !selectedHorario || !selectedClub || !date) return;

    // TODO: Implementar llamada al backend
    const reservaData = {
      clubId: selectedClub,
      canchaId: selectedCancha.id,
      fecha: format(date, "yyyy-MM-dd"),
      horaInicio: selectedHorario.hora,
      clienteNombre: formData.nombre,
      clienteTelefono: formData.telefono,
      clienteEmail: formData.email,
    };

    console.log("Reserva a crear:", reservaData);

    // const response = await fetch(`${API_URL}/reservas`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(reservaData),
    // });

    // if (response.ok) {
    //   // Mostrar mensaje de éxito y redirigir
    //   alert('Reserva confirmada exitosamente!');
    //   setDialogOpen(false);
    //   // Actualizar disponibilidad
    // }

    alert("Reserva confirmada! (Mock)");
    setDialogOpen(false);
    setFormData({ nombre: "", telefono: "", email: "" });
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
                      disabled={isLoadingClubs}
                    >
                      {isLoadingClubs
                        ? "Cargando clubes..."
                        : selectedClub
                        ? clubs.find(
                            (club) => club.id.toString() === selectedClub
                          )?.nombre
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
                              key={club.id}
                              value={club.nombre}
                              onSelect={() => {
                                setSelectedClub(
                                  club.id.toString() === selectedClub
                                    ? ""
                                    : club.id.toString()
                                );
                                setOpen(false);
                              }}
                            >
                              {club.nombre}
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  selectedClub === club.id.toString()
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

                {/* Información del club seleccionado */}
                {selectedClub && (
                  <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">
                          Dirección
                        </p>
                        <p className="text-zinc-900 dark:text-zinc-100">
                          {
                            clubs.find(
                              (club) => club.id.toString() === selectedClub
                            )?.direccion.calle
                          }{" "}
                          {
                            clubs.find(
                              (club) => club.id.toString() === selectedClub
                            )?.direccion.numero
                          }
                        </p>
                        <p className="text-zinc-600 dark:text-zinc-400">
                          {
                            clubs.find(
                              (club) => club.id.toString() === selectedClub
                            )?.direccion.ciudad
                          }
                          ,{" "}
                          {
                            clubs.find(
                              (club) => club.id.toString() === selectedClub
                            )?.direccion.provincia
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">
                          Teléfono
                        </p>
                        <p className="text-zinc-900 dark:text-zinc-100">
                          {
                            clubs.find(
                              (club) => club.id.toString() === selectedClub
                            )?.telefono
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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

          {/* Panel derecho - Horarios del día */}
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePreviousDay}
                      disabled={
                        !date ||
                        date <= new Date(new Date().setHours(0, 0, 0, 0))
                      }
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="min-w-[200px] text-center">
                      <CardTitle className="text-lg">
                        {date
                          ? format(date, "EEEE, d 'de' MMMM", { locale: es })
                          : "Seleccionar fecha"}
                      </CardTitle>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleNextDay}
                      disabled={!date}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Seleccioná el horario que prefieras
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
                ) : isLoadingSlots ? (
                  <div className="text-center py-12 text-zinc-500">
                    Cargando horarios...
                  </div>
                ) : !disponibilidad ? (
                  <div className="text-center py-12 text-zinc-500">
                    No hay información de disponibilidad
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {disponibilidad.horarios.map((horario) => {
                      const hayDisponibilidad =
                        horario.canchasDisponibles.length > 0;
                      const isPast =
                        date.toDateString() === new Date().toDateString() &&
                        parseInt(horario.hora.split(":")[0]) <
                          new Date().getHours();

                      return (
                        <button
                          key={horario.hora}
                          onClick={() => handleHorarioClick(horario)}
                          disabled={!hayDisponibilidad || isPast}
                          className={cn(
                            "h-16 rounded-md text-base font-medium transition-colors relative",
                            !hayDisponibilidad || isPast
                              ? "bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800"
                              : "bg-white border-2 border-zinc-200 hover:border-[#FFBF2C] hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 dark:hover:border-[#FFBF2C] dark:hover:bg-zinc-800"
                          )}
                        >
                          <div>{horario.hora}</div>
                          {hayDisponibilidad && !isPast && (
                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                              {horario.canchasDisponibles.length}{" "}
                              {horario.canchasDisponibles.length === 1
                                ? "cancha"
                                : "canchas"}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Dialog de selección de cancha y formulario */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {!selectedCancha
                ? `Canchas disponibles para las ${selectedHorario?.hora}`
                : "Completá tus datos"}
            </DialogTitle>
            <DialogDescription>
              {!selectedCancha
                ? "Seleccioná la cancha que prefieras"
                : "Ingresá tu información para confirmar la reserva"}
            </DialogDescription>
          </DialogHeader>

          {!selectedCancha ? (
            // Lista de canchas disponibles
            <div className="space-y-3 mt-4">
              {selectedHorario?.canchasDisponibles.map((cancha) => (
                <Card
                  key={cancha.id}
                  className="cursor-pointer hover:border-[#FFBF2C] transition-colors"
                  onClick={() => handleCanchaSelect(cancha)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {cancha.nombre}
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                          {cancha.tipo}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {cancha.techada && (
                            <Badge variant="secondary">Techada</Badge>
                          )}
                          {cancha.caracteristicas?.map((car) => (
                            <Badge key={car} variant="outline">
                              {car}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-2xl font-bold text-[#FFBF2C]">
                          ${cancha.precio.toLocaleString()}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          por hora
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Formulario de reserva
            <div className="space-y-6 mt-4">
              {/* Resumen de la reserva */}
              <Card className="bg-zinc-50 dark:bg-zinc-900">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Resumen de tu reserva</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Cancha:
                      </span>
                      <span className="font-medium">
                        {selectedCancha.nombre} - {selectedCancha.tipo}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Fecha:
                      </span>
                      <span className="font-medium">
                        {date &&
                          format(date, "EEEE, d 'de' MMMM 'de' yyyy", {
                            locale: es,
                          })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Horario:
                      </span>
                      <span className="font-medium">
                        {selectedHorario?.hora}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-zinc-200 dark:border-zinc-700">
                      <span className="font-semibold">Total:</span>
                      <span className="text-xl font-bold text-[#FFBF2C]">
                        ${selectedCancha.precio.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Formulario */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre completo *</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    placeholder="Juan Pérez"
                    value={formData.nombre}
                    onChange={handleFormChange}
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
                    onChange={handleFormChange}
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
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedCancha(null)}
                >
                  Volver
                </Button>
                <Button
                  className="bg-[#FFBF2C] hover:bg-[#FFBF2C]/90 text-zinc-900"
                  onClick={handleConfirmReserva}
                  disabled={
                    !formData.nombre || !formData.telefono || !formData.email
                  }
                >
                  Confirmar reserva
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
