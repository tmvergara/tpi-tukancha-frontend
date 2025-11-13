"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { authenticatedFetch } from "@/lib/auth";
import { API_URL } from "@/lib/config";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { UnauthorizedAlert } from "@/components/unauthorized-alert";

const createCanchaSchema = z.object({
  nombre: z.string().min(1, "El nombre de la cancha es obligatorio"),
  deporte: z.string().min(1, "El deporte es obligatorio"),
  superficie: z.number().positive("La superficie debe ser un número positivo"),
  techado: z.boolean(),
  iluminacion: z.boolean(),
  precio_hora: z.number().positive("El precio debe ser un número positivo"),
});

type CreateCanchaFormData = z.infer<typeof createCanchaSchema>;

export default function CrearCanchaPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { can } = usePermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateCanchaFormData>({
    resolver: zodResolver(createCanchaSchema),
    defaultValues: {
      nombre: "",
      deporte: "",
      superficie: undefined,
      techado: false,
      iluminacion: false,
      precio_hora: undefined,
    },
  });

  const onSubmit = async (data: CreateCanchaFormData) => {
    if (!user?.club_id) {
      setError("No se pudo obtener el ID del club");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...data,
        club_id: user.club_id,
      };

      const response = await authenticatedFetch(`${API_URL}/canchas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear la cancha");
      }

      // Redirigir a la lista de canchas
      router.push("/admin/canchas");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Verificar permisos
  if (!can("canchas:create")) {
    return (
      <div>
        <div className="flex items-center gap-4">
          <Link href="/admin/canchas">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Crear Cancha</h1>
            <p className="text-muted-foreground">
              Agrega una nueva cancha a tu club
            </p>
          </div>
        </div>
        <div className="max-w-2xl mx-auto mt-10">
          <UnauthorizedAlert permission="canchas:create" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <Link href="/admin/canchas">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crear Cancha</h1>
          <p className="text-muted-foreground">
            Agrega una nueva cancha a tu club
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6 mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Datos de la Cancha</CardTitle>
            <CardDescription>
              Completa la información de la nueva cancha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                {error && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 mb-4">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Field>
                  <FieldLabel htmlFor="nombre">
                    Nombre de la cancha <span className="text-red-600">*</span>
                  </FieldLabel>
                  <Input
                    id="nombre"
                    placeholder="Ej: Cancha Principal"
                    {...register("nombre")}
                  />
                  {errors.nombre && (
                    <FieldDescription className="text-red-600">
                      {errors.nombre.message}
                    </FieldDescription>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="deporte">
                    Deporte <span className="text-red-600">*</span>
                  </FieldLabel>
                  <Input
                    id="deporte"
                    placeholder="Ej: Fútbol 5, Paddle, Tenis"
                    {...register("deporte")}
                  />
                  {errors.deporte && (
                    <FieldDescription className="text-red-600">
                      {errors.deporte.message}
                    </FieldDescription>
                  )}
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="superficie">
                      Superficie (m²) <span className="text-red-600">*</span>
                    </FieldLabel>
                    <Input
                      id="superficie"
                      type="number"
                      step="0.01"
                      placeholder="Ej: 500.5"
                      {...register("superficie", { valueAsNumber: true })}
                    />
                    {errors.superficie && (
                      <FieldDescription className="text-red-600">
                        {errors.superficie.message}
                      </FieldDescription>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="precio_hora">
                      Precio por hora ($){" "}
                      <span className="text-red-600">*</span>
                    </FieldLabel>
                    <Input
                      id="precio_hora"
                      type="number"
                      step="0.01"
                      placeholder="Ej: 5000"
                      {...register("precio_hora", { valueAsNumber: true })}
                    />
                    {errors.precio_hora && (
                      <FieldDescription className="text-red-600">
                        {errors.precio_hora.message}
                      </FieldDescription>
                    )}
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4">
                  <Field>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FieldLabel htmlFor="techado">Techado</FieldLabel>
                        <FieldDescription>
                          ¿La cancha está techada?
                        </FieldDescription>
                      </div>
                      <Controller
                        name="techado"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            id="techado"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                  </Field>

                  <Field>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FieldLabel htmlFor="iluminacion">
                          Iluminación
                        </FieldLabel>
                        <FieldDescription>
                          ¿Tiene iluminación artificial?
                        </FieldDescription>
                      </div>
                      <Controller
                        name="iluminacion"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            id="iluminacion"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                  </Field>
                </div>

                <div className="flex items-center justify-end gap-4 pt-6">
                  <Link href="/admin/canchas">
                    <Button
                      variant="outline"
                      type="button"
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creando..." : "Crear Cancha"}
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
