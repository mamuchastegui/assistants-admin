
import React from "react";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { cn } from "@/lib/utils";

interface DashboardLayoutContentProps {
  children: React.ReactNode;
}

const DashboardLayoutContent: React.FC<DashboardLayoutContentProps> = ({ children }) => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row w-full">
      <aside className={cn(
        "fixed top-16 bottom-0 md:top-0 left-0 z-40 transition-all duration-300 overflow-hidden bg-white border-r shadow-sm",
        isCollapsed ? "w-10" : "w-64",
        "md:flex flex-shrink-0"
      )}>
        <Sidebar />
      </aside>
      <div className={cn(
        "flex flex-col flex-1 transition-all duration-300",
        isCollapsed ? "md:ml-10" : "md:ml-64"
      )}>
        <Header>
          <SidebarTrigger className="h-8 w-8" />
        </Header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
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
