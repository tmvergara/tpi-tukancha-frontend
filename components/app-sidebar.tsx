"use client";

import * as React from "react";
import {
  IconBallFootball,
  IconCalendar,
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconMoneybag,
  IconMoneybagPlus,
  IconPodium,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
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
import { Calendar, Icon, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const data = {
  navMain: [
    {
      title: "Canchas",
      url: "#",
      icon: IconBallFootball,
      isActive: true,
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
          url: "/admin/reservas/crear-manual",
        },
      ],
    },
    {
      title: "Torneos",
      url: "#",
      icon: IconPodium,
      items: [
        {
          title: "Ver torneos",
          url: "/admin/torneos",
        },
        {
          title: "Crear torneo",
          url: "/admin/torneos/crear",
        },
        {
          title: "Actualizar posiciones",
          url: "/admin/torneos/actualizar-posiciones",
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
      title: "Ajustes del Club",
      url: "/admin/ajustes-club",
      icon: IconSettings,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
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

  const userData = user
    ? {
        name: user.nombre,
        email: user.email,
        avatar: "/avatars/default.jpg",
      }
    : {
        name: "Usuario",
        email: "email@ejemplo.com",
        avatar: "/avatars/default.jpg",
      };

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
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
