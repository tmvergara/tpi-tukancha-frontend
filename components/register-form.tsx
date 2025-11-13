"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";

type Horario = {
  dia: string;
  abre: string;
  cierra: string;
  activo: boolean;
};

const DIAS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

// Esquema de validación con Zod
const horarioSchema = z
  .object({
    dia: z.string(),
    abre: z.string(),
    cierra: z.string(),
    activo: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.activo) {
        const [hh1 = "0", mm1 = "0"] = data.abre.split(":");
        const [hh2 = "0", mm2 = "0"] = data.cierra.split(":");
        const abreSeconds =
          (parseInt(hh1, 10) || 0) * 3600 + (parseInt(mm1, 10) || 0) * 60;
        const cierraSeconds =
          (parseInt(hh2, 10) || 0) * 3600 + (parseInt(mm2, 10) || 0) * 60;
        return abreSeconds < cierraSeconds;
      }
      return true;
    },
    {
      message: "La hora de apertura debe ser anterior a la de cierre",
      path: ["abre"],
    }
  );

const registerSchema = z
  .object({
    // Paso 0: Datos básicos del club
    nombre: z.string().min(1, "El nombre del club es obligatorio"),
    cuit: z.string().min(1, "El CUIT es obligatorio"),
    telefono: z.string().min(1, "El teléfono es obligatorio"),
    email: z.string().email("Ingrese un correo electrónico válido"),

    // Paso 1: Dirección
    calle: z.string().min(1, "La calle es obligatoria"),
    numero: z.string().min(1, "El número es obligatorio"),
    piso: z.string().optional(),
    depto: z.string().optional(),
    ciudad: z.string().min(1, "La ciudad es obligatoria"),
    provincia: z.string().min(1, "La provincia es obligatoria"),
    pais: z.string().min(1, "El país es obligatorio"),
    cp: z.string().min(1, "El código postal es obligatorio"),

    // Paso 2: Horarios
    horarios: z.array(horarioSchema).refine(
      (horarios) => {
        return horarios.some((h) => h.activo);
      },
      {
        message: "Debe marcar al menos un día como activo",
      }
    ),

    // Paso 3: Contraseña
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [step, setStep] = useState(0);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [registeredData, setRegisteredData] = useState<{
    clubName: string;
    email: string;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit: handleFormSubmit,
    control,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombre: "",
      cuit: "",
      telefono: "",
      email: "",
      calle: "",
      numero: "",
      piso: "",
      depto: "",
      ciudad: "",
      provincia: "",
      pais: "",
      cp: "",
      horarios: DIAS.map((d) => ({
        dia: d,
        abre: "09:00",
        cierra: "18:00",
        activo: false,
      })),
      password: "",
      confirmPassword: "",
    },
  });

  const horarios = watch("horarios");

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const handleNext = async () => {
    let fieldsToValidate: (keyof RegisterFormData)[] = [];

    if (step === 0) {
      fieldsToValidate = ["nombre", "cuit", "telefono", "email"];
    } else if (step === 1) {
      fieldsToValidate = [
        "calle",
        "numero",
        "piso",
        "depto",
        "ciudad",
        "provincia",
        "pais",
        "cp",
      ];
    } else if (step === 2) {
      fieldsToValidate = ["horarios"];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      next();
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    const API_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

    try {
      // Consolidar todos los datos en un único payload
      const payload = {
        nombre: data.nombre,
        cuit: data.cuit,
        telefono: data.telefono,
        direccion: {
          calle: data.calle,
          numero: data.numero,
          ...(data.piso && { piso: data.piso }),
          ...(data.depto && { depto: data.depto }),
          ciudad: data.ciudad,
          provincia: data.provincia,
          pais: data.pais,
          cp: data.cp,
        },
        horarios: data.horarios
          .filter((h) => h.activo)
          .map((h) => ({
            dia: h.dia,
            // Asegurar formato HH:MM (sin segundos)
            abre: h.abre.substring(0, 5),
            cierra: h.cierra.substring(0, 5),
          })),
        usuario: {
          nombre: "admin",
          email: data.email,
          password: data.password,
          rol: "admin",
        },
      };

      const response = await fetch(`${API_URL}/clubes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || "Error al registrar el club");
      }

      // Registro exitoso - mostrar dialog de confirmación
      setRegisteredData({
        clubName: data.nombre,
        email: data.email,
      });
      setShowSuccessDialog(true);
    } catch (err) {
      console.error("Error en el proceso de registro:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Error de red al intentar registrar. Por favor, intente nuevamente."
      );
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Registro de Club</CardTitle>
          <CardDescription>
            Completa los datos del club en los pasos. Paso {step + 1} de 4.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit(onSubmit)}>
            <FieldGroup>
              {step === 0 && (
                // Datos básicos
                <>
                  <Field>
                    <FieldLabel htmlFor="nombre">
                      Nombre del club <span className="text-red-600">*</span>
                    </FieldLabel>
                    <Input
                      id="nombre"
                      placeholder="Ej: Club Deportivo San Martín"
                      {...register("nombre")}
                    />
                    {errors.nombre && (
                      <FieldDescription className="text-red-600">
                        {errors.nombre.message}
                      </FieldDescription>
                    )}
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="cuit">
                        CUIT <span className="text-red-600">*</span>
                      </FieldLabel>
                      <Input
                        id="cuit"
                        placeholder="20-12345678-9"
                        {...register("cuit")}
                      />
                      {errors.cuit && (
                        <FieldDescription className="text-red-600">
                          {errors.cuit.message}
                        </FieldDescription>
                      )}
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="telefono">
                        Teléfono <span className="text-red-600">*</span>
                      </FieldLabel>
                      <Input
                        id="telefono"
                        placeholder="+54 9 11 1234-5678"
                        {...register("telefono")}
                      />
                      {errors.telefono && (
                        <FieldDescription className="text-red-600">
                          {errors.telefono.message}
                        </FieldDescription>
                      )}
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="email">
                      Correo electrónico <span className="text-red-600">*</span>
                    </FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@miclub.com"
                      {...register("email")}
                    />
                    {errors.email && (
                      <FieldDescription className="text-red-600">
                        {errors.email.message}
                      </FieldDescription>
                    )}
                  </Field>
                </>
              )}

              {step === 1 && (
                // Dirección
                <>
                  <Field>
                    <FieldLabel htmlFor="calle">
                      Calle <span className="text-red-600">*</span>
                    </FieldLabel>
                    <Input
                      id="calle"
                      placeholder="Av. Corrientes"
                      {...register("calle")}
                    />
                    {errors.calle && (
                      <FieldDescription className="text-red-600">
                        {errors.calle.message}
                      </FieldDescription>
                    )}
                  </Field>
                  <div className="grid grid-cols-3 gap-4">
                    <Field>
                      <FieldLabel htmlFor="numero">
                        Número <span className="text-red-600">*</span>
                      </FieldLabel>
                      <Input
                        id="numero"
                        placeholder="1234"
                        {...register("numero")}
                      />
                      {errors.numero && (
                        <FieldDescription className="text-red-600">
                          {errors.numero.message}
                        </FieldDescription>
                      )}
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="piso">Piso</FieldLabel>
                      <Input id="piso" placeholder="5" {...register("piso")} />
                      {errors.piso && (
                        <FieldDescription className="text-red-600">
                          {errors.piso.message}
                        </FieldDescription>
                      )}
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="depto">Depto</FieldLabel>
                      <Input
                        id="depto"
                        placeholder="B"
                        {...register("depto")}
                      />
                      {errors.depto && (
                        <FieldDescription className="text-red-600">
                          {errors.depto.message}
                        </FieldDescription>
                      )}
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="ciudad">
                        Ciudad <span className="text-red-600">*</span>
                      </FieldLabel>
                      <Input
                        id="ciudad"
                        placeholder="Buenos Aires"
                        {...register("ciudad")}
                      />
                      {errors.ciudad && (
                        <FieldDescription className="text-red-600">
                          {errors.ciudad.message}
                        </FieldDescription>
                      )}
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="provincia">
                        Provincia <span className="text-red-600">*</span>
                      </FieldLabel>
                      <Input
                        id="provincia"
                        placeholder="Buenos Aires"
                        {...register("provincia")}
                      />
                      {errors.provincia && (
                        <FieldDescription className="text-red-600">
                          {errors.provincia.message}
                        </FieldDescription>
                      )}
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="pais">
                        País <span className="text-red-600">*</span>
                      </FieldLabel>
                      <Input
                        id="pais"
                        placeholder="Argentina"
                        {...register("pais")}
                      />
                      {errors.pais && (
                        <FieldDescription className="text-red-600">
                          {errors.pais.message}
                        </FieldDescription>
                      )}
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="cp">
                        Código Postal <span className="text-red-600">*</span>
                      </FieldLabel>
                      <Input id="cp" placeholder="C1043" {...register("cp")} />
                      {errors.cp && (
                        <FieldDescription className="text-red-600">
                          {errors.cp.message}
                        </FieldDescription>
                      )}
                    </Field>
                  </div>
                </>
              )}

              {step === 2 && (
                // Horarios: mostrar 7 dias
                <>
                  <FieldDescription>
                    Marca los días activos y ajusta horarios.
                  </FieldDescription>
                  {errors.horarios && (
                    <FieldDescription className="text-red-600">
                      {errors.horarios.message}
                    </FieldDescription>
                  )}
                  <div className="grid gap-4">
                    {horarios.map((h, idx) => (
                      <div
                        key={h.dia}
                        className="grid grid-cols-3 items-center gap-2"
                      >
                        <div className="col-span-1">
                          <FieldLabel>{h.dia}</FieldLabel>
                        </div>
                        <div className="col-span-1 flex gap-2 items-center">
                          <Controller
                            name={`horarios.${idx}.abre`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="time"
                                {...field}
                                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none h-12"
                              />
                            )}
                          />
                          <span className="mx-1">–</span>
                          <Controller
                            name={`horarios.${idx}.cierra`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="time"
                                {...field}
                                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none h-12"
                              />
                            )}
                          />
                        </div>
                        <div className="col-span-1 flex items-center justify-end">
                          <div className="flex items-center gap-2">
                            <Controller
                              name={`horarios.${idx}.activo`}
                              control={control}
                              render={({ field }) => (
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              )}
                            />
                            <span className="text-sm">Activo</span>
                          </div>
                        </div>
                        {errors.horarios?.[idx]?.abre && (
                          <div className="col-span-3">
                            <FieldDescription className="text-red-600">
                              {errors.horarios[idx]?.abre?.message}
                            </FieldDescription>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {step === 3 && (
                // Password
                <>
                  <Field>
                    <FieldLabel htmlFor="password">
                      Contraseña <span className="text-red-600">*</span>
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 8 caracteres"
                        {...register("password")}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <FieldDescription className="text-red-600">
                        {errors.password.message}
                      </FieldDescription>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirmar contraseña{" "}
                      <span className="text-red-600">*</span>
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Repite tu contraseña"
                        {...register("confirmPassword")}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <FieldDescription className="text-red-600">
                        {errors.confirmPassword.message}
                      </FieldDescription>
                    )}
                  </Field>
                  <FieldDescription>
                    La contraseña debe tener al menos 8 caracteres.
                  </FieldDescription>
                </>
              )}

              <div className="flex items-center justify-between mt-4">
                <div>
                  {step > 0 && (
                    <Button variant="ghost" onClick={back} type="button">
                      Volver
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {step < 3 ? (
                    <Button onClick={handleNext} type="button">
                      Siguiente
                    </Button>
                  ) : (
                    <Button type="submit">Registrar</Button>
                  )}
                </div>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Al hacer clic en registrar aceptas nuestros <a href="#">Términos</a> y
        la <a href="#">Política de privacidad</a>.
      </FieldDescription>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¡Registro exitoso! 🎉</DialogTitle>
            <DialogDescription>
              Tu club ha sido registrado correctamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Club registrado:
              </p>
              <p className="text-base font-semibold">
                {registeredData?.clubName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Usuario administrador:
              </p>
              <p className="text-base font-semibold">{registeredData?.email}</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowSuccessDialog(false);
                window.location.href = "/login";
              }}
              className="w-full sm:w-auto"
            >
              Iniciar sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
