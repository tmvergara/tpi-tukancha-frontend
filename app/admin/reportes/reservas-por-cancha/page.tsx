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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconBallFootball,
  IconCalendar,
  IconCurrencyDollar,
  IconFilter,
} from "@tabler/icons-react";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { API_URL } from "@/lib/config";
import { ReservasPorCancha } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authenticatedFetch } from "@/lib/auth";
import { ReservaEstadoBadge } from "@/components/ui/reserva-estado-badge";

interface Cancha {
  id: number;
  nombre: string;
  deporte: string;
}

export default function ReservasPorCanchaPage() {
  const [data, setData] = useState<ReservasPorCancha[]>([]);
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [loading, setLoading] = useState(true);
  const [canchaId, setCanchaId] = useState<string>("");
  const [fechaInicio, setFechaInicio] = useState<Date | undefined>(undefined);
  const [fechaFin, setFechaFin] = useState<Date | undefined>(undefined);
  const [openFechaInicio, setOpenFechaInicio] = useState(false);
  const [openFechaFin, setOpenFechaFin] = useState(false);

  useEffect(() => {
    fetchCanchas();
  }, []);

  useEffect(() => {
    fetchData();
  }, [canchaId, fechaInicio, fechaFin]);

  const fetchCanchas = async () => {
    try {
      const response = await authenticatedFetch(`${API_URL}/canchas`);

      if (response.ok) {
        const result = await response.json();
        setCanchas(result);
      }
    } catch (error) {
      console.error("Error fetching canchas:", error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (canchaId) params.append("cancha_id", canchaId);
      if (fechaInicio)
        params.append("fecha_inicio", fechaInicio.toISOString().split("T")[0]);
      if (fechaFin)
        params.append("fecha_fin", fechaFin.toISOString().split("T")[0]);

      const url = `${API_URL}/reportes/reservas-por-cancha${
        params.toString() ? `?${params}` : ""
      }`;

      const response = await authenticatedFetch(url);

      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setCanchaId("");
    setFechaInicio(undefined);
    setFechaFin(undefined);
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(parseFloat(amount));
  };

  const chartData = data.map((item) => ({
    cancha:
      item.cancha.nombre.length > 20
        ? item.cancha.nombre.substring(0, 20) + "..."
        : item.cancha.nombre,
    reservas: item.total_reservas,
    ingresos: parseFloat(item.total_ingresos),
  }));

  const chartConfig = {
    ingresos: {
      label: "Ingresos",
      color: "var(--chart-6)",
    },
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
        <h1 className="text-3xl font-bold">Reservas por Cancha</h1>
        <p className="text-muted-foreground">
          Analiza las reservas y los ingresos de cada cancha
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconFilter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Cancha</Label>
              <Select value={canchaId} onValueChange={setCanchaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las canchas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las canchas</SelectItem>
                  {canchas.map((cancha) => (
                    <SelectItem key={cancha.id} value={cancha.id.toString()}>
                      {cancha.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha Inicio</Label>
              <Popover open={openFechaInicio} onOpenChange={setOpenFechaInicio}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between font-normal"
                  >
                    {fechaInicio
                      ? fechaInicio.toLocaleDateString("es-AR")
                      : "Seleccionar fecha"}
                    <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={fechaInicio}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      setFechaInicio(date);
                      setOpenFechaInicio(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Fecha Fin</Label>
              <Popover open={openFechaFin} onOpenChange={setOpenFechaFin}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between font-normal"
                  >
                    {fechaFin
                      ? fechaFin.toLocaleDateString("es-AR")
                      : "Seleccionar fecha"}
                    <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={fechaFin}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      setFechaFin(date);
                      setOpenFechaFin(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="invisible">Acción</Label>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleClearFilters}
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : data.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <IconBallFootball className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No hay datos disponibles para los filtros seleccionados
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Resumen por Cancha</CardTitle>
              <CardDescription>Ingresos totales por cancha</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="cancha"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      fontSize={12}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="ingresos"
                      fill="var(--color-ingresos)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {data.map((item) => (
              <Card key={item.cancha.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconBallFootball className="h-5 w-5" />
                    {item.cancha.nombre}
                  </CardTitle>
                  <CardDescription>
                    {item.cancha.deporte} • Precio por hora:{" "}
                    {formatCurrency(item.cancha.precio_hora)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                      <IconCalendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Reservas
                        </p>
                        <p className="text-2xl font-bold">
                          {item.total_reservas}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                      <IconCurrencyDollar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Ingresos
                        </p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(item.total_ingresos)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {item.reservas.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">
                        Detalle de Reservas
                      </h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Fuente</TableHead>
                            <TableHead className="text-right">Precio</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {item.reservas.map((reserva) => (
                            <TableRow key={reserva.id}>
                              <TableCell className="font-medium">
                                #{reserva.id}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">
                                    {reserva.cliente_nombre}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {reserva.cliente_email}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                {formatDate(reserva.created_at)}
                              </TableCell>
                              <TableCell>
                                <ReservaEstadoBadge estado={reserva.estado} />
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {reserva.fuente}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(reserva.precio_total)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
