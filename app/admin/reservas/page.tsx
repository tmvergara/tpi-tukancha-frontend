"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { authenticatedFetch } from "@/lib/auth";
import { API_URL } from "@/lib/config";
import { DataTable } from "./data-table";
import { getColumns } from "./columns";
import { Skeleton } from "@/components/ui/skeleton";
import { UnauthorizedAlert } from "@/components/unauthorized-alert";

export interface Reserva {
  id: number;
  cancha: {
    id: number;
    club_id: number;
    nombre: string;
    deporte: string;
    techada: boolean;
    superficie: string;
    estado: string;
    created_at: string;
    updated_at: string;
  };
  cliente_nombre: string;
  cliente_telefono: string | null;
  cliente_email: string;
  estado: string;
  fuente: string;
  servicios: string | null;
  precio_total: number;
  created_at: string;
  updated_at: string;
}

export default function ReservasPage() {
  const { user, loading: authLoading } = useAuth();
  const { can } = usePermissions();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservas = async () => {
    if (!user?.club_id) return;

    try {
      setLoading(true);
      const response = await authenticatedFetch(
        `${API_URL}/reservas/club/${user.club_id}`
      );

      if (!response.ok) {
        throw new Error("Error al cargar las reservas");
      }

      const data = await response.json();
      setReservas(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchReservas();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
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

  // Verificar si tiene permiso para ver reservas
  if (!can("reservas:view")) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservas</h1>
          <p className="text-muted-foreground">
            Gestiona las reservas de tu club
          </p>
        </div>
        <UnauthorizedAlert permission="reservas:view" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservas</h1>
          <p className="text-muted-foreground">
            Gestiona las reservas de tu club
          </p>
        </div>
      </div>
      <DataTable columns={getColumns(fetchReservas)} data={reservas} />
    </div>
  );
}
