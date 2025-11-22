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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { API_URL } from "@/lib/config";
import { authenticatedFetch } from "@/lib/auth";
import { UserDetailed } from "@/lib/types";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Building2,
  MapPin,
  Phone,
  Clock,
  FileText,
  Trophy,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Función para formatear CUIT: XX-XXXXXXXX-X
const formatCUIT = (cuit: string): string => {
  const cleaned = cuit.replace(/\D/g, "");
  if (cleaned.length !== 11) return cuit;
  return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 10)}-${cleaned.slice(10)}`;
};

// Función para formatear teléfono: +54 (XXX) XXX-XXXX
const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");

  // Asumiendo que el número viene con código de país (ej: 549xxxxxxxxx)
  if (cleaned.startsWith("54") && cleaned.length >= 12) {
    const countryCode = "54";
    const areaCode = cleaned.slice(2, 5);
    const firstPart = cleaned.slice(5, 8);
    const secondPart = cleaned.slice(8, 12);
    return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
  }

  // Si el número tiene 10 dígitos sin código de país
  if (cleaned.length === 10) {
    const areaCode = cleaned.slice(0, 3);
    const firstPart = cleaned.slice(3, 6);
    const secondPart = cleaned.slice(6, 10);
    return `+54 (${areaCode}) ${firstPart}-${secondPart}`;
  }

  return phone;
};

interface ClubData {
  id: number;
  nombre: string;
  cuit: string;
  telefono: string;
  direccion: {
    calle: string;
    numero: string;
    ciudad: string;
    provincia: string;
    pais: string;
  };
  horarios: {
    id: number;
    dia: string;
    abre: string;
    cierra: string;
    activo: boolean;
  }[];
  torneos: number[];
}

export default function AjustesClubPage() {
  const { user } = useAuth();
  const { can } = usePermissions();

  const [clubData, setClubData] = useState<ClubData | null>(null);
  const [loadingClub, setLoadingClub] = useState(true);
  const [users, setUsers] = useState<UserDetailed[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetailed | null>(null);

  const loadClubData = async () => {
    if (!user?.club_id) return;

    try {
      setLoadingClub(true);
      const response = await authenticatedFetch(
        `${API_URL}/clubes/${user.club_id}`
      );

      if (!response.ok) {
        throw new Error("Error al cargar datos del club");
      }

      const data = await response.json();
      setClubData(data);
    } catch (error) {
      console.error("Error loading club data:", error);
      toast.error("Error al cargar la información del club");
    } finally {
      setLoadingClub(false);
    }
  };

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

  useEffect(() => {
    if (user?.club_id) {
      loadClubData();
      loadUsers();
    }
  }, [user?.club_id]);

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

  const getRoleLabel = (roleName: string) => {
    const labels: Record<string, string> = {
      admin: "Administrador",
      encargado: "Encargado",
      org_torneos: "Org. de Torneos",
    };
    return labels[roleName] || roleName;
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
          {loadingClub ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-64 md:col-span-2" />
            </div>
          ) : clubData ? (
            <div className="grid gap-6">
              {/* Información Básica */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Información del Club
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Nombre
                      </p>
                      <p className="text-lg font-semibold">{clubData.nombre}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        CUIT
                      </p>
                      <p className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {formatCUIT(clubData.cuit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Teléfono
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {formatPhone(clubData.telefono)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Torneos Activos
                      </p>
                      <p className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                        {clubData.torneos.length} torneo
                        {clubData.torneos.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Dirección
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Calle y Número
                      </p>
                      <p className="text-base">
                        {clubData.direccion.calle} {clubData.direccion.numero}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Ciudad
                      </p>
                      <p className="text-base">{clubData.direccion.ciudad}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Provincia
                      </p>
                      <p className="text-base">
                        {clubData.direccion.provincia}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        País
                      </p>
                      <p className="text-base">{clubData.direccion.pais}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Horarios */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Horarios de Atención
                  </CardTitle>
                  <CardDescription>
                    Horarios configurados para el funcionamiento del club
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {clubData.horarios.map((horario) => (
                      <div
                        key={horario.id}
                        className={`rounded-lg border p-4 ${
                          horario.activo
                            ? "border-border bg-card"
                            : "border-muted bg-muted/50"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold">{horario.dia}</p>
                          {horario.activo ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        {horario.activo ? (
                          <div className="text-sm text-muted-foreground">
                            <p>
                              {horario.abre} - {horario.cierra}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Cerrado
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No se pudo cargar la información del club
              </CardContent>
            </Card>
          )}
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
                        <TableCell>
                          {user.telefono ? formatPhone(user.telefono) : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.rol.nombre)}>
                            {getRoleLabel(user.rol.nombre)}
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
