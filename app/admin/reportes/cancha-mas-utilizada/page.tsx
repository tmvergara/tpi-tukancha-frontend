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
import { Input } from "@/components/ui/input";
import {
  IconTrophy,
  IconBallFootball,
  IconCurrencyDollar,
  IconPercentage,
  IconCalendar,
} from "@tabler/icons-react";
import { API_URL } from "@/lib/config";
import { CanchaMasUtilizada } from "@/lib/types";
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
  Cell,
} from "recharts";
import { authenticatedFetch } from "@/lib/auth";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function CanchasMasUtilizadasPage() {
  const [data, setData] = useState<CanchaMasUtilizada[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState("10");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  useEffect(() => {
    fetchData();
  }, [limit, fechaInicio, fechaFin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (limit) params.append("limit", limit);
      if (fechaInicio) params.append("fecha_inicio", fechaInicio);
      if (fechaFin) params.append("fecha_fin", fechaFin);

      const url = `${API_URL}/reportes/canchas-mas-utilizadas${
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
    setLimit("10");
    setFechaInicio("");
    setFechaFin("");
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(parseFloat(amount));
  };

  const chartData = data.map((item) => ({
    cancha:
      item.cancha.nombre.length > 25
        ? item.cancha.nombre.substring(0, 25) + "..."
        : item.cancha.nombre,
    reservas: item.reservas_count,
    porcentaje: parseFloat(item.porcentaje_utilizacion.replace("%", "")),
  }));

  const chartConfig = {
    reservas: {
      label: "Reservas",
      color: "#FFD779",
    },
  };

  const getRankingBadge = (index: number) => {
    if (index === 0) return <Badge className="bg-yellow-500">🥇 1°</Badge>;
    if (index === 1) return <Badge className="bg-gray-400">🥈 2°</Badge>;
    if (index === 2) return <Badge className="bg-orange-600">🥉 3°</Badge>;
    return <Badge variant="outline">{index + 1}°</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Canchas Más Utilizadas</h1>
        <p className="text-muted-foreground">
          Ranking de las canchas con mayor número de reservas
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Límite de resultados</Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="10"
              />
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
              <CardTitle>Ranking de Utilización</CardTitle>
              <CardDescription>Cantidad de reservas por cancha</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      dataKey="cancha"
                      type="category"
                      width={150}
                      fontSize={12}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="reservas" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {data.map((item, index) => (
              <Card key={item.cancha.id} className="overflow-hidden">
                <div className="flex">
                  <div
                    className={`w-2 ${index < 3 ? "bg-primary" : "bg-muted"}`}
                  />
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getRankingBadge(index)}
                        <div>
                          <h3 className="text-xl font-bold flex items-center gap-2">
                            <IconBallFootball className="h-5 w-5" />
                            {item.cancha.nombre}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {item.cancha.deporte} •{" "}
                            {formatCurrency(item.cancha.precio_hora)}/hora
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-lg px-4 py-2">
                        <IconPercentage className="h-4 w-4 mr-1" />
                        {item.porcentaje_utilizacion}
                      </Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                          <IconCalendar className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Reservas
                          </p>
                          <p className="text-2xl font-bold">
                            {item.reservas_count}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                          <IconCurrencyDollar className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Ingresos
                          </p>
                          <p className="text-2xl font-bold">
                            {formatCurrency(item.total_ingresos)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                          <IconTrophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Utilización
                          </p>
                          <p className="text-2xl font-bold">
                            {item.porcentaje_utilizacion}
                          </p>
                        </div>
                      </div>
                    </div>

                    {index === 0 && (
                      <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                          🏆 Cancha más popular del período
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resumen General</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Total de Canchas
                    </p>
                    <p className="text-3xl font-bold">{data.length}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Total de Reservas
                    </p>
                    <p className="text-3xl font-bold">
                      {data.reduce((sum, item) => sum + item.reservas_count, 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Ingresos Totales
                    </p>
                    <p className="text-3xl font-bold">
                      {formatCurrency(
                        data
                          .reduce(
                            (sum, item) =>
                              sum + parseFloat(item.total_ingresos),
                            0
                          )
                          .toString()
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
