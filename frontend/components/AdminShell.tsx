"use client";

import { logoutAction } from "@/app/admin/actions";
import ThemeToggle from "@/components/ThemeToggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Boxes,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigation = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Boxes },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const pageTitles: Record<string, string> = {
  "/admin": "Overview",
  "/admin/orders": "Orders",
  "/admin/products": "Products",
  "/admin/categories": "Categories",
  "/admin/settings": "Settings",
};

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Admin";

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader className="border-b border-sidebar-border p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  tooltip="Vista Care admin"
                  render={<Link href="/admin" aria-label="Vista Care admin overview" />}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-card">
                    <Image src="/vista-care-logo.svg" width={32} height={32} alt="" className="h-7 w-auto" />
                  </span>
                  <span className="grid min-w-0 flex-1 text-left leading-tight">
                    <span className="truncate font-semibold">Vista Care</span>
                    <span className="truncate text-xs text-muted-foreground">Administration</span>
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.map((item) => {
                    const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          isActive={active}
                          tooltip={item.label}
                          render={<Link href={item.href} />}
                        >
                          <Icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <form action={logoutAction}>
                  <SidebarMenuButton type="submit" tooltip="Logout">
                    <LogOut />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </form>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <SidebarTrigger className="size-10" />
              <div className="h-5 w-px bg-border" aria-hidden="true" />
              <h1 className="truncate font-heading text-xl font-semibold">{title}</h1>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" className="h-10 gap-2 px-2" aria-label="Open admin profile menu" />
                  }
                >
                  <Avatar>
                    <AvatarFallback className="bg-primary-soft font-semibold text-primary">A</AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium sm:inline">Admin</span>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-44">
                  <DropdownMenuLabel>Administrator</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<button type="submit" form="admin-profile-logout" />}>
                    <LogOut /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <form id="admin-profile-logout" action={logoutAction} />
            </div>
          </header>
          <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
