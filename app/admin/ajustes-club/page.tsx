"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { UnauthorizedAlert } from "@/components/unauthorized-alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { API_URL } from "@/lib/config";
import { authenticatedFetch } from "@/lib/auth";
import { UserDetailed } from "@/lib/types";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

type UserFormData = {
  nombre: string;
  email: string;
  password: string;
  rol_id: number;
  telefono?: string;
};

export default function AjustesClubPage() {
  const { user } = useAuth();
  const { can } = usePermissions();

  const [users, setUsers] = useState<UserDetailed[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetailed | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    nombre: "",
    email: "",
    password: "",
    rol_id: 2,
    telefono: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [user?.club_id]);

  const loadUsers = async () => {
    if (!user?.club_id) return;

    try {
      setLoading(true);
      const response = await authenticatedFetch(
        `${API_URL}/users/club/${user.club_id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        let errorMessage = "Error al cargar usuarios";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al cargar la lista de usuarios";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!formData.nombre || !formData.email || !formData.password) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      setIsSubmitting(true);

      const requestBody = {
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        rol_id: formData.rol_id,
        club_id: user?.club_id,
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
          // Si no se puede parsear el JSON, usar mensaje genérico
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      toast.success("Usuario creado exitosamente");
      setIsCreateDialogOpen(false);
      resetForm();
      loadUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al crear usuario";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser || !formData.nombre || !formData.email) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
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

      const response = await authenticatedFetch(
        `${API_URL}/users/${selectedUser.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

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
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      resetForm();
      loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al actualizar usuario";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setIsSubmitting(true);

      // Bug del backend: DELETE requiere un body aunque no lo use
      const dummyBody = {
        nombre: "dummy",
        email: "dummy@email.com",
        password: "dummy",
        rol_id: 1,
        club_id: user?.club_id || 1,
      };

      const response = await authenticatedFetch(
        `${API_URL}/users/${selectedUser.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dummyBody),
        }
      );

      if (!response.ok && response.status !== 204) {
        let errorMessage = "Error al eliminar usuario";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      toast.success("Usuario eliminado exitosamente");
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar usuario";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      email: "",
      password: "",
      rol_id: 2,
      telefono: "",
    });
  };

  const openEditDialog = (user: UserDetailed) => {
    setSelectedUser(user);
    setFormData({
      nombre: user.nombre,
      email: user.email,
      password: "",
      rol_id: user.rol.id,
      telefono: user.telefono || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: UserDetailed) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const getRoleBadgeVariant = (roleName: string) => {
    return roleName === "admin" ? "default" : "secondary";
  };

  // Verificar permisos - solo admin puede acceder
  if (!can("canchas:delete")) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Ajustes del Club</h1>
        <UnauthorizedAlert
          permission="canchas:delete"
          action="acceder a los ajustes del club"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ajustes del Club</h1>
        <p className="text-muted-foreground mt-2">
          Administra la configuración y usuarios de tu club
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>
                Próximamente: Configuración general del club
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Esta sección estará disponible próximamente.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gestión de Usuarios</CardTitle>
                  <CardDescription>
                    Administra los usuarios del club y sus permisos
                  </CardDescription>
                </div>
                <Dialog
                  open={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Usuario
                    </Button>
                  </DialogTrigger>
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
                        <Input
                          id="create-password"
                          type="password"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          placeholder="••••••••"
                        />
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
                        onClick={() => setIsCreateDialogOpen(false)}
                        disabled={isSubmitting}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleCreateUser}
                        disabled={isSubmitting}
                      >
                        {isSubmitting && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Crear Usuario
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay usuarios registrados
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.nombre}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.telefono || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.rol.nombre)}>
                            {user.rol.nombre === "admin"
                              ? "Administrador"
                              : "Encargado"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.activo ? "default" : "secondary"}
                          >
                            {user.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(user)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(user)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Dejar vacío para no cambiar"
              />
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
                setIsEditDialogOpen(false);
                setSelectedUser(null);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleEditUser} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a{" "}
              <span className="font-semibold">{selectedUser?.nombre}</span>?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedUser(null);
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
