import { User } from "./auth";

// Define los roles disponibles
export type Role = "admin" | "encargado";

// Define las acciones/permisos disponibles
export type Permission =
    | "canchas:view"
    | "canchas:create"
    | "canchas:edit"
    | "canchas:delete"
    | "reservas:view"
    | "reservas:create"
    | "reservas:edit"
    | "reservas:delete"
    | "reportes:view"
    | "torneos:view"
    | "torneos:create"
    | "torneos:edit"
    | "torneos:delete"
    | "club:edit";

// Mapa de permisos por rol
const rolePermissions: Record<Role, Permission[]> = {
    admin: [
        // Admins tienen TODOS los permisos
        "canchas:view",
        "canchas:create",
        "canchas:edit",
        "canchas:delete",
        "reservas:view",
        "reservas:create",
        "reservas:edit",
        "reservas:delete",
        "reportes:view",
        "torneos:view",
        "torneos:create",
        "torneos:edit",
        "torneos:delete",
        "club:edit",
    ],
    encargado: [
        // Encargados pueden ver y editar, pero no crear ni eliminar canchas
        "canchas:view",
        "canchas:edit",
        "reservas:view",
        "reservas:create",
        "reservas:edit",
        "reservas:delete",
        "reportes:view",
        "torneos:view",
    ],
};

/**
 * Verifica si un usuario tiene un permiso específico
 */
export function hasPermission(user: User | null, permission: Permission): boolean {
    if (!user) return false;

    const permissions = rolePermissions[user.rol];
    return permissions ? permissions.includes(permission) : false;
}

/**
 * Verifica si un usuario tiene TODOS los permisos especificados
 */
export function hasAllPermissions(
    user: User | null,
    permissions: Permission[]
): boolean {
    if (!user) return false;
    return permissions.every((permission) => hasPermission(user, permission));
}

/**
 * Verifica si un usuario tiene AL MENOS UNO de los permisos especificados
 */
export function hasAnyPermission(
    user: User | null,
    permissions: Permission[]
): boolean {
    if (!user) return false;
    return permissions.some((permission) => hasPermission(user, permission));
}

/**
 * Obtiene un mensaje descriptivo del permiso
 */
export function getPermissionMessage(permission: Permission): string {
    const messages: Record<Permission, string> = {
        "canchas:view": "ver canchas",
        "canchas:create": "crear canchas",
        "canchas:edit": "editar canchas",
        "canchas:delete": "eliminar canchas",
        "reservas:view": "ver reservas",
        "reservas:create": "crear reservas",
        "reservas:edit": "editar reservas",
        "reservas:delete": "eliminar reservas",
        "reportes:view": "ver reportes",
        "torneos:view": "ver torneos",
        "torneos:create": "crear torneos",
        "torneos:edit": "editar torneos",
        "torneos:delete": "eliminar torneos",
        "club:edit": "editar configuración del club",
    };

    return messages[permission] || permission;
}

/**
 * Obtiene el nombre descriptivo del rol
 */
export function getRoleName(role: Role): string {
    const roleNames: Record<Role, string> = {
        admin: "Administrador",
        encargado: "Encargado",
    };

    return roleNames[role] || role;
}
