import Link from "next/link";
import { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const metadata = {
  title: "Admin - Tukancha",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    // client-side redirect after logout
    if (typeof window !== "undefined") window.location.href = "/login";
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
