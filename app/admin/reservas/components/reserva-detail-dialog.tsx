"use client";

import { Reserva } from "../page";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  FileText,
} from "lucide-react";

interface ReservaDetailDialogProps {
  reserva: Reserva;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Función helper para formatear fecha
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Función helper para obtener el color del badge según el estado
function getEstadoBadgeColor(estado: string): string {
  switch (estado) {
    case "CONFIRMADA":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800";
    case "PENDIENTE":
      return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800";
    case "PAGADO":
      return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800";
    case "CANCELADA":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800";
    case "NO_ASISTIO":
      return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800";
    default:
      return "";
  }
}

// Función helper para obtener el texto legible del estado
function getEstadoLabel(estado: string): string {
  switch (estado) {
    case "CONFIRMADA":
      return "Confirmada";
    case "PENDIENTE":
      return "Pendiente";
    case "PAGADO":
      return "Pagado";
    case "CANCELADA":
      return "Cancelada";
    case "NO_ASISTIO":
      return "No asistió";
    default:
      return estado;
  }
}

// Función helper para obtener el texto legible de la fuente
function getFuenteLabel(fuente: string): string {
  switch (fuente) {
    case "WEB":
      return "Web";
    case "TELEFONICA":
      return "Teléfono";
    case "PRESENCIAL":
      return "Presencial";
    default:
      return fuente;
  }
}

export function ReservaDetailDialog({
  reserva,
  open,
  onOpenChange,
}: ReservaDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Detalles de la Reserva #{reserva.id}
          </DialogTitle>
          <DialogDescription>
            Información completa de la reserva
          </DialogDescription>
          {/* Estado y Fuente */}
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className={getEstadoBadgeColor(reserva.estado)}
            >
              {getEstadoLabel(reserva.estado)}
            </Badge>
            <Badge variant="secondary">{getFuenteLabel(reserva.fuente)}</Badge>
          </div>
        </DialogHeader>

        <Separator className="" />

        <div className="space-y-6 overflow-y-auto pr-2">
          {/* Información del Cliente */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              Información del Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">{reserva.cliente_nombre}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  Email
                </p>
                <p className="font-medium">{reserva.cliente_email}</p>
              </div>
              {reserva.cliente_telefono && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Teléfono
                  </p>
                  <p className="font-medium">{reserva.cliente_telefono}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Información de la Cancha */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Información de la Cancha
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">{reserva.cancha.nombre}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Deporte</p>
                <Badge variant="outline">{reserva.cancha.deporte}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Superficie</p>
                <p className="font-medium">{reserva.cancha.superficie}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Servicios Adicionales */}
          {reserva.servicios && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Servicios Adicionales
                </h3>
                <div className="flex flex-wrap gap-2">
                  {reserva.servicios.split(",").map((servicio, index) => (
                    <Badge key={index} variant="outline">
                      {servicio.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Información Financiera */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pago
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Precio Total</p>
                <p className="text-2xl font-bold text-green-600">
                  ${reserva.precio_total}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Fechas */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Fechas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Fecha de Creación
                </p>
                <p className="font-medium">{formatDate(reserva.created_at)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Última Actualización
                </p>
                <p className="font-medium">{formatDate(reserva.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
