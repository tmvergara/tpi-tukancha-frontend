"use client";

import { AlertCircle, ShieldAlert } from "lucide-react";
import {
  getPermissionMessage,
  getRoleName,
  type Permission,
} from "@/lib/permissions";
import { useAuth } from "@/hooks/use-auth";

interface UnauthorizedAlertProps {
  permission: Permission;
  action?: string;
  className?: string;
}

export function UnauthorizedAlert({
  permission,
  action,
  className = "",
}: UnauthorizedAlertProps) {
  const { user } = useAuth();

  const permissionText = action || getPermissionMessage(permission);
  const roleName = user ? getRoleName(user.rol) : "tu rol actual";

  return (
    <div
      className={`rounded-lg border border-destructive/50 bg-destructive/10 p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-destructive">
            Permiso insuficiente
          </p>
          <p className="text-sm text-destructive/90">
            No tienes permiso para {permissionText}. Tu rol ({roleName}) no
            incluye este permiso.
          </p>
        </div>
      </div>
    </div>
  );
}

interface InlineUnauthorizedProps {
  permission: Permission;
  action?: string;
}

export function InlineUnauthorized({
  permission,
  action,
}: InlineUnauthorizedProps) {
  const permissionText = action || getPermissionMessage(permission);

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <AlertCircle className="h-4 w-4" />
      <span>No tienes permiso para {permissionText}</span>
    </div>
  );
}
