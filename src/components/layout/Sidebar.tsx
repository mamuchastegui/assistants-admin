
import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Package, 
  Users, 
  Calendar, 
  Settings, 
  LifeBuoy, 
  Home,
  MessageSquare
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  className?: string;
  onClose?: () => void;
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

interface MenuGroupProps {
  icon: React.ReactNode;
  title: string;
  children?: React.ReactNode;
  collapsed?: boolean;
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
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink 
              to={to} 
              onClick={handleClick}
              className={({isActive}) => cn(
                "flex items-center justify-center rounded-md h-9 w-9 mx-auto my-1.5 transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent text-foreground/80 hover:text-foreground"
              )}
            >
              <div className="flex items-center justify-center">
                {React.cloneElement(icon as React.ReactElement, { 
                  size: 18,
                  strokeWidth: 1.5
                })}
              </div>
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-popover text-popover-foreground">
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
        "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isChildItem && "pl-6",
        isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent text-foreground/80 hover:text-foreground"
      )}
    >
      <div className="mr-2 flex items-center justify-center">
        {React.cloneElement(icon as React.ReactElement, { 
          size: 18,
          strokeWidth: 1.5
        })}
      </div>
      <span>{label}</span>
    </NavLink>
  );
};

const MenuGroup = ({ icon, title, children, collapsed = false }: MenuGroupProps) => {
  if (collapsed) {
    return (
      <div className="py-2">
        <DropdownMenu>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-9 w-9 rounded-md mx-auto flex items-center justify-center"
                  >
                    {React.cloneElement(icon as React.ReactElement, { 
                      size: 18,
                      strokeWidth: 1.5
                    })}
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-popover text-popover-foreground">
                {title}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent 
            side="right" 
            align="start" 
            className="w-52 p-1"
          >
            {children}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
  
  return (
    <div className="my-1.5">
      <Accordion type="single" collapsible className="w-full border-none">
        <AccordionItem value="menu-group" className="border-none">
          <AccordionTrigger className="py-2 px-3 hover:bg-accent hover:no-underline rounded-md">
            <div className="flex items-center">
              {React.cloneElement(icon as React.ReactElement, { 
                size: 18,
                strokeWidth: 1.5,
                className: "mr-2"
              })}
              <span className="text-sm font-medium">{title}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-1 pb-0">
            <div className="pl-2">
              {children}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default function Sidebar({ className, onClose }: SidebarProps) {
  const isMobile = useIsMobile();
  const { state, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };
  
  return (
    <div className={cn("pb-3 w-full h-full flex flex-col", className)}>
      <div className="py-2 h-full flex flex-col">
        <div className="px-3 flex-none">
          <div className="flex items-center justify-center md:justify-between mb-4">
            {!isCollapsed && <h2 className="text-lg font-semibold tracking-tight">Admin</h2>}
          </div>
          
          <div className="space-y-3">
            <NavButton
              to="/"
              onClose={handleNavClick}
              icon={<Home />}
              collapsed={isCollapsed}
              label="Inicio"
            />
            <NavButton
              to="/calendar"
              onClose={handleNavClick}
              icon={<Calendar />}
              collapsed={isCollapsed}
              label="Calendario"
            />
          </div>
          
          <div className="mt-5 border-t border-border pt-3">
            <MenuGroup 
              icon={<Package />} 
              title="Administración"
              collapsed={isCollapsed}
            >
              {isCollapsed ? (
                <>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <NavLink to="/menu" onClick={handleNavClick} className="flex items-center w-full py-1.5">
                      <Package className="mr-2 h-4 w-4" />
                      <span>Menú</span>
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <NavLink to="/orders" onClick={handleNavClick} className="flex items-center w-full py-1.5">
                      <Package className="mr-2 h-4 w-4" />
                      <span>Pedidos</span>
                    </NavLink>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <NavButton
                    to="/menu"
                    onClose={handleNavClick}
                    icon={<Package className="h-4 w-4" />}
                    label="Menú"
                    isChildItem={true}
                  />
                  <NavButton
                    to="/orders"
                    onClose={handleNavClick}
                    icon={<Package className="h-4 w-4" />}
                    label="Pedidos"
                    isChildItem={true}
                  />
                </>
              )}
            </MenuGroup>
          </div>
          
          <div className="mt-2">
            <MenuGroup 
              icon={<MessageSquare />} 
              title="Comunicación"
              collapsed={isCollapsed}
            >
              {isCollapsed ? (
                <DropdownMenuItem asChild className="cursor-pointer">
                  <NavLink to="/assistant" onClick={handleNavClick} className="flex items-center w-full py-1.5">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Asistentes</span>
                  </NavLink>
                </DropdownMenuItem>
              ) : (
                <NavButton
                  to="/assistant"
                  onClose={handleNavClick}
                  icon={<MessageSquare className="h-4 w-4" />}
                  label="Asistentes"
                  isChildItem={true}
                />
              )}
            </MenuGroup>
          </div>
        </div>

        <ScrollArea className="flex-1 px-3 mt-3">
          <div className="space-y-2 border-t border-border pt-3">
            {!isCollapsed && <h4 className="text-sm font-semibold px-1">Integraciones</h4>}
            <MenuGroup 
              icon={<Settings />} 
              title="Configuración"
              collapsed={isCollapsed}
            >
              {isCollapsed ? (
                <>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <NavLink to="/integrations" onClick={handleNavClick} className="flex items-center w-full py-1.5">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configuración</span>
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <NavLink to="/clients" onClick={handleNavClick} className="flex items-center w-full py-1.5">
                      <Users className="mr-2 h-4 w-4" />
                      <span>Clientes API</span>
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <NavLink to="/support" onClick={handleNavClick} className="flex items-center w-full py-1.5">
                      <LifeBuoy className="mr-2 h-4 w-4" />
                      <span>Soporte</span>
                    </NavLink>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <NavButton
                    to="/integrations"
                    onClose={handleNavClick}
                    icon={<Settings className="h-4 w-4" />}
                    label="Configuración"
                    isChildItem={true}
                  />
                  <NavButton 
                    to="/clients"
                    onClose={handleNavClick}
                    icon={<Users className="h-4 w-4" />}
                    label="Clientes API"
                    isChildItem={true}
                  />
                  <NavButton 
                    to="/support"
                    onClose={handleNavClick}
                    icon={<LifeBuoy className="h-4 w-4" />}
                    label="Soporte"
                    isChildItem={true}
                  />
                </>
              )}
            </MenuGroup>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
