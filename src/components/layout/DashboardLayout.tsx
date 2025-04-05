
import React from "react";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutContentProps {
  children: React.ReactNode;
}

const DashboardLayoutContent: React.FC<DashboardLayoutContentProps> = ({ children }) => {
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const isCollapsed = state === "collapsed";

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row w-full">
      <aside className={cn(
        "fixed top-16 bottom-0 md:top-0 left-0 z-40 transition-all duration-300 ease-in-out overflow-hidden bg-card border-r shadow-sm",
        isCollapsed ? "w-[3.5rem]" : "w-64",
        "md:flex flex-shrink-0",
        isMobile && isCollapsed && "w-0 border-0"
      )}>
        <Sidebar />
      </aside>
      <div className={cn(
        "flex flex-col flex-1 transition-all duration-300 ease-in-out",
        isCollapsed ? "md:ml-14" : "md:ml-64",
        isMobile && isCollapsed && "ml-0"
      )}>
        <Header>
          <SidebarTrigger className="h-8 w-8" />
        </Header>
        <main className="flex-1 p-3 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
};

export default DashboardLayout;
