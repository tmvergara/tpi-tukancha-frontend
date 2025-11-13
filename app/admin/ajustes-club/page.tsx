"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { UnauthorizedAlert } from "@/components/unauthorized-alert";
import { UserCreateDialog } from "@/app/admin/ajustes-club/components/user-create-dialog";
import { UserEditDialog } from "@/app/admin/ajustes-club/components/user-edit-dialog";
import { UserDeleteDialog } from "@/app/admin/ajustes-club/components/user-delete-dialog";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { API_URL } from "@/lib/config";
import { authenticatedFetch } from "@/lib/auth";
import { UserDetailed } from "@/lib/types";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function AjustesClubPage() {
  const { user } = useAuth();
  const { can } = usePermissions();

  const [users, setUsers] = useState<UserDetailed[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetailed | null>(null);

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
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al cargar la lista de usuarios";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (user: UserDetailed) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: UserDetailed) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const getRoleBadgeVariant = (roleName: string) => {
    return roleName === "admin" ? "secondary" : "outline";
  };

  // Contar administradores activos
  const adminCount = users.filter((u) => u.rol.nombre === "admin").length;

  // Verificar si un usuario es el único admin y no se puede eliminar
  const isLastAdmin = (userToCheck: UserDetailed) => {
    return userToCheck.rol.nombre === "admin" && adminCount === 1;
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
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Usuario
                </Button>
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
                            variant="outline"
                            className={
                              user.activo
                                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                                : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
                            }
                          >
                            {user.activo ? "Activa" : "Inactiva"}
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
                            {isLastAdmin(user) ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      disabled
                                    >
                                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  </span>
                                </PopoverTrigger>
                                <PopoverContent className="w-80" side="left">
                                  <div className="space-y-2">
                                    <h4 className="font-medium leading-none">
                                      No se puede eliminar
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      Este es el único administrador del club.
                                      Debe existir al menos un administrador
                                      activo en todo momento.
                                    </p>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog(user)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
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

      {/* Dialogs */}
      <UserCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        clubId={user?.club_id}
        onSuccess={loadUsers}
      />

      <UserEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={selectedUser}
        onSuccess={loadUsers}
      />

      <UserDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        user={selectedUser}
        clubId={user?.club_id}
        onSuccess={loadUsers}
        totalAdmins={adminCount}
      />
    </div>
  );
}
