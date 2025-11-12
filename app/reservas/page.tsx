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
import { Checkbox } from "@/components/ui/checkbox";

// Servicios disponibles
const SERVICIOS_DISPONIBLES = [
  "Parrilla",
  "Bebidas",
  "Pelota",
  "Vestuarios",
  "Estacionamiento",
  "Duchas",
];

// Tipos para la disponibilidad
interface Cancha {
  timeslot_id: number;
  cancha_id: number;
  nombre: string;
  deporte: string;
  techado: boolean;
  iluminacion: boolean;
  superficie: number;
  precio: number;
  hora_inicio: string;
  hora_fin: string;
}

interface HorarioDisponibilidad {
  hora: string;
  total_disponibles: number;
  canchas_disponibles: Cancha[];
}

interface DisponibilidadResponse {
  club_id: number;
  fecha: string;
  horarios: HorarioDisponibilidad[];
}

// Tipo para la respuesta de creación de reserva
interface ReservaResponse {
  id: number;
  cancha: {
    id: number;
    nombre: string;
    deporte: string;
    superficie: number;
    techado: boolean;
    iluminacion: boolean;
    precio_hora: number;
    club_id: number;
    activa: boolean;
  };
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_email: string;
  estado: string;
  fuente: string;
  servicios: string;
  precio_total: number;
  created_at: string;
  updated_at: string;
}

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
  const [selectedClubData, setSelectedClubData] = React.useState<Club | null>(
    null
  );

  // Estado para el dialog de selección de cancha
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedHorario, setSelectedHorario] =
    React.useState<HorarioDisponibilidad | null>(null);
  const [selectedCancha, setSelectedCancha] = React.useState<Cancha | null>(
    null
  );

  // Estado para el dialog de confirmación exitosa
  const [successDialogOpen, setSuccessDialogOpen] = React.useState(false);
  const [reservaCreada, setReservaCreada] =
    React.useState<ReservaResponse | null>(null);
  const [isCreatingReserva, setIsCreatingReserva] = React.useState(false);

  // Estado del formulario de reserva
  const [formData, setFormData] = React.useState({
    nombre: "",
    telefono: "",
    email: "",
  });
  const [selectedServicios, setSelectedServicios] = React.useState<string[]>(
    []
  );

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

  // Actualizar el club seleccionado cuando cambia
  React.useEffect(() => {
    if (selectedClub) {
      const club = clubs.find((c) => c.id.toString() === selectedClub);
      setSelectedClubData(club || null);
    } else {
      setSelectedClubData(null);
    }
  }, [selectedClub, clubs]);

  // Función para verificar si un día está disponible
  const isDayAvailable = React.useCallback(
    (day: Date): boolean => {
      if (!selectedClubData || !selectedClubData.horarios) return false;
      if (selectedClubData.horarios.length === 0) return false;

      const diasSemana = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
      ];
      const nombreDia = diasSemana[day.getDay()];

      const horarioDelDia = selectedClubData.horarios.find(
        (h) => h.dia === nombreDia
      );

      return horarioDelDia?.activo || false;
    },
    [selectedClubData]
  );

  // Fetch timeslots cuando cambia el club o la fecha
  React.useEffect(() => {
    if (selectedClub && date) {
      // Verificar que el día seleccionado sea válido (club abierto)
      if (!isDayAvailable(date)) {
        setDisponibilidad(null);
        setSelectedCancha(null);
        setSelectedHorario(null);
        return;
      }

      const fetchDisponibilidad = async () => {
        try {
          setIsLoadingSlots(true);
          const fechaFormateada = format(date, "yyyy-MM-dd");
          const response = await fetch(
            `${API_URL}/timeslots/disponibilidad?club_id=${selectedClub}&fecha=${fechaFormateada}`
          );
          if (!response.ok) {
            throw new Error("Error al cargar la disponibilidad");
          }
          const data = await response.json();
          setDisponibilidad(data);
        } catch (error) {
          console.error("Error fetching disponibilidad:", error);
          setDisponibilidad(null);
        } finally {
          setIsLoadingSlots(false);
        }
      };

      fetchDisponibilidad();
      setSelectedCancha(null);
      setSelectedHorario(null);
    } else {
      // Si no hay club o fecha, limpiar disponibilidad
      setDisponibilidad(null);
      setSelectedCancha(null);
      setSelectedHorario(null);
    }
  }, [selectedClub, date, isDayAvailable]);

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
    if (horario.canchas_disponibles.length > 0) {
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

  const handleServicioToggle = (servicio: string) => {
    setSelectedServicios((prev) =>
      prev.includes(servicio)
        ? prev.filter((s) => s !== servicio)
        : [...prev, servicio]
    );
  };

  // Generar código de reserva: IDclub+NombreClub+IdReserva
  const getCodigoReserva = (reserva: ReservaResponse): string => {
    const clubData = clubs.find((c) => c.id === reserva.cancha.club_id);
    const nombreClubLimpio = clubData?.nombre.replace(/\s+/g, "") || "CLUB";
    return `${reserva.cancha.club_id}${nombreClubLimpio}${reserva.id}`;
  };

  const handleConfirmReserva = async () => {
    if (!selectedCancha || !selectedHorario || !selectedClub || !date) return;

    // Validar que los servicios no estén vacíos
    if (selectedServicios.length === 0) {
      alert("Por favor seleccioná al menos un servicio");
      return;
    }

    const reservaData = {
      timeslot_ids: [selectedCancha.timeslot_id],
      cliente_nombre: formData.nombre,
      cliente_telefono: formData.telefono,
      cliente_email: formData.email,
      fuente: "WEB",
      servicios: selectedServicios.join(", "),
    };

    try {
      setIsCreatingReserva(true);
      const response = await fetch(`${API_URL}/reservas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservaData),
      });

      if (!response.ok) {
        throw new Error("Error al crear la reserva");
      }

      const data: ReservaResponse = await response.json();
      
      // Guardar la reserva creada y mostrar dialog de éxito
      setReservaCreada(data);
      setDialogOpen(false);
      setSuccessDialogOpen(true);
      
      // Limpiar formulario
      setFormData({ nombre: "", telefono: "", email: "" });
      setSelectedServicios([]);
      setSelectedCancha(null);
      setSelectedHorario(null);
      
      // Refrescar disponibilidad
      if (selectedClub && date && isDayAvailable(date)) {
        const fechaFormateada = format(date, "yyyy-MM-dd");
        const dispResponse = await fetch(
          `${API_URL}/timeslots/disponibilidad?club_id=${selectedClub}&fecha=${fechaFormateada}`
        );
        if (dispResponse.ok) {
          const dispData = await dispResponse.json();
          setDisponibilidad(dispData);
        }
      }
    } catch (error) {
      console.error("Error creating reserva:", error);
      alert("Error al crear la reserva. Por favor intentá nuevamente.");
    } finally {
      setIsCreatingReserva(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-zinc-950">
      {/* Header - igual que el landing */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-white backdrop-blur-md border-b border-zinc-200 dark:bg-black/80 dark:border-zinc-800">
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
                  disabled={(date) => {
                    // Deshabilitar fechas pasadas
                    if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
                      return true;
                    }
                    // Si hay un club seleccionado, verificar disponibilidad
                    if (selectedClub) {
                      return !isDayAvailable(date);
                    }
                    // Si no hay club seleccionado, no deshabilitar
                    return false;
                  }}
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
                ) : !isDayAvailable(date) ? (
                  <div className="text-center py-12 text-zinc-500">
                    El club no está abierto en la fecha seleccionada
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
                        horario.canchas_disponibles.length > 0;
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
              {selectedHorario?.canchas_disponibles.map((cancha) => (
                <Card
                  key={cancha.timeslot_id}
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
                          {cancha.deporte}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {cancha.techado && (
                            <Badge variant="secondary">Techada</Badge>
                          )}
                          {cancha.iluminacion && (
                            <Badge variant="outline">Iluminación</Badge>
                          )}
                          <Badge variant="outline">{cancha.superficie}m²</Badge>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-2xl font-bold text-[#FFBF2C]">
                          $
                          {cancha.precio.toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
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
                        {selectedCancha.nombre} - {selectedCancha.deporte}
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
                        $
                        {selectedCancha.precio.toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
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

                <div className="space-y-2">
                  <Label>Servicios *</Label>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Seleccioná los servicios que necesitás
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {SERVICIOS_DISPONIBLES.map((servicio) => (
                      <div
                        key={servicio}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={servicio}
                          checked={selectedServicios.includes(servicio)}
                          onCheckedChange={() => handleServicioToggle(servicio)}
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

              {/* Botones */}
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCancha(null);
                    setSelectedServicios([]);
                  }}
                  disabled={isCreatingReserva}
                >
                  Volver
                </Button>
                <Button
                  className="bg-[#FFBF2C] hover:bg-[#FFBF2C]/90 text-zinc-900"
                  onClick={handleConfirmReserva}
                  disabled={
                    !formData.nombre ||
                    !formData.telefono ||
                    !formData.email ||
                    selectedServicios.length === 0 ||
                    isCreatingReserva
                  }
                >
                  {isCreatingReserva ? "Creando reserva..." : "Confirmar reserva"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación exitosa */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              ¡Reserva confirmada! ✓
            </DialogTitle>
            <DialogDescription className="text-center">
              Tu reserva ha sido creada exitosamente
            </DialogDescription>
          </DialogHeader>

          {reservaCreada && (
            <div className="space-y-4 mt-4">
              {/* Código de reserva destacado */}
              <Card className="bg-[#FFBF2C]/10 border-[#FFBF2C]">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                    Código de reserva
                  </p>
                  <p className="text-2xl font-bold text-[#FFBF2C] tracking-wider">
                    {getCodigoReserva(reservaCreada)}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                    Guardá este código para consultar tu reserva
                  </p>
                </CardContent>
              </Card>

              {/* Detalles de la reserva */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-semibold text-sm text-zinc-700 dark:text-zinc-300 mb-2">
                    Detalles de la reserva
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Cliente:
                      </span>
                      <span className="font-medium">
                        {reservaCreada.cliente_nombre}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Email:
                      </span>
                      <span className="font-medium">
                        {reservaCreada.cliente_email}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Teléfono:
                      </span>
                      <span className="font-medium">
                        {reservaCreada.cliente_telefono}
                      </span>
                    </div>

                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-zinc-600 dark:text-zinc-400">
                          Cancha:
                        </span>
                        <span className="font-medium">
                          {reservaCreada.cancha.nombre}
                        </span>
                      </div>
                      
                      <div className="flex justify-between mt-1">
                        <span className="text-zinc-600 dark:text-zinc-400">
                          Deporte:
                        </span>
                        <span className="font-medium">
                          {reservaCreada.cancha.deporte}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-zinc-600 dark:text-zinc-400">
                          Servicios:
                        </span>
                        <span className="font-medium text-right max-w-[60%]">
                          {reservaCreada.servicios}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-zinc-600 dark:text-zinc-400">
                          Estado:
                        </span>
                        <Badge variant="secondary">
                          {reservaCreada.estado}
                        </Badge>
                      </div>
                    </div>

                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Precio total:</span>
                        <span className="text-xl font-bold text-[#FFBF2C]">
                          $
                          {reservaCreada.precio_total.toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Botón cerrar */}
              <Button
                className="w-full bg-[#FFBF2C] hover:bg-[#FFBF2C]/90 text-zinc-900"
                onClick={() => {
                  setSuccessDialogOpen(false);
                  setReservaCreada(null);
                }}
              >
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
