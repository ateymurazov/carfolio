
import React from "react";
import { NavLink } from "react-router-dom";
import { BarChart, Car, CarFront, ChevronLeft, ChevronRight, Home, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./SidebarContext";
import { Separator } from "@/components/ui/separator";

interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
}

const SidebarLink = ({ to, icon: Icon, label }: SidebarLinkProps) => {
  const { collapsed } = useSidebar();
  
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        )
      }
    >
      <Icon size={20} />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
};

export const Sidebar = () => {
  const { collapsed, toggleSidebar } = useSidebar();
  
  return (
    <div
      className={cn(
        "bg-sidebar border-r border-border flex flex-col h-screen sticky top-0 transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center px-4 py-2">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <CarFront className="h-6 w-6 text-sidebar-primary" />
            <span className="font-bold text-sidebar-foreground">CarFolio</span>
          </div>
        )}
        {collapsed && <CarFront className="h-6 w-6 mx-auto text-sidebar-primary" />}
      </div>
      
      <Separator className="bg-sidebar-border" />
      
      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        <SidebarLink to="/" icon={Home} label="Dashboard" />
        <SidebarLink to="/inventory" icon={Car} label="Car Inventory" />
        <SidebarLink to="/collections" icon={BarChart} label="Collections" />
      </div>
      
      {/* Bottom Actions */}
      <div className="p-2">
        <Separator className="my-2 bg-sidebar-border" />
        <SidebarLink to="/settings" icon={Settings} label="Settings" />
        <Button
          variant="ghost"
          size="icon"
          className="w-full flex justify-center mt-2 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          onClick={toggleSidebar}
        >
          {collapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </Button>
      </div>
    </div>
  );
};
