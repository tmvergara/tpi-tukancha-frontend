"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { authenticatedFetch } from "@/lib/auth";
import { API_URL } from "@/lib/config";
import { format, addDays, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Cancha,
  Club,
  HorarioDisponibilidad,
  DisponibilidadResponse,
  ReservaResponse,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { UnauthorizedAlert } from "@/components/unauthorized-alert";
import { DisponibilidadGrid } from "@/components/reservas/disponibilidad-grid";
import { CanchaCard } from "@/components/reservas/cancha-card";
import { ReservaForm } from "@/components/reservas/reserva-form";
import { ReservaResumen } from "@/components/reservas/reserva-resumen";
import { toast } from "sonner";

export default function ReservaManualPage() {
  const { user, loading: authLoading } = useAuth();
  const { can } = usePermissions();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date | undefined>(new Date());
  const [clubData, setClubData] = useState<Club | null>(null);
  const [isLoadingClub, setIsLoadingClub] = useState(true);
  const [disponibilidad, setDisponibilidad] =
    useState<DisponibilidadResponse | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Estado para el dialog de selección de cancha
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedHorario, setSelectedHorario] =
    useState<HorarioDisponibilidad | null>(null);
  const [selectedCancha, setSelectedCancha] = useState<Cancha | null>(null);

  // Estado para crear reserva
  const [isCreatingReserva, setIsCreatingReserva] = useState(false);

  // Estado del formulario de reserva
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
  });
  const [selectedServicios, setSelectedServicios] = useState<string[]>([]);

  // Fetch datos del club
  useEffect(() => {
    const fetchClubData = async () => {
      if (!user?.club_id) return;

      try {
        setIsLoadingClub(true);
        const response = await fetch(`${API_URL}/clubes/${user.club_id}`);
        if (!response.ok) {
          throw new Error("Error al cargar el club");
        }
        const data = await response.json();
        setClubData(data);
      } catch (error) {
        console.error("Error fetching club:", error);
        toast.error("Error al cargar datos del club");
      } finally {
        setIsLoadingClub(false);
      }
    };

    if (!authLoading && user) {
      fetchClubData();
    }
  }, [user, authLoading]);

  // Función para verificar si un día está disponible
  const isDayAvailable = useCallback(
    (day: Date): boolean => {
      if (!clubData || !clubData.horarios) return false;
      if (clubData.horarios.length === 0) return false;

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

      const horarioDelDia = clubData.horarios.find((h) => h.dia === nombreDia);

      return horarioDelDia?.activo || false;
    },
    [clubData]
  );

  // Fetch timeslots cuando cambia la fecha
  useEffect(() => {
    const fetchDisponibilidad = async () => {
      if (!user?.club_id || !date) return;

      // Verificar que el día seleccionado sea válido
      if (!isDayAvailable(date)) {
        setDisponibilidad(null);
        setSelectedCancha(null);
        setSelectedHorario(null);
        return;
      }

      try {
        setIsLoadingSlots(true);
        const fechaFormateada = format(date, "yyyy-MM-dd");
        const response = await fetch(
          `${API_URL}/timeslots/disponibilidad?club_id=${user.club_id}&fecha=${fechaFormateada}`
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

    if (!authLoading && user && date) {
      fetchDisponibilidad();
      setSelectedCancha(null);
      setSelectedHorario(null);
    }
  }, [user, date, authLoading, isDayAvailable]);

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

  const handleTelefonoChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      telefono: value,
    }));
  };

  const handleServicioToggle = (servicio: string) => {
    setSelectedServicios((prev) =>
      prev.includes(servicio)
        ? prev.filter((s) => s !== servicio)
        : [...prev, servicio]
    );
  };

  const handleConfirmReserva = async () => {
    if (!selectedCancha || !selectedHorario || !user?.club_id || !date) return;

    if (selectedServicios.length === 0) {
      toast.error("Selecciona al menos un servicio");
      return;
    }

    const reservaData = {
      timeslot_ids: [selectedCancha.timeslot_id],
      cliente_nombre: formData.nombre,
      cliente_telefono: formData.telefono,
      cliente_email: formData.email,
      fuente: "PRESENCIAL",
      servicios: selectedServicios.join(", "),
    };

    try {
      setIsCreatingReserva(true);
      const response = await authenticatedFetch(`${API_URL}/reservas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservaData),
      });

      if (!response.ok) {
        throw new Error("Error al crear la reserva");
      }

      const data: ReservaResponse = await response.json();

      toast.success("Reserva creada exitosamente", {
        description: `Reserva #${data.id} creada para ${formData.nombre}`,
      });

      setDialogOpen(false);

      // Limpiar formulario
      setFormData({ nombre: "", telefono: "", email: "" });
      setSelectedServicios([]);
      setSelectedCancha(null);
      setSelectedHorario(null);

      // Refrescar disponibilidad
      if (date && isDayAvailable(date)) {
        const fechaFormateada = format(date, "yyyy-MM-dd");
        const dispResponse = await fetch(
          `${API_URL}/timeslots/disponibilidad?club_id=${user.club_id}&fecha=${fechaFormateada}`
        );
        if (dispResponse.ok) {
          const dispData = await dispResponse.json();
          setDisponibilidad(dispData);
        }
      }
    } catch (error) {
      console.error("Error creating reserva:", error);
      toast.error("Error al crear la reserva", {
        description:
          error instanceof Error
            ? error.message
            : "Intentá nuevamente más tarde",
      });
    } finally {
      setIsCreatingReserva(false);
    }
  };

  if (authLoading || isLoadingClub) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!can("reservas:create")) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Crear Reserva Manual
          </h1>
          <p className="text-muted-foreground">
            Creá reservas para tus clientes
          </p>
        </div>
        <UnauthorizedAlert permission="reservas:create" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Crear Reserva Manual
        </h1>
        <p className="text-muted-foreground">
          Seleccioná la fecha, horario y cancha para crear una reserva
        </p>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* Panel izquierdo - Calendario */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fecha</CardTitle>
              <CardDescription>
                Seleccioná la fecha de la reserva
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
                  // Verificar disponibilidad del club
                  if (clubData) {
                    return !isDayAvailable(date);
                  }
                  return false;
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Panel derecho - Horarios */}
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
                      !date || date <= new Date(new Date().setHours(0, 0, 0, 0))
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
                Seleccioná el horario disponible
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!date ? (
                <div className="text-center py-12 text-muted-foreground">
                  Seleccioná una fecha para ver los horarios
                </div>
              ) : !isDayAvailable(date) ? (
                <div className="text-center py-12 text-muted-foreground">
                  El club no está abierto en la fecha seleccionada
                </div>
              ) : isLoadingSlots ? (
                <div className="text-center py-12 text-muted-foreground">
                  Cargando horarios...
                </div>
              ) : !disponibilidad ? (
                <div className="text-center py-12 text-muted-foreground">
                  No hay información de disponibilidad
                </div>
              ) : (
                <DisponibilidadGrid
                  horarios={disponibilidad.horarios}
                  onHorarioClick={handleHorarioClick}
                  selectedDate={date}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de selección de cancha y formulario */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {!selectedCancha
                ? `Canchas disponibles para las ${selectedHorario?.hora}`
                : "Datos del cliente"}
            </DialogTitle>
            <DialogDescription>
              {!selectedCancha
                ? "Seleccioná la cancha para la reserva"
                : "Ingresá los datos del cliente para la reserva"}
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 -mx-6 px-6">
            {!selectedCancha ? (
              // Lista de canchas disponibles
              <div className="space-y-3 mt-4">
                {selectedHorario?.canchas_disponibles.map((cancha) => (
                  <CanchaCard
                    key={cancha.timeslot_id}
                    cancha={cancha}
                    onClick={() => handleCanchaSelect(cancha)}
                  />
                ))}
              </div>
            ) : (
              // Formulario de reserva
              <div className="space-y-6 mt-4">
                {date && (
                  <ReservaResumen
                    cancha={selectedCancha}
                    fecha={date}
                    horario={selectedHorario!}
                  />
                )}

                <ReservaForm
                  formData={formData}
                  selectedServicios={selectedServicios}
                  onFormChange={handleFormChange}
                  onTelefonoChange={handleTelefonoChange}
                  onServicioToggle={handleServicioToggle}
                />

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
                    onClick={handleConfirmReserva}
                    disabled={
                      !formData.nombre ||
                      !formData.telefono ||
                      !formData.email ||
                      selectedServicios.length === 0 ||
                      isCreatingReserva
                    }
                  >
                    {isCreatingReserva ? "Creando reserva..." : "Crear reserva"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
