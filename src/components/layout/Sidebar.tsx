
import React, { useState } from "react";
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
  MessageSquare,
  ChevronRight
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
                "flex items-center justify-center rounded-md h-10 w-10 mx-auto my-2 transition-colors",
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
      <div className="mr-2 flex items-center">
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
      <div className="py-3">
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
    <div className="my-2">
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
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  return (
    <div className={cn("pb-6 w-full", className)}>
      <div className="space-y-2 py-3">
        <div className="px-3">
          <div className="flex items-center justify-between mb-4">
            {!isCollapsed && <h2 className="text-lg font-semibold tracking-tight">Gonza Admin</h2>}
          </div>
          
          <div className="space-y-4">
            <NavButton
              to="/"
              onClose={onClose}
              icon={<Home />}
              collapsed={isCollapsed}
              label="Inicio"
            />
            <NavButton
              to="/calendar"
              onClose={onClose}
              icon={<Calendar />}
              collapsed={isCollapsed}
              label="Calendario"
            />
          </div>
          
          <div className="mt-6 border-t border-border pt-4">
            <MenuGroup 
              icon={<Package />} 
              title="Administración"
              collapsed={isCollapsed}
            >
              {isCollapsed ? (
                <>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <NavLink to="/menu" className="flex items-center w-full py-1.5">
                      <Package className="mr-2 h-4 w-4" />
                      <span>Menú Restaurant</span>
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <NavLink to="/orders" className="flex items-center w-full py-1.5">
                      <Package className="mr-2 h-4 w-4" />
                      <span>Pedidos</span>
                    </NavLink>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <NavButton
                    to="/menu"
                    onClose={onClose}
                    icon={<Package className="h-4 w-4" />}
                    label="Menú Restaurant"
                    isChildItem={true}
                  />
                  <NavButton
                    to="/orders"
                    onClose={onClose}
                    icon={<Package className="h-4 w-4" />}
                    label="Pedidos"
                    isChildItem={true}
                  />
                </>
              )}
            </MenuGroup>
          </div>
          
          <div className="mt-3">
            <MenuGroup 
              icon={<MessageSquare />} 
              title="Comunicación"
              collapsed={isCollapsed}
            >
              {isCollapsed ? (
                <DropdownMenuItem asChild className="cursor-pointer">
                  <NavLink to="/assistant" className="flex items-center w-full py-1.5">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Asistentes</span>
                  </NavLink>
                </DropdownMenuItem>
              ) : (
                <NavButton
                  to="/assistant"
                  onClose={onClose}
                  icon={<MessageSquare className="h-4 w-4" />}
                  label="Asistentes"
                  isChildItem={true}
                />
              )}
            </MenuGroup>
          </div>
        </div>

        <ScrollArea className="flex-1 px-3 mt-4">
          <div className="space-y-3 border-t border-border pt-4">
            {!isCollapsed && <h4 className="text-sm font-semibold px-1">Integraciones</h4>}
            <MenuGroup 
              icon={<Settings />} 
              title="Configuración"
              collapsed={isCollapsed}
            >
              {isCollapsed ? (
                <>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <NavLink to="/integrations" className="flex items-center w-full py-1.5">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configuración</span>
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <NavLink to="/clients" className="flex items-center w-full py-1.5">
                      <Users className="mr-2 h-4 w-4" />
                      <span>Clientes API</span>
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <NavLink to="/support" className="flex items-center w-full py-1.5">
                      <LifeBuoy className="mr-2 h-4 w-4" />
                      <span>Soporte</span>
                    </NavLink>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <NavButton
                    to="/integrations"
                    onClose={onClose}
                    icon={<Settings className="h-4 w-4" />}
                    label="Configuración"
                    isChildItem={true}
                  />
                  <NavButton 
                    to="/clients"
                    onClose={onClose}
                    icon={<Users className="h-4 w-4" />}
                    label="Clientes API"
                    isChildItem={true}
                  />
                  <NavButton 
                    to="/support"
                    onClose={onClose}
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
