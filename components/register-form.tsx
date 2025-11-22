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
import { PhoneInput } from "@/components/ui/phone-input";
import { CuitInput } from "@/components/ui/cuit-input";
import { EmailInput } from "@/components/ui/email-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROVINCIAS_ARGENTINA, PAISES } from "@/lib/argentina-data";

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
    cuit: z
      .string()
      .min(1, "El CUIT es obligatorio")
      .refine(
        (val) => {
          const numericValue = val.replace(/\D/g, "");
          return numericValue.length === 11;
        },
        {
          message: "El CUIT debe tener exactamente 11 dígitos",
        }
      ),
    telefono: z
      .string()
      .min(1, "El teléfono es obligatorio")
      .refine(
        (val) => {
          const numericValue = val.replace(/\D/g, "");
          // Código de país (2-3 dígitos) + número (10 dígitos) = 12-13 dígitos total
          return numericValue.length >= 12 && numericValue.length <= 13;
        },
        {
          message: "El teléfono debe tener el formato completo",
        }
      ),
    email: z
      .string()
      .min(1, "El correo electrónico es obligatorio")
      .email("Ingrese un correo electrónico válido")
      .refine(
        async (email) => {
          // Validar disponibilidad del email
          try {
            const API_URL =
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
            const response = await fetch(
              `${API_URL}/users/check-email/${encodeURIComponent(email)}`
            );

            if (!response.ok) {
              return true; // Si hay error en la API, permitir continuar
            }

            const data = await response.json();
            return data.registrado === false; // true si está disponible
          } catch (error) {
            console.error("Error validando email:", error);
            return true; // Si hay error, permitir continuar
          }
        },
        {
          message: "Este correo electrónico ya está registrado",
        }
      ),

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
      pais: "Argentina", // Por defecto Argentina
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
  const selectedPais = watch("pais");
  const selectedProvincia = watch("provincia");
  const selectedCiudad = watch("ciudad");

  const isArgentina = selectedPais === "Argentina";
  const isOtroPais = selectedPais === "Otro";
  const isOtraCiudad = selectedCiudad === "Otra";

  // Obtener ciudades de la provincia seleccionada
  const ciudadesDisponibles = isArgentina
    ? PROVINCIAS_ARGENTINA.find((p) => p.nombre === selectedProvincia)
        ?.ciudades || []
    : [];

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
    <div className={cn("flex flex-col gap-4 sm:gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl">Registro de Club</CardTitle>
          <CardDescription className="text-sm">
            Completa los datos del club en los pasos. Paso {step + 1} de 4.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="cuit">
                        CUIT <span className="text-red-600">*</span>
                      </FieldLabel>
                      <Controller
                        name="cuit"
                        control={control}
                        render={({ field }) => (
                          <CuitInput
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            placeholder="XX-XXXXXXXX-X"
                          />
                        )}
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
                      <Controller
                        name="telefono"
                        control={control}
                        render={({ field }) => (
                          <PhoneInput
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            placeholder="(XXX) XXX-XXXX"
                          />
                        )}
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
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <EmailInput
                          id="email"
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          placeholder="admin@miclub.com"
                          validateAvailability={true}
                        />
                      )}
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
                    <FieldLabel htmlFor="pais">
                      País <span className="text-red-600">*</span>
                    </FieldLabel>
                    <Controller
                      name="pais"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Resetear provincia y ciudad cuando cambia el país
                            if (value !== "Argentina") {
                              register("provincia").onChange({
                                target: { value: "" },
                              });
                              register("ciudad").onChange({
                                target: { value: "" },
                              });
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un país" />
                          </SelectTrigger>
                          <SelectContent>
                            {PAISES.map((pais) => (
                              <SelectItem key={pais.nombre} value={pais.nombre}>
                                <span className="flex items-center gap-2">
                                  <span>{pais.flag}</span>
                                  <span>{pais.nombre}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.pais && (
                      <FieldDescription className="text-red-600">
                        {errors.pais.message}
                      </FieldDescription>
                    )}
                  </Field>

                  {isOtroPais && (
                    <Field>
                      <FieldLabel htmlFor="pais-custom">
                        Especificar país <span className="text-red-600">*</span>
                      </FieldLabel>
                      <Input
                        id="pais-custom"
                        placeholder="Ingresa el nombre del país"
                        {...register("pais")}
                      />
                    </Field>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="provincia">
                        Provincia{" "}
                        {isArgentina && <span className="text-red-600">*</span>}
                      </FieldLabel>
                      {isArgentina ? (
                        <Controller
                          name="provincia"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                // Resetear ciudad cuando cambia la provincia
                                register("ciudad").onChange({
                                  target: { value: "" },
                                });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona provincia" />
                              </SelectTrigger>
                              <SelectContent>
                                {PROVINCIAS_ARGENTINA.map((prov) => (
                                  <SelectItem
                                    key={prov.nombre}
                                    value={prov.nombre}
                                  >
                                    {prov.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      ) : (
                        <Input
                          id="provincia"
                          placeholder="Provincia/Estado"
                          {...register("provincia")}
                        />
                      )}
                      {errors.provincia && (
                        <FieldDescription className="text-red-600">
                          {errors.provincia.message}
                        </FieldDescription>
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="ciudad">
                        Ciudad{" "}
                        {(isArgentina || !isOtroPais) && (
                          <span className="text-red-600">*</span>
                        )}
                      </FieldLabel>
                      {isArgentina && ciudadesDisponibles.length > 0 ? (
                        <Controller
                          name="ciudad"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={!selectedProvincia}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona ciudad" />
                              </SelectTrigger>
                              <SelectContent>
                                {ciudadesDisponibles.map((ciudad) => (
                                  <SelectItem key={ciudad} value={ciudad}>
                                    {ciudad}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      ) : (
                        <Input
                          id="ciudad"
                          placeholder="Ciudad"
                          {...register("ciudad")}
                        />
                      )}
                      {errors.ciudad && (
                        <FieldDescription className="text-red-600">
                          {errors.ciudad.message}
                        </FieldDescription>
                      )}
                    </Field>
                  </div>

                  {isOtraCiudad && isArgentina && (
                    <Field>
                      <FieldLabel htmlFor="ciudad-custom">
                        Especificar ciudad{" "}
                        <span className="text-red-600">*</span>
                      </FieldLabel>
                      <Input
                        id="ciudad-custom"
                        placeholder="Ingresa el nombre de la ciudad"
                        {...register("ciudad")}
                      />
                    </Field>
                  )}

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

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
                  <div className="grid gap-3 sm:gap-4">
                    {horarios.map((h, idx) => (
                      <div
                        key={h.dia}
                        className="grid grid-cols-1 sm:grid-cols-[80px_1fr_auto] items-start sm:items-center gap-2 sm:gap-4 pb-3 sm:pb-0 border-b sm:border-b-0"
                      >
                        <div>
                          <FieldLabel className="text-sm sm:text-base">
                            {h.dia}
                          </FieldLabel>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                          <Controller
                            name={`horarios.${idx}.abre`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="time"
                                {...field}
                                step="3600"
                                className="bg-background text-sm sm:text-base font-medium w-full sm:max-w-[140px]"
                              />
                            )}
                          />
                          <span className="hidden sm:inline mx-1 text-muted-foreground">
                            –
                          </span>
                          <Controller
                            name={`horarios.${idx}.cierra`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="time"
                                {...field}
                                step="3600"
                                className="bg-background text-sm sm:text-base font-medium w-full sm:max-w-[140px]"
                              />
                            )}
                          />
                        </div>
                        <div className="flex items-center justify-start sm:justify-end">
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
                            <span className="text-xs sm:text-sm">Activo</span>
                          </div>
                        </div>
                        {errors.horarios?.[idx]?.abre && (
                          <div className="col-span-1 sm:col-span-3">
                            <FieldDescription className="text-red-600 text-xs sm:text-sm">
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

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 mt-4">
                <div className="order-2 sm:order-1">
                  {step > 0 && (
                    <Button
                      variant="ghost"
                      onClick={back}
                      type="button"
                      className="w-full sm:w-auto"
                    >
                      Volver
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  {step < 3 ? (
                    <Button
                      onClick={handleNext}
                      type="button"
                      className="w-full sm:w-auto"
                    >
                      Siguiente
                    </Button>
                  ) : (
                    <Button type="submit" className="w-full sm:w-auto">
                      Registrar
                    </Button>
                  )}
                </div>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      {step === 0 && (
        <div className="bg-linear-to-br from-primary/10 via-primary/5 to-background rounded-lg p-4 sm:p-6 border">
          <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">
            Que es TuKancha?
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
            La plataforma que revoluciona la gestión de clubes deportivos y
            simplifica las reservas de canchas.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="flex gap-3">
              <div className="shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xl">📅</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">Reservas</h3>
                <p className="text-xs text-muted-foreground">
                  Administra las reservas de tus canchas de forma simple y
                  eficiente
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xl">💳</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">Pagos Online</h3>
                <p className="text-xs text-muted-foreground">
                  Acepta pagos en línea y lleva el control de tus ingresos
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">Reportes</h3>
                <p className="text-xs text-muted-foreground">
                  Visualiza métricas y toma decisiones basadas en datos reales
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <FieldDescription className="px-2 sm:px-6 text-center text-xs sm:text-sm">
        Al hacer clic en registrar aceptas nuestros{" "}
        <a
          href="/terminos"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary"
        >
          Términos
        </a>{" "}
        y la{" "}
        <a
          href="/privacidad"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary"
        >
          Política de privacidad
        </a>
        .
      </FieldDescription>

      <Dialog
        open={showSuccessDialog}
        onOpenChange={(open) => {
          if (!open) {
            // Si se cierra el modal sin hacer clic en "Iniciar sesión", redirigir a home
            window.location.href = "/";
          }
          setShowSuccessDialog(open);
        }}
      >
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
