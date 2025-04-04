
import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Package, 
  Users, 
  Calendar, 
  Settings, 
  LifeBuoy, 
  Home,
  MessageSquare,
  Menu as MenuIcon
} from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

export default function Sidebar({ className, onClose }: SidebarProps) {
  const { isMobile } = useMobile();

  return (
    <div className={cn("pb-12 w-full", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-xl font-semibold tracking-tight">
            Gonza Admin
          </h2>
          <div className="space-y-1">
            <NavButton
              to="/"
              onClose={onClose}
              icon={<Home className="mr-2 h-4 w-4" />}
            >
              Inicio
            </NavButton>
            <NavButton
              to="/calendar"
              onClose={onClose}
              icon={<Calendar className="mr-2 h-4 w-4" />}
            >
              Calendario
            </NavButton>
            <NavButton
              to="/orders"
              onClose={onClose}
              icon={<Package className="mr-2 h-4 w-4" />}
            >
              Pedidos
            </NavButton>
            <NavButton
              to="/menu"
              onClose={onClose}
              icon={<MenuIcon className="mr-2 h-4 w-4" />}
            >
              Menú y Categorías
            </NavButton>
            <NavButton
              to="/assistant"
              onClose={onClose}
              icon={<MessageSquare className="mr-2 h-4 w-4" />}
            >
              Asistentes
            </NavButton>
          </div>
        </div>

        <ScrollArea className="h-[300px]">
          <div className="space-y-1 px-4">
            <h4 className="px-2 text-sm font-semibold tracking-tight">
              Integraciones
            </h4>
            <NavButton
              to="/integrations"
              onClose={onClose}
              icon={<Settings className="mr-2 h-4 w-4" />}
            >
              Configuración
            </NavButton>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Clientes API
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <LifeBuoy className="mr-2 h-4 w-4" />
              Soporte
            </Button>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

interface NavButtonProps {
  to: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClose?: () => void;
}

const NavButton = ({ to, children, icon, onClose }: NavButtonProps) => {
  const { isMobile } = useMobile();
  
  const handleClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };
  
  return (
    <NavLink 
      to={to} 
      onClick={handleClick}
      className={({isActive}) => cn(
        "flex items-center rounded-md px-2 py-1.5 text-sm font-medium",
        isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent text-foreground/80 hover:text-foreground"
      )}
    >
      {icon}
      {children}
    </NavLink>
  );
};
