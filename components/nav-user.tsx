"use client";

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { logout } from "@/lib/auth";
import { getRoleName } from "@/lib/permissions";
import { useRouter } from "next/navigation";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
    rol?: "admin" | "encargado" | "org_torneos";
  };
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  async function handleLogout() {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Aun con error, redirigir al login
      router.push("/login");
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`https://avatar.iran.liara.run/username?username=${user.email}&color=red`}
                  alt={user.email}
                  className="h-8"
                />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarImage
                    src={`https://avatar.iran.liara.run/username?username=${user.email}`}
                    alt={user.email}
                    className="h-8"
                  />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>

              {user.rol && (
                <DropdownMenuItem className="text-xs">
                  Tu rol es:
                  <span className="truncate text-primary font-bold">
                    {getRoleName(user.rol)}
                  </span>
                </DropdownMenuItem>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconUserCircle />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconCreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconNotification />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup> 
            <DropdownMenuSeparator /> */}
            <DropdownMenuItem onClick={handleLogout}>
              <IconLogout />
              Cerrar Sesion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
