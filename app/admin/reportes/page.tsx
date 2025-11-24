"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  IconChartBar,
  IconUsers,
  IconBallFootball,
  IconTrendingUp,
  IconCalendar,
} from "@tabler/icons-react";
import Link from "next/link";

const reportes = [
  {
    title: "Reservas por Cliente",
    description: "Visualiza el historial de reservas agrupadas por cliente",
    icon: IconUsers,
    href: "/admin/reportes/reservas-por-cliente",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Reservas por Cancha",
    description: "Analiza las reservas y los ingresos de cada cancha",
    icon: IconBallFootball,
    href: "/admin/reportes/reservas-por-cancha",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Canchas Más Utilizadas",
    description: "Ranking de las canchas con mayor número de reservas",
    icon: IconTrendingUp,
    href: "/admin/reportes/cancha-mas-utilizada",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    title: "Utilización de Canchas",
    description: "Evolución mensual de la utilización de las canchas",
    icon: IconCalendar,
    href: "/admin/reportes/utilizacion-de-canchas",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
];

export default function ReportesPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <IconChartBar className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Reportes y Estadísticas</h1>
          <p className="text-muted-foreground">
            Analiza el rendimiento de tu club deportivo
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {reportes.map((reporte) => {
          const Icon = reporte.icon;
          return (
            <Link key={reporte.href} href={reporte.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${reporte.bgColor}`}>
                      <Icon className={`h-6 w-6 ${reporte.color}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{reporte.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {reporte.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
