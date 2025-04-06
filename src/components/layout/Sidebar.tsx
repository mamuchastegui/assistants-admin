
import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Users, 
  Calendar, 
  Settings, 
  LifeBuoy, 
  Home,
  MessageSquare,
  X,
  ChevronRight
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

interface SidebarProps {
  className?: string;
}

interface NavButtonProps {
  to: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  label: string;
  collapsed?: boolean;
  isChildItem?: boolean;
}

const NavButton = ({ 
  to, 
  icon, 
  label, 
  collapsed = false,
  isChildItem = false 
}: NavButtonProps) => {
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  
  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false);
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
                "flex items-center justify-center rounded-md h-9 w-9 mx-auto my-1.5 transition-all duration-200",
                isActive ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-accent text-foreground/80 hover:text-foreground"
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
    <motion.div
      whileHover={{ x: 2 }}
      transition={{ type: "spring", stiffness: 500 }}
    >
      <NavLink 
        to={to} 
        onClick={handleClick}
        className={({isActive}) => cn(
          "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
          isChildItem && "pl-6",
          isActive ? 
            "bg-primary text-primary-foreground shadow-sm" : 
            "hover:bg-accent text-foreground/80 hover:text-foreground"
        )}
      >
        {({isActive}) => (
          <>
            <div className="mr-2 flex items-center justify-center">
              {React.cloneElement(icon as React.ReactElement, { 
                size: 18,
                strokeWidth: 1.5
              })}
            </div>
            <span>{label}</span>
            {isActive && (
              <motion.div 
                layoutId="active-indicator"
                className="ml-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight size={14} />
              </motion.div>
            )}
          </>
        )}
      </NavLink>
    </motion.div>
  );
};

export default function Sidebar({ className }: SidebarProps) {
  const isMobile = useIsMobile();
  const { state, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [currentTab, setCurrentTab] = React.useState("main");
  
  // Navigation categories
  const navCategories = [
    { id: "main", label: "Principal" },
    { id: "admin", label: "Admin" },
    { id: "comms", label: "Comms" }
  ];
  
  return (
    <div className={cn("pb-3 w-full h-full flex flex-col bg-card", className)}>
      {isMobile && (
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h2 className="text-lg font-semibold tracking-tight">Menu</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setOpenMobile(false)}
            className="h-8 w-8"
          >
            <X size={18} />
          </Button>
        </div>
      )}
      
      <div className="py-2 h-full flex flex-col">
        {!isCollapsed && (
          <div className="px-3 mb-3">
            <Tabs 
              value={currentTab} 
              onValueChange={setCurrentTab} 
              className="w-full"
            >
              <TabsList className="w-full grid grid-cols-3">
                {navCategories.map((cat) => (
                  <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}
        
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1">
            {(currentTab === "main" || isCollapsed) && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-1 py-2"
              >
                <NavButton
                  to="/"
                  icon={<Home />}
                  collapsed={isCollapsed}
                  label="Inicio"
                />
                <NavButton
                  to="/calendar"
                  icon={<Calendar />}
                  collapsed={isCollapsed}
                  label="Calendario"
                />
              </motion.div>
            )}
            
            {(currentTab === "admin" || isCollapsed) && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-1 py-2"
              >
                <NavButton
                  to="/menu"
                  icon={<Package />}
                  collapsed={isCollapsed}
                  label="Menú"
                />
                <NavButton
                  to="/orders"
                  icon={<Package />}
                  collapsed={isCollapsed}
                  label="Pedidos"
                />
              </motion.div>
            )}
            
            {(currentTab === "comms" || isCollapsed) && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-1 py-2"
              >
                <NavButton
                  to="/assistant"
                  icon={<MessageSquare />}
                  collapsed={isCollapsed}
                  label="Asistentes"
                />
              </motion.div>
            )}
          </div>
          
          {!isCollapsed && (
            <div className="mt-6 border-t border-border pt-3">
              <h4 className="text-xs font-semibold text-muted-foreground px-3 mb-2">Configuración</h4>
              <div className="space-y-1">
                <NavButton
                  to="/integrations"
                  icon={<Settings />}
                  label="Configuración"
                />
                <NavButton
                  to="/clients"
                  icon={<Users />}
                  label="Clientes API"
                />
                <NavButton
                  to="/support"
                  icon={<LifeBuoy />}
                  label="Soporte"
                />
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
