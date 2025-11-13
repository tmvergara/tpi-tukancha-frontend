"use client";

import { useState, useEffect } from "react";
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
import { UserDetailed } from "@/lib/types";

type UserFormData = {
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
  rol_id: number;
  telefono?: string;
};

interface UserEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDetailed | null;
  onSuccess: () => void;
}

export function UserEditDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: UserEditDialogProps) {
  const [formData, setFormData] = useState<UserFormData>({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    rol_id: 2,
    telefono: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre,
        email: user.email,
        password: "",
        confirmPassword: "",
        rol_id: user.rol.id,
        telefono: user.telefono || "",
      });
      setShowEditPassword(false);
    }
  }, [user]);

  const resetForm = () => {
    setFormData({
      nombre: "",
      email: "",
      password: "",
      confirmPassword: "",
      rol_id: 2,
      telefono: "",
    });
    setShowEditPassword(false);
  };

  const handleSubmit = async () => {
    if (!user || !formData.nombre || !formData.email) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    // Si se proporcionó una nueva contraseña, validar
    if (formData.password) {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Las contraseñas no coinciden");
        return;
      }
      if (formData.password.length < 6) {
        toast.error("La contraseña debe tener al menos 6 caracteres");
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const requestBody: any = {
        nombre: formData.nombre,
        email: formData.email,
        rol_id: formData.rol_id,
        ...(formData.telefono && { telefono: formData.telefono }),
      };

      // Solo incluir password si se proporcionó uno nuevo
      if (formData.password) {
        requestBody.password = formData.password;
      }

      const response = await authenticatedFetch(`${API_URL}/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorMessage = "Error al actualizar usuario";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      toast.success("Usuario actualizado exitosamente");
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error updating user:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error al actualizar usuario";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Modifica los datos del usuario. Deja la contraseña vacía si no
            deseas cambiarla.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-nombre">Nombre *</Label>
            <Input
              id="edit-nombre"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email *</Label>
            <Input
              id="edit-email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-password">Nueva Contraseña</Label>
            <div className="relative">
              <Input
                id="edit-password"
                type={showEditPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Dejar vacío para no cambiar"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowEditPassword(!showEditPassword)}
              >
                {showEditPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-confirm-password">
              Repetir Nueva Contraseña
            </Label>
            <div className="relative">
              <Input
                id="edit-confirm-password"
                type={showEditPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="Dejar vacío para no cambiar"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowEditPassword(!showEditPassword)}
              >
                {showEditPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-telefono">Teléfono</Label>
            <Input
              id="edit-telefono"
              value={formData.telefono}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-rol">Rol *</Label>
            <Select
              value={formData.rol_id.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, rol_id: parseInt(value) })
              }
            >
              <SelectTrigger id="edit-rol">
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
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
