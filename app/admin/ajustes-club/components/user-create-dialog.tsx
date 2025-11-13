"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/lib/config";
import { authenticatedFetch } from "@/lib/auth";

type UserFormData = {
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
  rol_id: number;
  telefono?: string;
};

interface UserCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clubId?: number;
  onSuccess: () => void;
}

export function UserCreateDialog({
  open,
  onOpenChange,
  clubId,
  onSuccess,
}: UserCreateDialogProps) {
  const [formData, setFormData] = useState<UserFormData>({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    rol_id: 2,
    telefono: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetForm = () => {
    setFormData({
      nombre: "",
      email: "",
      password: "",
      confirmPassword: "",
      rol_id: 2,
      telefono: "",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.email || !formData.password) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      setIsSubmitting(true);

      const requestBody = {
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        rol_id: formData.rol_id,
        club_id: clubId,
        ...(formData.telefono && { telefono: formData.telefono }),
      };

      const response = await authenticatedFetch(`${API_URL}/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorMessage = "Error al crear usuario";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      toast.success("Usuario creado exitosamente");
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating user:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error al crear usuario";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          <DialogDescription>
            Completa los datos del nuevo usuario
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="create-nombre">Nombre *</Label>
            <Input
              id="create-nombre"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              placeholder="Juan Pérez"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-email">Email *</Label>
            <Input
              id="create-email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="juan@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-password">Contraseña *</Label>
            <div className="relative">
              <Input
                id="create-password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value,
                  })
                }
                placeholder="••••••••"
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-confirm-password">
              Repetir Contraseña *
            </Label>
            <div className="relative">
              <Input
                id="create-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="••••••••"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-telefono">Teléfono</Label>
            <Input
              id="create-telefono"
              value={formData.telefono}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  telefono: e.target.value,
                })
              }
              placeholder="123456789"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-rol">Rol *</Label>
            <Select
              value={formData.rol_id.toString()}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  rol_id: parseInt(value),
                })
              }
            >
              <SelectTrigger id="create-rol">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Administrador</SelectItem>
                <SelectItem value="2">Encargado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Crear Usuario
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
