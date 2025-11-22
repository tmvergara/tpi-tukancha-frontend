"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  IconBallFootball,
  IconCalendar,
  IconChartBar,
  IconDatabase,
  IconFileWord,
  IconTrophy,
  IconReport,
  IconSettings,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";

const data = {
  navMain: [
    {
      title: "Canchas",
      url: "#",
      icon: IconBallFootball,
      items: [
        {
          title: "Ver canchas",
          url: "/admin/canchas",
        },
        {
          title: "Crear cancha",
          url: "/admin/canchas/crear",
        },
      ],
    },
    {
      title: "Reservas",
      url: "#",
      icon: IconCalendar,
      items: [
        {
          title: "Ver reservas",
          url: "/admin/reservas",
        },
        {
          title: "Crear reserva manual",
          url: "/admin/reservas/reserva-manual",
        },
      ],
    },
    {
      title: "Reportes",
      url: "#",
      icon: IconChartBar,
      items: [
        {
          title: "Reservas por cliente",
          url: "/admin/reportes/reservas-por-cliente",
        },
        {
          title: "Reservas por cancha",
          url: "/admin/reportes/reservas-por-cancha",
        },
        {
          title: "Cancha mas utilizada",
          url: "/admin/reportes/cancha-mas-utilizada",
        },
        {
          title: "Utilizacion de canchas",
          url: "/admin/reportes/utilizacion-de-canchas",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Gestion de Torneos",
      url: "/admin/torneos",
      icon: IconTrophy,
    },
    {
      title: "Ajustes del Club",
      url: "/admin/ajustes-club",
      icon: IconSettings,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const { can } = usePermissions();
  const pathname = usePathname();

  const userData = user
    ? {
        name: user.nombre,
        email: user.email,
        avatar: "/avatars/default.jpg",
        rol: user.rol,
      }
    : {
        name: "Usuario",
        email: "email@ejemplo.com",
        avatar: "/avatars/default.jpg",
      };

  // Determinar qué sección está activa basándose en la URL actual
  const isPathActive = (items: { url: string }[]) => {
    return items.some((item) => pathname?.startsWith(item.url));
  };

  // Filtrar elementos de navegación según permisos y agregar isActive dinámicamente
  const filteredNavMain = data.navMain
    .filter((item) => {
      if (item.title === "Canchas") {
        return can("canchas:view");
      }
      if (item.title === "Reservas") {
        return can("reservas:view");
      }
      if (item.title === "Torneos") {
        return can("torneos:view");
      }
      if (item.title === "Reportes") {
        return can("reportes:view");
      }
      return true;
    })
    .map((item) => ({
      ...item,
      isActive: isPathActive(item.items),
    }));

  // Filtrar elementos secundarios según permisos
  const filteredNavSecondary = data.navSecondary.filter((item) => {
    if (item.title === "Ajustes del Club") {
      return can("club:edit");
    }
    if (item.title === "Gestion de Torneos") {
      return can("torneos:view");
    }
    return true;
  });

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-0! h-14"
            >
              <a href="#">
                <img src="/Logo1.png" alt="Logo" className="h-12 ml-0" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        <NavSecondary items={filteredNavSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
