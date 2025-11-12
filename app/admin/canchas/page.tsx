"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { authenticatedFetch } from "@/lib/auth";
import { API_URL } from "@/lib/config";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Skeleton } from "@/components/ui/skeleton";

export interface Cancha {
  id: number;
  club_id: number;
  nombre: string;
  deporte: string;
  superficie: number;
  techado: boolean;
  iluminacion: boolean;
  precio_hora: number;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export default function CanchasPage() {
  const { user, loading: authLoading } = useAuth();
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCanchas() {
      if (!user?.club_id) return;

      try {
        setLoading(true);
        const response = await authenticatedFetch(
          `${API_URL}/canchas/club/${user.club_id}`
        );

        if (!response.ok) {
          throw new Error("Error al cargar las canchas");
        }

        const data = await response.json();
        setCanchas(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && user) {
      fetchCanchas();
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

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Canchas</h1>
        <p className="text-muted-foreground">Gestiona las canchas de tu club</p>
      </div>
      <DataTable columns={columns} data={canchas} />
    </div>
  );
}
