import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { useNotifications } from "@/providers/NotificationsProvider";
import { useBusinessType } from "@/context/BusinessTypeContext";
import { getMenuItems, MenuItem } from "@/config/businessMenus";

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
  badge?: React.ReactNode;
}

const NavButton = ({
  to,
  icon,
  label,
  collapsed = false,
  isChildItem = false,
  badge
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
                "flex items-center justify-center rounded-md h-9 w-9 mx-auto my-2.5 transition-all duration-200",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground",
                "hover:scale-110 transition-transform relative"
              )}
            >
              <div className="flex items-center justify-center">
                {React.cloneElement(icon as React.ReactElement, {
                  size: 18,
                  strokeWidth: 1.5,
                  className: cn(
                    "transition-colors duration-200",
                    "group-hover:text-sidebar-foreground"
                  )
                })}
              </div>

              {badge && (
                <div className="absolute -top-1 -right-1">
                  {badge}
                </div>
              )}
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
          "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 relative",
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

            {badge && (
              <div className="ml-auto mr-2">
                {badge}
              </div>
            )}

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

// Badge component for notifications count
const NotificationBadge = () => {
  const { count, loading, error } = useNotifications();

  if (loading || error || count === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-white"
    >
      {count}
    </motion.div>
  );
};

export default function Sidebar({ className }: SidebarProps) {
  const isMobile = useIsMobile();
  const { state, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { businessType } = useBusinessType();

  const menuItems = getMenuItems(businessType);

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
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "space-y-1 py-2",
                isCollapsed && "space-y-4 pt-4"
              )}
            >
              {menuItems.map((item: MenuItem) => (
                <NavButton
                  key={item.id}
                  to={item.path}
                  icon={<item.icon />}
                  collapsed={isCollapsed}
                  label={item.label}
                  badge={item.showNotificationBadge ? <NotificationBadge /> : undefined}
                />
              ))}
            </motion.div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
