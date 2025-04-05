
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
          <div className="space-y-3">
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
          
          <div className="mt-6">
            <SidebarGroup 
              icon={<Package className="h-4 w-4" />} 
              title="Administración"
              collapsed={isCollapsed}
            />
          </div>
          
          <div className="mt-6">
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
        </div>

        <ScrollArea className="h-[150px] md:h-[200px]">
          <div className="space-y-1 px-3">
            {!isCollapsed && <h4 className="px-2 text-sm font-semibold tracking-tight">Integraciones</h4>}
            <div className="mt-3">
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
                <NavButton 
                  to="/clients"
                  onClose={onClose}
                  icon={<Users className="h-4 w-4" />}
                  collapsed={isCollapsed}
                  label="Clientes API"
                  isChildItem={true}
                />
                <NavButton 
                  to="/support"
                  onClose={onClose}
                  icon={<LifeBuoy className="h-4 w-4" />}
                  collapsed={isCollapsed}
                  label="Soporte"
                  isChildItem={true}
                />
              </SidebarGroup>
            </div>
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
  
  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink 
              to={to} 
              onClick={handleClick}
              className={({isActive}) => cn(
                "flex items-center justify-center rounded-md w-8 h-8 mx-auto",
                isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent text-foreground/80 hover:text-foreground"
              )}
            >
              {icon}
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return (
    <NavLink 
      to={to} 
      onClick={handleClick}
      className={({isActive}) => cn(
        "flex items-center rounded-md px-2 py-1.5 text-sm font-medium",
        isChildItem && "pl-6",
        isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent text-foreground/80 hover:text-foreground"
      )}
    >
      <div className="mr-2">{icon}</div>
      <span>{label}</span>
    </NavLink>
  );
};

interface SidebarGroupProps {
  icon: React.ReactNode;
  title: string;
  children?: React.ReactNode;
  collapsed?: boolean;
}

const SidebarGroup = ({ icon, title, children, collapsed = false }: SidebarGroupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (collapsed) {
    return (
      <div className="my-5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-8 h-8 p-0 flex justify-center mx-auto"
                onClick={() => setIsOpen(!isOpen)} 
              >
                {icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {title}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {isOpen && (
          <div className="absolute left-10 mt-0 bg-card rounded-md shadow-lg border p-2 min-w-[180px] z-50">
            {children}
          </div>
        )}
      </div>
    );
  }
  
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
