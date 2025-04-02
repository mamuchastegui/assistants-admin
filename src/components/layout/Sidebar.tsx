
import React from "react";
import { Link } from "react-router-dom";
import { 
  CalendarDays, 
  MessageSquare, 
  Users, 
  Settings, 
  PieChart,
  Zap,
  Bell,
  ShoppingBag,
  ChevronLeft,
  Utensils
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

const Sidebar = () => {
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const menuItems = [
    { name: "Dashboard", icon: PieChart, path: "/" },
    { name: "Calendario", icon: CalendarDays, path: "/calendar" },
    { name: "Clientes", icon: Users, path: "/customers" },
    { name: "Asistente", icon: MessageSquare, path: "/assistant" },
    { name: "Integraciones", icon: Zap, path: "/integrations" },
    { name: "Promociones", icon: ShoppingBag, path: "/promotions" },
    { name: "Pedidos", icon: Utensils, path: "/orders" },
    { name: "Notificaciones", icon: Bell, path: "/notifications" },
    { name: "Configuración", icon: Settings, path: "/settings" },
  ];

  return (
    <aside className={cn(
      "bg-white border-r border-gray-200 fixed inset-y-0 z-50 hidden md:flex md:flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b flex justify-between items-center">
        <div className={cn(
          "flex items-center space-x-2",
          isCollapsed && "justify-center"
        )}>
          <span className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            CM
          </span>
          {!isCollapsed && <span className="text-lg font-semibold">CONDAMIND Assistants</span>}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-1" 
          onClick={toggleSidebar}
        >
          <ChevronLeft className={cn(
            "h-5 w-5 transition-transform",
            isCollapsed && "rotate-180"
          )} />
        </Button>
      </div>
      <nav className="flex-1 pt-4 pb-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium group hover:bg-gray-100",
                  window.location.pathname === item.path
                    ? "bg-gray-100 text-primary"
                    : "text-gray-700",
                  isCollapsed ? "justify-center" : "space-x-3"
                )}
                title={isCollapsed ? item.name : ""}
              >
                <item.icon size={20} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className={cn(
          "flex items-center",
          isCollapsed ? "justify-center" : "space-x-3"
        )}>
          <div className="h-8 w-8 rounded-full bg-gray-200"></div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Usuario Demo
              </p>
              <p className="text-xs text-gray-500 truncate">
                demo@ejemplo.com
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
