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
  IconChartLine,
  IconBallFootball,
  IconCalendar,
} from "@tabler/icons-react";
import { API_URL } from "@/lib/config";
import { UtilizacionMensual } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Line,
  LineChart,
} from "recharts";
import { authenticatedFetch } from "@/lib/auth";

interface Cancha {
  id: number;
  nombre: string;
  deporte: string;
}

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function UtilizacionDeCanchasPage() {
  const [data, setData] = useState<UtilizacionMensual | null>(null);
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [loading, setLoading] = useState(true);
  const [canchaId, setCanchaId] = useState<string>("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [chartType, setChartType] = useState<"area" | "line">("area");

  useEffect(() => {
    fetchCanchas();

    // Establecer fechas por defecto (último año)
    const today = new Date();
    const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), 1);
    setFechaInicio(lastYear.toISOString().split("T")[0]);
    setFechaFin(today.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (fechaInicio && fechaFin) {
      fetchData();
    }
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
      if (fechaInicio) params.append("fecha_inicio", fechaInicio);
      if (fechaFin) params.append("fecha_fin", fechaFin);

      const url = `${API_URL}/reportes/utilizacion-mensual${
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
    const today = new Date();
    const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), 1);
    setFechaInicio(lastYear.toISOString().split("T")[0]);
    setFechaFin(today.toISOString().split("T")[0]);
  };

  // Transformar datos para el gráfico
  const chartData = data
    ? data.months.map((month, index) => {
        const dataPoint: any = { month: formatMonth(month) };
        data.series.forEach((serie) => {
          dataPoint[serie.cancha.nombre] = serie.data[index];
        });
        return dataPoint;
      })
    : [];

  // Crear configuración del gráfico
  const chartConfig = data
    ? data.series.reduce((config, serie, index) => {
        config[serie.cancha.nombre] = {
          label: serie.cancha.nombre,
          color: CHART_COLORS[index % CHART_COLORS.length],
        };
        return config;
      }, {} as any)
    : {};

  function formatMonth(month: string) {
    const [year, monthNum] = month.split("-");
    const monthNames = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    return `${monthNames[parseInt(monthNum) - 1]} ${year.slice(2)}`;
  }

  const getTotalReservas = () => {
    if (!data) return 0;
    return data.series.reduce((total, serie) => {
      return total + serie.data.reduce((sum, val) => sum + val, 0);
    }, 0);
  };

  const getPromedioMensual = () => {
    if (!data || data.months.length === 0) return 0;
    return Math.round(getTotalReservas() / data.months.length);
  };

  const getMejorMes = () => {
    if (!data || chartData.length === 0) return null;

    const totalesPorMes = chartData.map((monthData) => {
      const total = Object.keys(monthData)
        .filter((key) => key !== "month")
        .reduce((sum, key) => sum + (monthData[key] || 0), 0);
      return { month: monthData.month, total };
    });

    return totalesPorMes.reduce((max, current) =>
      current.total > max.total ? current : max
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Utilización de Canchas</h1>
        <p className="text-muted-foreground">
          Evolución mensual de la utilización de las canchas
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
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
              <input
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha Fin</Label>
              <input
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Gráfico</Label>
              <Select
                value={chartType}
                onValueChange={(val: "area" | "line") => setChartType(val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="area">Área</SelectItem>
                  <SelectItem value="line">Líneas</SelectItem>
                </SelectContent>
              </Select>
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
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : !data || data.months.length === 0 ? (
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
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Reservas
                </CardTitle>
                <IconCalendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getTotalReservas()}</div>
                <p className="text-xs text-muted-foreground">
                  En el período seleccionado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Promedio Mensual
                </CardTitle>
                <IconChartLine className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getPromedioMensual()}</div>
                <p className="text-xs text-muted-foreground">
                  Reservas por mes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mejor Mes</CardTitle>
                <IconBallFootball className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getMejorMes()?.month || "—"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {getMejorMes()?.total || 0} reservas
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Evolución Mensual</CardTitle>
              <CardDescription>
                Número de reservas por mes
                {canchaId ? " - Cancha seleccionada" : " - Todas las canchas"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "area" ? (
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" fontSize={12} tickMargin={10} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      {data.series.map((serie, index) => (
                        <Area
                          key={serie.cancha.id}
                          type="monotone"
                          dataKey={serie.cancha.nombre}
                          stroke={CHART_COLORS[index % CHART_COLORS.length]}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          fillOpacity={0.6}
                          strokeWidth={2}
                        />
                      ))}
                    </AreaChart>
                  ) : (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" fontSize={12} tickMargin={10} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      {data.series.map((serie, index) => (
                        <Line
                          key={serie.cancha.id}
                          type="monotone"
                          dataKey={serie.cancha.nombre}
                          stroke={CHART_COLORS[index % CHART_COLORS.length]}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      ))}
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {data.series.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resumen por Cancha</CardTitle>
                <CardDescription>
                  Total de reservas en el período
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.series.map((serie, index) => {
                    const total = serie.data.reduce((sum, val) => sum + val, 0);
                    const promedio = Math.round(total / serie.data.length);
                    const maxReservas = Math.max(...serie.data);

                    return (
                      <div
                        key={serie.cancha.id}
                        className="flex items-center gap-4 p-4 border rounded-lg"
                      >
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor:
                              CHART_COLORS[index % CHART_COLORS.length],
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-semibold">{serie.cancha.nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            {serie.cancha.deporte}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{total}</p>
                          <p className="text-sm text-muted-foreground">
                            reservas totales
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-medium">{promedio}</p>
                          <p className="text-sm text-muted-foreground">
                            promedio/mes
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-medium">{maxReservas}</p>
                          <p className="text-sm text-muted-foreground">
                            pico máximo
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
