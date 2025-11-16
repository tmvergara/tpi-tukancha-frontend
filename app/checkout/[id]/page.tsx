"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  CreditCard,
  Building2,
  CheckCircle,
  XCircle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const reservaId = params.id as string;
  const monto = searchParams.get("monto");
  const codigo = searchParams.get("codigo");
  const clienteNombre = searchParams.get("nombre");

  const [metodoPago, setMetodoPago] = React.useState<
    "tarjeta" | "transferencia"
  >("tarjeta");
  const [procesando, setProcesando] = React.useState(false);
  const [resultado, setResultado] = React.useState<
    "aprobado" | "rechazado" | null
  >(null);

  // Datos de tarjeta
  const [numeroTarjeta, setNumeroTarjeta] = React.useState("");
  const [nombreTitular, setNombreTitular] = React.useState("");
  const [vencimiento, setVencimiento] = React.useState("");
  const [cvv, setCvv] = React.useState("");
  const [tipoTarjeta, setTipoTarjeta] = React.useState<"debito" | "credito">(
    "credito"
  );

  // Datos CBU para transferencia
  const cbuDestino = "0000003100010200309456";
  const aliasDestino = "TUKANCHA.PAGOS";

  const formatearNumeroTarjeta = (valor: string) => {
    const limpio = valor.replace(/\s/g, "");
    const grupos = limpio.match(/.{1,4}/g);
    return grupos ? grupos.join(" ") : limpio;
  };

  const formatearVencimiento = (valor: string) => {
    const limpio = valor.replace(/\D/g, "");
    if (limpio.length >= 2) {
      return limpio.slice(0, 2) + "/" + limpio.slice(2, 4);
    }
    return limpio;
  };

  const validarPago = (): boolean => {
    if (!clienteNombre) return false;

    if (metodoPago === "tarjeta") {
      return (
        numeroTarjeta.replace(/\s/g, "").length === 16 &&
        nombreTitular.trim().length > 0 &&
        vencimiento.length === 5 &&
        cvv.length >= 3
      );
    } else {
      return true; // Para transferencia solo necesita confirmar
    }
  };

  const procesarPago = () => {
    if (!validarPago()) return;

    setProcesando(true);

    // Simular procesamiento de pago (2 segundos)
    setTimeout(() => {
      // Validación según nombre del cliente
      const nombreUpper = clienteNombre?.toUpperCase() || "";

      if (metodoPago === "tarjeta") {
        // Para tarjeta, validar por nombre del titular
        if (nombreTitular.toUpperCase().startsWith("APRO")) {
          setResultado("aprobado");
        } else if (nombreTitular.toUpperCase().startsWith("DEC")) {
          setResultado("rechazado");
        } else {
          // Si no empieza con APRO o DEC, aprobar por defecto
          setResultado("aprobado");
        }
      } else {
        // Para transferencia, validar por nombre del cliente
        if (nombreUpper.startsWith("APRO")) {
          setResultado("aprobado");
        } else if (nombreUpper.startsWith("DEC")) {
          setResultado("rechazado");
        } else {
          // Si no empieza con APRO o DEC, aprobar por defecto
          setResultado("aprobado");
        }
      }

      setProcesando(false);
    }, 2000);
  };

  const volverAReservas = () => {
    const status = resultado === "aprobado" ? "success" : "failed";
    router.push(`/reservas?payment=${status}&reserva_id=${reservaId}`);
  };

  // Si ya hay un resultado, mostrar pantalla de resultado
  if (resultado) {
    return (
      <div className="min-h-screen bg-linear-to-br from-sky-50 to-sky-100 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              {resultado === "aprobado" ? (
                <>
                  <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ¡Pago aprobado!
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Tu pago ha sido procesado exitosamente
                  </p>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Monto pagado:
                      </span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        $
                        {parseFloat(monto || "0").toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Código de reserva:
                      </span>
                      <span className="font-mono font-bold">{codigo}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
                    Pago rechazado
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    No pudimos procesar tu pago. Por favor, intentá con otro
                    método.
                  </p>
                </>
              )}

              <Button
                onClick={volverAReservas}
                className="w-full mt-6 bg-sky-500 hover:bg-sky-700 text-white"
              >
                Volver a reservas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-sky-50 to-sky-100 dark:from-zinc-950 dark:to-zinc-900">
      {/* Header MercadoPago Style */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIGOGLllcBPYfomOl6ezt5bQvSL0fu8nQLPQ&s"
                alt=""
              />
            </div>
            <span className="font-semibold text-lg">MercadoPago</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <Lock className="w-4 h-4" />
            <span>Pago seguro</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 ">
        <div className="grid md:grid-cols-[1fr_320px] gap-6">
          {/* Panel de pago */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Medio de pago</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={metodoPago}
                  onValueChange={(v) =>
                    setMetodoPago(v as "tarjeta" | "transferencia")
                  }
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="tarjeta">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Tarjeta
                    </TabsTrigger>
                    <TabsTrigger value="transferencia">
                      <Building2 className="w-4 h-4 mr-2" />
                      Transferencia
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="tarjeta" className="space-y-4 mt-6">
                    {/* Tipo de tarjeta */}
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className={`flex-1 ${
                          tipoTarjeta === "debito"
                            ? "bg-sky-500 text-white hover:bg-sky-600 border-sky-500"
                            : ""
                        }`}
                        onClick={() => setTipoTarjeta("debito")}
                      >
                        Débito
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className={`flex-1 ${
                          tipoTarjeta === "credito"
                            ? "bg-sky-500 text-white hover:bg-sky-600 border-sky-500"
                            : ""
                        }`}
                        onClick={() => setTipoTarjeta("credito")}
                      >
                        Crédito
                      </Button>
                    </div>

                    {/* Número de tarjeta */}
                    <div className="space-y-2">
                      <Label htmlFor="numero">Número de tarjeta</Label>
                      <Input
                        id="numero"
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        value={numeroTarjeta}
                        onChange={(e) =>
                          setNumeroTarjeta(
                            formatearNumeroTarjeta(e.target.value)
                          )
                        }
                      />
                    </div>

                    {/* Nombre del titular */}
                    <div className="space-y-2">
                      <Label htmlFor="titular">Nombre del titular</Label>
                      <Input
                        id="titular"
                        placeholder="Como aparece en la tarjeta"
                        value={nombreTitular}
                        onChange={(e) =>
                          setNombreTitular(e.target.value.toUpperCase())
                        }
                      />
                      <p className="text-xs text-zinc-500">
                        💡 Tip: Usá "APRO" al inicio para aprobar o "DEC" para
                        rechazar
                      </p>
                    </div>

                    {/* Vencimiento y CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vencimiento">Vencimiento</Label>
                        <Input
                          id="vencimiento"
                          placeholder="MM/AA"
                          maxLength={5}
                          value={vencimiento}
                          onChange={(e) =>
                            setVencimiento(formatearVencimiento(e.target.value))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          maxLength={4}
                          type="password"
                          value={cvv}
                          onChange={(e) =>
                            setCvv(e.target.value.replace(/\D/g, ""))
                          }
                        />
                      </div>
                    </div>

                    <Button
                      className="w-full bg-sky-500 hover:bg-sky-700 text-white mt-6"
                      onClick={procesarPago}
                      disabled={!validarPago() || procesando}
                    >
                      {procesando
                        ? "Procesando pago..."
                        : `Pagar $${parseFloat(monto || "0").toLocaleString(
                            "es-AR",
                            { minimumFractionDigits: 2 }
                          )}`}
                    </Button>
                  </TabsContent>

                  <TabsContent value="transferencia" className="space-y-4 mt-6">
                    <div className="bg-sky-50 dark:bg-sky-900/20 rounded-lg p-4 space-y-3">
                      <p className="text-sm font-medium">
                        Datos para transferencia:
                      </p>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-600 dark:text-zinc-400">
                            CBU:
                          </span>
                          <span className="font-mono font-bold">
                            {cbuDestino}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-600 dark:text-zinc-400">
                            Alias:
                          </span>
                          <span className="font-bold">{aliasDestino}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-600 dark:text-zinc-400">
                            Titular:
                          </span>
                          <span className="font-bold">Tukancha S.A.</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-600 dark:text-zinc-400">
                            CUIT:
                          </span>
                          <span className="font-mono">30-12345678-9</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Importante:</strong> Una vez realizada la
                        transferencia, presioná el botón "Ya transferí" para
                        verificar el pago.
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                        💡 Tip: Si tu nombre empieza con "APRO" se aprobará, con
                        "DEC" se rechazará
                      </p>
                    </div>

                    <Button
                      className="w-full bg-sky-500 hover:bg-sky-700 text-white mt-4"
                      onClick={procesarPago}
                      disabled={procesando}
                    >
                      {procesando
                        ? "Verificando transferencia..."
                        : "Ya transferí"}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Resumen de compra */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resumen de compra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                    Reserva de cancha
                  </p>
                  <p className="font-medium">Código: {codigo}</p>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      Cliente:
                    </span>
                    <span className="font-medium">{clienteNombre}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total a pagar:</span>
                    <span className="text-2xl font-bold text-sky-500">
                      $
                      {parseFloat(monto || "0").toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mt-4">
                  <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                    <Lock className="w-4 h-4" />
                    <span>Pago 100% seguro</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 mt-12 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          <p>Simulación de pago - MercadoPago Checkout Pro</p>
          <p className="mt-1">
            Este es un entorno de prueba. No se procesarán pagos reales.
          </p>
        </div>
      </footer>
    </div>
  );
}
