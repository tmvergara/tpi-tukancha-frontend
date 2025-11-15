"use client";

import { useState, useEffect } from "react";
import { Reserva } from "../page";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Banknote, QrCode, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { authenticatedFetch } from "@/lib/auth";
import { API_URL } from "@/lib/config";
import { toast } from "sonner";

interface CobrarReservaDialogProps {
  reserva: Reserva;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type PaymentMethod = "efectivo" | "qr" | null;
type Step = "select" | "process";

export function CobrarReservaDialog({
  reserva,
  open,
  onOpenChange,
  onSuccess,
}: CobrarReservaDialogProps) {
  const [step, setStep] = useState<Step>("select");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [montoRecibido, setMontoRecibido] = useState<string>("");
  const [vuelto, setVuelto] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calcular vuelto cuando cambia el monto recibido
  useEffect(() => {
    if (paymentMethod === "efectivo" && montoRecibido) {
      const recibido = parseFloat(montoRecibido);
      const total = reserva.precio_total;
      if (!isNaN(recibido) && recibido >= 0) {
        setVuelto(Math.max(0, recibido - total));
      } else {
        setVuelto(0);
      }
    }
  }, [montoRecibido, reserva.precio_total, paymentMethod]);

  // Resetear el formulario cuando se cierra el diálogo
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("select");
        setPaymentMethod(null);
        setMontoRecibido("");
        setVuelto(0);
      }, 200); // Pequeño delay para la animación de cierre
    }
  }, [open]);

  const handleNext = () => {
    if (paymentMethod) {
      setStep("process");
    }
  };

  const handleBack = () => {
    setStep("select");
    setMontoRecibido("");
    setVuelto(0);
  };

  const handleMarcarComoPagado = async () => {
    setIsSubmitting(true);

    try {
      const response = await authenticatedFetch(
        `${API_URL}/reservas/${reserva.id}/pagar`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al marcar como pagado");
      }

      toast.success("Reserva marcada como pagada", {
        description: `La reserva #${reserva.id} ha sido marcada como pagada exitosamente.`,
      });

      onOpenChange(false);
      onSuccess?.(); // Actualizar la tabla
    } catch (error) {
      console.error("Error al marcar como pagado:", error);
      toast.error("Error al procesar el pago", {
        description:
          error instanceof Error
            ? error.message
            : "No se pudo marcar la reserva como pagada. Intente nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cobrar Reserva #{reserva.id}
          </DialogTitle>
          <DialogDescription>
            Total a cobrar: ${reserva.precio_total}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === "select" && (
            <>
              <div className="space-y-3">
                <Label>Seleccione el método de pago</Label>

                {/* Opción Efectivo */}
                <button
                  onClick={() => setPaymentMethod("efectivo")}
                  className={`w-full rounded-lg border-2 p-4 transition-all hover:border-primary ${
                    paymentMethod === "efectivo"
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        paymentMethod === "efectivo"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <Banknote className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">Cobrar en Efectivo</p>
                      <p className="text-sm text-muted-foreground">
                        Ingrese el monto recibido
                      </p>
                    </div>
                    {paymentMethod === "efectivo" && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </button>

                {/* Opción QR */}
                <button
                  onClick={() => setPaymentMethod("qr")}
                  className={`w-full rounded-lg border-2 p-4 transition-all hover:border-primary ${
                    paymentMethod === "qr"
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        paymentMethod === "qr"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <QrCode className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">Generar QR de Cobro</p>
                      <p className="text-sm text-muted-foreground">
                        Genere un código QR para el pago
                      </p>
                    </div>
                    {paymentMethod === "qr" && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleNext} disabled={!paymentMethod}>
                  Siguiente
                </Button>
              </div>
            </>
          )}

          {step === "process" && paymentMethod === "efectivo" && (
            <>
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    Total a cobrar
                  </p>
                  <p className="text-2xl font-bold">${reserva.precio_total}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monto-recibido">Monto Recibido</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="monto-recibido"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={montoRecibido}
                      onChange={(e) => setMontoRecibido(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                </div>

                {montoRecibido && parseFloat(montoRecibido) > 0 && (
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Vuelto</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${vuelto.toFixed(2)}
                    </p>
                  </div>
                )}

                {montoRecibido &&
                  parseFloat(montoRecibido) < reserva.precio_total && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                      <p className="text-sm text-destructive">
                        El monto recibido es menor al total a cobrar
                      </p>
                    </div>
                  )}
              </div>

              <div className="flex justify-between gap-2 pt-4">
                <Button variant="outline" onClick={handleBack}>
                  Atrás
                </Button>
                <Button
                  onClick={handleMarcarComoPagado}
                  disabled={
                    isSubmitting ||
                    !montoRecibido ||
                    parseFloat(montoRecibido) < reserva.precio_total
                  }
                >
                  {isSubmitting ? "Procesando..." : "Marcar como Pagado"}
                </Button>
              </div>
            </>
          )}

          {step === "process" && paymentMethod === "qr" && (
            <>
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    Total a cobrar
                  </p>
                  <p className="text-2xl font-bold">${reserva.precio_total}</p>
                </div>

                {/* QR Code Real */}
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8">
                  <div className="mb-4 rounded-lg bg-white p-4">
                    <QRCodeSVG
                      value={`PAGO-RESERVA-${reserva.id}-MONTO-${reserva.precio_total}-CLIENTE-${reserva.cliente_email}`}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    Escanee el código QR para realizar el pago
                  </p>
                  <p className="mt-1 text-center text-xs text-muted-foreground">
                    Reserva #{reserva.id} - ${reserva.precio_total}
                  </p>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Una vez que el cliente haya realizado el pago, presione
                    "Marcar como Pagado"
                  </p>
                </div>
              </div>

              <div className="flex justify-between gap-2 pt-4">
                <Button variant="outline" onClick={handleBack}>
                  Atrás
                </Button>
                <Button
                  onClick={handleMarcarComoPagado}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Procesando..." : "Marcar como Pagado"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
