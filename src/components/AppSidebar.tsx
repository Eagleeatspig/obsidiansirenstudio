import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home, BookOpen, Layers, Sparkles, UserCheck, Library, Settings,
  HelpCircle, FolderOpen, PenLine, Quote, Feather, GraduationCap,
} from "lucide-react";
import logoMark from "@/assets/logo-mark.png";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter,
} from "@/components/ui/sidebar";
import { useMode } from "@/lib/mode";
import { Switch } from "@/components/ui/switch";

const fictionItems = [
  { title: "Planning & Drafting", url: "/planning", icon: BookOpen },
  { title: "Book Formatting", url: "/formatting", icon: Layers },
  { title: "Cover Studio", url: "/studio", icon: Sparkles },
  { title: "Expert Consultation", url: "/sanctuary", icon: UserCheck },
];
const academicItems = [
  { title: "Research Vault", url: "/research/vault", icon: FolderOpen },
  { title: "Scriptorium (Writing)", url: "/research/scriptorium", icon: PenLine },
  { title: "Citations", url: "/research/citations", icon: Quote },
  { title: "Expert Consultation", url: "/sanctuary", icon: UserCheck },
];
const utilityItems = [
  { title: "My Library", url: "/library", icon: Library },
  { title: "Ask Obsidian", url: "/help", icon: HelpCircle },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const [mode, setMode] = useMode();
  const items = mode === "fiction" ? fictionItems : academicItems;
  const dashUrl = mode === "fiction" ? "/weave" : "/scholar";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-2 py-3">
          <img src={logoMark} alt="Obsidian Siren" className="h-9 w-9 object-contain drop-shadow-[0_0_10px_oklch(0.58_0.22_295/0.7)]" />
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-serif text-base font-semibold text-foreground">Obsidian</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary">Siren Studio</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Mode</SidebarGroupLabel>
          <SidebarGroupContent className="px-2 pb-2 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center justify-between rounded-md border border-sidebar-border bg-sidebar-accent/30 px-2 py-2">
              <div className="flex items-center gap-2 text-xs">
                {mode === "fiction" ? <Feather className="h-3.5 w-3.5 text-primary" /> : <GraduationCap className="h-3.5 w-3.5 text-primary" />}
                <span className="text-silver">{mode === "fiction" ? "Weaver" : "Scholar"}</span>
              </div>
              <Switch checked={mode === "academic"} onCheckedChange={(c) => setMode(c ? "academic" : "fiction")} />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Studio</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={currentPath === "/" || currentPath === dashUrl}>
                  <Link to={dashUrl}>
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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

        <SidebarGroup>
          <SidebarGroupLabel>Utilities</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {utilityItems.map((item) => (
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
      <SidebarFooter className="border-t border-sidebar-border">
        <Link to="/" className="px-2 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary group-data-[collapsible=icon]:hidden">
          ← Portal
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
