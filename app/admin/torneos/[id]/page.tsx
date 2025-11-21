"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { authenticatedFetch } from "@/lib/auth";
import { API_URL } from "@/lib/config";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Plus,
  Calendar,
  Users,
  Trophy,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

// Importar componentes de diálogo
import { CreateEquipoDialog } from "../components/create-equipo-dialog";
import { EditEquipoDialog } from "../components/edit-equipo-dialog";
import { DeleteEquipoDialog } from "../components/delete-equipo-dialog";
import { CreatePartidoDialog } from "../components/create-partido-dialog";
import { EditResultadoDialog } from "../components/edit-resultado-dialog";
import { DeletePartidoDialog } from "../components/delete-partido-dialog";
import { TablaPosiciones } from "../components/tabla-posiciones";

interface Torneo {
  id: number;
  nombre: string;
  reglamento: string | null;
  categoria: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
}

interface Equipo {
  id: number;
  nombre: string;
  representante?: string | null;
  telefono?: string | null;
  email?: string | null;
  torneo_id: number;
  puntos?: number;
  partidos_jugados?: number;
}

interface Partido {
  id: number;
  torneo_id: number;
  equipo1_id: number;
  equipo2_id: number;
  goles_equipo1: number;
  goles_equipo2: number;
  ganador: number | null;
  equipo1?: { nombre: string };
  equipo2?: { nombre: string };
}

