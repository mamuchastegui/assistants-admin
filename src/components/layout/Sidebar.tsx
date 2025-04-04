
import React, { useState } from "react";
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
  Menu as MenuIcon,
  ChevronRight
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

export default function Sidebar({ className, onClose }: SidebarProps) {
  const isMobile = useIsMobile();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  return (
    <div className={cn("pb-12 w-full", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            {!isCollapsed && <h2 className="px-2 text-lg font-semibold tracking-tight">Gonza Admin</h2>}
          </div>
          <div className="space-y-1">
            <NavButton
              to="/"
              onClose={onClose}
              icon={<Home className="h-4 w-4" />}
              collapsed={isCollapsed}
              label="Inicio"
            />
            <NavButton
              to="/calendar"
              onClose={onClose}
              icon={<Calendar className="h-4 w-4" />}
              collapsed={isCollapsed}
              label="Calendario"
            />
          </div>
          
          <SidebarGroup 
            icon={<Package className="h-4 w-4" />} 
            title="Administración"
            collapsed={isCollapsed}
          >
            <NavButton
              to="/orders"
              onClose={onClose}
              icon={<Package className="h-4 w-4" />}
              collapsed={isCollapsed}
              label="Pedidos"
              isChildItem={true}
            />
            <NavButton
              to="/menu"
              onClose={onClose}
              icon={<MenuIcon className="h-4 w-4" />}
              collapsed={isCollapsed}
              label="Menú y Categorías"
              isChildItem={true}
            />
          </SidebarGroup>
          
          <SidebarGroup 
            icon={<MessageSquare className="h-4 w-4" />} 
            title="Comunicación"
            collapsed={isCollapsed}
          >
            <NavButton
              to="/assistant"
              onClose={onClose}
              icon={<MessageSquare className="h-4 w-4" />}
              collapsed={isCollapsed}
              label="Asistentes"
              isChildItem={true}
            />
          </SidebarGroup>
        </div>

        <ScrollArea className="h-[150px] md:h-[200px]">
          <div className="space-y-1 px-3">
            {!isCollapsed && <h4 className="px-2 text-sm font-semibold tracking-tight">Integraciones</h4>}
            <SidebarGroup 
              icon={<Settings className="h-4 w-4" />} 
              title="Configuración"
              collapsed={isCollapsed}
            >
              <NavButton
                to="/integrations"
                onClose={onClose}
                icon={<Settings className="h-4 w-4" />}
                collapsed={isCollapsed}
                label="Configuración"
                isChildItem={true}
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "justify-start",
                  isCollapsed ? "w-8 h-8 p-0" : "w-full"
                )}
              >
                <Users className={cn("h-4 w-4", isCollapsed ? "" : "mr-2")} />
                {!isCollapsed && "Clientes API"}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "justify-start",
                  isCollapsed ? "w-8 h-8 p-0" : "w-full"
                )}
              >
                <LifeBuoy className={cn("h-4 w-4", isCollapsed ? "" : "mr-2")} />
                {!isCollapsed && "Soporte"}
              </Button>
            </SidebarGroup>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

interface NavButtonProps {
  to: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  label: string;
  onClose?: () => void;
  collapsed?: boolean;
  isChildItem?: boolean;
}

const NavButton = ({ 
  to, 
  icon, 
  label, 
  onClose, 
  collapsed = false,
  isChildItem = false 
}: NavButtonProps) => {
  const isMobile = useIsMobile();
  
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
        isChildItem && "pl-6",
        isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent text-foreground/80 hover:text-foreground",
        collapsed && "justify-center" 
      )}
    >
      <div className={cn(collapsed ? "" : "mr-2")}>{icon}</div>
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
};

interface SidebarGroupProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  collapsed?: boolean;
}

const SidebarGroup = ({ icon, title, children, collapsed = false }: SidebarGroupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (collapsed) {
    // En modo colapsado, solo mostrar el ícono con un tooltip
    return (
      <div className="my-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-8 h-8 p-0 justify-center"
          onClick={() => setIsOpen(!isOpen)} 
        >
          {icon}
        </Button>
      </div>
    );
  }
  
  // En modo expandido, mostrar el collapsible completo
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="my-2">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          {icon}
          <span className="ml-2">{title}</span>
          <ChevronRight className={cn(
            "h-4 w-4 ml-auto transition-transform", 
            isOpen && "transform rotate-90"
          )} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-1 pl-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};
