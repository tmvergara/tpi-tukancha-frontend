"use client";

import { useAuth } from "./use-auth";
import { hasPermission, hasAllPermissions, hasAnyPermission, type Permission } from "@/lib/permissions";

export function usePermissions() {
    const { user } = useAuth();

    return {
        /**
         * Verifica si el usuario tiene un permiso específico
         */
        can: (permission: Permission): boolean => {
            return hasPermission(user, permission);
        },

        /**
         * Verifica si el usuario tiene TODOS los permisos
         */
        canAll: (permissions: Permission[]): boolean => {
            return hasAllPermissions(user, permissions);
        },

        /**
         * Verifica si el usuario tiene AL MENOS UNO de los permisos
         */
        canAny: (permissions: Permission[]): boolean => {
            return hasAnyPermission(user, permissions);
        },

        /**
         * Verifica si el usuario NO tiene un permiso
         */
        cannot: (permission: Permission): boolean => {
            return !hasPermission(user, permission);
        },
    };
}
