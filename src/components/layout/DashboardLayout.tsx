
import React from "react";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardLayoutContentProps {
  children: React.ReactNode;
}

const DashboardLayoutContent: React.FC<DashboardLayoutContentProps> = ({ children }) => {
  const { state, openMobile, setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  const isCollapsed = state === "collapsed";

  // Handle clicks outside the sidebar to close it on mobile
  const handleContentClick = () => {
    if (isMobile && openMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row w-full">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isMobile && openMobile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpenMobile(false)}
            className="fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <AnimatePresence>
        {(openMobile || !isMobile) && (
          <motion.aside 
            initial={isMobile ? { x: -300 } : { opacity: 0 }}
            animate={isMobile ? { x: 0 } : { opacity: 1 }}
            exit={isMobile ? { x: -300 } : { opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={cn(
              "fixed md:static top-16 bottom-0 md:top-0 left-0 z-50 overflow-hidden bg-card border-r shadow-sm",
              isCollapsed ? "w-[3.5rem]" : "w-64",
              "md:flex flex-shrink-0",
              isMobile && !openMobile && "hidden",
              isMobile && openMobile && "w-[250px] overflow-y-auto"
            )}
          >
            <Sidebar />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.div 
        layout
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className={cn(
          "flex flex-col flex-1 transition-all duration-300 ease-in-out",
          "md:ml-0", // Removed fixed margin class
          isMobile && "ml-0"
        )}
        onClick={handleContentClick}
      >
        <Header>
          <SidebarTrigger className="h-8 w-8" />
        </Header>
        <main className="flex-1 p-2 sm:p-3 md:p-6 overflow-auto">
          {children}
        </main>
      </motion.div>
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
