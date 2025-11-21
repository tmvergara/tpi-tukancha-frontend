"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EquipoPosicion {
  id: number;
  nombre: string;
  Puntos: number;
  PJ: number; // Partidos Jugados
  PG: number; // Partidos Ganados
  PE: number; // Partidos Empatados
  PP: number; // Partidos Perdidos
  GF: number; // Goles a Favor
  GC: number; // Goles en Contra
}

interface TablaPosicionesProps {
  equipos: EquipoPosicion[];
}

export function TablaPosiciones({ equipos }: TablaPosicionesProps) {
  // Ordenar equipos por puntos (descendente)
  const equiposOrdenados = [...equipos].sort((a, b) => {
    if (b.Puntos !== a.Puntos) return b.Puntos - a.Puntos;
    // Si tienen los mismos puntos, ordenar por diferencia de goles
    const difA = (a.GF || 0) - (a.GC || 0);
    const difB = (b.GF || 0) - (b.GC || 0);
    return difB - difA;
  });

  const getPosicionIcon = (index: number) => {
    if (index === 0) {
      return <Trophy className="h-4 w-4 text-yellow-500" />;
    }
    return null;
  };

  const getPosicionBadge = (posicion: number) => {
    if (posicion === 1) {
      return (
        <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800">
          1°
        </Badge>
      );
    }
    if (posicion <= 3) {
      return (
        <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
          {posicion}°
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-muted-foreground">
        {posicion}°
      </Badge>
    );
  };

  if (equipos.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No hay equipos registrados
          </h3>
          <p className="text-muted-foreground text-center">
            Agrega equipos al torneo para ver la tabla de posiciones
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Tabla de Posiciones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">Pos</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead className="text-center">PJ</TableHead>
                <TableHead className="text-center">G</TableHead>
                <TableHead className="text-center">E</TableHead>
                <TableHead className="text-center">P</TableHead>
                <TableHead className="text-center">GF</TableHead>
                <TableHead className="text-center">GC</TableHead>
                <TableHead className="text-center">DG</TableHead>
                <TableHead className="text-center font-bold">Pts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equiposOrdenados.map((equipo, index) => (
                <TableRow key={equipo.id}>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {getPosicionIcon(index)}
                      {getPosicionBadge(index + 1)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span>{equipo.nombre}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{equipo.PJ}</TableCell>
                  <TableCell className="text-center text-green-600 dark:text-green-400">
                    {equipo.PG}
                  </TableCell>
                  <TableCell className="text-center text-yellow-600 dark:text-yellow-400">
                    {equipo.PE}
                  </TableCell>
                  <TableCell className="text-center text-red-600 dark:text-red-400">
                    {equipo.PP}
                  </TableCell>
                  <TableCell className="text-center">{equipo.GF}</TableCell>
                  <TableCell className="text-center">{equipo.GC}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {equipo.GF - equipo.GC > 0 && (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      )}
                      {equipo.GF - equipo.GC < 0 && (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      {equipo.GF - equipo.GC === 0 && (
                        <Minus className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span
                        className={
                          equipo.GF - equipo.GC > 0
                            ? "text-green-600 dark:text-green-400"
                            : equipo.GF - equipo.GC < 0
                            ? "text-red-600 dark:text-red-400"
                            : ""
                        }
                      >
                        {equipo.GF - equipo.GC}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {equipo.Puntos}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="font-semibold">PJ:</span> Partidos Jugados
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold">G:</span> Ganados
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold">E:</span> Empatados
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold">P:</span> Perdidos
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold">GF:</span> Goles a Favor
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold">GC:</span> Goles en Contra
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold">DG:</span> Diferencia de Goles
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold">Pts:</span> Puntos
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
