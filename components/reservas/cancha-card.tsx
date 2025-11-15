"use client";

import { Cancha } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CanchaCardProps {
  cancha: Cancha;
  onClick: () => void;
}

export function CanchaCard({ cancha, onClick }: CanchaCardProps) {
  return (
    <Card
      className="cursor-pointer hover:border-primary transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{cancha.nombre}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
              {cancha.deporte}
            </p>
            <div className="flex flex-wrap gap-2">
              {cancha.techado && <Badge variant="secondary">Techada</Badge>}
              {cancha.iluminacion && (
                <Badge variant="outline">Iluminación</Badge>
              )}
              <Badge variant="outline">{cancha.superficie}m²</Badge>
            </div>
          </div>
          <div className="text-right ml-4">
            <p className="text-2xl font-bold text-primary">
              $
              {cancha.precio.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">por hora</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
