"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { authenticatedFetch } from "@/lib/auth";
import { API_URL } from "@/lib/config";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, Trophy, Calendar, Users } from "lucide-react";
import Link from "next/link";
import { UnauthorizedAlert } from "@/components/unauthorized-alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CreateTorneoDialog } from "./components/create-torneo-dialog";

export interface Torneo {
  id: number;
  nombre: string;
  reglamento: string | null;
  categoria: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  created_at: string;
  updated_at: string;
  equipos?: any[];
  partidos?: any[];
}

export default function TorneosPage() {
  const { user, loading: authLoading } = useAuth();
  const { can } = usePermissions();
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const fetchTorneos = async () => {
    if (!user?.club_id) return;

    try {
      setLoading(true);
      const response = await authenticatedFetch(
        `${API_URL}/torneos/club/${user.club_id}`
      );

      if (!response.ok) {
        throw new Error("Error al cargar los torneos");
      }

      const result = await response.json();

      // La respuesta viene con formato: { status: "success", data: [...] }
      if (result.status === "success" && Array.isArray(result.data)) {
        setTorneos(result.data);
      } else {
        setTorneos([]);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setTorneos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchTorneos();
    }
  }, [user, authLoading]);

  const getEstadoBadge = (estado: string) => {
    const estadoLower = estado.toLowerCase();

    let className = "";
    let label = "";

    switch (estadoLower) {
      case "activo":
        className =
          "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800";
        label = "Activo";
        break;
      case "pendiente":
        className =
          "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800";
        label = "Pendiente";
        break;
      case "finalizado":
        className =
          "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800";
        label = "Finalizado";
        break;
      default:
        className =
          "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800";
        label = estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
    }

    return (
      <Badge variant="outline" className={className}>
        {label}
      </Badge>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  // Verificar permisos (puedes ajustar según tus necesidades)
  if (!can("canchas:view")) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Torneos</h1>
          <p className="text-muted-foreground">
            Gestiona los torneos de tu club
          </p>
        </div>
        <UnauthorizedAlert permission="canchas:view" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Torneos
          </h1>
          <p className="text-muted-foreground">
            Gestiona los torneos de tu club
          </p>
        </div>
        {can("canchas:create") && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Torneo
          </Button>
        )}
      </div>

      {torneos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay torneos</h3>
            <p className="text-muted-foreground text-center mb-4">
              Crea tu primer torneo para comenzar a gestionar competencias
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {torneos.map((torneo) => (
            <Card key={torneo.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">
                      {torneo.nombre}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {torneo.reglamento || "Sin reglamento especificado"}
                    </CardDescription>
                  </div>
                  {getEstadoBadge(torneo.estado)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>
                    {format(new Date(torneo.fecha_inicio), "d 'de' MMMM", {
                      locale: es,
                    })}
                    {" - "}
                    {format(new Date(torneo.fecha_fin), "d 'de' MMMM, yyyy", {
                      locale: es,
                    })}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Link href={`/admin/torneos/${torneo.id}`} className="flex-1">
                  <Button variant="secondary" className="w-full">
                    Ver Detalles
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <CreateTorneoDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchTorneos}
      />
    </div>
  );
}
