import { Link, useRouterState } from "@tanstack/react-router";
import { Home, BookOpen, Layers, Sparkles, UserCheck, Library, Settings } from "lucide-react";
import logoMark from "@/assets/logo-mark.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Planning & Drafting", url: "/planning", icon: BookOpen },
  { title: "Book Formatting", url: "/formatting", icon: Layers },
  { title: "Siren's Canvas", url: "/studio", icon: Sparkles },
  { title: "Expert Sanctuary", url: "/sanctuary", icon: UserCheck },
  { title: "My Library", url: "/library", icon: Library },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-2 py-3">
          <img src={logoMark} alt="Obsidian Siren" className="h-9 w-9 object-contain drop-shadow-[0_0_8px_oklch(0.58_0.22_295/0.6)]" />
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-serif text-base font-semibold text-foreground">Obsidian</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary">Siren Studio</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Studio</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={currentPath === item.url}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