export default function TorneoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { can } = usePermissions();

  const torneoId = parseInt(params.id as string);

  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [posiciones, setPosiciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de diálogos
  const [createEquipoOpen, setCreateEquipoOpen] = useState(false);
  const [editEquipoOpen, setEditEquipoOpen] = useState(false);
  const [deleteEquipoOpen, setDeleteEquipoOpen] = useState(false);
  const [selectedEquipo, setSelectedEquipo] = useState<Equipo | null>(null);

  const [createPartidoOpen, setCreatePartidoOpen] = useState(false);
  const [editResultadoOpen, setEditResultadoOpen] = useState(false);
  const [deletePartidoOpen, setDeletePartidoOpen] = useState(false);
  const [selectedPartido, setSelectedPartido] = useState<Partido | null>(null);

  const fetchTorneo = async () => {
    try {
      const response = await authenticatedFetch(
        `${API_URL}/torneos/${torneoId}`
      );
      if (!response.ok) throw new Error("Error al cargar el torneo");
      const result = await response.json();
      // Manejar formato de respuesta { status: "success", data: {...} }
      const data = result.status === "success" ? result.data : result;
      setTorneo(data);
    } catch (err) {
      toast.error("Error al cargar el torneo");
      throw err;
    }
  };

  const fetchEquipos = async () => {
    try {
      const response = await authenticatedFetch(
        `${API_URL}/torneos/${torneoId}/equipos`
      );
      if (!response.ok) throw new Error("Error al cargar equipos");
      const result = await response.json();
      // Manejar formato de respuesta { status: "success", data: [...] }
      const data =
        result.status === "success" && Array.isArray(result.data)
          ? result.data
          : Array.isArray(result)
          ? result
          : [];
      setEquipos(data);
    } catch (err) {
      console.error(err);
      setEquipos([]);
    }
  };

  const fetchPartidos = async () => {
    try {
      const response = await authenticatedFetch(
        `${API_URL}/partidos/torneo/${torneoId}`
      );
      if (!response.ok) throw new Error("Error al cargar partidos");
      const result = await response.json();
      // Manejar formato de respuesta { status: "success", data: [...] }
      const data =
        result.status === "success" && Array.isArray(result.data)
          ? result.data
          : Array.isArray(result)
          ? result
          : [];
      setPartidos(data);
    } catch (err) {
      console.error(err);
      setPartidos([]);
    }
  };

  const fetchPosiciones = async () => {
    try {
      const response = await authenticatedFetch(
        `${API_URL}/torneos/${torneoId}/posiciones`
      );
      if (!response.ok)
        throw new Error("Error al cargar la tabla de posiciones");
      const result = await response.json();
      // Manejar formato de respuesta { status: "success", data: [...] }
      const data =
        result.status === "success" && Array.isArray(result.data)
          ? result.data
          : Array.isArray(result)
          ? result
          : [];
      setPosiciones(data);
    } catch (err) {
      console.error(err);
      setPosiciones([]);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchTorneo(),
        fetchEquipos(),
        fetchPartidos(),
        fetchPosiciones(),
      ]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchData();
    }
  }, [torneoId, user, authLoading]);

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
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !torneo) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            {error || "Torneo no encontrado"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Torneos
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {torneo.nombre}
              </h1>
              {getEstadoBadge(torneo.estado)}
            </div>
            {torneo.categoria && (
              <p className="text-muted-foreground">
                Categoría: {torneo.categoria}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(torneo.fecha_inicio), "d 'de' MMMM", {
                    locale: es,
                  })}{" "}
                  -{" "}
                  {format(new Date(torneo.fecha_fin), "d 'de' MMMM, yyyy", {
                    locale: es,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{equipos.length} equipos</span>
              </div>
            </div>
          </div>
        </div>

        {torneo.reglamento && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Reglamento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {torneo.reglamento}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tabla" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tabla">
            <Trophy className="mr-2 h-4 w-4" />
            Tabla de Posiciones
          </TabsTrigger>
          <TabsTrigger value="equipos">
            <Users className="mr-2 h-4 w-4" />
            Equipos ({equipos.length})
          </TabsTrigger>
          <TabsTrigger value="partidos">
            <Calendar className="mr-2 h-4 w-4" />
            Partidos ({partidos.length})
          </TabsTrigger>
        </TabsList>

        {/* Tabla de Posiciones */}
        <TabsContent value="tabla" className="space-y-4">
          <TablaPosiciones
            equipos={posiciones.length > 0 ? posiciones : equipos}
          />
        </TabsContent>

        {/* Equipos */}
        <TabsContent value="equipos" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Equipos del Torneo</h2>
            {can("canchas:create") && (
              <Button onClick={() => setCreateEquipoOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Equipo
              </Button>
            )}
          </div>

          {equipos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Users className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay equipos</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Agrega equipos para comenzar el torneo
                </p>
                {can("canchas:create") && (
                  <Button onClick={() => setCreateEquipoOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Equipo
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {equipos.map((equipo) => (
                <Card key={equipo.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {equipo.nombre}
                        </CardTitle>
                        {equipo.representante && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Rep: {equipo.representante}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {equipo.puntos || 0} pts
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {equipo.telefono && (
                      <p className="text-xs text-muted-foreground">
                        📞 {equipo.telefono}
                      </p>
                    )}
                    {equipo.email && (
                      <p className="text-xs text-muted-foreground">
                        ✉️ {equipo.email}
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedEquipo(equipo);
                          setEditEquipoOpen(true);
                        }}
                      >
                        <Edit className="mr-2 h-3 w-3" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedEquipo(equipo);
                          setDeleteEquipoOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Partidos */}
        <TabsContent value="partidos" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Fixture del Torneo</h2>
            {can("canchas:create") && (
              <Button onClick={() => setCreatePartidoOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Programar Partido
              </Button>
            )}
          </div>

          {partidos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay partidos</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Programa partidos para comenzar el fixture
                </p>
                {can("canchas:create") && (
                  <Button onClick={() => setCreatePartidoOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Programar Partido
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Partido</TableHead>
                      <TableHead className="text-center">Resultado</TableHead>
                      <TableHead>Ganador</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partidos.map((partido) => (
                      <TableRow key={partido.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div>{partido.equipo1?.nombre || "Equipo 1"}</div>
                            <div className="text-xs text-muted-foreground">
                              vs
                            </div>
                            <div>{partido.equipo2?.nombre || "Equipo 2"}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-bold">
                            {partido.goles_equipo1} - {partido.goles_equipo2}
                          </div>
                        </TableCell>
                        <TableCell>
                          {partido.goles_equipo1 > partido.goles_equipo2 ? (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                            >
                              {partido.equipo1?.nombre || "Equipo 1"}
                            </Badge>
                          ) : partido.goles_equipo2 > partido.goles_equipo1 ? (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                            >
                              {partido.equipo2?.nombre || "Equipo 2"}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800"
                            >
                              Empate
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPartido(partido);
                                setEditResultadoOpen(true);
                              }}
                              title="Editar resultado"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPartido(partido);
                                setDeletePartidoOpen(true);
                              }}
                              title="Eliminar partido"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Diálogos de Equipos */}
      <CreateEquipoDialog
        open={createEquipoOpen}
        onOpenChange={setCreateEquipoOpen}
        onSuccess={() => {
          fetchEquipos();
          fetchPosiciones();
        }}
        torneoId={torneoId}
      />
      <EditEquipoDialog
        open={editEquipoOpen}
        onOpenChange={setEditEquipoOpen}
        onSuccess={() => {
          fetchEquipos();
          fetchPosiciones();
        }}
        equipo={selectedEquipo}
      />
      <DeleteEquipoDialog
        open={deleteEquipoOpen}
        onOpenChange={setDeleteEquipoOpen}
        onSuccess={() => {
          fetchEquipos();
          fetchPosiciones();
        }}
        equipoId={selectedEquipo?.id || 0}
        equipoNombre={selectedEquipo?.nombre || ""}
      />

      {/* Diálogos de Partidos */}
      <CreatePartidoDialog
        open={createPartidoOpen}
        onOpenChange={setCreatePartidoOpen}
        onSuccess={() => {
          fetchPartidos();
          fetchPosiciones();
        }}
        torneoId={torneoId}
        equipos={equipos}
      />
      <EditResultadoDialog
        open={editResultadoOpen}
        onOpenChange={setEditResultadoOpen}
        onSuccess={() => {
          fetchPartidos();
          fetchPosiciones();
        }}
        partido={selectedPartido}
      />
      <DeletePartidoDialog
        open={deletePartidoOpen}
        onOpenChange={setDeletePartidoOpen}
        onSuccess={() => {
          fetchPartidos();
          fetchPosiciones();
        }}
        partidoId={selectedPartido?.id || 0}
      />
    </div>
  );
}
