"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconUser, IconPhone, IconMail } from "@tabler/icons-react";
import { API_URL } from "@/lib/config";
import { ReservasPorCliente } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { authenticatedFetch } from "@/lib/auth";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { ReservaEstadoBadge } from "@/components/ui/reserva-estado-badge";

export default function ReservasPorClientePage() {
  const [allClientes, setAllClientes] = useState<ReservasPorCliente[]>([]);
  const [selectedCliente, setSelectedCliente] =
    useState<ReservasPorCliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClienteEmail, setSelectedClienteEmail] = useState("");

  useEffect(() => {
    fetchAllClientes();
  }, []);

  useEffect(() => {
    if (selectedClienteEmail) {
      const cliente = allClientes.find(
        (c) => c.cliente_email === selectedClienteEmail
      );
      setSelectedCliente(cliente || null);
    } else {
      setSelectedCliente(null);
    }
  }, [selectedClienteEmail, allClientes]);

  const fetchAllClientes = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(
        `${API_URL}/reportes/reservas-por-cliente`
      );

      if (response.ok) {
        const result = await response.json();
        setAllClientes(result);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const clienteOptions: ComboboxOption[] = allClientes.map((cliente) => ({
    value: cliente.cliente_email,
    label: `${cliente.cliente_nombre} (${cliente.cliente_email})`,
  }));

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reservas por Cliente</h1>
        <p className="text-muted-foreground">
          Visualiza el historial de reservas agrupadas por cliente
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Cliente</CardTitle>
          <CardDescription>
            Busca y selecciona un cliente para ver su historial de reservas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Combobox
                options={clienteOptions}
                value={selectedClienteEmail}
                onValueChange={setSelectedClienteEmail}
                placeholder="Seleccionar cliente..."
                emptyText="No se encontraron clientes."
                searchPlaceholder="Buscar por nombre o email..."
                disabled={loading}
              />
            </div>
            {selectedClienteEmail && (
              <Button
                variant="outline"
                onClick={() => setSelectedClienteEmail("")}
              >
                Limpiar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !selectedCliente ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <IconUser className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {allClientes.length === 0
                ? "No hay clientes con reservas disponibles"
                : "Selecciona un cliente para ver su historial de reservas"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {[selectedCliente].map((cliente) => (
            <Card key={cliente.cliente_email}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconUser className="h-5 w-5" />
                  {cliente.cliente_nombre}
                </CardTitle>
                <CardDescription className="space-y-1">
                  <div className="flex items-center gap-2">
                    <IconMail className="h-4 w-4" />
                    {cliente.cliente_email}
                  </div>
                  <div className="flex items-center gap-2">
                    <IconPhone className="h-4 w-4" />
                    {cliente.cliente_telefono}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm font-medium">
                    Total de reservas: {cliente.reservas.length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total gastado:{" "}
                    {formatCurrency(
                      cliente.reservas
                        .reduce((sum, r) => sum + parseFloat(r.precio_total), 0)
                        .toString()
                    )}
                  </p>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fuente</TableHead>
                      <TableHead>Servicios</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cliente.reservas.map((reserva) => (
                      <TableRow key={reserva.id}>
                        <TableCell className="font-medium">
                          #{reserva.id}
                        </TableCell>
                        <TableCell>{formatDate(reserva.created_at)}</TableCell>
                        <TableCell>
                          <ReservaEstadoBadge estado={reserva.estado} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{reserva.fuente}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {reserva.servicios || "—"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(reserva.precio_total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
